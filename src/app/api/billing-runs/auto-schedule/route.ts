import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { billingRuns } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateInvoicesBatch } from "@/lib/rent-roll/jobs/invoice-generation";
import { eq, and } from "drizzle-orm";

/**
 * Automated Monthly Billing Scheduler Engine
 * Simulates / executes the monthly recurring invoice generation for all active leases.
 * Applies base rent, active escalations, parking, utilities, CAM pool charges.
 */
export async function GET(req: NextRequest) {
  return handleAutoBilling(req);
}

export async function POST(req: NextRequest) {
  return handleAutoBilling(req);
}

async function handleAutoBilling(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, "0");
    const periodMonth = searchParams.get("period") || `${now.getFullYear()}-${monthStr}`;
    const force = searchParams.get("force") === "true";

    // 1. Check if a billing run already exists for this period
    try {
      const existingRun = await db
        .select()
        .from(billingRuns)
        .where(
          and(
            eq(billingRuns.orgId, auth.orgId),
            eq(billingRuns.periodMonth, periodMonth)
          )
        )
        .limit(1);

      if (existingRun.length > 0 && !force) {
        return NextResponse.json({
          success: true,
          already_exists: true,
          period: periodMonth,
          run_id: existingRun[0].id,
          status: existingRun[0].status,
          invoices_count: existingRun[0].totalInvoicesGenerated,
          gross_total: existingRun[0].grossBilledAmount,
          message: `Automated billing run for ${periodMonth} already exists (Status: ${existingRun[0].status}).`,
        });
      }
    } catch (e) {
      // Table check fallback
    }

    // 2. Execute canonical batch invoice generation job
    const batchResult = await generateInvoicesBatch({
      orgId: auth.orgId,
      billingMonth: periodMonth,
      autoApprove: false, // draft invoices for review
      userId: auth.userId,
    });

    // 3. Record billing run in history
    const runId = crypto.randomUUID();
    try {
      await db.insert(billingRuns).values({
        id: runId,
        orgId: auth.orgId,
        periodMonth: periodMonth,
        totalContracts: batchResult.invoices_created + batchResult.invoices_skipped,
        totalInvoicesGenerated: batchResult.invoices_created,
        grossBilledAmount: String(batchResult.total_amount || 0),
        totalGstAmount: String(Math.round(batchResult.total_amount * 0.18 * 100) / 100),
        status: "completed",
      });
    } catch (e) {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      run_id: runId,
      period: periodMonth,
      status: "completed",
      invoices_generated: batchResult.invoices_created,
      invoices_skipped: batchResult.invoices_skipped,
      gross_total: batchResult.total_amount,
      created_invoices: batchResult.created_invoices,
      errors: batchResult.errors,
      message: `Automated monthly billing run completed for ${periodMonth}. ${batchResult.invoices_created} draft invoices generated for Finance review.`,
    });
  } catch (err: any) {
    console.error("Automated billing run failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
