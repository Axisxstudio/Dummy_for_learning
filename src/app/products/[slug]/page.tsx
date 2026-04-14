import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) notFound();
  const product = data as Product;
  const images = product.image_urls?.length
    ? product.image_urls
    : [product.image_url || "https://picsum.photos/800"];

  return (
    <section className="grid gap-10 md:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-surface">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1).map((src) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-surface"
              >
                <Image
                  src={src}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-5">
        <h1 className="font-outfit text-3xl font-semibold text-headline">{product.name}</h1>
        <p className="font-outfit text-2xl font-bold text-accent">
          LKR {product.price_lkr.toLocaleString()}
        </p>
        <p className="leading-relaxed text-muted">{product.description}</p>
        <p className="text-sm text-muted">In stock: {product.stock_quantity}</p>
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
    </section>
  );
}
