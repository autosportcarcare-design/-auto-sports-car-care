import { searchCatalog } from "../../../lib/catalog";
import { ProductGrid } from "../../../components/common";
import type { Product } from "../../../lib/types";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const data = await searchCatalog({ category: slug });
    return (
      <section>
        <h1>Category: {slug.replaceAll("-", " ")}</h1>
        <ProductGrid products={JSON.parse(JSON.stringify(data)) as Product[]} />
      </section>
    );
  } catch {
    return <p role="alert">Catalogue temporarily unavailable.</p>;
  }
}
