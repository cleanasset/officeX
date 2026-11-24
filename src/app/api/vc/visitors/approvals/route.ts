import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vcVisits,
  vcVisitors,
  vcApprovals,
  vcAccessPasses,
} from "@/db/visitor-compliance-schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/vc/visitors/approvals — Queue of pending approvals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";

    const pending = await db
      .select({
        visitId: vcVisits.id,
        visitorId: vcVisitors.id,
        visitorName: vcVisitors.name,
        company: vcVisitors.company,
        mobile: vcVisitors.mobile,
        visitorType: vcVisitors.visitorType,
        photoUrl: vcVisitors.photoUrl,
        propertyName: vcVisits.propertyName,
        floor: vcVisits.floor,
        hostName: vcVisits.hostName,
        tenantName: vcVisits.tenantName,
        purpose: vcVisits.purpose,
        visitStart: vcVisits.visitStart,
        visitEnd: vcVisits.visitEnd,
        riskLevel: vcVisits.riskLevel,
        approvalStatus: vcVisits.approvalStatus,
        createdAt: vcVisits.createdAt,
      })
      .from(vcVisits)
      .innerJoin(vcVisitors, eq(vcVisits.visitorId, vcVisitors.id))
      .where(and(eq(vcVisits.orgId, orgId), eq(vcVisits.approvalStatus, "pending")))
      .orderBy(desc(vcVisits.createdAt));

    return NextResponse.json({
      success: true,
      data: pending,
      count: pending.length,
    });
  } catch (err: any) {
    console.error("Error fetching approvals:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}

// POST /api/vc/visitors/approvals — Host or Security decides on visit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitId,
      decision, // approved, rejected, waiting
      approverId = "host_user",
      approverName = "Authorized Host",
      reason,
    } = body;

    if (!visitId || !decision) {
      return NextResponse.json(
        { success: false, message: "visitId and decision are required" },
        { status: 400 }
      );
    }

    const visit = await db
      .select()
      .from(vcVisits)
      .where(eq(vcVisits.id, visitId))
      .limit(1);

    if (visit.length === 0) {
      return NextResponse.json(
        { success: false, message: "Visit not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // 1. Log approval decision
    await db.insert(vcApprovals).values({
      visitId,
      approverId,
      approverName,
      decision,
      reason,
      createdAt: now,
    });

    // 2. Update visit status
    const newStatus = decision === "rejected" ? "denied" : visit[0].status;
    await db
      .update(vcVisits)
      .set({
        approvalStatus: decision,
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(vcVisits.id, visitId));

    // 3. Update access pass status if rejected
    if (decision === "rejected") {
      await db
        .update(vcAccessPasses)
        .set({ status: "revoked" })
        .where(eq(vcAccessPasses.visitId, visitId));
    }

    return NextResponse.json({
      success: true,
      message: `Visit has been ${decision}`,
      data: {
        visitId,
        decision,
        approvalStatus: decision,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error("Approval error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process approval" },
      { status: 500 }
    );
  }
}
