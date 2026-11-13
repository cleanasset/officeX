import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/marketplace-schema";
import { eq, and, ne } from "drizzle-orm";

function cleanImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/images/showcase_commercial_warmshell.jpg";
  let cleaned = url.trim();
  if (!cleaned) return "/images/showcase_commercial_warmshell.jpg";

  if (cleaned.includes("res.cloudinary.com/myhq/image/upload/")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/myhq\/image\/upload\//i, "/assets/spaces/");
  } else if (cleaned.includes("cloudinary.com") && cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//i, "/assets/spaces/");
  }

  if (cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/myhq/gi, "officex");
  }

  return cleaned;
}

function sanitizeText(val: string | null | undefined): string {
  if (!val || typeof val !== "string") return "";
  return val.replace(/myhq/gi, "OfficeX");
}

function sanitizeListing(l: any) {
  if (!l) return l;
  return {
    ...l,
    name: sanitizeText(l.name),
    brandName: sanitizeText(l.brandName),
    description: sanitizeText(l.description),
    featuredImage: cleanImageUrl(l.featuredImage),
    images: Array.isArray(l.images) && l.images.length > 0
      ? l.images.map(cleanImageUrl)
      : [cleanImageUrl(l.featuredImage)],
  };
}

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
      listing: sanitizeListing(listing),
      similar: similar.map(sanitizeListing)
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
