import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisitors,
  vcVisits,
  vcAccessPasses,
  vcVehicles,
  vcWatchlist,
} from "@/db/visitor-compliance-schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET /api/vc/visitors — List visitors and visits with real filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";
    const status = searchParams.get("status"); // scheduled, checked_in, checked_out, overstay, all
    const search = searchParams.get("search");
    const propertyId = searchParams.get("propertyId");

    let query = db
      .select({
        visitId: vcVisits.id,
        visitorId: vcVisitors.id,
        name: vcVisitors.name,
        company: vcVisitors.company,
        mobile: vcVisitors.mobile,
        email: vcVisitors.email,
        visitorType: vcVisitors.visitorType,
        photoUrl: vcVisitors.photoUrl,
        propertyId: vcVisits.propertyId,
        propertyName: vcVisits.propertyName,
        buildingId: vcVisits.buildingId,
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
        specialInstructions: vcVisits.specialInstructions,
        passNumber: vcAccessPasses.passNumber,
        qrToken: vcAccessPasses.qrToken,
        passStatus: vcAccessPasses.status,
      })
      .from(vcVisits)
      .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
      .leftJoin(vcAccessPasses, eq(vcAccessPasses.visitId, vcVisits.id))
      .where(eq(vcVisits.orgId, orgId))
      .orderBy(desc(vcVisits.createdAt));

    const records = await query;

    // Filter in-memory for custom status logic (e.g. overstay)
    const now = new Date();
    const filtered = records.filter((r) => {
      if (propertyId && r.propertyId !== propertyId) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.company && r.company.toLowerCase().includes(q)) ||
          (r.mobile && r.mobile.includes(q)) ||
          (r.passNumber && r.passNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (status && status !== "all") {
        if (status === "inside") {
          return r.status === "checked_in" && r.checkinAt && !r.checkoutAt;
        }
        if (status === "overstay") {
          return (
            r.status === "checked_in" &&
            r.checkinAt &&
            !r.checkoutAt &&
            new Date(r.visitEnd) < now
          );
        }
        if (status === "expected") {
          return r.status === "scheduled" && !r.checkinAt;
        }
        return r.status === status;
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Error fetching visitors:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

// POST /api/vc/visitors — Pre-register a visitor or create a walk-in
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId = "default_org",
      name,
      company,
      mobile,
      email,
      visitorType = "guest",
      propertyId = "prop_tower_a",
      propertyName = "Tower A - Financial Center",
      buildingId,
      floor = "Lobby",
      zoneId = "General Access",
      hostUserId,
      hostName,
      tenantId,
      tenantName,
      purpose = "Business Meeting",
      visitStart,
      visitEnd,
      riskLevel = "low",
      specialInstructions,
      vehicleReg,
      isWalkIn = false,
      photoUrl,
      identityType,
      identityRefToken,
    } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { success: false, message: "Name and Mobile number are required" },
        { status: 400 }
      );
    }

    const startDate = visitStart ? new Date(visitStart) : new Date();
    const endDate = visitEnd
      ? new Date(visitEnd)
      : new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // default 4 hrs validity

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, message: "Visit end time must be after start time" },
        { status: 400 }
      );
    }

    // 1. Check Watchlist
    const watchlistMatch = await db
      .select()
      .from(vcWatchlist)
      .where(
        and(
          eq(vcWatchlist.orgId, orgId),
          or(
            eq(vcWatchlist.mobile, mobile),
            ilike(vcWatchlist.name, name)
          )
        )
      )
      .limit(1);

    const isWatchlisted = watchlistMatch.length > 0;
    const computedRisk = isWatchlisted ? "critical" : riskLevel;

    // 2. Insert or find Visitor Profile
    let visitorRecord = await db
      .select()
      .from(vcVisitors)
      .where(and(eq(vcVisitors.orgId, orgId), eq(vcVisitors.mobile, mobile)))
      .limit(1);

    let visitorId: string;
    if (visitorRecord.length > 0) {
      visitorId = visitorRecord[0].id;
      // Update details
      await db
        .update(vcVisitors)
        .set({
          name,
          company: company || visitorRecord[0].company,
          email: email || visitorRecord[0].email,
          photoUrl: photoUrl || visitorRecord[0].photoUrl,
          identityType: identityType || visitorRecord[0].identityType,
          identityRefToken: identityRefToken || visitorRecord[0].identityRefToken,
          updatedAt: new Date(),
        })
        .where(eq(vcVisitors.id, visitorId));
    } else {
      const newVisitor = await db
        .insert(vcVisitors)
        .values({
          orgId,
          name,
          company,
          mobile,
          email,
          visitorType,
          photoUrl,
          identityType,
          identityRefToken,
          consentFlag: true,
          status: "active",
        })
        .returning();
      visitorId = newVisitor[0].id;
    }

    // 3. Generate Unique Pass Number & Token
    const passNumber = `PASS-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const qrToken = `OXPASS:${visitorId}:${passNumber}:${Date.now()}`;

    // 4. Create Visit
    const initialStatus = isWalkIn ? "scheduled" : "scheduled";
    const initialApproval = isWalkIn
      ? "pending"
      : isWatchlisted
      ? "pending"
      : "auto_approved";

    const newVisit = await db
      .insert(vcVisits)
      .values({
        visitorId,
        orgId,
        propertyId,
        propertyName,
        buildingId,
        floor,
        zoneId,
        hostUserId,
        hostName: hostName || "Reception Desk",
        tenantId,
        tenantName: tenantName || "Building Management",
        purpose,
        visitStart: startDate,
        visitEnd: endDate,
        approvalStatus: initialApproval,
        status: initialStatus,
        riskLevel: computedRisk,
        specialInstructions,
        checkinMethod: isWalkIn ? "kiosk" : "reception",
      })
      .returning();

    const visitId = newVisit[0].id;

    // 5. Create Access Pass
    const newPass = await db
      .insert(vcAccessPasses)
      .values({
        visitId,
        passNumber,
        passType: "digital_qr",
        qrToken,
        validFrom: startDate,
        validTo: endDate,
        accessZones: [floor, "Lobby", "Elevator"],
        status: "active",
      })
      .returning();

    // 6. Optional Vehicle Registration
    if (vehicleReg) {
      await db.insert(vcVehicles).values({
        visitId,
        registrationNo: vehicleReg.toUpperCase(),
        type: "four_wheeler",
        status: "expected",
      });
    }

    return NextResponse.json({
      success: true,
      message: isWalkIn ? "Walk-in visitor registered" : "Visitor pre-registered successfully",
      data: {
        visitId,
        visitorId,
        passNumber,
        qrToken,
        approvalStatus: initialApproval,
        status: initialStatus,
        riskLevel: computedRisk,
        isWatchlisted,
        validFrom: startDate,
        validTo: endDate,
      },
    });
  } catch (err: any) {
    console.error("Error creating visitor:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to create visitor" },
      { status: 500 }
    );
  }
}
