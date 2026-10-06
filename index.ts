import { z } from "zod";
export const cartItemInput = z
  .object({
    variantId: z.string().cuid(),
    quantity: z.number().int().min(1).max(999),
  })
  .strict();
export const checkoutInput = z
  .object({
    addressId: z.string().cuid(),
    fulfilmentMethod: z.enum(["DELIVERY", "PICKUP"]),
    idempotencyKey: z.string().uuid(),
  })
  .strict();
export const productInput = z
  .object({
    brandId: z.string().cuid(),
    categoryId: z.string().cuid(),
    name: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .max(150)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    shortDescription: z.string().max(1000).optional(),
    longDescription: z.string().max(10000).optional(),
  })
  .strict();
