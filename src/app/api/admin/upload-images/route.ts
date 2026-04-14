import { NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PRODUCT_IMAGE_BUCKET = "product-images";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length) {
      return NextResponse.json({ error: "No images received" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const urls: string[] = [];

    for (const file of files) {
      const input = Buffer.from(await file.arrayBuffer());
      const optimized = await sharp(input)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const filePath = `products/${crypto.randomUUID()}.webp`;
      const { error } = await adminClient.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(filePath, optimized, {
          contentType: "image/webp",
          upsert: false
        });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const { data } = adminClient.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
