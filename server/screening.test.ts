import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import { createApp } from "./app.ts";
import { db, initializeDatabase } from "./db/index.ts";
import {
  assessScreening,
  emptyScreeningAnswers,
  validateScreeningAnswers,
  type ScreeningAnswers,
} from "../shared/screening.ts";
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
const baseline: ScreeningAnswers = {
  ...emptyScreeningAnswers,
  age: 45,
  menopause: "pre",
  cervix: "yes",
  pregnant: "no",
  familyHistory: "no",
  personalHistory: "no",
  immunosuppressed: "no",
  chestRadiation: "no",
  genetic: "none",
  noSymptoms: true,
  duration: "none",
};
test("symptoms override routine intervals; unknown and inherited histories never imply an all-clear", () => {
  const normal = assessScreening(
    {
      ...baseline,
      mammogramDate: "2025-10-01",
      mammogramResult: "normal",
      cervicalDate: "2024-10-01",
      cervicalType: "hpv",
      cervicalResult: "normal",
    },
    new Date("2026-10-13T12:00:00Z"),
  );
  assert.equal(normal.plans[0].nextDate, "2027-10-01");
  assert.equal(normal.plans[1].nextDate, "2029-10-01");
  const symptom = assessScreening({
    ...baseline,
    noSymptoms: false,
    symptoms: ["breast_lump"],
    duration: "new",
    mammogramDate: "2026-10-01",
    mammogramResult: "normal",
  });
  assert.equal(symptom.triageLevel, "urgent");
  assert.equal(symptom.plans[0].state, "review");
  assert.equal(symptom.plans[0].nextDate, undefined);
  const urgent = assessScreening({
    ...baseline,
    noSymptoms: false,
    symptoms: ["heavy_bleeding", "postmenopausal_bleeding"],
    duration: "new",
  });
  assert.equal(urgent.triageLevel, "emergency");
  const inherited = assessScreening({ ...baseline, genetic: "brca" });
  assert.equal(inherited.plans[0].state, "individual");
  assert.equal(inherited.plans[2].state, "individual");
  const unknown = assessScreening({ ...baseline, familyHistory: "unknown" });
  assert.equal(unknown.plans[0].state, "individual");
  assert.equal(
    assessScreening({ ...baseline, age: 20 }).plans[1].state,
    "education",
  );
  assert.equal(
    assessScreening({ ...baseline, age: 70 }).plans[1].state,
    "individual",
  );
  assert.ok(
    validateScreeningAnswers({ ...baseline, cervicalDate: "2025-02-30" })
      .length,
  );
  assert.ok(
    validateScreeningAnswers({ ...baseline, mammogramDate: "2099-01-01" })
      .length,
  );
  assert.ok(
    validateScreeningAnswers({ ...baseline, symptoms: ["breast_lump"] }).length,
  );
  assert.equal("riskScore" in normal, false);
});
test("versioned assessments are computed server-side, persisted with consent and restricted to the patient", async () => {
  async function register() {
    const r = await fetch(base + "/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: `screening-${randomUUID()}@example.test`,
        password: "test-screening-password-2026",
        displayName: "Screening test patient",
      }),
    });
    assert.equal(r.status, 201);
    const a = await r.json();
    return {
      auth: a,
      headers: {
        cookie: r.headers.get("set-cookie")!.split(";")[0],
        "content-type": "application/json",
        "x-csrf-token": a.csrfToken,
      },
    };
  }
  const owner = await register(),
    other = await register();
  assert.equal((await fetch(base + "/api/screenings")).status, 401);
  const noConsent = await fetch(base + "/api/screenings", {
    method: "POST",
    headers: owner.headers,
    body: JSON.stringify({ screeningVersion: 2, answers: baseline }),
  });
  assert.equal(noConsent.status, 422);
  const invalid = await fetch(base + "/api/screenings", {
    method: "POST",
    headers: owner.headers,
    body: JSON.stringify({
      screeningVersion: 2,
      consent: true,
      answers: { ...baseline, age: 10 },
    }),
  });
  assert.equal(invalid.status, 422);
  const body = {
    screeningVersion: 2,
    consent: true,
    answers: {
      ...baseline,
      noSymptoms: false,
      duration: "new",
      symptoms: ["heavy_bleeding"],
    },
    assessment: { triageLevel: "routine" },
    triageLevel: "routine",
  };
  const r = await fetch(base + "/api/screenings", {
    method: "POST",
    headers: owner.headers,
    body: JSON.stringify(body),
  });
  assert.equal(r.status, 201);
  const { screening } = await r.json();
  assert.equal(screening.triageLevel, "emergency");
  assert.equal(screening.assessment.triageLevel, "emergency");
  const row = (
    await db.query(
      "SELECT patient_id,triage_level,payload_json FROM screening_reports WHERE id=$1",
      [screening.id],
    )
  ).rows[0];
  assert.equal(row.patient_id, owner.auth.user.id);
  assert.equal(row.triage_level, "emergency");
  assert.equal(
    row.payload_json.assessment.version,
    screening.assessment.version,
  );
  assert.ok(
    (
      await db.query(
        "SELECT id FROM consents WHERE patient_id=$1 AND policy_version='screening-2026-10-v1'",
        [owner.auth.user.id],
      )
    ).rows.length,
  );
  const own = await fetch(base + "/api/screenings", { headers: owner.headers });
  assert.equal((await own.json()).screenings[0].id, screening.id);
  const others = await fetch(base + "/api/screenings", {
    headers: other.headers,
  });
  assert.equal((await others.json()).screenings.length, 0);
  const doctor = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "doctor@shamsaz.local",
      password: process.env.DEMO_PASSWORD,
    }),
  });
  assert.equal(doctor.status, 200);
  const a = await doctor.json(),
    headers = {
      cookie: doctor.headers.get("set-cookie")!.split(";")[0],
      "content-type": "application/json",
      "x-csrf-token": a.csrfToken,
    };
  assert.equal(
    (await fetch(base + "/api/screenings", { headers })).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/screenings", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })
    ).status,
    403,
  );
});
