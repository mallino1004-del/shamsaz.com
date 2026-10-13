import type express from "express";
import { randomUUID } from "node:crypto";
import { db, transaction } from "../db/index.ts";
import { ApiError, fail, string, mutate, type Row } from "./support.ts";

export function registerTumorBoardRoutes(
  app: express.Express,
  context: { requireUser: (res: express.Response) => Row },
) {
  const userFor = (res: express.Response, write = false) => {
    const user = context.requireUser(res);
    if (
      !user.organization_id ||
      !(
        write ? ["doctor"] : ["doctor", "registry_clerk", "clinic_admin"]
      ).includes(user.role)
    )
      throw new ApiError(403, "FORBIDDEN", "دسترسی جلسه در مرکز مجاز نیست.");
    return user;
  };
  const boardFor = async (user: Row, id: string) => {
    const board = await db
      .prepare(
        'SELECT id,title,scheduled_at AS "scheduledAt",status FROM tumor_boards WHERE id=? AND organization_id=?',
      )
      .get(id, user.organization_id);
    if (!board)
      throw new ApiError(404, "NOT_FOUND", "جلسه در مرکز شما یافت نشد.");
    return board;
  };
  app.get("/api/tumor-boards", async (_req, res, next) => {
    try {
      const user = userFor(res);
      res.json({
        boards: await db
          .prepare(
            'SELECT id,title,scheduled_at AS "scheduledAt",status FROM tumor_boards WHERE organization_id=? ORDER BY scheduled_at DESC LIMIT 100',
          )
          .all(user.organization_id),
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/tumor-boards", async (req, res, next) => {
    try {
      const user = userFor(res, true),
        title = string(req.body?.title, "عنوان", 3, 200),
        date = string(req.body?.scheduledAt, "زمان", 10, 40);
      if (
        !Number.isFinite(Date.parse(date)) ||
        Date.parse(date) < Date.now() ||
        Date.parse(date) > Date.now() + 365 * 86400000
      )
        fail("جلسه را در یک سال آینده تنظیم کنید.");
      const id = randomUUID(),
        scheduledAt = new Date(date).toISOString();
      await mutate(user.id, "create_tumor_board", "tumor_board", id, [
        [
          "INSERT INTO tumor_boards(id,organization_id,title,scheduled_at,created_by) VALUES(?,?,?,?,?)",
          [id, user.organization_id, title, scheduledAt, user.id],
        ],
        [
          "INSERT INTO tumor_board_participants(board_id,user_id) VALUES(?,?)",
          [id, user.id],
        ],
      ]);
      res
        .status(201)
        .json({ board: { id, title, scheduledAt, status: "scheduled" } });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/tumor-boards/:id", async (req, res, next) => {
    try {
      const user = userFor(res),
        board = await boardFor(user, req.params.id);
      const cases = await db
        .prepare(
          'SELECT t.id,t.registry_case_id AS "registryCaseId",t.summary,t.decision,t.decided_at AS "decidedAt",r.cancer_site AS "cancerSite",r.stage FROM tumor_board_cases t JOIN registry_cases r ON r.id=t.registry_case_id WHERE t.board_id=? AND r.organization_id=? ORDER BY t.id',
        )
        .all(board.id, user.organization_id);
      res.json({ board, cases });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/tumor-boards/:id/cases", async (req, res, next) => {
    try {
      const user = userFor(res, true),
        board = await boardFor(user, req.params.id),
        registryCaseId = string(req.body?.registryCaseId, "پرونده", 1, 100),
        summary = string(req.body?.summary, "خلاصه", 3, 5000),
        id = randomUUID();
      if (board.status !== "scheduled")
        throw new ApiError(409, "CLOSED_BOARD", "جلسه بسته شده است.");
      if (
        !(await db
          .prepare(
            "SELECT id FROM registry_cases WHERE id=? AND organization_id=?",
          )
          .get(registryCaseId, user.organization_id))
      )
        throw new ApiError(404, "NOT_FOUND", "پرونده در مرکز یافت نشد.");
      await mutate(user.id, "link_tumor_case", "tumor_board_case", id, [
        [
          "INSERT INTO tumor_board_cases(id,board_id,registry_case_id,summary) VALUES(?,?,?,?)",
          [id, board.id, registryCaseId, summary],
        ],
      ]);
      res
        .status(201)
        .json({ case: { id, registryCaseId, summary, decision: null } });
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/api/tumor-boards/:id/cases/:caseId/decision",
    async (req, res, next) => {
      try {
        const user = userFor(res, true),
          board = await boardFor(user, req.params.id),
          decision = string(req.body?.decision, "تصمیم", 3, 10000);
        if (board.status !== "scheduled")
          throw new ApiError(409, "CLOSED_BOARD", "جلسه بسته شده است.");
        const decidedAt = new Date().toISOString();
        await transaction(async (client) => {
          const row = (
            await client.query(
              "SELECT id,decision FROM tumor_board_cases WHERE id=$1 AND board_id=$2 FOR UPDATE",
              [req.params.caseId, board.id],
            )
          ).rows[0];
          if (!row) throw new ApiError(404, "NOT_FOUND", "مورد جلسه یافت نشد.");
          if (row.decision)
            throw new ApiError(
              409,
              "DECISION_EXISTS",
              "تصمیم قبلاً ثبت شده است؛ اصلاح رسمی نیازمند گردش‌کار جداگانه است.",
            );
          await client.query(
            "UPDATE tumor_board_cases SET decision=$1,decided_at=$2 WHERE id=$3",
            [decision, decidedAt, row.id],
          );
          await client.query(
            "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4,$5)",
            [
              randomUUID(),
              user.id,
              "record_board_decision",
              "tumor_board_case",
              row.id,
            ],
          );
        });
        res
          .status(201)
          .json({
            decision: { caseId: req.params.caseId, decision, decidedAt },
          });
      } catch (error) {
        next(error);
      }
    },
  );
}
