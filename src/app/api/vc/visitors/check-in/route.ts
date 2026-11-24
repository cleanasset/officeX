import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisits,
  vcVisitors,
  vcAccessEvents,
  vcVehicles,
  vcAccessPasses,
  cmPermits,
} from "@/db/visitor-compliance-schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST /api/vc/visitors/check-in — Official gate / reception check-in
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitId,
      photoUrl,
      consentFlag = true,
      vehicleReg,
      checkinMethod = "reception",
      accessPoint = "Main Lobby Speed-Gate #1",
    } = body;

    if (!visitId) {
      return NextResponse.json(
        { success: false, message: "visitId is required" },
        { status: 400 }
      );
    }

    const visitRecord = await db
      .select({
        visit: vcVisits,
        visitor: vcVisitors,
      })
      .from(vcVisits)
      .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
      .where(eq(vcVisits.id, visitId))
      .limit(1);

    if (visitRecord.length === 0) {
      return NextResponse.json(
        { success: false, message: "Visit not found" },
        { status: 404 }
      );
    }

    const { visit, visitor } = visitRecord[0];
    const now = new Date();

    // Check if already checked in and not checked out
    if (visit.status === "checked_in" && !visit.checkoutAt) {
      return NextResponse.json(
        { success: false, message: "Visitor is already checked in" },
        { status: 400 }
      );
    }

    // MANDATORY CONTRACTOR GATE COMPLIANCE CHECK (BR-C11 & V-026)
    if (visitor.visitorType === "contractor" || visitor.visitorType === "vendor") {
      const companyOrName = visitor.company || visitor.name;
      const permits = await db
        .select()
        .from(cmPermits)
        .where(
          and(
            or(
              ilike(cmPermits.contractorName, `%${companyOrName}%`),
              ilike(cmPermits.contractorName, `%${visitor.name}%`)
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
        return NextResponse.json(
          {
            success: false,
            message: "GATE REFUSAL (Rule BR-C11): Contractor entry denied. No active approved Work Permit (PTW) on file for this technician.",
          },
          { status: 403 }
        );
      }

      if (new Date(permits[0].validTo) < now) {
        return NextResponse.json(
          {
            success: false,
            message: `GATE REFUSAL (Rule BR-C11): Contractor Work Permit ${permits[0].permitNumber} expired on ${new Date(permits[0].validTo).toLocaleTimeString()}. Renewal required before entry.`,
          },
          { status: 403 }
        );
      }
    }

    // 1. Update Visit status
    await db
      .update(vcVisits)
      .set({
        status: "checked_in",
        checkinAt: now,
        checkinMethod,
        updatedAt: now,
      })
      .where(eq(vcVisits.id, visitId));

    // 2. Update visitor photo/consent if provided
    if (visit.visitorId) {
      await db
        .update(vcVisitors)
        .set({
          photoUrl: photoUrl || undefined,
          consentFlag,
          updatedAt: now,
        })
        .where(eq(vcVisitors.id, visit.visitorId));
    }

    // 3. Log Access Event (Turnstile entry)
    const pass = await db
      .select()
      .from(vcAccessPasses)
      .where(eq(vcAccessPasses.visitId, visitId))
      .limit(1);

    await db.insert(vcAccessEvents).values({
      visitId,
      visitorId: visit.visitorId,
      passId: pass.length > 0 ? pass[0].id : null,
      accessPoint,
      direction: "in",
      timestamp: now,
      sourceSystem: checkinMethod,
      result: "granted",
    });

    // 4. Update Vehicle if present
    if (vehicleReg) {
      const existingVehicle = await db
        .select()
        .from(vcVehicles)
        .where(eq(vcVehicles.visitId, visitId))
        .limit(1);

      if (existingVehicle.length > 0) {
        await db
          .update(vcVehicles)
          .set({
            registrationNo: vehicleReg.toUpperCase(),
            inAt: now,
            status: "parked",
          })
          .where(eq(vcVehicles.id, existingVehicle[0].id));
      } else {
        await db.insert(vcVehicles).values({
          visitId,
          registrationNo: vehicleReg.toUpperCase(),
          inAt: now,
          status: "parked",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Visitor successfully checked in",
      data: {
        visitId,
        checkinAt: now,
        status: "checked_in",
        accessPoint,
      },
    });
  } catch (err: any) {
    console.error("Checkin error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process check-in" },
      { status: 500 }
    );
  }
}
