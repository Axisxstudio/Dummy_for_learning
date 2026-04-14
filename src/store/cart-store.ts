"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  quantity: number;
  price_lkr: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((x) => x.id === item.id);
          if (existing) {
            return {
              items: state.items.map((x) =>
                x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
              )
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.id === id ? { ...x, quantity: Math.max(1, quantity) } : x
          )
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: "axisx-cart",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
