import { NextResponse } from 'next/server';
import { getAllRfqs, getRfqById, createRfq, submitQuoteToRfq, awardRfq, RFQItem, RFQQuote } from "@/lib/rfq-store";

export type { RFQItem, RFQQuote };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const id = searchParams.get("id") || undefined;

  const rfqs = getAllRfqs({ category, city, id });
  const single = id ? getRfqById(id) : undefined;

  return NextResponse.json({
    success: true,
    count: rfqs.length,
    rfqs,
    rfq: single || (rfqs.length > 0 ? rfqs[0] : null)
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Action: Submit a vendor quotation on an existing RFQ
    if (data.action === "submit_quote") {
      if (!data.rfqId) {
        return NextResponse.json(
          { error: "Missing required rfqId to submit quotation." },
          { status: 400 }
        );
      }

      const result = submitQuoteToRfq(data.rfqId, {
        vendorName: data.vendorName || "TechServe Solutions",
        bidAmount: data.bidAmount || "₹3,80,000",
        timeline: data.timeline || "15 Days Mobilization",
        warranty: data.warranty || "12 Months OEM Warranty",
        notes: data.notes || "Official quotation submitted through OfficeX Marketplace."
      });

      if (!result) {
        return NextResponse.json(
          { error: `RFQ with ID ${data.rfqId} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          quote: result.quote,
          rfq: result.rfq,
          message: `Quotation of ${result.quote.bidAmount} successfully registered for ${result.rfq.id}. Status updated to Evaluating.`
        },
        { status: 201 }
      );
    }

    // 2. Action: Award RFQ and generate official Work Order & Escrow PO
    if (data.action === "award") {
      if (!data.rfqId || !data.vendorName) {
        return NextResponse.json(
          { error: "Missing required rfqId or vendorName to award contract." },
          { status: 400 }
        );
      }

      const result = awardRfq(
        data.rfqId,
        data.vendorName,
        data.auditNotes,
        data.milestoneSplit,
        data.escrowHold !== false
      );

      if (!result) {
        return NextResponse.json(
          { error: `RFQ with ID ${data.rfqId} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          rfq: result.rfq,
          workOrder: result.workOrder,
          message: `Contract officially awarded to ${data.vendorName}. Work Order ${result.workOrder.id} generated with Escrow PO.`
        },
        { status: 200 }
      );
    }

    // 3. Default: Create and publish a new RFQ to the marketplace
    const title = data.title;
    const property = data.property || data.propertyId || "Commercial Campus";
    const category = data.category || "MEP";
    const scopeOfWork = data.scope || data.scopeOfWork || "General Facility Works";

    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title." },
        { status: 400 }
      );
    }

    const newRfq = createRfq({
      title,
      property,
      category,
      subCategory: data.subCategory || "General Maintenance",
      scopeOfWork,
      desc: scopeOfWork,
      manpowerRequired: data.manpower ? parseInt(data.manpower) : 3,
      frequency: data.frequency || "Monthly",
      contractDuration: data.contractDuration || "1 Year",
      deadline: data.deadline || "2026-10-30"
    });

    return NextResponse.json(
      {
        success: true,
        rfq: newRfq,
        message: "RFQ published successfully and dispatched to verified vendor marketplace network."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing RFQ operation:", error);
    return NextResponse.json(
      { error: "Failed to process RFQ operation in marketplace database." },
      { status: 500 }
    );
  }
}
