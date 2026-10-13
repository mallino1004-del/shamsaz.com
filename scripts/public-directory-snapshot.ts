import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { db, initializeDatabase, transaction } from "../server/db/index.ts";
// Excludes accounts, sessions, patients, appointments and demo profiles.
const destination = new URL(
  "../data/public-directory.snapshot.json",
  import.meta.url,
);
const columns = [
  "id",
  "display_name",
  "specialty",
  "category_id",
  "city",
  "address",
  "phone",
  "source_url",
  "image_source_url",
  "source_checked_at",
  "photo_mime",
  "photo_fetched_at",
] as const;
interface PublicEntry extends Record<(typeof columns)[number], string | null> {
  photo_base64: string | null;
}
try {
  const action = process.argv[2];
  if (action === "export") {
    const connection = new URL(process.env.DATABASE_URL || "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(connection.hostname))
      throw new Error("Snapshot exports require the local project database.");
    const records = (
      await db.query(
        `SELECT ${columns.map((c) => `p.${c}`).join(",")},encode(p.photo_bytes,'base64') AS photo_base64 FROM public_practitioners p WHERE p.status='published' AND p.source_url IS NOT NULL AND p.account_id IS NULL ORDER BY p.id`,
      )
    ).rows;
    const categories = (
      await db.query(
        "SELECT id,label,sort_order FROM practitioner_categories WHERE id IN (SELECT category_id FROM public_practitioners WHERE status='published' AND source_url IS NOT NULL AND account_id IS NULL) ORDER BY sort_order,id",
      )
    ).rows;
    await writeFile(
      destination,
      JSON.stringify({ version: 1, categories, records }, null, 2) + "\n",
    );
    console.log(
      `Exported ${records.length} public profiles and ${categories.length} categories; no private accounts or care records.`,
    );
  } else if (action === "restore") {
    const snapshot = JSON.parse(await readFile(destination, "utf8"));
    if (
      snapshot.version !== 1 ||
      !Array.isArray(snapshot.records) ||
      !Array.isArray(snapshot.categories) ||
      snapshot.records.length > 1000
    )
      throw new Error("Invalid public directory snapshot.");
    await initializeDatabase();
    await transaction(async (client) => {
      for (const c of snapshot.categories) {
        if (
          typeof c.id !== "string" ||
          typeof c.label !== "string" ||
          !Number.isInteger(c.sort_order)
        )
          throw new Error("Invalid directory category.");
        await client.query(
          "INSERT INTO practitioner_categories(id,label,sort_order) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING",
          [c.id, c.label, c.sort_order],
        );
      }
      for (const p of snapshot.records as PublicEntry[]) {
        if (
          !p.source_url?.startsWith("https://") ||
          !p.id ||
          !p.display_name ||
          !p.specialty ||
          !p.category_id ||
          !p.source_checked_at
        )
          throw new Error("Invalid public physician record.");
        if (
          Object.keys(p).some(
            (k) =>
              !([...columns, "photo_base64"] as readonly string[]).includes(k),
          )
        )
          throw new Error("Unexpected snapshot field.");
        const photo = p.photo_base64
          ? Buffer.from(p.photo_base64, "base64")
          : null;
        if (photo && photo.length > 2097152)
          throw new Error("Invalid photo size.");
        await client.query(
          `INSERT INTO public_practitioners(${columns.join(",")},photo_bytes,status) VALUES(${columns.map((_, i) => `$${i + 1}`).join(",")},$${columns.length + 1},'published') ON CONFLICT(id) DO NOTHING`,
          [...columns.map((key) => p[key]), photo],
        );
      }
    });
    console.log(
      `Restored up to ${snapshot.records.length} public physician profiles; existing records and membership links preserved.`,
    );
  } else throw new Error("Use export or restore.");
} finally {
  await db.end();
}
