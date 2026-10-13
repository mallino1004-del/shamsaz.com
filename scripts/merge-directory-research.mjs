import { readFile, writeFile } from "node:fs/promises";
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const main = await read("data/tehran-practitioners.json");
const additions = (await read("data/tehran-gynecologic-additions.json")).map(
  (p) => ({
    specialty:
      p.id === "tehran-yousefnejad"
        ? "متخصص زنان و زایمان؛ خدمات درمانگاه انکولوژی زنان"
        : "فلوشیپ انکولوژی زنان",
    categoryId: "gynecologic-oncology",
    categoryLabel: "انکولوژی و سرطان‌های زنان",
    city: "تهران",
    ...p,
  }),
);
const extra = await read("data/tehran-practitioners-extra.json").catch(
  () => [],
);
const patches = await read("data/tehran-photo-patches.json").catch(() => []);
patches.push(...await read("data/hadizadeh-photo-patch.json").catch(() => []));
patches.push(...await read("data/tehran-photo-validation.json").catch(() => []));
// This cached profile resolves to a different physician on the live source.
const records = new Map(
  [...main, ...additions, ...extra]
    .filter((p) => p.id !== "tehran-vakili")
    .map((p) => [p.id, p]),
);
for (const patch of patches)
  if (records.has(patch.id)) Object.assign(records.get(patch.id), patch);
await writeFile(
  "data/tehran-practitioners.json",
  JSON.stringify([...records.values()], null, 2) + "\n",
);
console.log(`Prepared ${records.size} source-attributed Tehran practitioners`);
