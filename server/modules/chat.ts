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
  json,
  type Row,
} from "./support.ts";

export function registerChatRoutes(
  app: express.Express,
  context: {
    requireUser: (res: express.Response) => Row;
    sessionResponse: (res: express.Response, u: Row) => Promise<unknown>;
    limit: (key: string, max: number) => void;
  },
) {
  const { requireUser, sessionResponse, limit } = context;
  app.post("/api/chat", async (req, res, next) => {
    try {
      const u = requireUser(res);
      limit(`chat:${u.id}`, 10);
      const messages = req.body?.messages;
      if (
        !Array.isArray(messages) ||
        messages.length < 1 ||
        messages.length > 20
      )
        fail("تاریخچه گفتگو معتبر نیست.");
      const contents = messages.map((m: Row) => {
        if (
          !m ||
          typeof m !== "object" ||
          Array.isArray(m) ||
          !["user", "assistant", "bot"].includes(m.sender)
        )
          fail("ساختار پیام گفتگو معتبر نیست.");
        return {
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: string(m.text, "پیام", 1, 2000) }],
        };
      });
      if (req.body.consent !== true)
        return res.json({
          fallback: true,
          message:
            "برای ارسال اطلاعات به سرویس هوش مصنوعی، رضایت صریح لازم است.",
        });
      const key = process.env.GEMINI_API_KEY;
      if (!key || key === "MY_GEMINI_API_KEY")
        return res.json({
          fallback: true,
          message: "سرویس هوش مصنوعی پیکربندی نشده است.",
        });
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction:
            "به فارسی، اطلاعات آموزشی عمومی سلامت ارائه کن. تشخیص قطعی، نسخه یا درصد بقا ارائه نکن. روشن کن که پاسخ جایگزین ارزیابی پزشک نیست.",
          temperature: 0.3,
        },
      });
      res.json({ text: response.text });
    } catch (e) {
      if (e instanceof ApiError) next(e);
      else
        res
          .status(503)
          .json({
            fallback: true,
            error: {
              code: "AI_UNAVAILABLE",
              message: "سرویس پاسخ‌گویی اکنون در دسترس نیست.",
            },
          });
    }
  });
}
