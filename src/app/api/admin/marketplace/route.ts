import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { eq, or, ilike, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 25));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(marketplaceListings.name, term),
          ilike(marketplaceListings.brandName, term),
          ilike(marketplaceListings.locality, term),
          ilike(marketplaceListings.city, term)
        )
      );
    }

    if (city && city.toLowerCase() !== "all") {
      conditions.push(ilike(marketplaceListings.city, `%${city.trim()}%`));
    }

    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

    const [listings, countResult] = await Promise.all([
      db
        .select()
        .from(marketplaceListings)
        .where(whereClause)
        .orderBy(desc(marketplaceListings.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(marketplaceListings)
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error("Admin marketplace GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, startingPrice, name, brandName } = body;

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const updateFields: any = { updatedAt: new Date() };
    if (status !== undefined) updateFields.status = status;
    if (startingPrice !== undefined) updateFields.startingPrice = String(startingPrice);
    if (name !== undefined) updateFields.name = name;
    if (brandName !== undefined) updateFields.brandName = brandName;

    const [updated] = await db
      .update(marketplaceListings)
      .set(updateFields)
      .where(eq(marketplaceListings.id, id))
      .returning();

    return NextResponse.json({ success: true, listing: updated });
  } catch (err: any) {
    console.error("Admin marketplace PUT error:", err);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

