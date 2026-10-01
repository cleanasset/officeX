import { NextResponse } from "next/server";
import { getVisitorComplianceDb, saveVisitorComplianceDb, WatchlistEntity } from "@/lib/visitor-compliance-store";

export async function GET() {
  try {
    const db = getVisitorComplianceDb();
    return NextResponse.json({
      watchlist: db.watchlist || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, identifier, reason, riskLevel = "HIGH", flaggedBy = "Security Manager" } = body;

    if (!name || !identifier || !reason) {
      return NextResponse.json({ error: "Name, Identifier (Phone/Org), and Reason are required." }, { status: 400 });
    }

    const db = getVisitorComplianceDb();
    const newEntry: WatchlistEntity = {
      id: `WL-${Date.now()}`,
      name: name.trim(),
      identifier: identifier.trim(),
      reason: reason.trim(),
      riskLevel,
      activeFrom: new Date().toISOString().split("T")[0],
      status: "active",
      flaggedBy
    };

    db.watchlist.unshift(newEntry);
    saveVisitorComplianceDb(db);

    return NextResponse.json({
      success: true,
      message: "Entry added to active security watchlist.",
      entry: newEntry
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Watchlist entry ID is required." }, { status: 400 });
    }

    const db = getVisitorComplianceDb();
    const initialLen = db.watchlist.length;
    db.watchlist = db.watchlist.filter(w => w.id !== id);

    if (db.watchlist.length === initialLen) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    saveVisitorComplianceDb(db);
    return NextResponse.json({ success: true, message: "Watchlist entry removed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

