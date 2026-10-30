import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Persistent file cache path for verified paid subscriptions
const SUBS_FILE = path.join(process.cwd(), ".officex_subscriptions.json");

function getPersistentSubscribedSet(): Set<string> {
  const set = new Set<string>();
  try {
    if (fs.existsSync(SUBS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBS_FILE, "utf-8"));
      if (Array.isArray(data)) {
        data.forEach((e) => set.add(String(e).toLowerCase().trim()));
      }
    }
  } catch {
    // Non-blocking
  }
  return set;
}

function savePersistentSubscribed(email: string) {
  try {
    const set = getPersistentSubscribedSet();
    set.add(email.toLowerCase().trim());
    fs.writeFileSync(SUBS_FILE, JSON.stringify(Array.from(set)), "utf-8");
  } catch {
    // Non-blocking
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    // 1. Super Admin accounts ALWAYS retain enterprise sovereign access
    const isSuperAdminEmail =
      email === "admin@gmail.com" ||
      email === "medistationlifecare@gmail.com";

    if (isSuperAdminEmail) {
      const res = NextResponse.json({
        subscribed: true,
        email,
        plan: "reit-mega",
        plan_name: "REIT Mega-Portfolio",
        billing_cycle: "annual",
        duration_months: 12,
        isAdmin: true,
        role: "super_admin",
        days_remaining: 365,
        starts_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        ends_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        message: "Executive Super Administrator Sovereign Access"
      }, { status: 200 });
      res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 31536000, sameSite: "lax" });
      res.cookies.set("officex_owner_subscribed", "true", { path: "/", maxAge: 31536000, sameSite: "lax" });
      res.cookies.set("officex_subscription_status", "active", { path: "/", maxAge: 31536000, sameSite: "lax" });
      return res;
    }

    if (!email) {
      return NextResponse.json({
        subscribed: false,
        plan: "none",
        message: "No email provided"
      }, { status: 200 });
    }

    // 2. Check users table for super_admin role
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      if (userData?.role === "super_admin") {
        const res = NextResponse.json({
          subscribed: true,
          email,
          plan: "reit-mega",
          plan_name: "REIT Mega-Portfolio",
          billing_cycle: "annual",
          duration_months: 12,
          isAdmin: true,
          role: "super_admin",
          days_remaining: 365
        }, { status: 200 });
        res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 31536000, sameSite: "lax" });
        return res;
      }
    } catch {
      // Non-blocking
    }

    // 3. Query PostgreSQL user_subscriptions table for active unexpired subscription
    try {
      const nowIso = new Date().toISOString();
      const { data: dbSub, error: dbErr } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("email", email)
        .eq("status", "active")
        .gt("ends_at", nowIso)
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!dbErr && dbSub) {
        const endsAtMs = new Date(dbSub.ends_at).getTime();
        const daysRemaining = Math.max(0, Math.ceil((endsAtMs - Date.now()) / (1000 * 60 * 60 * 24)));

        const res = NextResponse.json({
          subscribed: true,
          email,
          plan: dbSub.plan_id || "techpark",
          plan_name: dbSub.plan_name || "Tech Park Campus",
          billing_cycle: dbSub.billing_cycle || "monthly",
          duration_months: dbSub.duration_months || 1,
          starts_at: dbSub.starts_at,
          ends_at: dbSub.ends_at,
          days_remaining: daysRemaining,
          payment_id: dbSub.payment_id,
          coupon: dbSub.coupon_code
        }, { status: 200 });
        res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 2592000, sameSite: "lax" });
        res.cookies.set("officex_owner_subscribed", "true", { path: "/", maxAge: 2592000, sameSite: "lax" });
        res.cookies.set("officex_subscription_status", "active", { path: "/", maxAge: 2592000, sameSite: "lax" });
        return res;
      }
    } catch (e) {
      console.warn("user_subscriptions lookup error:", e);
    }

    // 4. Secondary fallback: check system_kv_store for unexpired active subscription
    try {
      const { data: kvData } = await supabase
        .from("system_kv_store")
        .select("data")
        .eq("key", "officex_user_subscriptions")
        .maybeSingle();

      const subsMap = (kvData?.data as Record<string, any>) || {};
      const userSub = subsMap[email];

      if (userSub && userSub.status === "active") {
        const endsAtStr = userSub.endsAt || userSub.ends_at;
        const endsAtMs = endsAtStr ? new Date(endsAtStr).getTime() : Date.now() + 30 * 86400000;
        
        // Check if not expired
        if (endsAtMs > Date.now()) {
          const daysRemaining = Math.max(0, Math.ceil((endsAtMs - Date.now()) / (1000 * 60 * 60 * 24)));
          const res = NextResponse.json({
            subscribed: true,
            email,
            plan: userSub.plan || "techpark",
            plan_name: userSub.plan_name || "Tech Park Campus",
            billing_cycle: userSub.billing_cycle || "monthly",
            duration_months: userSub.duration_months || 1,
            starts_at: userSub.startsAt || userSub.starts_at,
            ends_at: endsAtStr,
            days_remaining: daysRemaining,
            paymentId: userSub.paymentId,
            coupon: userSub.coupon
          }, { status: 200 });
          res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 2592000, sameSite: "lax" });
          return res;
        }
      }
    } catch {
      // Non-blocking
    }

    // 5. Default: User has no active paid subscription
    const unverifiedRes = NextResponse.json({
      subscribed: false,
      email,
      plan: "none",
      message: "Pro subscription required for Rent Roll & Financial Suite"
    }, { status: 200 });

    unverifiedRes.cookies.delete("officex_subscription");
    unverifiedRes.cookies.delete("officex_owner_subscribed");
    unverifiedRes.cookies.delete("officex_subscription_status");
    return unverifiedRes;
  } catch (error: any) {
    return NextResponse.json({
      subscribed: false,
      plan: "none",
      error: error.message
    }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || "").toLowerCase().trim();
    const coupon = (body.coupon || "").toUpperCase().trim();
    const paymentId = body.paymentId || `PAY_${Date.now()}`;
    const plan = (body.plan || "techpark").toLowerCase().trim();
    const planName = body.plan_name || (plan === "starter" ? "Commercial Starter" : plan === "reit-mega" ? "REIT Mega-Portfolio" : "Tech Park Campus");

    const durationMonths = Number(body.duration_months) || (body.billing_cycle === "annual" ? 12 : body.billing_cycle === "half_yearly" ? 6 : body.billing_cycle === "quarterly" ? 3 : 1);
    const billingCycle = body.billing_cycle || (durationMonths === 12 ? "annual" : durationMonths === 6 ? "half_yearly" : durationMonths === 3 ? "quarterly" : "monthly");
    const amount = Number(body.amount) || 0;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Calculate exact start and expiration dates
    const startsAt = new Date();
    // 30 days per month calendar approximation
    const endsAt = new Date(startsAt.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

    // 1. Persist directly to PostgreSQL user_subscriptions table
    try {
      await supabase.from("user_subscriptions").insert({
        email,
        plan_id: plan,
        plan_name: planName,
        billing_cycle: billingCycle,
        duration_months: durationMonths,
        status: "active",
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        amount: amount,
        currency: "INR",
        payment_id: paymentId,
        razorpay_order_id: body.orderId || `ORD_${paymentId}`,
        coupon_code: coupon || null,
        metadata: {
          userAgent: request.headers.get("user-agent") || "",
          subscribedAt: startsAt.toISOString(),
          requestedDuration: `${durationMonths} month(s)`
        }
      });
    } catch (insertErr) {
      console.error("user_subscriptions insert error:", insertErr);
    }

    // 2. Dual redundancy: sync to PostgreSQL system_kv_store
    try {
      const { data: kvData } = await supabase
        .from("system_kv_store")
        .select("data")
        .eq("key", "officex_user_subscriptions")
        .maybeSingle();

      const subsMap = (kvData?.data as Record<string, any>) || {};
      subsMap[email] = {
        status: "active",
        plan,
        plan_name: planName,
        billing_cycle: billingCycle,
        duration_months: durationMonths,
        coupon: coupon || "PAID_CHECKOUT",
        paymentId: paymentId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        amount: amount,
        updatedAt: startsAt.toISOString()
      };

      await supabase
        .from("system_kv_store")
        .upsert({
          key: "officex_user_subscriptions",
          data: subsMap,
          updated_at: startsAt.toISOString()
        }, { onConflict: "key" });
    } catch (kvErr) {
      console.error("system_kv_store sync error:", kvErr);
    }

    // 3. Save to local disk cache for fast offline access
    savePersistentSubscribed(email);

    const response = NextResponse.json({
      success: true,
      subscribed: true,
      email,
      plan,
      plan_name: planName,
      billing_cycle: billingCycle,
      duration_months: durationMonths,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      days_remaining: durationMonths * 30,
      message: `Commercial Pro subscription activated for ${durationMonths} month(s) until ${endsAt.toLocaleDateString("en-IN")}`
    }, { status: 200 });

    response.cookies.set("officex_subscription", "active", { path: "/", maxAge: durationMonths * 30 * 86400, sameSite: "lax" });
    response.cookies.set("officex_owner_subscribed", "true", { path: "/", maxAge: durationMonths * 30 * 86400, sameSite: "lax" });
    response.cookies.set("officex_subscription_status", "active", { path: "/", maxAge: durationMonths * 30 * 86400, sameSite: "lax" });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
