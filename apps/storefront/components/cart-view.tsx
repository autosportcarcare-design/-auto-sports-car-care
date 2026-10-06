"use client";
import Link from "next/link";
import { useState } from "react";
import { request, useResource, Notice } from "./common";
import type { CartData } from "../lib/types";
export function CartView() {
  const { data, setData, error, loading } = useResource<CartData>("/api/cart");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  async function update(variantId: string, quantity: number) {
    setBusy(true);
    try {
      setData(
        await request<CartData>(
          "/api/cart",
          quantity === 0 ? "DELETE" : "POST",
          { variantId, ...(quantity ? { quantity } : {}) },
        ),
      );
      setFailure("");
    } catch (err) {
      setFailure((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h1>Your cart</h1>
      <Notice error={error || failure} />
      {loading && <p>Loading cart…</p>}
      {data &&
        (data.items.length ? (
          <div className="two-columns">
            <div className="stack">
              {data.items.map((item) => (
                <article className="card" key={item.variant.id}>
                  <Link href={`/product/${item.variant.product.slug}`}>
                    <h2>{item.variant.product.name}</h2>
                  </Link>
                  <p>
                    {item.variant.title} · AED {item.variant.price}
                  </p>
                  <label>
                    Quantity
                    <input
                      aria-label={`Quantity for ${item.variant.product.name}`}
                      type="number"
                      min="1"
                      max="999"
                      defaultValue={item.quantity}
                      disabled={busy}
                      onBlur={(e) =>
                        update(item.variant.id, Number(e.target.value))
                      }
                    />
                  </label>
                  <p>
                    {item.quantity >
                    item.variant.basicAvailability -
                      item.variant.reservedQuantity
                      ? "Stock changed. Update the quantity before checkout."
                      : ""}
                  </p>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => update(item.variant.id, 0)}
                  >
                    Remove
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={async () => {
                      try {
                        await request("/api/wishlist", "POST", {
                          variantId: item.variant.id,
                        });
                        await update(item.variant.id, 0);
                      } catch (err) {
                        setFailure((err as Error).message);
                      }
                    }}
                  >
                    Save for later
                  </button>
                </article>
              ))}
            </div>
            <aside className="card summary">
              <h2>Order summary</h2>
              <p>
                Subtotal <b>AED {data.totals.subtotal}</b>
              </p>
              <p>
                VAT <b>AED {data.totals.taxTotal}</b>
              </p>
              <p>Shipping confirmed at checkout</p>
              <p>
                Total before shipping <b>AED {data.totals.grandTotal}</b>
              </p>
              <Link className="button" href="/checkout">
                Proceed to checkout
              </Link>
            </aside>
          </div>
        ) : (
          <div className="empty">
            <h2>Your cart is empty.</h2>
            <Link href="/search">Browse products</Link>
          </div>
        ))}
    </section>
  );
}
