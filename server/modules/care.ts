import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { db, transaction } from "../db/index.ts";
import {
  assessScreening,
  emptyScreeningAnswers,
  validateScreeningAnswers,
  symptomOptions,
  type ScreeningAnswers,
} from "../../shared/screening.ts";
import {
  ApiError,
  fail,
  string,
  digest,
  safeEqual,
  userView,
  optional,
  audit,
  mutate,
  validDate,
  json,
  type Row,
} from "./support.ts";

export function registerCareRoutes(
  app: express.Express,
  context: {
    requireUser: (res: express.Response) => Row;
    sessionResponse: (res: express.Response, u: Row) => Promise<unknown>;
    limit: (key: string, max: number) => void;
  },
) {
  const { requireUser, sessionResponse, limit } = context;
  app.patch("/api/appointments/:id", async (req, res, next) => {
    try {
      const u = requireUser(res),
        status = string(req.body?.status, "وضعیت", 1, 30);
      if (!["confirmed", "completed", "cancelled", "no_show"].includes(status))
        fail("وضعیت معتبر نیست.");
      await transaction(async (client) => {
        const row = (
          await client.query(
            "SELECT * FROM appointments WHERE id=$1 FOR UPDATE",
            [req.params.id],
          )
        ).rows[0];
        if (!row) throw new ApiError(404, "NOT_FOUND", "نوبت یافت نشد.");
        const permitted =
          (u.role === "patient" &&
            row.patient_id === u.id &&
            status === "cancelled") ||
          (u.role === "doctor" && row.doctor_id === u.id) ||
          (u.role === "clinic_admin" &&
            u.organization_id &&
            row.organization_id === u.organization_id);
        if (!permitted)
          throw new ApiError(403, "FORBIDDEN", "دسترسی این نوبت را ندارید.");
        if (
          !["pending", "confirmed"].includes(row.status) ||
          (row.status === "pending" &&
            ["completed", "no_show"].includes(status))
        )
          throw new ApiError(
            409,
            "INVALID_TRANSITION",
            "تغییر وضعیت مجاز نیست.",
          );
        await client.query(
          "UPDATE appointments SET status=$1,updated_at=$2 WHERE id=$3",
          [status, new Date().toISOString(), row.id],
        );
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4,$5)",
          [randomUUID(), u.id, "update_appointment", "appointment", row.id],
        );
      });
      res.json({ appointment: { id: req.params.id, status } });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/encounters", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (!["doctor", "patient"].includes(u.role))
        throw new ApiError(403, "FORBIDDEN", "دسترسی مجاز نیست.");
      res.json({
        encounters: await db
          .prepare(
            `SELECT e.id,e.patient_id AS "patientId",e.doctor_id AS "doctorId",p.display_name AS "patientName",d.display_name AS "doctorName",e.status,e.chief_complaint AS "chiefComplaint",e.subjective,e.objective,e.assessment,e.plan,e.occurred_at AS "occurredAt" FROM encounters e JOIN users p ON p.id=e.patient_id JOIN users d ON d.id=e.doctor_id WHERE ${u.role === "patient" ? "e.patient_id" : "e.doctor_id"}=? ORDER BY e.occurred_at DESC LIMIT 100`,
          )
          .all(u.id),
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/prescriptions", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (!["doctor", "patient"].includes(u.role))
        throw new ApiError(403, "FORBIDDEN", "دسترسی مجاز نیست.");
      const rows = await db
        .prepare(
          `SELECT rx.id,rx.patient_id AS "patientId",p.display_name AS "patientName",d.display_name AS "doctorName",rx.status,rx.notes,rx.issued_at AS "issuedAt" FROM prescriptions rx JOIN users p ON p.id=rx.patient_id JOIN users d ON d.id=rx.doctor_id WHERE ${u.role === "patient" ? "rx.patient_id" : "rx.doctor_id"}=? ORDER BY rx.issued_at DESC LIMIT 100`,
        )
        .all(u.id);
      for (const row of rows)
        row.items = await db
          .prepare(
            'SELECT medication_name AS "medicationName",dose,route,frequency,duration_days AS "durationDays",instructions FROM prescription_items WHERE prescription_id=?',
          )
          .all(row.id);
      res.json({ prescriptions: rows });
    } catch (e) {
      next(e);
    }
  });
  const doctorPatient = async (u: Row, patientId: string) => {
    if (u.role !== "doctor" || !u.organization_id)
      throw new ApiError(403, "FORBIDDEN", "دسترسی پزشک مرکز الزامی است.");
    if (
      !(await db
        .prepare(
          "SELECT id FROM users WHERE id=? AND role='patient' AND status='active' AND (organization_id=? OR EXISTS(SELECT 1 FROM appointments WHERE patient_id=users.id AND doctor_id=? AND status IN ('pending','confirmed','completed')))",
        )
        .get(patientId, u.organization_id, u.id))
    )
      throw new ApiError(403, "FORBIDDEN", "بیمار تحت مراقبت شما نیست.");
  };
  app.post("/api/encounters", async (req, res, next) => {
    try {
      const u = requireUser(res),
        b = req.body || {},
        patientId = string(b.patientId, "بیمار", 1, 100);
      await doctorPatient(u, patientId);
      const chiefComplaint = string(b.chiefComplaint, "شکایت اصلی", 3, 2000),
        subjective = string(b.subjective, "شرح حال", 3, 5000),
        objective = string(b.objective, "معاینه", 3, 5000),
        assessment = string(b.assessment, "ارزیابی", 3, 5000),
        plan = string(b.plan, "برنامه مراقبت", 3, 5000);
      const id = randomUUID(),
        now = new Date().toISOString();
      await mutate(u.id, "create_encounter", "encounter", id, [
        [
          "INSERT INTO encounters(id,patient_id,doctor_id,organization_id,status,chief_complaint,subjective,objective,assessment,plan,occurred_at) VALUES(?,?,?,?,'draft',?,?,?,?,?,?)",
          [
            id,
            patientId,
            u.id,
            u.organization_id,
            chiefComplaint,
            subjective,
            objective,
            assessment,
            plan,
            now,
          ],
        ],
      ]);
      res.status(201).json({
        encounter: {
          id,
          patientId,
          status: "draft",
          chiefComplaint,
          subjective,
          objective,
          assessment,
          plan,
          occurredAt: now,
        },
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/prescriptions", async (req, res, next) => {
    try {
      const u = requireUser(res),
        b = req.body || {},
        patientId = string(b.patientId, "بیمار", 1, 100);
      await doctorPatient(u, patientId);
      if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 20)
        fail("حداقل یک قلم دارو لازم است.");
      const items = b.items.map((i: Row) => {
        if (!i || typeof i !== "object" || Array.isArray(i))
          fail("Medication item must be an object.");
        const durationDays = Number(i.durationDays);
        if (
          !Number.isInteger(durationDays) ||
          durationDays < 1 ||
          durationDays > 365
        )
          fail("مدت مصرف معتبر نیست.");
        return {
          medicationName: string(i.medicationName, "نام دارو", 2, 200),
          dose: string(i.dose, "دوز", 1, 100),
          route: string(i.route, "روش مصرف", 1, 100),
          frequency: string(i.frequency, "دفعات", 1, 100),
          durationDays,
          instructions: optional(i, "instructions", 1000) || "",
        };
      });
      const id = randomUUID(),
        notes = optional(b, "notes", 2000) || "";
      await transaction(async (client) => {
        await client.query(
          "INSERT INTO prescriptions(id,patient_id,doctor_id,status,notes) VALUES($1,$2,$3,'draft',$4)",
          [id, patientId, u.id, notes],
        );
        for (const item of items)
          await client.query(
            "INSERT INTO prescription_items(id,prescription_id,medication_name,dose,route,frequency,duration_days,instructions) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
            [
              randomUUID(),
              id,
              item.medicationName,
              item.dose,
              item.route,
              item.frequency,
              item.durationDays,
              item.instructions,
            ],
          );
        await client.query(
          "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4,$5)",
          [randomUUID(), u.id, "create_prescription", "prescription", id],
        );
      });
      res.status(201).json({
        prescription: { id, patientId, status: "draft", items, notes },
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/doctors", async (_req, res, next) => {
    try {
      res.json({
        doctors: await db
          .prepare(
            'SELECT u.id,u.display_name AS "displayName",u.organization_id AS "organizationId",d.specialty,d.license_number AS "licenseNumber",d.biography,d.fee FROM users u JOIN doctor_profiles d ON d.user_id=u.id WHERE u.role=? AND u.status=?',
          )
          .all("doctor", "active"),
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/patients", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (
        !["doctor", "registry_clerk", "clinic_admin"].includes(u.role) ||
        !u.organization_id
      )
        throw new ApiError(403, "FORBIDDEN", "دسترسی مرکز الزامی است.");
      const scope =
        u.role === "doctor"
          ? "(u.organization_id=$1 OR EXISTS(SELECT 1 FROM appointments a WHERE a.patient_id=u.id AND a.doctor_id=$2 AND a.status IN ('pending','confirmed','completed')))"
          : "u.organization_id=$1";
      res.json({
        patients: (
          await db.query(
            `SELECT u.id,u.organization_id AS "organizationId",u.display_name AS "displayName",u.phone,p.data_json->>'birthDate' AS "birthDate",p.data_json->>'nationalId' AS "nationalId" FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.role='patient' AND ${scope} AND u.status='active' ORDER BY u.display_name LIMIT 200`,
            u.role === "doctor"
              ? [u.organization_id, u.id]
              : [u.organization_id],
          )
        ).rows,
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/doctors/:id/slots", async (req, res, next) => {
    try {
      res.json({
        slots: await db
          .prepare(
            "SELECT s.id,s.starts_at AS \"startsAt\",s.ends_at AS \"endsAt\" FROM appointment_slots s WHERE s.doctor_id=? AND s.starts_at>? AND s.status='available' AND NOT EXISTS(SELECT 1 FROM appointments a WHERE a.doctor_id=s.doctor_id AND a.status IN ('pending','confirmed') AND a.starts_at<s.ends_at AND a.ends_at>s.starts_at) ORDER BY s.starts_at LIMIT 100",
          )
          .all(req.params.id, new Date().toISOString()),
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/dashboard", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (u.role === "national_supervisor") {
        const counts = await db
          .prepare(
            "SELECT (SELECT COUNT(*)::int FROM appointments) AS appointments,(SELECT COUNT(*)::int FROM registry_cases) AS registry_cases,(SELECT COUNT(*)::int FROM screening_reports) AS screenings",
          )
          .get();
        return res.json({
          user: userView(u),
          appointments: [],
          screenings: [],
          registryCases: [],
          summary: counts,
        });
      }
      let where = "a.patient_id=?",
        param = u.id;
      if (u.role === "doctor") where = "a.doctor_id=?";
      else if (
        ["registry_clerk", "national_supervisor", "clinic_admin"].includes(
          u.role,
        )
      ) {
        where = "a.organization_id=?";
        param = u.organization_id || "__none__";
      }
      const appointments = await db
        .prepare(
          `SELECT a.id,a.patient_id AS "patientId",a.doctor_id AS "doctorId",a.starts_at AS "scheduledAt",a.type,a.status,a.reason,d.display_name AS "doctorName",p.display_name AS "patientName" FROM appointments a JOIN users d ON d.id=a.doctor_id JOIN users p ON p.id=a.patient_id WHERE ${where} ORDER BY a.starts_at DESC LIMIT 100`,
        )
        .all(param);
      const screenings = (
        u.role === "patient"
          ? await db
              .prepare(
                "SELECT * FROM screening_reports WHERE patient_id=? ORDER BY created_at DESC LIMIT 100",
              )
              .all(u.id)
          : []
      ) as Row[];
      const cases = (
        ["doctor", "registry_clerk", "clinic_admin"].includes(u.role) &&
        u.organization_id
          ? await db
              .prepare(
                "SELECT * FROM registry_cases WHERE organization_id=? ORDER BY created_at DESC LIMIT 100",
              )
              .all(u.organization_id)
          : []
      ) as Row[];
      res.json({
        user: userView(u),
        appointments,
        screenings: screenings.map((r) => ({
          ...json(r.payload_json),
          id: r.id,
          createdAt: r.created_at,
          triageLevel: r.triage_level,
        })),
        registryCases: cases.map((r) => ({
          ...json(r.payload_json),
          id: r.id,
          patientId: r.patient_id,
          createdAt: r.created_at,
        })),
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/appointments", async (req, res, next) => {
    try {
      const u = requireUser(res);
      if (u.role !== "patient")
        throw new ApiError(
          403,
          "FORBIDDEN",
          "رزرو از حساب بیمار انجام می‌شود.",
        );
      const b = req.body || {},
        doctorId = string(b.doctorId, "پزشک", 1, 100),
        scheduledAt = string(b.scheduledAt, "زمان", 1, 50),
        reason = string(b.reason, "علت مراجعه", 3, 1000),
        type = string(b.type, "نوع", 1, 20);
      if (
        !["in_person", "online", "telemedicine"].includes(type) ||
        !Number.isFinite(Date.parse(scheduledAt)) ||
        Date.parse(scheduledAt) <= Date.now() ||
        Date.parse(scheduledAt) > Date.now() + 365 * 86400000
      )
        fail("نوع یا زمان نوبت معتبر نیست.");
      const d = (await db
        .prepare("SELECT * FROM users WHERE id=? AND role=? AND status=?")
        .get(doctorId, "doctor", "active")) as Row | undefined;
      if (!d) throw new ApiError(422, "INVALID_DOCTOR", "پزشک فعال یافت نشد.");
      const start = new Date(scheduledAt).toISOString(),
        slot = await db
          .prepare(
            "SELECT id,ends_at FROM appointment_slots WHERE doctor_id=? AND starts_at=? AND status='available'",
          )
          .get(doctorId, new Date(scheduledAt).toISOString());
      if (!slot) fail("زمان انتخابی در برنامه پزشک وجود ندارد.");
      const end = new Date(slot.ends_at).toISOString();
      if (
        await db
          .prepare(
            "SELECT id FROM appointments WHERE doctor_id=? AND status IN ('pending','confirmed') AND starts_at<? AND ends_at>?",
          )
          .get(doctorId, end, start)
      )
        throw new ApiError(409, "SLOT_TAKEN", "این زمان قبلاً رزرو شده است.");
      const id = randomUUID(),
        now = new Date().toISOString();
      await mutate(u.id, "request_appointment", "appointment", id, [
        [
          "INSERT INTO appointments(id,patient_id,doctor_id,organization_id,slot_id,starts_at,ends_at,type,status,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            id,
            u.id,
            doctorId,
            d.organization_id,
            slot.id,
            start,
            end,
            type === "online" ? "telemedicine" : type,
            "pending",
            reason,
            now,
            now,
          ],
        ],
      ]);
      res.status(201).json({
        appointment: {
          id,
          patientId: u.id,
          doctorId,
          scheduledAt: start,
          type,
          status: "pending",
          reason,
          doctorName: d.display_name,
          patientName: u.display_name,
        },
      });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/screenings", async (_req, res, next) => {
    try {
      const u = requireUser(res);
      if (u.role !== "patient")
        throw new ApiError(
          403,
          "FORBIDDEN",
          "گزارش‌های شخصی فقط در حساب بیمار قابل مشاهده است.",
        );
      const rows = (await db
        .prepare(
          "SELECT * FROM screening_reports WHERE patient_id=? ORDER BY created_at DESC LIMIT 100",
        )
        .all(u.id)) as Row[];
      res.json({
        screenings: rows.map((r) => ({
          ...json(r.payload_json),
          id: r.id,
          createdAt: r.created_at,
          triageLevel: r.triage_level,
        })),
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/screenings", async (req, res, next) => {
    try {
      const u = requireUser(res);
      if (u.role !== "patient")
        throw new ApiError(
          403,
          "FORBIDDEN",
          "فقط بیمار می‌تواند گزارش شخصی ثبت کند.",
        );
      const b = req.body || {};
      if (b.screeningVersion === 2) {
        if (b.consent !== true) fail("رضایت ذخیره اطلاعات سلامت الزامی است.");
        const errors = validateScreeningAnswers(b.answers);
        if (errors.length) fail(errors.join(" "));
        const answers = Object.fromEntries(
          Object.keys(emptyScreeningAnswers).map((key) => [
            key,
            b.answers[key],
          ]),
        ) as unknown as ScreeningAnswers;
        const assessment = assessScreening(answers);
        const payload = {
          answers,
          patientName: u.display_name,
          assessment,
          symptoms: answers.symptoms.map(
            (id) => symptomOptions.find((s) => s.id === id)!.label,
          ),
          notes: answers.notes,
          consent: true,
        };
        const id = randomUUID(),
          now = new Date().toISOString();
        await mutate(u.id, "create_screening", "screening", id, [
          [
            "INSERT INTO screening_reports(id,patient_id,payload_json,triage_level,created_at) VALUES(?,?,?,?,?)",
            [id, u.id, JSON.stringify(payload), assessment.triageLevel, now],
          ],
          [
            "INSERT INTO consents(id,patient_id,purpose,policy_version,granted_at,captured_by) VALUES(?,?,'care','screening-2026-10-v1',?,?)",
            [randomUUID(), u.id, now, u.id],
          ],
        ]);
        res
          .status(201)
          .json({
            screening: {
              ...payload,
              id,
              createdAt: now,
              triageLevel: assessment.triageLevel,
            },
          });
        return;
      }
      if (b.screeningVersion !== undefined)
        fail("نسخه فرم غربالگری معتبر نیست.");
      if (
        b.consent !== true ||
        !Array.isArray(b.symptoms) ||
        b.symptoms.length < 1 ||
        b.symptoms.length > 30
      )
        fail("علائم و رضایت ثبت اطلاعات الزامی است.");
      const payload = {
          symptoms: b.symptoms.map((s: unknown) => string(s, "علامت", 1, 200)),
          notes: optional(b, "notes", 2000) || "",
          consent: true,
        },
        id = randomUUID(),
        now = new Date().toISOString();
      await mutate(u.id, "create_screening", "screening", id, [
        [
          "INSERT INTO screening_reports(id,patient_id,payload_json,triage_level,created_at) VALUES(?,?,?,?,?)",
          [id, u.id, JSON.stringify(payload), "unassessed", now],
        ],
        [
          "INSERT INTO consents(id,patient_id,purpose,policy_version,granted_at,captured_by) VALUES(?,?,'care','2026-10-v1',?,?)",
          [randomUUID(), u.id, now, u.id],
        ],
      ]);
      res.status(201).json({
        screening: {
          ...payload,
          id,
          createdAt: now,
          triageLevel: "unassessed",
        },
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/registry", async (req, res, next) => {
    try {
      const u = requireUser(res);
      if (
        !["registry_clerk", "doctor", "clinic_admin"].includes(u.role) ||
        !u.organization_id
      )
        throw new ApiError(
          403,
          "FORBIDDEN",
          "ثبت رجیستری نیازمند دسترسی مرکز است.",
        );
      const b = req.body || {},
        patientId = string(b.patientId, "بیمار", 1, 100),
        cancerSite = string(b.cancerSite, "محل سرطان", 2, 100),
        stage = string(b.stage, "مرحله", 1, 30),
        diagnosisDate = string(b.diagnosisDate, "تاریخ تشخیص", 10, 10);
      if (
        b.consent !== true ||
        !/^\d{4}-\d{2}-\d{2}$/.test(diagnosisDate) ||
        !validDate(diagnosisDate) ||
        diagnosisDate > new Date().toISOString().slice(0, 10)
      )
        fail("رضایت و تاریخ تشخیص معتبر الزامی است.");
      const p = await db
        .prepare(
          "SELECT id FROM users WHERE id=? AND role='patient' AND organization_id=?",
        )
        .get(patientId, u.organization_id);
      if (!p)
        throw new ApiError(403, "FORBIDDEN", "بیمار تحت پوشش این مرکز نیست.");
      const structured: Row = {};
      for (const key of [
        "icd10Code",
        "icdo3Code",
        "stagingSystem",
        "stagingVersion",
        "tnmT",
        "tnmN",
        "tnmM",
        "grade",
      ])
        structured[key] = optional(b, key, 40) || null;
      const payload = {
          cancerSite,
          stage,
          diagnosisDate,
          ...structured,
          notes: optional(b, "notes", 2000) || "",
          consent: true,
        },
        id = randomUUID(),
        now = new Date().toISOString();
      await mutate(u.id, "create_registry", "registry", id, [
        [
          "INSERT INTO registry_cases(id,organization_id,patient_id,payload_json,created_by,cancer_site,stage,diagnosed_at,status,created_at,updated_at,icd10_code,icdo3_code,staging_system,staging_version,tnm_t,tnm_n,tnm_m,grade) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            id,
            u.organization_id,
            patientId,
            JSON.stringify(payload),
            u.id,
            cancerSite,
            stage,
            diagnosisDate,
            "active",
            now,
            now,
            structured.icd10Code,
            structured.icdo3Code,
            structured.stagingSystem,
            structured.stagingVersion,
            structured.tnmT,
            structured.tnmN,
            structured.tnmM,
            structured.grade,
          ],
        ],
        [
          "INSERT INTO consents(id,patient_id,purpose,policy_version,granted_at,captured_by) VALUES(?,?,'care','2026-10-v1',?,?)",
          [randomUUID(), patientId, now, u.id],
        ],
      ]);
      res
        .status(201)
        .json({ registryCase: { ...payload, id, patientId, createdAt: now } });
    } catch (e) {
      next(e);
    }
  });
}
