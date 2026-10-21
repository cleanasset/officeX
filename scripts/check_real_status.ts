import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=== CHECKING REAL DATABASE COUNTS ===");
  const tables = [
    "organization",
    "property",
    "building",
    "space",
    "contract",
    "occupant",
    "contract_charge",
    "contract_escalation",
    "invoice",
    "ticket",
    "vendor",
    "rfq",
    "work_order"
  ];

  console.log("\n=== ALL EXISTING TABLES AND THEIR ROW COUNTS ===");
  try {
    const res = await db.execute(sql.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name
    `));
    
    for (const row of res.rows as any[]) {
      const t = row.table_name;
      try {
        const countRes = await db.execute(sql.raw(`SELECT count(*) as cnt FROM "${t}"`));
        const cnt = Number(countRes.rows[0].cnt);
        if (cnt > 0) {
          console.log(`[HAS DATA] ${t}: ${cnt} rows`);
        } else {
          console.log(`[EMPTY] ${t}: 0 rows`);
        }
      } catch (err: any) {
        console.log(`[ERROR] ${t}: ${err.message}`);
      }
    }
  } catch (e: any) {
    console.error("Error fetching tables:", e.message);
  }
}

main().catch(console.error);
