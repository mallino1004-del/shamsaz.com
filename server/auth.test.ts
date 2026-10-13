import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import { createApp } from "./app.ts";
import { db, initializeDatabase } from "./db/index.ts";
let server: Server, base: string;
before(async () => {
  await initializeDatabase();
  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  await db.end();
});
async function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
test("complete patient profile, phone login, persistent session and one-use password recovery", async () => {
  const suffix = randomUUID(),
    email = `full-${suffix}@example.test`,
    phone = `091${String(Date.now()).slice(-8)}`;
  const body = {
    registrationVersion: 2,
    firstName: "Test",
    lastName: "Patient",
    email,
    phone,
    nationalId: String(Date.now()).slice(-10),
    birthDate: "1990-01-01",
    address: "Test address",
    password: " patient-password-2026 ",
    passwordConfirmation: " patient-password-2026 ",
    consent: true,
  };
  const invalid = await post("/api/auth/register", {
    ...body,
    passwordConfirmation: "different",
  });
  assert.equal(invalid.status, 422);
  const register = await post("/api/auth/register", body);
  assert.equal(register.status, 201);
  const a = await register.json();
  assert.equal(a.user.role, "patient");
  const profile = (
    await db.query("SELECT data_json FROM user_profiles WHERE user_id=$1", [
      a.user.id,
    ])
  ).rows[0].data_json;
  assert.equal(profile.firstName, "Test");
  assert.equal(profile.address, "Test address");
  const login = await post("/api/auth/login", {
    identifier: phone.replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[Number(x)]),
    password: body.password,
    rememberMe: true,
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie") ?? "", /Max-Age=2592000/);
  process.env.ENABLE_DEV_AUTH_INBOX = "true";
  process.env.APP_ORIGIN = base;
  const recovery = await post("/api/auth/forgot-password", { email });
  assert.equal(recovery.status, 200);
  const recoveryBody = await recovery.json();
  assert.equal(recoveryBody.deliveryMode, "development");
  const token = new URLSearchParams(
    recoveryBody.developmentResetUrl.split("?")[1],
  ).get("token");
  assert.equal(token?.length, 64);
  const stored = (
    await db.query(
      "SELECT token_hash FROM password_reset_tokens WHERE user_id=$1 AND used_at IS NULL",
      [a.user.id],
    )
  ).rows[0];
  assert.notEqual(stored.token_hash, token);
  const resetBody = {
    token,
    password: "replacement-password-2026",
    passwordConfirmation: "replacement-password-2026",
  };
  assert.equal((await post("/api/auth/reset-password", resetBody)).status, 200);
  assert.equal((await post("/api/auth/reset-password", resetBody)).status, 422);
  assert.equal(
    (await db.query("SELECT id FROM sessions WHERE user_id=$1", [a.user.id]))
      .rowCount,
    0,
  );
  assert.equal(
    (
      await post("/api/auth/login", {
        identifier: email,
        password: body.password,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await post("/api/auth/login", {
        identifier: email,
        password: resetBody.password,
      })
    ).status,
    200,
  );
});
test("staff signup grants no access before scoped administrator review", async () => {
  const suffix = randomUUID(),
    body = {
      registrationVersion: 2,
      firstName: "Test",
      lastName: "Doctor",
      email: `app-${suffix}@example.test`,
      phone: `092${String(Date.now()).slice(-8)}`,
      nationalId: String(Date.now() + 12).slice(-10),
      birthDate: "1985-01-01",
      password: "doctor-password-2026",
      confirmPassword: "doctor-password-2026",
      consent: true,
      requestedRole: "doctor",
      organizationId: "demo-clinic",
      professionalId: `license-${suffix}`,
      specialty: "Test oncology",
    };
  const registration = await post("/api/auth/register", body);
  assert.equal(registration.status, 201);
  assert.equal(registration.headers.get("set-cookie"), null);
  const application = await registration.json();
  assert.equal(application.user, null);
  assert.equal(application.application.status, "pending");
  assert.equal(
    (
      await post("/api/auth/login", {
        identifier: body.email,
        password: body.password,
      })
    ).status,
    403,
  );
  const patient = await post("/api/auth/login", {
    email: "patient@shamsaz.local",
    password: process.env.DEMO_PASSWORD,
  });
  const p = await patient.json();
  assert.equal(
    (
      await post(
        `/api/organization/signup-requests/${application.application.id}/review`,
        { decision: "approve" },
        {
          cookie: patient.headers.get("set-cookie")!.split(";")[0],
          "x-csrf-token": p.csrfToken,
        },
      )
    ).status,
    403,
  );
  const admin = await post("/api/auth/login", {
    email: "admin@shamsaz.local",
    password: process.env.DEMO_PASSWORD,
  });
  const a = await admin.json();
  const headers = {
    cookie: admin.headers.get("set-cookie")!.split(";")[0],
    "x-csrf-token": a.csrfToken,
  };
  const approved = await post(
    `/api/organization/signup-requests/${application.application.id}/review`,
    { decision: "approve" },
    headers,
  );
  assert.equal(approved.status, 200);
  assert.equal(
    (
      await post(
        `/api/organization/signup-requests/${application.application.id}/review`,
        { decision: "approve" },
        headers,
      )
    ).status,
    409,
  );
  const login = await post("/api/auth/login", {
    identifier: body.email,
    password: body.password,
  });
  assert.equal(login.status, 200);
  const account = await login.json();
  assert.equal(account.user.organizationId, "demo-clinic");
  const registeredProfile = (
    await db.query(
      "SELECT account_id,source_url FROM public_practitioners WHERE id=$1",
      [`registered-${account.user.id}`],
    )
  ).rows[0];
  assert.equal(registeredProfile.account_id, account.user.id);
  assert.equal(registeredProfile.source_url, null);
  assert.equal(
    (
      await db.query("SELECT specialty FROM doctor_profiles WHERE user_id=$1", [
        account.user.id,
      ])
    ).rows[0].specialty,
    body.specialty,
  );
});
