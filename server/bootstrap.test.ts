import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { db, initializeDatabase, verifyPassword } from "./db/index.ts";

before(async () => {
  await initializeDatabase();
});
after(async () => {
  await db.end();
});
test("bootstrap creates an audited center admin and never overwrites an existing account", async () => {
  const email = `bootstrap-${randomUUID()}@example.test`,
    password = "Bootstrap-test-password-2026!";
  const env = {
    ...process.env,
    BOOTSTRAP_ADMIN_EMAIL: email,
    BOOTSTRAP_ADMIN_PASSWORD: password,
    BOOTSTRAP_ADMIN_NAME: "Synthetic Center Admin",
    BOOTSTRAP_ORGANIZATION_NAME: "Synthetic Test Organization",
  };
  const initial = spawnSync(process.execPath, ["scripts/bootstrap-admin.ts"], {
    env,
    encoding: "utf8",
  });
  assert.equal(initial.status, 0, initial.stderr);
  assert.equal(initial.stdout.includes(password), false);
  const user = (
    await db.query(
      "SELECT id,role,organization_id,password_hash FROM users WHERE email=$1",
      [email],
    )
  ).rows[0];
  assert.equal(user.role, "clinic_admin");
  assert.ok(user.organization_id);
  assert.ok(verifyPassword(password, user.password_hash));
  assert.equal(
    (
      await db.query(
        "SELECT id FROM audit_events WHERE entity_id=$1 AND action='bootstrap_center_admin'",
        [user.id],
      )
    ).rowCount,
    1,
  );
  const duplicate = spawnSync(
    process.execPath,
    ["scripts/bootstrap-admin.ts"],
    {
      env: {
        ...env,
        BOOTSTRAP_ADMIN_PASSWORD: "Different-test-password-2026!",
      },
      encoding: "utf8",
    },
  );
  assert.equal(duplicate.status, 1);
  const unchanged = (
    await db.query("SELECT password_hash FROM users WHERE id=$1", [user.id])
  ).rows[0];
  assert.equal(unchanged.password_hash, user.password_hash);
});
