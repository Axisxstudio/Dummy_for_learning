"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price_lkr * item.quantity, 0),
    [items]
  );

  return (
    <>
      <button
        type="button"
        suppressHydrationWarning
        className="rounded-full border border-white/15 bg-surface-elevated/60 px-3 py-1.5 text-xs font-semibold text-headline backdrop-blur-sm transition hover:border-accent/40 hover:text-accent"
        onClick={() => setOpen(true)}
      >
        Cart ({count})
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-surface-elevated/95 p-5 backdrop-blur-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-outfit text-lg font-semibold text-headline">Your cart</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setOpen(false)}
                className="text-sm text-muted transition hover:text-headline"
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-surface/60 p-3 text-sm"
                >
                  <p className="font-medium text-headline">{item.name}</p>
                  <p className="text-muted">
                    Qty {item.quantity} × LKR {item.price_lkr.toLocaleString()}
                  </p>
                </div>
              ))}
              {!items.length && <p className="text-sm text-muted">Cart is empty.</p>}
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-sm font-medium text-headline">
                Total: LKR {total.toLocaleString()}
              </p>
              <Link
                href="/cart"
                className="btn-accent-fill mt-3 inline-flex w-full justify-center"
                onClick={() => setOpen(false)}
              >
                <span>Go to cart</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
