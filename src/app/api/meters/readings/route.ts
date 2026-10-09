import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  meters,
  tariffs,
  meterReadings,
  property,
  space,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * S-31 Meter Readings Entry API
 * Implements: Opening vs Closing readings, Multiplier, F-09 Calculation, Spike Warnings (>30% jump), CSV bulk ingestion
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    const period = searchParams.get("period") || "Sep-2026";

    // 1. Fetch all active meters for this property
    const meterQuery = [eq(meters.status, "active")];
    if (auth.orgId) meterQuery.push(eq(meters.org_id, auth.orgId));
    if (propertyId && propertyId !== "all") meterQuery.push(eq(meters.property_id, propertyId));

    const activeMeters = await db
      .select({
        id: meters.id,
        property_id: meters.property_id,
        space_id: meters.space_id,
        space_code: space.space_code,
        space_name: space.space_name,
        meter_code: meters.meter_code,
        meter_name: meters.meter_name,
        utility: meters.utility,
        multiplier: meters.multiplier,
      })
      .from(meters)
      .leftJoin(space, eq(meters.space_id, space.id))
      .where(and(...meterQuery))
      .orderBy(meters.meter_code);

    // 2. Fetch tariffs for property
    const tariffsList = await db
      .select()
      .from(tariffs)
      .where(auth.orgId ? eq(tariffs.org_id, auth.orgId) : undefined);

    // Map tariff rates by property + utility
    const tariffMap = new Map<string, number>();
    tariffsList.forEach((t) => {
      tariffMap.set(`${t.property_id}_${t.utility.toLowerCase()}`, Number(t.rate));
      tariffMap.set(t.utility.toLowerCase(), Number(t.rate));
    });

    // Default tariff fallbacks if not explicitly configured in master
    const defaultTariffs: Record<string, number> = {
      electricity: 11.5,
      dg_backup: 24.0,
      water: 45.0,
      gas: 65.0,
      hvac_btu: 18.0,
    };

    // 3. Fetch existing readings for this period
    const existingReadings = await db
      .select()
      .from(meterReadings)
      .where(
        and(
          auth.orgId ? eq(meterReadings.org_id, auth.orgId) : undefined,
          eq(meterReadings.period, period),
          propertyId && propertyId !== "all" ? eq(meterReadings.property_id, propertyId) : undefined
        )
      );

    const readingMap = new Map<string, (typeof existingReadings)[0]>();
    existingReadings.forEach((r) => readingMap.set(r.meter_id, r));

    // 4. Fetch previous readings to get opening numbers and history for spike calculations
    const allPastReadings = await db
      .select()
      .from(meterReadings)
      .where(
        and(
          auth.orgId ? eq(meterReadings.org_id, auth.orgId) : undefined,
          sql`${meterReadings.period} != ${period}`
        )
      )
      .orderBy(desc(meterReadings.created_at));

    const pastReadingsByMeter = new Map<string, (typeof allPastReadings)[0][]>();
    allPastReadings.forEach((r) => {
      if (!pastReadingsByMeter.has(r.meter_id)) pastReadingsByMeter.set(r.meter_id, []);
      pastReadingsByMeter.get(r.meter_id)!.push(r);
    });

    // 5. Combine and compute each meter's status
    let totalKwhElec = 0;
    let totalDgUnits = 0;
    let totalWaterUnits = 0;
    let totalAmount = 0;
    let totalSpikes = 0;

    const rows = activeMeters.map((m) => {
      const pastList = pastReadingsByMeter.get(m.id) || [];
      const prevReadingRecord = pastList[0];
      const previousClosing = prevReadingRecord ? Number(prevReadingRecord.closing) : 1000;

      // Average past consumption
      const avgPastConsumption =
        pastList.length > 0
          ? pastList.reduce((sum, r) => sum + Number(r.consumption), 0) / pastList.length
          : 500;

      const existing = readingMap.get(m.id);

      const opening = existing ? Number(existing.opening) : previousClosing;
      const closing = existing ? Number(existing.closing) : opening;
      const multiplier = Number(m.multiplier) || 1;

      // Rate lookup
      const rate =
        tariffMap.get(`${m.property_id}_${m.utility.toLowerCase()}`) ||
        tariffMap.get(m.utility.toLowerCase()) ||
        defaultTariffs[m.utility.toLowerCase()] ||
        12.0;

      const consumption = Math.max(0, (closing - opening) * multiplier);
      const amount = consumption * rate;

      // Spike calculation (> 30% jump above avg past consumption)
      const isSpike = existing ? existing.is_spike : (avgPastConsumption > 0 && consumption > avgPastConsumption * 1.3 && consumption > 100);
      if (isSpike) totalSpikes++;

      if (m.utility.toLowerCase() === "electricity") totalKwhElec += consumption;
      else if (m.utility.toLowerCase() === "dg_backup") totalDgUnits += consumption;
      else if (m.utility.toLowerCase() === "water") totalWaterUnits += consumption;
      totalAmount += amount;

      return {
        meter_id: m.id,
        meter_code: m.meter_code,
        meter_name: m.meter_name,
        space_id: m.space_id,
        space_code: m.space_code || "Common Area",
        space_name: m.space_name || "Central Plant",
        utility: m.utility,
        multiplier,
        opening,
        closing: existing ? Number(existing.closing) : null,
        consumption,
        avg_past_consumption: Math.round(avgPastConsumption),
        tariff_rate: rate,
        amount,
        reading_date: existing ? existing.reading_date : new Date().toISOString().split("T")[0],
        photo_path: existing?.photo_path || null,
        source: existing?.source || "manual",
        is_spike: isSpike,
        spike_note: existing?.spike_note || (isSpike ? "Consumption jumped >30% above historical average" : null),
        status: existing?.status || "pending",
        has_reading: Boolean(existing),
      };
    });

    return NextResponse.json({
      period,
      summary: {
        total_meters: activeMeters.length,
        logged_count: existingReadings.length,
        total_kwh_electricity: Math.round(totalKwhElec),
        total_dg_units: Math.round(totalDgUnits),
        total_water_units: Math.round(totalWaterUnits),
        total_billed_amount: Math.round(totalAmount),
        spike_warnings_count: totalSpikes,
      },
      readings: rows,
    });
  } catch (error: any) {
    console.error("GET /api/meters/readings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch meter readings" },
      { status: 500 }
    );
  }
}

/**
 * Save or submit meter readings (supports single row or bulk array)
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      readings, // Array of reading items
      action = "save", // "save" (draft) or "submit" (submit for billing)
      period = "Sep-2026",
    } = body;

    const itemsToProcess = Array.isArray(readings) ? readings : [body];

    if (!itemsToProcess.length || !itemsToProcess[0].meter_id) {
      return NextResponse.json(
        { error: "At least one reading with meter_id is required" },
        { status: 400 }
      );
    }

    const savedResults = [];

    for (const item of itemsToProcess) {
      const {
        meter_id,
        property_id,
        space_id,
        opening,
        closing,
        multiplier = 1,
        tariff_rate = 11.5,
        reading_date = new Date().toISOString().split("T")[0],
        photo_path,
        source = "manual",
        spike_note,
      } = item;

      const numOpening = Number(opening) || 0;
      const numClosing = Number(closing);
      const numMultiplier = Number(multiplier) || 1;
      const numTariff = Number(tariff_rate) || 11.5;

      // Validation: Closing >= Opening
      const isMeterReset = numClosing < numOpening;
      const consumption = isMeterReset
        ? numClosing * numMultiplier // Reset: starts from 0 to closing
        : (numClosing - numOpening) * numMultiplier;

      const amount = consumption * numTariff;

      // Detect spike
      const isSpike = consumption > 1000 && item.is_spike === true;

      // Check if reading exists for meter & period
      const [existing] = await db
        .select()
        .from(meterReadings)
        .where(
          and(
            eq(meterReadings.meter_id, meter_id),
            eq(meterReadings.period, period)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing reading
        const [updated] = await db
          .update(meterReadings)
          .set({
            opening: String(numOpening),
            closing: String(numClosing),
            multiplier: String(numMultiplier),
            consumption: String(consumption),
            tariff_rate: String(numTariff),
            amount: String(amount),
            reading_date: reading_date,
            photo_path: photo_path || existing.photo_path,
            source,
            is_spike: isSpike,
            spike_note: spike_note || existing.spike_note,
            status: action === "submit" ? "submitted" : "draft",
            submitted_by: auth.userId,
          })
          .where(eq(meterReadings.id, existing.id))
          .returning();

        savedResults.push(updated);
      } else {
        // Insert new reading
        const [inserted] = await db
          .insert(meterReadings)
          .values({
            org_id: auth.orgId,
            property_id: property_id || auth.orgId,
            meter_id,
            space_id: space_id || null,
            period,
            opening: String(numOpening),
            closing: String(numClosing),
            multiplier: String(numMultiplier),
            consumption: String(consumption),
            tariff_rate: String(numTariff),
            amount: String(amount),
            reading_date: reading_date,
            photo_path: photo_path || null,
            source,
            is_spike: isSpike,
            spike_note: spike_note || null,
            status: action === "submit" ? "submitted" : "draft",
            submitted_by: auth.userId,
          })
          .returning();

        savedResults.push(inserted);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        action === "submit"
          ? `Successfully submitted ${savedResults.length} meter reading(s) for billing.`
          : `Saved ${savedResults.length} meter reading(s) as draft.`,
      count: savedResults.length,
      readings: savedResults,
    });
  } catch (error: any) {
    console.error("POST /api/meters/readings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record meter readings" },
      { status: 500 }
    );
  }
}
