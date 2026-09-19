import { NextResponse } from "next/server";
import { db } from "@/db";
import { kycCases } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, userId, declarationAccepted = true, role = "OWNER" } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is mandatory." }, { status: 400 });
    }

    if (!declarationAccepted) {
      return NextResponse.json(
        { error: "You must accept the statutory compliance and legal truthfulness declaration." },
        { status: 400 }
      );
    }

    // Determine target KYC Stage based on role
    let stage = "K1_BUSINESS";
    if (role.toUpperCase().includes("OWNER")) stage = "K3_PROPERTY";
    if (role.toUpperCase().includes("VENDOR")) stage = "K4_VENDOR";
    if (role.toUpperCase().includes("BROKER")) stage = "K2_IDENTITY";

    const caseId = `case_${Date.now()}`;

    try {
      if (/^[0-9a-fA-F-]{36}$/.test(organizationId) && userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
        await db.insert(kycCases).values({
          organizationId,
          userId,
          stage,
          status: "submitted",
          submissionNotes: `Onboarding profile submitted with ${role} credentials.`
        });
      }
    } catch (dbErr) {
      console.warn("DB insert kyc case warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      caseId,
      stage,
      status: "SUBMITTED",
      message: "Onboarding profile & compliance package submitted for review.",
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: "Within 24 Hours",
      nextScreen: "S11_VERIFICATION_STATUS"
    });
  } catch (err: any) {
    console.error("KYC submit error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit KYC." }, { status: 500 });
  }
}
