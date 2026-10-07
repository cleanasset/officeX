import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Altering invoices table: dropping NOT NULL on lease_id and property_id...");
  try {
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "lease_id" DROP NOT NULL;`);
    console.log("lease_id is now nullable");
  } catch (e: any) {
    console.error("lease_id alter error:", e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "property_id" DROP NOT NULL;`);
    console.log("property_id is now nullable");
  } catch (e: any) {
    console.error("property_id alter error:", e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "base_rent" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "subtotal" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "gst_amount" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "net_payable" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "period_start" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "invoices" ALTER COLUMN "period_end" DROP NOT NULL;`);
    console.log("All legacy columns relaxed to nullable");
  } catch (e: any) {
    console.error("relax error:", e.message);
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
