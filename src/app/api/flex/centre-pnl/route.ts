import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { calculateCentrePnL } from "@/lib/rent-roll/flex/centre-pnl";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id") || undefined;

    const pnlList = await calculateCentrePnL(auth.orgId, propertyId);

    return NextResponse.json({
      success: true,
      count: pnlList.length,
      centres: pnlList,
      data: pnlList,
    });
  } catch (err: any) {
    console.error("Centre P&L error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
