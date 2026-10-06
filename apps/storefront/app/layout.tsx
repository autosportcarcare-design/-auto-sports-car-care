import { siteConfig } from "../lib/site-config";
import "./globals.css";
import { Pwa } from "../components/pwa";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { default: "AUTO SPORT Commerce", template: "%s | AUTO SPORT" },
  manifest: "/manifest.webmanifest",
  description: "Automotive product shopping and catalogue information.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Pwa />
        <header className="topbar">
          <div className="shell header">
            <Link href="/" className="brand-name">
              <img
                src={siteConfig.originalLogo}
                alt="AUTO SPORT original logo"
                width="72"
                height="72"
              />
            </Link>
            <form action="/search" className="header-search">
              <input
                name="q"
                placeholder="Search products, brands or SKU"
                aria-label="Search products"
              />
              <button>Search</button>
            </form>
            <nav aria-label="Main navigation">
              <Link href="/departments">Categories</Link>
              <Link href="/account/wishlist">Wishlist</Link>
              <Link href="/account">Account</Link>
              <Link href="/cart">Cart</Link>
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
        <footer className="shell">
          <p>{siteConfig.companyName}</p>
          <p>
            Product information, pricing and availability come from the
            catalogue. Technical instructions require a verified source.
          </p>
          <p>
            <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a> · {" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
          <p>
            {siteConfig.stores.map((item, index) => (
              <span key={item.url}>
                {index ? " · " : ""}<a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
              </span>
            ))}
          </p>
          <p>
            {siteConfig.socials.map((item, index) => (
              <span key={item.url}>
                {index ? " · " : ""}<a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
              </span>
            ))}
          </p>
        </footer>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/">Home</Link>
          <Link href="/departments">Categories</Link>
          <Link href="/search">Search</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </nav>
      </body>
    </html>
  );
}
