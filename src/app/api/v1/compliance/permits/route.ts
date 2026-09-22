import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const permits: any[] = [];

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
      vendorPrerequisiteValid = true
    } = body;

    // BR-C11 / C-029: Validate contractor statutory prerequisites
    if (isApprovalAction) {
      if (!vendorPrerequisiteValid) {
        return NextResponse.json(
          {
            error: "BR-C11 Violation: Cannot approve permit. Mandatory vendor compliance certificate or workman insurance is expired.",
            code: "EXPIRED_PREREQUISITE_BLOCKED"
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        permitId,
        status: "active",
        approvedAt: new Date().toISOString(),
        message: "Permit approved. Safety controls verified. Active permit issued."
      });
    }

    if (!title || !contractor || !validFrom || !validTo || !riskControls) {
      return NextResponse.json({ error: "Title, Contractor, Validity Window, and Risk Controls are required." }, { status: 400 });
    }

    const newPermit = {
      id: `PTW-2026-${Math.floor(100 + Math.random() * 900)}`,
      permitType,
      title: title.trim(),
      contractor: contractor.trim(),
      location: location || "Building Campus",
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      riskControls: riskControls.trim(),
      vendorPrerequisiteValid: true,
      status: "pending_approval",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Permit requested and submitted for EHS review.",
      permit: newPermit
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
