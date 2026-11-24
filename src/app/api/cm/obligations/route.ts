import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  cmObligations,
  cmSchedules,
  cmEvidence,
} from "@/db/visitor-compliance-schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/cm/obligations — Master compliance register with real computed score
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";
    const propertyId = searchParams.get("propertyId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = db
      .select({
        id: cmObligations.id,
        orgId: cmObligations.orgId,
        propertyId: cmObligations.propertyId,
        propertyName: cmObligations.propertyName,
        category: cmObligations.category,
        subcategory: cmObligations.subcategory,
        authority: cmObligations.authority,
        requirement: cmObligations.requirement,
        frequency: cmObligations.frequency,
        ownerId: cmObligations.ownerId,
        ownerName: cmObligations.ownerName,
        criticality: cmObligations.criticality,
        evidenceRequired: cmObligations.evidenceRequired,
        status: cmObligations.status,
        nextDueDate: cmObligations.nextDueDate,
        createdAt: cmObligations.createdAt,
      })
      .from(cmObligations)
      .where(eq(cmObligations.orgId, orgId))
      .orderBy(desc(cmObligations.createdAt));

    const records = await query;
    const now = new Date();

    // Dynamically evaluate status & calculate weighted compliance score
    let totalWeight = 0;
    let compliantWeight = 0;
    let overdueCount = 0;
    let criticalOverdueCount = 0;
    let dueSoonCount = 0;

    const evaluated = records.map((rec) => {
      let weight = 1;
      if (rec.criticality === "critical") weight = 4;
      else if (rec.criticality === "high") weight = 3;
      else if (rec.criticality === "medium") weight = 2;

      totalWeight += weight;

      let currentStatus = rec.status;
      if (rec.nextDueDate) {
        const due = new Date(rec.nextDueDate);
        const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
          currentStatus = rec.criticality === "critical" ? "critical_overdue" : "overdue";
        } else if (daysDiff <= 30 && currentStatus === "compliant") {
          currentStatus = "due_soon";
        }
      }

      if (currentStatus === "compliant") {
        compliantWeight += weight;
      } else if (currentStatus === "critical_overdue") {
        criticalOverdueCount++;
        overdueCount++;
      } else if (currentStatus === "overdue") {
        overdueCount++;
      } else if (currentStatus === "due_soon") {
        dueSoonCount++;
      }

      return {
        ...rec,
        computedStatus: currentStatus,
      };
    });

    const complianceScore =
      totalWeight > 0 ? Math.round((compliantWeight / totalWeight) * 100) : 100;

    // Filter by query params if provided
    const filtered = evaluated.filter((r) => {
      if (propertyId && r.propertyId !== propertyId) return false;
      if (category && category !== "all" && r.category !== category) return false;
      if (status && status !== "all" && r.computedStatus !== status) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalObligations: records.length,
        complianceScore,
        overdueCount,
        criticalOverdueCount,
        dueSoonCount,
        compliantCount: records.length - overdueCount - dueSoonCount,
      },
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Error fetching obligations:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch compliance obligations" },
      { status: 500 }
    );
  }
}

// POST /api/cm/obligations — Register a new compliance obligation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId = "default_org",
      propertyId = "prop_tower_a",
      propertyName = "Tower A - Financial Center",
      category,
      subcategory,
      authority,
      requirement,
      frequency = "annual",
      ownerId,
      ownerName = "Compliance Officer",
      criticality = "medium",
      evidenceRequired = true,
      nextDueDate,
    } = body;

    if (!category || !requirement) {
      return NextResponse.json(
        { success: false, message: "Category and Requirement are mandatory" },
        { status: 400 }
      );
    }

    // Default next due date = 1 year from now if not given
    const calculatedDue = nextDueDate
      ? nextDueDate
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const inserted = await db
      .insert(cmObligations)
      .values({
        orgId,
        propertyId,
        propertyName,
        category,
        subcategory,
        authority,
        requirement,
        frequency,
        ownerId,
        ownerName,
        criticality,
        evidenceRequired,
        status: "compliant",
        nextDueDate: calculatedDue,
      })
      .returning();

    const obligation = inserted[0];

    // Auto-generate initial recurrence schedule entry
    await db.insert(cmSchedules).values({
      obligationId: obligation.id,
      dueDate: calculatedDue,
      reminderDays: 30,
      recurrenceRule: frequency,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Compliance obligation registered successfully",
      data: obligation,
    });
  } catch (err: any) {
    console.error("Error creating obligation:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to create obligation" },
      { status: 500 }
    );
  }
}
