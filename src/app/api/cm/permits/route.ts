import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cmPermits } from "@/db/visitor-compliance-schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET /api/cm/permits — List work permits
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");

    const permits = await db
      .select()
      .from(cmPermits)
      .orderBy(desc(cmPermits.createdAt));

    const filtered = permits.filter((p) => {
      if (vendorId && p.vendorId !== vendorId) return false;
      if (status && status !== "all" && p.status !== status) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Permits fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch permits" },
      { status: 500 }
    );
  }
}

// POST /api/cm/permits — Create or approve a Work Permit (PTW)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyId = "prop_tower_a",
      propertyName = "Tower A - Financial Center",
      vendorId,
      contractorName,
      permitType = "hot_work", // hot_work, height, electrical, confined_space, maintenance
      riskControls,
      validFrom,
      validTo,
      approverName = "Chief Safety Officer",
      status = "approved",
    } = body;

    if (!contractorName || !permitType) {
      return NextResponse.json(
        { success: false, message: "Contractor Name and Permit Type are required" },
        { status: 400 }
      );
    }

    const startDate = validFrom ? new Date(validFrom) : new Date();
    const endDate = validTo
      ? new Date(validTo)
      : new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8-hour shift permit

    const permitNumber = `PTW-${permitType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const inserted = await db
      .insert(cmPermits)
      .values({
        propertyId,
        propertyName,
        permitNumber,
        vendorId,
        contractorName,
        permitType,
        riskControls: riskControls || "Safety harness, fire extinguisher, PPE verified.",
        validFrom: startDate,
        validTo: endDate,
        approverName,
        status,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Work Permit (PTW) generated and approved",
      data: inserted[0],
    });
  } catch (err: any) {
    console.error("Permit creation error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to create permit" },
      { status: 500 }
    );
  }
}
