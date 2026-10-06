"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResource, Notice, request } from "./common";
import type { Address, OrderData } from "../lib/types";
export function AccountView() {
  const { data, error } = useResource<{
    email: string;
    sessions: Array<{ id: string; expiresAt: string }>;
  }>("/api/account");
  const router = useRouter();
  return (
    <section>
      <h1>Your account</h1>
      <Notice error={error} />
      {data && (
        <>
          <p>{data.email}</p>
          <div className="grid">
            <Link className="card" href="/account/orders">
              Orders
            </Link>
            <Link className="card" href="/account/addresses">
              Addresses
            </Link>
            <Link className="card" href="/account/wishlist">
              Wishlist
            </Link>
          </div>
          <h2>Sessions</h2>
          {data.sessions.map((s) => (
            <p key={s.id}>
              Expires {new Date(s.expiresAt).toLocaleDateString()}{" "}
              <button
                className="text-button"
                onClick={async () => {
                  await request("/api/sessions", "DELETE", { sessionId: s.id });
                  router.refresh();
                }}
              >
                Revoke session
              </button>
            </p>
          ))}
          <button
            onClick={async () => {
              await request("/api/auth/logout", "POST");
              router.push("/login");
              router.refresh();
            }}
          >
            Sign out
          </button>
        </>
      )}
      <p>
        <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
export function AddressesView() {
  const { data, setData, error } = useResource<Address[]>("/api/addresses");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="narrow">
      <h1>Saved addresses</h1>
      <Notice error={error || failure} />
      {data?.map((a) => (
        <p className="card" key={a.id}>
          {a.label}: {a.street}, {a.city}
        </p>
      ))}
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = e.currentTarget;
          try {
            await request("/api/addresses", "POST", {
              ...Object.fromEntries(new FormData(form)),
              country: "AE",
            });
            setData(await request("/api/addresses"));
            form.reset();
            setFailure("");
          } catch (err) {
            setFailure((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          "label",
          "recipientName",
          "phone",
          "emirate",
          "city",
          "street",
          "building",
          "unit",
        ].map((name) => (
          <label key={name}>
            {name.replace(/([A-Z])/g, " $1")}
            <input
              name={name}
              required={!["building", "unit"].includes(name)}
            />
          </label>
        ))}
        <button disabled={busy}>Save address</button>
      </form>
    </section>
  );
}
export function OrdersView({
  orderNumber,
  confirmation = false,
}: {
  orderNumber?: string;
  confirmation?: boolean;
}) {
  const { data, error, loading } = useResource<OrderData[]>("/api/orders");
  const orders = orderNumber
    ? data?.filter((o) => o.orderNumber === orderNumber)
    : data;
  return (
    <section>
      <h1>
        {confirmation
          ? "Order confirmation"
          : orderNumber
            ? "Order details"
            : "Your orders"}
      </h1>
      <Notice error={error} />
      {loading && <p>Loading orders…</p>}
      {orders?.length === 0 && <p>No orders found.</p>}
      {orders?.map((o) => (
        <article className="card" key={o.id}>
          <Link href={`/account/orders/${o.orderNumber}`}>
            <h2>{o.orderNumber}</h2>
          </Link>
          <p>
            Order: {o.status.replaceAll("_", " ")} · Payment: {o.paymentStatus}
          </p>
          {o.items.map((i, index) => (
            <p key={index}>
              {i.productNameSnapshot} — {i.variantNameSnapshot} × {i.quantity}:
              AED {i.lineTotal}
            </p>
          ))}
          <p>Total: AED {o.grandTotal}</p>
          <p>
            Future fulfilment stages are shown only after staff updates the
            order.
          </p>
        </article>
      ))}
    </section>
  );
}
export function WishlistView() {
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, setData, error } = useResource<
    Array<{
      variant: {
        id: string;
        title: string;
        product: { name: string; slug: string };
      };
    }>
  >("/api/wishlist");
  return (
    <section>
      <h1>Your wishlist</h1>
      <Notice error={error || failure} />
      {data?.length === 0 && <p>No saved products yet.</p>}
      {data?.map((i) => (
        <article className="card" key={i.variant.id}>
          <Link href={`/product/${i.variant.product.slug}`}>
            {i.variant.product.name} — {i.variant.title}
          </Link>
          <button
            className="text-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                setData(
                  await request("/api/wishlist", "DELETE", {
                    variantId: i.variant.id,
                  }),
                );
                setFailure("");
              } catch (error) {
                setFailure((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Remove
          </button>
        </article>
      ))}
    </section>
  );
}
