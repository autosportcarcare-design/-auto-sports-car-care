"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Editor({
  kind,
  fields,
  initial = {},
}: {
  kind: string;
  fields: Array<{
    name: string;
    label: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  initial?: Record<string, string>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="card stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const data = {
          ...initial,
          ...Object.fromEntries(new FormData(e.currentTarget)),
        };
        try {
          const response = await fetch(`/api/manage/${kind}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = (await response.json()) as { error?: string };
          if (!response.ok) throw new Error(result.error ?? "Request failed");
          setError("");
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {fields.map((f) => (
        <label key={f.name}>
          {f.label}
          {f.options ? (
            <select name={f.name} defaultValue={initial[f.name]}>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={f.name}
              defaultValue={initial[f.name] ?? ""}
              required
            />
          )}
        </label>
      ))}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}
