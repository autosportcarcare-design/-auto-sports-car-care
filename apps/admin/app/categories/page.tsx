import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../lib/page-auth";
import { Editor } from "../../components/editor";
export default async function Page() {
  await requireAdmin();
  const records = await db.category.findMany({ take: 100 });
  const departments = await db.department.findMany();
  return (
    <section className="narrow">
      <h1>Categories</h1>
      <Editor
        kind="categories"
        fields={[
          { name: "name", label: "Name" },
          { name: "slug", label: "Slug" },
          {
            name: "departmentId",
            label: "Department",
            options: departments.map((d) => ({ value: d.id, label: d.name })),
          },
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
