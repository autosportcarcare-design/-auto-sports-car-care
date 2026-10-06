import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../../lib/page-auth";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const order = await db.order.findUnique({
    where: { id: (await params).id },
    include: { items: true, events: true },
  });
  if (!order) notFound();
  return (
    <section>
      <h1>{order.orderNumber}</h1>
      <p>
        {order.status} · Payment {order.paymentStatus}
      </p>
      {order.items.map((i) => (
        <p key={i.id}>
          {i.productNameSnapshot} × {i.quantity} — AED {i.lineTotal.toFixed(2)}
        </p>
      ))}
      <h2>Events</h2>
      {order.events.map((e) => (
        <p key={e.id}>
          {e.type} · {e.createdAt.toISOString()}
        </p>
      ))}
    </section>
  );
}
