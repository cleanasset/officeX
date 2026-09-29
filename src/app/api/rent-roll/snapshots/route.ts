import { NextResponse } from "next/server";
import { getRentRollDb, getRentRollSnapshots, freezeMonthEndSnapshot } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || undefined;
    const snapshots = getRentRollSnapshots(propertyId);
    return NextResponse.json({ snapshots });
  } catch (error: any) {
    console.error("GET /api/rent-roll/snapshots error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      snapshotMonth,
      asOfDate,
      propertyId,
      frozenBy
    } = body;

    const today = new Date().toISOString().split("T")[0];
    const month = snapshotMonth || today.slice(0, 7);
    const asOf = asOfDate || today;

    const snapshot = freezeMonthEndSnapshot({
      snapshotMonth: month,
      asOfDate: asOf,
      propertyId,
      frozenBy: frozenBy || "Finance Controller"
    });

    return NextResponse.json({
      success: true,
      message: `Month-end rent roll snapshot frozen successfully for ${month}.`,
      snapshot
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/snapshots error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
