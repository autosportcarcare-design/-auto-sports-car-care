import { db } from "@autosport/database";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin, ApiError } from "../../storefront/lib/security";
const text = z.string().trim().min(1).max(200);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(150);
const money = z.string().regex(/^\d{1,9}\.\d{2}$/);
const status = z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]);
export async function readAdmin(kind: string) {
  await requireAdmin();
  switch (kind) {
    case "products":
      return db.product.findMany({
        include: {
          brand: true,
          category: true,
          variants: { include: { taxClass: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    case "brands":
      return db.brand.findMany({ take: 100, orderBy: { name: "asc" } });
    case "departments":
      return db.department.findMany({ take: 100 });
    case "categories":
      return db.category.findMany({ include: { department: true }, take: 100 });
    case "orders":
      return db.order.findMany({
        include: { items: true },
        take: 50,
        orderBy: { createdAt: "desc" },
      });
    case "customers":
      return db.customer.findMany({
        select: { id: true, email: true, firstName: true, lastName: true },
        take: 50,
      });
    default:
      throw new ApiError("NOT_FOUND", 404);
  }
}
export async function mutateAdmin(kind: string, input: unknown) {
  const actor = await requireAdmin();
  return db.$transaction(
    async (tx) => {
      if (kind === "brands") {
        const data = z
          .object({
            name: text,
            slug,
            description: z.string().max(2000).default(""),
          })
          .strict()
          .parse(input);
        const brand = await tx.brand.create({ data });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "BRAND_CREATE",
            entityType: "Brand",
            entityId: brand.id,
            afterData: data,
          },
        });
        return brand;
      }
      if (kind === "departments") {
        const data = z.object({ name: text, slug }).strict().parse(input);
        const department = await tx.department.create({ data });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "DEPARTMENT_CREATE",
            entityType: "Department",
            entityId: department.id,
            afterData: data,
          },
        });
        return department;
      }
      if (kind === "categories") {
        const data = z
          .object({ name: text, slug, departmentId: text })
          .strict()
          .parse(input);
        const category = await tx.category.create({ data });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "CATEGORY_CREATE",
            entityType: "Category",
            entityId: category.id,
            afterData: data,
          },
        });
        return category;
      }
      if (kind === "products") {
        const data = z
          .object({
            name: text,
            slug,
            brandId: text,
            categoryId: text,
            shortDescription: z.string().max(1000).default(""),
            longDescription: z.string().max(10000).default(""),
            status,
            sku: text,
            variantTitle: text,
            price: money,
            taxRate: z.string().regex(/^0(?:\.\d{1,4})?$|^1(?:\.0{1,4})?$/),
            onHand: z.coerce.number().int().min(0).max(1000000),
          })
          .strict()
          .parse(input);
        const tax = await tx.taxClass.upsert({
          where: { name: `Configured ${data.taxRate}` },
          create: { name: `Configured ${data.taxRate}`, rate: data.taxRate },
          update: {},
        });
        const product = await tx.product.create({
          data: {
            name: data.name,
            slug: data.slug,
            brandId: data.brandId,
            categoryId: data.categoryId,
            shortDescription: data.shortDescription,
            longDescription: data.longDescription,
            status: data.status,
            variants: {
              create: {
                sku: data.sku,
                title: data.variantTitle,
                price: data.price,
                taxClassId: tax.id,
                basicAvailability: data.onHand,
              },
            },
          },
          include: { variants: true },
        });
        const variant = product.variants[0];
        if (variant)
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              quantity: data.onHand,
              type: "ADJUSTMENT",
              referenceId: product.id,
            },
          });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "PRODUCT_CREATE",
            entityType: "Product",
            entityId: product.id,
            afterData: data,
          },
        });
        return product;
      }
      if (kind === "variant") {
        const data = z
          .object({
            id: text,
            price: money,
            onHand: z.coerce.number().int().min(0).max(1000000),
            title: text,
            status,
          })
          .strict()
          .parse(input);
        const before = await tx.productVariant.findUnique({
          where: { id: data.id },
        });
        if (!before) throw new ApiError("NOT_FOUND", 404);
        if (data.onHand < before.reservedQuantity)
          throw new ApiError("STOCK_BELOW_RESERVED", 409);
        const variant = await tx.productVariant.update({
          where: { id: data.id },
          data: {
            price: data.price,
            basicAvailability: data.onHand,
            title: data.title,
            status: data.status,
          },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: variant.id,
            quantity: data.onHand - before.basicAvailability,
            type: "ADJUSTMENT",
            referenceId: actor.id,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "VARIANT_UPDATE",
            entityType: "ProductVariant",
            entityId: variant.id,
            beforeData: JSON.parse(
              JSON.stringify(before),
            ) as Prisma.InputJsonValue,
            afterData: data,
          },
        });
        return variant;
      }
      if (kind === "product-update") {
        const data = z
          .object({
            id: text,
            name: text,
            shortDescription: z.string().max(1000),
            longDescription: z.string().max(10000),
            status,
          })
          .strict()
          .parse(input);
        const before = await tx.product.findUnique({ where: { id: data.id } });
        if (!before) throw new ApiError("NOT_FOUND", 404);
        const product = await tx.product.update({
          where: { id: data.id },
          data: {
            name: data.name,
            shortDescription: data.shortDescription,
            longDescription: data.longDescription,
            status: data.status,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "PRODUCT_UPDATE",
            entityType: "Product",
            entityId: product.id,
            beforeData: JSON.parse(
              JSON.stringify(before),
            ) as Prisma.InputJsonValue,
            afterData: data,
          },
        });
        return product;
      }
      throw new ApiError("NOT_FOUND", 404);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
