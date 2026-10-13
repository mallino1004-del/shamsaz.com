import { readFile, writeFile, mkdir } from "node:fs/promises";
const urls = process.argv.slice(2);
await mkdir(".local/directory-research", { recursive: true });
for (const [index, url] of urls.entries()) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const html = await response.text();
    await writeFile(`.local/directory-research/${index}.html`, html);
    console.log(
      JSON.stringify({
        url,
        status: response.status,
        images: html
          .match(/<img\b[^>]*>/gi)
          ?.filter((x) => !/logo|icon|banner|svg|loading/i.test(x))
          .slice(0, 12),
      }),
    );
  } catch (error) {
    console.log(JSON.stringify({ url, error: error.message }));
  }
}
