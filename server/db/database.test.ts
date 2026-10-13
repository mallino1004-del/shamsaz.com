import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  db,
  initializeDatabase,
  hashPassword,
  verifyPassword,
} from "./index.ts";

test("password hashes are salted and reject incorrect passwords", () => {
  const hash = hashPassword("test-password-123");
  assert.ok(verifyPassword("test-password-123", hash));
  assert.equal(verifyPassword("incorrect", hash), false);
  assert.notEqual(hash, hashPassword("test-password-123"));
});
test("PostgreSQL migrations, referential constraints, atomic reservations and audit immutability", async () => {
  await initializeDatabase();
  await initializeDatabase();
  const client = await db.connect();
  const suffix = randomUUID();
  const patient = `test-p-${suffix}`,
    doctor = `test-d-${suffix}`,
    org = `test-o-${suffix}`,
    slot = `test-s-${suffix}`;
  async function violation(sql: string, params: unknown[], code: string) {
    await client.query("SAVEPOINT constraint_test");
    await assert.rejects(
      client.query(sql, params),
      (error: any) => error.code === code,
    );
    await client.query("ROLLBACK TO SAVEPOINT constraint_test");
  }
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO organizations(id,name,type) VALUES($1,'Test','clinic')",
      [org],
    );
    for (const [id, role] of [
      [patient, "patient"],
      [doctor, "doctor"],
    ])
      await client.query(
        "INSERT INTO users(id,email,password_hash,display_name,role,organization_id) VALUES($1,$2,$3,$4,$5,$6)",
        [
          id,
          `${id}@example.invalid`,
          hashPassword("fixture-password"),
          id,
          role,
          org,
        ],
      );
    await violation(
      "INSERT INTO users(id,email,password_hash,display_name,role) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        `${patient.toUpperCase()}@EXAMPLE.INVALID`,
        hashPassword("fixture-password"),
        "Duplicate",
        "patient",
      ],
      "23505",
    );
    await violation(
      "INSERT INTO users(id,email,password_hash,display_name,role) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        "role@example.invalid",
        hashPassword("fixture-password"),
        "Bad role",
        "owner",
      ],
      "23514",
    );
    const otherOrg = `other-${suffix}`;
    await client.query(
      "INSERT INTO organizations(id,name,type) VALUES($1,'Other center','clinic')",
      [otherOrg],
    );
    await violation(
      "INSERT INTO registry_cases(id,organization_id,patient_id,created_by) VALUES($1,$2,$3,$4)",
      [randomUUID(), otherOrg, patient, doctor],
      "23503",
    );
    await violation(
      "INSERT INTO sessions(id,user_id,token_hash,csrf_token,expires_at) VALUES($1,'missing-user',$2,'csrf',CURRENT_TIMESTAMP)",
      [randomUUID(), randomUUID()],
      "23503",
    );
    await violation(
      "INSERT INTO user_profiles(user_id,data_json) VALUES($1,'invalid-json')",
      [patient],
      "22P02",
    );
    const expired = randomUUID();
    await client.query(
      "INSERT INTO sessions(id,user_id,token_hash,csrf_token,expires_at) VALUES($1,$2,$3,'csrf',CURRENT_TIMESTAMP-interval '1 minute')",
      [expired, patient, randomUUID()],
    );
    assert.equal(
      (
        await client.query(
          "SELECT id FROM sessions WHERE id=$1 AND expires_at>CURRENT_TIMESTAMP",
          [expired],
        )
      ).rowCount,
      0,
    );
    const prescription = randomUUID();
    await client.query(
      "INSERT INTO prescriptions(id,patient_id,doctor_id) VALUES($1,$2,$3)",
      [prescription, patient, doctor],
    );
    await violation(
      "INSERT INTO prescription_items(id,prescription_id,medication_name,dose,route,frequency,duration_days) VALUES($1,$2,'Medication','dose','oral','daily',0)",
      [randomUUID(), prescription],
      "23514",
    );
    await client.query(
      "INSERT INTO appointment_slots(id,doctor_id,organization_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)",
      [slot, doctor, org, "2099-01-01T08:00:00Z", "2099-01-01T08:30:00Z"],
    );
    await violation(
      "INSERT INTO appointment_slots(id,doctor_id,organization_id,starts_at,ends_at) VALUES($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        doctor,
        org,
        "2099-01-01T08:15:00Z",
        "2099-01-01T08:45:00Z",
      ],
      "23P01",
    );
    const registry = randomUUID();
    await client.query(
      "INSERT INTO registry_cases(id,organization_id,patient_id,created_by,icd10_code,icdo3_code,staging_system,staging_version,tnm_t,tnm_n,tnm_m,grade) VALUES($1,$2,$3,$4,'C50.9','8500/3','AJCC','8','pT2','pN1','cM0','G2')",
      [registry, org, patient, doctor],
    );
    await violation(
      "UPDATE registry_cases SET icd10_code='invalid' WHERE id=$1",
      [registry],
      "23514",
    );
    await violation(
      "UPDATE registry_cases SET icdo3_code='8500' WHERE id=$1",
      [registry],
      "23514",
    );
    await violation(
      "UPDATE registry_cases SET staging_system='invalid' WHERE id=$1",
      [registry],
      "23514",
    );
    await violation(
      "UPDATE registry_cases SET tnm_t='T9' WHERE id=$1",
      [registry],
      "23514",
    );
    await violation(
      "UPDATE registry_cases SET grade='G9' WHERE id=$1",
      [registry],
      "23514",
    );
    const board = randomUUID();
    await client.query(
      "INSERT INTO tumor_boards(id,organization_id,title,scheduled_at,created_by) VALUES($1,$2,'Test board',CURRENT_TIMESTAMP,$3)",
      [board, org, doctor],
    );
    await client.query(
      "INSERT INTO tumor_board_participants(board_id,user_id) VALUES($1,$2)",
      [board, doctor],
    );
    await violation(
      "INSERT INTO tumor_board_participants(board_id,user_id) VALUES($1,$2)",
      [board, patient],
      "23514",
    );
    await violation(
      "UPDATE users SET role='clinic_admin' WHERE id=$1",
      [doctor],
      "23514",
    );
    const otherDoctor = `other-doctor-${suffix}`;
    await client.query(
      "INSERT INTO users(id,email,password_hash,display_name,role,organization_id) VALUES($1,$2,$3,'Other doctor','doctor',$4)",
      [
        otherDoctor,
        `${otherDoctor}@example.invalid`,
        hashPassword("fixture-password"),
        otherOrg,
      ],
    );
    await violation(
      "INSERT INTO tumor_board_participants(board_id,user_id) VALUES($1,$2)",
      [board, otherDoctor],
      "23514",
    );
    const otherRegistry = randomUUID();
    await client.query(
      "INSERT INTO registry_cases(id,organization_id,created_by) VALUES($1,$2,$3)",
      [otherRegistry, otherOrg, otherDoctor],
    );
    await violation(
      "INSERT INTO tumor_board_cases(id,board_id,registry_case_id) VALUES($1,$2,$3)",
      [randomUUID(), board, otherRegistry],
      "23514",
    );
    await client.query(
      "INSERT INTO tumor_board_cases(id,board_id,registry_case_id) VALUES($1,$2,$3)",
      [randomUUID(), board, registry],
    );
    await violation(
      "UPDATE tumor_boards SET organization_id=$1,created_by=$2 WHERE id=$3",
      [otherOrg, otherDoctor, board],
      "23514",
    );
    await violation(
      "UPDATE registry_cases SET organization_id=$1,patient_id=NULL,created_by=$2 WHERE id=$3",
      [otherOrg, otherDoctor, registry],
      "23514",
    );
    const encounter = randomUUID();
    await client.query(
      "INSERT INTO encounters(id,patient_id,doctor_id,organization_id,occurred_at,subjective,objective,assessment,plan) VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP,'Patient account','Observed findings','Assessment','Care plan')",
      [encounter, patient, doctor, org],
    );
    assert.equal(
      (
        await client.query(
          "SELECT subjective,objective FROM encounters WHERE id=$1",
          [encounter],
        )
      ).rows[0].objective,
      "Observed findings",
    );
    const appointment =
      "INSERT INTO appointments(id,patient_id,doctor_id,organization_id,slot_id,starts_at,ends_at,status) VALUES($1,$2,$3,$4,$5,$6,'2099-01-01T08:30:00Z',$7)";
    await client.query(appointment, [
      randomUUID(),
      patient,
      doctor,
      org,
      slot,
      "2099-01-01T08:00:00Z",
      "confirmed",
    ]);
    await violation(
      appointment,
      [
        randomUUID(),
        patient,
        doctor,
        org,
        slot,
        "2099-01-01T08:00:00Z",
        "pending",
      ],
      "23505",
    );
    await violation(
      appointment,
      [
        randomUUID(),
        patient,
        doctor,
        org,
        null,
        "2099-01-01T08:15:00Z",
        "pending",
      ],
      "23P01",
    );
    const audit = randomUUID();
    await client.query(
      "INSERT INTO audit_events(id,user_id,action,entity_type) VALUES($1,$2,'test','test')",
      [audit, patient],
    );
    await violation("DELETE FROM audit_events WHERE id=$1", [audit], "P0001");
    await violation(
      "UPDATE audit_events SET action='tampered' WHERE id=$1",
      [audit],
      "P0001",
    );
    assert.ok(
      (
        await client.query(
          "SELECT count(*)::int AS count FROM schema_migrations",
        )
      ).rows[0].count >= 3,
    );
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await db.end();
  }
});
