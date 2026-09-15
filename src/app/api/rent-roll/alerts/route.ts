import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const db = getRentRollDb();
    return NextResponse.json(db.alerts);
  } catch (error: any) {
    console.error("GET /api/rent-roll/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { alertId, markAllRead } = body;
    const db = getRentRollDb();

    if (markAllRead) {
      db.alerts.forEach(a => a.isRead = true);
    } else if (alertId) {
      const target = db.alerts.find(a => a.id === alertId);
      if (target) target.isRead = true;
    }

    saveRentRollDb(db);
    return NextResponse.json({ success: true, alerts: db.alerts });
  } catch (error: any) {
    console.error("PATCH /api/rent-roll/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
