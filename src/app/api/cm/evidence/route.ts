import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  cmEvidence,
  cmObligations,
} from "@/db/visitor-compliance-schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/cm/evidence — Get uploaded evidence documents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const obligationId = searchParams.get("obligationId");

    let query = db
      .select({
        id: cmEvidence.id,
        obligationId: cmEvidence.obligationId,
        requirement: cmObligations.requirement,
        category: cmObligations.category,
        propertyName: cmObligations.propertyName,
        documentName: cmEvidence.documentName,
        documentUrl: cmEvidence.documentUrl,
        issueDate: cmEvidence.issueDate,
        expiryDate: cmEvidence.expiryDate,
        verificationStatus: cmEvidence.verificationStatus,
        verifiedBy: cmEvidence.verifiedBy,
        verifiedAt: cmEvidence.verifiedAt,
        createdAt: cmEvidence.createdAt,
      })
      .from(cmEvidence)
      .innerJoin(cmObligations, eq(cmEvidence.obligationId, cmObligations.id))
      .orderBy(desc(cmEvidence.createdAt));

    const records = await query;
    const filtered = obligationId
      ? records.filter((r) => r.obligationId === obligationId)
      : records;

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Evidence fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch evidence" },
      { status: 500 }
    );
  }
}

// POST /api/cm/evidence — Upload or register renewal certificate/evidence
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      obligationId,
      documentName,
      documentUrl,
      issueDate,
      expiryDate,
      verifiedBy = "Compliance Lead",
    } = body;

    if (!obligationId || !documentName || !documentUrl) {
      return NextResponse.json(
        { success: false, message: "obligationId, documentName, and documentUrl are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Insert Evidence record
    const inserted = await db
      .insert(cmEvidence)
      .values({
        obligationId,
        documentName,
        documentUrl,
        issueDate: issueDate || new Date().toISOString().split("T")[0],
        expiryDate: expiryDate || null,
        verificationStatus: "verified",
        verifiedBy,
        verifiedAt: now,
      })
      .returning();

    // 2. Update Obligation status to compliant and advance nextDueDate
    if (expiryDate) {
      await db
        .update(cmObligations)
        .set({
          status: "compliant",
          nextDueDate: expiryDate,
          updatedAt: now,
        })
        .where(eq(cmObligations.id, obligationId));
    }

    return NextResponse.json({
      success: true,
      message: "Compliance certificate uploaded and verified",
      data: inserted[0],
    });
  } catch (err: any) {
    console.error("Evidence upload error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save evidence" },
      { status: 500 }
    );
  }
}
