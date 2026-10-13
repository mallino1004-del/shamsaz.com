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
    throw new Error("Server address unavailable");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  await db.end();
});
test("anonymous access, patient registration role, csrf and ownership", async () => {
  const anonymous = await fetch(`${base}/api/dashboard`);
  assert.equal(anonymous.status, 401);
  const email = `test-${Date.now()}@example.test`;
  const registration = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password: "test-password-strong-2026",
      displayName: "Test Patient",
      role: "clinic_admin",
    }),
  });
  assert.equal(registration.status, 201);
  const auth = await registration.json();
  assert.equal(auth.user.role, "patient");
  const cookie = registration.headers.get("set-cookie")!.split(";")[0];
  assert.match(registration.headers.get("set-cookie")!, /HttpOnly/);
  try {
    const csrf = await fetch(`${base}/api/profile`, {
      method: "PUT",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ displayName: "Bad Update" }),
    });
    assert.equal(csrf.status, 403);
    const unicodeCsrf = await fetch(`${base}/api/profile`, {
      method: "PUT",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-csrf-token": "é".repeat(64),
      },
      body: JSON.stringify({ displayName: "Bad Update" }),
    });
    assert.equal(unicodeCsrf.status, 403);
    const invalidBirthday = await fetch(`${base}/api/profile`, {
      method: "PUT",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-csrf-token": auth.csrfToken,
      },
      body: JSON.stringify({ birthDate: "2026-02-31" }),
    });
    assert.equal(invalidBirthday.status, 422);
    const malformedChat = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-csrf-token": auth.csrfToken,
      },
      body: JSON.stringify({ messages: [null], consent: true }),
    });
    assert.equal(malformedChat.status, 422);
    const forbidden = await fetch(`${base}/api/registry`, {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-csrf-token": auth.csrfToken,
      },
      body: JSON.stringify({ patientId: "demo-patient" }),
    });
    assert.equal(forbidden.status, 403);
    const update = await fetch(`${base}/api/profile`, {
      method: "PUT",
      headers: {
        cookie,
        "content-type": "application/json",
        "x-csrf-token": auth.csrfToken,
      },
      body: JSON.stringify({
        displayName: "Updated Patient",
        allergies: "penicillin, latex",
        medicalHistory: "self-reported history",
        emergencyContactName: "Synthetic contact",
        emergencyContactPhone: "09120000000",
        licenseNumber: "FAKE",
      }),
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).profile.licenseNumber, undefined);
    const me = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
    assert.equal((await me.json()).user.displayName, "Updated Patient");
    const clinicalProfile = (
      await db.query(
        "SELECT allergies_json,emergency_contact_json FROM patient_profiles WHERE user_id=$1",
        [auth.user.id],
      )
    ).rows[0];
    assert.deepEqual(clinicalProfile.allergies_json, ["penicillin", "latex"]);
    assert.equal(clinicalProfile.emergency_contact_json.phone, "09120000000");
    const crossOrigin = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password: "test-password-strong-2026" }),
    });
    assert.equal(crossOrigin.status, 403);
    const logout = await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers: { cookie, "x-csrf-token": auth.csrfToken },
    });
    assert.equal(logout.status, 200);
    const expired = await fetch(`${base}/api/dashboard`, {
      headers: { cookie },
    });
    assert.equal(expired.status, 401);
  } finally {
    await db.query("UPDATE users SET status='disabled' WHERE id=$1", [
      auth.user.id,
    ]);
  }
});
test("demo clinician and supervisor permissions with actual database", async () => {
  if (process.env.ENABLE_DEMO_SEED !== "true") return;
  async function login(email: string) {
    const r = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: process.env.DEMO_PASSWORD }),
    });
    assert.equal(r.status, 200);
    return {
      cookie: r.headers.get("set-cookie")!.split(";")[0],
      ...(await r.json()),
    };
  }
  const doctor = await login("doctor@shamsaz.local"),
    headers = {
      cookie: doctor.cookie,
      "content-type": "application/json",
      "x-csrf-token": doctor.csrfToken,
    };
  const patients = await fetch(`${base}/api/patients`, { headers });
  assert.equal(patients.status, 200);
  assert.ok(
    (await patients.json()).patients.some((p: any) => p.id === "demo-patient"),
  );
  const denied = await fetch(`${base}/api/encounters`, {
    method: "POST",
    headers,
    body: JSON.stringify({ patientId: "missing-patient" }),
  });
  assert.equal(denied.status, 403);
  const invalidItem = await fetch(`${base}/api/prescriptions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ patientId: "demo-patient", items: [null] }),
  });
  assert.equal(invalidItem.status, 422);
  const encounter = await fetch(`${base}/api/encounters`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      patientId: "demo-patient",
      chiefComplaint: "Test complaint",
      subjective: "Test history",
      objective: "Test examination",
      assessment: "Test assessment",
      plan: "Test care plan",
    }),
  });
  assert.equal(encounter.status, 201);
  assert.equal((await encounter.json()).encounter.status, "draft");
  const supervisor = await login("supervisor@shamsaz.local"),
    dashboard = await fetch(`${base}/api/dashboard`, {
      headers: { cookie: supervisor.cookie },
    });
  const body = await dashboard.json();
  assert.deepEqual(body.appointments, []);
  assert.deepEqual(body.registryCases, []);
  assert.equal(typeof body.summary.appointments, "number");
  const patient = await login("patient@shamsaz.local"),
    patientHeaders = {
      cookie: patient.cookie,
      "content-type": "application/json",
      "x-csrf-token": patient.csrfToken,
    };
  const slots = await (
    await fetch(`${base}/api/doctors/demo-doctor/slots`)
  ).json();
  assert.ok(slots.slots.length > 0);
  const booking = {
    doctorId: "demo-doctor",
    scheduledAt: slots.slots[0].startsAt,
    type: "in_person",
    reason: "Synthetic appointment integration test",
  };
  const booked = await fetch(`${base}/api/appointments`, {
    method: "POST",
    headers: patientHeaders,
    body: JSON.stringify(booking),
  });
  assert.equal(booked.status, 201);
  const appointment = (await booked.json()).appointment;
  const persistedAppointment = await db
    .prepare("SELECT ends_at FROM appointments WHERE id=?")
    .get(appointment.id);
  assert.equal(
    new Date(persistedAppointment.ends_at).toISOString(),
    slots.slots[0].endsAt,
  );
  const duplicate = await fetch(`${base}/api/appointments`, {
    method: "POST",
    headers: patientHeaders,
    body: JSON.stringify(booking),
  });
  assert.equal(duplicate.status, 409);
  const cancel = await fetch(`${base}/api/appointments/${appointment.id}`, {
    method: "PATCH",
    headers: patientHeaders,
    body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(cancel.status, 200);
  const reopen = await fetch(`${base}/api/appointments/${appointment.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "confirmed" }),
  });
  assert.equal(reopen.status, 409);
  const screening = await fetch(`${base}/api/screenings`, {
    method: "POST",
    headers: patientHeaders,
    body: JSON.stringify({
      symptoms: ["Synthetic reported symptom"],
      consent: true,
    }),
  });
  assert.equal(screening.status, 201);
  assert.equal((await screening.json()).screening.triageLevel, "unassessed");
  const registryResponse = await fetch(`${base}/api/registry`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      patientId: "demo-patient",
      cancerSite: "Synthetic breast registry case",
      stage: "I",
      diagnosisDate: "2026-01-01",
      consent: true,
    }),
  });
  assert.equal(registryResponse.status, 201);
  const registryCase = (await registryResponse.json()).registryCase;
  const doctorDashboard = await (
    await fetch(`${base}/api/dashboard`, { headers })
  ).json();
  assert.ok(
    doctorDashboard.registryCases.some(
      (item: { id: string }) => item.id === registryCase.id,
    ),
  );
  const pathology = await fetch(
    `${base}/api/registry/${registryCase.id}/pathology`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        specimenType: "Synthetic biopsy",
        reportedAt: "2026-01-02",
        findings: "Synthetic findings for integration testing",
      }),
    },
  );
  assert.equal(pathology.status, 201);
  const invalidReportDate = await fetch(
    `${base}/api/registry/${registryCase.id}/pathology`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        specimenType: "Synthetic biopsy",
        reportedAt: "2026-02-31",
        findings: "Synthetic invalid report date",
      }),
    },
  );
  assert.equal(invalidReportDate.status, 422);
  const treatment = await fetch(
    `${base}/api/registry/${registryCase.id}/treatments`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "supportive",
        regimen: "Synthetic supportive plan",
        startsAt: "2026-01-03",
        status: "planned",
      }),
    },
  );
  assert.equal(treatment.status, 201);
  const details = await (
    await fetch(`${base}/api/registry/${registryCase.id}/details`, { headers })
  ).json();
  assert.equal(details.pathologyReports.length, 1);
  assert.equal(details.treatments.length, 1);
  const patientRegistry = await fetch(
    `${base}/api/registry/${registryCase.id}/details`,
    { headers: patientHeaders },
  );
  assert.equal(patientRegistry.status, 403);
  const boardResponse = await fetch(`${base}/api/tumor-boards`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "Synthetic integration board",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  assert.equal(boardResponse.status, 201);
  const board = (await boardResponse.json()).board;
  const linked = await fetch(`${base}/api/tumor-boards/${board.id}/cases`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      registryCaseId: registryCase.id,
      summary: "Synthetic case summary",
    }),
  });
  assert.equal(linked.status, 201);
  const boardCase = (await linked.json()).case;
  const decisionURL = `${base}/api/tumor-boards/${board.id}/cases/${boardCase.id}/decision`,
    decisionBody = JSON.stringify({
      decision: "Synthetic multidisciplinary care decision",
    });
  assert.equal(
    (await fetch(decisionURL, { method: "POST", headers, body: decisionBody }))
      .status,
    201,
  );
  assert.equal(
    (await fetch(decisionURL, { method: "POST", headers, body: decisionBody }))
      .status,
    409,
  );
  const patientBoard = await fetch(`${base}/api/tumor-boards`, {
    headers: patientHeaders,
  });
  assert.equal(patientBoard.status, 403);
});
