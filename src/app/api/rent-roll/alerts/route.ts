import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties.filter(p => {
      const lower = (p.name || "").toLowerCase().trim();
      return lower !== "fortune sky" && lower !== "apex horizon tower" && lower !== "signature tower b";
    });

    if (ownerEmail) {
      properties = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
    } else if (!isDemo) {
      properties = [];
    }

    const validPropIds = new Set(properties.map(p => p.id));
    const alerts = (db.alerts || []).filter(a => !a.propertyId || validPropIds.has(a.propertyId));

    return NextResponse.json(alerts);
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
