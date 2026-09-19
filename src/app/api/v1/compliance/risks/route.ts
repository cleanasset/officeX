import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const risks = [
      {
        id: "RSK-001",
        category: "Fire & Life Safety",
        statement: "Risk of high-rise facade smoke propagation due to unsealed vertical MEP risers in Tower A.",
        likelihood: 4,
        impact: 5,
        inherentScore: 20, // 4 * 5 = 20 (C-026)
        rating: "CRITICAL",
        mitigation: "Install 2-hour rated intumescent firestop collars on all floor penetrations; quarterly thermography audit.",
        residualLikelihood: 1,
        residualImpact: 3,
        residualScore: 3, // Residual score recalculated post-mitigation (C-027)
        owner: "Head of Safety",
        status: "mitigated"
      },
      {
        id: "RSK-002",
        category: "Environmental & Legal",
        statement: "STP (Sewage Treatment Plant) treated water BOD/COD levels exceeding SPCB threshold leading to closure notice.",
        likelihood: 3,
        impact: 4,
        inherentScore: 12,
        rating: "HIGH",
        mitigation: "Daily automated online water quality sensor telemetry; dosing pump redundancy.",
        residualLikelihood: 1,
        residualImpact: 4,
        residualScore: 4,
        owner: "Environmental Engineer",
        status: "monitoring"
      },
      {
        id: "RSK-003",
        category: "Structural Safety",
        statement: "Water seepage in Basement 3 retaining wall causing rebar corrosion and foundation degradation.",
        likelihood: 3,
        impact: 3,
        inherentScore: 9,
        rating: "MEDIUM",
        mitigation: "Polyurethane chemical pressure injection grouting completed; moisture sensors installed.",
        residualLikelihood: 1,
        residualImpact: 2,
        residualScore: 2,
        owner: "Civil Works Contractor",
        status: "mitigated"
      }
    ];

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
