import Link from "next/link";
import { siteConfig } from "../lib/site-config";
export function CustomerActions({ compact = false }: { compact?: boolean }) {
  const wa = siteConfig.whatsapp.replace(/\D/g, "");
  return <div className={compact ? "customer-actions compact" : "customer-actions"}><Link className="button" href="/book">Book</Link><Link className="button button-secondary" href="/book?kind=QUOTE">Request Quote</Link><a className="text-action" href={`https://wa.me/${wa}`}>WhatsApp</a><a className="text-action" href={`tel:${siteConfig.phone}`}>Call</a></div>;
}
