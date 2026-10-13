import "dotenv/config";
import { Pool, type PoolClient } from "pg";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const db = Object.assign(
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  }),
  { prepare },
);
export function prepare(sql: string) {
  let index = 0;
  const statement = sql.replace(/\?/g, () => `$${++index}`);
  return {
    async get(...params: unknown[]) {
      return (await db.query(statement, params)).rows[0];
    },
    async all(...params: unknown[]) {
      return (await db.query(statement, params)).rows;
    },
    async run(...params: unknown[]) {
      const result = await db.query(statement, params);
      return { changes: result.rowCount ?? 0 };
    },
  };
}
export function getDatabase() {
  return db;
}
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [algorithm, salt, key] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !key || !/^[a-f0-9]{128}$/.test(key))
    return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
export async function transaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function initializeDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL is required. Configure PostgreSQL before starting Shamsaz.",
    );
  const directory = fileURLToPath(
    new URL("../../database/postgres/migrations/", import.meta.url),
  );
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(7142301)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    );
    for (const name of readdirSync(directory)
      .filter((file) => /^\d+.*\.sql$/.test(file))
      .sort()) {
      const sql = readFileSync(`${directory}/${name}`, "utf8").replace(
        /^\uFEFF/,
        "",
      );
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = await client.query(
        "SELECT checksum FROM schema_migrations WHERE version=$1",
        [name],
      );
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum)
          throw new Error(
            `Applied migration ${name} was modified; create a new migration instead.`,
          );
        continue;
      }
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations(version,checksum) VALUES($1,$2)",
        [name, checksum],
      );
    }
  });
  if (process.env.ENABLE_DEMO_SEED === "true") await seedDemo();
}

async function seedDemo(): Promise<void> {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 12)
    throw new Error(
      "Explicit DEMO_PASSWORD with at least 12 characters is required for demo seed.",
    );
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seeding is disabled in production.");
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(7142302)");
    await client.query(
      "INSERT INTO organizations(id,name,type,city,address) VALUES('demo-clinic','مرکز نمایشی شمساز','clinic','تهران','داده آزمایشی؛ مرکز واقعی نیست') ON CONFLICT(id) DO NOTHING",
    );
    const accounts = [
      ["demo-patient", "patient@shamsaz.local", "patient", "بیمار آزمایشی"],
      ["demo-doctor", "doctor@shamsaz.local", "doctor", "پزشک آزمایشی"],
      [
        "demo-registry",
        "registry@shamsaz.local",
        "registry_clerk",
        "کارشناس رجیستری آزمایشی",
      ],
      ["demo-admin", "admin@shamsaz.local", "clinic_admin", "مدیر آزمایشی"],
      [
        "demo-supervisor",
        "supervisor@shamsaz.local",
        "national_supervisor",
        "ناظر آزمایشی",
      ],
    ];
    for (const [id, email, role, name] of accounts) {
      await client.query(
        "INSERT INTO users(id,email,password_hash,role,display_name,organization_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING",
        [
          id,
          email,
          hashPassword(password),
          role,
          name,
          role === "patient" ? null : "demo-clinic",
        ],
      );
      await client.query(
        "INSERT INTO user_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING",
        [id],
      );
      if (role !== "patient")
        await client.query(
          "INSERT INTO organization_memberships(id,user_id,organization_id,role) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,organization_id) DO NOTHING",
          [randomUUID(), id, "demo-clinic", role],
        );
    }
    await client.query(
      "INSERT INTO patient_profiles(user_id,sex) VALUES('demo-patient','female') ON CONFLICT DO NOTHING",
    );
    await client.query(
      "UPDATE users SET organization_id='demo-clinic' WHERE id='demo-patient' AND organization_id IS NULL",
    );
    await client.query(
      "INSERT INTO doctor_profiles(user_id,license_number,specialty,biography,fee) VALUES('demo-doctor','DEMO-ONLY','انکولوژی زنان','پروفایل مصنوعی برای توسعه',0) ON CONFLICT DO NOTHING",
    );
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(6, 0, 0, 0);
    for (let day = 0; day < 14; day++)
      for (let hour = 0; hour < 4; hour++) {
        const start = new Date(
          tomorrow.getTime() + day * 86400000 + hour * 3600000,
        );
        const end = new Date(start.getTime() + 1800000);
        await client.query(
          "INSERT INTO appointment_slots(id,doctor_id,organization_id,starts_at,ends_at) VALUES($1,'demo-doctor','demo-clinic',$2,$3) ON CONFLICT(doctor_id,starts_at) DO NOTHING",
          [
            `demo-slot-${start.toISOString()}`,
            start.toISOString(),
            end.toISOString(),
          ],
        );
      }
  });
}
