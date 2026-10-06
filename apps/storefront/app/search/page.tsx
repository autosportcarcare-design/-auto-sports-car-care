import { searchCatalog } from "../../lib/catalog";
import { ProductGrid } from "../../components/common";
import type { Product } from "../../lib/types";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const query = await searchParams;
  try {
    const products = await searchCatalog(query);
    return (
      <section>
        <h1>Search products</h1>
        <form className="search-form">
          <input
            name="q"
            defaultValue={query.q}
            placeholder="Product, brand or SKU"
            aria-label="Search catalogue"
          />
          <button>Search</button>
        </form>
        <ProductGrid
          products={JSON.parse(JSON.stringify(products)) as Product[]}
        />
      </section>
    );
  } catch {
    return (
      <section>
        <h1>Search products</h1>
        <p role="alert">
          The catalogue is temporarily unavailable. Please try again.
        </p>
      </section>
    );
  }
}
