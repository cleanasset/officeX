import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const role = (searchParams.get("role") || "owner").toLowerCase();

    // Verification Stages (Section 10 State Machine)
    const stages = [
      {
        id: "K0",
        name: "Contact Verification",
        trigger: "Account creation",
        checks: "Email + mobile OTP",
        status: "COMPLETED",
        badge: "VERIFIED"
      },
      {
        id: "K1",
        name: "Business Master",
        trigger: "Organization submission",
        checks: "Legal name, type, PAN/GSTIN/CIN",
        status: "IN_PROGRESS",
        badge: "UNDER_REVIEW"
      },
      {
        id: "K2",
        name: "Identity & Authorization",
        trigger: "High-trust role/action",
        checks: "Authorized representative identity & signatory proof",
        status: "PENDING",
        badge: "SUBMITTED"
      },
      {
        id: "K3",
        name: "Property Title & Listing",
        trigger: "Property listing / transaction",
        checks: "Ownership / authorization evidence",
        status: role.includes("owner") ? "PENDING" : "NOT_APPLICABLE",
        badge: role.includes("owner") ? "QUEUED" : "N/A"
      },
      {
        id: "K4",
        name: "Vendor & Statutory Compliance",
        trigger: "Vendor / RFP access",
        checks: "PF/ESIC/Insurance/ISO statutory evidence",
        status: role.includes("vendor") ? "PENDING" : "NOT_APPLICABLE",
        badge: role.includes("vendor") ? "QUEUED" : "N/A"
      },
      {
        id: "K5",
        name: "Bank & Payout Verification",
        trigger: "Payout / refund / payment use",
        checks: "Bank + IFSC consistency validation",
        status: "PENDING",
        badge: "AWAITING_DOCS"
      }
    ];

    return NextResponse.json({
      organizationId: orgId,
      overallStatus: "IN_REVIEW",
      currentStage: "K1_BUSINESS",
      stages,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      estimatedTurnaroundHours: 24,
      reviewerComments: "Basic contact verified. Business credentials received and queued for automated tax registry match."
    });
  } catch (err: any) {
    console.error("KYC status error:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve status." }, { status: 500 });
  }
}
