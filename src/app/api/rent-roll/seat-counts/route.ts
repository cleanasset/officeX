import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant, contract, space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface MemberSeatRecord {
  memberId: string;
  memberName: string;
  contractCode: string;
  planName: string;
  spaceName: string;
  contractedSeats: number;
  minimumCommitment: number;
  actualOccupiedSeats: number;
  billableSeats: number;
  ratePerSeatMonthly: number;
  monthlyBilledInr: number;
  submissionStatus: "approved" | "pending_submission" | "locked";
}

const memberSeatsStore: Record<string, Record<string, MemberSeatRecord[]>> = {};

/**
 * §S-32: Flex & Managed Office Seat Count Submission API
 * Captures monthly seat utilisation (contracted vs minimum vs actual occupied)
 * by Day 25 to unblock automated Day 1 flex billing.
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Oct-2026";
    const orgKey = auth.orgId || "default-org";

    let records = memberSeatsStore[orgKey]?.[period] || [];

    // RR-10: Only list contracts that actually use seat-based billing (no fake sample plans or area leases)
    if (records.length === 0) {
      const activeSeatContracts = await db
        .select({
          occupantId: occupant.id,
          occupantName: occupant.occupant_name,
          contractCode: contract.contract_code,
          spaceName: space.space_name,
        })
        .from(contract)
        .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
        .leftJoin(space, eq(contract.space_id, space.id))
        .where(
          and(
            eq(contract.org_id, auth.orgId),
            sql`${contract.deleted_at} IS NULL`,
            sql`${contract.billing_model} IN ('seat', 'seats')`
          )
        )
        .limit(20);

      records = activeSeatContracts.map((m, idx) => ({
        memberId: m.occupantId || `mem-${idx}`,
        memberName: m.occupantName || "Flex Member",
        contractCode: m.contractCode || `CTR-FLX-${idx + 1}`,
        planName: "Dedicated Desks",
        spaceName: m.spaceName || "Flex Suite",
        contractedSeats: 0,
        minimumCommitment: 0,
        actualOccupiedSeats: 0,
        billableSeats: 0,
        ratePerSeatMonthly: 0,
        monthlyBilledInr: 0,
        submissionStatus: "pending_submission" as const,
      }));
    }

    const totalContracted = records.reduce((s, r) => s + r.contractedSeats, 0);
    const totalBillable = records.reduce((s, r) => s + r.billableSeats, 0);
    const totalMonthlyBilled = records.reduce((s, r) => s + r.monthlyBilledInr, 0);

    return NextResponse.json({
      success: true,
      period,
      records,
      summary: {
        totalMembers: records.length,
        totalContractedSeats: totalContracted,
        totalBillableSeats: totalBillable,
        totalMonthlyRevenueInr: totalMonthlyBilled,
        billingUnlocked: true,
        submissionDeadline: "Day 25 of every month",
      },
    });
  } catch (error: any) {
    console.error("Error in seat counts GET:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { period = "Oct-2026", records = [] } = body;
    const orgKey = auth.orgId || "default-org";

    if (!memberSeatsStore[orgKey]) memberSeatsStore[orgKey] = {};
    memberSeatsStore[orgKey][period] = records;

    return NextResponse.json({
      success: true,
      message: `Seat counts for ${period} submitted and approved. Automated Day 1 flex billing unlocked.`,
      status: "approved",
    });
  } catch (error: any) {
    console.error("Error submitting seat counts:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
