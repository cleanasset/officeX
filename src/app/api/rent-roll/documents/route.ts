import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, addContractDocumentVersion } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leaseId = searchParams.get("leaseId") || searchParams.get("contractId");
    const db = getRentRollDb();

    if (leaseId && leaseId !== "ALL") {
      const lease = db.leases.find(l => l.id === leaseId || l.leaseCode === leaseId);
      if (!lease) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        contractCode: lease.leaseCode,
        documents: lease.documents || []
      });
    }

    // Return all documents across contracts
    const allDocs = db.leases.flatMap(l => (l.documents || []).map(d => ({
      ...d,
      contractCode: l.leaseCode,
      propertyName: l.propertyName,
      tenantName: l.tenantName
    })));

    return NextResponse.json({ success: true, documents: allDocs });
  } catch (error: any) {
    console.error("GET /api/rent-roll/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      leaseId,
      documentType = "agreement",
      title,
      fileName,
      fileUrl = "/documents/lease.pdf",
      fileSizeBytes = 2048000,
      isExecuted = false,
      uploadedBy = "Commercial Executive"
    } = body;

    if (!leaseId) {
      return NextResponse.json({ error: "leaseId / contractId is required" }, { status: 400 });
    }

    const result = addContractDocumentVersion({
      leaseId,
      documentType,
      title: title || fileName || "Contract Document",
      fileName: fileName || "Contract_Document.pdf",
      fileUrl,
      fileSizeBytes,
      uploadedBy,
      isExecuted
    });

    return NextResponse.json({
      success: true,
      message: `Document version ${result.document.versionNumber} registered for contract ${result.lease.leaseCode} (RR-CON-04, UAT-22, UAT-23).`,
      document: result.document,
      lease: result.lease
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { documentId, leaseId, status, isExecuted } = body;
    const db = getRentRollDb();

    let targetDoc: any = null;
    let targetLease: any = null;

    for (const lease of db.leases) {
      if (lease.documents) {
        const doc = lease.documents.find(d => d.id === documentId);
        if (doc) {
          targetDoc = doc;
          targetLease = lease;
          break;
        }
      }
    }

    if (!targetDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (status) targetDoc.status = status;
    if (isExecuted !== undefined) targetDoc.isExecuted = !!isExecuted;

    saveRentRollDb(db);

    recordAuditLog({
      leaseId: targetLease.id,
      entityName: "ContractDocument",
      action: "UPDATE_DOCUMENT_STATUS",
      newValues: { documentId, status: targetDoc.status, isExecuted: targetDoc.isExecuted },
      changedBy: body.changedBy || "Commercial Executive"
    });

    return NextResponse.json({ success: true, document: targetDoc });
  } catch (error: any) {
    console.error("PATCH /api/rent-roll/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
