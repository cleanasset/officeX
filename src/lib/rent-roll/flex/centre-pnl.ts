import { db } from "@/db";
import {
  contract,
  space,
  property,
  contract_space,
  contract_charge,
  occupant,
} from "@/db/rent-roll-schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface CentrePnLResult {
  property_id: string;
  property_name: string;
  property_code: string;
  total_seats: number;
  occupied_seats: number;
  vacant_seats: number;
  seat_occupancy_pct: number;
  revenue: {
    seat_billing_revenue_inr: number;
    ancillary_revenue_inr: number;
    total_flex_revenue_inr: number;
  };
  costs: {
    head_lease_cost_inr: number;
    operating_expenses_inr: number;
    total_cost_inr: number;
  };
  net_operating_income_inr: number;
  profit_margin_pct: number;
  contracts: {
    receivable_count: number;
    head_lease_payable_count: number;
  };
}

export async function calculateCentrePnL(
  orgId: string,
  propertyId?: string
): Promise<CentrePnLResult[]> {
  // Query properties
  const propConditions = [eq(property.org_id, orgId)];
  if (propertyId && propertyId !== "all") {
    propConditions.push(eq(property.id, propertyId));
  }

  const propertiesList = await db.select().from(property).where(and(...propConditions));

  const results: CentrePnLResult[] = [];

  for (const prop of propertiesList) {
    const totalSeats = prop.total_leasable_seats || 0;

    // 2. Query receivable contracts on this property (Flex Seat Billing: billing_model="seats" or direction="receivable")
    const receivableContracts = await db
      .select()
      .from(contract)
      .where(
        and(
          eq(contract.org_id, orgId),
          eq(contract.direction, "receivable"),
          eq(contract.contract_status, "active")
        )
      );

    // 3. Query head lease payable contracts (direction="payable")
    const payableContracts = await db
      .select()
      .from(contract)
      .where(
        and(
          eq(contract.org_id, orgId),
          eq(contract.direction, "payable"),
          eq(contract.contract_status, "active")
        )
      );

    // Calculate seat occupancy & revenue
    let occupiedSeats = 0;
    let seatRevenue = 0;

    for (const c of receivableContracts) {
      const charges = await db
        .select()
        .from(contract_charge)
        .where(eq(contract_charge.contract_id, c.id));

      const contractSeats = c.billing_model === "seats" ? (charges.reduce((sum, ch) => sum + (ch.quantity_basis ? parseFloat(ch.quantity_basis) : 0), 0) || 0) : 0;
      const rent = charges.reduce(
        (sum, ch) => sum + (parseFloat(ch.rate || "0") || 0) * (ch.quantity_basis ? parseFloat(ch.quantity_basis) : 1),
        0
      );

      occupiedSeats += contractSeats;
      seatRevenue += rent;
    }

    occupiedSeats = Math.min(occupiedSeats, totalSeats);
    const vacantSeats = Math.max(0, totalSeats - occupiedSeats);
    const occupancyPct = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 1000) / 10 : 0;

    // Ancillary revenue
    const ancillaryRevenue = 0;
    const totalRevenue = seatRevenue + ancillaryRevenue;

    // Head lease cost calculation
    let headLeaseCost = 0;
    for (const hc of payableContracts) {
      const charges = await db
        .select()
        .from(contract_charge)
        .where(eq(contract_charge.contract_id, hc.id));
      const payableRent = charges.reduce(
        (sum, ch) => sum + (parseFloat(ch.rate || "0") || 0) * (ch.quantity_basis ? parseFloat(ch.quantity_basis) : 1),
        0
      );
      headLeaseCost += payableRent;
    }

    const opex = 0;
    const totalCost = headLeaseCost + opex;

    const noi = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? Math.round((noi / totalRevenue) * 1000) / 10 : 0;

    results.push({
      property_id: prop.id,
      property_name: prop.property_name,
      property_code: prop.property_code,
      total_seats: totalSeats,
      occupied_seats: occupiedSeats,
      vacant_seats: vacantSeats,
      seat_occupancy_pct: occupancyPct,
      revenue: {
        seat_billing_revenue_inr: Math.round(seatRevenue * 100) / 100,
        ancillary_revenue_inr: ancillaryRevenue,
        total_flex_revenue_inr: Math.round(totalRevenue * 100) / 100,
      },
      costs: {
        head_lease_cost_inr: Math.round(headLeaseCost * 100) / 100,
        operating_expenses_inr: opex,
        total_cost_inr: Math.round(totalCost * 100) / 100,
      },
      net_operating_income_inr: Math.round(noi * 100) / 100,
      profit_margin_pct: marginPct,
      contracts: {
        receivable_count: receivableContracts.length,
        head_lease_payable_count: payableContracts.length,
      },
    });
  }

  return results;
}
