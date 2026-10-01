import { NextResponse } from "next/server";
import { getVisitorComplianceDb, createRisk } from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || "";

    const db = getVisitorComplianceDb();
    let risks = db.risks || [];

    if (propertyId && propertyId !== "ALL" && propertyId !== "Commercial Asset") {
      const p = propertyId.toLowerCase().trim();
      risks = risks.filter(r => !r.propertyId || r.propertyId.toLowerCase() === p || r.propertyId === "prop-001" || p.includes("devasya") || p.includes("commercial"));
    }

    return NextResponse.json({
      totalRisks: risks.length,
      criticalRisks: risks.filter(r => r.inherentScore >= 16).length,
      risks
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      category,
      statement,
      likelihood = 3,
      impact = 3,
      mitigation,
      residualLikelihood = 1,
      residualImpact = 2,
      owner = "Compliance Officer"
    } = body;

    if (!statement || !category) {
      return NextResponse.json(
        { error: "Category and Risk Statement are required." },
        { status: 400 }
      );
    }

    const risk = createRisk({
      category,
      statement,
      likelihood: Number(likelihood),
      impact: Number(impact),
      mitigation: mitigation || "Standard operational SOP controls.",
      residualLikelihood: Number(residualLikelihood),
      residualImpact: Number(residualImpact),
      owner
    });

    return NextResponse.json({
      success: true,
      message: "Enterprise risk registered with inherent and residual risk matrix scores.",
      risk
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
