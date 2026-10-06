import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../../lib/page-auth";
import { Editor } from "../../../components/editor";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const p = await db.product.findUnique({
    where: { id: (await params).id },
    include: { variants: true },
  });
  if (!p) notFound();
  return (
    <section className="narrow">
      <h1>Edit {p.name}</h1>
      <Editor
        kind="product-update"
        initial={{
          id: p.id,
          name: p.name,
          shortDescription: p.shortDescription ?? "",
          longDescription: p.longDescription ?? "",
          status: p.status,
        }}
        fields={[
          { name: "name", label: "Name" },
          { name: "shortDescription", label: "Short description" },
          { name: "longDescription", label: "Description" },
          {
            name: "status",
            label: "Status",
            options: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"].map(
              (value) => ({ value, label: value }),
            ),
          },
        ]}
      />
      <h2>Variants</h2>
      {p.variants.map((v) => (
        <Editor
          key={v.id}
          kind="variant"
          initial={{
            id: v.id,
            title: v.title,
            price: v.price.toFixed(2),
            onHand: String(v.basicAvailability),
            status: v.status,
          }}
          fields={[
            { name: "title", label: "Variant title" },
            { name: "price", label: "Confirmed price (AED)" },
            {
              name: "onHand",
              label: `On hand (${v.reservedQuantity} reserved)`,
            },
            {
              name: "status",
              label: "Status",
              options: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"].map(
                (value) => ({ value, label: value }),
              ),
            },
          ]}
        />
      ))}
    </section>
  );
}
