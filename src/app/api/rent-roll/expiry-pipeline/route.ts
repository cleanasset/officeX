import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, space, occupant, deal } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, asc } from "drizzle-orm";

/**
 * RR-CONT-09, §S-24: Expiry Pipeline & Alerts
 * - Buckets contracts by 1, 3, 6, 12 months before expiry
 * - Action: [Create renewal deal]
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const windowFilter = searchParams.get("window"); // 1 | 3 | 6 | 12 | all

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const conditions = [
      eq(contract.org_id, auth.orgId),
      sql`${contract.deleted_at} IS NULL`,
      sql`${contract.contract_status} IN ('active', 'notice_served', 'holding_over')`,
    ];

    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(contract.client_account_id, auth.clientAccountId));
    }

    const contractsList = await db
      .select({
        contract: contract,
        space: space,
        occupant: occupant,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(asc(contract.end_date));

    // Calculate days remaining and classify into alert windows
    const pipelineItems = contractsList.map((c) => {
      const expDate = new Date(c.contract.end_date);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsLeft = Math.round(diffDays / 30);

      let alertBucket = "upcoming_12m";
      let priority = "low";
      if (diffDays <= 30) {
        alertBucket = "critical_1m";
        priority = "critical";
      } else if (diffDays <= 90) {
        alertBucket = "urgent_3m";
        priority = "high";
      } else if (diffDays <= 180) {
        alertBucket = "planning_6m";
        priority = "medium";
      }

      return {
        id: c.contract.id,
        contract_code: c.contract.contract_code,
        contract_name: `Contract ${c.contract.contract_code}`,
        space_id: c.contract.space_id,
        space_name: c.space?.space_name || "—",
        space_code: c.space?.space_code || "—",
        occupant_id: c.contract.occupant_id,
        occupant_name: c.occupant?.occupant_name || "—",
        occupant_code: c.occupant?.occupant_code || "—",
        expiry_date: c.contract.end_date,
        days_left: diffDays,
        months_left: monthsLeft,
        alert_bucket: alertBucket,
        priority: priority,
        status: c.contract.contract_status,
        renewal_stage: diffDays <= 30 ? "urgent_decision" : diffDays <= 90 ? "negotiating" : "review_scheduled",
      };
    });

    const filtered = windowFilter && windowFilter !== "all"
      ? pipelineItems.filter((p) => {
          if (windowFilter === "1") return p.alert_bucket === "critical_1m";
          if (windowFilter === "3") return ["critical_1m", "urgent_3m"].includes(p.alert_bucket);
          if (windowFilter === "6") return ["critical_1m", "urgent_3m", "planning_6m"].includes(p.alert_bucket);
          return true;
        })
      : pipelineItems;

    return NextResponse.json({
      success: true,
      counts: {
        critical_1m: pipelineItems.filter((p) => p.alert_bucket === "critical_1m").length,
        urgent_3m: pipelineItems.filter((p) => p.alert_bucket === "urgent_3m").length,
        planning_6m: pipelineItems.filter((p) => p.alert_bucket === "planning_6m").length,
        upcoming_12m: pipelineItems.filter((p) => p.alert_bucket === "upcoming_12m").length,
      },
      data: filtered,
    });
  } catch (err: any) {
    console.error("Error fetching expiry pipeline:", err);
    return NextResponse.json(
      { error: "Failed to fetch expiry pipeline", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * [Create renewal deal] action from expiry pipeline
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { contract_id } = body;

    if (!contract_id) {
      return NextResponse.json({ error: "contract_id is required" }, { status: 400 });
    }

    const [c] = await db
      .select({
        contract: contract,
        space: space,
        occupant: occupant,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(
        and(
          eq(contract.id, contract_id),
          eq(contract.org_id, auth.orgId),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const renewalDealCode = `RNW-${c.contract.contract_code}`;
    const [createdDeal] = await db
      .insert(deal)
      .values({
        org_id: c.contract.org_id,
        client_account_id: c.contract.client_account_id,
        deal_code: renewalDealCode,
        deal_name: `Renewal: ${c.occupant?.occupant_name || c.contract.contract_code}`,
        deal_stage: "proposal",
        probability_percent: 75,
        space_id: c.contract.space_id,
        occupant_id: c.contract.occupant_id,
        estimated_area_sqft: c.space?.chargeable_area_sqft || null,
        estimated_start_date: c.contract.end_date,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Renewal deal ${createdDeal.deal_code} created successfully`,
      deal: createdDeal,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating renewal deal:", err);
    return NextResponse.json(
      { error: "Failed to create renewal deal", message: err.message },
      { status: 500 }
    );
  }
}
