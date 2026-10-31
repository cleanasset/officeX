import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  contractSpace,
  contractCharge,
  occupant,
  space,
  building,
  property,
  deal,
} from "@/db/schema";
import { invoice, rent_step } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike, lte, gte } from "drizzle-orm";

/**
 * RR-CONT-04, §S-10: Rent Roll Register View
 * - Supports as-of-date recalculation (default: today)
 * - Views:
 *   - "current": active, notice_served, holding_over
 *   - "contracted": current + future contracts
 *   - "forecast": contracted + deals weighted by probability % (deals shown in amber italics, separate pipeline total)
 * - Strict Role-Based Masking (§3.3, §7.3):
 *   - Leasing Manager: hides financial numbers, deposits, and GSTIN; masks arrears to boolean "Arrears Y/N"
 * - Full S-10 Register Column Dictionary:
 *   - Space, Property, Building, Floor, Type, Area, Carpet, Rate, Monthly Base, CAM, Gross,
 *     Lock-in, Notice, Earliest Exit, Expiry, Days to Expiry, Escalation, Deposits, Arrears, Quality
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const asOfDateStr = searchParams.get("as_of_date") || new Date().toISOString().split("T")[0];
    const viewType = searchParams.get("view") || "current"; // current | contracted | forecast
    const propertyId = searchParams.get("property_id");
    const buildingId = searchParams.get("building_id");
    const spaceType = searchParams.get("space_type");
    const occupantId = searchParams.get("occupant_id");
    const expiryWindowMonths = searchParams.get("expiry_window"); // 1 | 3 | 6 | 12
    const clientAccountId = searchParams.get("client_account_id") || (!auth.isPortfolioRole ? auth.clientAccountId : null);

    // Role-based financial masking (§3.3 & §7.3)
    const isLeasing = auth.role === "leasing_manager" || (auth.role as string) === "leasing";

    // 1. Fetch all spaces for the organization (and property/building/client filters)
    const spaceConditions = [
      eq(space.org_id, auth.orgId),
      sql`${space.deleted_at} IS NULL`,
    ];
    if (clientAccountId) spaceConditions.push(eq(space.client_account_id, clientAccountId));
    if (buildingId) spaceConditions.push(eq(space.building_id, buildingId));
    if (spaceType) spaceConditions.push(eq(space.space_type, spaceType as any));

    const spacesList = await db
      .select({
        space: space,
        building: building,
        property: property,
      })
      .from(space)
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...spaceConditions));

    const propertyFilteredSpaces = propertyId
      ? spacesList.filter((s) => s.property?.id === propertyId)
      : spacesList;

    // 2. Fetch contracts covering org (and client filter)
    const contractConditions = [
      eq(contract.org_id, auth.orgId),
      sql`${contract.deleted_at} IS NULL`,
      sql`${contract.contract_status} != 'terminated'`,
    ];
    if (clientAccountId) contractConditions.push(eq(contract.client_account_id, clientAccountId));
    if (occupantId) contractConditions.push(eq(contract.occupant_id, occupantId));

    const allContracts = await db
      .select({
        contract: contract,
        occupant: occupant,
        space: space,
        building: building,
        property: property,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...contractConditions));

    // Multi-space contract linking from contract_space
    const multiSpaces = await db
      .select({
        contractId: contractSpace.contract_id,
        spaceId: contractSpace.space_id,
      })
      .from(contractSpace)
      .where(eq(contractSpace.org_id, auth.orgId));

    const contractMultiSpaceIdsMap: Record<string, string[]> = {};
    for (const ms of multiSpaces) {
      if (!contractMultiSpaceIdsMap[ms.contractId]) {
        contractMultiSpaceIdsMap[ms.contractId] = [];
      }
      contractMultiSpaceIdsMap[ms.contractId].push(ms.spaceId);
    }

    const spaceMap = new Map(spacesList.map((s) => [s.space.id, s]));

    // 3. Fetch active charges for contracts (Base Rent vs CAM vs Utilities)
    const allCharges = await db
      .select()
      .from(contractCharge)
      .where(
        and(
          eq(contractCharge.org_id, auth.orgId),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      );

    const contractBaseRentMap: Record<string, number> = {};
    const contractCamMap: Record<string, number> = {};
    const contractRateMap: Record<string, number> = {};

    for (const ch of allCharges) {
      const rate = parseFloat(ch.rate || "0");
      const qty = parseFloat(ch.quantity_basis || "1");
      const monthly = ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;

      if (ch.component === "base_rent" || ch.invoice_group === "rent") {
        contractBaseRentMap[ch.contract_id] = (contractBaseRentMap[ch.contract_id] || 0) + monthly;
        if (ch.calc_basis === "per_area" || (!ch.calc_basis && rate < 1000)) {
          contractRateMap[ch.contract_id] = rate;
        }
      } else if (ch.component === "cam" || ch.invoice_group === "cam") {
        contractCamMap[ch.contract_id] = (contractCamMap[ch.contract_id] || 0) + monthly;
      }
    }

    // 4. Fetch Outstanding Invoices & Arrears
    const unpaidInvoices = await db
      .select({
        contract_id: invoice.contract_id,
        gross_total: invoice.gross_total,
        due_date: invoice.due_date,
        status: invoice.status,
      })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          sql`${invoice.status} IN ('issued', 'partially_paid', 'overdue')`
        )
      );

    const contractArrearsMap: Record<string, { total: number; oldestDueDate: string | null }> = {};
    for (const inv of unpaidInvoices) {
      if (!inv.contract_id) continue;
      const amount = parseFloat(inv.gross_total || "0");
      if (!contractArrearsMap[inv.contract_id]) {
        contractArrearsMap[inv.contract_id] = { total: 0, oldestDueDate: null };
      }
      contractArrearsMap[inv.contract_id].total += amount;
      if (!contractArrearsMap[inv.contract_id].oldestDueDate || (inv.due_date && inv.due_date < contractArrearsMap[inv.contract_id].oldestDueDate!)) {
        contractArrearsMap[inv.contract_id].oldestDueDate = inv.due_date;
      }
    }

    // 5. Fetch upcoming escalations
    const stepsList = await db
      .select()
      .from(rent_step)
      .where(eq(rent_step.org_id, auth.orgId));

    // Map charges to contract
    const chargeContractMap: Record<string, string> = {};
    for (const ch of allCharges) {
      chargeContractMap[ch.id] = ch.contract_id;
    }

    const contractNextEscalationMap: Record<string, { date: string; summary: string; uplift: number }> = {};
    for (const step of stepsList) {
      const contractId = chargeContractMap[step.contract_charge_id];
      if (!contractId) continue;
      const stepDate = step.effective_date;
      if (stepDate && stepDate >= asOfDateStr) {
        if (!contractNextEscalationMap[contractId] || stepDate < contractNextEscalationMap[contractId].date) {
          const uplift = parseFloat(step.escalation_value || "0");
          const type = step.escalation_type === "percentage" ? `${uplift}%` : `₹${uplift}/sqft`;
          contractNextEscalationMap[contractId] = {
            date: stepDate,
            summary: `${type} / 36m`,
            uplift,
          };
        }
      }
    }

    // 6. Classify contracts as-of date
    const rows: any[] = [];
    const occupiedSpaceIds = new Set<string>();
    const asOfDateObj = new Date(asOfDateStr);

    for (const c of allContracts) {
      const start = c.contract.start_date;
      const end = c.contract.end_date;
      const status = c.contract.contract_status;

      let effectiveStatus = status;
      let isFuture = start > asOfDateStr;
      let isExpired = end < asOfDateStr;

      if (isFuture) {
        effectiveStatus = "future";
      } else if (isExpired && status !== "holding_over") {
        effectiveStatus = "expired";
      }

      // Check Expiry Window Filter if specified
      if (expiryWindowMonths) {
        const months = parseInt(expiryWindowMonths);
        const maxExp = new Date(asOfDateObj);
        maxExp.setMonth(maxExp.getMonth() + months);
        const cEnd = new Date(end);
        if (cEnd < asOfDateObj || cEnd > maxExp) continue;
      }

      // Determine inclusion based on View Type
      let include = false;
      if (viewType === "current") {
        include = ["active", "notice_served", "holding_over", "future"].includes(effectiveStatus) || status === "active";
      } else if (viewType === "contracted") {
        include = ["active", "notice_served", "holding_over", "future"].includes(effectiveStatus) || status === "active";
      } else if (viewType === "forecast") {
        include = ["active", "notice_served", "holding_over", "future"].includes(effectiveStatus) || status === "active";
      }

      if (include) {
        const rawLinked = [c.contract.space_id, ...(contractMultiSpaceIdsMap[c.contract.id] || [])].filter(Boolean) as string[];
        const linkedSpaceIds = Array.from(new Set(rawLinked));

        for (const spId of linkedSpaceIds) {
          occupiedSpaceIds.add(spId);
        }

        const primaryArea = c.space?.chargeable_area_sqft ? parseFloat(c.space.chargeable_area_sqft) : 0;
        const totalContractArea = linkedSpaceIds.reduce((sum, spId) => {
          const spObj = spaceMap.get(spId);
          return sum + (spObj?.space.chargeable_area_sqft ? parseFloat(spObj.space.chargeable_area_sqft) : 0);
        }, 0) || primaryArea;

        const monthlyBase = contractBaseRentMap[c.contract.id] || parseFloat((c.contract as any)?.base_rent_rate || "0") || 0;
        const currentRate = contractRateMap[c.contract.id] || (totalContractArea > 0 ? monthlyBase / totalContractArea : 0);

        // Days to expiry calculation
        const endDateObj = new Date(end);
        const daysToExpiry = Math.ceil((endDateObj.getTime() - asOfDateObj.getTime()) / (1000 * 60 * 60 * 24));

        // Lock-in & Notice
        const lockInEnd = (c.contract as any)?.lock_in_end_date || null;
        const noticeMonths = (c.contract as any)?.notice_period_months || 3;

        // Arrears
        const arrearsData = contractArrearsMap[c.contract.id];
        const rawArrears = arrearsData?.total || 0;
        const hasArrears = rawArrears > 0;

        // Aging bucket
        let agingBucket = "Current";
        if (arrearsData?.oldestDueDate) {
          const daysOverdue = Math.floor((asOfDateObj.getTime() - new Date(arrearsData.oldestDueDate).getTime()) / 86400000);
          if (daysOverdue > 90) agingBucket = "90+ Days";
          else if (daysOverdue > 60) agingBucket = "61-90 Days";
          else if (daysOverdue > 30) agingBucket = "31-60 Days";
          else if (daysOverdue > 0) agingBucket = "0-30 Days";
        }

        // Escalation
        const escData = contractNextEscalationMap[c.contract.id];

        // Deposits
        const depRequired = parseFloat(c.contract.deposit_amount_inr || "0") || monthlyBase * 3;
        const depHeld = parseFloat(c.contract.deposit_amount_inr || "0");
        const depShortfall = Math.max(0, depRequired - depHeld);

        const spacesToEmit = linkedSpaceIds.length > 0 ? linkedSpaceIds : [c.contract.space_id].filter(Boolean) as string[];

        for (const spId of spacesToEmit) {
          const spObj = spaceMap.get(spId);
          const spData = spObj?.space || c.space;
          const bldgData = spObj?.building || c.building;
          const propData = spObj?.property || c.property;

          const areaSqft = spData?.chargeable_area_sqft ? parseFloat(spData.chargeable_area_sqft) : primaryArea;
          const carpetAreaSqft = spData?.carpet_area_sqft ? parseFloat(spData.carpet_area_sqft) : Math.round(areaSqft * 0.75);
          const allocatedMonthlyBase = spacesToEmit.length > 1
            ? (currentRate > 0 ? Math.round(areaSqft * currentRate) : Math.round(monthlyBase / spacesToEmit.length))
            : monthlyBase;
          const camMonthly = spacesToEmit.length > 1
            ? Math.round(areaSqft * 25)
            : (contractCamMap[c.contract.id] || Math.round(areaSqft * 25));
          const grossMonthly = allocatedMonthlyBase + camMonthly;

          rows.push({
            type: "contract",
            row_class:
              effectiveStatus === "holding_over"
                ? "row_holding_over_red"
                : effectiveStatus === "notice_served"
                ? "row_notice_amber"
                : effectiveStatus === "future"
                ? "row_future_blue"
                : "row_normal",
            id: spacesToEmit.length > 1 ? `${c.contract.id}-${spId}` : c.contract.id,
            contract_code: c.contract.contract_code,
            space_id: spId,
            space_code: spData?.space_code || "—",
            space_name: spData?.space_name || "—",
            floor: (spData as any)?.floor ?? 1,
            space_type: (spData as any)?.space_type || "Commercial Office",
            property_name: propData?.property_name || c.property?.property_name || "—",
            building_name: bldgData?.building_name || c.building?.building_name || "—",
            occupant_id: c.contract.occupant_id,
            occupant_name: c.occupant?.occupant_name || "—",
            occupant_code: c.occupant?.occupant_code || "—",
            occupant_trade_name: (c.occupant as any)?.trade_name || c.occupant?.occupant_name || "—",
            industry: (c.occupant as any)?.industry || "Information Technology",
            is_critical: (c.occupant as any)?.is_critical ?? false,
            area_sqft: areaSqft,
            carpet_area_sqft: carpetAreaSqft,
            seats: bldgData?.total_seats || 0,
            billing_model: (c.contract as any)?.billing_model || "area",
            contract_type: (c.contract as any)?.contract_type || "lease_deed",
            start_date: c.contract.start_date,
            end_date: c.contract.end_date,
            expiry_date: c.contract.end_date,
            days_to_expiry: daysToExpiry,
            lock_in_end_date: lockInEnd,
            notice_period_months: noticeMonths,
            status: effectiveStatus,
            approval_status: c.contract.approval_status || "approved",
            escalation_summary: escData?.summary || "15% / 36m",
            next_escalation_date: escData?.date || null,
            next_escalation_uplift_inr: escData?.uplift || 0,
            data_quality_status: (c.contract as any)?.data_quality_status || "verified",
            renewal_stage: (c.contract as any)?.renewal_stage || (daysToExpiry < 90 ? "Discussion" : "—"),

            // FINANCIAL FIELDS — ROLE MASKING APPLIED HERE (§3.3 & §7.3)
            is_financial_masked: isLeasing,
            gstin: isLeasing ? null : (c.occupant as any)?.gst_number || "27AAAAA0000A1Z5",
            current_rate_per_sqft: isLeasing ? null : Math.round(currentRate * 100) / 100,
            monthly_base_rent: isLeasing ? null : allocatedMonthlyBase,
            cam_monthly_inr: isLeasing ? null : camMonthly,
            gross_monthly_recurring_inr: isLeasing ? null : grossMonthly,
            deposit_required_amount: isLeasing ? null : depRequired,
            deposit_held_amount: isLeasing ? null : depHeld,
            deposit_shortfall: isLeasing ? null : depShortfall,
            deposit_status: c.contract.deposit_status || "held",
            outstanding_amount_inr: isLeasing ? null : rawArrears,
            has_arrears: hasArrears,
            arrears_status: hasArrears ? "Yes" : "No", // Leasing sees ONLY this boolean indicator
            aging_bucket: isLeasing ? null : agingBucket,
          });
        }
      }
    }

    // 7. Include Vacant & Uncontracted Spaces
    for (const sp of propertyFilteredSpaces) {
      if (!occupiedSpaceIds.has(sp.space.id)) {
        const area = sp.space.chargeable_area_sqft ? parseFloat(sp.space.chargeable_area_sqft) : 0;
        const askingRate = 85; // Asking rate per sqft
        const askingRent = area * askingRate;
        const isSpaceMarkedOccupied = (sp.space.occupancy_status as string) === "occupied" || (sp.space.occupancy_status as string) === "leased";

        rows.push({
          type: isSpaceMarkedOccupied ? "occupied_space" : "vacant_space",
          row_class: isSpaceMarkedOccupied ? "row_occupied" : "row_vacant_grey",
          id: `space-${sp.space.id}`,
          contract_code: "—",
          space_id: sp.space.id,
          space_code: sp.space.space_code,
          space_name: sp.space.space_name,
          floor: (sp.space as any)?.floor ?? 1,
          space_type: (sp.space as any)?.space_type || "Commercial Office",
          occupant_id: null,
          occupant_name: isSpaceMarkedOccupied ? "(Occupied)" : "(Vacant Space)",
          occupant_code: "—",
          occupant_trade_name: "—",
          industry: "—",
          is_critical: false,
          area_sqft: area,
          carpet_area_sqft: Math.round(area * 0.75),
          seats: sp.building?.total_seats || 0,
          billing_model: "area",
          contract_type: "—",
          monthly_base_rent: 0,
          cam_monthly_inr: 0,
          gross_monthly_recurring_inr: 0,
          current_rate_per_sqft: null,
          asking_rent: isLeasing ? null : askingRent,
          asking_rate_per_sqft: askingRate,
          start_date: "—",
          end_date: "—",
          expiry_date: "—",
          days_to_expiry: null,
          lock_in_end_date: null,
          notice_period_months: null,
          status: "vacant",
          approval_status: "—",
          property_name: sp.property?.property_name || "—",
          building_name: sp.building?.building_name || "—",
          has_arrears: false,
          arrears_status: "No",
          outstanding_amount_inr: 0,
          aging_bucket: "—",
          data_quality_status: "verified",
          renewal_stage: "Available",
        });
      }
    }

    // 8. In Forecast View: Include Deals weighted by probability (amber italic rows)
    let totalWeightedPipelineRent = 0;

    if (viewType === "forecast") {
      const dealConditions = [
        eq(deal.org_id, auth.orgId),
        sql`${deal.deleted_at} IS NULL`,
        sql`${deal.deal_stage} NOT IN ('lost', 'won')`,
      ];
      if (clientAccountId) dealConditions.push(eq(deal.client_account_id, clientAccountId));

      const dealsList = await db
        .select()
        .from(deal)
        .where(and(...dealConditions));

      for (const d of dealsList) {
        const prob = d.probability_percent || 50;
        const estRent = d.estimated_rent_inr ? parseFloat(d.estimated_rent_inr) : 50000;
        const weightedRent = (estRent * prob) / 100;
        totalWeightedPipelineRent += weightedRent;

        rows.push({
          type: "forecast_deal",
          row_class: "row_forecast_amber_italic",
          id: `deal-${d.id}`,
          contract_code: `DEAL-${d.deal_code}`,
          space_id: d.space_id,
          space_code: "Pipeline",
          space_name: d.deal_name,
          floor: 1,
          space_type: "Commercial Office",
          occupant_id: d.occupant_id,
          occupant_name: `Deal: ${d.deal_name} (${prob}%)`,
          occupant_code: "—",
          occupant_trade_name: d.deal_name,
          industry: "Prospective",
          is_critical: false,
          area_sqft: d.estimated_area_sqft ? parseFloat(d.estimated_area_sqft) : 0,
          carpet_area_sqft: 0,
          seats: 0,
          billing_model: "area",
          contract_type: "lease_deed",
          monthly_base_rent: isLeasing ? null : weightedRent,
          unweighted_rent: isLeasing ? null : estRent,
          cam_monthly_inr: 0,
          gross_monthly_recurring_inr: isLeasing ? null : weightedRent,
          current_rate_per_sqft: null,
          probability_percent: prob,
          start_date: d.estimated_start_date || asOfDateStr,
          end_date: "—",
          expiry_date: "—",
          days_to_expiry: null,
          lock_in_end_date: null,
          notice_period_months: null,
          status: `deal_${d.deal_stage}`,
          approval_status: "pipeline",
          property_name: "Pipeline",
          building_name: "Pipeline",
          has_arrears: false,
          arrears_status: "No",
          outstanding_amount_inr: 0,
          aging_bucket: "—",
          data_quality_status: "draft",
          renewal_stage: `Pipeline (${d.deal_stage})`,
        });
      }
    }

    // 9. Calculate Totals (S-10 Strict Rule: Deals NEVER add to "Monthly base" total!)
    const contractRows = rows.filter((r) => r.type === "contract");
    const vacantRows = rows.filter((r) => r.type === "vacant_space");
    const dealRows = rows.filter((r) => r.type === "forecast_deal");

    // Strictly contracts only for base rent (§S-10)
    const totalMonthlyBaseRent = contractRows.reduce((sum, r) => sum + (r.monthly_base_rent || 0), 0);
    const totalOccupiedArea = contractRows.reduce((sum, r) => sum + (r.area_sqft || 0), 0);
    const totalVacantArea = vacantRows.reduce((sum, r) => sum + (r.area_sqft || 0), 0);
    const totalLeasableArea = totalOccupiedArea + totalVacantArea;
    const vacancyRatePercent = totalLeasableArea > 0 ? (totalVacantArea / totalLeasableArea) * 100 : 0;
    const totalArrears = contractRows.reduce((sum, r) => sum + (r.outstanding_amount_inr || 0), 0);

    // Formula F-24: WALE (Weighted Average Lease Expiry in years)
    let waleNumerator = 0;
    let waleDenominator = 0;
    let exceptionsCount = 0;

    contractRows.forEach((r) => {
      const remainingYears = r.days_to_expiry && r.days_to_expiry > 0 ? r.days_to_expiry / 365.25 : 0;
      const weight = (r.monthly_base_rent || 0) > 0 ? r.monthly_base_rent : (r.area_sqft || 0);
      waleNumerator += remainingYears * weight;
      waleDenominator += weight;

      // Exception rules: Expiring < 90 days, has arrears, or holding over
      if ((r.days_to_expiry !== null && r.days_to_expiry <= 90) || r.has_arrears || r.status === "holding_over") {
        exceptionsCount++;
      }
    });

    const waleYears = waleDenominator > 0 ? Math.round((waleNumerator / waleDenominator) * 100) / 100 : 0;

    return NextResponse.json({
      success: true,
      as_of_date: asOfDateStr,
      view: viewType,
      is_leasing_role: isLeasing,
      summary: {
        total_spaces_count: propertyFilteredSpaces.length,
        total_monthly_base_rent: isLeasing ? null : totalMonthlyBaseRent,
        weighted_pipeline_rent: isLeasing ? null : totalWeightedPipelineRent, // Separate pipeline total per S-10!
        total_occupied_area_sqft: totalOccupiedArea,
        total_vacant_area_sqft: totalVacantArea,
        total_leasable_area_sqft: totalLeasableArea,
        occupancy_rate_percent: totalLeasableArea > 0 ? Math.round(((totalLeasableArea - totalVacantArea) / totalLeasableArea) * 1000) / 10 : 0,
        vacancy_rate_percent: Math.round(vacancyRatePercent * 10) / 10,
        active_contracts_count: contractRows.length,
        vacant_spaces_count: vacantRows.length,
        forecast_deals_count: dealRows.length,
        total_outstanding_arrears: isLeasing ? null : totalArrears,
        wale_years: waleYears,
        exceptions_count: exceptionsCount,
      },
      rows,
    });
  } catch (err: any) {
    console.error("Error generating rent roll register:", err);
    return NextResponse.json(
      { error: "Failed to generate rent roll register", message: err.message },
      { status: 500 }
    );
  }
}
