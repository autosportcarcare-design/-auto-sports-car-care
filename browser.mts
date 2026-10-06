import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { db } from "../packages/database/src/client";
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright",
);
const fixture = JSON.parse(
  await readFile(process.env.TEST_ARTIFACT_DIR + "/fixture.json", "utf8"),
) as { productSlug: string };
const base = "http://localhost:3000";
const context = await chromium.launchPersistentContext(
  process.env.TEST_ARTIFACT_DIR + "/browser-profile",
  {
    headless: true,
    viewport: { width: 390, height: 844 },
    ...(process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
      : {}),
    args:
      process.env.CHROMIUM_SINGLE_PROCESS === "true"
        ? [
            "--no-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--single-process",
            "--no-zygote",
          ]
        : ["--no-sandbox"],
  },
);
const page = context.pages()[0] ?? (await context.newPage());
const failures: string[] = [];
page.on("pageerror", (error: Error) => failures.push(error.message));
const email = `browser-${Date.now()}@example.test`;
const password = "Browser-password-123!";
try {
  await page.goto(base + "/register");
  await page.getByLabel("First name", { exact: true }).fill("Synthetic");
  await page.getByLabel("Last name", { exact: true }).fill("Browser");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("status").waitFor();
  await db.user.findUniqueOrThrow({ where: { email } });
  const message = await db.outbox.findFirstOrThrow({
    where: { type: "VERIFY_EMAIL" },
    orderBy: { createdAt: "desc" },
  });
  const token = (message.payload as { token: string }).token;
  await page.goto(base + "/verify");
  await page.getByLabel("Email token").fill(token);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("status").waitFor();
  await page.goto(base + "/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL("**/account");
  await page.goto(base + "/search?q=Synthetic");
  await page.getByRole("heading", { name: "Search products" }).waitFor();
  await page.goto(base + "/product/" + fixture.productSlug);
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Added to cart" }).waitFor();
  await page.goto(base + "/cart");
  await page.getByRole("heading", { name: "Order summary" }).waitFor();
  await page.goto(base + "/account/addresses");
  for (const [field, value] of Object.entries({
    label: "Browser test",
    recipientName: "Synthetic Browser",
    phone: "0000000000",
    emirate: "Test",
    city: "Test",
    street: "Synthetic test address",
  })) {
    await page.locator(`input[name="${field}"]`).fill(value);
  }
  await page.getByRole("button", { name: "Save address" }).click();
  await page.getByText("Browser test: Synthetic test address, Test").waitFor();
  await page.goto(base + "/checkout");
  await page
    .getByLabel("Address", { exact: true })
    .selectOption({ label: "Browser test: Synthetic test address, Test" });
  await page.getByRole("button", { name: "Review server total" }).click();
  await page.getByRole("heading", { name: "Review order" }).waitFor();
  await page.getByRole("button", { name: "Simulate payment success" }).click();
  await page.waitForURL("**/confirmation");
  await page.getByText("Order: PAID · Payment: PAID").waitFor();
  await page.reload();
  await page.getByText("Order: PAID · Payment: PAID").waitFor();
  await page.goto(base + "/account/orders");
  await page.getByText("Order: PAID · Payment: PAID").waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  assert.deepEqual(failures, []);
  console.log(
    "PASS mobile browser register → verify → login → search → product → cart → checkout → test payment → confirmation refresh → order history",
  );
  const product = await db.product.findUniqueOrThrow({
    where: { slug: fixture.productSlug },
  });
  await db.productMedia.createMany({
    data: [
      {
        productId: product.id,
        type: "IMAGE",
        url: "/missing-test-image.jpg",
        altText: "Synthetic missing image",
      },
      {
        productId: product.id,
        type: "VIDEO",
        url: "/missing-test-video.mp4",
        altText: "Synthetic missing video",
      },
    ],
  });
  await page.goto(base + "/product/" + fixture.productSlug);
  await page.getByText("Product image is unavailable.").waitFor();
  await page.locator("video").evaluate(async (video: HTMLVideoElement) => {
    try {
      await video.play();
    } catch {}
  });
  await page.getByText("Video is unavailable.", { exact: false }).waitFor();
  console.log(
    "PASS missing product image and failed video show readable fallbacks",
  );
  await page.screenshot({
    path: process.env.TEST_ARTIFACT_DIR + "/mobile-test.png",
    fullPage: true,
  });
} finally {
  await context.close();
  await db.$disconnect();
}
