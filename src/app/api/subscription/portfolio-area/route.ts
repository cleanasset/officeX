import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, properties } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Universal Portfolio Area API
 * Calculates the exact cumulative leasable square footage across all active properties
 * for the current user/organization to enforce mandatory minimum subscription floors.
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const userEmail = (auth.userEmail || "").toLowerCase().trim();
    const isMasterAdmin = auth.role === "super_admin" || userEmail === "admin@gmail.com" || userEmail === "medistationlifecare@gmail.com";

    // Unauthenticated or new users without explicit email have 0 properties by definition
    if (!userEmail && !isMasterAdmin) {
      return NextResponse.json({
        success: true,
        orgId: null,
        totalPortfolioSqft: 0,
        propertyCount: 0,
        properties: [],
      });
    }

    const targetOrgId = auth.orgId;

    let totalArea = 0;
    const propertyItems: Array<{ id: string; name: string; areaSqft: number; source: string }> = [];
    const seenIds = new Set<string>();

    // For standard users, do not query the demo constant DEFAULT_TEST_ORG_ID
    if (targetOrgId && (isMasterAdmin || targetOrgId !== "a411dd64-65db-462d-8eef-336f9768f44d")) {
      // 1. Fetch from rent-roll `property` table
      try {
        const rrProps = await db
          .select({
            id: property.id,
            name: property.property_name,
            code: property.property_code,
            area: property.total_leasable_area_sqft,
          })
          .from(property)
          .where(
            and(
              eq(property.org_id, targetOrgId),
              sql`${property.deleted_at} IS NULL`
            )
          );

        for (const p of rrProps) {
          const area = Math.round(Number(p.area) || 0);
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            totalArea += area;
            propertyItems.push({
              id: p.id,
              name: p.name || p.code || "Commercial Property",
              areaSqft: area,
              source: "rent_roll",
            });
          }
        }
      } catch (err) {
        console.warn("[Portfolio-Area] Error querying rent-roll property table:", err);
      }

      // 2. Fetch from SaaS `properties` table (if distinct)
      try {
        const saasProps = await db
          .select({
            id: properties.id,
            name: properties.name,
            area: properties.totalArea,
          })
          .from(properties)
          .where(eq(properties.orgId, targetOrgId));

        for (const sp of saasProps) {
          if (!seenIds.has(sp.id)) {
            seenIds.add(sp.id);
            const area = Math.round(Number(sp.area) || 0);
            totalArea += area;
            propertyItems.push({
              id: sp.id,
              name: sp.name || "Property",
              areaSqft: area,
              source: "saas_properties",
            });
          }
        }
      } catch (err) {
        console.warn("[Portfolio-Area] Error querying saas properties table:", err);
      }
    }

    return NextResponse.json({
      success: true,
      orgId: targetOrgId || null,
      totalPortfolioSqft: totalArea,
      propertyCount: propertyItems.length,
      properties: propertyItems,
    });
  } catch (error: any) {
    console.error("[Portfolio-Area] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate portfolio area",
        totalPortfolioSqft: 0,
        propertyCount: 0,
        properties: [],
      },
      { status: 500 }
    );
  }
}

