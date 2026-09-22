import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        {
          error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      amount = 10000,
      currency = "INR",
      receipt = `rcpt_${Date.now()}`,
      notes = {},
    } = body;

    const numericAmount = Number(amount);
    const validAmount = Number.isFinite(numericAmount) && numericAmount > 0
      ? Math.round(numericAmount)
      : 10000;

    const cleanReceipt = String(receipt || `rcpt_${Date.now()}`)
      .replace(/[^\w-]/g, "_")
      .slice(0, 40);

    const sanitizedNotes: Record<string, string> = {};
    if (notes && typeof notes === "object") {
      for (const [k, v] of Object.entries(notes)) {
        if (v !== undefined && v !== null) {
          sanitizedNotes[String(k).slice(0, 40)] = String(v).slice(0, 255);
        }
      }
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: validAmount,
      currency: currency || "INR",
      receipt: cleanReceipt,
      notes: sanitizedNotes,
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: key_id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
