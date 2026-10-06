import { db } from "@autosport/database";
import { requirePageAdmin as requireAdmin } from "../../../lib/page-auth";
import { Editor } from "../../../components/editor";
export default async function Page() {
  await requireAdmin();
  const [brands, categories] = await Promise.all([
    db.brand.findMany(),
    db.category.findMany(),
  ]);
  return (
    <section className="narrow">
      <h1>Add product</h1>
      <p>
        Enter confirmed catalogue data only. Price is entered manually. Tax rate
        is a decimal fraction and requires confirmed VAT configuration.
      </p>
      <Editor
        kind="products"
        initial={{ status: "DRAFT", onHand: "0", taxRate: "0", price: "0.00" }}
        fields={[
          { name: "name", label: "Product name" },
          { name: "slug", label: "Slug" },
          {
            name: "brandId",
            label: "Brand",
            options: brands.map((b) => ({ value: b.id, label: b.name })),
          },
          {
            name: "categoryId",
            label: "Category",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
          { name: "shortDescription", label: "Short description" },
          { name: "longDescription", label: "Description" },
          { name: "sku", label: "SKU" },
          { name: "variantTitle", label: "Variant title" },
          { name: "price", label: "Confirmed price (AED)" },
          { name: "taxRate", label: "Confirmed tax fraction" },
          { name: "onHand", label: "On hand quantity" },
          {
            name: "status",
            label: "Status",
            options: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"].map(
              (value) => ({ value, label: value }),
            ),
          },
        ]}
      />
    </section>
  );
}
