import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount = 10000, // Default ₹100 in paise
      currency = "INR",
      receipt = `rcpt_${Date.now()}`,
      notes = {},
    } = body;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
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
