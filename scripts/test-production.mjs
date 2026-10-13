import "dotenv/config";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import assert from "node:assert/strict";
const source = new URL(process.env.DATABASE_URL || "");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(source.hostname));
const name = `shamsaz_test_${randomBytes(10).toString("hex")}`;
assert.match(name, /^shamsaz_test_[a-f0-9]{20}$/);
const target = new URL(source);
target.pathname = `/${name}`;
const admin = new Pool({ connectionString: source.toString() });
const portServer = createServer();
await new Promise((r) => portServer.listen(0, "127.0.0.1", r));
const port = portServer.address().port;
await new Promise((r) => portServer.close(r));
let created = false,
  service,
  fixture;
try {
  await admin.query(`CREATE DATABASE "${name}"`);
  created = true;
  const env = {
    ...process.env,
    NODE_ENV: "production",
    DATABASE_URL: target.toString(),
    PORT: String(port),
    APP_ORIGIN: "https://deployment-check.example",
    ENABLE_DEMO_SEED: "false",
    ENABLE_DEV_AUTH_INBOX: "false",
    DEMO_PASSWORD: "",
  };
  for (let i = 0; i < 2; i++)
    execFileSync(
      process.execPath,
      ["scripts/public-directory-snapshot.ts", "restore"],
      { env, stdio: "pipe", windowsHide: true },
    );
  fixture = new Pool({ connectionString: target.toString() });
  assert.equal(
    (await fixture.query("SELECT COUNT(*)::int AS n FROM public_practitioners"))
      .rows[0].n,
    44,
  );
  assert.equal(
    (
      await fixture.query(
        "SELECT COUNT(*)::int AS n FROM public_practitioners WHERE photo_bytes IS NOT NULL",
      )
    ).rows[0].n,
    44,
  );
  assert.equal(
    (await fixture.query("SELECT COUNT(*)::int AS n FROM users")).rows[0].n,
    0,
  );
  assert.equal(
    (
      await fixture.query(
        "SELECT COUNT(*)::int AS n FROM public_practitioners WHERE account_id IS NOT NULL",
      )
    ).rows[0].n,
    0,
  );
  service = spawn(process.execPath, ["scripts/start-production.mjs"], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  service.stdout.resume();
  service.stderr.resume();
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (
      await fetch(base + "/api/health")
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, "Production server starts");
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /assets\/index-/);
  const directory = await fetch(base + "/api/practitioners");
  assert.equal(directory.status, 200);
  assert.equal((await directory.json()).practitioners.length, 44);
  assert.equal((await fetch(base + "/api/dashboard")).status, 401);
  const wrongOrigin = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://other.example",
    },
    body: "{}",
  });
  assert.equal(wrongOrigin.status, 403);
  const registration = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", origin: env.APP_ORIGIN },
    body: JSON.stringify({
      email: "production-check@example.test",
      password: randomBytes(20).toString("hex"),
      displayName: "Synthetic production test",
    }),
  });
  assert.equal(registration.status, 201);
  assert.match(registration.headers.get("set-cookie"), /Secure/);
  console.log(
    "Production readiness passed: idempotent public directory restore, 44 photos, no demo accounts, built frontend, PostgreSQL health, origin protection and secure session cookies. No cloud deployment occurred.",
  );
} finally {
  if (service && service.exitCode === null) {
    service.kill();
    await new Promise((r) => service.once("exit", r));
  }
  await fixture?.end();
  if (created) await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  await admin.end();
}
