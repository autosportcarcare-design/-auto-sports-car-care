import { db } from "@autosport/database";
import { z } from "zod";
import { cartItemInput } from "@autosport/validation";
import { calculatePricing } from "@autosport/commerce";
import { ApiError, requireCustomer, currentUser } from "./security";
import { cookies } from "next/headers";
import { opaqueToken, digest } from "../../../packages/auth/src/credentials";
export async function customerCart() {
  const user = await currentUser();
  const jar = await cookies();
  if (user?.customer) {
    const ownerKey = `customer:${user.customer.id}`;
    return db.cart.upsert({
      where: { ownerKey },
      create: { ownerKey, customerId: user.customer.id },
      update: {},
    });
  }
  let token = jar.get("ascc_guest")?.value;
  if (!token) {
    token = opaqueToken();
    jar.set("ascc_guest", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 86400,
    });
  }
  const ownerKey = `guest:${digest(token)}`;
  return db.cart.upsert({
    where: { ownerKey },
    create: { ownerKey, sessionId: digest(token) },
    update: {},
  });
}
export async function cartDetail() {
  const cart = await customerCart();
  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      variant: {
        include: {
          product: { include: { brand: true, media: true } },
          taxClass: true,
        },
      },
    },
  });
  return {
    id: cart.id,
    items,
    totals: calculatePricing(
      items.map((i) => ({
        unitPrice: i.variant.price.toString(),
        quantity: i.quantity,
        taxRate: i.variant.taxClass.rate.toString(),
      })),
    ),
  };
}
export async function setCartItem(input: unknown) {
  const data = cartItemInput.parse(input);
  const cart = await customerCart();
  const variant = await db.productVariant.findFirst({
    where: {
      id: data.variantId,
      status: "ACTIVE",
      product: {
        status: "ACTIVE",
        brand: { active: true },
        category: { active: true },
      },
    },
  });
  if (!variant) throw new ApiError("PRODUCT_NOT_AVAILABLE");
  if (variant.basicAvailability - variant.reservedQuantity < data.quantity)
    throw new ApiError("INSUFFICIENT_STOCK", 409);
  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    create: { cartId: cart.id, variantId: variant.id, quantity: data.quantity },
    update: { quantity: data.quantity },
  });
  return cartDetail();
}
export async function removeCartItem(input: unknown) {
  const data = z.object({ variantId: z.string() }).strict().parse(input);
  const cart = await customerCart();
  await db.cartItem.deleteMany({
    where: { cartId: cart.id, variantId: data.variantId },
  });
  return cartDetail();
}
export async function wishlist() {
  const customer = await requireCustomer();
  let list = await db.savedList.findFirst({
    where: { customerId: customer.id, type: "WISHLIST" },
  });
  if (!list)
    list = await db.savedList.create({
      data: { customerId: customer.id, name: "Wishlist", type: "WISHLIST" },
    });
  return list;
}
export async function wishlistDetail() {
  const list = await wishlist();
  return db.savedListItem.findMany({
    where: { savedListId: list.id },
    include: { variant: { include: { product: true } } },
  });
}
export async function setWishlist(input: unknown, remove = false) {
  const data = z.object({ variantId: z.string() }).strict().parse(input);
  const list = await wishlist();
  if (remove) {
    await db.savedListItem.deleteMany({
      where: { savedListId: list.id, variantId: data.variantId },
    });
  } else {
    const active = await db.productVariant.findFirst({
      where: {
        id: data.variantId,
        status: "ACTIVE",
        product: { status: "ACTIVE" },
      },
    });
    if (!active) throw new ApiError("PRODUCT_NOT_AVAILABLE");
    await db.savedListItem.upsert({
      where: {
        savedListId_variantId: {
          savedListId: list.id,
          variantId: data.variantId,
        },
      },
      create: { savedListId: list.id, variantId: data.variantId },
      update: {},
    });
  }
  return wishlistDetail();
}
