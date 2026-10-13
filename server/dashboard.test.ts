import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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
  const auth = await response.json();
  return {
    cookie: response.headers.get("set-cookie")!.split(";")[0],
    "content-type": "application/json",
    "x-csrf-token": auth.csrfToken,
  };
}

test("appointment grants doctor patient access without enrolling the patient in registry", async () => {
  const headers = await login("doctor@shamsaz.local");
  const signup = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      displayName: "Synthetic unassigned patient",
      email: `intake-${randomUUID()}@example.test`,
      password: "intake-patient-2026",
    }),
  });
  assert.equal(signup.status, 201);
  const auth = await signup.json();
  const patientHeaders = {
    cookie: signup.headers.get("set-cookie")!.split(";")[0],
    "content-type": "application/json",
    "x-csrf-token": auth.csrfToken,
  };
  const slot = (
    await (await fetch(`${base}/api/doctors/demo-doctor/slots`)).json()
  ).slots.at(-1);
  assert.ok(slot);
  const booking = await fetch(`${base}/api/appointments`, {
    method: "POST",
    headers: patientHeaders,
    body: JSON.stringify({
      doctorId: "demo-doctor",
      scheduledAt: slot.startsAt,
      type: "in_person",
      reason: "Synthetic new patient appointment",
    }),
  });
  assert.equal(booking.status, 201);
  const appointment = (await booking.json()).appointment;
  const patients = (
    await (await fetch(`${base}/api/patients`, { headers })).json()
  ).patients;
  assert.equal(
    patients.find((p: { id: string }) => p.id === auth.user.id)?.organizationId,
    null,
  );
  const registryPatients = (
    await (
      await fetch(`${base}/api/patients`, {
        headers: await login("registry@shamsaz.local"),
      })
    ).json()
  ).patients;
  assert.equal(
    registryPatients.some((p: { id: string }) => p.id === auth.user.id),
    false,
  );
  const cancelled = await fetch(`${base}/api/appointments/${appointment.id}`, {
    method: "PATCH",
    headers: patientHeaders,
    body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(cancelled.status, 200);
  const remaining = (
    await (await fetch(`${base}/api/patients`, { headers })).json()
  ).patients;
  assert.equal(
    remaining.some((p: { id: string }) => p.id === auth.user.id),
    false,
  );
});

test("dashboard persists multi-item prescriptions and validates structured pathology biomarkers", async (context) => {
  if (process.env.ENABLE_DEMO_SEED !== "true")
    return context.skip("Synthetic fixtures required");
  const headers = await login("doctor@shamsaz.local");
  const items = ["Synthetic Medicine A", "Synthetic Medicine B"].map(
    (medicationName) => ({
      medicationName,
      dose: "1 unit",
      route: "oral",
      frequency: "daily",
      durationDays: 7,
      instructions: "Synthetic test only",
    }),
  );
  const prescription = await fetch(`${base}/api/prescriptions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ patientId: "demo-patient", items }),
  });
  assert.equal(prescription.status, 201);
  const created = (await prescription.json()).prescription;
  const patientHeaders = await login("patient@shamsaz.local");
  const history = await fetch(`${base}/api/prescriptions`, {
    headers: patientHeaders,
  });
  const stored = (await history.json()).prescriptions.find(
    (item: { id: string }) => item.id === created.id,
  );
  assert.equal(stored.items.length, 2);
  assert.deepEqual(
    stored.items
      .map((item: { medicationName: string }) => item.medicationName)
      .sort(),
    items.map((item) => item.medicationName).sort(),
  );
  const registry = await fetch(`${base}/api/registry`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      patientId: "demo-patient",
      cancerSite: "breast",
      stage: "I",
      diagnosisDate: "2026-01-01",
      consent: true,
    }),
  });
  assert.equal(registry.status, 201);
  const registryId = (await registry.json()).registryCase.id;
  const pathology = {
    specimenType: "Synthetic biopsy",
    reportedAt: "2026-02-01",
    collectedAt: "2026-01-31",
    findings: "Synthetic laboratory findings",
    er: "positive",
    erPercent: 90,
    ki67Percent: 12.5,
    her2: "1+",
    laboratory: "Synthetic laboratory",
    reportNumber: "TEST-01",
  };
  const invalid = await fetch(`${base}/api/registry/${registryId}/pathology`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...pathology, ki67Percent: 101 }),
  });
  assert.equal(invalid.status, 422);
  const valid = await fetch(`${base}/api/registry/${registryId}/pathology`, {
    method: "POST",
    headers,
    body: JSON.stringify(pathology),
  });
  assert.equal(valid.status, 201);
  const reread = await fetch(`${base}/api/registry/${registryId}/details`, {
    headers,
  });
  const report = (await reread.json()).pathologyReports[0];
  assert.equal(report.findings.biomarkers.ki67Percent, 12.5);
  assert.equal(report.findings.biomarkers.erPercent, 90);
  assert.equal(report.findings.laboratory, "Synthetic laboratory");
  assert.equal(report.findings.biomarkers.pr, null);
  const forbidden = await fetch(`${base}/api/registry/${registryId}/details`, {
    headers: patientHeaders,
  });
  assert.equal(forbidden.status, 403);
});
