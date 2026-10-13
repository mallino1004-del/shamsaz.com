import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { db, hashPassword, verifyPassword } from "../db/index.ts";
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

export function registerProfileRoutes(
  app: express.Express,
  context: {
    requireUser: (res: express.Response) => Row;
    sessionResponse: (res: express.Response, u: Row) => Promise<unknown>;
    limit: (key: string, max: number) => void;
  },
) {
  const { requireUser, sessionResponse, limit } = context;
  app.get("/api/profile", async (_req, res, next) => {
    try {
      const u = requireUser(res),
        row = (await db
          .prepare("SELECT data_json FROM user_profiles WHERE user_id=?")
          .get(u.id)) as Row | undefined;
      const verified =
        u.role === "doctor"
          ? await db
              .prepare(
                'SELECT specialty,license_number AS "licenseNumber" FROM doctor_profiles WHERE user_id=?',
              )
              .get(u.id)
          : {};
      res.json({
        profile: {
          ...(row ? json(row.data_json) : {}),
          ...verified,
          displayName: u.display_name,
          phone: u.phone || "",
        },
      });
    } catch (e) {
      next(e);
    }
  });
  const updateProfile: express.RequestHandler = async (req, res, next) => {
    try {
      const u = requireUser(res),
        b = req.body?.profile || req.body || {},
        old = (await db
          .prepare("SELECT data_json FROM user_profiles WHERE user_id=?")
          .get(u.id)) as Row | undefined,
        p = old ? json(old.data_json) : {};
      for (const key of [
        "displayName",
        "phone",
        "birthDate",
        "nationalId",
        "address",
        "emergencyContact",
        "emergencyContactName",
        "emergencyContactRelation",
        "emergencyContactPhone",
        "allergies",
        "medicalHistory",
        "bloodType",
        "currentMedications",
        "familyHistory",
        "biography",
      ])
        if (b[key] !== undefined)
          p[key] = string(
            b[key],
            key,
            key === "displayName" ? 2 : 0,
            key === "medicalHistory"
              ? 5000
              : [
                    "biography",
                    "allergies",
                    "currentMedications",
                    "familyHistory",
                  ].includes(key)
                ? 2000
                : 500,
          );
      if (p.phone && !/^\+?[0-9]{10,15}$/.test(p.phone))
        fail("شماره تماس معتبر نیست.");
      if (
        p.bloodType &&
        !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"].includes(
          p.bloodType,
        )
      )
        fail("گروه خونی معتبر نیست.");
      if (p.nationalId && !/^\d{10}$/.test(p.nationalId))
        fail("کد ملی باید ده رقم باشد.");
      if (
        p.emergencyContactPhone &&
        !/^\+?[0-9]{10,15}$/.test(p.emergencyContactPhone)
      )
        fail("شماره تماس اضطراری معتبر نیست.");
      if (
        p.birthDate &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) ||
          !validDate(p.birthDate) ||
          p.birthDate > new Date().toISOString().slice(0, 10))
      )
        fail("تاریخ تولد معتبر نیست.");
      const now = new Date().toISOString();
      const statements: Array<[string, unknown[]]> = [
        [
          "INSERT INTO user_profiles(user_id,data_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at",
          [u.id, JSON.stringify(p), now],
        ],
        [
          "UPDATE users SET display_name=?,phone=?,updated_at=? WHERE id=?",
          [
            p.displayName || u.display_name,
            (p.phone ?? u.phone) || null,
            now,
            u.id,
          ],
        ],
      ];
      if (u.role === "patient")
        statements.push([
          "INSERT INTO patient_profiles(user_id,national_id,birth_date,emergency_contact_json,allergies_json,medical_history_json) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET national_id=excluded.national_id,birth_date=excluded.birth_date,emergency_contact_json=excluded.emergency_contact_json,allergies_json=excluded.allergies_json,medical_history_json=excluded.medical_history_json",
          [
            u.id,
            p.nationalId || null,
            p.birthDate || null,
            JSON.stringify({
              contact: p.emergencyContact || "",
              name: p.emergencyContactName || "",
              relation: p.emergencyContactRelation || "",
              phone: p.emergencyContactPhone || "",
            }),
            JSON.stringify(
              String(p.allergies || "")
                .split(/[,،\n]/)
                .map((item) => item.trim())
                .filter(Boolean),
            ),
            JSON.stringify(
              String(p.medicalHistory || "")
                .split(/[,،\n]/)
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ],
        ]);
      if (u.role === "doctor")
        statements.push([
          "UPDATE doctor_profiles SET biography=? WHERE user_id=?",
          [p.biography || "", u.id],
        ]);
      await mutate(u.id, "update_profile", "user", u.id, statements);
      const verified =
        u.role === "doctor"
          ? await db
              .prepare(
                'SELECT specialty,license_number AS "licenseNumber" FROM doctor_profiles WHERE user_id=?',
              )
              .get(u.id)
          : {};
      res.json({
        profile: {
          ...p,
          ...verified,
          displayName: p.displayName || u.display_name,
          phone: p.phone ?? u.phone,
        },
      });
    } catch (e) {
      next(e);
    }
  };
  app.put("/api/profile", updateProfile);
  app.patch("/api/profile", updateProfile);
}
