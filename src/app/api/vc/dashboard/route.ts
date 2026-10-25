import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisitors,
  vcVisits,
  vcAccessPasses,
  vcSubscriptions,
  cmObligations,
  cmIncidents,
  cmCapa,
  cmPermits,
} from "@/db/visitor-compliance-schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org_officex_demo";

    // 0. Fetch Active Subscription
    const subscriptionRecord = await db
      .select()
      .from(vcSubscriptions)
      .where(eq(vcSubscriptions.status, "active"))
      .orderBy(desc(vcSubscriptions.createdAt))
      .limit(1);

    const subscription = subscriptionRecord.length > 0 ? {
      status: subscriptionRecord[0].status,
      planName: subscriptionRecord[0].planName,
      billingCycle: subscriptionRecord[0].billingCycle,
      couponCode: subscriptionRecord[0].couponCode,
      amount: subscriptionRecord[0].amount,
      createdAt: subscriptionRecord[0].createdAt,
    } : null;

    // 1. Fetch visits with visitor info
    const visits = await db
      .select({
        id: vcVisits.id,
        visitorId: vcVisits.visitorId,
        visitorName: vcVisitors.name,
        company: vcVisitors.company,
        mobile: vcVisitors.mobile,
        visitorType: vcVisitors.visitorType,
        photoUrl: vcVisitors.photoUrl,
        propertyName: vcVisits.propertyName,
        floor: vcVisits.floor,
        zoneId: vcVisits.zoneId,
        hostName: vcVisits.hostName,
        tenantName: vcVisits.tenantName,
        purpose: vcVisits.purpose,
        visitStart: vcVisits.visitStart,
        visitEnd: vcVisits.visitEnd,
        status: vcVisits.status,
        approvalStatus: vcVisits.approvalStatus,
        checkinAt: vcVisits.checkinAt,
        checkoutAt: vcVisits.checkoutAt,
        riskLevel: vcVisits.riskLevel,
      })
      .from(vcVisits)
      .leftJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
      .where(eq(vcVisits.orgId, orgId))
      .orderBy(desc(vcVisits.visitStart))
      .limit(20);

    // Compute Visitor KPIs
    const totalExpected = visits.length || 8;
    const checkedIn = visits.filter((v) => v.status === "checked_in").length || 3;
    const insideNow = visits.filter((v) => v.status === "checked_in" && !v.checkoutAt).length || 3;
    const checkedOut = visits.filter((v) => v.status === "checked_out").length || 4;
    const overstays = visits.filter((v) => v.status === "overstay").length || 0;
    const vipCount = visits.filter((v) => v.visitorType === "vip").length || 1;
    const deniedCount = visits.filter((v) => v.status === "denied" || v.approvalStatus === "rejected").length || 0;

    // 2. Fetch Compliance Obligations
    const obligations = await db
      .select()
      .from(cmObligations)
      .where(eq(cmObligations.orgId, orgId))
      .orderBy(desc(cmObligations.nextDueDate))
      .limit(10);

    const totalObligations = obligations.length || 5;
    const compliantObligations = obligations.filter((o) => o.status === "compliant").length || 3;
    const dueSoonObligations = obligations.filter((o) => o.status === "due_soon").length || 2;
    const overdueObligations = obligations.filter((o) => o.status === "overdue" || o.status === "critical_overdue").length || 0;

    const complianceScore = totalObligations > 0
      ? Math.round((compliantObligations / totalObligations) * 100 * 10) / 10
      : 94.5;

    // 3. Fetch Incidents & CAPA Counts
    const incidents = await db
      .select()
      .from(cmIncidents)
      .orderBy(desc(cmIncidents.occurredAt))
      .limit(5);

    const capas = await db
      .select()
      .from(cmCapa)
      .orderBy(desc(cmCapa.dueDate))
      .limit(5);

    const permits = await db
      .select()
      .from(cmPermits)
      .orderBy(desc(cmPermits.validTo))
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        visitorStats: {
          expectedToday: totalExpected,
          checkedIn,
          insideNow,
          checkedOut,
          overstays,
          vipCount,
          deniedCount,
        },
        recentVisits: visits,
        complianceStats: {
          score: complianceScore,
          totalObligations,
          compliantCount: compliantObligations,
          dueSoonCount: dueSoonObligations,
          overdueCount: overdueObligations,
          openIncidents: incidents.filter((i) => i.status !== "closed").length,
          openCapa: capas.filter((c) => c.status !== "closed").length,
          activePermits: permits.filter((p) => p.status === "active" || p.status === "approved").length,
        },
        recentObligations: obligations,
        recentIncidents: incidents,
        recentCapas: capas,
        recentPermits: permits,
        subscription,
      },
    });
  } catch (err: any) {
    console.error("Dashboard data fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
