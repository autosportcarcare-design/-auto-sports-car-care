import Link from "next/link";
import { siteConfig } from "../lib/site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__row">
        <Link href="/" className="site-brand" aria-label="AUTO SPORT home">
          <img src={siteConfig.originalLogo} alt="AUTO SPORT" width="58" height="58" />
          <span><strong>AUTO SPORT</strong><small>CAR CARE &amp; TRADING</small></span>
        </Link>
        <form action="/search" className="site-search" role="search">
          <input name="q" aria-label="Search" placeholder="Search products, services, brands or SKU" />
          <button type="submit">Search</button>
        </form>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href="/products">Products</Link>
          <Link href="/search">Search</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </nav>
      </div>
    </header>
  );
}
