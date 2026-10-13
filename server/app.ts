import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { db, transaction } from "./db/index.ts";
import {
  ApiError,
  digest,
  safeEqual,
  userView,
  type Row,
} from "./modules/support.ts";
import { registerAuthRoutes } from "./modules/auth.ts";
import { registerProfileRoutes } from "./modules/profile.ts";
import { registerCareRoutes } from "./modules/care.ts";
import { registerChatRoutes } from "./modules/chat.ts";
import { registerOrganizationRoutes } from "./modules/organization.ts";
import { registerRegistryRoutes } from "./modules/registry.ts";
import { registerTumorBoardRoutes } from "./modules/tumor-board.ts";
import { registerPractitionerDirectoryRoutes } from "./modules/practitioner-directory.ts";
import { registerVisitRequestRoutes } from "./modules/visit-requests.ts";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.path.startsWith("/api/"))
      res.setHeader("Cache-Control", "no-store");
    next();
  });
  const attempts = new Map<string, { count: number; until: number }>();
  const limit = (key: string, max: number) => {
    const now = Date.now();
    if (attempts.size > 10000)
      for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    const item = attempts.get(key);
    if (!item || item.until < now) {
      attempts.set(key, { count: 1, until: now + 60000 });
      return;
    }
    if (++item.count > max)
      throw new ApiError(
        429,
        "RATE_LIMIT",
        "تعداد درخواست‌ها زیاد است؛ کمی بعد تلاش کنید.",
      );
  };
  app.use("/api", async (req, res, next) => {
    try {
      if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        const origin = req.get("origin");
        const expected =
          process.env.APP_ORIGIN ||
          process.env.RENDER_EXTERNAL_URL ||
          `${req.protocol}://${req.get("host")}`;
        if (origin && origin !== expected)
          throw new ApiError(403, "ORIGIN_REJECTED", "مبدأ درخواست مجاز نیست.");
        if (req.get("sec-fetch-site") === "cross-site")
          throw new ApiError(403, "ORIGIN_REJECTED", "درخواست مجاز نیست.");
      }
      const cookie = req.headers.cookie
        ?.split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith("shamsaz_session="))
        ?.slice(16);
      if (cookie && /^[a-f0-9]{64}$/.test(cookie)) {
        const session = (await db
          .prepare(
            "SELECT s.csrf_token,s.id AS session_id,u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status=?",
          )
          .get(digest(cookie), new Date().toISOString(), "active")) as
          | Row
          | undefined;
        if (session) res.locals.session = session;
      }
      const session = res.locals.session;
      if (
        session &&
        !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
        !req.path.startsWith("/auth/login") &&
        !req.path.startsWith("/auth/register")
      ) {
        if (!safeEqual(req.get("x-csrf-token") || "", session.csrf_token))
          throw new ApiError(
            403,
            "CSRF_REJECTED",
            "توکن امنیتی نامعتبر است. صفحه را تازه کنید.",
          );
      }
      next();
    } catch (e) {
      next(e);
    }
  });
  const requireUser = (res: express.Response): Row => {
    if (!res.locals.session)
      throw new ApiError(401, "UNAUTHENTICATED", "ابتدا وارد حساب شوید.");
    return res.locals.session;
  };
  const sessionResponse = async (res: express.Response, u: Row, rememberMe = false) => {
    const duration = (rememberMe ? 30 * 24 : 8) * 3600000;
    const token = randomBytes(32).toString("hex"),
      csrf = randomBytes(32).toString("hex"),
      now = new Date(),
      expires = new Date(now.getTime() + duration);
    await transaction(async (client) => {
      if (res.locals.session) await client.query('DELETE FROM sessions WHERE id=$1', [res.locals.session.session_id]);
      const id = randomUUID();
      await client.query(
        "INSERT INTO sessions(id,user_id,token_hash,csrf_token,expires_at,created_at) VALUES($1,$2,$3,$4,$5,$6)",
        [
          id,
          u.id,
          digest(token),
          csrf,
          expires.toISOString(),
          now.toISOString(),
        ],
      );
      await client.query(
        "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,$3,$4,$5)",
        [randomUUID(), u.id, "create_session", "session", id],
      );
      if (res.req.path === '/api/auth/login') await client.query("INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'login','user',$2)", [randomUUID(),u.id]);
    });
    res.cookie("shamsaz_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: duration,
      path: "/",
    });
    return { user: userView(u), csrfToken: csrf };
  };
  app.get("/api/health", async (_req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok", database: "postgresql" });
    } catch {
      res.status(503).json({ status: "unavailable", database: "postgresql" });
    }
  });
  registerAuthRoutes(app, { requireUser, sessionResponse, limit });
  registerPractitionerDirectoryRoutes(app);
  registerVisitRequestRoutes(app, { requireUser, limit });
  registerProfileRoutes(app, { requireUser, sessionResponse, limit });
  registerCareRoutes(app, { requireUser, sessionResponse, limit });
  registerChatRoutes(app, { requireUser, sessionResponse, limit });
  registerOrganizationRoutes(app, { requireUser });
  registerRegistryRoutes(app, { requireUser });
  registerTumorBoardRoutes(app, { requireUser });
  app.use("/api", (_req, res) =>
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "مسیر یافت نشد." } }),
  );
  app.use(
    (
      error: any,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (res.headersSent) return next(error);
      if (error instanceof ApiError)
        return res
          .status(error.status)
          .json({ error: { code: error.code, message: error.message } });
      if (error.code === "23514" || error.code === "22P02")
        return res.status(422).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات واردشده با ساختار معتبر سازگار نیست.",
          },
        });
      if (error.code === "23505" || error.code === "23P01")
        return res.status(409).json({
          error: {
            code: "CONFLICT",
            message: "این اطلاعات یا زمان قبلاً ثبت شده است.",
          },
        });
      if (error.type === "entity.too.large")
        return res.status(413).json({
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "حجم درخواست بیش از حد است.",
          },
        });
      if (error instanceof SyntaxError)
        return res.status(400).json({
          error: {
            code: "INVALID_JSON",
            message: "بدنه درخواست معتبر نیست.",
          },
        });
      console.error("API failure:", error?.code || error?.name || "unknown");
      return res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "خطای داخلی رخ داد." },
      });
    },
  );
  return app;
}
