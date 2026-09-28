import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, MeterReadingEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const periodMonth = searchParams.get("periodMonth");
    const meterType = searchParams.get("meterType");

    const db = getRentRollDb();
    let readings = db.meterReadings || [];

    if (propertyId && propertyId !== "ALL") {
      readings = readings.filter(r => r.propertyId === propertyId);
    }
    if (periodMonth && periodMonth !== "ALL") {
      readings = readings.filter(r => r.periodMonth === periodMonth);
    }
    if (meterType && meterType !== "ALL") {
      readings = readings.filter(r => r.meterType === meterType);
    }

    return NextResponse.json(readings);
  } catch (error: any) {
    console.error("GET /api/rent-roll/meter-readings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();

    // Batch Approve
    if (body.action === "batch_approve") {
      const ids: string[] = body.readingIds || [];
      db.meterReadings.forEach(r => {
        if (ids.includes(r.id)) {
          r.status = "approved";
        }
      });
      saveRentRollDb(db);
      recordAuditLog({
        entityName: "MeterReading",
        action: "BATCH_APPROVE",
        newValues: { count: ids.length },
        changedBy: "Utility Billing Officer"
      });
      return NextResponse.json({ success: true, message: `Approved ${ids.length} meter readings` });
    }

    // Add new reading
    const {
      propertyId,
      propertyName,
      spaceId,
      unitNumber,
      tenantId,
      tenantName,
      meterType = "electricity_grid",
      meterNumber,
      readingDate = new Date().toISOString().split("T")[0],
      periodMonth = "2026-10",
      previousReading = 0,
      currentReading = 0,
      multiplier = 1,
      tariffPerUnit = 11.50
    } = body;

    const prev = Number(previousReading);
    const curr = Number(currentReading);
    const mult = Number(multiplier) || 1;
    const tariff = Number(tariffPerUnit) || 11.50;
    const consumption = Math.max(0, (curr - prev) * mult);
    const totalCharge = Math.round(consumption * tariff);

    const newReading: MeterReadingEntity = {
      id: `MTR-${Date.now()}`,
      orgId: db.organization.id,
      propertyId: propertyId || db.properties[0]?.id || "PROP-DEFAULT",
      propertyName: propertyName || db.properties[0]?.name || "Commercial Building",
      spaceId: spaceId || "SPACE-DEF",
      unitNumber: unitNumber || "Unit General",
      tenantId: tenantId || "TEN-GEN",
      tenantName: tenantName || "General Occupant",
      meterType: meterType as any,
      meterNumber: meterNumber || `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
      readingDate,
      periodMonth,
      previousReading: prev,
      currentReading: curr,
      multiplier: mult,
      consumption,
      tariffPerUnit: tariff,
      totalCharge,
      status: "approved",
      createdAt: new Date().toISOString()
    };

    if (!db.meterReadings) db.meterReadings = [];
    db.meterReadings.unshift(newReading);

    recordAuditLog({
      entityName: "MeterReading",
      action: "RECORD_READING",
      newValues: { meterNumber: newReading.meterNumber, consumption, totalCharge },
      changedBy: "Utility Billing Officer"
    });

    saveRentRollDb(db);

    return NextResponse.json(newReading, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/meter-readings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
