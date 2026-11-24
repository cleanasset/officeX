import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cmCapa } from "@/db/visitor-compliance-schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/cm/capa — List all CAPA records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const capas = await db
      .select()
      .from(cmCapa)
      .orderBy(desc(cmCapa.createdAt));

    const filtered = status && status !== "all"
      ? capas.filter((c) => c.status === status)
      : capas;

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("CAPA fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch CAPAs" },
      { status: 500 }
    );
  }
}

// POST /api/cm/capa — Create or update CAPA status (Blocks closing without evidence)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, // if updating
      sourceType = "manual",
      title,
      actionType = "corrective",
      action,
      ownerName = "FM Lead",
      dueDate,
      priority = "high",
      status = "open",
      evidenceUrl,
    } = body;

    // UPDATE EXISTING CAPA
    if (id) {
      // Mandatory Verification Rule: CAPA cannot close without evidence
      if (status === "closed" && !evidenceUrl) {
        return NextResponse.json(
          {
            success: false,
            message: "MANDATORY RULE BR-C08: CAPA cannot be marked closed without resolution proof/evidence URL",
          },
          { status: 400 }
        );
      }

      await db
        .update(cmCapa)
        .set({
          status,
          evidenceUrl: evidenceUrl || undefined,
          verificationStatus: status === "closed" ? "verified" : "pending",
          closedAt: status === "closed" ? new Date() : null,
        })
        .where(eq(cmCapa.id, id));

      return NextResponse.json({
        success: true,
        message: `CAPA status updated to ${status}`,
      });
    }

    // CREATE NEW CAPA
    if (!title || !action) {
      return NextResponse.json(
        { success: false, message: "Title and Action are required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(cmCapa)
      .values({
        sourceType,
        title,
        actionType,
        action,
        ownerName,
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        priority,
        status: "open",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "CAPA registered successfully",
      data: inserted[0],
    });
  } catch (err: any) {
    console.error("CAPA error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process CAPA" },
      { status: 500 }
    );
  }
}
