import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import { db, initializeDatabase } from "./db/index.ts";
import { createApp } from "./app.ts";
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
test("public directory separates public profiles from accounts, hides unpublished records and serves stored raster photos", async () => {
  const category = randomUUID(),
    visible = randomUUID(),
    hidden = randomUUID(),
    image = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  await db.query(
    "INSERT INTO practitioner_categories(id,label) VALUES($1,$2)",
    [category, "Test category"],
  );
  await db.query(
    "INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,source_url,source_checked_at,photo_bytes,photo_mime) VALUES($1,'Source doctor','Specialty',$2,'Tehran','https://example.test/doctor',CURRENT_TIMESTAMP,$3,'image/png')",
    [visible, category, image],
  );
  await db.query(
    "INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,source_url,source_checked_at,status) VALUES($1,'Hidden doctor','Specialty',$2,'Tehran','https://example.test/hidden',CURRENT_TIMESTAMP,'hidden')",
    [hidden, category],
  );
  const response = await fetch(`${base}/api/practitioners`);
  assert.equal(response.status, 200);
  const result = await response.json();
  const profile = result.practitioners.find(
    (p: { id: string }) => p.id === visible,
  );
  assert.equal(profile.accountId, null);
  assert.equal(profile.photoUrl, `/api/practitioners/${visible}/photo`);
  assert.equal(profile.sourceUrl, "https://example.test/doctor");
  assert.equal(
    result.practitioners.some((p: { id: string }) => p.id === hidden),
    false,
  );
  assert.equal(
    result.categories.find((c: { id: string }) => c.id === category).count,
    1,
  );
  const photo = await fetch(base + profile.photoUrl);
  assert.equal(photo.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await photo.arrayBuffer()), image);
  assert.equal(
    (await fetch(`${base}/api/practitioners/${hidden}/photo`)).status,
    404,
  );
  assert.equal(
    (await fetch(`${base}/api/practitioners/unknown/photo`)).status,
    404,
  );
  assert.equal(
    (await db.query("SELECT id FROM users WHERE id=ANY($1::text[])", [[visible,hidden]])).rowCount,
    0,
  );
});
