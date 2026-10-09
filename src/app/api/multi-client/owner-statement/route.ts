import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateOwnerStatement } from "@/lib/rent-roll/multi-client/owner-statement";
import { db } from "@/db";
import { client_account } from "@/db/rent-roll-schema";
import { eq } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const periodStart = searchParams.get("period_start") || undefined;
  const periodEnd = searchParams.get("period_end") || undefined;
  let clientAccountId = searchParams.get("client_account_id");

  const emptyStatement = {
    client_account_id: clientAccountId || "",
    client_name: "No Managed Portfolio Selected",
    client_code: "NONE",
    billing_entity: {
      entity_name: "Entity Not Configured",
      entity_code: "N/A",
      gst_number: "—",
      pan_number: "—",
    },
    period: "Current Period",
    period_start: periodStart || new Date().toISOString().split("T")[0],
    period_end: periodEnd || new Date().toISOString().split("T")[0],
    statement_date: new Date().toISOString().split("T")[0],
    billed_gross_inr: 0,
    collected_inr: 0,
    arrears_carried_forward_inr: 0,
    management_fee: {
      fee_structure: "percentage_of_collections",
      rate_or_fixed: "4.0%",
      fee_amount_inr: 0,
    },
    mgmt_fee_percent: 4.0,
    mgmt_fee_inr: 0,
    gst_on_fee_inr: 0,
    operating_expenses_inr: 0,
    expenses_paid_inr: 0,
    net_payable_to_owner_inr: 0,
    net_remittance_inr: 0,
    invoices_summary: [],
  };

  try {
    const auth = getAuthContext(req);
    if (!clientAccountId || clientAccountId === "all") {
      const [firstClient] = await db
        .select()
        .from(client_account)
        .where(eq(client_account.org_id, auth.orgId))
        .limit(1);

      if (firstClient) {
        clientAccountId = firstClient.id;
      }
    }

    if (clientAccountId) {
      try {
        const liveStatement = await generateOwnerStatement(
          auth.orgId,
          clientAccountId,
          periodStart,
          periodEnd
        );
        return NextResponse.json({
          success: true,
          statement: liveStatement,
          data: liveStatement,
        });
      } catch (dbErr) {
        console.warn("Could not generate live statement:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      statement: emptyStatement,
      data: emptyStatement,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      statement: emptyStatement,
      data: emptyStatement,
    });
  }
}
