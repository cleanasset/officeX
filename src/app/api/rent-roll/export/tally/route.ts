import { NextRequest, NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { generateTallyPrimeXml } from "@/lib/rent-roll-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId") || "ALL";
    const billingEntityId = searchParams.get("billingEntityId") || "ALL";

    const db = getRentRollDb();

    let invoices = db.invoices || [];
    let collections = db.collections || [];
    let notes = db.adjustmentNotes || [];

    if (propertyId && propertyId !== "ALL") {
      invoices = invoices.filter(i => i.propertyId === propertyId);
      const invoiceIds = new Set(invoices.map(i => i.id));
      notes = notes.filter(n => invoiceIds.has(n.invoiceId));
    }

    if (billingEntityId && billingEntityId !== "ALL") {
      invoices = invoices.filter(i => i.billingEntityId === billingEntityId);
    }

    // Prepare data payload for Tally Prime
    const company = db.billingEntities.find(be => be.id === billingEntityId) || db.billingEntities[0] || {
      legalName: db.organization.name || "Apex Asset Management India Pvt Ltd"
    };

    const xmlContent = generateTallyPrimeXml({
      companyName: company.tradeName || company.legalName,
      invoices: invoices.map(i => ({
        invoiceNumber: i.invoiceNumber,
        invoiceDate: i.invoiceDate,
        tenantName: i.tenantName,
        baseRent: i.baseRent,
        camCharges: i.camCharges,
        gstAmount: i.gstAmount,
        grossTotal: i.grossTotal,
        placeOfSupply: "Maharashtra"
      })),
      collections: collections.map(c => ({
        receiptNumber: c.receiptNumber,
        paymentDate: c.paymentDate,
        tenantName: c.tenantName,
        amountReceived: c.amountReceived,
        tdsDeducted: c.tdsDeducted,
        paymentMode: c.paymentMode,
        referenceNumber: c.referenceNumber,
        bankAccount: c.bankAccount
      })),
      adjustmentNotes: notes.map(n => ({
        noteNumber: n.noteNumber,
        noteType: n.noteType,
        issuedDate: n.issuedDate,
        reason: n.reason,
        amount: n.amount,
        gstAmount: n.gstAmount,
        totalAdjustment: n.totalAdjustment,
        invoiceNumber: n.invoiceId
      }))
    });

    return new Response(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="OFFICEX_Tally_Prime_Vouchers_${Date.now()}.xml"`
      }
    });
  } catch (error: any) {
    console.error("Error generating Tally Prime XML:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
