import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisits,
  vcVisitors,
  vcAccessPasses,
} from "@/db/visitor-compliance-schema";
import { eq, and, isNotNull, isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/vc/visitors/emergency — Real-time live evacuation roll-call
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";
    const propertyId = searchParams.get("propertyId");

    const occupants = await db
      .select({
        visitId: vcVisits.id,
        visitorId: vcVisitors.id,
        name: vcVisitors.name,
        company: vcVisitors.company,
        mobile: vcVisitors.mobile,
        visitorType: vcVisitors.visitorType,
        propertyName: vcVisits.propertyName,
        buildingId: vcVisits.buildingId,
        floor: vcVisits.floor,
        zoneId: vcVisits.zoneId,
        hostName: vcVisits.hostName,
        tenantName: vcVisits.tenantName,
        checkinAt: vcVisits.checkinAt,
        riskLevel: vcVisits.riskLevel,
        passNumber: vcAccessPasses.passNumber,
      })
      .from(vcVisits)
      .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
      .leftJoin(vcAccessPasses, eq(vcAccessPasses.visitId, vcVisits.id))
      .where(
        and(
          eq(vcVisits.orgId, orgId),
          eq(vcVisits.status, "checked_in"),
          isNotNull(vcVisits.checkinAt),
          isNull(vcVisits.checkoutAt)
        )
      )
      .orderBy(desc(vcVisits.checkinAt));

    // Group by building and floor
    const grouped: Record<string, typeof occupants> = {};
    for (const occ of occupants) {
      const key = `${occ.propertyName || "Tower A"} - ${occ.floor || "Lobby"}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(occ);
    }

    return NextResponse.json({
      success: true,
      totalOccupants: occupants.length,
      occupants,
      zones: Object.entries(grouped).map(([zoneName, people]) => ({
        zoneName,
        count: people.length,
        people,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Emergency rollcall error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch emergency roll call" },
      { status: 500 }
    );
  }
}
