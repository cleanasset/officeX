import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding written_off and disputed to invoice_status enum...");
  try {
    await db.execute(sql`ALTER TYPE "invoice_status" ADD VALUE IF NOT EXISTS 'written_off';`);
    console.log("written_off added to invoice_status");
  } catch (e: any) {
    console.error("error adding written_off:", e.message);
  }

  try {
    await db.execute(sql`ALTER TYPE "invoice_status" ADD VALUE IF NOT EXISTS 'disputed';`);
    console.log("disputed added to invoice_status");
  } catch (e: any) {
    console.error("error adding disputed:", e.message);
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
