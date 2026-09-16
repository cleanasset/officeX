import { NextResponse } from "next/server";
import { getComplianceDb, saveComplianceDb, enrichCertificate, calculateComplianceHealth } from "@/lib/compliance-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = getComplianceDb();
    let certs = db.certificates.map(c => enrichCertificate(c));

    if (category && category !== "all") {
      certs = certs.filter(c => c.category === category);
    }

    if (status && status !== "all") {
      certs = certs.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      certs = certs.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.regNumber.toLowerCase().includes(q) ||
        c.authority.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q)
      );
    }

    const health = calculateComplianceHealth(db.certificates);

    return NextResponse.json({
      property: db.property,
      certificates: certs,
      health
    });
  } catch (error: any) {
    console.error("GET /api/compliance/certificates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getComplianceDb();

    const newId = `CERT-DG-${String(db.certificates.length + 1).padStart(3, "0")}`;
    const newCert = {
      id: newId,
      propertyId: db.property.id,
      name: body.name || "New Statutory Certificate",
      category: body.category || "structural",
      categoryLabel: body.categoryLabel || "Statutory Compliance",
      property: db.property.name,
      authority: body.authority || "Government Authority",
      regNumber: body.regNumber || `REG-${Date.now()}`,
      issueDate: body.issueDate || new Date().toISOString().split("T")[0],
      expiry: body.expiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0],
      expiryDateObj: body.expiryDateObj || body.expiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0],
      inspectingOfficer: body.inspectingOfficer || "Auditing Officer",
      inspectionCycle: body.inspectionCycle || "Annual",
      penaltyClause: body.penaltyClause || "Statutory notice & compliance fine",
      documentUrl: body.documentUrl || "CERTIFICATE_ATTACHMENT.pdf",
      status: body.status || "Valid",
      leadTimeDays: body.leadTimeDays || 45,
      estimatedRenewalCost: Number(body.estimatedRenewalCost) || 25000
    };

    db.certificates.unshift(newCert);
    saveComplianceDb(db);

    return NextResponse.json({ success: true, certificate: enrichCertificate(newCert) });
  } catch (error: any) {
    console.error("POST /api/compliance/certificates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, targetDate, vendor, notes } = body;

    const db = getComplianceDb();
    const certIndex = db.certificates.findIndex(c => c.id === id);
    if (certIndex === -1) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (action === "renew") {
      db.certificates[certIndex].status = "In Renewal";
      db.certificates[certIndex].inspectingOfficer = vendor ? `${vendor} (Assigned Auditor)` : db.certificates[certIndex].inspectingOfficer;
      if (notes) {
        db.certificates[certIndex].penaltyClause = `[Renewal Note: ${notes}] ${db.certificates[certIndex].penaltyClause}`;
      }
    } else if (action === "complete_renewal") {
      db.certificates[certIndex].status = "Valid";
      if (targetDate) {
        db.certificates[certIndex].issueDate = new Date().toISOString().split("T")[0];
        db.certificates[certIndex].expiry = targetDate;
        db.certificates[certIndex].expiryDateObj = targetDate;
      }
    }

    saveComplianceDb(db);
    return NextResponse.json({ success: true, certificate: enrichCertificate(db.certificates[certIndex]) });
  } catch (error: any) {
    console.error("PATCH /api/compliance/certificates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
