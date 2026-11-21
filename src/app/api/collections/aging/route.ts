import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { calculateAgingReport } from "@/lib/rent-roll/payments/aging-service";

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot view aging collections reports" }, { status: 403 });
    }

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
