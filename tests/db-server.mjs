import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { PGlite } = require("@electric-sql/pglite");
const { PGLiteSocketServer } = require("@electric-sql/pglite-socket");
const db = new PGlite();
await db.waitReady;
await db.exec(
  await readFile(
    new URL(
      "../packages/database/prisma/migrations/202610060001_phase1/migration.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
await db.exec(
  await readFile(
    new URL(
      "../packages/database/prisma/migrations/20261007050000_add_enquiry/migration.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
const server = new PGLiteSocketServer({
  db,
  port: 55432,
  host: "127.0.0.1",
  maxConnections: 10,
});
await server.start();
console.log("Isolated test database ready");
process.on("SIGTERM", async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
