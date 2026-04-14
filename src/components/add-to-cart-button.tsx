"use client";

import { useCartStore } from "@/store/cart-store";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    price_lkr: number;
  };
};

export function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="btn-accent-fill w-full sm:w-auto"
    >
      <span>Add to cart</span>
    </button>
  );
}
