import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { AdminImageUploader } from "@/components/admin-image-uploader";
import { Product } from "@/types/product";

function parseImageUrlsJson(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && Boolean(x));
  } catch {
    return [];
  }
}

export default async function AdminProductsPage() {
  const supabase = await requireAdmin();
  const { data } = await supabase.from("products").select("*").order("created_at", {
    ascending: false
  });
  const products = (data || []) as Product[];

  async function createProduct(formData: FormData) {
    "use server";
    const supabase = await requireAdmin();
    const imageUrls = parseImageUrlsJson(String(formData.get("image_urls_json") || "[]"));
    if (!imageUrls.length) {
      throw new Error("Please upload at least one image file");
    }
    await supabase.from("products").insert({
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      description: String(formData.get("description")),
      category: String(formData.get("category")) || null,
      price_lkr: Number(formData.get("price_lkr")),
      image_url: imageUrls[0] || null,
      image_urls: imageUrls,
      stock_quantity: Number(formData.get("stock_quantity")),
      is_active: formData.get("is_active") === "on"
    });
    revalidatePath("/admin/products");
  }

  async function updateProduct(formData: FormData) {
    "use server";
    const supabase = await requireAdmin();
    const id = String(formData.get("id"));
    const imageUrls = parseImageUrlsJson(String(formData.get("image_urls_json") || "[]"));
    await supabase
      .from("products")
      .update({
        name: String(formData.get("name")),
        slug: String(formData.get("slug")),
        description: String(formData.get("description")),
        category: String(formData.get("category")) || null,
        price_lkr: Number(formData.get("price_lkr")),
        image_url: imageUrls[0] || null,
        image_urls: imageUrls,
        stock_quantity: Number(formData.get("stock_quantity")),
        is_active: formData.get("is_active") === "on"
      })
      .eq("id", id);
    revalidatePath("/admin/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const supabase = await requireAdmin();
    const id = String(formData.get("id"));
    await supabase.from("products").delete().eq("id", id);
    revalidatePath("/admin/products");
  }

  return (
    <section className="space-y-8">
      <h1 className="font-outfit text-3xl font-semibold text-headline">Admin products</h1>

      <form action={createProduct} className="surface-card grid gap-3 p-4 md:grid-cols-2">
        <input name="name" required placeholder="Name" className="input-dark" />
        <input name="slug" required placeholder="slug" className="input-dark" />
        <input name="price_lkr" required type="number" placeholder="Price" className="input-dark" />
        <input name="stock_quantity" required type="number" placeholder="Stock" className="input-dark" />
        <input name="category" placeholder="Category" className="input-dark" />
        <AdminImageUploader />
        <textarea name="description" placeholder="Description" className="input-dark min-h-[100px] md:col-span-2" />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="is_active" defaultChecked className="accent-blue-500" /> Active
        </label>
        <button type="submit" className="btn-accent-fill justify-center md:col-span-2">
          <span>Create product</span>
        </button>
      </form>

      <div className="space-y-4">
        {products.map((product) => (
          <form key={product.id} action={updateProduct} className="surface-card grid gap-3 p-4 md:grid-cols-2">
            <input type="hidden" name="id" value={product.id} />
            <input name="name" defaultValue={product.name} className="input-dark" />
            <input name="slug" defaultValue={product.slug} className="input-dark" />
            <input name="price_lkr" type="number" defaultValue={product.price_lkr} className="input-dark" />
            <input name="stock_quantity" type="number" defaultValue={product.stock_quantity} className="input-dark" />
            <input name="category" defaultValue={product.category || ""} className="input-dark" />
            <AdminImageUploader initialUrls={product.image_urls || []} />
            <textarea name="description" defaultValue={product.description} className="input-dark min-h-[100px] md:col-span-2" />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="accent-blue-500" />{" "}
              Active
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button type="submit" className="btn-accent-fill">
                <span>Save</span>
              </button>
              <button
                type="submit"
                formAction={deleteProduct}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
