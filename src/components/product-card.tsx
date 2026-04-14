import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const imageSrc = product.image_urls?.[0] || product.image_url || "https://picsum.photos/640";
  return (
    <article className="group surface-card overflow-hidden transition duration-300 hover:border-accent/30 hover:shadow-xl hover:shadow-blue-500/10">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-1 font-outfit text-base font-semibold text-headline transition group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted">LKR {product.price_lkr.toLocaleString()}</p>
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            image_url: product.image_url,
            price_lkr: product.price_lkr
          }}
        />
      </div>
    </article>
  );
}
