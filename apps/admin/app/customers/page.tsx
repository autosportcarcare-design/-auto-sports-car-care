import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../lib/page-auth";
export default async function Page() {
  await requireAdmin();
  const customers = await db.customer.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
    take: 50,
  });
  return (
    <section>
      <h1>Customers</h1>
      {customers.map((c) => (
        <p className="card" key={c.id}>
          {c.firstName} {c.lastName} — {c.email}
        </p>
      ))}
    </section>
  );
}
