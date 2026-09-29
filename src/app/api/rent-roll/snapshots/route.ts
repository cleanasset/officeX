import { NextResponse } from "next/server";
import { getRentRollDb, getRentRollSnapshots, freezeMonthEndSnapshot, lockMonthEndSnapshot } from "@/lib/rent-roll-store";

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

    // Action: Lock Month-End Snapshot (RR-AUD-03, UAT-59, Table 76: POST /snapshots/{id}/lock)
    if (body.action === "lock") {
      const snapshotId = body.snapshotId || body.id;
      if (!snapshotId) {
        return NextResponse.json({ error: "snapshotId is required to lock snapshot" }, { status: 400 });
      }

      try {
        const lockedSnapshot = lockMonthEndSnapshot(snapshotId, body.lockedBy || "Commercial Auditor");
        return NextResponse.json({
          success: true,
          message: `Snapshot ${snapshotId} has been permanently locked and marked immutable. (RR-AUD-03, UAT-59)`,
          snapshot: lockedSnapshot
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
    }

    const {
      snapshotMonth,
      asOfDate,
      propertyId,
      frozenBy
    } = body;

    const today = new Date().toISOString().split("T")[0];
    const month = snapshotMonth || today.slice(0, 7);
    const asOf = asOfDate || today;

    try {
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
    } catch (err: any) {
      if (err.message && err.message.includes("locked and immutable")) {
        return NextResponse.json({
          error: err.message,
          code: "SNAPSHOT_LOCKED",
          remedy: "Corrections must be applied via adjustment notes (RR-AUD-03, UAT-59)."
        }, { status: 409 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("POST /api/rent-roll/snapshots error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

