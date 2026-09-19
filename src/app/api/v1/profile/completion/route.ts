import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") || "owner").toLowerCase();
    const hasOrg = searchParams.get("hasOrg") === "true";
    const hasRoleProfile = searchParams.get("hasRoleProfile") === "true";
    const hasKyc = searchParams.get("hasKyc") === "true";

    let score = 20; // Contact OTP verified gives 15-20%
    const breakdown: Array<{ category: string; weight: number; completed: boolean; actionHint: string }> = [];

    if (role.includes("owner")) {
      breakdown.push(
        { category: "Contact Verification", weight: 15, completed: true, actionHint: "Email & mobile verified" },
        { category: "Organization Master", weight: 25, completed: hasOrg, actionHint: "Provide legal entity name & PAN" },
        { category: "Portfolio Overview", weight: 25, completed: hasRoleProfile, actionHint: "Specify asset types & portfolio sqft" },
        { category: "Property Data", weight: 20, completed: hasRoleProfile, actionHint: "Input leasable area & occupancy %" },
        { category: "KYC & Title Evidence", weight: 15, completed: hasKyc, actionHint: "Upload ownership proof & GST cert" }
      );
    } else if (role.includes("broker")) {
      breakdown.push(
        { category: "Contact Verification", weight: 15, completed: true, actionHint: "Email & mobile verified" },
        { category: "Organization Master", weight: 25, completed: hasOrg, actionHint: "Provide brokerage legal details" },
        { category: "Services & Markets", weight: 30, completed: hasRoleProfile, actionHint: "Select operating cities & micro-markets" },
        { category: "RERA & Compliance", weight: 15, completed: hasKyc, actionHint: "Upload RERA Registration certificate" },
        { category: "Deal Preferences", weight: 15, completed: hasRoleProfile, actionHint: "Specify average deal size & client focus" }
      );
    } else if (role.includes("vendor")) {
      breakdown.push(
        { category: "Contact Verification", weight: 10, completed: true, actionHint: "Email & mobile verified" },
        { category: "Organization Master", weight: 20, completed: hasOrg, actionHint: "Provide company master & PAN" },
        { category: "FM Service Capabilities", weight: 25, completed: hasRoleProfile, actionHint: "Choose service categories & staff count" },
        { category: "Statutory & Labor Compliance", weight: 30, completed: hasKyc, actionHint: "Upload PF/ESIC/Insurance/ISO evidence" },
        { category: "Bank & Escrow Payout", weight: 15, completed: hasKyc, actionHint: "Add bank account & cancelled cheque" }
      );
    } else {
      breakdown.push(
        { category: "Contact Verification", weight: 20, completed: true, actionHint: "Email & mobile verified" },
        { category: "Organization Master", weight: 25, completed: hasOrg, actionHint: "Complete organization details" },
        { category: "Role Business Profile", weight: 25, completed: hasRoleProfile, actionHint: "Provide operational details" },
        { category: "KYC & Documents", weight: 20, completed: hasKyc, actionHint: "Upload identification documents" },
        { category: "Preferences", weight: 10, completed: hasRoleProfile, actionHint: "Set notification & billing preferences" }
      );
    }

    score = breakdown.filter((b) => b.completed).reduce((sum, b) => sum + b.weight, 0);

    const pendingActions = breakdown.filter((b) => !b.completed).map((b) => b.actionHint);

    return NextResponse.json({
      role: role.toUpperCase(),
      completionPercentage: score,
      isFullyVerified: score >= 100,
      breakdown,
      pendingActions,
      statusLabel: score >= 80 ? "High Trust" : score >= 50 ? "Partially Verified" : "Basic Access"
    });
  } catch (err: any) {
    console.error("Profile completion error:", err);
    return NextResponse.json({ error: err.message || "Failed to calculate completion." }, { status: 500 });
  }
}
