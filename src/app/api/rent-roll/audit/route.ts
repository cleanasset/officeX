import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leaseId = searchParams.get("leaseId");
    const db = getRentRollDb();

    let logs = db.auditLogs;
    if (leaseId) {
      logs = logs.filter(l => l.leaseId === leaseId);
    }

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET /api/rent-roll/audit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
