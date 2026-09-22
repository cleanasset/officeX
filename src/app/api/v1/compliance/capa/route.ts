import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const capas: any[] = [];

    return NextResponse.json({
      totalCapas: capas.length,
      openCount: capas.filter(c => c.status !== "closed").length,
      closedCount: capas.filter(c => c.status === "closed").length,
      capas
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      actionType = "CORRECTIVE",
      owner = "Facility Supervisor",
      dueDate,
      priority = "high",
      sourceType = "inspection",
      sourceId,
      // For closure requests (BR-C08, C-022, C-023)
      isCloseRequest = false,
      capaId,
      evidenceAttached = false,
      verificationApproved = false
    } = body;

    // BR-C08 / C-022: Block closure if evidence or verification is missing
    if (isCloseRequest) {
      if (!evidenceAttached || !verificationApproved) {
        return NextResponse.json(
          {
            error: "BR-C08 Violation: CAPA cannot be closed until verification evidence is uploaded and approved by Compliance Manager.",
            code: "MISSING_EVIDENCE_OR_VERIFICATION"
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        capaId,
        status: "closed",
        closedAt: new Date().toISOString(),
        message: "CAPA closure validated and approved with audit evidence."
      });
    }

    if (!action || !dueDate) {
      return NextResponse.json({ error: "Action description and Due Date are mandatory." }, { status: 400 });
    }

    const newCapa = {
      id: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`,
      sourceType,
      sourceId: sourceId || "AUDIT-FINDING-01",
      actionType,
      action: action.trim(),
      owner,
      dueDate,
      priority,
      evidenceAttached: false,
      verificationStatus: "pending_evidence",
      status: "in_progress",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "CAPA created and assigned. Completion requires audit verification.",
      capa: newCapa
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
