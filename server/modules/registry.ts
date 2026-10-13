import type express from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.ts";
import {
  ApiError,
  fail,
  string,
  optional,
  mutate,
  validDate,
  json,
  type Row,
} from "./support.ts";

export function registerRegistryRoutes(
  app: express.Express,
  context: { requireUser: (res: express.Response) => Row },
) {
  const access = async (
    res: express.Response,
    id: string,
    doctorOnly = false,
  ) => {
    const user = context.requireUser(res);
    if (
      !user.organization_id ||
      !(
        doctorOnly ? ["doctor"] : ["doctor", "registry_clerk", "clinic_admin"]
      ).includes(user.role)
    )
      throw new ApiError(403, "FORBIDDEN", "دسترسی مرکز مجاز نیست.");
    const registryCase = await db
      .prepare("SELECT * FROM registry_cases WHERE id=? AND organization_id=?")
      .get(id, user.organization_id);
    if (!registryCase)
      throw new ApiError(404, "NOT_FOUND", "پرونده در مرکز شما یافت نشد.");
    return { user, registryCase };
  };
  const date = (value: unknown, name: string) => {
    const text = string(value, name, 10, 40);
    if (
      !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(text) ||
      !validDate(text) ||
      !Number.isFinite(Date.parse(text))
    )
      fail("تاریخ معتبر وارد کنید.");
    return new Date(text).toISOString();
  };
  app.get("/api/registry/:id/details", async (req, res, next) => {
    try {
      const { registryCase } = await access(res, req.params.id);
      const pathologyReports = await db
        .prepare(
          'SELECT id,specimen_type AS "specimenType",collected_at AS "collectedAt",reported_at AS "reportedAt",morphology_code AS "morphologyCode",grade,findings_json AS findings FROM pathology_reports WHERE registry_case_id=? ORDER BY reported_at DESC',
        )
        .all(registryCase.id);
      const treatments = await db
        .prepare(
          'SELECT id,type,regimen,starts_at AS "startsAt",ends_at AS "endsAt",status FROM treatments WHERE registry_case_id=? ORDER BY starts_at DESC',
        )
        .all(registryCase.id);
      res.json({
        registryCase: {
          ...json(registryCase.payload_json),
          id: registryCase.id,
          patientId: registryCase.patient_id,
          status: registryCase.status,
        },
        pathologyReports,
        treatments,
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/registry/:id/pathology", async (req, res, next) => {
    try {
      const { user, registryCase } = await access(res, req.params.id),
        body = req.body || {},
        id = randomUUID();
      const specimenType = string(body.specimenType, "نمونه", 2, 200),
        reportedAt = date(body.reportedAt, "تاریخ گزارش"),
        collectedAt = body.collectedAt
          ? date(body.collectedAt, "تاریخ نمونه")
          : null;
      if (
        reportedAt > new Date().toISOString() ||
        (collectedAt && collectedAt > reportedAt)
      )
        fail("ترتیب تاریخ نمونه و گزارش معتبر نیست.");
      const morphologyCode = optional(body, "morphologyCode", 20) || null,
        grade = optional(body, "grade", 40) || null,
        findings = string(body.findings, "یافته‌ها", 3, 10000);
      if (morphologyCode && !/^\d{4}\/[0-9]$/.test(morphologyCode))
        fail("کد مورفولوژی معتبر نیست.");
      const biomarkers: Row = {};
      for (const key of ["er", "pr", "her2", "p53", "mmr", "brca", "hpv"])
        biomarkers[key] = optional(body, key, 100) || null;
      for (const key of ["erPercent", "prPercent", "ki67Percent"]) {
        const value = body[key];
        if (value === undefined || value === "" || value === null)
          biomarkers[key] = null;
        else {
          const percentage = Number(value);
          if (
            !Number.isFinite(percentage) ||
            percentage < 0 ||
            percentage > 100
          )
            fail("درصد نشانگر باید بین صفر و صد باشد.");
          biomarkers[key] = percentage;
        }
      }
      const structuredFindings = {
        text: findings,
        biomarkers,
        laboratory: optional(body, "laboratory", 200) || null,
        reportNumber: optional(body, "reportNumber", 100) || null,
        histology: optional(body, "histology", 500) || null,
        margins: optional(body, "margins", 500) || null,
        lymphNodes: optional(body, "lymphNodes", 500) || null,
      };
      await mutate(user.id, "create_pathology", "pathology", id, [
        [
          "INSERT INTO pathology_reports(id,registry_case_id,specimen_type,collected_at,reported_at,morphology_code,grade,findings_json,recorded_by) VALUES(?,?,?,?,?,?,?,?,?)",
          [
            id,
            registryCase.id,
            specimenType,
            collectedAt,
            reportedAt,
            morphologyCode,
            grade,
            JSON.stringify(structuredFindings),
            user.id,
          ],
        ],
      ]);
      res.status(201).json({
        pathologyReport: {
          id,
          specimenType,
          collectedAt,
          reportedAt,
          morphologyCode,
          grade,
          findings: structuredFindings,
        },
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/registry/:id/treatments", async (req, res, next) => {
    try {
      const { user, registryCase } = await access(res, req.params.id, true),
        body = req.body || {},
        id = randomUUID(),
        type = string(body.type, "درمان", 2, 40),
        regimen = string(body.regimen, "رژیم درمان", 3, 3000),
        startsAt = date(body.startsAt, "شروع"),
        endsAt = body.endsAt ? date(body.endsAt, "پایان") : null,
        status = string(body.status, "وضعیت", 2, 40);
      if (
        ![
          "surgery",
          "chemotherapy",
          "radiotherapy",
          "immunotherapy",
          "hormonal",
          "targeted",
          "supportive",
          "other",
        ].includes(type) ||
        !["planned", "active", "completed", "stopped"].includes(status) ||
        (endsAt && endsAt < startsAt)
      )
        fail("نوع، وضعیت یا بازه درمان معتبر نیست.");
      await mutate(user.id, "create_treatment", "treatment", id, [
        [
          "INSERT INTO treatments(id,registry_case_id,type,regimen,starts_at,ends_at,status,recorded_by) VALUES(?,?,?,?,?,?,?,?)",
          [
            id,
            registryCase.id,
            type,
            regimen,
            startsAt,
            endsAt,
            status,
            user.id,
          ],
        ],
      ]);
      res
        .status(201)
        .json({ treatment: { id, type, regimen, startsAt, endsAt, status } });
    } catch (error) {
      next(error);
    }
  });
}
