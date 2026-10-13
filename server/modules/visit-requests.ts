import type express from "express";
import { randomUUID } from "node:crypto";
import { db, transaction } from "../db/index.ts";
import { normalizeDigits, normalizePhone } from "./auth.ts";
import { ApiError, string, fail, validDate, type Row } from "./support.ts";
import { publishedPractitioner } from "./practitioner-access.ts";
const projection = `SELECT r.id,r.reference,r.status,r.practitioner_id AS "practitionerId",p.display_name AS "practitionerName",r.patient_id AS "patientId",r.patient_name AS "patientName",r.phone,to_char(r.preferred_date,'YYYY-MM-DD') AS "preferredDate",to_char(r.preferred_time,'HH24:MI') AS "preferredTime",r.visit_type AS "visitType",r.reason,r.created_at AS "createdAt",r.updated_at AS "updatedAt" FROM public_visit_requests r JOIN public_practitioners p ON p.id=r.practitioner_id`;
export function registerVisitRequestRoutes(
  app: express.Express,
  {
    requireUser,
    limit,
  }: {
    requireUser: (res: express.Response) => Row;
    limit: (key: string, max: number) => void;
  },
) {
  app.post("/api/practitioners/:id/visit-requests", async (req, res, next) => {
    try {
      const u = requireUser(res);
      if (u.role !== "patient")
        throw new ApiError(
          403,
          "PATIENT_REQUIRED",
          "ثبت درخواست نوبت از حساب بیمار انجام می‌شود.",
        );
      limit(`visit-request:${u.id}`, 10);
      const b = req.body || {},
        patientName = string(b.patientName, "نام بیمار", 2, 100),
        phone = normalizePhone(string(b.phone, "شماره همراه", 1, 30)),
        preferredDate = normalizeDigits(
          string(b.preferredDate, "روز پیشنهادی", 10, 10),
        ),
        preferredTime = normalizeDigits(
          string(b.preferredTime, "ساعت پیشنهادی", 5, 5),
        ),
        visitType = string(b.visitType, "نوع مراجعه", 1, 20),
        reason = string(b.reason ?? "", "علت مراجعه", 0, 1000);
      if (!/^09\d{9}$/.test(phone))
        fail("شماره همراه معتبر ۱۱ رقمی با پیش‌شماره ۰۹ وارد کنید.");
      if (
        !validDate(preferredDate) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)
      )
        fail("روز و ساعت پیشنهادی معتبر نیست.");
      const preferredAt = new Date(
        `${preferredDate}T${preferredTime}:00+03:30`,
      );
      if (
        preferredAt.getTime() <= Date.now() ||
        preferredAt.getTime() > Date.now() + 90 * 86400000
      )
        fail("زمان پیشنهادی باید در آینده و حداکثر تا ۹۰ روز بعد باشد.");
      if (!["in_person", "online"].includes(visitType))
        fail("نوع مراجعه معتبر نیست.");
      if (b.consent !== true)
        fail("رضایت ثبت اطلاعات برای پیگیری درخواست الزامی است.");
      const id = randomUUID(),
        reference = `SH-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
      await transaction(async (client) => {
        const p = (
          await client.query(
            `SELECT p.id FROM public_practitioners p WHERE p.id=$1 AND ${publishedPractitioner("p")} FOR SHARE`,
            [req.params.id],
          )
        ).rows[0];
        if (!p)
          throw new ApiError(
            404,
            "PRACTITIONER_NOT_FOUND",
            "پزشک انتخاب‌شده در فهرست منتشرشده وجود ندارد.",
          );
        await client.query(
          "INSERT INTO public_visit_requests(id,reference,practitioner_id,patient_id,patient_name,phone,preferred_date,preferred_time,preferred_at,visit_type,reason,consent_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
          [
            id,
            reference,
            p.id,
            u.id,
            patientName,
            phone,
            preferredDate,
            preferredTime,
            preferredAt.toISOString(),
            visitType,
            reason,
            "public-visit-request-v1",
          ],
        );
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'create_visit_request','public_visit_request',$3)",
          [randomUUID(), u.id, id],
        );
      });
      res.status(201).json({
        visitRequest: (await db.query(`${projection} WHERE r.id=$1`, [id]))
          .rows[0],
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/visit-requests", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (!["patient", "doctor"].includes(u.role))
        throw new ApiError(
          403,
          "FORBIDDEN",
          "دسترسی به درخواست‌های شخصی مجاز نیست.",
        );
      const predicate =
        u.role === "patient"
          ? "r.patient_id=$1"
          : "p.account_id=$1 AND EXISTS(SELECT 1 FROM users d WHERE d.id=p.account_id AND d.role='doctor' AND d.status='active')";
      res.json({
        visitRequests: (
          await db.query(
            `${projection} WHERE ${predicate} ORDER BY r.created_at DESC LIMIT 100`,
            [u.id],
          )
        ).rows,
      });
    } catch (e) {
      next(e);
    }
  });
  app.patch("/api/visit-requests/:id", async (req, res, next) => {
    try {
      const u = requireUser(res),
        status = req.body?.status;
      if (u.role === "patient" && status !== "cancelled")
        throw new ApiError(
          403,
          "FORBIDDEN",
          "بیمار تنها می‌تواند درخواست خود را لغو کند.",
        );
      if (u.role === "doctor" && !["confirmed", "rejected"].includes(status))
        fail("نتیجه بررسی معتبر نیست.");
      if (!["patient", "doctor"].includes(u.role))
        throw new ApiError(403, "FORBIDDEN", "دسترسی مجاز نیست.");
      await transaction(async (client) => {
        const r = (
          await client.query(
            "SELECT r.*,p.account_id FROM public_visit_requests r JOIN public_practitioners p ON p.id=r.practitioner_id WHERE r.id=$1 FOR UPDATE OF r",
            [req.params.id],
          )
        ).rows[0];
        if (
          !r ||
          (u.role === "patient" ? r.patient_id !== u.id : r.account_id !== u.id)
        )
          throw new ApiError(
            404,
            "VISIT_REQUEST_NOT_FOUND",
            "درخواست قابل دسترسی یافت نشد.",
          );
        if (
          r.status !== "pending" &&
          !(u.role === "patient" && r.status === "confirmed")
        )
          throw new ApiError(
            409,
            "REQUEST_ALREADY_RESOLVED",
            "درخواست قبلاً تعیین تکلیف شده است.",
          );
        if (
          status === "confirmed" &&
          new Date(r.preferred_at).getTime() <= Date.now()
        )
          fail("زمان درخواست گذشته است و قابل تأیید نیست.");
        if (status === "confirmed") {
          await client.query(
            "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
            [`visit-confirmation:${u.id}`],
          );
          const provider = await client.query(
            `SELECT p.id FROM public_practitioners p WHERE p.id=$1 AND p.account_id=$2 AND ${publishedPractitioner("p")} FOR SHARE`,
            [r.practitioner_id, u.id],
          );
          if (!provider.rowCount)
            throw new ApiError(
              403,
              "PROVIDER_INACTIVE",
              "حساب پزشک یا مرکز برای تأیید فعال نیست.",
            );
          const booked = await client.query(
            "SELECT id FROM appointments WHERE doctor_id=$1 AND status IN ('pending','confirmed') AND starts_at<=$2 AND (ends_at>$2 OR (ends_at IS NULL AND starts_at=$2)) LIMIT 1",
            [u.id, r.preferred_at],
          );
          if (booked.rowCount)
            throw new ApiError(
              409,
              "REQUEST_TIME_CONFLICT",
              "این زمان با نوبت ثبت‌شده پزشک تداخل دارد.",
            );
        }
        await client.query(
          "UPDATE public_visit_requests SET status=$1,reviewed_by=$2,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$3",
          [status, u.id, r.id],
        );
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,'public_visit_request',$4)",
          [randomUUID(), u.id, `visit_request_${status}`, r.id],
        );
      });
      res.json({
        visitRequest: (
          await db.query(`${projection} WHERE r.id=$1`, [req.params.id])
        ).rows[0],
      });
    } catch (e) {
      next(e);
    }
  });
}
