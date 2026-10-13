import "dotenv/config";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { readdirSync } from "node:fs";
import { spawn } from "node:child_process";

// Every default run creates an isolated database; development records are untouched.
const source = new URL(
  process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || "",
);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(source.hostname) &&
  !process.env.TEST_DATABASE_URL
) {
  throw new Error(
    "Set an explicit dedicated TEST_DATABASE_URL for a remote test environment.",
  );
}
const name = `shamsaz_test_${randomBytes(10).toString("hex")}`;
if (!/^shamsaz_test_[a-f0-9]{20}$/.test(name))
  throw new Error("Invalid temporary database name");
const admin = process.env.TEST_DATABASE_URL
  ? null
  : new Pool({ connectionString: source.toString() });
let created = false;
let exitCode = 1;
try {
  if (admin) {
    await admin.query(`CREATE DATABASE "${name}"`);
    created = true;
  }
  const target = new URL(process.env.TEST_DATABASE_URL || source.toString());
  if (admin) target.pathname = `/${name}`;
  const files = ["server", "server/db"].flatMap((directory) =>
    readdirSync(directory)
      .filter((file) => file.endsWith(".test.ts"))
      .map((file) => `${directory}/${file}`),
  );
  const child = spawn(process.execPath, ["--test", ...files], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: target.toString(),
      ENABLE_DEMO_SEED: "true",
      DEMO_PASSWORD: randomBytes(24).toString("hex"),
    },
  });
  exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  if (created) await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  await admin?.end();
}
process.exitCode = exitCode;
