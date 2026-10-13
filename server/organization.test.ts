import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createApp } from "./app.ts";
import { db, initializeDatabase } from "./db/index.ts";
let server: Server, base: string;
before(async () => {
  await initializeDatabase();
  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Address unavailable");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  await db.end();
});
async function login(email: string) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: process.env.DEMO_PASSWORD }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  return {
    cookie: response.headers.get("set-cookie")!.split(";")[0],
    "x-csrf-token": result.csrfToken,
    "content-type": "application/json",
  };
}
test("organization APIs enforce role, center boundaries and trusted staff provisioning", async (context) => {
  if (process.env.ENABLE_DEMO_SEED !== "true")
    return context.skip("Explicit synthetic seed required");
  const patientHeaders = await login("patient@shamsaz.local");
  const denied = await fetch(`${base}/api/organization`, {
    headers: patientHeaders,
  });
  assert.equal(denied.status, 403);
  const headers = await login("admin@shamsaz.local");
  const center = await fetch(`${base}/api/organization`, { headers });
  assert.equal(center.status, 200);
  assert.equal((await center.json()).organization.id, "demo-clinic");
  const unauthorizedRole = await fetch(`${base}/api/organization/staff`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: "bad@example.test",
      displayName: "Test",
      role: "national_supervisor",
      password: "Test-password-2026!",
    }),
  });
  assert.equal(unauthorizedRole.status, 422);
  const suffix = crypto.randomUUID();
  const provision = await fetch(`${base}/api/organization/staff`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: `staff-${suffix}@example.test`,
      displayName: "Synthetic Test Clinician",
      role: "doctor",
      password: "Test-password-2026!",
      specialty: "Test specialty",
      licenseNumber: `TEST-${suffix}`,
    }),
  });
  assert.equal(provision.status, 201);
  const staff = (await provision.json()).staff;
  try {
    const row = (
      await db.query(
        "SELECT organization_id,password_hash FROM users WHERE id=$1",
        [staff.id],
      )
    ).rows[0];
    assert.equal(row.organization_id, "demo-clinic");
    assert.match(row.password_hash, /^scrypt\$/);
    const audit = await db.query(
      "SELECT id FROM audit_events WHERE entity_id=$1 AND action='provision_staff'",
      [staff.id],
    );
    assert.equal(audit.rowCount, 1);
    const slots = await fetch(`${base}/api/organization/slots`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        doctorId: staff.id,
        startsAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        endsAt: new Date(Date.now() + 49 * 3600000).toISOString(),
      }),
    });
    assert.equal(slots.status, 201);
    const badDoctor = await fetch(`${base}/api/organization/slots`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        doctorId: "demo-patient",
        startsAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        endsAt: new Date(Date.now() + 49 * 3600000).toISOString(),
      }),
    });
    assert.equal(badDoctor.status, 403);
  } finally {
    await db.query("UPDATE users SET status='disabled' WHERE id=$1", [
      staff.id,
    ]);
  }
});
