import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, occupant, property, building, space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function parsePeriodToYyyyMm(periodStr: string): string {
  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const parts = (periodStr || "").toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(/\s+/);
  let year = "2026";
  let month = "10";
  for (const part of parts) {
    if (/^\d{4}$/.test(part)) year = part;
    const prefix = part.slice(0, 3);
    if (monthMap[prefix]) month = monthMap[prefix];
  }
  return `${year}-${month}`;
}

/**
 * §S-48 & §5.16: Tally XML / ERP Integration Export API
 * Generates Tally Prime compliant XML vouchers for Sales Invoices and Party Ledgers.
 * RR-26: Strictly queries real issued invoices from the active organization.
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Oct-2026";
    const yyyyMm = parsePeriodToYyyyMm(period);

    // 1. Fetch real issued invoices for this period and organization (RR-26: No fake data)
    const invoiceRecords = await db
      .select({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        totalAmount: invoice.gross_total,
        taxAmount: invoice.gst_amount,
        netAmount: invoice.subtotal,
        status: invoice.status,
        occupantName: occupant.occupant_name,
        occupantGstin: occupant.gst_number,
        occupantPan: occupant.pan_number,
        propertyName: property.property_name,
        propertyState: property.state,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .leftJoin(property, eq(invoice.property_id, property.id))
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          sql`${invoice.status} IN ('issued', 'partially_paid', 'paid')`,
          sql`to_char(COALESCE(${invoice.period_start}, ${invoice.invoice_date}), 'YYYY-MM') = ${yyyyMm}`
        )
      )
      .limit(100);

    const companyName = invoiceRecords[0]?.propertyName || "Commercial Property Portfolio";

    // 2. Build Tally XML Schema
    let vouchersXml = "";
    invoiceRecords.forEach((inv) => {
      const gross = Number(inv.totalAmount || 0);
      const net = Number(inv.netAmount || (gross / 1.18));
      const tax = gross - net;
      const halfTax = Math.round((tax / 2) * 100) / 100;
      const cgst = halfTax;
      const sgst = halfTax; // RR-26: CGST and SGST must match exactly!
      const cleanDate = (inv.invoiceDate || "2026-10-01").replace(/-/g, "");
      const stateName = inv.propertyState || "Delhi";

      vouchersXml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${cleanDate}</DATE>
            <EFFECTIVEDATE>${cleanDate}</EFFECTIVEDATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
            <REFERENCE>${inv.invoiceNumber}</REFERENCE>
            <PARTYLEDGERNAME>${escapeXml(inv.occupantName || "Commercial Tenant")}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <BASICBUYERNAME>${escapeXml(inv.occupantName || "Commercial Tenant")}</BASICBUYERNAME>
            <PARTYGSTIN>${inv.occupantGstin || ""}</PARTYGSTIN>
            <STATENAME>${escapeXml(stateName)}</STATENAME>

            <!-- Debit: Tenant Ledger (Full Invoice Total) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(inv.occupantName || "Commercial Tenant")}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${gross.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Commercial Rent Revenue (SAC 997212) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Commercial Rent Revenue (SAC 997212)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${net.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Output CGST 9% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${cgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Output SGST 9% -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sgst.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
    });

    const fullTallyEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    return new NextResponse(fullTallyEnvelope, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="officex_tally_sales_${period.toLowerCase()}.xml"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating Tally XML:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
