import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const capas = [
      {
        id: "CAPA-2026-104",
        sourceType: "incident",
        sourceId: "INC-2026-081",
        actionType: "PREVENTIVE",
        action: "Perform ultrasonic cleaning on all 14 server room smoke detectors and calibrate sensitivity threshold.",
        owner: "Kailash Verma (Fire Tech Lead)",
        dueDate: "2026-09-20",
        priority: "medium",
        evidenceAttached: true,
        evidenceName: "Smoke_Detector_Calibration_Cert_Sep2026.pdf",
        verificationStatus: "verified",
        status: "closed",
        closedAt: "2026-09-16T11:00:00.000Z"
      },
      {
        id: "CAPA-2026-105",
        sourceType: "incident",
        sourceId: "INC-2026-082",
        actionType: "CORRECTIVE",
        action: "Replace braided flexible fuel hose on Line 2B with high-pressure stainless steel reinforced flange.",
        owner: "Vendor Manager (Piping AMC)",
        dueDate: "2026-09-22",
        priority: "high",
        evidenceAttached: false,
        evidenceName: null,
        verificationStatus: "pending_evidence",
        status: "in_progress",
        closedAt: null
      },
      {
        id: "CAPA-2026-106",
        sourceType: "incident",
        sourceId: "INC-2026-083",
        actionType: "CORRECTIVE",
        action: "Otis OEM technician to replace door interlock switch assembly and submit 100-cycle stress test certificate.",
        owner: "Otis Elevator Engineer",
        dueDate: "2026-09-21",
        priority: "critical",
        evidenceAttached: true,
        evidenceName: "Otis_Lift4_Door_Interlock_Replacement_JobSheet.pdf",
        verificationStatus: "pending_verification",
        status: "under_review",
        closedAt: null
      }
    ];

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
