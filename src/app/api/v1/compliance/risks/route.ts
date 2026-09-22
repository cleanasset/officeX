import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const risks: any[] = [];

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
      return NextResponse.json({ error: "Category and Risk Statement are required." }, { status: 400 });
    }

    const l = Math.min(5, Math.max(1, Number(likelihood)));
    const i = Math.min(5, Math.max(1, Number(impact)));
    const inherentScore = l * i; // BR-C10, C-026

    const rl = Math.min(5, Math.max(1, Number(residualLikelihood)));
    const ri = Math.min(5, Math.max(1, Number(residualImpact)));
    const residualScore = rl * ri; // C-027

    const rating = inherentScore >= 16 ? "CRITICAL" : inherentScore >= 10 ? "HIGH" : inherentScore >= 5 ? "MEDIUM" : "LOW";

    const newRisk = {
      id: `RSK-${Math.floor(100 + Math.random() * 900)}`,
      category,
      statement: statement.trim(),
      likelihood: l,
      impact: i,
      inherentScore,
      rating,
      mitigation: mitigation || "Standard operational SOP controls.",
      residualLikelihood: rl,
      residualImpact: ri,
      residualScore,
      owner,
      status: "active",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: `Risk registered. Inherent Score: ${inherentScore} (${rating}), Residual Score: ${residualScore}.`,
      risk: newRisk
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
