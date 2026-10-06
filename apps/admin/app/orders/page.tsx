import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../lib/page-auth";
import Link from "next/link";
export default async function Page() {
  await requireAdmin();
  const orders = await db.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  return (
    <section>
      <h1>Orders</h1>
      {orders.map((o) => (
        <article className="card" key={o.id}>
          <Link href={`/orders/${o.id}`}>{o.orderNumber}</Link>
          <p>
            {o.status} · {o.paymentStatus} · AED {o.grandTotal.toFixed(2)}
          </p>
        </article>
      ))}
    </section>
  );
}
