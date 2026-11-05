import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { marketplaceListings } from "@/db/marketplace-schema";
import { users, organizations, properties } from "@/db/schema";
import { property, contract } from "@/db/rent-roll-schema";

export async function GET(request: NextRequest) {
  try {
    const [
      marketplaceCount,
      usersRes,
      orgsCount,
      rentRollPropsRes,
      contractsRes,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(marketplaceListings),
      db.execute(sql`SELECT count(*)::int as count FROM public.users`).catch(() => [{ count: 0 }]),
      db.select({ count: sql<number>`count(*)` }).from(organizations),
      db.execute(sql`SELECT count(*)::int as count FROM public.property WHERE deleted_at IS NULL`).catch(() => [{ count: 0 }]),
      db.execute(sql`SELECT count(*)::int as count FROM public.contract WHERE deleted_at IS NULL AND contract_status = 'active'`).catch(() => [{ count: 0 }]),
    ]);

    const activeListings = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplaceListings)
      .where(sql`status = 'active'`);

    // Compute real GTV from active database contracts
    const gtvResult = await db
      .select({
        monthlyGtv: sql<number>`coalesce(sum(base_rent_monthly), 0)`
      })
      .from(contract)
      .where(sql`contract_status = 'active'`)
      .catch(() => [{ monthlyGtv: 0 }]);

    const monthlyGtvNum = Number(gtvResult[0]?.monthlyGtv || 0);
    const arrEstimateNum = monthlyGtvNum * 12;

    const formattedGtv = monthlyGtvNum > 0
      ? `₹${(monthlyGtvNum / 100000).toFixed(2)} L/mo`
      : "₹0/mo";

    const formattedArr = arrEstimateNum > 0
      ? `₹${(arrEstimateNum / 10000000).toFixed(2)} Cr`
      : "₹0";

    return NextResponse.json({
      success: true,
      stats: {
        totalMarketplaceListings: Number(marketplaceCount[0]?.count || 0),
        activeMarketplaceListings: Number(activeListings[0]?.count || 0),
        totalRegisteredUsers: Number((usersRes as any)[0]?.count || 0),
        totalOrganizations: Number(orgsCount[0]?.count || 0),
        totalRentRollProperties: Number((rentRollPropsRes as any)[0]?.count || 0),
        totalActiveContracts: Number((contractsRes as any)[0]?.count || 0),
        platformArrEstimate: formattedArr,
        platformMonthlyGtv: formattedGtv
      }
    });
  } catch (err: any) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Failed to fetch admin overview", details: err.message }, { status: 500 });
  }
}

