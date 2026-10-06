import { db } from "@autosport/database";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  try {
    const departments = await db.department.findMany({
      where: { active: true },
      include: {
        categories: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return (
      <section>
        <h1>Departments</h1>
        {departments.length ? (
          departments.map((d) => (
            <div key={d.id}>
              <h2>{d.name}</h2>
              <div className="category-rail">
                {d.categories.map((c) => (
                  <Link href={`/category/${c.slug}`} key={c.id}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No departments have been published.</p>
        )}
      </section>
    );
  } catch {
    return <p role="alert">Categories are temporarily unavailable.</p>;
  }
}
