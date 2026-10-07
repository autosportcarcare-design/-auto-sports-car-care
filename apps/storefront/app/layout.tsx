import type { Metadata } from "next";
import "./globals.css";
import { Pwa } from "../components/pwa";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { MobileNav } from "../components/mobile-nav";

export const metadata: Metadata = {
  title: { default: "AUTO SPORT | Car Care & Trading", template: "%s | AUTO SPORT" },
  manifest: "/manifest.webmanifest",
  description: "Automotive services, specialist products and trade support.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Pwa /><SiteHeader /><main className="shell page-shell">{children}</main><SiteFooter /><MobileNav /></body></html>;
}
