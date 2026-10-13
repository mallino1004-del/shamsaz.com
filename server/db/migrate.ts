import { db, initializeDatabase } from "./index.ts";
try {
  await initializeDatabase();
  console.log("PostgreSQL migrations completed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
} finally {
  await db.end();
}
