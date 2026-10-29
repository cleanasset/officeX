import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { and, eq, ilike, or, gte, lte, desc, asc, sql } from "drizzle-orm";

function cleanImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/images/showcase_commercial_warmshell.jpg";
  let cleaned = url.trim();
  if (!cleaned) return "/images/showcase_commercial_warmshell.jpg";

  if (cleaned.includes("res.cloudinary.com/myhq/image/upload/")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/myhq\/image\/upload\//i, "/assets/spaces/");
  } else if (cleaned.includes("cloudinary.com") && cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//i, "/assets/spaces/");
  }

  // Ensure "myhq" is NEVER present in the URL path presented to the client
  if (cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/myhq/gi, "officex");
  }

  return cleaned;
}

function sanitizeText(val: string | null | undefined): string {
  if (!val || typeof val !== "string") return "";
  return val.replace(/myhq/gi, "OfficeX");
}

// In-memory cache for master properties dataset
let masterCache: any[] | null = null;
function getMasterListings(): any[] {
  if (masterCache) return masterCache;
  try {
    const jsonPath = path.join(process.cwd(), "office marketplace data", "json", "all_properties_master.json");
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      const parsed: any[] = raw.map((p: any, idx: number) => {
        const rawPhotoUrls = (p["Photo URLs"] || "").split(";").map((s: string) => s.trim()).filter(Boolean);
        const photos = rawPhotoUrls.map(cleanImageUrl);
        const featuredImage = photos[0] || cleanImageUrl(p["Featured Image"]);

        let vertical = "coworking";
        const rawType = (p["Property Type"] || "").toLowerCase();
        if (rawType.includes("virtual")) vertical = "virtual_office";
        else if (rawType.includes("managed")) vertical = "managed_office";
        else if (rawType.includes("commercial")) vertical = "commercial";
        else if (rawType.includes("meeting")) vertical = "meeting_room";
        else if (rawType.includes("day pass") || rawType.includes("day_pass")) vertical = "day_pass";

        const startingPrice = Number(
          p["Hot Desk Price (INR/mo)"] ||
          p["Dedicated Desk (INR/mo)"] ||
          p["Private Cabin (INR/seat/mo)"] ||
          p["Managed Office (INR/seat/mo)"] ||
          p["Rent per sqft/mo (INR)"] ||
          p["Virtual Office Monthly (INR)"] ||
          8500
        );

        return {
          id: p["Property ID"] || `space-${idx}`,
          slug: p["Property ID"] || `space-${idx}`,
          name: sanitizeText(p["Property Name"] || "Commercial Workspace"),
          brandName: sanitizeText(p["Brand / Operator"] || "Verified Operator"),
          vertical,
          city: p["City"] || "Delhi",
          locality: p["Locality / Area"] || "",
          microMarket: p["Locality / Area"] || "",
          fullAddress: p["Full Address"] || "",
          pincode: p["Pincode"] || "",
          latitude: String(p["Latitude"] || "28.6139"),
          longitude: String(p["Longitude"] || "77.2090"),
          totalAreaSqft: Number(p["Total Area (sq.ft.)"]) || 10000,
          totalSeats: Number(p["Total Seating Capacity"]) || 150,
          buildingGrade: p["Building Grade"] || "Grade A",
          buildingType: p["Building Type"] || "Commercial Office Building",
          furnishingStatus: p["Furnishing Status"] || "Fully Furnished",
          images: photos.length > 0 ? photos : ["/images/showcase_commercial_warmshell.jpg"],
          featuredImage: featuredImage || "/images/showcase_commercial_warmshell.jpg",
          amenities: ["High-Speed WiFi", "Power Backup", "Meeting Rooms", "Tea / Coffee", "Security & CCTV"],
          pricingPlans: {
            hotDeskMonthly: Number(p["Hot Desk Price (INR/mo)"]) || undefined,
            dedicatedDeskMonthly: Number(p["Dedicated Desk (INR/mo)"]) || undefined,
            privateCabinMonthly: Number(p["Private Cabin (INR/seat/mo)"]) || undefined,
            managedOfficeMonthly: Number(p["Managed Office (INR/seat/mo)"]) || undefined,
          },
          startingPrice,
          startingPriceUnit: "per_month",
          description: sanitizeText(p["Description"] || ""),
          avgRating: String(p["Rating (out of 5)"] || "4.5"),
          totalReviews: Number(p["Total Reviews"]) || 15,
          nearestMetro: p["Nearest Metro"] || "",
          metroDistance: p["Metro Distance"] || "",
          consultantName: "OfficeX Commercial Advisory",
          consultantPhone: "+91 98200 12345",
          status: "active",
          source: "verified_listing",
        };
      });
      masterCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to load master properties JSON:", err);
  }
  return [];
}

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

    let dbListings: any[] = [];
    let dbTotal = 0;

    // 1. Try querying PostgreSQL database
    try {
      const conditions: any[] = [eq(marketplaceListings.status, "active")];

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
          // Other cities are Coming Soon - strictly return 0 properties
          conditions.push(eq(marketplaceListings.id, "00000000-0000-0000-0000-000000000000"));
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

    // 2. If database has records, return them
    if (dbListings.length > 0) {
      return NextResponse.json({
        listings: dbListings,
        pagination: {
          total: dbTotal,
          page,
          limit,
          totalPages: Math.ceil(dbTotal / limit)
        }
      });
    }

    // 3. Robust High-Performance Fallback: Query 6,767 authentic properties from master dataset
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
        // Any other city is Coming Soon: return 0 properties
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

    // Keyword Search Filter
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name || "").toLowerCase().includes(query) ||
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

    // Sorting
    if (sort === "price_asc") {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sort === "price_desc") {
      filtered.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sort === "rating") {
      filtered.sort((a, b) => Number(b.avgRating || 0) - Number(a.avgRating || 0));
    } else {
      // Default: prioritize listings with authentic photos
      filtered.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

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
