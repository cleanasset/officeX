import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { task, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

/**
 * Screen S-45 Ageing & Collections Follow-up API
 * Handles:
 * - Follow-up logging (call, email, whatsapp, visit, legal_notice)
 * - Outcomes (promised, disputed, no_response, paid, other)
 * - Promise-to-Pay (PTP) recording (AL-10 tracking)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    if (!body.occupant_id) {
      return NextResponse.json({ error: "occupant_id is required" }, { status: 400 });
    }

    const channel = body.channel || "call";
    const outcome = body.outcome || "promised";
    const ptpDate = body.ptp_date || null;
    const ptpAmount = body.ptp_amount ? parseFloat(body.ptp_amount) : null;
    const notes = body.notes || "";
    const nextFollowUp = body.due_date || body.next_followup_date || null;

    // Fetch occupant name for title
    const [occ] = await db
      .select({ name: occupant.occupant_name })
      .from(occupant)
      .where(and(eq(occupant.id, body.occupant_id), eq(occupant.org_id, auth.orgId)));

    const occupantName = occ?.name || "Occupant";
    let title = `Collection Follow-up (${channel.toUpperCase()}): ${occupantName}`;
    if (outcome === "promised" && ptpDate) {
      title = `PTP: ${occupantName} promised ₹${(ptpAmount || 0).toLocaleString("en-IN")} by ${ptpDate}`;
    }

    const description = [
      `Channel: ${channel}`,
      `Outcome: ${outcome}`,
      ptpDate ? `Promise to Pay Date: ${ptpDate}` : null,
      ptpAmount ? `Promise to Pay Amount: ₹${ptpAmount.toLocaleString("en-IN")}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const [newTask] = await db
      .insert(task)
      .values({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || "00000000-0000-0000-0000-000000000002",
        contract_id: body.contract_id || null,
        task_type: "dispute_followup", // Maps to collection/dispute followup
        title,
        description,
        assigned_to: auth.userId,
        assigned_role: "finance",
        status: outcome === "paid" ? "completed" : "pending",
        priority: outcome === "promised" ? "high" : "medium",
        due_date: nextFollowUp || ptpDate || new Date().toISOString().split("T")[0],
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message:
        outcome === "promised"
          ? `Promise to pay of ₹${(ptpAmount || 0).toLocaleString("en-IN")} logged for ${ptpDate}. Alert AL-10 active.`
          : `Follow-up ${channel} logged successfully.`,
      task: newTask,
    });
  } catch (err: any) {
    console.error("Log follow-up failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
