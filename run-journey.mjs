import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { connect } from "node:net";
import { mkdir } from "node:fs/promises";
const root = fileURLToPath(new URL("../", import.meta.url));
const artifacts = fileURLToPath(new URL("../test-results/", import.meta.url));
await mkdir(artifacts, { recursive: true, mode: 0o700 });
const env = {
  ...process.env,
  DATABASE_URL:
    "postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable&connection_limit=1&pgbouncer=true&statement_cache_size=0",
  APP_ORIGIN: "http://localhost:3000",
  ADMIN_ORIGIN: "http://localhost:3001",
  ENABLE_TEST_PAYMENTS: "true",
  FULFILMENT_METHOD: "PICKUP",
  SHIPPING_FEE: "0.00",
  PAYMENT_WEBHOOK_SECRET: "isolated-test-secret",
  NEXT_TELEMETRY_DISABLED: "1",
  TEST_ARTIFACT_DIR: artifacts,
  EMAIL_API_URL: "",
  EMAIL_API_KEY: "",
};
const children = [];
function launch(command, args, cwd = root) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  child.stdout.on("data", (d) => process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));
  return child;
}
async function waitFor(check, label) {
  for (let i = 0; i < 120; i++) {
    try {
      if (await check()) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout: ${label}`);
}
try {
  launch(process.execPath, ["tests/db-server.mjs"]);
  await waitFor(
    () =>
      new Promise((resolve) => {
        const socket = connect(55432, "127.0.0.1");
        socket.on("connect", () => {
          socket.end();
          resolve(true);
        });
        socket.on("error", () => resolve(false));
      }),
    "test database",
  );
  launch("pnpm", [
    "--filter",
    "@autosport/storefront",
    "exec",
    "next",
    "dev",
    "-H",
    "127.0.0.1",
    "-p",
    "3000",
  ]);
  await waitFor(async () => {
    const r = await fetch("http://localhost:3000/login");
    return r.ok;
  }, "storefront");
  launch("pnpm", [
    "--filter",
    "@autosport/admin",
    "exec",
    "next",
    "dev",
    "-H",
    "127.0.0.1",
    "-p",
    "3001",
  ]);
  await waitFor(async () => {
    const r = await fetch("http://localhost:3001/api/manage/products");
    return r.status === 401;
  }, "admin");
  for (const file of ["integration.ts", "browser.mts"]) {
    const test = launch("pnpm", [
      "--filter",
      "@autosport/worker",
      "exec",
      "node",
      "--import",
      "tsx",
      "../../tests/" + file,
    ]);
    const code = await new Promise((resolve) => test.on("exit", resolve));
    if (code !== 0) throw new Error(`${file} failed`);
  }
  console.log("API and mobile journey tests passed");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const child of children) child.kill("SIGTERM");
}
