import type express from "express";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { db, transaction, hashPassword } from "../db/index.ts";
import { ApiError, string, fail, type Row } from "./support.ts";

interface Context {
  requireUser: (res: express.Response) => Row;
}
async function recordAudit(
  client: PoolClient,
  actor: string,
  action: string,
  entity: string,
  id: string,
) {
  await client.query(
    "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), actor, action, entity, id],
  );
}
export function registerOrganizationRoutes(
  app: express.Express,
  { requireUser }: Context,
) {
  function administrator(res: express.Response) {
    const user = requireUser(res);
    if (user.role !== "clinic_admin" || !user.organization_id)
      throw new ApiError(403, "FORBIDDEN", "دسترسی مدیر مرکز الزامی است.");
    return user;
  }
  app.get("/api/organization", async (_req, res, next) => {
    try {
      const user = administrator(res);
      const result = await db.query(
        "SELECT id,name,city,address,phone,type FROM organizations WHERE id=$1",
        [user.organization_id],
      );
      res.json({ organization: result.rows[0] });
    } catch (error) {
      next(error);
    }
  });
  app.put("/api/organization", async (req, res, next) => {
    try {
      const user = administrator(res),
        body = req.body?.organization || req.body || {};
      const name = string(body.name, "نام مرکز", 2, 200),
        city = string(body.city, "شهر", 2, 100);
      const address = string(body.address, "نشانی", 0, 1000),
        phone = string(body.phone || "", "تماس", 0, 20);
      if (phone && !/^\+?[0-9]{10,15}$/.test(phone))
        fail("شماره تماس مرکز معتبر نیست.");
      const organization = await transaction(async (client) => {
        const result = await client.query(
          "UPDATE organizations SET name=$1,city=$2,address=$3,phone=$4 WHERE id=$5 RETURNING id,name,city,address,phone,type",
          [name, city, address, phone || null, user.organization_id],
        );
        await recordAudit(
          client,
          user.id,
          "update_organization",
          "organization",
          user.organization_id,
        );
        return result.rows[0];
      });
      res.json({ organization });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/organization/slots", async (_req, res, next) => {
    try {
      const user = administrator(res);
      const result = await db.query(
        'SELECT s.id,s.doctor_id AS "doctorId",u.display_name AS "doctorName",s.starts_at AS "startsAt",s.ends_at AS "endsAt",s.status FROM appointment_slots s JOIN users u ON u.id=s.doctor_id WHERE s.organization_id=$1 AND s.starts_at>CURRENT_TIMESTAMP ORDER BY s.starts_at LIMIT 100',
        [user.organization_id],
      );
      res.json({ slots: result.rows });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/organization/slots", async (req, res, next) => {
    try {
      const user = administrator(res),
        body = req.body || {};
      const doctorId = string(body.doctorId, "پزشک", 1, 100);
      const startsAt = string(body.startsAt, "شروع", 1, 50),
        endsAt = string(body.endsAt, "پایان", 1, 50);
      const start = Date.parse(startsAt),
        end = Date.parse(endsAt),
        minutes = (end - start) / 60000;
      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start <= Date.now() ||
        start > Date.now() + 365 * 86400000 ||
        minutes < 10 ||
        minutes > 120
      )
        fail("زمان آینده و مدت بین ۱۰ تا ۱۲۰ دقیقه انتخاب کنید.");
      const slot = await transaction(async (client) => {
        const doctor = await client.query(
          "SELECT id FROM users WHERE id=$1 AND organization_id=$2 AND role='doctor' AND status='active' FOR SHARE",
          [doctorId, user.organization_id],
        );
        if (!doctor.rowCount)
          throw new ApiError(403, "FORBIDDEN", "پزشک متعلق به این مرکز نیست.");
        const id = randomUUID();
        const result = await client.query(
          'INSERT INTO appointment_slots(id,doctor_id,organization_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5) RETURNING id,doctor_id AS "doctorId",starts_at AS "startsAt",ends_at AS "endsAt",status',
          [
            id,
            doctorId,
            user.organization_id,
            new Date(start).toISOString(),
            new Date(end).toISOString(),
          ],
        );
        await recordAudit(
          client,
          user.id,
          "create_slot",
          "appointment_slot",
          id,
        );
        return result.rows[0];
      });
      res.status(201).json({ slot });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/organization/staff", async (_req, res, next) => {
    try {
      const user = administrator(res);
      const result = await db.query(
        "SELECT id,display_name AS \"displayName\",email,role,status FROM users WHERE organization_id=$1 AND role IN ('doctor','registry_clerk','clinic_admin') ORDER BY display_name",
        [user.organization_id],
      );
      res.json({ staff: result.rows });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/organization/staff", async (req, res, next) => {
    try {
      const actor = administrator(res),
        body = req.body || {};
      const displayName = string(body.displayName, "نام", 2, 100),
        email = string(body.email, "ایمیل", 3, 254).toLowerCase();
      const role = string(body.role, "نقش", 1, 30),
        password = string(body.password, "رمز اولیه", 12, 128);
      if (
        !["doctor", "registry_clerk"].includes(role) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
        fail("نقش کارمند یا ایمیل معتبر نیست.");
      const specialty =
        role === "doctor" ? string(body.specialty, "تخصص", 2, 200) : "";
      const license =
        role === "doctor"
          ? string(body.licenseNumber, "شماره نظام پزشکی", 2, 100)
          : "";
      const passwordHash = hashPassword(password);
      const staff = await transaction(async (client) => {
        const id = randomUUID();
        await client.query(
          "INSERT INTO users(id,email,password_hash,display_name,role,organization_id) VALUES($1,$2,$3,$4,$5,$6)",
          [id, email, passwordHash, displayName, role, actor.organization_id],
        );
        await client.query("INSERT INTO user_profiles(user_id) VALUES($1)", [
          id,
        ]);
        await client.query(
          "INSERT INTO organization_memberships(id,user_id,organization_id,role) VALUES($1,$2,$3,$4)",
          [randomUUID(), id, actor.organization_id, role],
        );
        if (role === "doctor")
          await client.query(
            "INSERT INTO doctor_profiles(user_id,license_number,specialty) VALUES($1,$2,$3)",
            [id, license, specialty],
          );
        await recordAudit(client, actor.id, "provision_staff", "user", id);
        return { id, displayName, email, role, status: "active" };
      });
      res.status(201).json({ staff });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/organization/enrollments", async (req, res, next) => {
    try {
      const actor = administrator(res),
        body = req.body || {},
        email = string(body.email, "ایمیل بیمار", 3, 254).toLowerCase();
      if (body.consent !== true)
        fail("تأیید رضایت بیمار برای پذیرش در مرکز لازم است.");
      const patient = await transaction(async (client) => {
        const found = await client.query(
          "SELECT id,display_name,organization_id FROM users WHERE lower(email)=$1 AND role='patient' AND status='active' FOR UPDATE",
          [email],
        );
        const patient = found.rows[0];
        if (!patient)
          throw new ApiError(404, "PATIENT_NOT_FOUND", "حساب بیمار پیدا نشد.");
        if (
          patient.organization_id &&
          patient.organization_id !== actor.organization_id
        )
          throw new ApiError(
            409,
            "CENTER_CONFLICT",
            "بیمار در مرکز دیگری پذیرفته شده است؛ انتقال نیازمند فرایند جداگانه است.",
          );
        await client.query(
          "UPDATE users SET organization_id=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2",
          [actor.organization_id, patient.id],
        );
        await client.query(
          "INSERT INTO consents(id,patient_id,purpose,policy_version,granted_at,captured_by) VALUES($1,$2,'care','center-enrollment-v1',CURRENT_TIMESTAMP,$3)",
          [randomUUID(), patient.id, actor.id],
        );
        await recordAudit(
          client,
          actor.id,
          "enroll_patient",
          "user",
          patient.id,
        );
        return { id: patient.id, displayName: patient.display_name };
      });
      res.status(201).json({ patient });
    } catch (error) {
      next(error);
    }
  });
}
