import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentStep, contract, contractCharge, space, occupant, building, property } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, asc } from "drizzle-orm";

/**
 * RR-CONT-07, §S-25: Escalations Calendar & Apply API
 * - Wireframe S-25: Filters [Next 90 days | Next 180 days | Next 365 days | All], Status [Due, Scheduled, Applied, Overdue]
 * - Formulas D-08 (Next escalation date), D-09 (Next escalation uplift: (next rate - current rate) * quantity), D-21 (Escalation schedule)
 * - Alerts AL-03 (Due at 30d, Action), AL-04 (Due <= today and not applied, Critical)
 * - Returns both .data and .escalations arrays for 100% frontend compatibility
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const windowFilter = searchParams.get("window") || "all"; // "90d" | "180d" | "365d" | "all"
    const statusFilter = searchParams.get("status") || "all"; // "due" | "scheduled" | "applied" | "overdue" | "all"
    const search = searchParams.get("search")?.toLowerCase();

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
        building: building,
        property: property,
      })
      .from(rentStep)
      .innerJoin(contractCharge, eq(rentStep.contract_charge_id, contractCharge.id))
      .innerJoin(contract, eq(contractCharge.contract_id, contract.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(asc(rentStep.effective_date));

    const todayStr = new Date().toISOString().split("T")[0];
    const todayMs = new Date(todayStr).getTime();

    let totalDue90dCount = 0;
    let totalDue90dUplift = 0;
    let totalOverdueAl04Count = 0;
    let totalAppliedCount = 0;

    const allEvents = steps.map((s) => {
      const oldRate = s.charge?.rate ? parseFloat(s.charge.rate) : 0;
      const stepRate = parseFloat(s.step.rate || "0");
      let calculatedNewRate = stepRate;

      let pctValue = 5;
      if (s.step.escalation_type === "percentage") {
        pctValue = s.step.escalation_value ? parseFloat(s.step.escalation_value) : 5;
        calculatedNewRate = oldRate * (1 + pctValue / 100);
      } else if (s.step.escalation_type === "fixed_amount") {
        const increment = s.step.escalation_value ? parseFloat(s.step.escalation_value) : 0;
        calculatedNewRate = oldRate + increment;
        pctValue = oldRate > 0 ? Math.round(((calculatedNewRate - oldRate) / oldRate) * 1000) / 10 : 0;
      }

      const area = parseFloat(s.space?.chargeable_area_sqft || s.charge?.quantity_basis || "1");
      const effectiveDateStr = s.step.effective_date;
      const effectiveMs = new Date(effectiveDateStr).getTime();
      const daysUntilEffective = Math.round((effectiveMs - todayMs) / (1000 * 60 * 60 * 24));

      // Determine computed status:
      // §S-25: A step becomes "Due" 30 days before effective date.
      // AL-04: If effective <= today and status != applied, it is Overdue / Critical.
      let computedStatus: "upcoming" | "due" | "applied" | "overdue" | "paused" = "upcoming";
      if (s.step.status === "applied") {
        computedStatus = "applied";
      } else if (daysUntilEffective <= 0) {
        computedStatus = "overdue";
      } else if (daysUntilEffective <= 30) {
        computedStatus = "due";
      } else {
        computedStatus = "upcoming";
      }

      const oldMonthlyRent = Math.round(oldRate * area);
      const newMonthlyRent = Math.round(calculatedNewRate * area);
      const monthlyUpliftInr = Math.max(0, newMonthlyRent - oldMonthlyRent); // Formula D-09

      // Tally summary KPI metrics
      if (computedStatus === "applied") {
        totalAppliedCount++;
      } else {
        if (daysUntilEffective <= 90) {
          totalDue90dCount++;
          totalDue90dUplift += monthlyUpliftInr;
        }
        if (computedStatus === "overdue") {
          totalOverdueAl04Count++;
        }
      }

      const chargeName = s.charge?.component ? s.charge.component.replace("_", " ").toUpperCase() + " (SAC: 997212)" : "Base Rent (SAC: 997212)";

      return {
        id: s.step.id,
        contract_id: s.contract?.id,
        contract_code: s.contract?.contract_code || "CTR-UNKNOWN",
        property_name: s.property?.property_name || "Commercial Complex",
        space_id: s.space?.id,
        space_name: s.space?.space_name || "Suite Space",
        space_code: s.space?.space_code || "SP-01",
        chargeable_area: area,
        occupant_id: s.occupant?.id,
        occupant_name: s.occupant?.occupant_name || "Enterprise Tenant",
        component: s.charge?.component || "base_rent",
        charge_name: chargeName,
        effective_date: effectiveDateStr,
        days_until_effective: daysUntilEffective,
        escalation_type: s.step.escalation_type,
        escalation_value: s.step.escalation_value,
        escalation_pct: pctValue,
        current_rate_psf: oldRate,
        new_rate_psf: Math.round(calculatedNewRate * 100) / 100,
        current_monthly_rent: oldMonthlyRent,
        new_monthly_rent: newMonthlyRent,
        old_rent: oldRate,
        new_rent: Math.round(calculatedNewRate * 100) / 100,
        monthly_uplift_inr: monthlyUpliftInr,
        status: computedStatus,
        db_status: s.step.status,
        applied_at: s.step.applied_at?.toISOString(),
        applied_by: s.step.applied_by,
        source_clause: "15% every 3 years compounding",
        notice_template_al03t: `${chargeName} for ${s.contract?.contract_code} (${s.occupant?.occupant_name}) rises ${pctValue}% on ${effectiveDateStr}: ₹${oldRate} → ₹${Math.round(calculatedNewRate * 100) / 100} (+₹${monthlyUpliftInr.toLocaleString("en-IN")}/month).`,
      };
    });

    // Apply filtering
    const filteredEvents = allEvents.filter((ev) => {
      // Window filter
      if (windowFilter === "90d" && ev.days_until_effective > 90) return false;
      if (windowFilter === "180d" && ev.days_until_effective > 180) return false;
      if (windowFilter === "365d" && ev.days_until_effective > 365) return false;

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "due" && ev.status !== "due") return false;
        if (statusFilter === "scheduled" && ev.status !== "upcoming") return false;
        if (statusFilter === "applied" && ev.status !== "applied") return false;
        if (statusFilter === "overdue" && ev.status !== "overdue") return false;
      }

      // Search filter
      if (search) {
        const matchesContract = ev.contract_code.toLowerCase().includes(search);
        const matchesOccupant = ev.occupant_name.toLowerCase().includes(search);
        const matchesProperty = ev.property_name.toLowerCase().includes(search);
        const matchesSpace = ev.space_name.toLowerCase().includes(search);
        if (!matchesContract && !matchesOccupant && !matchesProperty && !matchesSpace) return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      data: filteredEvents,
      escalations: filteredEvents,
      summary: {
        total_count: allEvents.length,
        filtered_count: filteredEvents.length,
        k10_due_90d_count: totalDue90dCount,
        k10_due_90d_uplift: totalDue90dUplift,
        overdue_al04_count: totalOverdueAl04Count,
        applied_count: totalAppliedCount,
      },
    });
  } catch (err: any) {
    console.error("Error fetching escalation calendar:", err);
    return NextResponse.json(
      { error: "Failed to fetch escalation calendar", message: err.message },
      { status: 500 }
    );
  }
}
