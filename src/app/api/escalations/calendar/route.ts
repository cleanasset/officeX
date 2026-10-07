import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentStep, contract, contractCharge, space, occupant } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, asc } from "drizzle-orm";

/**
 * RR-CONT-07, §S-25: Escalations Calendar
 * - Returns upcoming escalation step-ups and due dates
 * - Shows space, occupant, old rent, new rent, effective date, status
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from_date") || new Date().toISOString().split("T")[0];
    const toDate = searchParams.get("to_date");

    const conditions = [
      eq(rentStep.org_id, auth.orgId),
      sql`${rentStep.deleted_at} IS NULL`,
    ];

    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(rentStep.client_account_id, auth.clientAccountId));
    }

    const steps = await db
      .select({
        step: rentStep,
        contract: contract,
        charge: contractCharge,
        space: space,
        occupant: occupant,
      })
      .from(rentStep)
      .innerJoin(contractCharge, eq(rentStep.contract_charge_id, contractCharge.id))
      .innerJoin(contract, eq(contractCharge.contract_id, contract.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(asc(rentStep.effective_date));

    const events = steps.map((s) => {
      const oldRate = s.charge?.rate ? parseFloat(s.charge.rate) : 0;
      const stepRate = parseFloat(s.step.rate || "0");
      let calculatedNewRate = stepRate;

      if (s.step.escalation_type === "percentage") {
        const pct = s.step.escalation_value ? parseFloat(s.step.escalation_value) : 5;
        calculatedNewRate = oldRate * (1 + pct / 100);
      } else if (s.step.escalation_type === "fixed_amount") {
        const increment = s.step.escalation_value ? parseFloat(s.step.escalation_value) : 0;
        calculatedNewRate = oldRate + increment;
      }

      return {
        id: s.step.id,
        contract_id: s.contract?.id,
        contract_code: s.contract?.contract_code,
        space_name: s.space?.space_name,
        space_code: s.space?.space_code,
        occupant_name: s.occupant?.occupant_name,
        effective_date: s.step.effective_date,
        escalation_type: s.step.escalation_type,
        escalation_value: s.step.escalation_value,
        old_rent: oldRate,
        new_rent: Math.round(calculatedNewRate * 100) / 100,
        status: s.step.status,
      };
    });

    return NextResponse.json({ success: true, data: events });
  } catch (err: any) {
    console.error("Error fetching escalation calendar:", err);
    return NextResponse.json(
      { error: "Failed to fetch escalation calendar", message: err.message },
      { status: 500 }
    );
  }
}
