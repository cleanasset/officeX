import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  contractCharge,
  occupant,
  space,
  building,
  property,
  deal,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike, lte, gte } from "drizzle-orm";

/**
 * RR-CONT-04, §S-10: Rent Roll Register View
 * - Supports as-of-date recalculation (default: today)
 * - Views:
 *   - "current": active, notice_served, holding_over
 *   - "contracted": current + future contracts
 *   - "forecast": contracted + deals weighted by probability %
 * - Includes vacant spaces in grey with asking rent
 * - Calculates totals: total base rent, total occupied area, vacancy rate
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

    // Fetch active base rent charges for contracts
    const allCharges = await db
      .select()
      .from(contractCharge)
      .where(
        and(
          eq(contractCharge.org_id, auth.orgId),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      );

    // Map base rents to contracts (monthly amount)
    const contractBaseRentMap: Record<string, number> = {};
    for (const ch of allCharges) {
      if (ch.component === "base_rent" || ch.invoice_group === "rent") {
        const rate = parseFloat(ch.rate || "0");
        const qty = parseFloat(ch.quantity_basis || "1");
        const monthly = ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;
        contractBaseRentMap[ch.contract_id] = (contractBaseRentMap[ch.contract_id] || 0) + monthly;
      }
    }

    // 3. Classify contracts as-of date
    const rows: any[] = [];
    const occupiedSpaceIds = new Set<string>();

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

      // Check Expiry Window Filter if specified (e.g. within next X months)
      if (expiryWindowMonths) {
        const months = parseInt(expiryWindowMonths);
        const asOf = new Date(asOfDateStr);
        const maxExp = new Date(asOf);
        maxExp.setMonth(maxExp.getMonth() + months);
        const cEnd = new Date(end);
        if (cEnd < asOf || cEnd > maxExp) continue;
      }

      // Determine inclusion based on View Type
      let include = false;
      if (viewType === "current") {
        include = ["active", "notice_served", "holding_over"].includes(effectiveStatus);
      } else if (viewType === "contracted") {
        include = ["active", "notice_served", "holding_over", "future"].includes(effectiveStatus);
      } else if (viewType === "forecast") {
        include = ["active", "notice_served", "holding_over", "future"].includes(effectiveStatus);
      }

      if (include) {
        if (c.contract.space_id) {
          occupiedSpaceIds.add(c.contract.space_id);
        }

        const monthlyRent = contractBaseRentMap[c.contract.id] || 0;

        rows.push({
          type: "contract",
          row_class: effectiveStatus === "future" ? "contracted_future_blue" : "normal",
          id: c.contract.id,
          contract_code: c.contract.contract_code,
          space_id: c.contract.space_id,
          space_code: c.space?.space_code || "—",
          space_name: c.space?.space_name || "—",
          occupant_id: c.contract.occupant_id,
          occupant_name: c.occupant?.occupant_name || "—",
          occupant_code: c.occupant?.occupant_code || "—",
          area_sqft: c.space?.chargeable_area_sqft ? parseFloat(c.space.chargeable_area_sqft) : 0,
          seats: c.building?.total_seats || 0,
          monthly_base_rent: monthlyRent,
          start_date: c.contract.start_date,
          end_date: c.contract.end_date,
          expiry_date: c.contract.end_date,
          status: effectiveStatus,
          approval_status: c.contract.approval_status,
          property_name: c.property?.property_name || "—",
          building_name: c.building?.building_name || "—",
          deposit_amount_inr: c.contract.deposit_amount_inr,
          deposit_status: c.contract.deposit_status,
        });
      }
    }

    // 4. Include Vacant Spaces (shown in grey with asking rent in brackets)
    for (const sp of propertyFilteredSpaces) {
      if (!occupiedSpaceIds.has(sp.space.id)) {
        const area = sp.space.chargeable_area_sqft ? parseFloat(sp.space.chargeable_area_sqft) : 0;
        const askingRate = 85; // Default asking rate per sqft/month
        const askingRent = area * askingRate;

        rows.push({
          type: "vacant_space",
          row_class: "vacant_grey",
          id: `vacant-${sp.space.id}`,
          contract_code: "—",
          space_id: sp.space.id,
          space_code: sp.space.space_code,
          space_name: sp.space.space_name,
          occupant_id: null,
          occupant_name: "(Vacant)",
          occupant_code: "—",
          area_sqft: area,
          seats: sp.building?.total_seats || 0,
          monthly_base_rent: 0,
          asking_rent: askingRent,
          asking_rate_per_sqft: askingRate,
          start_date: "—",
          end_date: "—",
          expiry_date: "—",
          status: "vacant",
          approval_status: "—",
          property_name: sp.property?.property_name || "—",
          building_name: sp.building?.building_name || "—",
        });
      }
    }

    // 5. In Forecast View: Include Deals weighted by probability (amber italic rows)
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

        rows.push({
          type: "forecast_deal",
          row_class: "forecast_amber_italic",
          id: `deal-${d.id}`,
          contract_code: `DEAL: ${d.deal_code}`,
          space_id: d.space_id,
          space_code: "Pipeline",
          space_name: d.deal_name,
          occupant_id: d.occupant_id,
          occupant_name: `Deal: ${d.deal_name} (${prob}%)`,
          occupant_code: "—",
          area_sqft: d.estimated_area_sqft ? parseFloat(d.estimated_area_sqft) : 0,
          seats: 0,
          monthly_base_rent: weightedRent,
          unweighted_rent: estRent,
          probability_percent: prob,
          start_date: d.estimated_start_date || asOfDateStr,
          end_date: "—",
          expiry_date: "—",
          status: `deal_${d.deal_stage}`,
          approval_status: "pipeline",
          property_name: "Pipeline",
          building_name: "Pipeline",
        });
      }
    }

    // 6. Calculate Totals (Sum of monthly base rent, occupied area, vacancy rate)
    const contractRows = rows.filter((r) => r.type === "contract");
    const vacantRows = rows.filter((r) => r.type === "vacant_space");
    const dealRows = rows.filter((r) => r.type === "forecast_deal");

    const totalMonthlyBaseRent = rows.reduce((sum, r) => sum + (r.monthly_base_rent || 0), 0);
    const totalOccupiedArea = contractRows.reduce((sum, r) => sum + (r.area_sqft || 0), 0);
    const totalVacantArea = vacantRows.reduce((sum, r) => sum + (r.area_sqft || 0), 0);
    const totalLeasableArea = totalOccupiedArea + totalVacantArea;
    const vacancyRatePercent = totalLeasableArea > 0 ? (totalVacantArea / totalLeasableArea) * 100 : 0;

    return NextResponse.json({
      success: true,
      as_of_date: asOfDateStr,
      view: viewType,
      summary: {
        total_monthly_base_rent: totalMonthlyBaseRent,
        total_occupied_area_sqft: totalOccupiedArea,
        total_vacant_area_sqft: totalVacantArea,
        total_leasable_area_sqft: totalLeasableArea,
        vacancy_rate_percent: Math.round(vacancyRatePercent * 10) / 10,
        active_contracts_count: contractRows.length,
        vacant_spaces_count: vacantRows.length,
        forecast_deals_count: dealRows.length,
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
