"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Variant } from "../lib/types";
import { request, Notice } from "./common";
export function ProductPurchase({ variants }: { variants: Variant[] }) {
  const [id, setId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const variant = variants.find((v) => v.id === id);
  async function add(buy = false) {
    setBusy(true);
    setError("");
    try {
      await request("/api/cart", "POST", { variantId: id, quantity });
      setMessage("Added to cart.");
      if (buy) router.push("/checkout");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <label>
        Variant
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
      </label>
      {variant && (
        <>
          <p className="price">AED {variant.price}</p>
          <small>SKU {variant.sku}</small>
          <p>
            {Math.max(0, variant.basicAvailability - variant.reservedQuantity)}{" "}
            available
          </p>
        </>
      )}
      <label>
        Quantity
        <input
          type="number"
          min="1"
          max="999"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>
      <button
        disabled={
          busy ||
          !variant ||
          variant.basicAvailability - variant.reservedQuantity < quantity
        }
        onClick={() => add()}
      >
        Add to cart
      </button>
      <button
        className="secondary"
        disabled={
          busy ||
          !variant ||
          variant.basicAvailability - variant.reservedQuantity < quantity
        }
        onClick={() => add(true)}
      >
        Buy now
      </button>
      <button
        className="text-button"
        disabled={busy || !variant}
        onClick={async () => {
          try {
            await request("/api/wishlist", "POST", { variantId: id });
            setMessage("Saved to wishlist.");
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        Save to wishlist
      </button>
      <Notice error={error} />
      <p role="status">{message}</p>
      <small>Delivery and pickup options are confirmed at checkout.</small>
    </div>
  );
}
