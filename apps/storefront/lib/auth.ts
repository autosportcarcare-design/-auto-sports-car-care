import { cookies } from "next/headers";
import { db } from "@autosport/database";
import { z } from "zod";
import {
  digest,
  hashPassword,
  verifyPassword,
  opaqueToken,
} from "../../../packages/auth/src/credentials";
import { ApiError } from "./security";
const email = z
  .string()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase().trim());
const password = z.string().min(12).max(128);
async function rateLimit(key: string, limit: number) {
  const window = new Date(Math.floor(Date.now() / 900000) * 900000);
  const bucket = await db.loginAttempt.upsert({
    where: { email_window: { email: key, window } },
    create: { email: key, window, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (bucket.count > limit) throw new ApiError("TRY_AGAIN_LATER", 429);
}
export async function register(input: unknown) {
  const data = z
    .object({
      email,
      password,
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().min(1).max(80),
    })
    .strict()
    .parse(input);
  await rateLimit("register:global", 100);
  await rateLimit("register:" + data.email, 4);
  const token = opaqueToken();
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashPassword(data.password),
          customer: {
            create: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
            },
          },
        },
      });
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash: digest(token),
          expiresAt: new Date(Date.now() + 24 * 3600000),
        },
      });
      await tx.outbox.create({
        data: { type: "VERIFY_EMAIL", payload: { email: data.email, token } },
      });
    });
  } catch {
    throw new ApiError("REGISTRATION_UNAVAILABLE", 409);
  }
  return { message: "Check your email for account verification." };
}
export async function login(input: unknown) {
  const data = z
    .object({ email, password: z.string().min(1).max(128) })
    .strict()
    .parse(input);
  const window = new Date(Math.floor(Date.now() / 900000) * 900000);
  const bucket = await db.loginAttempt.upsert({
    where: { email_window: { email: data.email, window } },
    create: { email: data.email, window, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (bucket.count > 8) throw new ApiError("TRY_AGAIN_LATER", 429);
  const user = await db.user.findUnique({ where: { email: data.email } });
  // Perform the same expensive hash check when an account does not exist.
  const fallback = "scrypt:00000000000000000000000000000000:" + "0".repeat(128);
  const valid = verifyPassword(data.password, user?.passwordHash ?? fallback);
  if (!user || !valid || !user.active)
    throw new ApiError("INVALID_CREDENTIALS", 401);
  if (!user.emailVerifiedAt) throw new ApiError("EMAIL_NOT_VERIFIED", 403);
  const token = opaqueToken();
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await db.session.create({
    data: { userId: user.id, tokenHash: digest(token), expiresAt },
  });
  const guest = (await cookies()).get("ascc_guest")?.value;
  if (guest) {
    await db.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { userId: user.id },
      });
      if (!customer) return;
      const guestCart = await tx.cart.findUnique({
        where: { ownerKey: `guest:${digest(guest)}` },
        include: { items: true },
      });
      if (!guestCart) return;
      const ownerKey = `customer:${customer.id}`;
      const target = await tx.cart.upsert({
        where: { ownerKey },
        create: { ownerKey, customerId: customer.id },
        update: {},
      });
      for (const item of guestCart.items) {
        const variant = await tx.productVariant.findFirst({
          where: {
            id: item.variantId,
            status: "ACTIVE",
            product: { status: "ACTIVE" },
          },
        });
        if (!variant) continue;
        const existing = await tx.cartItem.findUnique({
          where: {
            cartId_variantId: { cartId: target.id, variantId: variant.id },
          },
        });
        const quantity = Math.min(
          999,
          (existing?.quantity ?? 0) + item.quantity,
        );
        if (quantity > variant.basicAvailability - variant.reservedQuantity)
          continue;
        await tx.cartItem.upsert({
          where: {
            cartId_variantId: { cartId: target.id, variantId: variant.id },
          },
          create: { cartId: target.id, variantId: variant.id, quantity },
          update: { quantity },
        });
      }
      await tx.cart.delete({ where: { id: guestCart.id } });
    });
    (await cookies()).delete("ascc_guest");
  }
  (await cookies()).set("ascc_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return { ok: true };
}
export async function verify(input: unknown) {
  const { token } = z
    .object({ token: z.string().length(64) })
    .strict()
    .parse(input);
  await db.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({
      where: { tokenHash: digest(token) },
    });
    if (!record || record.expiresAt < new Date())
      throw new ApiError("INVALID_TOKEN");
    const consumed = await tx.verificationToken.deleteMany({
      where: { id: record.id },
    });
    if (consumed.count !== 1) throw new ApiError("INVALID_TOKEN");
    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
  });
  return { ok: true };
}
export async function forgot(input: unknown) {
  const data = z.object({ email }).strict().parse(input);
  await rateLimit("forgot:global", 100);
  await rateLimit("forgot:" + data.email, 4);
  const user = await db.user.findUnique({ where: { email: data.email } });
  if (user) {
    const token = opaqueToken();
    await db.$transaction(async (tx) => {
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: digest(token),
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      await tx.outbox.create({
        data: { type: "RESET_PASSWORD", payload: { email: user.email, token } },
      });
    });
  }
  return { message: "If the account exists, a reset email will be sent." };
}
export async function reset(input: unknown) {
  const data = z
    .object({ token: z.string().length(64), password })
    .strict()
    .parse(input);
  await db.$transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({
      where: { tokenHash: digest(data.token) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date())
      throw new ApiError("INVALID_TOKEN");
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) throw new ApiError("INVALID_TOKEN");
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashPassword(data.password) },
    });
    await tx.session.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: new Date() },
    });
  });
  return { ok: true };
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get("ascc_session")?.value;
  if (token)
    await db.session.updateMany({
      where: { tokenHash: digest(token) },
      data: { revokedAt: new Date() },
    });
  jar.delete("ascc_session");
  return { ok: true };
}
