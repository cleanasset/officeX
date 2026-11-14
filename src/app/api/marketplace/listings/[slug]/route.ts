import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { eq, and, ne } from "drizzle-orm";
import {
  cleanImageUrl,
  sanitizeText,
  sanitizeListing,
  getMasterListingBySlug,
  getSimilarMasterListings,
} from "@/lib/marketplace-master";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // 1. Check PostgreSQL database first (for host/partner submitted spaces)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let dbListing: any = null;
    try {
      if (isUuid) {
        const results = await db
          .select()
          .from(marketplaceListings)
          .where(eq(marketplaceListings.id, slug))
          .limit(1);
        dbListing = results[0];
      } else {
        const results = await db
          .select()
          .from(marketplaceListings)
          .where(eq(marketplaceListings.slug, slug))
          .limit(1);
        dbListing = results[0];
      }
    } catch (dbErr) {
      // Continue to master dataset fallback if DB is empty or unreachable
      console.warn("DB query for listing failed, falling back to master dataset:", dbErr);
    }

    // 2. If found in DB, return DB listing and similar
    if (dbListing) {
      let similar: any[] = [];
      try {
        similar = await db
          .select()
          .from(marketplaceListings)
          .where(
            and(
              eq(marketplaceListings.city, dbListing.city),
              eq(marketplaceListings.vertical, dbListing.vertical),
              ne(marketplaceListings.id, dbListing.id),
              eq(marketplaceListings.status, "active")
            )
          )
          .limit(4);
      } catch {
        // Ignore DB error for similar
      }

      // If DB has fewer than 4 similar listings, backfill from authentic master dataset
      if (similar.length < 4) {
        const extraSimilar = getSimilarMasterListings(
          dbListing.city,
          dbListing.vertical,
          dbListing.id,
          4 - similar.length
        );
        similar = [...similar, ...extraSimilar];
      }

      return NextResponse.json({
        listing: sanitizeListing(dbListing),
        similar: similar.map(sanitizeListing),
      });
    }

    // 3. Fallback: Lookup in 6,767 authentic real myHQ scraped workspaces
    const masterListing = getMasterListingBySlug(slug);
    if (!masterListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Fetch up to 4 similar listings from the master dataset
    const similarMaster = getSimilarMasterListings(
      masterListing.city,
      masterListing.vertical,
      masterListing.id,
      4
    );

    return NextResponse.json({
      listing: sanitizeListing(masterListing),
      similar: similarMaster.map(sanitizeListing),
    });
  } catch (error: any) {
    console.error("Error fetching listing details:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const body = await request.json();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let existing: any = null;
    if (isUuid) {
      const rows = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, slug)).limit(1);
      existing = rows[0];
    } else {
      const rows = await db.select().from(marketplaceListings).where(eq(marketplaceListings.slug, slug)).limit(1);
      existing = rows[0];
    }

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const updateFields: any = {
      updatedAt: new Date()
    };

    if (body.status !== undefined) updateFields.status = String(body.status);
    if (body.name !== undefined) updateFields.name = String(body.name);
    if (body.description !== undefined) updateFields.description = String(body.description);
    if (body.startingPrice !== undefined) updateFields.startingPrice = String(body.startingPrice);
    if (body.startingPriceUnit !== undefined) updateFields.startingPriceUnit = String(body.startingPriceUnit);
    if (body.totalSeats !== undefined) updateFields.totalSeats = Number(body.totalSeats);
    if (body.pricingPlans !== undefined) updateFields.pricingPlans = body.pricingPlans;
    if (body.amenities !== undefined && Array.isArray(body.amenities)) updateFields.amenities = body.amenities;
    if (body.images !== undefined && Array.isArray(body.images)) {
      updateFields.images = body.images;
      if (body.images.length > 0) updateFields.featuredImage = body.images[0];
    }

    // Handle Host Resubmission of updated files/documents
    if (body.action === "resubmit" || body.status === "resubmitted") {
      updateFields.status = "resubmitted";
      const currentPlans = (existing.pricingPlans as any) || {};
      const currentMod = currentPlans.moderation || {};
      const nextBatch = (Number(currentMod.batchVersion) || 1) + 1;
      const history = Array.isArray(currentMod.history) ? [...currentMod.history] : [];

      history.push({
        action: "resubmitted",
        batchVersion: nextBatch,
        timestamp: new Date().toISOString(),
        note: body.hostRemarks || body.hostNotes || `Host resubmitted Batch v${nextBatch} with updated files and requested documents`,
        submittedDocs: body.submittedDocs || [],
        by: "host"
      });

      updateFields.pricingPlans = {
        ...(updateFields.pricingPlans || currentPlans),
        moderation: {
          ...currentMod,
          status: "resubmitted",
          batchVersion: nextBatch,
          lastResubmittedAt: new Date().toISOString(),
          hostRemarks: body.hostRemarks || body.hostNotes || null,
          submittedDocs: body.submittedDocs || currentMod.submittedDocs || [],
          history
        }
      };
    }

    let updated;
    if (isUuid) {
      [updated] = await db
        .update(marketplaceListings)
        .set(updateFields)
        .where(eq(marketplaceListings.id, slug))
        .returning();
    } else {
      [updated] = await db
        .update(marketplaceListings)
        .set(updateFields)
        .where(eq(marketplaceListings.slug, slug))
        .returning();
    }

    if (!updated) {
      return NextResponse.json({ error: "Listing not found or could not be updated" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      listing: updated
    });
  } catch (error: any) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing", details: error.message },
      { status: 500 }
    );
  }
}
