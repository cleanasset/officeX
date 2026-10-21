import { db } from "../src/db";
import { space, building, property, contract, occupant, contractCharge } from "../src/db/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";

async function main() {
  console.log("=== TESTING STACKING PLAN QUERY ===");
  const rawSpaces = await db
    .select({
      space_id: space.id,
      space_code: space.space_code,
      space_name: space.space_name,
      floor_name: space.floor_name,
      chargeable_area_sqft: space.chargeable_area_sqft,
      occupancy_status: space.occupancy_status,
      building_name: building.building_name,
      contract_id: contract.id,
      contract_code: contract.contract_code,
      occupant_name: occupant.occupant_name,
      base_rate: contractCharge.rate,
    })
    .from(space)
    .leftJoin(building, eq(space.building_id, building.id))
    .leftJoin(
      contract,
      and(
        eq(contract.space_id, space.id),
        sql`${contract.contract_status} IN ('active', 'notice_served', 'holding_over')`
      )
    )
    .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
    .leftJoin(
      contractCharge,
      and(
        eq(contractCharge.contract_id, contract.id),
        eq(contractCharge.component, "base_rent"),
        sql`${contractCharge.deleted_at} IS NULL`
      )
    )
    .where(sql`${space.deleted_at} IS NULL`);

  console.log("Stacking spaces result:", rawSpaces);
}

main().catch(console.error);
