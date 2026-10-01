import { NextResponse } from "next/server";
import { getVisitorComplianceDb, closeCapa, saveVisitorComplianceDb, CapaEntity } from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || "";

    const db = getVisitorComplianceDb();
    let capas = db.capas || [];

    if (propertyId && propertyId !== "ALL") {
      capas = capas.filter(c => !c.propertyId || c.propertyId === propertyId);
    }

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
      rootCause,
      // For closure requests (BR-C08, C-022, C-023)
      isCloseRequest = false,
      capaId,
      evidenceFileName,
      verifiedBy = "Compliance Director"
    } = body;

    // BR-C08 / C-022: Block closure if evidence or verification is missing
    if (isCloseRequest && capaId) {
      if (!evidenceFileName) {
        return NextResponse.json(
          {
            error: "BR-C08 Violation: CAPA cannot be closed until verification evidence is uploaded and approved by Compliance Manager.",
            code: "MISSING_EVIDENCE_OR_VERIFICATION"
          },
          { status: 400 }
        );
      }

      const closed = closeCapa({
        capaId,
        evidenceFileName,
        verifiedBy
      });

      return NextResponse.json({
        success: true,
        capa: closed,
        message: "CAPA closure validated and approved with audit evidence."
      });
    }

    if (!action || !dueDate) {
      return NextResponse.json(
        { error: "Action description and Due Date are mandatory." },
        { status: 400 }
      );
    }

    const db = getVisitorComplianceDb();
    const newCapa: CapaEntity = {
      id: `CAPA-${Date.now()}`,
      propertyId: "prop-001",
      action: action.trim(),
      actionType,
      rootCause: rootCause?.trim(),
      owner: owner.trim(),
      dueDate,
      priority,
      sourceType,
      sourceId,
      status: "open",
      evidenceAttached: false,
      verificationApproved: false,
      createdAt: new Date().toISOString()
    };

    db.capas.unshift(newCapa);
    saveVisitorComplianceDb(db);

    return NextResponse.json({
      success: true,
      message: "CAPA created successfully and assigned to owner.",
      capa: newCapa
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
