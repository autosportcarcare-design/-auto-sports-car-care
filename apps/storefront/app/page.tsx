import Link from "next/link";
import { db } from "@autosport/database";
import { searchCatalog } from "../lib/catalog";
import { ProductGrid } from "../components/common";
import type { Product } from "../lib/types";
export const dynamic = "force-dynamic";
export default async function Home() {
  let products: Product[] = [];
  let categories: Array<{ slug: string; name: string }> = [];
  let unavailable = false;
  try {
    products = JSON.parse(JSON.stringify(await searchCatalog({}))) as Product[];
    categories = await db.category.findMany({
      where: { active: true },
      take: 12,
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    });
  } catch {
    unavailable = true;
  }
  return (
    <>
      <div className="hero">
        <span className="eyebrow">
          Automotive products · Retail and business
        </span>
        <h1>
          Find the product.
          <br />
          Understand the job.
        </h1>
        <p>
          Search by product, brand or SKU. Check the current price, variant and
          stock, then review the available product information before
          purchasing.
        </p>
        <Link className="button" href="/search">
          Explore catalogue
        </Link>
      </div>
      <section>
        <h2>Shop by category</h2>
        <div className="category-rail">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
        {!categories.length && (
          <p>
            Categories will appear when the verified catalogue is available.
          </p>
        )}
        <h2>Catalogue</h2>
        {unavailable ? (
          <p role="alert">
            The catalogue is temporarily unavailable. Please try again.
          </p>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </>
  );
}
