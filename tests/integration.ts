import assert from "node:assert/strict";
import { db } from "../packages/database/src/client";
const base = process.env.TEST_ORIGIN ?? "http://localhost:3000";
let cookie = "";
let passed = 0;
async function call(
  path: string,
  method = "GET",
  body?: unknown,
  useCookie = true,
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(useCookie && cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie && useCookie) {
    const sessions = [
      ...setCookie.matchAll(/(ascc_session|ascc_guest)=([^;]*)/g),
    ].filter((m) => m[2]);
    if (sessions.length)
      cookie = sessions.map((m) => `${m[1]}=${m[2]}`).join("; ");
  }
  const data = await response.json();
  return { status: response.status, data };
}
function ok(name: string) {
  passed++;
  console.log(`PASS ${name}`);
}
const suffix = Date.now();
const email = `synthetic-${suffix}@example.test`;
const password = "Synthetic-password-123!";
try {
  const department = await db.department.create({
    data: {
      name: "Synthetic test department",
      slug: `synthetic-dept-${suffix}`,
    },
  });
  const category = await db.category.create({
    data: {
      name: "Synthetic test category",
      slug: `synthetic-category-${suffix}`,
      departmentId: department.id,
    },
  });
  const brand = await db.brand.create({
    data: { name: "Synthetic test brand", slug: `synthetic-brand-${suffix}` },
  });
  const tax = await db.taxClass.create({
    data: { name: `Synthetic tax ${suffix}`, rate: "0.05" },
  });
  const product = await db.product.create({
    data: {
      name: "Synthetic test product — not for sale",
      slug: `synthetic-product-${suffix}`,
      brandId: brand.id,
      categoryId: category.id,
      status: "ACTIVE",
      variants: {
        create: {
          sku: `TEST-${suffix}`,
          title: "Synthetic variant",
          price: "10.00",
          taxClassId: tax.id,
          basicAvailability: 5,
        },
      },
    },
    include: { variants: true },
  });
  const variant = product.variants[0]!;
  assert.equal(
    (await call("/api/account", "GET", undefined, false)).status,
    401,
  );
  ok("private account rejects guest");
  assert.equal(
    (
      await call("/api/cart", "POST", {
        variantId: variant.id,
        quantity: 1,
        price: "0.01",
      })
    ).status,
    400,
  );
  ok("browser price rejected");
  assert.equal(
    (await call("/api/cart", "POST", { variantId: variant.id, quantity: 1 }))
      .status,
    200,
  );
  ok("guest cart persists");
  assert.equal(
    (
      await call("/api/auth/register", "POST", {
        email,
        password,
        firstName: "Synthetic",
        lastName: "Customer",
      })
    ).status,
    200,
  );
  ok("registration persists hashed password");
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  assert.notEqual(user.passwordHash, password);
  assert.equal(
    (await call("/api/auth/login", "POST", { email, password })).status,
    403,
  );
  ok("unverified account cannot log in");
  const message = await db.outbox.findFirstOrThrow({
    where: { type: "VERIFY_EMAIL" },
    orderBy: { createdAt: "desc" },
  });
  const token = (message.payload as { token: string }).token;
  assert.equal((await call("/api/auth/verify", "POST", { token })).status, 200);
  assert.equal((await call("/api/auth/verify", "POST", { token })).status, 400);
  ok("email verification token is single use");
  assert.equal(
    (await call("/api/auth/login", "POST", { email, password })).status,
    200,
  );
  ok("login creates session and merges guest cart");
  const cart = await call("/api/cart");
  assert.equal(cart.data.items.length, 1);
  assert.equal(cart.data.totals.grandTotal, "10.50");
  ok("server price and VAT");
  const catalogue = await call(
    "/api/catalog?q=" + encodeURIComponent(variant.sku),
  );
  assert.equal(catalogue.data.length, 1);
  ok("search by SKU");
  assert.equal(
    (await call("/api/wishlist", "POST", { variantId: variant.id })).status,
    200,
  );
  assert.equal((await call("/api/wishlist")).data.length, 1);
  ok("wishlist persistence");
  const address = await call("/api/addresses", "POST", {
    label: "Test",
    recipientName: "Synthetic Customer",
    phone: "0000000000",
    country: "AE",
    emirate: "Synthetic",
    city: "Synthetic",
    street: "Synthetic test address",
  });
  assert.equal(address.status, 200);
  ok("address persists without coordinates");
  assert.equal(
    (await call("/api/cart", "POST", { variantId: variant.id, quantity: 999 }))
      .status,
    409,
  );
  ok("excess stock rejected");
  const key = crypto.randomUUID();
  const input = {
    idempotencyKey: key,
    addressId: address.data.id,
    fulfilmentMethod: "PICKUP",
  };
  const checkout = await call("/api/checkout", "POST", input);
  assert.equal(checkout.status, 200);
  const repeated = await call("/api/checkout", "POST", input);
  assert.equal(checkout.data.orderId, repeated.data.orderId);
  assert.equal(
    await db.order.count({ where: { id: checkout.data.orderId } }),
    1,
  );
  ok("checkout replay creates one order");
  const reserved = await db.productVariant.findUniqueOrThrow({
    where: { id: variant.id },
  });
  assert.equal(reserved.reservedQuantity, 1);
  assert.equal(reserved.basicAvailability, 5);
  ok("stock reservation recorded before payment");
  const history = await call("/api/orders");
  assert.equal(history.data[0].paymentStatus, "PENDING");
  ok("confirmation redirect does not mark paid");
  assert.equal(
    (await call("/api/payments/webhook", "POST", { status: "PAID" }, false))
      .status,
    401,
  );
  ok("unsigned webhook rejected");
  const payment = await call("/api/payments/test", "POST", {
    orderId: checkout.data.orderId,
  });
  assert.equal(payment.status, 200);
  assert.equal(
    (
      await call("/api/payments/test", "POST", {
        orderId: checkout.data.orderId,
      })
    ).status,
    200,
  );
  ok("duplicate payment event processed once");
  const paid = await db.order.findUniqueOrThrow({
    where: { id: checkout.data.orderId },
    include: { items: true },
  });
  assert.equal(paid.paymentStatus, "PAID");
  assert.equal(paid.grandTotal.toFixed(2), "10.50");
  assert.equal(paid.items[0]!.taxRateSnapshot.toString(), "0.05");
  const stock = await db.productVariant.findUniqueOrThrow({
    where: { id: variant.id },
  });
  assert.equal(stock.basicAvailability, 4);
  assert.equal(stock.reservedQuantity, 0);
  assert.equal(
    await db.inventoryMovement.count({
      where: { variantId: variant.id, type: "SALE" },
    }),
    1,
  );
  ok("payment converts reservation and records one sale");
  await db.productVariant.update({
    where: { id: variant.id },
    data: { price: "20.00" },
  });
  assert.equal((await call("/api/orders")).data[0].grandTotal, "10.5");
  ok("historic order total does not change with catalogue");
  await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  const adminGet = await fetch("http://localhost:3001/api/manage/products", {
    headers: { Cookie: cookie },
  });
  assert.equal(adminGet.status, 200);
  ok("authorized admin can read catalogue");
  const adminCreate = await fetch("http://localhost:3001/api/manage/brands", {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "http://localhost:3001",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Synthetic admin brand",
      slug: `synthetic-admin-${suffix}`,
      description: "Isolated test only",
    }),
  });
  assert.equal(adminCreate.status, 200);
  const createdBrand = (await adminCreate.json()) as { id: string };
  assert.equal(
    await db.auditLog.count({
      where: {
        actorId: user.id,
        entityId: createdBrand.id,
        action: "BRAND_CREATE",
      },
    }),
    1,
  );
  ok("admin catalogue change creates audit record");
  await call("/api/cart", "POST", { variantId: variant.id, quantity: 1 });
  await db.productVariant.update({
    where: { id: variant.id },
    data: { basicAvailability: 0 },
  });
  assert.equal(
    (
      await call("/api/checkout", "POST", {
        ...input,
        idempotencyKey: crypto.randomUUID(),
      })
    ).status,
    409,
  );
  await db.productVariant.update({
    where: { id: variant.id },
    data: { basicAvailability: 4 },
  });
  ok("stock changed before checkout is revalidated");
  const expiring = await call("/api/checkout", "POST", {
    ...input,
    idempotencyKey: crypto.randomUUID(),
  });
  assert.equal(expiring.status, 200);
  await db.inventoryReservation.updateMany({
    where: { orderId: expiring.data.orderId },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const { spawn } = await import("node:child_process");
  const worker = spawn(
    process.execPath,
    ["--import", "tsx", "src/run.ts", "--once"],
    {
      cwd: new URL("../apps/worker", import.meta.url),
      env: process.env,
      stdio: "inherit",
    },
  );
  assert.equal(await new Promise((resolve) => worker.on("exit", resolve)), 0);
  assert.equal(
    (await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } }))
      .reservedQuantity,
    0,
  );
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: expiring.data.orderId } }))
      .status,
    "CANCELLED",
  );
  ok("expired reservation is released automatically");
  const customer = await db.customer.findUniqueOrThrow({
    where: { userId: user.id },
  });
  const stranger = await db.user.create({
    data: {
      email: `stranger-${suffix}@example.test`,
      passwordHash: user.passwordHash,
      emailVerifiedAt: new Date(),
      customer: {
        create: {
          email: `stranger-${suffix}@example.test`,
          firstName: "Other",
          lastName: "Test",
        },
      },
    },
  });
  const ownCookie = cookie;
  cookie = "";
  await call("/api/auth/login", "POST", { email: stranger.email, password });
  assert.equal((await call("/api/orders")).data.length, 0);
  assert.equal(
    (
      await fetch("http://localhost:3001/api/manage/products", {
        headers: { Cookie: cookie },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/api/payments/test", "POST", {
        orderId: checkout.data.orderId,
      })
    ).status,
    404,
  );
  ok("cross-customer order access rejected");
  cookie = ownCookie;
  assert.equal((await call("/api/auth/forgot", "POST", { email })).status, 200);
  const resetMessage = await db.outbox.findFirstOrThrow({
    where: { type: "RESET_PASSWORD" },
    orderBy: { createdAt: "desc" },
  });
  const resetToken = (resetMessage.payload as { token: string }).token;
  assert.equal(
    (
      await call("/api/auth/reset", "POST", {
        token: resetToken,
        password: "Changed-password-123!",
      })
    ).status,
    200,
  );
  assert.equal((await call("/api/account")).status, 401);
  assert.equal(
    (await call("/api/auth/reset", "POST", { token: resetToken, password }))
      .status,
    400,
  );
  ok("password reset revokes sessions and token replay");
  assert.equal(
    (
      await call("/api/auth/login", "POST", {
        email,
        password: "Changed-password-123!",
      })
    ).status,
    200,
  );
  await db.outbox.deleteMany({
    where: { type: { in: ["VERIFY_EMAIL", "RESET_PASSWORD"] } },
  });
  const enquiryKey = crypto.randomUUID();
  const enquiryInput = {
    kind: "QUOTE",
    name: "Synthetic Enquiry",
    email: `enquiry-${suffix}@example.test`,
    phone: "0500000000",
    serviceSlug: "ppf",
    idempotencyKey: enquiryKey,
  };
  const enquiry = await call("/api/enquiries", "POST", enquiryInput, false);
  assert.equal(enquiry.status, 200);
  const repeatedEnquiry = await call("/api/enquiries", "POST", enquiryInput, false);
  assert.equal(repeatedEnquiry.status, 200);
  assert.equal(repeatedEnquiry.data.id, enquiry.data.id);
  assert.equal(await db.enquiry.count({ where: { idempotencyKey: enquiryKey } }), 1);
  assert.equal(
    (
      await call(
        "/api/enquiries",
        "POST",
        { ...enquiryInput, idempotencyKey: crypto.randomUUID(), serviceSlug: "unknown-service" },
        false,
      )
    ).status,
    400,
  );
  ok("enquiry persists once and rejects unknown service");
  console.log(`Integration checks passed: ${passed}`);
  // Fixture details are for isolated browser tests, never production import.
  await import("node:fs/promises").then((fs) =>
    fs.writeFile(
      process.env.TEST_ARTIFACT_DIR + "/fixture.json",
      JSON.stringify({
        email,
        password: "Changed-password-123!",
        productSlug: product.slug,
        variantId: variant.id,
        orderNumber: paid.orderNumber,
        customerId: customer.id,
      }),
    ),
  );
} finally {
  await db.$disconnect();
}
