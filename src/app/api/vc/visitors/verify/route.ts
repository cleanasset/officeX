import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisitors,
  vcVisits,
  vcAccessPasses,
  vcWatchlist,
  vcVehicles,
  cmPermits,
} from "@/db/visitor-compliance-schema";
import { eq, and, or, ilike, gte, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/vc/visitors/verify?token=... or ?query=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const query = searchParams.get("query"); // passNumber or mobile or name
    const orgId = searchParams.get("orgId") || "default_org";

    if (!token && !query) {
      return NextResponse.json(
        { success: false, message: "Token or query parameter is required" },
        { status: 400 }
      );
    }

    let records;
    if (token) {
      records = await db
        .select({
          visitId: vcVisits.id,
          visitorId: vcVisitors.id,
          name: vcVisitors.name,
          company: vcVisitors.company,
          mobile: vcVisitors.mobile,
          email: vcVisitors.email,
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
          approvalStatus: vcVisits.approvalStatus,
          status: vcVisits.status,
          riskLevel: vcVisits.riskLevel,
          checkinAt: vcVisits.checkinAt,
          checkoutAt: vcVisits.checkoutAt,
          passId: vcAccessPasses.id,
          passNumber: vcAccessPasses.passNumber,
          passStatus: vcAccessPasses.status,
          validFrom: vcAccessPasses.validFrom,
          validTo: vcAccessPasses.validTo,
          accessZones: vcAccessPasses.accessZones,
        })
        .from(vcAccessPasses)
        .innerJoin(vcVisits, eq(vcAccessPasses.visitId, vcVisits.id))
        .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
        .where(
          and(
            eq(vcVisits.orgId, orgId),
            or(
              eq(vcAccessPasses.qrToken, token),
              eq(vcAccessPasses.passNumber, token)
            )
          )
        )
        .limit(1);
    } else {
      const q = query!.trim();
      records = await db
        .select({
          visitId: vcVisits.id,
          visitorId: vcVisitors.id,
          name: vcVisitors.name,
          company: vcVisitors.company,
          mobile: vcVisitors.mobile,
          email: vcVisitors.email,
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
          approvalStatus: vcVisits.approvalStatus,
          status: vcVisits.status,
          riskLevel: vcVisits.riskLevel,
          checkinAt: vcVisits.checkinAt,
          checkoutAt: vcVisits.checkoutAt,
          passId: vcAccessPasses.id,
          passNumber: vcAccessPasses.passNumber,
          passStatus: vcAccessPasses.status,
          validFrom: vcAccessPasses.validFrom,
          validTo: vcAccessPasses.validTo,
          accessZones: vcAccessPasses.accessZones,
        })
        .from(vcVisits)
        .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
        .leftJoin(vcAccessPasses, eq(vcAccessPasses.visitId, vcVisits.id))
        .where(
          and(
            eq(vcVisits.orgId, orgId),
            or(
              eq(vcAccessPasses.passNumber, q.toUpperCase()),
              eq(vcVisitors.mobile, q),
              ilike(vcVisitors.name, `%${q}%`)
            )
          )
        )
        .limit(1);
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active pass or scheduled visit found for this query" },
        { status: 404 }
      );
    }

    const visit = records[0];
    const now = new Date();

    // 1. Check watchlist status
    const watchlistMatch = await db
      .select()
      .from(vcWatchlist)
      .where(
        and(
          eq(vcWatchlist.orgId, orgId),
          or(
            eq(vcWatchlist.mobile, visit.mobile),
            ilike(vcWatchlist.name, visit.name)
          )
        )
      )
      .limit(1);

    const isWatchlisted = watchlistMatch.length > 0;

    // 2. Check Contractor Compliance & Work Permit (PTW) Bridge (BR-C11 & V-026)
    let contractorComplianceBlocked = false;
    let contractorBlockReason = "";
    let activePermitNumber: string | null = null;

    if (visit.visitorType === "contractor" || visit.visitorType === "vendor") {
      const companyOrName = visit.company || visit.name;
      const permits = await db
        .select()
        .from(cmPermits)
        .where(
          and(
            or(
              ilike(cmPermits.contractorName, `%${companyOrName}%`),
              ilike(cmPermits.contractorName, `%${visit.name}%`)
            ),
            or(
              eq(cmPermits.status, "approved"),
              eq(cmPermits.status, "active")
            )
          )
        )
        .orderBy(desc(cmPermits.validTo))
        .limit(1);

      if (permits.length === 0) {
        contractorComplianceBlocked = true;
        contractorBlockReason = "CONTRACTOR BLOCKED: No active Work Permit (PTW) on file for this vendor/technician";
      } else if (new Date(permits[0].validTo) < now) {
        contractorComplianceBlocked = true;
        contractorBlockReason = `CONTRACTOR BLOCKED: Work Permit ${permits[0].permitNumber} expired on ${new Date(permits[0].validTo).toLocaleTimeString()}`;
      } else {
        activePermitNumber = permits[0].permitNumber;
      }
    }

    // 3. Check Vehicle
    const vehicles = await db
      .select()
      .from(vcVehicles)
      .where(eq(vcVehicles.visitId, visit.visitId))
      .limit(1);

    // 4. Compute eligibility
    const isExpired = visit.validTo && new Date(visit.validTo) < now;
    const isPendingApproval = visit.approvalStatus !== "approved" && visit.approvalStatus !== "auto_approved";
    const isAlreadyCheckedIn = visit.status === "checked_in" && !visit.checkoutAt;

    let clearance = "CLEARED";
    if (isWatchlisted) clearance = "WATCHLIST_MATCH";
    else if (contractorComplianceBlocked) clearance = "CONTRACTOR_COMPLIANCE_BLOCKED";
    else if (isExpired) clearance = "PASS_EXPIRED";
    else if (isPendingApproval) clearance = "APPROVAL_PENDING";
    else if (isAlreadyCheckedIn) clearance = "ALREADY_INSIDE";

    return NextResponse.json({
      success: true,
      data: {
        ...visit,
        vehicleReg: vehicles.length > 0 ? vehicles[0].registrationNo : null,
        isWatchlisted,
        watchlistReason: isWatchlisted ? watchlistMatch[0].reason : null,
        contractorComplianceBlocked,
        contractorBlockReason: contractorComplianceBlocked ? contractorBlockReason : null,
        activePermitNumber,
        clearance,
        canCheckIn: clearance === "CLEARED",
      },
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to verify visitor" },
      { status: 500 }
    );
  }
}
