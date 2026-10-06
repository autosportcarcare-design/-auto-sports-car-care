import { createHmac } from "node:crypto";
import { db } from "@autosport/database";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ApiError, requireCustomer } from "./security";
import { verifySignature } from "../../../packages/payments/src/signature";
export async function paymentWebhook(body: string, signature: string) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !verifySignature(body, signature, secret))
    throw new ApiError("INVALID_SIGNATURE", 401);
  const event = z
    .object({
      eventId: z.string().min(1).max(100),
      providerReference: z.string().min(1),
      status: z.literal("PAID"),
      amount: z.string().regex(/^\d+\.\d{2}$/),
      currency: z.literal("AED"),
    })
    .strict()
    .parse(JSON.parse(body));
  try {
    return await db.$transaction(
      async (tx) => {
        if (
          await tx.processedWebhook.findUnique({
            where: {
              provider_eventId: { provider: "TEST", eventId: event.eventId },
            },
          })
        )
          return { ok: true, duplicate: true };
        const payment = await tx.payment.findUnique({
          where: { providerReference: event.providerReference },
          include: { order: true },
        });
        if (
          !payment ||
          payment.provider !== "TEST" ||
          !payment.amount.equals(event.amount) ||
          payment.currency !== event.currency
        )
          throw new ApiError("PAYMENT_MISMATCH");
        if (payment.status === "PAID") {
          await tx.processedWebhook.create({
            data: { provider: "TEST", eventId: event.eventId },
          });
          return { ok: true, duplicate: true };
        }
        if (payment.order.status !== "PENDING_PAYMENT")
          throw new ApiError("INVALID_ORDER_STATE", 409);
        const reservations = await tx.inventoryReservation.findMany({
          where: { orderId: payment.orderId, status: "ACTIVE" },
        });
        if (
          !reservations.length ||
          reservations.some((r) => r.expiresAt <= new Date())
        )
          throw new ApiError("RESERVATION_EXPIRED", 409);
        for (const r of reservations) {
          await tx.productVariant.update({
            where: { id: r.variantId },
            data: {
              basicAvailability: { decrement: r.quantity },
              reservedQuantity: { decrement: r.quantity },
            },
          });
          await tx.inventoryMovement.create({
            data: {
              variantId: r.variantId,
              quantity: -r.quantity,
              type: "SALE",
              referenceId: payment.orderId,
            },
          });
        }
        await tx.inventoryReservation.updateMany({
          where: { orderId: payment.orderId, status: "ACTIVE" },
          data: { status: "CONVERTED" },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID" },
        });
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            events: {
              create: { type: "PAYMENT_SUCCEEDED", actorType: "PROVIDER" },
            },
          },
        });
        await tx.processedWebhook.create({
          data: { provider: "TEST", eventId: event.eventId },
        });
        await tx.outbox.create({
          data: {
            type: "PAYMENT_SUCCEEDED",
            payload: { orderId: payment.orderId },
          },
        });
        return { ok: true };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { ok: true, duplicate: true };
    throw error;
  }
}
export async function testPayment(input: unknown) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_TEST_PAYMENTS !== "true"
  )
    throw new ApiError("TEST_PAYMENTS_DISABLED", 403);
  const data = z.object({ orderId: z.string() }).strict().parse(input);
  const customer = await requireCustomer();
  const order = await db.order.findFirst({
    where: { id: data.orderId, customerId: customer.id },
    include: { payments: true },
  });
  if (!order) throw new ApiError("NOT_FOUND", 404);
  const payment = order.payments[0];
  if (!payment) throw new ApiError("PAYMENT_NOT_FOUND");
  const body = JSON.stringify({
    eventId: `test_success_${payment.id}`,
    providerReference: payment.providerReference,
    status: "PAID",
    amount: payment.amount.toFixed(2),
    currency: "AED",
  });
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) throw new ApiError("PAYMENT_NOT_CONFIGURED", 503);
  // Explicit simulator invokes the exact signed-event handler used by the adapter.
  return paymentWebhook(
    body,
    createHmac("sha256", secret).update(body).digest("hex"),
  );
}
