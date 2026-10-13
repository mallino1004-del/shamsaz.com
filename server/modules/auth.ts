import express from "express";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import { db, transaction, hashPassword, verifyPassword } from "../db/index.ts";
import {
  ApiError,
  fail,
  string,
  digest,
  userView,
  audit,
  validDate,
  type Row,
} from "./support.ts";

export const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (x) => String(x.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (x) => String(x.charCodeAt(0) - 1632));
export function normalizePhone(value: string) {
  let v = normalizeDigits(value).replace(/[\s()-]/g, "");
  if (v.startsWith("0098")) v = "0" + v.slice(4);
  if (v.startsWith("+98")) v = "0" + v.slice(3);
  return v;
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function passwordInput(b: Row) {
  const p = rawPassword(b.password, 12);
  const c = b.passwordConfirmation ?? b.confirmPassword;
  if (c !== undefined && c !== p) fail("تکرار رمز عبور یکسان نیست.");
  return p;
}
function rawPassword(value: unknown, minimum: number) {
  if (typeof value === "string" && !value.trim())
    fail("رمز عبور نمی‌تواند فقط فاصله باشد.");
  if (typeof value !== "string" || value.length < minimum || value.length > 128)
    fail("طول رمز عبور معتبر نیست.");
  return value as string;
}
export function registerAuthRoutes(
  app: express.Express,
  context: {
    requireUser: (res: express.Response) => Row;
    sessionResponse: (
      res: express.Response,
      u: Row,
      rememberMe?: boolean,
    ) => Promise<unknown>;
    limit: (key: string, max: number) => void;
  },
) {
  const { requireUser, sessionResponse, limit } = context;
  const administrator = (res: express.Response) => {
    const u = requireUser(res);
    if (u.role !== "clinic_admin" || !u.organization_id)
      throw new ApiError(403, "FORBIDDEN", "دسترسی مدیر مرکز لازم است.");
    return u;
  };
  app.get("/api/auth/me", (_req, res) =>
    res.json(
      res.locals.session
        ? {
            user: userView(res.locals.session),
            csrfToken: res.locals.session.csrf_token,
          }
        : { user: null },
    ),
  );
  app.get("/api/auth/organizations", async (_req, res, next) => {
    try {
      res.json({
        organizations: (
          await db.query(
            "SELECT id,name,city FROM organizations WHERE status='active' AND type IN ('hospital','clinic') ORDER BY name",
          )
        ).rows,
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      limit(`auth:${req.ip}`, 10);
      const b = req.body || {},
        email = string(b.email, "ایمیل", 3, 254).toLowerCase(),
        password = passwordInput(b);
      if (!emailPattern.test(email)) fail("ایمیل معتبر وارد کنید.");
      const complete = b.registrationVersion === 2 || b.firstName !== undefined;
      const firstName = complete ? string(b.firstName, "نام", 2, 60) : "",
        lastName = complete ? string(b.lastName, "نام خانوادگی", 2, 80) : "";
      const displayName = complete
          ? `${firstName} ${lastName}`
          : string(b.displayName, "نام", 2, 100),
        role = complete ? (b.requestedRole ?? b.role ?? "patient") : "patient";
      if (!["patient", "doctor", "registry_clerk"].includes(role))
        fail("نقش ثبت‌نام مجاز نیست.");
      if (displayName.length > 100)
        fail("نام کامل باید حداکثر ۱۰۰ نویسه باشد.");
      const phone = normalizePhone(
        string(b.phone ?? "", "شماره همراه", complete ? 1 : 0, 30),
      );
      if (phone && !/^09\d{9}$/.test(phone))
        fail("شماره همراه باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
      if (
        complete &&
        (b.consent !== true || !(b.passwordConfirmation ?? b.confirmPassword))
      )
        fail("تأیید رمز و پذیرش سیاست حریم خصوصی الزامی است.");
      const nationalId = normalizeDigits(
        string(b.nationalId ?? "", "کد ملی", complete ? 10 : 0, 10),
      );
      if (nationalId && !/^\d{10}$/.test(nationalId))
        fail("کد ملی باید ده رقم باشد.");
      const birthDate = normalizeDigits(
        string(b.birthDate ?? "", "تاریخ تولد", complete ? 10 : 0, 10),
      );
      if (
        birthDate &&
        (!validDate(birthDate) ||
          birthDate > new Date().toISOString().slice(0, 10))
      )
        fail("تاریخ تولد معتبر نیست.");
      const p: Row = {
        firstName,
        lastName,
        displayName,
        phone,
        nationalId,
        birthDate,
      };
      for (const key of [
        "address",
        "emergencyContactName",
        "emergencyContactRelation",
        "emergencyContactPhone",
      ])
        p[key] = string(b[key] ?? "", key, 0, key === "address" ? 1000 : 200);
      p.emergencyContactPhone = normalizePhone(p.emergencyContactPhone);
      if (p.emergencyContactPhone && !/^09\d{9}$/.test(p.emergencyContactPhone))
        fail("شماره تماس اضطراری معتبر نیست.");
      const organizationId =
          role !== "patient" ? string(b.organizationId, "مرکز", 1, 100) : null,
        professionalId =
          role !== "patient"
            ? string(
                b.professionalId ??
                  (role === "doctor" ? b.licenseNumber : b.employeeCode),
                "شناسه حرفه‌ای",
                2,
                100,
              )
            : "",
        specialty =
          role === "doctor" ? string(b.specialty, "تخصص", 2, 200) : "";
      const id = randomUUID(),
        applicationId = randomUUID();
      await transaction(async (client) => {
        if (
          organizationId &&
          !(
            await client.query(
              "SELECT id FROM organizations WHERE id=$1 AND status='active' AND type IN ('hospital','clinic') FOR SHARE",
              [organizationId],
            )
          ).rowCount
        )
          fail("مرکز انتخاب‌شده معتبر نیست.");
        await client.query(
          "INSERT INTO users(id,email,phone,password_hash,role,display_name,status) VALUES($1,$2,$3,$4,$5,$6,$7)",
          [
            id,
            email,
            phone || null,
            hashPassword(password),
            role,
            displayName,
            role === "patient" ? "active" : "pending",
          ],
        );
        await client.query(
          "INSERT INTO user_profiles(user_id,data_json) VALUES($1,$2)",
          [id, JSON.stringify(p)],
        );
        if (role === "patient")
          await client.query(
            "INSERT INTO patient_profiles(user_id,national_id,birth_date,emergency_contact_json) VALUES($1,$2,$3,$4)",
            [
              id,
              nationalId || null,
              birthDate || null,
              JSON.stringify({
                name: p.emergencyContactName,
                phone: p.emergencyContactPhone,
                relation: p.emergencyContactRelation,
              }),
            ],
          );
        else
          await client.query(
            "INSERT INTO staff_signup_requests(id,user_id,organization_id,requested_role,professional_id,specialty) VALUES($1,$2,$3,$4,$5,$6)",
            [
              applicationId,
              id,
              organizationId,
              role,
              professionalId,
              specialty,
            ],
          );
        if (b.consent === true)
          await client.query(
            "INSERT INTO consents(id,patient_id,purpose,policy_version,granted_at,captured_by) VALUES($1,$2,'data_sharing','signup-privacy-v1',CURRENT_TIMESTAMP,$2)",
            [randomUUID(), id],
          );
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'register','user',$2)",
          [randomUUID(), id],
        );
      });
      if (role !== "patient")
        return res.status(201).json({
          user: null,
          application: { id: applicationId, status: "pending" },
          message:
            "درخواست عضویت ثبت شد؛ دسترسی حرفه‌ای پس از بررسی مدیر مرکز فعال می‌شود.",
        });
      res
        .status(201)
        .json(
          await sessionResponse(
            res,
            (await db.prepare("SELECT * FROM users WHERE id=?").get(id)) as Row,
          ),
        );
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      limit(`auth:${req.ip}`, 10);
      const identifier = string(
          req.body?.identifier ?? req.body?.email,
          "ایمیل یا همراه",
          3,
          254,
        ).toLowerCase(),
        password = rawPassword(req.body?.password, 1);
      const u = (await db
        .prepare("SELECT * FROM users WHERE lower(email)=? OR phone=?")
        .get(identifier, normalizePhone(identifier))) as Row | undefined;
      if (!u || !verifyPassword(password, u.password_hash))
        throw new ApiError(
          401,
          "INVALID_CREDENTIALS",
          "ایمیل، همراه یا رمز عبور صحیح نیست.",
        );
      if (u.status === "pending")
        throw new ApiError(
          403,
          "ACCOUNT_PENDING",
          "درخواست عضویت شما در انتظار بررسی مدیر مرکز است.",
        );
      if (u.status !== "active")
        throw new ApiError(
          401,
          "INVALID_CREDENTIALS",
          "حساب غیرفعال است یا اطلاعات ورود صحیح نیست.",
        );
      res.json(await sessionResponse(res, u, req.body?.rememberMe === true));
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/auth/logout", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      await transaction(async (client) => {
        await client.query("DELETE FROM sessions WHERE id=$1", [u.session_id]);
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'logout','session',$3)",
          [randomUUID(), u.id, u.session_id],
        );
      });
      res.clearCookie("shamsaz_session", { path: "/" });
      res.json({ user: null });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/organization/signup-requests", async (_req, res, next) => {
    try {
      const u = administrator(res);
      res.json({
        requests: (
          await db.query(
            'SELECT r.id,r.requested_role AS "requestedRole",r.professional_id AS "professionalId",r.specialty,r.status,r.created_at AS "createdAt",u.display_name AS "displayName",u.email,u.phone FROM staff_signup_requests r JOIN users u ON u.id=r.user_id WHERE r.organization_id=$1 ORDER BY r.created_at DESC',
            [u.organization_id],
          )
        ).rows,
      });
    } catch (e) {
      next(e);
    }
  });
  app.post(
    "/api/organization/signup-requests/:id/review",
    async (req, res, next) => {
      try {
        const actor = administrator(res),
          decision = req.body?.decision;
        if (!["approve", "reject"].includes(decision))
          fail("نتیجه بررسی معتبر نیست.");
        const reason = string(req.body?.reason ?? "", "توضیح بررسی", 0, 1000);
        await transaction(async (client) => {
          const r = (
            await client.query(
              "SELECT * FROM staff_signup_requests WHERE id=$1 AND organization_id=$2 FOR UPDATE",
              [req.params.id, actor.organization_id],
            )
          ).rows[0];
          if (!r) throw new ApiError(404, "NOT_FOUND", "درخواست یافت نشد.");
          if (r.status !== "pending")
            throw new ApiError(
              409,
              "ALREADY_REVIEWED",
              "درخواست قبلاً بررسی شده است.",
            );
          await client.query(
            "UPDATE staff_signup_requests SET status=$1,reviewed_by=$2,reviewed_at=CURRENT_TIMESTAMP,review_reason=$3 WHERE id=$4",
            [
              decision === "approve" ? "approved" : "rejected",
              actor.id,
              reason,
              r.id,
            ],
          );
          await client.query(
            "UPDATE users SET status=$1,organization_id=$2,updated_at=CURRENT_TIMESTAMP WHERE id=$3",
            [
              decision === "approve" ? "active" : "rejected",
              decision === "approve" ? actor.organization_id : null,
              r.user_id,
            ],
          );
          if (decision === "approve") {
            await client.query(
              "INSERT INTO organization_memberships(id,user_id,organization_id,role) VALUES($1,$2,$3,$4)",
              [
                randomUUID(),
                r.user_id,
                actor.organization_id,
                r.requested_role,
              ],
            );
            if (r.requested_role === "doctor")
              await client.query(
                "INSERT INTO doctor_profiles(user_id,license_number,specialty) VALUES($1,$2,$3)",
                [r.user_id, r.professional_id, r.specialty],
              );
          }
          await client.query(
            "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,'staff_signup_request',$4)",
            [randomUUID(), actor.id, `signup_${decision}`, r.id],
          );
        });
        res.json({ status: decision === "approve" ? "approved" : "rejected" });
      } catch (e) {
        next(e);
      }
    },
  );
  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      limit(`recovery:${req.ip}`, 5);
      const email = string(req.body?.email, "ایمیل", 3, 254).toLowerCase();
      if (!emailPattern.test(email)) fail("ایمیل معتبر وارد کنید.");
      const loopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket.remoteAddress ?? "",
      );
      const development =
          process.env.ENABLE_DEV_AUTH_INBOX === "true" &&
          process.env.NODE_ENV !== "production" &&
          loopback,
        smtp = !!(process.env.SMTP_HOST && process.env.SMTP_FROM);
      if (!development && !smtp)
        throw new ApiError(
          503,
          "RECOVERY_UNAVAILABLE",
          "سرویس بازیابی رمز هنوز پیکربندی نشده است؛ با مدیر مرکز تماس بگیرید.",
        );
      const message = development
        ? "در محیط توسعه لینک آزمایشی برای حساب موجود ساخته می‌شود؛ ایمیلی ارسال نمی‌شود."
        : "اگر حساب فعالی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال می‌شود.";
      const u = (await db
        .prepare(
          "SELECT id FROM users WHERE lower(email)=? AND status='active'",
        )
        .get(email)) as Row | undefined;
      let developmentResetUrl: string | undefined;
      if (u) {
        const token = randomBytes(32).toString("hex"),
          id = randomUUID(),
          origin = process.env.APP_ORIGIN;
        if (!origin)
          throw new ApiError(
            503,
            "RECOVERY_UNAVAILABLE",
            "نشانی سایت برای بازیابی پیکربندی نشده است.",
          );
        const resetUrl = `${origin.replace(/\/$/, "")}/#reset-password?token=${token}`;
        await transaction(async (client) => {
          await client.query(
            "UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND used_at IS NULL",
            [u.id],
          );
          await client.query(
            "INSERT INTO password_reset_tokens(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,$4)",
            [
              id,
              u.id,
              digest(token),
              new Date(Date.now() + 30 * 60000).toISOString(),
            ],
          );
        });
        try {
          if (development) {
            await mkdir(".local/recovery", { recursive: true });
            await writeFile(
              `.local/recovery/${id}.json`,
              JSON.stringify({
                email,
                resetUrl,
                expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
              }),
              { mode: 0o600 },
            );
            developmentResetUrl = resetUrl;
          } else {
            const transport = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              secure: process.env.SMTP_SECURE === "true",
              auth: process.env.SMTP_USER
                ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                  }
                : undefined,
            });
            await transport.sendMail({
              from: process.env.SMTP_FROM,
              to: email,
              subject: "بازیابی رمز عبور شمساز",
              text: `برای تغییر رمز عبور تا ۳۰ دقیقه آینده از این پیوند استفاده کنید:\n${resetUrl}\nاگر این درخواست را نداده‌اید، آن را نادیده بگیرید.`,
            });
          }
        } catch (e) {
          await db
            .prepare(
              "UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?",
            )
            .run(id);
          throw new ApiError(
            503,
            "RECOVERY_DELIVERY_FAILED",
            "سرویس ارسال بازیابی در دسترس نیست؛ بعداً تلاش کنید.",
          );
        }
      }
      res.json({
        message,
        deliveryMode: development ? "development" : "smtp",
        ...(developmentResetUrl ? { developmentResetUrl } : {}),
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      limit(`reset:${req.ip}`, 10);
      const b = req.body || {},
        token = string(b.token, "توکن", 64, 64),
        password = passwordInput(b);
      if (
        !/^[a-f0-9]{64}$/.test(token) ||
        !(b.passwordConfirmation ?? b.confirmPassword)
      )
        fail("اطلاعات بازیابی معتبر نیست.");
      await transaction(async (client) => {
        const r = (
          await client.query(
            "SELECT r.id,r.user_id FROM password_reset_tokens r JOIN users u ON u.id=r.user_id WHERE r.token_hash=$1 AND r.used_at IS NULL AND r.expires_at>CURRENT_TIMESTAMP AND u.status='active' FOR UPDATE OF r",
            [digest(token)],
          )
        ).rows[0];
        if (!r)
          throw new ApiError(
            422,
            "RESET_TOKEN_INVALID",
            "لینک بازیابی نامعتبر، منقضی یا مصرف‌شده است.",
          );
        await client.query(
          "UPDATE users SET password_hash=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2",
          [hashPassword(password), r.user_id],
        );
        await client.query(
          "UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND used_at IS NULL",
          [r.user_id],
        );
        await client.query("DELETE FROM sessions WHERE user_id=$1", [
          r.user_id,
        ]);
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'reset_password','user',$2)",
          [randomUUID(), r.user_id],
        );
      });
      res.clearCookie("shamsaz_session", { path: "/" });
      res.json({ message: "رمز عبور تغییر کرد؛ با رمز جدید وارد شوید." });
    } catch (e) {
      next(e);
    }
  });
}
