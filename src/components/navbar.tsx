import Link from "next/link";
import { CartDrawer } from "./cart-drawer";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 glass-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-outfit text-lg font-semibold tracking-tight text-headline transition hover:text-accent"
        >
          AxisX Store
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-muted">
          <Link href="/products" className="transition hover:text-headline">
            Products
          </Link>
          <CartDrawer />
          <Link href="/admin/products" className="transition hover:text-headline">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
