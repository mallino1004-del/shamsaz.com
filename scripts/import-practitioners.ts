import "dotenv/config";
import { readFile } from "node:fs/promises";
import { db, initializeDatabase, transaction } from "../server/db/index.ts";
interface Source {
  id: string;
  displayName: string;
  specialty: string;
  categoryId: string;
  categoryLabel: string;
  city: string;
  address: string;
  phone: string;
  sourceUrl: string;
  imageSourceUrl?: string;
  sourceCheckedAt?: string;
}
function publicHttps(value: string) {
  const u = new URL(value);
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    u.port ||
    u.hostname === "localhost" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      u.hostname,
    ) ||
    u.hostname.includes(":")
  )
    throw new Error("Only public HTTPS source addresses are supported");
  return u;
}
function imageMime(bytes: Buffer) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  throw new Error("Unsupported raster photo");
}
async function fetchPhoto(url: string) {
  let current = publicHttps(url);
  for (let redirect = 0; redirect < 5; redirect++) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Missing redirect target");
      current = publicHttps(new URL(location, current).toString());
      continue;
    }
    if (!response.ok || !response.body)
      throw new Error(`Image response ${response.status}`);
    if (Number(response.headers.get("content-length") || 0) > 2097152)
      throw new Error("Photo exceeds 2 MB");
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2097152) throw new Error("Photo exceeds 2 MB");
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const bytes = Buffer.concat(chunks);
    return { bytes, mime: imageMime(bytes) };
  }
  throw new Error("Too many image redirects");
}
try {
  const records = JSON.parse(
    await readFile(process.argv[2] || "data/tehran-practitioners.json", "utf8"),
  ) as Source[];
  if (!Array.isArray(records) || !records.length)
    throw new Error("Directory input must contain profiles");
  process.env.ENABLE_DEMO_SEED = "false";
  await initializeDatabase();
  let photos = 0;
  for (const [index, p] of records.entries()) {
    for (const key of [
      "id",
      "displayName",
      "specialty",
      "categoryId",
      "categoryLabel",
      "city",
      "sourceUrl",
    ] as const)
      if (typeof p[key] !== "string" || !p[key].trim())
        throw new Error(`Profile ${index} missing ${key}`);
    publicHttps(p.sourceUrl);
    const checked = p.sourceCheckedAt
      ? new Date(p.sourceCheckedAt)
      : new Date();
    if (!Number.isFinite(checked.getTime()))
      throw new Error(`Invalid source date for ${p.id}`);
    let photo: { bytes: Buffer; mime: string } | null = null;
    if (p.imageSourceUrl)
      try {
        photo = await fetchPhoto(p.imageSourceUrl);
        photos++;
      } catch (error) {
        console.warn(
          `Photo unavailable for ${p.id}: ${error instanceof Error ? error.message : "fetch failed"}`,
        );
      }
    await transaction(async (client) => {
      await client.query(
        "INSERT INTO practitioner_categories(id,label,sort_order) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET label=excluded.label",
        [p.categoryId, p.categoryLabel, index],
      );
      await client.query(
        "INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,address,phone,source_url,image_source_url,source_checked_at,photo_bytes,photo_mime,photo_fetched_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name,specialty=excluded.specialty,category_id=excluded.category_id,city=excluded.city,address=excluded.address,phone=excluded.phone,source_url=excluded.source_url,image_source_url=excluded.image_source_url,source_checked_at=excluded.source_checked_at,imported_at=CURRENT_TIMESTAMP,photo_bytes=COALESCE(excluded.photo_bytes,public_practitioners.photo_bytes),photo_mime=COALESCE(excluded.photo_mime,public_practitioners.photo_mime),photo_fetched_at=COALESCE(excluded.photo_fetched_at,public_practitioners.photo_fetched_at)",
        [
          p.id,
          p.displayName,
          p.specialty,
          p.categoryId,
          p.city,
          p.address || "",
          p.phone || "",
          p.sourceUrl,
          p.imageSourceUrl || null,
          checked.toISOString(),
          photo?.bytes ?? null,
          photo?.mime ?? null,
          photo ? new Date().toISOString() : null,
        ],
      );
    });
  }
  console.log(
    `Imported ${records.length} public practitioner profiles; ${photos} source photos downloaded. No login accounts created.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Import failed");
  process.exitCode = 1;
} finally {
  await db.end();
}
