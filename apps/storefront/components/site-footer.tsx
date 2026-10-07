import Link from "next/link";
import { siteConfig } from "../lib/site-config";

export function SiteFooter() {
  const wa = siteConfig.whatsapp.replace(/\D/g, "");
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><strong className="footer-brand">AUTO SPORT</strong><p>Automotive services, specialist products and trade support in one place.</p></div>
        <div><h2>Explore</h2><Link href="/services">Services</Link><Link href="/products">Products</Link><Link href="/gallery">Gallery</Link><Link href="/knowledge">Knowledge</Link></div>
        <div><h2>Business</h2><Link href="/b2b">B2B supply</Link><Link href="/vouchers">Vouchers</Link><Link href="/book">Booking</Link><Link href="/search">Search</Link></div>
        <div><h2>Contact</h2><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a><a href={`https://wa.me/${wa}`}>WhatsApp</a><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
      </div>
      <div className="shell footer-note">Product price and availability come from the verified catalogue. Technical information is shown only when a verified source is available.</div>
    </footer>
  );
}
