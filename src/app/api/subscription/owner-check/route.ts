import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const prop = searchParams.get("prop");
    const email = searchParams.get("email");

    // Check Supabase user_subscriptions table for any active paid subscription
    try {
      const query = supabase
        .from("user_subscriptions")
        .select("id, email, status, plan")
        .eq("status", "active");

      if (email) {
        query.eq("email", email.toLowerCase().trim());
      }

      const { data, error } = await query.limit(1);

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          owner_subscribed: true,
          plan: data[0].plan || "active",
        });
      }
    } catch {
      // Non-blocking database fallback
    }

    // If no active subscription record in user_subscriptions, owner is NOT subscribed to Rent Roll
    return NextResponse.json({
      owner_subscribed: false,
      message: "Rent roll is not yet subscribed by the property owner",
    });
  } catch (error: any) {
    return NextResponse.json(
      { owner_subscribed: false, error: error.message },
      { status: 200 }
    );
  }
}
