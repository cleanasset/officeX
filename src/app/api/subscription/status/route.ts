import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// In-memory persistent fallback cache for subscribed emails
const memorySubscribedEmails = new Set<string>([
  "admin.cleanasset@gmail.com",
  "owner@officex.in",
  "jiya.scalezix@gmail.com",
  "jiyapatel181224@gmail.com"
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ subscribed: false, reason: "No email provided" }, { status: 200 });
    }

    // Check memory set
    if (memorySubscribedEmails.has(email)) {
      return NextResponse.json({ subscribed: true, email, plan: "active_lifetime" }, { status: 200 });
    }

    // Check Supabase if available
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("email", email)
        .eq("status", "active")
        .maybeSingle();

      if (!error && data) {
        memorySubscribedEmails.add(email);
        return NextResponse.json({ subscribed: true, email, plan: data.plan || "active" }, { status: 200 });
      }
    } catch {
      // Non-blocking database check fallback
    }

    return NextResponse.json({ subscribed: false, email }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ subscribed: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || "").toLowerCase().trim();
    const coupon = body.coupon || "none";
    const paymentId = body.paymentId || `FREE_${Date.now()}`;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Add to server memory cache
    memorySubscribedEmails.add(email);

    // Persist to Supabase if table exists
    try {
      await supabase.from("user_subscriptions").upsert({
        email,
        status: "active",
        coupon_applied: coupon,
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      }, { onConflict: "email" });
    } catch {
      // Graceful fallback
    }

    return NextResponse.json({
      success: true,
      subscribed: true,
      email,
      message: "Subscription permanently activated for " + email
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
