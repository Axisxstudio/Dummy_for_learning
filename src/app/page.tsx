import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/product";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const featured = (data || []) as Product[];

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-elevated/60 p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-80" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative">
          <p className="mb-3 font-outfit text-xs font-medium uppercase tracking-[0.28em] text-muted">
            Premium essentials
          </p>
          <h1 className="font-outfit text-4xl font-semibold leading-tight md:text-5xl">
            <span className="text-gradient-display">Modern products</span>
            <br />
            <span className="text-headline">for modern living.</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Discover curated items with fast checkout and a clean shopping experience.
          </p>
          <Link
            href="/products"
            className="btn-accent-fill animate-pulse-glow mt-8 inline-flex glow-accent-soft"
          >
            <span>Shop now</span>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-outfit text-2xl font-semibold text-headline">Featured products</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
