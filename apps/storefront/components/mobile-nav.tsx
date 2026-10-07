import Link from "next/link";
export function MobileNav() {
  return <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/products">Products</Link><Link href="/search">Search</Link><Link href="/book">Booking</Link><Link href="/cart">Cart</Link></nav>;
}
