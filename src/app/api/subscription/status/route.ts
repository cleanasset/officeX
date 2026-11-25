import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/db";
import { entitlements } from "@/db/schema";
import { vcSubscriptions } from "@/db/visitor-compliance-schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { getDeterministicOrgId } from "@/lib/rent-roll/ensure-org";
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

type ModuleEntitlements = {
  allInOne: boolean;
  rentRoll: boolean;
  visitors: boolean;
  ppm: boolean;
  compliance: boolean;
  helpdesk: boolean;
  leaseCrm: boolean;
};

function resolveModules(planId: string, isAdmin: boolean): ModuleEntitlements {
  const p = (planId || "").toLowerCase().trim();
  const isAllInOne =
    isAdmin ||
    p.includes("cafm") ||
    p.includes("suite") ||
    p.includes("commercial-suite") ||
    p.includes("reit") ||
    p.includes("enterprise");

  const isRentRoll =
    isAllInOne ||
    p === "rr" ||
    p.includes("rentroll") ||
    p.includes("rent-roll") ||
    p.includes("starter") ||
    p.includes("growth") ||
    p.includes("campus") ||
    p.includes("techpark");
  const isVisitors = isAllInOne || p.includes("visitor") || p === "vc";
  const isPpm = isAllInOne || p === "ppm" || p.includes("ppm") || p.includes("maintenance");
  const isCompliance = isAllInOne || p.includes("compliance") || p === "vc";
  const isHelpdesk = isAllInOne || p.includes("helpdesk");
  const isLeaseCrm = isAllInOne || p === "crm" || p.includes("crm") || p.includes("lease");

  return {
    allInOne: isAllInOne,
    rentRoll: isRentRoll,
    visitors: isVisitors,
    ppm: isPpm,
    compliance: isCompliance,
    helpdesk: isHelpdesk,
    leaseCrm: isLeaseCrm,
  };
}

function mergeModules(a: ModuleEntitlements, b: ModuleEntitlements): ModuleEntitlements {
  const allInOne = a.allInOne || b.allInOne;
  return {
    allInOne,
    rentRoll: allInOne || a.rentRoll || b.rentRoll,
    visitors: allInOne || a.visitors || b.visitors,
    ppm: allInOne || a.ppm || b.ppm,
    compliance: allInOne || a.compliance || b.compliance,
    helpdesk: allInOne || a.helpdesk || b.helpdesk,
    leaseCrm: allInOne || a.leaseCrm || b.leaseCrm,
  };
}

const EMPTY_MODULES = {
  allInOne: false,
  rentRoll: false,
  visitors: false,
  ppm: false,
  compliance: false,
  helpdesk: false,
  leaseCrm: false,
};

export async function GET(request: Request) {
  try {
    const headers = request.headers;
    const cookieHeader = headers.get("cookie") || "";
    const emailCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("officex_user_email="));
    const headerEmail = headers.get("x-user-email");
    const callerEmail = emailCookie
      ? decodeURIComponent(emailCookie.split("=")[1].trim()).toLowerCase()
      : headerEmail ? headerEmail.toLowerCase().trim() : null;

    const hasAuthCookie = cookieHeader.split(";").some(c => c.trim().startsWith("officex_auth=1") || c.trim().startsWith("officex_session_active=1"));
    const hasAuth = hasAuthCookie || Boolean(headers.get("authorization")) || (callerEmail && callerEmail.includes("@"));

    if (!hasAuth) {
      return NextResponse.json({ error: "Authentication required to view subscription status." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email")?.toLowerCase().trim();

    const isMasterAdmin =
      callerEmail === "admin@gmail.com" ||
      callerEmail === "medistationlifecare@gmail.com" ||
      cookieHeader.includes("officex_role=super_admin") ||
      cookieHeader.includes("officex_admin=1");

    // Prevent cross-user subscription probing
    if (requestedEmail && callerEmail && requestedEmail !== callerEmail && !isMasterAdmin) {
      return NextResponse.json(
        { error: "Access denied. You may only check your own subscription status." },
        { status: 403 }
      );
    }

    const email = requestedEmail || callerEmail;

    // 1. Super Admin and Sovereign Property Owner accounts ALWAYS retain enterprise sovereign access
    const isSuperAdminEmail =
      email === "admin@gmail.com" ||
      email === "medistationlifecare@gmail.com";

    if (isSuperAdminEmail) {
      const adminModules = resolveModules("reit-mega", true);
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
        subscribed_sqft: 500000000,
        totalPortfolioSqft: 0,
        remaining_sqft: 500000000,
        starts_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        ends_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        modules: adminModules,
        activeModuleKeys: Object.keys(adminModules).filter(k => k !== "allInOne"),
        activeModulesCount: 6,
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
        subscribed_sqft: 0,
        totalPortfolioSqft: 0,
        remaining_sqft: 0,
        modules: EMPTY_MODULES,
        activeModuleKeys: [],
        activeModulesCount: 0,
        message: "No email provided"
      }, { status: 200 });
    }

    const userOrgId = getDeterministicOrgId(email);

    // Calculate current portfolio sqft strictly for the user's organization
    let totalPortfolioSqft = 0;
    try {
      const { data: propRows } = await supabase
        .from("property")
        .select("total_leasable_area_sqft")
        .eq("org_id", userOrgId)
        .is("deleted_at", null);
      if (Array.isArray(propRows)) {
        totalPortfolioSqft = propRows.reduce((sum, p) => sum + (Number(p.total_leasable_area_sqft) || 0), 0);
      }
    } catch {
      // Non-blocking
    }

    // 2. Check users table for super_admin role
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      if (userData?.role === "super_admin") {
        const adminModules = resolveModules("reit-mega", true);
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
          subscribed_sqft: 500000000,
          totalPortfolioSqft,
          remaining_sqft: 500000000,
          modules: adminModules,
          activeModuleKeys: Object.keys(adminModules).filter(k => k !== "allInOne"),
          activeModulesCount: 6,
        }, { status: 200 });
        res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 31536000, sameSite: "lax" });
        return res;
      }
    } catch {
      // Non-blocking
    }

    // Collect unified active subscriptions across user_subscriptions, system_kv_store, entitlements & vc_subscriptions
    let isSubscribedAny = false;
    let mergedModules: ModuleEntitlements = { ...EMPTY_MODULES };
    let primaryPlan = "none";
    let primaryPlanName = "";
    let primaryBillingCycle = "monthly";
    let primaryDurationMonths = 1;
    let primaryStartsAt = "";
    let primaryEndsAt = "";
    let primaryPaymentId: string | null = null;
    let primaryCoupon: string | null = null;
    let maxEndsAtMs = 0;
    let bestSubscribedSqft: number | null = null;

    // 3. Query PostgreSQL user_subscriptions table for all active unexpired subscriptions
    try {
      const nowIso = new Date().toISOString();
      const { data: dbSubs, error: dbErr } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("email", email)
        .eq("status", "active")
        .gt("ends_at", nowIso)
        .order("ends_at", { ascending: false })
        .limit(20);

      if (!dbErr && Array.isArray(dbSubs) && dbSubs.length > 0) {
        for (const dbSub of dbSubs) {
          isSubscribedAny = true;
          const planKey = dbSub.plan_id || "commercial-suite";
          mergedModules = mergeModules(mergedModules, resolveModules(planKey, false));
          const endsAtMs = new Date(dbSub.ends_at).getTime();
          if (endsAtMs >= maxEndsAtMs) {
            maxEndsAtMs = endsAtMs;
            primaryPlan = planKey;
            primaryPlanName = dbSub.plan_name || "OfficeX Commercial Suite";
            primaryBillingCycle = dbSub.billing_cycle || "monthly";
            primaryDurationMonths = dbSub.duration_months || 1;
            primaryStartsAt = dbSub.starts_at;
            primaryEndsAt = dbSub.ends_at;
            primaryPaymentId = dbSub.payment_id;
            primaryCoupon = dbSub.coupon_code;
          }
          const subSqft = Number(dbSub.metadata?.subscribed_sqft || 0);
          if (subSqft > 0) {
            bestSubscribedSqft = Math.max(bestSubscribedSqft || 0, subSqft);
          }
        }
      }
    } catch (e) {
      console.warn("user_subscriptions lookup error:", e);
    }

    // 4. Secondary lookup: check system_kv_store for unexpired active subscription
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

        if (endsAtMs > Date.now()) {
          isSubscribedAny = true;
          const planKey = userSub.plan || "commercial-suite";
          mergedModules = mergeModules(mergedModules, resolveModules(planKey, false));
          if (endsAtMs >= maxEndsAtMs) {
            maxEndsAtMs = endsAtMs;
            primaryPlan = planKey;
            primaryPlanName = userSub.plan_name || primaryPlanName || "OfficeX Commercial Suite";
            primaryBillingCycle = userSub.billing_cycle || "monthly";
            primaryDurationMonths = userSub.duration_months || 1;
            primaryStartsAt = userSub.startsAt || userSub.starts_at || new Date().toISOString();
            primaryEndsAt = endsAtStr || new Date(endsAtMs).toISOString();
            primaryPaymentId = userSub.paymentId || primaryPaymentId;
            primaryCoupon = userSub.coupon || primaryCoupon;
          }
          const subSqft = Number(userSub.subscribed_sqft || 0);
          if (subSqft > 0) {
            bestSubscribedSqft = Math.max(bestSubscribedSqft || 0, subSqft);
          }
        }
      }
    } catch {
      // Non-blocking
    }

    // 5. Tertiary lookup: check modular entitlements table (written by /api/pricing/subscribe)
    try {
      const now = new Date();
      const orgEnts = await db
        .select()
        .from(entitlements)
        .where(and(eq(entitlements.orgId, userOrgId), eq(entitlements.status, "active")));

      for (const ent of orgEnts) {
        if (ent.validUntil && new Date(ent.validUntil).getTime() <= now.getTime()) continue;
        isSubscribedAny = true;
        const code = (ent.productCode || "").toLowerCase().trim();
        const modPlanKey =
          code === "cafm" ? `cafm-${ent.edition || "pro"}` :
          code === "rr" ? "rent-roll" :
          code === "ppm" ? "ppm" :
          code === "visitor" ? "visitor" :
          code === "compliance" ? "compliance" :
          code === "crm" ? "crm" :
          code === "helpdesk" ? "helpdesk" : code;
        mergedModules = mergeModules(mergedModules, resolveModules(modPlanKey, false));
        const endsAtMs = ent.validUntil ? new Date(ent.validUntil).getTime() : Date.now() + 30 * 86400000;
        if (endsAtMs >= maxEndsAtMs) {
          maxEndsAtMs = endsAtMs;
          if (primaryPlan === "none") {
            primaryPlan = modPlanKey;
            primaryPlanName = code === "cafm" ? `CAFM ${ent.edition || "Pro"}` : modPlanKey.toUpperCase();
            primaryEndsAt = new Date(endsAtMs).toISOString();
            primaryStartsAt = ent.updatedAt ? new Date(ent.updatedAt).toISOString() : new Date().toISOString();
          }
        }
      }
    } catch {
      // Non-blocking
    }

    // 6. Check Visitor & Compliance standalone subscription table
    try {
      const vcSubs = await db
        .select()
        .from(vcSubscriptions)
        .where(and(eq(vcSubscriptions.orgId, userOrgId), eq(vcSubscriptions.status, "active")))
        .orderBy(desc(vcSubscriptions.createdAt))
        .limit(1);

      if (vcSubs.length > 0) {
        const sub = vcSubs[0];
        const endsAtMs = sub.endsAt ? new Date(sub.endsAt).getTime() : Date.now() + 30 * 86400000;
        if (endsAtMs > Date.now()) {
          isSubscribedAny = true;
          mergedModules = mergeModules(mergedModules, resolveModules("vc", false));
          if (primaryPlan === "none") {
            maxEndsAtMs = Math.max(maxEndsAtMs, endsAtMs);
            primaryPlan = "vc-commercial-pass";
            primaryPlanName = sub.planName || "Visitor & Compliance Pass";
            primaryEndsAt = new Date(endsAtMs).toISOString();
          }
        }
      }
    } catch {
      // Non-blocking
    }

    if (isSubscribedAny) {
      const daysRemaining = maxEndsAtMs > 0
        ? Math.max(1, Math.ceil((maxEndsAtMs - Date.now()) / (1000 * 60 * 60 * 24)))
        : 30;
      const activeKeys = Object.entries(mergedModules).filter(([k, v]) => v && k !== "allInOne").map(([k]) => k);
      const effectiveSqftCap = bestSubscribedSqft && bestSubscribedSqft > 0
        ? bestSubscribedSqft
        : (totalPortfolioSqft > 0 ? totalPortfolioSqft : null);

      const res = NextResponse.json({
        subscribed: true,
        email,
        plan: primaryPlan,
        plan_name: primaryPlanName || "OfficeX Commercial Suite",
        billing_cycle: primaryBillingCycle,
        duration_months: primaryDurationMonths,
        starts_at: primaryStartsAt || new Date().toISOString(),
        ends_at: primaryEndsAt || new Date(Date.now() + daysRemaining * 86400000).toISOString(),
        days_remaining: daysRemaining,
        payment_id: primaryPaymentId,
        coupon: primaryCoupon,
        subscribed_sqft: effectiveSqftCap,
        totalPortfolioSqft,
        remaining_sqft: effectiveSqftCap ? Math.max(0, effectiveSqftCap - totalPortfolioSqft) : null,
        modules: mergedModules,
        activeModuleKeys: activeKeys,
        activeModulesCount: activeKeys.length,
      }, { status: 200 });
      res.cookies.set("officex_subscription", "active", { path: "/", maxAge: 2592000, sameSite: "lax" });
      res.cookies.set("officex_owner_subscribed", "true", { path: "/", maxAge: 2592000, sameSite: "lax" });
      res.cookies.set("officex_subscription_status", "active", { path: "/", maxAge: 2592000, sameSite: "lax" });
      return res;
    }

    // 5. Default: User has no active paid subscription
    const unverifiedRes = NextResponse.json({
      subscribed: false,
      email,
      plan: "none",
      subscribed_sqft: 0,
      totalPortfolioSqft,
      remaining_sqft: 0,
      modules: EMPTY_MODULES,
      activeModuleKeys: [],
      activeModulesCount: 0,
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
    const plan = (body.plan || "commercial-suite").toLowerCase().trim();
    const planName = body.plan_name || (plan === "commercial-suite" ? "OfficeX Commercial Suite" : plan === "starter" ? "Commercial Starter" : plan === "reit-mega" ? "REIT Mega-Portfolio" : "Commercial Operating Suite");

    const durationMonths = Number(body.duration_months) || (body.billing_cycle === "annual" ? 12 : body.billing_cycle === "half_yearly" ? 6 : body.billing_cycle === "quarterly" ? 3 : 1);
    const billingCycle = body.billing_cycle || (durationMonths === 12 ? "annual" : durationMonths === 6 ? "half_yearly" : durationMonths === 3 ? "quarterly" : "monthly");
    const amount = Number(body.amount) || 0;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Calculate exact start and expiration dates (30 days/mo, 365 days for 1 year)
    const startsAt = new Date();
    const daysToAdd = durationMonths === 12 ? 365 : durationMonths * 30;
    const endsAt = new Date(startsAt.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

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
          requestedDuration: `${durationMonths} month(s)`,
          subscribed_sqft: body.subscribed_sqft ? Number(body.subscribed_sqft) : null,
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
        subscribed_sqft: body.subscribed_sqft ? Number(body.subscribed_sqft) : null,
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
      subscribed_sqft: body.subscribed_sqft ? Number(body.subscribed_sqft) : null,
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
