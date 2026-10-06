"use client";
import { MediaImage } from "./media";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Product } from "../lib/types";
export async function request<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const error = result as { error?: string };
    throw new Error(
      error.error?.replaceAll("_", " ").toLowerCase() ?? "Request unavailable",
    );
  }
  return result as T;
}
export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    request<T>(path)
      .then((value) => {
        if (active) {
          setData(value);
          setError("");
        }
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path]);
  return { data, setData, error, loading };
}
export function Notice({ error }: { error: string }) {
  return error ? (
    <p className="notice" role="alert">
      {error}
    </p>
  ) : null;
}
export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  const image = product.media.find((m) => m.type === "IMAGE");
  return (
    <article className="card product-card">
      <Link href={`/product/${product.slug}`}>
        <div className="product-image">
          {image ? (
            <MediaImage url={image.url} alt={image.altText} />
          ) : (
            <span>Product image not provided</span>
          )}
        </div>
        <small>{product.brand.name}</small>
        <h3>{product.name}</h3>
      </Link>
      <p>{variant ? `AED ${variant.price}` : "Price not provided"}</p>
      <small>
        {variant && variant.basicAvailability - variant.reservedQuantity > 0
          ? "In stock"
          : "Unavailable"}
      </small>
    </article>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return products.length ? (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  ) : (
    <div className="empty">
      <h2>No matching products found.</h2>
      <p>Adjust your search or browse categories.</p>
      <Link href="/departments">Browse categories</Link>
    </div>
  );
}
