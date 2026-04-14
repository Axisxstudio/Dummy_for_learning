import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildPayHereHash } from "@/lib/payhere";

type CheckoutBody = {
  items: Array<{ id: string; quantity: number }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const ids = body.items.map((item) => item.id);

    const supabase = await createSupabaseServerClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_active", true);

    if (error || !products?.length) {
      return NextResponse.json({ error: "No valid products" }, { status: 400 });
    }

    const normalizedItems = body.items
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return null;
        const quantity = Math.max(1, item.quantity);
        if (product.stock_quantity < quantity) return null;
        return {
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price_lkr,
          subtotal: product.price_lkr * quantity
        };
      })
      .filter(Boolean) as Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;

    if (!normalizedItems.length) {
      return NextResponse.json(
        { error: "No valid in-stock products in cart" },
        { status: 400 }
      );
    }

    const total = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const amount = total.toFixed(2);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin");
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const sandbox = process.env.PAYHERE_SANDBOX === "true";

    if (!origin || !merchantId || !merchantSecret) {
      return NextResponse.json({ error: "PayHere config missing" }, { status: 500 });
    }

    const orderRef = `PH-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const adminSupabase = createSupabaseAdminClient();
    const { data: createdOrder, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        email: body.customer.email,
        stripe_session_id: orderRef,
        total_amount: total,
        status: "pending"
      })
      .select("id")
      .single();

    if (orderError || !createdOrder) {
      console.error("Order create failed:", orderError);
      return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
    }

    const { error: itemError } = await adminSupabase.from("order_items").insert(
      normalizedItems.map((item) => ({
        order_id: createdOrder.id,
        ...item
      }))
    );

    if (itemError) {
      console.error("Order items create failed:", itemError);
      return NextResponse.json({ error: "Unable to create order items" }, { status: 500 });
    }

    const hash = buildPayHereHash({
      merchantId,
      orderId: orderRef,
      amount,
      currency: "LKR",
      merchantSecret
    });

    return NextResponse.json({
      sandbox,
      action: sandbox
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout",
      fields: {
        merchant_id: merchantId,
        return_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/checkout/cancel`,
        notify_url: `${origin}/api/payhere-notify`,
        order_id: orderRef,
        items: normalizedItems.map((x) => x.product_name).join(", ").slice(0, 80),
        currency: "LKR",
        amount,
        first_name: body.customer.firstName || "Customer",
        last_name: body.customer.lastName || "User",
        email: body.customer.email,
        phone: body.customer.phone || "0770000000",
        address: body.customer.address || "Colombo",
        city: body.customer.city || "Colombo",
        country: body.customer.country || "Sri Lanka",
        hash
      }
    });
  } catch {
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
