import { createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { db, transaction } from "../db/index.ts";
import type { SessionUser } from "../../shared/contracts.ts";
export type Row = Record<string, any>;
export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const fail = (message: string): never => {
  throw new ApiError(422, "VALIDATION_ERROR", message);
};
export const string = (
  value: unknown,
  name: string,
  min = 0,
  max = 500,
): string => {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    return fail(`مقدار ${name} معتبر نیست.`);
  return value.trim();
};
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const safeEqual = (a: string, b: string) => {
  const first = Buffer.from(a),
    second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
};
export const validDate = (value: string) => {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const parsed = Date.parse(day);
  return (
    Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === day
  );
};
export const userView = (u: Row): SessionUser => ({
  id: u.id,
  email: u.email,
  displayName: u.display_name,
  role: u.role,
  organizationId: u.organization_id,
});
export const json = (value: any) =>
  typeof value === "string" ? JSON.parse(value) : value || {};
export const optional = (body: Row, key: string, max = 500) =>
  body[key] === undefined ? undefined : string(body[key], key, 0, max);
export const audit = async (
  userId: string,
  action: string,
  entity: string,
  id: string,
) =>
  await db
    .prepare(
      "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)",
    )
    .run(
      randomUUID(),
      userId,
      action,
      entity,
      id,
      "{}",
      new Date().toISOString(),
    );
export async function mutate(
  userId: string,
  action: string,
  entity: string,
  id: string,
  statements: Array<[string, unknown[]]>,
) {
  return transaction(async (client) => {
    for (const [sql, params] of statements) {
      let n = 0;
      await client.query(
        sql.replace(/\?/g, () => `$${++n}`),
        params,
      );
    }
    await client.query(
      "INSERT INTO audit_events(id,user_id,action,entity_type,entity_id,metadata_json) VALUES($1,$2,$3,$4,$5,$6)",
      [randomUUID(), userId, action, entity, id, {}],
    );
  });
}
