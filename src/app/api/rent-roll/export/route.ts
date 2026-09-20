import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "rentroll"; // "rentroll" | "invoices" | "collections" | "aging"
    const db = getRentRollDb();

    if (type === "rentroll") {
      const headers = [
        "Property ID", "Property Name", "Floor", "Unit / Space",
        "Tenant Code", "Tenant Trade Name", "Lease Code",
        "Start Date", "End Date", "Lock-in End Date", "Notice Days",
        "Chargeable Area (Sq Ft)", "Carpet Area (Sq Ft)",
        "Base Monthly Rent (INR)", "Base Rent PSF",
        "CAM Rate PSF", "CAM Monthly (INR)", "Utility Monthly (INR)",
        "GST Amount (INR)", "Total Monthly Gross (INR)", "Annual Gross (INR)",
        "Deposit Required (INR)", "Deposit Paid (INR)",
        "Escalation %", "Escalation Freq (Mos)", "Next Escalation Date",
        "Status", "Renewal Status"
      ];

      const rows = db.leases.map(l => [
        `"${l.propertyId}"`, `"${l.propertyName}"`, `"${l.floorNumber}"`, `"${l.unitNumber}"`,
        `"${l.tenantId}"`, `"${l.tenantName}"`, `"${l.leaseCode}"`,
        `"${l.startDate}"`, `"${l.endDate}"`, `"${l.lockInEndDate}"`, l.noticePeriodDays,
        l.chargeableArea, l.carpetArea,
        l.monthlyRent, l.baseRentPsf,
        l.camRatePsf, l.camMonthly, l.utilityFixedMonthly,
        Math.round((l.monthlyRent + l.camMonthly + l.utilityFixedMonthly) * 0.18),
        l.totalMonthlyGross, l.annualRentGross,
        l.securityDepositAmount, l.securityDepositPaid,
        l.escalationPct, l.escalationFrequencyMonths, `"${l.nextEscalationDate}"`,
        `"${l.status}"`, `"${l.renewalStatus}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="officex_rent_roll_master_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (type === "invoices") {
      const headers = [
        "Invoice No", "Tenant Name", "Property", "Lease Code",
        "Invoice Date", "Due Date", "Base Rent (INR)", "CAM (INR)", "Utility (INR)",
        "Subtotal", "GST Amount", "Gross Total", "TDS Deducted", "Net Payable", "Amount Paid", "Balance Due", "Status"
      ];

      const rows = db.invoices.map(i => [
        `"${i.invoiceNumber}"`, `"${i.tenantName}"`, `"${i.propertyName}"`, `"${i.leaseCode}"`,
        `"${i.invoiceDate}"`, `"${i.dueDate}"`, i.baseRent, i.camCharges, i.utilityCharges,
        i.subtotal, i.gstAmount, i.grossTotal, i.tdsDeducted, i.netPayable, i.amountPaid, i.balanceDue, `"${i.status}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="officex_invoices_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (type === "collections") {
      const headers = [
        "Receipt No", "Invoice No", "Tenant Name", "Property",
        "Payment Date", "Payment Mode", "Reference / UTR", "Amount Received (INR)", "TDS Deducted", "Net Credited"
      ];

      const rows = db.collections.map(c => [
        `"${c.receiptNumber}"`, `"${c.invoiceNumber || ''}"`, `"${c.tenantName}"`, `"${c.propertyName}"`,
        `"${c.paymentDate}"`, `"${c.paymentMode}"`, `"${c.referenceNumber}"`, c.amountReceived, c.tdsDeducted, c.netCredited
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="officex_collections_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (type === "escalations") {
      const headers = [
        "Escalation ID", "Lease Code", "Tenant Name", "Property",
        "Escalation Due Date", "Previous Base Rent (INR)", "Escalation %", "Monthly Increase (INR)", "New Base Rent (INR)", "Status", "Applied At", "Applied By"
      ];

      const rows = db.escalations.map(e => [
        `"${e.id}"`, `"${e.leaseCode}"`, `"${e.tenantName}"`, `"${e.propertyName}"`,
        `"${e.escalationDate}"`, e.previousRent, e.escalationPct, e.calculatedIncrease, e.newRent, `"${e.status}"`, `"${e.appliedAt || ''}"`, `"${e.appliedBy || ''}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="officex_escalations_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (type === "aging") {
      const asOf = new Date();
      const headers = [
        "Invoice No", "Tenant Name", "Property", "Due Date",
        "Gross Total (INR)", "TDS Deducted (INR)", "Amount Paid (INR)", "Balance Due (INR)",
        "Days Overdue", "Aging Bucket", "Status"
      ];

      const rows = db.invoices.map(i => {
        const dueDate = new Date(i.dueDate);
        const diffDays = Math.floor((asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        let bucket = "Current";
        if (diffDays > 90) bucket = "90+ Days";
        else if (diffDays > 60) bucket = "61-90 Days";
        else if (diffDays > 30) bucket = "31-60 Days";
        else if (diffDays > 0) bucket = "0-30 Days";

        return [
          `"${i.invoiceNumber}"`, `"${i.tenantName}"`, `"${i.propertyName}"`, `"${i.dueDate}"`,
          i.grossTotal, i.tdsDeducted, i.amountPaid, i.balanceDue,
          Math.max(0, diffDays), `"${bucket}"`, `"${i.status}"`
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="officex_aging_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (error: any) {
    console.error("GET /api/rent-roll/export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
