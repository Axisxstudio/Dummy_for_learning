import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhook disabled. Use /api/payhere-notify." },
    { status: 410 }
  );
}
