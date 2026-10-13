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
async function post(
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
async function login(email: string, password = process.env.DEMO_PASSWORD) {
  const r = await post("/api/auth/login", { email, password });
  assert.equal(r.status, 200);
  const a = await r.json();
  return {
    cookie: r.headers.get("set-cookie")!.split(";")[0],
    "x-csrf-token": a.csrfToken,
  };
}
test("registered staff automatically appear, preserve imported profiles, and exact doctor receives and confirms patient request", async () => {
  const initial = await (await fetch(base + "/api/practitioners")).json();
  assert.ok(
    initial.practitioners.some(
      (p: { id: string; accountId: string }) =>
        p.id === "registered-demo-doctor" && p.accountId === "demo-doctor",
    ),
  );
  const admin = await login("admin@shamsaz.local"),
    suffix = randomUUID(),
    email = `registered-${suffix}@example.test`,
    password = "registered-doctor-password";
  const provision = await post(
    "/api/organization/staff",
    {
      displayName: "Registered Fixture Doctor",
      email,
      password,
      role: "doctor",
      licenseNumber: `license-${suffix}`,
      specialty: "Gynecologic Oncology",
    },
    admin,
  );
  assert.equal(provision.status, 201);
  const doctorId = (await provision.json()).staff.id;
  const publicId = `registered-${doctorId}`,
    record = (
      await db.query("SELECT * FROM public_practitioners WHERE id=$1", [
        publicId,
      ])
    ).rows[0];
  assert.equal(record.account_id, doctorId);
  assert.equal(record.source_url, null);
  assert.equal(
    record.phone,
    (
      await db.query(
        "SELECT COALESCE(phone,'') AS phone FROM organizations WHERE id='demo-clinic'",
      )
    ).rows[0].phone,
  );
  const registered = await post("/api/auth/register", {
    email: `registered-patient-${suffix}@example.test`,
    password: "patient-password-2026",
    displayName: "Registered Patient",
  });
  assert.equal(registered.status, 201);
  const a = await registered.json(),
    patient = {
      cookie: registered.headers.get("set-cookie")!.split(";")[0],
      "x-csrf-token": a.csrfToken,
    };
  const date = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    booking = await post(
      `/api/practitioners/${publicId}/visit-requests`,
      {
        patientName: "Registered Patient",
        phone: "09121234567",
        preferredDate: date,
        preferredTime: "12:00",
        visitType: "in_person",
        reason: "Fixture consultation",
        consent: true,
      },
      patient,
    );
  assert.equal(booking.status, 201);
  const request = (await booking.json()).visitRequest;
  const doctor = await login(email, password),
    queue = await (
      await fetch(base + "/api/visit-requests", { headers: doctor })
    ).json();
  assert.ok(
    queue.visitRequests.some((r: { id: string }) => r.id === request.id),
  );
  const otherDoctor = await login("doctor@shamsaz.local");
  assert.equal(
    (
      await post(
        `/api/visit-requests/${request.id}`,
        { status: "confirmed" },
        otherDoctor,
        "PATCH",
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await post(
        `/api/visit-requests/${request.id}`,
        { status: "confirmed" },
        doctor,
        "PATCH",
      )
    ).status,
    200,
  );
  const patientQueue = await (
    await fetch(base + "/api/visit-requests", { headers: patient })
  ).json();
  assert.equal(
    patientQueue.visitRequests.find((r: { id: string }) => r.id === request.id)
      .status,
    "confirmed",
  );
  await db.query("UPDATE users SET status='disabled' WHERE id=$1", [doctorId]);
  const hidden = await (await fetch(base + "/api/practitioners")).json();
  assert.equal(
    hidden.practitioners.some((p: { id: string }) => p.id === publicId),
    false,
  );
  assert.equal(
    (
      await post(
        `/api/practitioners/${publicId}/visit-requests`,
        {
          patientName: "Patient",
          phone: "09121234567",
          preferredDate: date,
          preferredTime: "14:00",
          visitType: "in_person",
          consent: true,
        },
        patient,
      )
    ).status,
    404,
  );
});
test("registered sync publishes center contact only and preserves explicitly linked imported source metadata", async () => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const organization = randomUUID(),
      doctor = randomUUID(),
      imported = randomUUID(),
      category = randomUUID();
    await client.query(
      "INSERT INTO organizations(id,name,type,city,address) VALUES($1,'Fixture','clinic','Tehran','Public clinic address')",
      [organization],
    );
    await client.query(
      "INSERT INTO users(id,email,phone,password_hash,display_name,role,organization_id) VALUES($1,$2,'09129990001',$3,'Private contact doctor','doctor',$4)",
      [
        doctor,
        `private-${doctor}@example.test`,
        hashPassword("private-test-password"),
        organization,
      ],
    );
    await client.query(
      "INSERT INTO practitioner_categories(id,label) VALUES($1,$2)",
      [category, "Imported fixture"],
    );
    await client.query(
      "INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,source_url,source_checked_at,account_id) VALUES($1,'Original source name','Original specialty',$2,'Original city','https://example.test/original',CURRENT_TIMESTAMP,$3)",
      [imported, category, doctor],
    );
    await client.query(
      "INSERT INTO doctor_profiles(user_id,license_number,specialty) VALUES($1,$2,$3)",
      [doctor, randomUUID(), "Registered specialty"],
    );
    assert.equal(
      (
        await client.query("SELECT id FROM public_practitioners WHERE id=$1", [
          `registered-${doctor}`,
        ])
      ).rowCount,
      0,
    );
    const preserved = (
      await client.query(
        "SELECT display_name,source_url FROM public_practitioners WHERE id=$1",
        [imported],
      )
    ).rows[0];
    assert.equal(preserved.display_name, "Original source name");
    assert.equal(preserved.source_url, "https://example.test/original");
    await client.query(
      "UPDATE public_practitioners SET account_id=NULL WHERE id=$1",
      [imported],
    );
    await client.query("SELECT sync_registered_practitioner($1)", [doctor]);
    const registered = (
      await client.query(
        "SELECT phone,address FROM public_practitioners WHERE id=$1",
        [`registered-${doctor}`],
      )
    ).rows[0];
    assert.equal(registered.phone, "");
    assert.equal(registered.address, "Public clinic address");
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
});
