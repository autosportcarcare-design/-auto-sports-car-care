import { db } from "@autosport/database";
import { z } from "zod";
import { requireCustomer, requireUser, ApiError } from "./security";
export async function account() {
  const user = await requireUser();
  return {
    id: user.id,
    email: user.email,
    customer: user.customer,
    sessions: await db.session.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, createdAt: true, expiresAt: true },
    }),
  };
}
export async function addresses() {
  const customer = await requireCustomer();
  return db.customerAddress.findMany({ where: { customerId: customer.id } });
}
export async function addAddress(input: unknown) {
  const customer = await requireCustomer();
  const data = z
    .object({
      label: z.string().min(1).max(40),
      recipientName: z.string().min(1).max(120),
      phone: z.string().min(7).max(30),
      country: z.literal("AE"),
      emirate: z.string().min(1).max(80),
      city: z.string().min(1).max(80),
      street: z.string().min(1).max(200),
      building: z.string().max(100).optional(),
      unit: z.string().max(40).optional(),
    })
    .strict()
    .parse(input);
  return db.customerAddress.create({
    data: {
      ...data,
      building: data.building ?? null,
      unit: data.unit ?? null,
      customerId: customer.id,
    },
  });
}
export async function orders() {
  const customer = await requireCustomer();
  return db.order.findMany({
    where: { customerId: customer.id },
    include: { items: true, events: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
export async function revokeSession(input: unknown) {
  const user = await requireUser();
  const data = z.object({ sessionId: z.string() }).strict().parse(input);
  const updated = await db.session.updateMany({
    where: { id: data.sessionId, userId: user.id },
    data: { revokedAt: new Date() },
  });
  if (!updated.count) throw new ApiError("NOT_FOUND", 404);
  return { ok: true };
}
