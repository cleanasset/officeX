import { NextResponse } from "next/server";
import {
  getVisitorComplianceDb,
  uploadAndVerifyEvidence
} from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const obligationId = searchParams.get("obligationId");

    const db = getVisitorComplianceDb();
    let evidence = db.evidence || [];

    if (obligationId) {
      evidence = evidence.filter(e => e.obligationId === obligationId);
    }

    return NextResponse.json({ evidence });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      obligationId,
      certificateNumber,
      issuedDate: directIssuedDate,
      issueDate,
      validUntilDate: directValidUntilDate,
      expiryDate,
      fileName,
      fileUrl,
      uploadedBy,
      autoVerify = true
    } = body;

    const issuedDate = directIssuedDate || issueDate;
    const validUntilDate = directValidUntilDate || expiryDate;

    if (!obligationId || !certificateNumber || !issuedDate || !fileName) {
      return NextResponse.json(
        { error: "Obligation ID, Certificate Number, Issue Date, and File Name are mandatory." },
        { status: 400 }
      );
    }

    const result = uploadAndVerifyEvidence({
      obligationId,
      certificateNumber,
      issuedDate,
      validUntilDate,
      fileName,
      fileUrl,
      uploadedBy,
      autoVerify
    });

    return NextResponse.json({
      success: true,
      message: "Compliance evidence uploaded and verified against statutory requirements.",
      evidence: result.evidence,
      obligation: result.obligation
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
