"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { request, useResource, Notice } from "./common";
import type { Address, CartData } from "../lib/types";
export function CheckoutView() {
  const cart = useResource<CartData>("/api/cart");
  const addresses = useResource<Address[]>("/api/addresses");
  const [method, setMethod] = useState("PICKUP");
  const [addressId, setAddressId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<{
    orderNumber: string;
    orderId: string;
    grandTotal: string;
  } | null>(null);
  const key = useRef<string | null>(null);
  const router = useRouter();
  return (
    <section className="narrow">
      <h1>Checkout</h1>
      <Notice error={error || cart.error || addresses.error} />
      {cart.data && (
        <p>Cart total before shipping: AED {cart.data.totals.grandTotal}</p>
      )}
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            key.current ??= crypto.randomUUID();
            setOrder(
              await request("/api/checkout", "POST", {
                idempotencyKey: key.current,
                addressId,
                fulfilmentMethod: method,
              }),
            );
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>Delivery or pickup</h2>
        <label>
          Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={busy || !!order}
          >
            <option value="PICKUP">Pickup</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </label>
        <label>
          Address
          <select
            aria-label="Address"
            required
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            disabled={busy || !!order}
          >
            <option value="">Choose a saved address</option>
            {addresses.data?.map((a) => (
              <option value={a.id} key={a.id}>
                {a.label}: {a.street}, {a.city}
              </option>
            ))}
          </select>
        </label>
        <a href="/account/addresses">Add address</a>
        <p>
          Availability, shipping fee and total are validated by the server. No
          delivery date is promised here.
        </p>
        <button disabled={busy || !!order || !cart.data?.items.length}>
          {busy ? "Validating…" : "Review server total"}
        </button>
      </form>
      {order && (
        <div className="card stack">
          <h2>Review order</h2>
          <p>Order {order.orderNumber}</p>
          <p className="price">AED {order.grandTotal}</p>
          <p>
            Payment pending. This development flow uses a test payment provider
            and does not charge a card.
          </p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await request("/api/payments/test", "POST", {
                  orderId: order.orderId,
                });
                router.push(`/order/${order.orderNumber}/confirmation`);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Simulate payment success
          </button>
          <a href={`/order/${order.orderNumber}/confirmation`}>
            View pending order
          </a>
        </div>
      )}
    </section>
  );
}
