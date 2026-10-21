import { db } from "../src/db";
import { invoice, occupant } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  const invs = await db
    .select({
      id: invoice.id,
      number: invoice.invoice_number,
      gross: invoice.gross_total,
      baseRent: invoice.base_rent,
      status: invoice.status,
    })
    .from(invoice);
  console.log("Invoices in DB:", invs);
}

main().catch(console.error);
