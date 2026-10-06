import { db } from "@autosport/database";
import { z } from "zod";
export const productInclude = {
  brand: true,
  category: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  variants: {
    where: { status: "ACTIVE" as const },
    include: { taxClass: true },
  },
};
export async function searchCatalog(input: unknown) {
  const data = z
    .object({
      q: z.string().max(100).default(""),
      brand: z.string().max(100).optional(),
      category: z.string().max(100).optional(),
      page: z.coerce.number().int().min(1).max(10000).default(1),
    })
    .parse(input);
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      brand: { active: true, ...(data.brand ? { slug: data.brand } : {}) },
      category: {
        active: true,
        ...(data.category ? { slug: data.category } : {}),
      },
      ...(data.q
        ? {
            OR: [
              { name: { contains: data.q, mode: "insensitive" as const } },
              {
                brand: {
                  name: { contains: data.q, mode: "insensitive" as const },
                },
              },
              {
                variants: {
                  some: {
                    OR: [
                      {
                        sku: { contains: data.q, mode: "insensitive" as const },
                      },
                      { barcode: { equals: data.q } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: productInclude,
    take: 24,
    skip: (data.page - 1) * 24,
    orderBy: { name: "asc" },
  });
}
export async function getProduct(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      brand: { active: true },
      category: { active: true },
    },
    include: productInclude,
  });
}
