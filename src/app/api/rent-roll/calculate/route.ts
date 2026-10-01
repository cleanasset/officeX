import { NextRequest, NextResponse } from "next/server";
import { calculateContractSummary, calculateLoadingPct, calculateGSTSplit, generateEscalationSchedule } from "@/lib/rent-roll/calculations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, contractInput, asOfDate, escalationParams, gstParams, loadingParams } = body;

    if (action === "escalation_schedule") {
      const { initialRate, commencementDate, expiryDate, escalationPct, cycleMonths, compounding, escalationType, totalQuantity } = escalationParams;
      const schedule = generateEscalationSchedule(
        initialRate,
        commencementDate,
        expiryDate,
        escalationPct,
        cycleMonths,
        compounding,
        escalationType,
        totalQuantity
      );
      return NextResponse.json({ success: true, schedule });
    }

    if (action === "gst_split") {
      const { taxableAmount, gstRatePct, billingGstin, propertyStateCode } = gstParams;
      const split = calculateGSTSplit(taxableAmount, gstRatePct, billingGstin, propertyStateCode);
      return NextResponse.json({ success: true, split });
    }

    if (action === "loading") {
      const { chargeableArea, carpetArea } = loadingParams;
      const loadingPct = calculateLoadingPct(chargeableArea, carpetArea);
      return NextResponse.json({ success: true, loadingPct });
    }

    // Default action: calculate full contract summary
    const summary = calculateContractSummary(contractInput, asOfDate);
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("Rent roll calculation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Calculation failed" }, { status: 400 });
  }
}
