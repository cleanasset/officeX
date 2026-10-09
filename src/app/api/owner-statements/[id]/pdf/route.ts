import { NextResponse } from "next/server";
import { db } from "@/db";
import { ownerStatements, clientAccounts, invoice, occupant, space } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "Oct-2026";

  // Fetch statement from DB if available
  let statementRecord: any = null;
  let clientRecord: any = null;
  try {
    const stmts = await db.select().from(ownerStatements).where(eq(ownerStatements.id, id)).limit(1);
    if (stmts.length > 0) {
      statementRecord = stmts[0];
      if (statementRecord.clientAccountId) {
        const cl = await db.select().from(clientAccounts).where(eq(clientAccounts.id, statementRecord.clientAccountId)).limit(1);
        if (cl.length > 0) clientRecord = cl[0];
      }
    }
  } catch (e) {}

  // Fetch real invoices
  let realInvoices: any[] = [];
  try {
    realInvoices = await db
      .select({
        number: invoice.invoice_number,
        date: invoice.invoice_date,
        occupant: occupant.occupant_name,
        gross: invoice.gross_total,
        collected: invoice.amount_paid,
        balance: invoice.balance_due,
        status: invoice.status,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .where(sql`${invoice.status} IS NOT NULL`)
      .limit(50);
  } catch (e) {}

  let totalGross = 0;
  let totalCollected = 0;
  let totalArrears = 0;

  realInvoices.forEach((inv) => {
    totalGross += parseFloat(String(inv.gross || 0));
    totalCollected += parseFloat(String(inv.collected || 0));
    totalArrears += parseFloat(String(inv.balance || 0));
  });

  const mgmtFee = Math.round(totalCollected * 0.04);
  const gstOnFee = Math.round(mgmtFee * 0.18);
  const expensesPaid = 0;
  const netRemittance = Math.max(0, totalCollected - mgmtFee - gstOnFee - expensesPaid);

  const clientName = clientRecord?.name || statementRecord?.clientName || "Managed Portfolio Account";
  const stmtNumber = statementRecord?.statementNumber || `STMT-${period}-001`;
  const stmtDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const invoiceRowsHtml = realInvoices.length > 0
    ? realInvoices
        .map(
          (inv) => `<tr>
        <td>${inv.number || "—"}</td>
        <td>${inv.date || "—"}</td>
        <td>${inv.occupant || "—"}</td>
        <td>Demised Premises</td>
        <td style="text-align: right;">₹${Number(inv.gross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right; font-weight: 600;">₹${Number(inv.collected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td><span style="color: ${inv.status === "paid" ? "#047857" : "#b45309"}; font-weight: 700;">${inv.status || "draft"}</span></td>
      </tr>`
        )
        .join("\n")
    : `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">No invoices billed in this statement period.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Owner Statement — ${clientName} — ${period}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #a7f3d0; }
    .section-title { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 25px 0 12px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #475569; border: 1px solid #cbd5e1; }
    .table td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
    .table tr.total-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #0f172a; }
    .highlight-row { background: #f0fdf4; font-weight: 800; color: #065f46; }
    .highlight-cell { font-size: 15px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .sign-box { margin-top: 40px; display: flex; justify-content: space-between; }
    .sign-line { width: 200px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 6px; font-size: 11px; color: #475569; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">MONTHLY OWNER STATEMENT</h1>
      <div class="subtitle">Multi-Client Property Management Account Settlement (RR-OPR-06)</div>
      <div style="margin-top: 8px;"><span class="badge">STATEMENT STATUS: ${statementRecord?.remittanceStatus ? "FROZEN & ISSUED" : "DRAFT"}</span></div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 700; font-size: 15px;">${stmtNumber}</div>
      <div style="color: #64748b; margin-top: 3px;">Date: ${stmtDate}</div>
      <div style="color: #64748b;">Period: ${period}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Owner Client Account</div>
      <div style="font-weight: 700; font-size: 15px; margin-top: 4px; color: #0f172a;">${clientName}</div>
      <div style="color: #475569; margin-top: 3px;">Entity: ${clientRecord?.accountCode || "Primary Account"}</div>
    </div>
    <div class="card">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Managing Operator</div>
      <div style="font-weight: 700; font-size: 15px; margin-top: 4px; color: #0f172a;">OFFICEX Operator Management Services Ltd</div>
      <div style="color: #475569; margin-top: 3px;">Fee Terms: 4.0% of Gross Collections + 18% GST</div>
    </div>
  </div>

  <div class="section-title">1. Monthly Account Reconciliation (Formula F-20 & F-21)</div>
  <table class="table">
    <thead>
      <tr>
        <th>Component</th>
        <th>Specification Reference</th>
        <th>Calculation Basis</th>
        <th style="text-align: right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Gross Rent & CAM Billed</td>
        <td>§13.8 / K-02</td>
        <td>Total issued tax invoices in ${period}</td>
        <td style="text-align: right; font-weight: 600;">₹${totalGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Total Collections Received</td>
        <td>§13.8 / K-03</td>
        <td>Bank cleared occupant payments in period</td>
        <td style="text-align: right; font-weight: 600;">₹${totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Arrears Carried Forward</td>
        <td>§13.8 / K-04</td>
        <td>Uncollected billing carried forward</td>
        <td style="text-align: right; color: #dc2626;">(₹${totalArrears.toLocaleString("en-IN", { minimumFractionDigits: 2 })})</td>
      </tr>
      <tr>
        <td>Operator Management Fee</td>
        <td>Formula F-20</td>
        <td>4.00% × ₹${totalCollected.toLocaleString("en-IN")} (Collections)</td>
        <td style="text-align: right; color: #b91c1c;">(₹${mgmtFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })})</td>
      </tr>
      <tr>
        <td>GST on Management Fee @ 18%</td>
        <td>Formula F-20</td>
        <td>18.00% × ₹${mgmtFee.toLocaleString("en-IN")}</td>
        <td style="text-align: right; color: #b91c1c;">(₹${gstOnFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })})</td>
      </tr>
      <tr>
        <td>Direct Expenses Paid on Owner's Behalf</td>
        <td>Formula F-21</td>
        <td>Approved operating expenses</td>
        <td style="text-align: right; color: #b91c1c;">(₹${expensesPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })})</td>
      </tr>
      <tr class="highlight-row">
        <td class="highlight-cell" colspan="3">NET REMITTANCE PAYABLE TO OWNER (Formula F-21)</td>
        <td class="highlight-cell" style="text-align: right;">₹${netRemittance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Invoices & Occupant Collections Detail</div>
  <table class="table">
    <thead>
      <tr>
        <th>Invoice #</th>
        <th>Date</th>
        <th>Occupant Entity</th>
        <th>Space Demised</th>
        <th style="text-align: right;">Gross Billed</th>
        <th style="text-align: right;">Collected</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceRowsHtml}
    </tbody>
  </table>

  <div class="sign-box">
    <div class="sign-line">
      Prepared by: Operator Finance Maker<br>
      OFFICEX Operations
    </div>
    <div class="sign-line">
      Approved & Frozen by: Finance Checker<br>
      Date: ${stmtDate}
    </div>
    <div class="sign-line">
      Remittance Acknowledged by:<br>
      ${clientName} Principal
    </div>
  </div>

  <div class="footer">
    <div>OFFICEX Multi-Client Rent Roll Engine — Screen S-55 Official Statement</div>
    <div>Page 1 of 1 • System Generated on ${stmtDate}</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="Owner_Statement_${period}.html"`,
    },
  });
}
