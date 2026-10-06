import { db } from "@autosport/database";
import { Prisma } from "@prisma/client";
async function expireReservations() {
  await db.$transaction(
    async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
        take: 100,
      });
      for (const r of reservations) {
        const claimed = await tx.inventoryReservation.updateMany({
          where: { id: r.id, status: "ACTIVE" },
          data: { status: "EXPIRED" },
        });
        if (!claimed.count) continue;
        await tx.productVariant.update({
          where: { id: r.variantId },
          data: { reservedQuantity: { decrement: r.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: r.variantId,
            quantity: -r.quantity,
            type: "RESERVATION_RELEASE",
            referenceId: r.orderId,
          },
        });
        const cancelled = await tx.order.updateMany({
          where: { id: r.orderId, status: "PENDING_PAYMENT" },
          data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
        });
        if (cancelled.count)
          await tx.orderEvent.create({
            data: {
              orderId: r.orderId,
              type: "RESERVATION_EXPIRED",
              actorType: "SYSTEM",
            },
          });
        await tx.payment.updateMany({
          where: { orderId: r.orderId, status: "PENDING" },
          data: { status: "CANCELLED" },
        });
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
async function deliverEmail() {
  const endpoint = process.env.EMAIL_API_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const origin = process.env.APP_ORIGIN;
  if (!endpoint || !apiKey || !from || !origin) return;
  const message = await db.outbox.findFirst({
    where: {
      processedAt: null,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 300000) } },
      ],
      type: { in: ["VERIFY_EMAIL", "RESET_PASSWORD"] },
      attempts: { lt: 8 },
    },
    orderBy: { createdAt: "asc" },
  });
  if (!message) return;
  const claimed = await db.outbox.updateMany({
    where: {
      id: message.id,
      processedAt: null,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 300000) } },
      ],
    },
    data: { lockedAt: new Date(), attempts: { increment: 1 } },
  });
  if (!claimed.count) return;
  const payload = message.payload as { email: string; token: string };
  try {
    const route = message.type === "VERIFY_EMAIL" ? "verify" : "reset";
    const subject =
      message.type === "VERIFY_EMAIL"
        ? "Verify your account"
        : "Reset your password";
    const response = await fetch(endpoint, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.id,
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        subject,
        text: `${subject}: ${origin}/${route}\n\nYour one-time token: ${payload.token}`,
      }),
    });
    if (!response.ok) throw new Error("EMAIL_PROVIDER_FAILED");
    await db.outbox.update({
      where: { id: message.id },
      data: { processedAt: new Date(), lockedAt: null, payload: {} },
    });
  } catch {
    await db.outbox.update({
      where: { id: message.id },
      data: { lockedAt: null },
    });
    console.error(
      JSON.stringify({ event: "email_delivery_failed", jobId: message.id }),
    );
  }
}
let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    await expireReservations();
    await deliverEmail();
  } catch {
    console.error(JSON.stringify({ event: "worker_tick_failed" }));
  } finally {
    running = false;
  }
}
await tick();
if (process.argv.includes("--once")) await db.$disconnect();
else setInterval(() => void tick(), 30000);
