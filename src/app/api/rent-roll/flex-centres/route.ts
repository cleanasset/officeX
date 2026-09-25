import { NextRequest, NextResponse } from "next/server";
import { getFlexCentres, updateFlexCentre, getRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";
import { calculateFlexCentrePnL } from "@/lib/rent-roll-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    let centres = getFlexCentres();
    if (propertyId && propertyId !== "ALL") {
      centres = centres.filter(c => c.propertyId === propertyId);
    }

    // Enrich each centre with real-time Section 13.7 P&L metrics (F-16, F-23, F-24)
    const enrichedCentres = centres.map(centre => {
      const extrasRevenue = (centre.meetingRoomHourlyRate * centre.meetingRoomHoursBilled) + 
                            (centre.parkingSlotRate * centre.parkingSlotsBilled);
      
      const pnlMetrics = calculateFlexCentrePnL(
        centre.members,
        extrasRevenue,
        centre.headLeaseMonthlyRent,
        centre.headLeaseCamMonthly,
        centre.directOpexMonthly,
        centre.seatCapacity
      );

      return {
        ...centre,
        metrics: pnlMetrics
      };
    });

    return NextResponse.json({
      success: true,
      centres: enrichedCentres
    });
  } catch (error: any) {
    console.error("Error fetching flex centres:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Centre ID is required" }, { status: 400 });
    }

    const updated = updateFlexCentre(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Flex centre not found" }, { status: 404 });
    }

    recordAuditLog({
      entityName: "FlexCentre",
      action: "UPDATE_FLEX_CENTRE",
      newValues: patch,
      changedBy: "Operator Manager"
    });

    const extrasRevenue = (updated.meetingRoomHourlyRate * updated.meetingRoomHoursBilled) + 
                          (updated.parkingSlotRate * updated.parkingSlotsBilled);
    
    const pnlMetrics = calculateFlexCentrePnL(
      updated.members,
      extrasRevenue,
      updated.headLeaseMonthlyRent,
      updated.headLeaseCamMonthly,
      updated.directOpexMonthly,
      updated.seatCapacity
    );

    return NextResponse.json({
      success: true,
      centre: {
        ...updated,
        metrics: pnlMetrics
      }
    });
  } catch (error: any) {
    console.error("Error updating flex centre:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
