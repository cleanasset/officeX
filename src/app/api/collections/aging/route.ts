import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { calculateAgingReport } from "@/lib/rent-roll/payments/aging-service";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const asOfDate = searchParams.get("as_of_date") || undefined;

    const report = await calculateAgingReport(auth.orgId, auth.clientAccountId, asOfDate);

    return NextResponse.json({
      success: true,
      ...report,
      data: report,
    });
  } catch (err: any) {
    console.error("Aging report failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
