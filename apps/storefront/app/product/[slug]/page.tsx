import { MediaImage, ProductVideo } from "../../../components/media";
import { notFound } from "next/navigation";
import { getProduct } from "../../../lib/catalog";
import { ProductPurchase } from "../../../components/product-purchase";
import type { Product } from "../../../lib/types";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let record;
  try {
    record = await getProduct(slug);
  } catch {
    return <p role="alert">Product information is temporarily unavailable.</p>;
  }
  if (!record) notFound();
  const product = JSON.parse(JSON.stringify(record)) as Product;
  return (
    <section>
      <p>
        {product.brand.name} / {product.category.name}
      </p>
      <div className="product-detail">
        <div>
          <div className="gallery">
            {product.media
              .filter((m) => m.type === "IMAGE")
              .map((m) => (
                <MediaImage key={m.url} url={m.url} alt={m.altText} />
              ))}
            {!product.media.some((m) => m.type === "IMAGE") && (
              <p>Product image not provided.</p>
            )}
          </div>
          <h1>{product.name}</h1>
          <p>{product.shortDescription}</p>
        </div>
        <aside className="card">
          <ProductPurchase variants={product.variants} />
        </aside>
      </div>
      <div className="knowledge">
        <h2>Overview</h2>
        <p>{product.longDescription || "Description not provided."}</p>
        <h2>Application and technical information</h2>
        <p>
          Verified compatibility, preparation and application instructions have
          not been supplied. Refer to the manufacturer’s technical data sheet
          before use.
        </p>
        <h2>Documents</h2>
        {product.media
          .filter((m) =>
            ["TDS", "SDS", "MANUAL", "PDF", "DOCUMENT"].includes(m.type),
          )
          .map((m) => (
            <p key={m.url}>
              <a href={m.url} target="_blank" rel="noreferrer">
                {m.altText}
              </a>
            </p>
          ))}
        <h2>Videos</h2>
        {product.media
          .filter((m) => m.type === "VIDEO")
          .map((m) => (
            <ProductVideo key={m.url} url={m.url} title={m.altText} />
          ))}
      </div>
    </section>
  );
}
