import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  const orgCols = await db.execute(sql.raw(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'organizations'
  `));
  console.log("columns of organizations:", orgCols.rows);

  const singleOrg = await db.execute(sql.raw(`SELECT * FROM organization LIMIT 1`));
  console.log("single org:", singleOrg.rows[0]);
}

main().catch(console.error);
