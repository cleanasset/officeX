import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { and, eq, ilike, or, gte, lte, desc, asc, sql } from "drizzle-orm";
import { getMasterListings, cleanImageUrl, sanitizeText } from "@/lib/marketplace-master";

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

    const statusParam = searchParams.get("status");
    const ownerId = searchParams.get("ownerId") || searchParams.get("marketplaceOwnerId");

    let dbListings: any[] = [];
    let dbTotal = 0;

    // 1. Try querying PostgreSQL database
    try {
      const conditions: any[] = [];

      // Status Filter:
      if (statusParam && statusParam.toLowerCase() !== "all") {
        conditions.push(eq(marketplaceListings.status, statusParam));
      } else if (!statusParam) {
        // Public search strictly only shows approved 'active' spaces
        conditions.push(eq(marketplaceListings.status, "active"));
      }
      // If statusParam === "all", do not filter by status (allows Admin and Host Console to fetch all)

      if (ownerId) {
        conditions.push(eq(marketplaceListings.marketplaceOwnerId, ownerId));
      }

      if (city && city.toLowerCase() !== "all") {
        const c = city.trim().toLowerCase();
        if (c === "delhi ncr" || c === "ncr") {
          conditions.push(
            or(
              ilike(marketplaceListings.city, "%Delhi%"),
              ilike(marketplaceListings.city, "%Gurgaon%"),
              ilike(marketplaceListings.city, "%Gurugram%"),
              ilike(marketplaceListings.city, "%Noida%"),
              ilike(marketplaceListings.city, "%Faridabad%"),
              ilike(marketplaceListings.city, "%Ghaziabad%")
            )
          );
        } else if (c === "gurgaon" || c === "gurugram") {
          conditions.push(
            or(
              ilike(marketplaceListings.city, "%Gurgaon%"),
              ilike(marketplaceListings.city, "%Gurugram%")
            )
          );
        } else if (c === "noida" || c === "greater noida") {
          conditions.push(ilike(marketplaceListings.city, "%Noida%"));
        } else if (c === "faridabad") {
          conditions.push(ilike(marketplaceListings.city, "%Faridabad%"));
        } else {
          // Dynamic extensible match: automatically supports ANY new city, area or state without code changes
          conditions.push(
            or(
              ilike(marketplaceListings.city, `%${city.trim()}%`),
              ilike(marketplaceListings.locality, `%${city.trim()}%`),
              ilike(marketplaceListings.microMarket, `%${city.trim()}%`),
              ilike(marketplaceListings.fullAddress, `%${city.trim()}%`)
            )
          );
        }
      } else {
        // If all or unspecified, properties are strictly confined to the 4 live markets
        conditions.push(
          or(
            ilike(marketplaceListings.city, "%Delhi%"),
            ilike(marketplaceListings.city, "%Gurgaon%"),
            ilike(marketplaceListings.city, "%Gurugram%"),
            ilike(marketplaceListings.city, "%Noida%"),
            ilike(marketplaceListings.city, "%Faridabad%"),
            ilike(marketplaceListings.city, "%Ghaziabad%")
          )
        );
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
          conditions.push(eq(marketplaceListings.vertical, "coworking"));
        } else {
          conditions.push(eq(marketplaceListings.vertical, v));
        }
      }

      if (brand && brand.toLowerCase() !== "all" && brand.toLowerCase() !== "all operators") {
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

      const listingPriority = sql`CASE 
        WHEN ${marketplaceListings.featuredImage} IS NOT NULL AND ${marketplaceListings.featuredImage} != '' THEN 1
        WHEN ${marketplaceListings.images} IS NOT NULL AND jsonb_array_length(${marketplaceListings.images}) >= 2 THEN 2
        ELSE 3
      END`;

      let orderByClause: any[] = [
        asc(listingPriority),
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

      dbListings = listings.map((l: any) => ({
        ...l,
        name: sanitizeText(l.name),
        brandName: sanitizeText(l.brandName),
        description: sanitizeText(l.description),
        featuredImage: cleanImageUrl(l.featuredImage),
        images: Array.isArray(l.images) && l.images.length > 0
          ? l.images.map(cleanImageUrl)
          : [cleanImageUrl(l.featuredImage)],
      }));
      dbTotal = Number(countResult[0]?.count || 0);
    } catch {
      // Database unavailable or empty, continue to master dataset fallback
    }

    // If specific non-active status is queried (e.g. pending_review, changes_requested), or ownerId is specified,
    // this is strictly for Admin Moderation or Host Operator Console. Return only database records.
    if ((statusParam && statusParam !== "active") || ownerId) {
      return NextResponse.json({
        listings: dbListings,
        pagination: {
          total: dbTotal,
          page,
          limit,
          totalPages: Math.ceil(dbTotal / limit) || 1
        }
      });
    }

    // 2. Query authentic commercial properties from master catalogue (6,767 listings)
    const all = getMasterListings();
    let filtered = all;

    // City Filter: Properties ONLY for the 4 live markets (Delhi NCR, Noida, Gurgaon, Faridabad)
    if (city && city.toLowerCase() !== "all") {
      const c = city.trim().toLowerCase();
      if (c === "delhi ncr" || c === "ncr" || c === "delhi") {
        filtered = filtered.filter((p) => {
          const pc = (p.city || "").toLowerCase();
          return pc.includes("delhi") || pc.includes("gurgaon") || pc.includes("gurugram") || pc.includes("noida") || pc.includes("faridabad") || pc.includes("ghaziabad");
        });
      } else if (c === "gurgaon" || c === "gurugram") {
        filtered = filtered.filter((p) => {
          const pc = (p.city || "").toLowerCase();
          return pc.includes("gurgaon") || pc.includes("gurugram");
        });
      } else if (c === "noida" || c === "greater noida") {
        filtered = filtered.filter((p) => {
          const pc = (p.city || "").toLowerCase();
          return pc.includes("noida");
        });
      } else if (c === "faridabad") {
        filtered = filtered.filter((p) => {
          const pc = (p.city || "").toLowerCase();
          return pc.includes("faridabad");
        });
      } else {
        // Any other city is inactive / Coming Soon: return 0 properties until officially activated
        filtered = [];
      }
    } else {
      // If unspecified or 'all', strictly return only properties from the 4 live markets
      filtered = filtered.filter((p) => {
        const pc = (p.city || "").toLowerCase();
        return pc.includes("delhi") || pc.includes("gurgaon") || pc.includes("gurugram") || pc.includes("noida") || pc.includes("faridabad") || pc.includes("ghaziabad");
      });
    }

    // Vertical Filter
    if (vertical && vertical.toLowerCase() !== "all") {
      const v = vertical.trim().toLowerCase();
      let targetV = v;
      if (v === "daypass" || v === "day_pass") targetV = "day_pass";
      else if (v === "meeting" || v === "meeting_room" || v === "training" || v === "event") targetV = "meeting_room";
      else if (v === "virtual" || v === "virtual_office") targetV = "virtual_office";
      else if (v === "managed" || v === "managed_office") targetV = "managed_office";
      else if (v === "commercial" || v === "industry" || v === "warehouse") targetV = "commercial";
      else if (v === "coworking" || v === "cabins" || v === "office") targetV = "coworking";

      filtered = filtered.filter((p) => p.vertical === targetV);
    }

    // Brand Filter
    if (brand && brand.toLowerCase() !== "all" && brand.toLowerCase() !== "all operators") {
      const b = brand.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.brandName || "").toLowerCase().includes(b) ||
        (p.name || "").toLowerCase().includes(b)
      );
    }

    // Keyword Search Filter
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name || "").toLowerCase().includes(query) ||
        (p.brandName || "").toLowerCase().includes(query) ||
        (p.locality || "").toLowerCase().includes(query) ||
        (p.city || "").toLowerCase().includes(query) ||
        (p.fullAddress || "").toLowerCase().includes(query)
      );
    }

    // Locality Filter
    if (locality) {
      const loc = locality.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.locality || "").toLowerCase().includes(loc) ||
        (p.microMarket || "").toLowerCase().includes(loc)
      );
    }

    // Price Filter
    if (minPrice != null && !isNaN(minPrice)) {
      filtered = filtered.filter((p) => p.startingPrice >= minPrice);
    }
    if (maxPrice != null && !isNaN(maxPrice)) {
      filtered = filtered.filter((p) => p.startingPrice <= maxPrice);
    }

    // 3. COMBINE active DB listings + filtered master listings
    // Deduplicate by slug, id, or normalized name
    const seenKeys = new Set<string>();
    const combinedListings: any[] = [];

    // Active approved partner DB listings come first (promoted / featured)
    for (const d of dbListings) {
      const key = String(d.slug || d.id || d.name).trim().toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        combinedListings.push(d);
      }
    }

    // Followed by the master authentic properties catalogue
    for (const p of filtered) {
      const key = String(p.slug || p.id || p.name).trim().toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        combinedListings.push(p);
      }
    }

    // Sorting
    if (sort === "price_asc") {
      combinedListings.sort((a, b) => Number(a.startingPrice || 0) - Number(b.startingPrice || 0));
    } else if (sort === "price_desc") {
      combinedListings.sort((a, b) => Number(b.startingPrice || 0) - Number(a.startingPrice || 0));
    } else if (sort === "rating") {
      combinedListings.sort((a, b) => Number(b.avgRating || 0) - Number(a.avgRating || 0));
    } else {
      // Default: listings with multiple authentic photos first, prioritizing active verified
      combinedListings.sort((a, b) => {
        const aCount = Array.isArray(a.images) ? a.images.length : (a.featuredImage ? 1 : 0);
        const bCount = Array.isArray(b.images) ? b.images.length : (b.featuredImage ? 1 : 0);
        return bCount - aCount;
      });
    }

    const total = combinedListings.length;
    const paginated = combinedListings.slice(offset, offset + limit);

    return NextResponse.json({
      listings: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
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
