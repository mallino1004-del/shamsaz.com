import "dotenv/config";
import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { createApp } from "./server/app.ts";
import { initializeDatabase, db } from "./server/db/index.ts";

const port = Number(process.env.PORT) || 3001;
await initializeDatabase();
const app = createApp();
let vite: Awaited<ReturnType<typeof createViteServer>> | undefined;
if (process.env.NODE_ENV === "production") {
  const directory = path.resolve(import.meta.dirname, "dist");
  app.use(express.static(directory, { index: false }));
  app.get("*", (_req, res) => res.sendFile(path.join(directory, "index.html")));
} else {
  vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== "true",
      ws: process.env.DISABLE_HMR === "true" ? false : { port: 24679 },
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
const server = app.listen(port, "0.0.0.0", () => {
  console.log(
    `Shamsaz running at http://localhost:${port} (${process.env.NODE_ENV || "development"})`,
  );
});
async function shutdown() {
  server.close();
  await vite?.close();
  await db.end();
}
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
