import "dotenv/config";
import { randomUUID } from "node:crypto";
import {
  db,
  initializeDatabase,
  transaction,
  hashPassword,
} from "../server/db/index.ts";

process.env.ENABLE_DEMO_SEED = "false";
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
const organizationName = process.env.BOOTSTRAP_ORGANIZATION_NAME?.trim();
if (
  !email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !password ||
  password.length < 12 ||
  password.length > 128 ||
  !name ||
  !organizationName
) {
  throw new Error(
    "Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD (12–128 characters), BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ORGANIZATION_NAME in the secure environment.",
  );
}
try {
  await initializeDatabase();
  await transaction(async (client) => {
    const existing = await client.query(
      "SELECT id FROM users WHERE lower(email)=$1",
      [email],
    );
    if (existing.rowCount)
      throw new Error(
        "Account already exists; bootstrap never changes existing roles or passwords.",
      );
    const userId = randomUUID(),
      organizationId = randomUUID();
    await client.query(
      "INSERT INTO organizations(id,name,type,city) VALUES($1,$2,'clinic',$3)",
      [
        organizationId,
        organizationName,
        process.env.BOOTSTRAP_ORGANIZATION_CITY || "",
      ],
    );
    await client.query(
      "INSERT INTO users(id,email,password_hash,display_name,role,organization_id) VALUES($1,$2,$3,$4,'clinic_admin',$5)",
      [userId, email, hashPassword(password), name, organizationId],
    );
    await client.query("INSERT INTO user_profiles(user_id) VALUES($1)", [
      userId,
    ]);
    await client.query(
      "INSERT INTO organization_memberships(id,user_id,organization_id,role) VALUES($1,$2,$3,'clinic_admin')",
      [randomUUID(), userId, organizationId],
    );
    await client.query(
      "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id) VALUES($1,$2,'bootstrap_center_admin','user',$2)",
      [randomUUID(), userId],
    );
  });
  console.log(
    "Center administrator and organization created. No credentials were printed.",
  );
} finally {
  await db.end();
}
