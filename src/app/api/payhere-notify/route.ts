import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPayHereMd5Sig } from "@/lib/payhere";
import { notifyAdminOnWhatsApp } from "@/lib/twilio-whatsapp";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const merchantId = String(form.get("merchant_id") || "");
    const orderId = String(form.get("order_id") || "");
    const payhereAmount = String(form.get("payhere_amount") || "");
    const payhereCurrency = String(form.get("payhere_currency") || "");
    const statusCode = String(form.get("status_code") || "");
    const md5sig = String(form.get("md5sig") || "");

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
    if (!merchantId || !orderId || !md5sig || !merchantSecret) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const isValid = verifyPayHereMd5Sig({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig,
      merchantSecret
    });
    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, total_amount, email, stripe_session_id")
      .eq("stripe_session_id", orderId)
      .maybeSingle();
    if (!order) return new NextResponse("Order not found", { status: 404 });

    if (statusCode !== "2") {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id)
        .neq("status", "paid");
      return new NextResponse("Ignored", { status: 200 });
    }

    if (order.status === "paid") return new NextResponse("OK", { status: 200 });

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", order.id);

    if (items?.length) {
      const productIds = [...new Set(items.map((item) => item.product_id))];
      const { data: products } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .in("id", productIds);

      for (const item of items) {
        const product = products?.find((x) => x.id === item.product_id);
        if (!product) continue;
        await supabase
          .from("products")
          .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

    try {
      const { data: notifyItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal")
        .eq("order_id", order.id);

      await notifyAdminOnWhatsApp({
        orderRef: order.stripe_session_id,
        customerEmail: order.email,
        totalAmount: order.total_amount,
        items: notifyItems || []
      });
    } catch (notifyError) {
      console.error("WhatsApp admin notify failed:", notifyError);
    }

    return new NextResponse("OK", { status: 200 });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}
