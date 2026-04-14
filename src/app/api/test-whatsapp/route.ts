import { NextResponse } from "next/server";
import { notifyAdminOnWhatsApp } from "@/lib/twilio-whatsapp";

export async function POST() {
  try {
    const result = await notifyAdminOnWhatsApp({
      orderRef: `TEST-${Date.now()}`,
      customerEmail: "test@example.com",
      totalAmount: 1000,
      items: [
        {
          product_name: "Twilio notification test item",
          quantity: 1,
          subtotal: 1000
        }
      ]
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          ok: false,
          error: "Twilio config missing. Set TWILIO_* and ADMIN_WHATSAPP_TO in .env.local"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, sid: result.sid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
