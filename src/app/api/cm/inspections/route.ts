import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  cmInspections,
  cmFindings,
  cmCapa,
} from "@/db/visitor-compliance-schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/cm/inspections — List audits and site inspections
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const inspections = await db
      .select()
      .from(cmInspections)
      .orderBy(desc(cmInspections.scheduledDate));

    const filtered = propertyId
      ? inspections.filter((i) => i.propertyId === propertyId)
      : inspections;

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Inspections fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}

// POST /api/cm/inspections — Schedule an audit or record findings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyId = "prop_tower_a",
      propertyName = "Tower A - Financial Center",
      type = "fire_safety_audit",
      title,
      scheduledDate,
      inspectorName = "Chief Safety Auditor",
      score,
      status = "scheduled",
      findings = [], // Array of observations
    } = body;

    if (!title || !scheduledDate) {
      return NextResponse.json(
        { success: false, message: "Title and scheduledDate are required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(cmInspections)
      .values({
        propertyId,
        propertyName,
        type,
        title,
        scheduledDate,
        inspectorName,
        score: score ? String(score) : null,
        status,
        checklist: [],
      })
      .returning();

    const inspection = inserted[0];

    // If findings are provided, record them and auto-generate CAPAs for critical snags
    if (Array.isArray(findings) && findings.length > 0) {
      for (const finding of findings) {
        const newFinding = await db
          .insert(cmFindings)
          .values({
            inspectionId: inspection.id,
            category: finding.category || type,
            severity: finding.severity || "medium",
            observation: finding.observation,
            location: finding.location || "General Facility",
            status: "open",
          })
          .returning();

        // If high or critical, automatically create CAPA
        if (finding.severity === "critical" || finding.severity === "high") {
          const newCapa = await db
            .insert(cmCapa)
            .values({
              sourceType: "inspection",
              sourceId: String(inspection.id),
              title: `CAPA: ${finding.observation.slice(0, 100)}`,
              actionType: "corrective",
              action: `Resolve inspection observation: ${finding.observation}`,
              ownerName: "FM Lead / Maintenance In-Charge",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 day SLA
              priority: finding.severity,
              status: "open",
            })
            .returning();

          await db
            .update(cmFindings)
            .set({ capaId: newCapa[0].id })
            .where(eq(cmFindings.id, newFinding[0].id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Inspection logged successfully",
      data: inspection,
    });
  } catch (err: any) {
    console.error("Inspection error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save inspection" },
      { status: 500 }
    );
  }
}
