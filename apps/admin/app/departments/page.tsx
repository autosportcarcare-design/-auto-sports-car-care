import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../lib/page-auth";
import { Editor } from "../../components/editor";
export default async function Page() {
  await requireAdmin();
  const records = await db.department.findMany({ take: 100 });
  return (
    <section className="narrow">
      <h1>Departments</h1>
      <Editor
        kind="departments"
        fields={[
          { name: "name", label: "Name" },
          { name: "slug", label: "Slug" },
        ]}
      />
      {records.map((r) => (
        <p className="card" key={r.id}>
          {r.name}
        </p>
      ))}
    </section>
  );
}
