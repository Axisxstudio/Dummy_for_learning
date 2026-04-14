"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/store/cart-store";

export default function SuccessPage() {
  const LAST_ORDER_ITEMS_KEY = "axisx-last-order-items";
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem(LAST_ORDER_ITEMS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setPurchasedItems(parsed);
      }
    } catch {
      // Ignore invalid payload and keep default empty state.
    } finally {
      sessionStorage.removeItem(LAST_ORDER_ITEMS_KEY);
    }
  }, []);

  const purchasedTotal = useMemo(
    () =>
      purchasedItems.reduce((sum, item) => sum + item.price_lkr * item.quantity, 0),
    [purchasedItems]
  );

  return (
    <section className="surface-card mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        ✓
      </div>
      <h1 className="font-outfit text-2xl font-semibold text-headline">Order successful</h1>
      <p className="mt-3 text-muted">
        Thank you for your purchase. A payment confirmation has been recorded.
      </p>
      {!!purchasedItems.length && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-surface-elevated/80 p-4 text-left">
          <p className="font-medium text-headline">Purchased products</p>
          <div className="mt-3 space-y-3">
            {purchasedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-surface">
                  <Image
                    src={item.image_url || "https://picsum.photos/200"}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-headline">{item.name}</p>
                  <p className="text-xs text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm text-muted">
                  LKR {(item.price_lkr * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-headline">
            Total paid: LKR {purchasedTotal.toLocaleString()}
          </p>
        </div>
      )}
      <Link
        href="/products"
        className="btn-accent-fill mt-8 inline-flex justify-center"
      >
        <span>Continue shopping</span>
      </Link>
    </section>
  );
}
