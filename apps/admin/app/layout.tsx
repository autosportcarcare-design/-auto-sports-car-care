import { AuthForm } from "../../storefront/components/auth-form";
import "../../storefront/app/globals.css";
import Link from "next/link";
import { currentUser } from "../../storefront/lib/security";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let authorized = false;
  try {
    const user = await currentUser();
    authorized = !!user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  } catch {}
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="shell header">
            <b>AUTO SPORT Administration</b>
          </div>
        </header>
        <main className="shell">
          {authorized ? (
            <>
              <nav className="category-rail">
                {[
                  "products",
                  "brands",
                  "departments",
                  "categories",
                  "orders",
                  "customers",
                ].map((name) => (
                  <Link key={name} href={`/${name}`}>
                    {name}
                  </Link>
                ))}
              </nav>
              {children}
            </>
          ) : (
            <section>
              <p>Administrator access required.</p>
              <AuthForm mode="login" redirectTo="/" />
            </section>
          )}
        </main>
      </body>
    </html>
  );
}
