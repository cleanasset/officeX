import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { property, client_account } from "@/db/rent-roll-schema";
import { getCleanPrefixFromName } from "@/app/api/rent-roll/properties/generate-code/route";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties: inputProps, orgId, simulateOnly } = body;

    if (!Array.isArray(inputProps) || inputProps.length === 0) {
      return NextResponse.json({ error: "Provide an array of properties" }, { status: 400 });
    }

    // Get all existing property codes globally from DB
    const existing = await db
      .select({ code: property.property_code })
      .from(property);
    const globalCodes = new Set(existing.map((e) => (e.code || "").toUpperCase()));

    const processed: any[] = [];

    for (const p of inputProps) {
      const name = (p.name || p.propertyName || "").trim();
      if (!name) continue;

      const prefix = getCleanPrefixFromName(name);

      // Find unique code for this property
      let candidate = "";
      let attempts = 0;
      while (attempts < 50) {
        const num = Math.floor(1000 + Math.random() * 9000);
        candidate = `${prefix}-${num}`;
        if (!globalCodes.has(candidate)) {
          globalCodes.add(candidate);
          break;
        }
        attempts++;
      }

      processed.push({
        name,
        propertyCode: candidate,
        city: p.city || "Bengaluru",
        state: p.state || "Karnataka",
        areaSqft: Number(p.areaSqft || p.totalAreaSqft || 25000),
        propertyType: p.propertyType || "Office",
      });
    }

    if (simulateOnly) {
      return NextResponse.json({
        success: true,
        simulation: true,
        totalProcessed: processed.length,
        properties: processed
      });
    }

    // Commit to database if target org is supplied
    if (orgId) {
      let clientAcc = await db
        .select({ id: client_account.id })
        .from(client_account)
        .where(eq(client_account.org_id, orgId))
        .limit(1);

      let clientAccountId = clientAcc[0]?.id;
      if (!clientAccountId) {
        const [newAcc] = await db.insert(client_account).values({
          org_id: orgId,
          name: "Primary Operational Entity"
        } as any).returning();
        clientAccountId = newAcc?.id;
      }

      for (const item of processed) {
        await db.insert(property).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          property_name: item.name,
          property_code: item.propertyCode,
          total_leasable_area_sqft: String(item.areaSqft),
          city: item.city,
          state: item.state,
          property_type: item.propertyType.toLowerCase() as any,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalProcessed: processed.length,
      properties: processed
    });
  } catch (err: any) {
    console.error("Bulk property management error:", err);
    return NextResponse.json({ error: "Failed to process bulk properties", details: err.message }, { status: 500 });
  }
}

