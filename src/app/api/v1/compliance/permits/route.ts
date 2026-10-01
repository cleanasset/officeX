import { NextResponse } from "next/server";
import { getVisitorComplianceDb, createOrApprovePermit } from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || "";

    const db = getVisitorComplianceDb();
    let permits = db.permits || [];

    if (propertyId && propertyId !== "ALL") {
      permits = permits.filter(p => !p.propertyId || p.propertyId === propertyId);
    }

    return NextResponse.json({
      totalPermits: permits.length,
      activeCount: permits.filter(p => p.status === "active").length,
      pendingCount: permits.filter(p => p.status === "pending_approval").length,
      blockedCount: permits.filter(p => p.status === "approval_blocked").length,
      permits
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      permitType = "HOT_WORK",
      title,
      contractor,
      location,
      validFrom,
      validTo,
      riskControls,
      // For approval requests (BR-C11, C-029)
      isApprovalAction = false,
      permitId,
      vendorPrerequisiteValid = true,
      approver
    } = body;

    const result = createOrApprovePermit({
      permitType,
      title,
      contractor,
      location,
      validFrom,
      validTo,
      riskControls,
      isApprovalAction,
      permitId,
      vendorPrerequisiteValid,
      approver
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      permit: result.permit
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Permit operation failed" },
      { status: 400 }
    );
  }
}
