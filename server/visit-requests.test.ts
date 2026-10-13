import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { db, initializeDatabase, hashPassword } from "./db/index.ts";
import { createApp } from "./app.ts";
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
async function request(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
  method = "POST",
) {
  return fetch(base + path, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
async function login(email: string) {
  const r = await request("/api/auth/login", {
    email,
    password: process.env.DEMO_PASSWORD,
  });
  assert.equal(r.status, 200);
  const a = await r.json();
  return {
    cookie: r.headers.get("set-cookie")!.split(";")[0],
    "x-csrf-token": a.csrfToken,
  };
}
test("public visit requests persist pending, require consent/CSRF, enforce ownership and real linked physician decisions", async () => {
  const id = randomUUID(),
    category = randomUUID();
  await db.query(
    "INSERT INTO practitioner_categories(id,label) VALUES($1,$2)",
    [category, "Visit fixture"],
  );
  await db.query(
    "INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,source_url,source_checked_at) VALUES($1,'Synthetic physician','Specialty',$2,'Tehran','https://example.test/source',CURRENT_TIMESTAMP)",
    [id, category],
  );
  const tomorrow = new Date(Date.now() + 2 * 86400000)
      .toISOString()
      .slice(0, 10),
    body = {
      patientName: "Test Patient",
      phone: "۰۹۱۲۱۲۳۴۵۶۷",
      preferredDate: tomorrow,
      preferredTime: "۱۴:۳۰",
      visitType: "in_person",
      reason: "Consultation",
      consent: true,
    },
    path = `/api/practitioners/${id}/visit-requests`;
  assert.equal((await request(path, body)).status, 401);
  const patient = await login("patient@shamsaz.local");
  assert.equal(
    (await request(path, body, { cookie: patient.cookie })).status,
    403,
  );
  for (const changes of [
    { consent: false },
    { preferredDate: "2026-02-31" },
    { preferredDate: "2000-01-01" },
    { preferredTime: "24:00" },
    { phone: "123" },
    { reason: "x".repeat(1001) },
    {
      preferredDate: new Date(Date.now() + 100 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
  ])
    assert.equal(
      (await request(path, { ...body, ...changes }, patient)).status,
      422,
    );
  const registered = await request("/api/auth/register", {
    email: `visit-${randomUUID()}@example.test`,
    password: "visit-test-password-2026",
    displayName: "Visit Patient",
  });
  assert.equal(registered.status, 201);
  const a = await registered.json(),
    headers = {
      cookie: registered.headers.get("set-cookie")!.split(";")[0],
      "x-csrf-token": a.csrfToken,
    };
  assert.equal(
    (await request("/api/practitioners/missing/visit-requests", body, headers))
      .status,
    404,
  );
  const created = await request(path, body, headers);
  assert.equal(created.status, 201);
  const r = (await created.json()).visitRequest;
  assert.equal(r.status, "pending");
  assert.equal(r.phone, "09121234567");
  assert.equal(r.preferredTime, "14:30");
  assert.match(r.reference, /^SH-[A-F0-9]{12}$/);
  const row = (
    await db.query(
      "SELECT preferred_at,consent_version FROM public_visit_requests WHERE id=$1",
      [r.id],
    )
  ).rows[0];
  assert.equal(
    new Date(row.preferred_at).toISOString(),
    `${tomorrow}T11:00:00.000Z`,
  );
  assert.equal(row.consent_version, "public-visit-request-v1");
  assert.equal((await request(path, body, headers)).status, 409);
  const listed = await (
    await fetch(base + "/api/visit-requests", { headers })
  ).json();
  assert.ok(listed.visitRequests.some((v: { id: string }) => v.id === r.id));
  const other = await (
    await fetch(base + "/api/visit-requests", { headers: patient })
  ).json();
  assert.equal(
    other.visitRequests.some((v: { id: string }) => v.id === r.id),
    false,
  );
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "cancelled" },
        patient,
        "PATCH",
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "confirmed" },
        headers,
        "PATCH",
      )
    ).status,
    403,
  );
  const fixtureDoctor = randomUUID(), fixtureEmail = `visit-doctor-${fixtureDoctor}@example.test`;
  await db.query("INSERT INTO users(id,email,password_hash,display_name,role,organization_id) VALUES($1,$2,$3,'Visit fixture doctor','doctor','demo-clinic')", [fixtureDoctor,fixtureEmail,hashPassword(process.env.DEMO_PASSWORD!)]);
  const doctor = await login(fixtureEmail);
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "confirmed" },
        doctor,
        "PATCH",
      )
    ).status,
    404,
  );
  await db.query("UPDATE public_practitioners SET account_id=$1 WHERE id=$2", [
    fixtureDoctor,
    id,
  ]);
  const physicianList = await (
    await fetch(base + "/api/visit-requests", { headers: doctor })
  ).json();
  assert.ok(
    physicianList.visitRequests.some((v: { id: string }) => v.id === r.id),
  );
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "confirmed" },
        doctor,
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "cancelled" },
        headers,
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        `/api/visit-requests/${r.id}`,
        { status: "cancelled" },
        headers,
        "PATCH",
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await db.query(
        "SELECT id FROM audit_events WHERE entity_type='public_visit_request' AND entity_id=$1",
        [r.id],
      )
    ).rowCount,
    3,
  );
  assert.equal(
    (await db.query("SELECT id FROM appointments WHERE id=$1", [r.id]))
      .rowCount,
    0,
  );
});
