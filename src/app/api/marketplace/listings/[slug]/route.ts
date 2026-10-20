import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { eq, or, and, ne } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Check by slug or by UUID id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let listing;
    if (isUuid) {
      const results = await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.id, slug))
        .limit(1);
      listing = results[0];
    } else {
      const results = await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.slug, slug))
        .limit(1);
      listing = results[0];
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 400 });
    }

    // Fetch up to 4 similar listings in the same city and vertical
    const similar = await db
      .select()
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.city, listing.city),
          eq(marketplaceListings.vertical, listing.vertical),
          ne(marketplaceListings.id, listing.id),
          eq(marketplaceListings.status, "active")
        )
      )
      .limit(4);

    return NextResponse.json({
      listing,
      similar
    });
  } catch (error: any) {
    console.error("Error fetching listing details:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing", details: error.message },
      { status: 500 }
    );
  }
}
