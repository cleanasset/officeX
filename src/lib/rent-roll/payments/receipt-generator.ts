import { db } from "@/db";
import {
  payment,
  payment_allocation,
  invoice,
  occupant,
  organization,
  client_account,
} from "@/db/rent-roll-schema";
import { eq, and } from "drizzle-orm";

export interface ReceiptData {
  receipt_number: string;
  payment_code: string;
  payment_ref: string;
  payment_date: string;
  payment_mode: string;
  total_amount_inr: number;
  occupant_name: string;
  occupant_pan?: string | null;
  occupant_gst?: string | null;
  space_code?: string | null;
  property_name?: string | null;
  org_name: string;
  client_name?: string | null;
  allocations: Array<{
    invoice_number: string;
    invoice_date: string;
    gross_total: number;
    allocated_amount: number;
    remaining_balance: number;
  }>;
}

export function generateReceiptHtml(data: ReceiptData): string {
  const allocationRows = data.allocations
    .map(
      (a) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-family: monospace; font-size: 13px;">${a.invoice_number}</td>
        <td style="padding: 10px; font-size: 13px;">${a.invoice_date}</td>
        <td style="padding: 10px; text-align: right; font-size: 13px;">₹${a.gross_total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: #047857; font-size: 13px;">₹${a.allocated_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px; text-align: right; font-size: 13px; color: ${a.remaining_balance > 0 ? '#b45309' : '#64748b'};">₹${a.remaining_balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt — ${data.receipt_number}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
        .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 24px; }
        .logo-box { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
        .receipt-badge { font-size: 12px; background: #ecfdf5; color: #065f46; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; border: 1px solid #a7f3d0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; font-size: 14px; }
        .info-label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
        .info-value { font-weight: 600; color: #0f172a; }
        .amount-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 40px; }
        th { background: #f1f5f9; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="logo-box">${data.org_name}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Managed Portfolio: ${data.client_name || "Enterprise Operations"}</div>
          </div>
          <div style="text-align: right;">
            <div class="receipt-badge">Official Receipt</div>
            <div style="font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 8px;">${data.receipt_number}</div>
            <div style="font-size: 12px; color: #64748b;">Date: ${data.payment_date}</div>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-label">Received From (Occupant)</div>
            <div class="info-value" style="font-size: 16px;">${data.occupant_name}</div>
            ${data.space_code ? `<div style="color: #475569; font-size: 13px; margin-top: 2px;">Space: ${data.space_code} (${data.property_name || ""})</div>` : ""}
            ${data.occupant_gst ? `<div style="color: #64748b; font-size: 12px;">GSTIN: ${data.occupant_gst}</div>` : ""}
          </div>
          <div>
            <div class="info-label">Payment Information</div>
            <div style="font-size: 13px;"><strong>Mode:</strong> ${data.payment_mode.replace(/_/g, " ").toUpperCase()}</div>
            <div style="font-size: 13px; font-family: monospace;"><strong>Ref / Txn ID:</strong> ${data.payment_ref}</div>
            <div style="font-size: 13px;"><strong>Payment Code:</strong> ${data.payment_code}</div>
          </div>
        </div>

        <div class="amount-card">
          <div style="font-size: 14px; font-weight: 600; color: #475569;">Total Amount Received</div>
          <div style="font-size: 26px; font-weight: 800; color: #047857;">₹${data.total_amount_inr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
        </div>

        <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px; color: #0f172a;">Invoice Allocation Schedule</div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th style="text-align: right;">Total Due</th>
              <th style="text-align: right;">Allocated</th>
              <th style="text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${allocationRows}
          </tbody>
        </table>

        <div class="footer">
          This is a computer-generated receipt authorized by OFFICEX Rent Roll Engine. No physical signature is required.
          <br>Generated on ${new Date().toUTCString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function generatePaymentReceipt(
  paymentId: string,
  orgId: string
): Promise<string> {
  const [pmt] = await db
    .select()
    .from(payment)
    .where(and(eq(payment.id, paymentId), eq(payment.org_id, orgId)));

  if (!pmt) throw new Error("Payment not found");

  const [occ] = await db
    .select()
    .from(occupant)
    .where(eq(occupant.id, pmt.occupant_id));

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, orgId));

  let clientName: string | null = null;
  if (pmt.client_account_id) {
    const [cli] = await db
      .select()
      .from(client_account)
      .where(eq(client_account.id, pmt.client_account_id));
    if (cli) clientName = cli.client_name;
  }

  const allocationsList = await db
    .select({
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      gross_total: invoice.gross_total,
      allocated_amount: payment_allocation.amount_allocated_inr,
      remaining_balance: invoice.balance_due,
    })
    .from(payment_allocation)
    .innerJoin(invoice, eq(payment_allocation.invoice_id, invoice.id))
    .where(eq(payment_allocation.payment_id, paymentId));

  const modeLabels: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    upi: "UPI",
    cash: "Cash",
    credit: "Credit Card",
    other: "Other",
  };

  return generateReceiptHtml({
    receipt_number: `RCP-${pmt.payment_code}`,
    payment_code: pmt.payment_code,
    payment_ref: pmt.payment_ref,
    payment_date: pmt.payment_date,
    payment_mode: modeLabels[pmt.payment_mode] || pmt.payment_mode,
    total_amount_inr: parseFloat(pmt.amount_inr),
    occupant_name: occ?.occupant_name || "Valued Occupant",
    occupant_pan: occ?.pan_number,
    occupant_gst: occ?.gst_number,
    org_name: org?.name || "OFFICEX Commercial Real Estate",
    client_name: clientName,
    allocations: allocationsList.map((a) => ({
      invoice_number: a.invoice_number,
      invoice_date: a.invoice_date,
      gross_total: parseFloat(a.gross_total || "0"),
      allocated_amount: parseFloat(a.allocated_amount || "0"),
      remaining_balance: parseFloat(a.remaining_balance || "0"),
    })),
  });
}

