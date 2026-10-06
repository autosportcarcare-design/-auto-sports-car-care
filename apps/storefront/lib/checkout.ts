import { getPaymentProvider } from "../../../packages/payments/src/provider";
import { db } from "@autosport/database";
import { Prisma } from "@prisma/client";
import { checkoutInput } from "@autosport/validation";
import { randomUUID } from "node:crypto";
import { calculatePricing } from "@autosport/commerce";
import { requireCustomer, ApiError } from "./security";
export async function checkout(input: unknown) {
  const data = checkoutInput.parse(input);
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_TEST_PAYMENTS !== "true"
  )
    throw new ApiError("PAYMENT_PROVIDER_NOT_CONFIGURED", 503);
  const customer = await requireCustomer();
  const scope = `checkout:${customer.id}`;
  // Real fulfilment must be configured by the business, not inferred from front-end choices.
  const method = process.env.FULFILMENT_METHOD;
  if (method !== data.fulfilmentMethod)
    throw new ApiError("FULFILMENT_NOT_CONFIGURED", 503);
  const shipping = process.env.SHIPPING_FEE;
  if (!shipping || !/^\d+\.\d{2}$/.test(shipping))
    throw new ApiError("SHIPPING_NOT_CONFIGURED", 503);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(
        async (tx) => {
          const previous = await tx.idempotencyKey.findUnique({
            where: { key_scope: { key: data.idempotencyKey, scope } },
          });
          if (previous?.response) return previous.response;
          const address = await tx.customerAddress.findFirst({
            where: { id: data.addressId, customerId: customer.id },
          });
          if (!address) throw new ApiError("ADDRESS_REQUIRED");
          const cart = await tx.cart.findFirst({
            where: { customerId: customer.id, status: "ACTIVE" },
            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      taxClass: true,
                      product: { include: { brand: true, category: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          });
          if (!cart?.items.length) throw new ApiError("CART_EMPTY");
          for (const item of cart.items) {
            const v = item.variant;
            if (
              v.status !== "ACTIVE" ||
              v.product.status !== "ACTIVE" ||
              !v.product.brand.active ||
              !v.product.category.active
            )
              throw new ApiError("PRODUCT_NOT_AVAILABLE", 409);
            if (v.basicAvailability - v.reservedQuantity < item.quantity)
              throw new ApiError("INSUFFICIENT_STOCK", 409);
          }
          const totals = calculatePricing(
            cart.items.map((i) => ({
              unitPrice: i.variant.price.toString(),
              quantity: i.quantity,
              taxRate: i.variant.taxClass.rate.toString(),
            })),
            shipping,
          );
          const order = await tx.order.create({
            data: {
              orderNumber: `AS-${randomUUID()}`,
              customerId: customer.id,
              fulfilmentMethod: data.fulfilmentMethod,
              ...totals,
              shippingAddressSnapshot: JSON.parse(
                JSON.stringify(address),
              ) as Prisma.InputJsonValue,
              billingAddressSnapshot: JSON.parse(
                JSON.stringify(address),
              ) as Prisma.InputJsonValue,
              items: {
                create: cart.items.map((i) => {
                  const line = calculatePricing([
                    {
                      unitPrice: i.variant.price.toString(),
                      quantity: i.quantity,
                      taxRate: i.variant.taxClass.rate.toString(),
                    },
                  ]);
                  return {
                    variantId: i.variant.id,
                    skuSnapshot: i.variant.sku,
                    productNameSnapshot: i.variant.product.name,
                    variantNameSnapshot: i.variant.title,
                    unitPrice: i.variant.price,
                    quantity: i.quantity,
                    tax: line.taxTotal,
                    taxRateSnapshot: i.variant.taxClass.rate,
                    lineTotal: line.grandTotal,
                  };
                }),
              },
              events: {
                create: {
                  type: "ORDER_CREATED",
                  actorType: "CUSTOMER",
                  actorId: customer.id,
                },
              },
            },
          });
          for (const item of cart.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { reservedQuantity: { increment: item.quantity } },
            });
            await tx.inventoryReservation.create({
              data: {
                orderId: order.id,
                variantId: item.variantId,
                quantity: item.quantity,
                expiresAt: new Date(Date.now() + 15 * 60000),
              },
            });
            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                quantity: item.quantity,
                type: "RESERVATION",
                referenceId: order.id,
              },
            });
          }
          const providerResult = await getPaymentProvider().createPayment({
            orderId: order.id,
            amount: order.grandTotal.toFixed(2),
            currency: order.currency,
            idempotencyKey: data.idempotencyKey,
          });
          await tx.payment.create({
            data: {
              orderId: order.id,
              provider: "TEST",
              providerReference: providerResult.providerReference,
              amount: order.grandTotal,
              currency: "AED",
            },
          });
          await tx.cart.update({
            where: { id: cart.id },
            data: { status: "CHECKED_OUT", ownerKey: null },
          });
          const response = {
            orderNumber: order.orderNumber,
            orderId: order.id,
            grandTotal: order.grandTotal.toString(),
            paymentStatus: "PENDING",
            testMode: true,
          };
          await tx.idempotencyKey.create({
            data: {
              key: data.idempotencyKey,
              scope,
              response,
              expiresAt: new Date(Date.now() + 86400000),
            },
          });
          return response;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2034", "P2002"].includes(error.code) &&
        attempt < 2
      )
        continue;
      throw error;
    }
  }
  throw new ApiError("CHECKOUT_RETRY", 409);
}
