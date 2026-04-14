"use client";

import Image from "next/image";
import { CartItem as Item, useCartStore } from "@/store/cart-store";

export function CartItem({ item }: { item: Item }) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-elevated/80 p-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-surface">
        <Image
          src={item.image_url || "https://picsum.photos/200"}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-headline">{item.name}</h3>
        <p className="text-sm text-muted">LKR {item.price_lkr.toLocaleString()}</p>
      </div>
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
        className="w-16 rounded-lg border border-white/10 bg-surface px-2 py-1 text-sm text-headline outline-none focus:border-accent/50"
      />
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="text-sm text-red-400 transition hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}
