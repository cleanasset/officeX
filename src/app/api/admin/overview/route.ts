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
      usersCount,
      orgsCount,
      rentRollPropsCount,
      contractsCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(marketplaceListings),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(organizations),
      db.select({ count: sql<number>`count(*)` }).from(property),
      db.select({ count: sql<number>`count(*)` }).from(contract),
    ]);

    const activeListings = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketplaceListings)
      .where(sql`status = 'active'`);

    return NextResponse.json({
      success: true,
      stats: {
        totalMarketplaceListings: Number(marketplaceCount[0]?.count || 0),
        activeMarketplaceListings: Number(activeListings[0]?.count || 0),
        totalRegisteredUsers: Number(usersCount[0]?.count || 0),
        totalOrganizations: Number(orgsCount[0]?.count || 0),
        totalRentRollProperties: Number(rentRollPropsCount[0]?.count || 0),
        totalActiveContracts: Number(contractsCount[0]?.count || 0),
        platformArrEstimate: "₹14.8 Cr",
        platformMonthlyGtv: "₹1.23 Cr"
      }
    });
  } catch (err: any) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Failed to fetch admin overview", details: err.message }, { status: 500 });
  }
}

