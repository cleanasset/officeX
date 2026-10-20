import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { and, eq, ilike, or, gte, lte, desc, asc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const vertical = searchParams.get("vertical");
    const q = searchParams.get("q") || searchParams.get("query");
    const locality = searchParams.get("locality");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const brand = searchParams.get("brand");
    const grade = searchParams.get("grade");
    const sort = searchParams.get("sort") || "popular"; // popular | price_asc | price_desc | rating
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(250, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(marketplaceListings.status, "active")];

    if (city && city.toLowerCase() !== "all") {
      const c = city.trim().toLowerCase();
      if (c === "delhi ncr" || c === "ncr") {
        conditions.push(
          or(
            ilike(marketplaceListings.city, "%Delhi%"),
            ilike(marketplaceListings.city, "%Gurgaon%"),
            ilike(marketplaceListings.city, "%Noida%"),
            ilike(marketplaceListings.city, "%Faridabad%"),
            ilike(marketplaceListings.city, "%Ghaziabad%")
          )
        );
      } else if (c === "bengaluru" || c === "bangalore") {
        conditions.push(
          or(
            ilike(marketplaceListings.city, "%Bangalore%"),
            ilike(marketplaceListings.city, "%Bengaluru%")
          )
        );
      } else if (c === "gandhinagar" || c.includes("gift")) {
        conditions.push(
          or(
            ilike(marketplaceListings.city, "%Gandhinagar%"),
            ilike(marketplaceListings.city, "%Ahmedabad%"),
            ilike(marketplaceListings.locality, "%GIFT%"),
            ilike(marketplaceListings.microMarket, "%GIFT%")
          )
        );
      } else {
        conditions.push(ilike(marketplaceListings.city, `%${city.trim()}%`));
      }
    }

    if (vertical && vertical.toLowerCase() !== "all") {
      const v = vertical.trim().toLowerCase();
      if (v === "daypass" || v === "day_pass") {
        conditions.push(eq(marketplaceListings.vertical, "day_pass"));
      } else if (v === "meeting" || v === "meeting_room" || v === "training" || v === "event") {
        conditions.push(eq(marketplaceListings.vertical, "meeting_room"));
      } else if (v === "virtual" || v === "virtual_office") {
        conditions.push(eq(marketplaceListings.vertical, "virtual_office"));
      } else if (v === "managed" || v === "managed_office") {
        conditions.push(eq(marketplaceListings.vertical, "managed_office"));
      } else if (v === "commercial" || v === "industry" || v === "warehouse") {
        conditions.push(eq(marketplaceListings.vertical, "commercial"));
      } else if (v === "coworking" || v === "cabins" || v === "office") {
        // Strictly coworking spaces (no commercial bare-shells)
        conditions.push(eq(marketplaceListings.vertical, "coworking"));
      } else {
        conditions.push(eq(marketplaceListings.vertical, v));
      }
    }

    if (brand && brand.toLowerCase() !== "all" && brand.toLowerCase() !== "all brands") {
      conditions.push(
        or(
          ilike(marketplaceListings.brandName, `%${brand.trim()}%`),
          ilike(marketplaceListings.name, `%${brand.trim()}%`)
        )
      );
    }

    if (locality) {
      conditions.push(
        or(
          ilike(marketplaceListings.locality, `%${locality.trim()}%`),
          ilike(marketplaceListings.microMarket, `%${locality.trim()}%`)
        )
      );
    }

    if (grade && grade.toLowerCase() !== "all") {
      conditions.push(ilike(marketplaceListings.buildingGrade, `%${grade.trim()}%`));
    }

    if (minPrice != null && !isNaN(minPrice)) {
      conditions.push(gte(marketplaceListings.startingPrice, String(minPrice)));
    }

    if (maxPrice != null && !isNaN(maxPrice)) {
      conditions.push(lte(marketplaceListings.startingPrice, String(maxPrice)));
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(marketplaceListings.name, term),
          ilike(marketplaceListings.brandName, term),
          ilike(marketplaceListings.locality, term),
          ilike(marketplaceListings.microMarket, term),
          ilike(marketplaceListings.city, term),
          ilike(marketplaceListings.fullAddress, term)
        )
      );
    }

    const whereClause = and(...conditions);

    // Sorting: Popularity boosts verified recognized operators with photos and reviews
    const brandPriority = sql`CASE 
      WHEN ${marketplaceListings.brandName} ILIKE '%Awfis%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%WeWork%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%91Springboard%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%Innov8%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%Regus%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%DevX%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%Smartworks%' THEN 1
      WHEN ${marketplaceListings.brandName} ILIKE '%Incuspaze%' THEN 1
      WHEN ${marketplaceListings.images} IS NOT NULL AND jsonb_array_length(${marketplaceListings.images}) >= 3 THEN 2
      ELSE 3
    END`;

    let orderByClause: any[] = [
      asc(brandPriority),
      desc(marketplaceListings.totalReviews),
      desc(marketplaceListings.avgRating)
    ];

    if (sort === "price_asc") {
      orderByClause = [asc(marketplaceListings.startingPrice)];
    } else if (sort === "price_desc") {
      orderByClause = [desc(marketplaceListings.startingPrice)];
    } else if (sort === "rating") {
      orderByClause = [desc(marketplaceListings.avgRating), desc(marketplaceListings.totalReviews)];
    }

    // Query listings + count
    const [listings, countResult] = await Promise.all([
      db
        .select()
        .from(marketplaceListings)
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(marketplaceListings)
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: any) {
    console.error("Marketplace listings search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace listings", details: error.message },
      { status: 500 }
    );
  }
}
