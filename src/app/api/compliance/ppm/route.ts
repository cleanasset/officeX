import { NextResponse } from "next/server";
import { getComplianceDb, saveComplianceDb } from "@/lib/compliance-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const db = getComplianceDb();
    let schedule = db.ppmSchedule;

    if (category && category !== "All") {
      schedule = schedule.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Compute stats
    let totalTasks = 0;
    let doneTasks = 0;
    let overdueTasks = 0;
    let inProgressTasks = 0;
    let scheduledTasks = 0;

    for (const asset of db.ppmSchedule) {
      for (const val of Object.values(asset.schedule)) {
        totalTasks++;
        if (val === "done") doneTasks++;
        else if (val === "overdue") overdueTasks++;
        else if (val === "progress") inProgressTasks++;
        else if (val === "sched") scheduledTasks++;
      }
    }

    const onSchedulePct = totalTasks > 0 ? Math.round(((doneTasks + inProgressTasks) / totalTasks) * 100) : 100;

    return NextResponse.json({
      property: db.property,
      schedule,
      stats: {
        totalTasks,
        doneTasks,
        overdueTasks,
        inProgressTasks,
        scheduledTasks,
        onSchedulePct
      }
    });
  } catch (error: any) {
    console.error("GET /api/compliance/ppm error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { assetId, week, status } = body;

    const db = getComplianceDb();
    const assetIndex = db.ppmSchedule.findIndex(a => a.assetId === assetId);
    if (assetIndex === -1) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    db.ppmSchedule[assetIndex].schedule[week] = status;
    saveComplianceDb(db);

    return NextResponse.json({ success: true, asset: db.ppmSchedule[assetIndex] });
  } catch (error: any) {
    console.error("PATCH /api/compliance/ppm error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
