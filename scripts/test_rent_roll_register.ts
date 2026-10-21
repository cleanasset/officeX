import { db } from "../src/db";
import { contract, contractCharge, occupant, space, building, property } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("=== TESTING RENT ROLL REGISTER QUERY ===");
  try {
    const orgRes = await db.execute(sql.raw(`SELECT * FROM organization LIMIT 1`));
    console.log("Org:", orgRes.rows[0]);
    const orgId = orgRes.rows[0]?.id;

    if (!orgId) {
      console.log("No organization found!");
      return;
    }

    const spaceRaw = await db.execute(sql.raw(`SELECT * FROM space LIMIT 1`));
    console.log("Raw space:", spaceRaw.rows[0]);

    const contractRaw = await db.execute(sql.raw(`SELECT * FROM contract LIMIT 1`));
    console.log("Raw contract:", contractRaw.rows[0]);

    const chargeRaw = await db.execute(sql.raw(`SELECT * FROM contract_charge LIMIT 1`));
    console.log("Raw contract_charge:", chargeRaw.rows[0]);

  } catch (err: any) {
    console.error("Error running test:", err);
  }
}

main().catch(console.error);
