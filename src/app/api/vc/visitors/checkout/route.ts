import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisits,
  vcAccessEvents,
  vcAccessPasses,
  vcVehicles,
} from "@/db/visitor-compliance-schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST /api/vc/visitors/checkout — Visitor exit & badge return
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitId,
      checkoutNotes,
      accessPoint = "Main Exit Gate 01",
      badgeReturned = true,
    } = body;

    if (!visitId) {
      return NextResponse.json(
        { success: false, message: "visitId is required" },
        { status: 400 }
      );
    }

    const visitRecord = await db
      .select()
      .from(vcVisits)
      .where(eq(vcVisits.id, visitId))
      .limit(1);

    if (visitRecord.length === 0) {
      return NextResponse.json(
        { success: false, message: "Visit not found" },
        { status: 404 }
      );
    }

    const visit = visitRecord[0];
    if (visit.checkoutAt) {
      return NextResponse.json(
        { success: false, message: "Visitor has already checked out" },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Update Visit status
    await db
      .update(vcVisits)
      .set({
        status: "checked_out",
        checkoutAt: now,
        checkoutNotes,
        updatedAt: now,
      })
      .where(eq(vcVisits.id, visitId));

    // 2. Mark Access Pass returned/used
    const pass = await db
      .select()
      .from(vcAccessPasses)
      .where(eq(vcAccessPasses.visitId, visitId))
      .limit(1);

    if (pass.length > 0) {
      await db
        .update(vcAccessPasses)
        .set({
          status: badgeReturned ? "returned" : "expired",
          returnedAt: now,
        })
        .where(eq(vcAccessPasses.id, pass[0].id));
    }

    // 3. Mark Vehicle Out
    await db
      .update(vcVehicles)
      .set({
        outAt: now,
        status: "exited",
      })
      .where(eq(vcVehicles.visitId, visitId));

    // 4. Log Exit Event
    await db.insert(vcAccessEvents).values({
      visitId,
      visitorId: visit.visitorId,
      passId: pass.length > 0 ? pass[0].id : null,
      accessPoint,
      direction: "out",
      timestamp: now,
      sourceSystem: "reception_checkout",
      result: "granted",
    });

    return NextResponse.json({
      success: true,
      message: "Visitor successfully checked out",
      data: {
        visitId,
        checkoutAt: now,
        status: "checked_out",
      },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
