import { NextRequest, NextResponse } from "next/server";
import { getCamPools, executeCamTrueUpInStore, getRentRollDb, recordAuditLog, saveRentRollDb } from "@/lib/rent-roll-store";
import { calculateCamPoolTrueUp } from "@/lib/rent-roll-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId") || undefined;

    const pools = getCamPools(propertyId);
    const db = getRentRollDb();

    // Enrich each pool with live tenant share simulation
    const enrichedPools = pools.map(pool => {
      const activeLeases = (db.leases || []).filter(l => l.propertyId === pool.propertyId && l.status === "active");
      const tenantsInput = activeLeases.map(l => ({
        tenantId: l.tenantId,
        tenantName: l.tenantName,
        unitNumber: l.unitNumber,
        chargeableArea: l.chargeableArea,
        advanceCamBilled: Math.round((l.camMonthly || 0) * 12)
      }));

      const simulation = calculateCamPoolTrueUp(
        pool.propertyId,
        pool.propertyName,
        pool.fyYear,
        pool.totalBuildingArea,
        pool.actualCostTotal,
        tenantsInput
      );

      return {
        ...pool,
        simulation
      };
    });

    return NextResponse.json({
      success: true,
      pools: enrichedPools
    });
  } catch (error: any) {
    console.error("Error fetching CAM pools:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, poolId, categories, actualCostTotal } = body;

    const db = getRentRollDb();

    // 1. Execute True-Up
    if (action === "execute_true_up") {
      if (!poolId) {
        return NextResponse.json({ success: false, error: "poolId is required" }, { status: 400 });
      }

      const result = executeCamTrueUpInStore(poolId);

      recordAuditLog({
        entityName: "CamPool",
        action: "EXECUTE_CAM_TRUE_UP",
        newValues: { poolId, notesIssued: result.adjustmentNotes.length, variance: result.summary.netTrueUpVariance },
        changedBy: "Facility Manager & Commercial Auditor"
      });

      return NextResponse.json({
        success: true,
        message: `Successfully executed annual CAM true-up. Issued ${result.adjustmentNotes.length} statutory adjustment notes.`,
        summary: result.summary,
        adjustmentNotes: result.adjustmentNotes
      });
    }

    // 2. Update Pool Budget / Actuals
    if (action === "update_costs") {
      if (!poolId) {
        return NextResponse.json({ success: false, error: "poolId is required" }, { status: 400 });
      }

      const pool = (db.camPools || []).find(p => p.id === poolId);
      if (!pool) {
        return NextResponse.json({ success: false, error: "CAM Pool not found" }, { status: 404 });
      }

      if (categories) pool.categories = categories;
      if (actualCostTotal !== undefined) pool.actualCostTotal = actualCostTotal;

      saveRentRollDb(db);

      recordAuditLog({
        entityName: "CamPool",
        action: "UPDATE_CAM_ACTUALS",
        newValues: { poolId, actualCostTotal },
        changedBy: "FM Operations Lead"
      });

      return NextResponse.json({
        success: true,
        pool
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error managing CAM pool:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
