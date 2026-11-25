import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entitlements, organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAdminPool } from "@/lib/admin-db";
import { getDeterministicOrgId } from "@/lib/rent-roll/ensure-org";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productCode = "CAFM", // CAFM, RR, PPM, VISITOR, COMPLIANCE, CRM, HELPDESK
      planName = "CAFM Pro Suite",
      edition = "professional",
      amount = 0,
      razorpay_payment_id,
      razorpay_order_id,
      orgId,
      userEmail,
      billingCycle = "monthly",
      subscribed_sqft = null,
      coupon = "",
    } = body;

    const cleanEmail = (userEmail || "").toLowerCase().trim();
    // Resolve target organization
    let targetOrgId = orgId;
    if (!targetOrgId) {
      if (cleanEmail) {
        targetOrgId = getDeterministicOrgId(cleanEmail);
      } else {
        const [firstOrg] = await db.select({ id: organizations.id }).from(organizations).limit(1);
        targetOrgId = firstOrg?.id || "";
      }
    }

    const durationMonths = billingCycle === "annual" ? 12 : 1;
    const daysToAdd = durationMonths === 12 ? 365 : 30;
    const startsAt = new Date();
    const validUntil = new Date(startsAt.getTime() + daysToAdd * 24 * 3600 * 1000);

    // Upsert entitlement
    const existing = await db
      .select()
      .from(entitlements)
      .where(
        and(
          eq(entitlements.orgId, targetOrgId),
          eq(entitlements.productCode, productCode)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(entitlements)
        .set({
          edition,
          status: "active",
          validUntil,
          updatedAt: new Date(),
        })
        .where(eq(entitlements.id, existing[0].id));
    } else {
      await db.insert(entitlements).values({
        orgId: targetOrgId,
        productCode,
        edition,
        status: "active",
        validUntil,
        addons: [],
      });
    }

    // Dual persist to user_subscriptions & system_kv_store so /api/subscription/status always recognizes it
    if (cleanEmail) {
      const canonicalPlanId =
        productCode === "CAFM" ? `cafm-${edition}` :
        productCode === "RR" ? "rent-roll" :
        productCode.toLowerCase();
      const payId = razorpay_payment_id || `SUB_${productCode}_${Date.now()}`;

      try {
        await supabase.from("user_subscriptions").insert({
          email: cleanEmail,
          plan_id: canonicalPlanId,
          plan_name: planName,
          billing_cycle: billingCycle,
          duration_months: durationMonths,
          status: "active",
          starts_at: startsAt.toISOString(),
          ends_at: validUntil.toISOString(),
          amount: Number(amount) || 0,
          currency: "INR",
          payment_id: payId,
          razorpay_order_id: razorpay_order_id || `ORD_${payId}`,
          coupon_code: coupon || null,
          metadata: {
            productCode,
            edition,
            subscribed_sqft: subscribed_sqft ? Number(subscribed_sqft) : null,
          },
        });
      } catch {}

      try {
        const { data: kvData } = await supabase
          .from("system_kv_store")
          .select("data")
          .eq("key", "officex_user_subscriptions")
          .maybeSingle();

        const subsMap = (kvData?.data as Record<string, any>) || {};
        subsMap[cleanEmail] = {
          status: "active",
          plan: canonicalPlanId,
          plan_name: planName,
          billing_cycle: billingCycle,
          duration_months: durationMonths,
          coupon: coupon || "PAID_CHECKOUT",
          paymentId: payId,
          starts_at: startsAt.toISOString(),
          ends_at: validUntil.toISOString(),
          amount: Number(amount) || 0,
          subscribed_sqft: subscribed_sqft ? Number(subscribed_sqft) : null,
          updatedAt: startsAt.toISOString(),
        };

        await supabase
          .from("system_kv_store")
          .upsert({
            key: "officex_user_subscriptions",
            data: subsMap,
            updated_at: startsAt.toISOString(),
          }, { onConflict: "key" });
      } catch {}
    }

    // Record payment in system_kv_store audit log
    const pool = getAdminPool();
    await pool.query(
      `INSERT INTO system_kv_store (key, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
      [
        `sub_tx_${razorpay_payment_id || Date.now()}`,
        JSON.stringify({
          productCode,
          planName,
          edition,
          amount,
          razorpay_payment_id,
          razorpay_order_id,
          userEmail: cleanEmail,
          subscribed_sqft,
          activatedAt: startsAt.toISOString(),
          validUntil: validUntil.toISOString(),
        }),
      ]
    ).catch(() => {});

    const res = NextResponse.json({
      success: true,
      message: `Subscription successfully activated for ${planName}`,
      productCode,
      edition,
      validUntil: validUntil.toISOString(),
    });
    res.cookies.set("officex_subscription", "active", { path: "/", maxAge: daysToAdd * 86400, sameSite: "lax" });
    res.cookies.set("officex_owner_subscribed", "true", { path: "/", maxAge: daysToAdd * 86400, sameSite: "lax" });
    res.cookies.set("officex_subscription_status", "active", { path: "/", maxAge: daysToAdd * 86400, sameSite: "lax" });
    return res;
  } catch (err: any) {
    console.error("Subscription activation error:", err);
    return NextResponse.json(
      { error: "Failed to activate subscription", message: err.message },
      { status: 500 }
    );
  }
}

