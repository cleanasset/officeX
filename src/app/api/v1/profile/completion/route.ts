import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") || "owner").toLowerCase();
    const hasOnboarded = searchParams.get("hasOnboarded") === "true";
    const hasContactVerified = searchParams.get("hasContactVerified") === "true";
    const hasOrg = searchParams.get("hasOrg") === "true";
    const hasRoleProfile = searchParams.get("hasRoleProfile") === "true";
    const hasKyc = searchParams.get("hasKyc") === "true";
    const hasProperties = searchParams.get("hasProperties") === "true";

    // If user has not completed onboarding, completion is strictly 0%
    if (!hasOnboarded) {
      const uncompletedBreakdown = role.includes("owner")
        ? [
            { category: "Contact Verification", weight: 20, completed: false, actionHint: "Verify mobile & email via OTP" },
            { category: "Landlord Entity Profile", weight: 35, completed: false, actionHint: "Provide legal entity name, PAN & registered address in onboarding" },
            { category: "Commercial Portfolio", weight: 25, completed: false, actionHint: "Add your first commercial property" },
            { category: "Statutory KYC & Evidence", weight: 20, completed: false, actionHint: "Upload ownership proof & GST cert" }
          ]
        : role.includes("broker")
        ? [
            { category: "Contact Verification", weight: 15, completed: false, actionHint: "Verify mobile & email via OTP" },
            { category: "Organization Master", weight: 25, completed: false, actionHint: "Provide brokerage legal details" },
            { category: "Services & Markets", weight: 30, completed: false, actionHint: "Select operating cities & micro-markets" },
            { category: "RERA & Compliance", weight: 15, completed: false, actionHint: "Upload RERA Registration certificate" },
            { category: "Deal Preferences", weight: 15, completed: false, actionHint: "Specify average deal size & client focus" }
          ]
        : role.includes("vendor")
        ? [
            { category: "Contact Verification", weight: 10, completed: false, actionHint: "Verify mobile & email via OTP" },
            { category: "Organization Master", weight: 20, completed: false, actionHint: "Provide company master & PAN" },
            { category: "FM Service Capabilities", weight: 25, completed: false, actionHint: "Choose service categories & staff count" },
            { category: "Statutory & Labor Compliance", weight: 30, completed: false, actionHint: "Upload PF/ESIC/Insurance/ISO evidence" },
            { category: "Bank & Escrow Payout", weight: 15, completed: false, actionHint: "Add bank account & cancelled cheque" }
          ]
        : [
            { category: "Contact Verification", weight: 20, completed: false, actionHint: "Verify mobile & email via OTP" },
            { category: "Organization Master", weight: 25, completed: false, actionHint: "Complete organization details" },
            { category: "Role Business Profile", weight: 25, completed: false, actionHint: "Provide operational details" },
            { category: "KYC & Documents", weight: 20, completed: false, actionHint: "Upload identification documents" },
            { category: "Preferences", weight: 10, completed: false, actionHint: "Set notification & billing preferences" }
          ];

      return NextResponse.json({
        role: role.toUpperCase(),
        completionPercentage: 0,
        isFullyVerified: false,
        breakdown: uncompletedBreakdown,
        pendingActions: ["Complete 7-Step Business Onboarding Form"],
        statusLabel: "0% Completed"
      });
    }

    const breakdown: Array<{ category: string; weight: number; completed: boolean; actionHint: string }> = [];

    if (role.includes("owner")) {
      breakdown.push(
        { category: "Contact Verification", weight: 20, completed: hasContactVerified, actionHint: "Email & mobile verified via OTP" },
        { category: "Landlord Entity Profile", weight: 35, completed: hasOrg, actionHint: "Provide legal entity name, PAN & registered address" },
        { category: "Commercial Portfolio", weight: 25, completed: hasProperties, actionHint: "Add your first commercial property" },
        { category: "Statutory KYC & Evidence", weight: 20, completed: hasKyc, actionHint: "Upload ownership proof & GST cert" }
      );
    } else if (role.includes("broker")) {
      breakdown.push(
        { category: "Contact Verification", weight: 15, completed: hasContactVerified, actionHint: "Email & mobile verified via OTP" },
        { category: "Organization Master", weight: 25, completed: hasOrg, actionHint: "Provide brokerage legal details" },
        { category: "Services & Markets", weight: 30, completed: hasRoleProfile, actionHint: "Select operating cities & micro-markets" },
        { category: "RERA & Compliance", weight: 15, completed: hasKyc, actionHint: "Upload RERA Registration certificate" },
        { category: "Deal Preferences", weight: 15, completed: hasRoleProfile, actionHint: "Specify average deal size & client focus" }
      );
    } else if (role.includes("vendor")) {
      breakdown.push(
        { category: "Contact Verification", weight: 10, completed: hasContactVerified, actionHint: "Email & mobile verified via OTP" },
        { category: "Organization Master", weight: 20, completed: hasOrg, actionHint: "Provide company master & PAN" },
        { category: "FM Service Capabilities", weight: 25, completed: hasRoleProfile, actionHint: "Choose service categories & staff count" },
        { category: "Statutory & Labor Compliance", weight: 30, completed: hasKyc, actionHint: "Upload PF/ESIC/Insurance/ISO evidence" },
        { category: "Bank & Escrow Payout", weight: 15, completed: hasKyc, actionHint: "Add bank account & cancelled cheque" }
      );
    } else {
      breakdown.push(
        { category: "Contact Verification", weight: 20, completed: hasContactVerified, actionHint: "Email & mobile verified via OTP" },
        { category: "Organization Master", weight: 25, completed: hasOrg, actionHint: "Complete organization details" },
        { category: "Role Business Profile", weight: 25, completed: hasRoleProfile, actionHint: "Provide operational details" },
        { category: "KYC & Documents", weight: 20, completed: hasKyc, actionHint: "Upload identification documents" },
        { category: "Preferences", weight: 10, completed: hasRoleProfile, actionHint: "Set notification & billing preferences" }
      );
    }

    const score = breakdown.filter((b) => b.completed).reduce((sum, b) => sum + b.weight, 0);

    const pendingActions = breakdown.filter((b) => !b.completed).map((b) => b.actionHint);

    return NextResponse.json({
      role: role.toUpperCase(),
      completionPercentage: score,
      isFullyVerified: score >= 100,
      breakdown,
      pendingActions,
      statusLabel: score >= 80 ? "High Trust" : score >= 50 ? "Partially Verified" : score > 0 ? "Basic Access" : "0% Completed"
    });
  } catch (err: any) {
    console.error("Profile completion error:", err);
    return NextResponse.json({ error: err.message || "Failed to calculate completion." }, { status: 500 });
  }
}
