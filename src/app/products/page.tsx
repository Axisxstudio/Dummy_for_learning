import { ProductCard } from "@/components/product-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category", category);

  const { data } = await query;
  const products = (data || []) as Product[];
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ) as string[];

  return (
    <section className="space-y-8">
      <h1 className="font-outfit text-3xl font-semibold text-headline">All products</h1>
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-surface-elevated/80 p-4 backdrop-blur-sm md:grid-cols-3">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search products..."
          className="input-dark"
        />
        <select
          name="category"
          defaultValue={category || ""}
          className="input-dark"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-accent-fill justify-center">
          <span>Apply</span>
        </button>
      </form>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
