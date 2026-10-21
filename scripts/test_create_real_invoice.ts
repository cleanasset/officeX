import { db } from "../src/db";
import { contract, occupant, invoice, invoice_line } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("=== GENERATING REAL INVOICE FOR ACTIVE CONTRACT ===");
  const [c] = await db
    .select({
      contract: contract,
      occupant: occupant,
    })
    .from(contract)
    .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
    .limit(1);

  if (!c) {
    console.log("No contract found!");
    return;
  }

  console.log("Active contract:", c.contract.contract_code, "Occupant:", c.occupant?.occupant_name);

  const orgId = c.contract.org_id;
  const clientAccountId = c.contract.client_account_id;
  const contractId = c.contract.id;
  const occupantId = c.contract.occupant_id;

  const invNum = `INV-2026-27-0001`;
  const baseRentAmt = 1000000; // Rs 10 Lakh
  const camAmt = 250000; // Rs 2.5 Lakh
  const utilAmt = 35000; // Rs 35k utility
  const subtotal = baseRentAmt + camAmt + utilAmt;
  const gst = subtotal * 0.18;
  const gross = subtotal + gst;

  // Insert into invoices
  const [createdInv] = await db
    .insert(invoice)
    .values({
      org_id: orgId,
      client_account_id: clientAccountId,
      contract_id: contractId,
      occupant_id: occupantId,
      invoice_number: invNum,
      fy_year: "2026-27",
      invoice_date: "2026-10-21",
      due_date: "2026-10-31",
      base_rent: String(baseRentAmt),
      cam_charges: String(camAmt),
      utility_charges: String(utilAmt),
      subtotal: String(subtotal),
      gst_rate: "18.00",
      gst_amount: String(gst),
      gross_total: String(gross),
      net_payable: String(gross),
      balance_due: String(gross),
      status: "issued",
      notes: "Oct-2026 Monthly Commercial Lease Billing (Base Rent + CAM + Metered Utility)",
    } as any)
    .returning();

  console.log("Successfully created real invoice:", createdInv.id, createdInv.invoice_number);

  // Check count in DB
  const count = await db.execute(sql.raw(`SELECT count(*) as cnt FROM invoices`));
  console.log("Total invoices in DB:", count.rows[0].cnt);
}

main().catch(console.error);
