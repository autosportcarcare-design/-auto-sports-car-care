import Link from "next/link";
import { readAdmin } from "../../lib/service";
import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../lib/page-auth";
export default async function Page() {
  await requireAdmin();
  const products = await db.product.findMany({
    include: { brand: true, variants: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  return (
    <section>
      <h1>Products</h1>
      <Link className="button" href="/products/new">
        Add confirmed product
      </Link>
      {products.map((p) => (
        <article className="card" key={p.id}>
          <Link href={`/products/${p.id}`}>
            <h2>{p.name}</h2>
          </Link>
          <p>
            {p.brand.name} · {p.status} · {p.variants.length} variants
          </p>
        </article>
      ))}
    </section>
  );
}
