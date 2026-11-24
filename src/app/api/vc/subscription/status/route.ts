import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vcSubscriptions } from "@/db/visitor-compliance-schema";
import { eq, desc, gt } from "drizzle-orm";
import { getVisitorEntitlements, getComplianceEntitlements } from "@/lib/vc-entitlements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";

    const subs = await db
      .select()
      .from(vcSubscriptions)
      .where(eq(vcSubscriptions.status, "active"))
      .orderBy(desc(vcSubscriptions.createdAt))
      .limit(1);

    if (subs.length > 0) {
      const sub = subs[0];
      const isExpired = sub.endsAt ? new Date(sub.endsAt) < new Date() : false;

      if (!isExpired) {
        const visitorEntitlements = getVisitorEntitlements(sub.planName);
        const complianceEntitlements = getComplianceEntitlements(sub.planName);

        return NextResponse.json({
          subscribed: true,
          status: "active",
          planName: sub.planName,
          couponCode: sub.couponCode,
          amount: sub.amount,
          endsAt: sub.endsAt,
          visitorEntitlements,
          complianceEntitlements,
        });
      }
    }

    return NextResponse.json({
      subscribed: false,
      status: "inactive",
      visitorEntitlements: getVisitorEntitlements("none"),
      complianceEntitlements: getComplianceEntitlements("none"),
    });
  } catch (err: any) {
    console.error("Error checking subscription status:", err);
    return NextResponse.json(
      { subscribed: false, error: err.message },
      { status: 500 }
    );
  }
}
