import { db } from "../src/db";
import { contract, contractCharge, occupant, space, building, property } from "../src/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function main() {
  const orgId = "1c3dd981-3e43-4d40-ae41-4e7ee2f28d01";
  console.log("=== SIMULATING /api/rent-roll/register FOR ORG:", orgId);

  // 1. Fetch spaces
  const spacesList = await db
    .select({
      space: space,
      building: building,
      property: property,
    })
    .from(space)
    .leftJoin(building, eq(space.building_id, building.id))
    .leftJoin(property, eq(building.property_id, property.id))
    .where(and(eq(space.org_id, orgId), sql`${space.deleted_at} IS NULL`));

  console.log(`Found ${spacesList.length} spaces.`);

  // 2. Fetch contracts
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
    .where(and(eq(contract.org_id, orgId), sql`${contract.deleted_at} IS NULL`));

  console.log(`Found ${allContracts.length} contracts.`);

  // 3. Fetch charges
  const allCharges = await db
    .select()
    .from(contractCharge)
    .where(and(eq(contractCharge.org_id, orgId), sql`${contractCharge.deleted_at} IS NULL`));

  console.log(`Found ${allCharges.length} charges:`, allCharges.map(c => ({
    component: c.component,
    rate: c.rate,
    qty: c.quantity_basis,
    rate_period: c.rate_period
  })));

  // Calculate monthly rent
  let totalMonthlyRent = 0;
  for (const ch of allCharges) {
    if (ch.component === "base_rent" || ch.invoice_group === "rent") {
      const rate = parseFloat(ch.rate || "0");
      const qty = parseFloat(ch.quantity_basis || "1");
      const monthly = ch.rate_period === "year" ? (rate * qty) / 12 : rate * qty;
      totalMonthlyRent += monthly;
    }
  }

  console.log(`Total Monthly Rent calculated: INR ${totalMonthlyRent}`);
}

main().catch(console.error);
