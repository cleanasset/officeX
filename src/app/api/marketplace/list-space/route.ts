import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings, marketplaceOwners } from "@/db/marketplace-schema";
import { eq, or, sql } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      operatorType = "coworking_operator",
      companyName,
      brandName,
      contactName,
      email,
      phone,
      city,
      spaceName,
      vertical = "coworking",
      locality,
      fullAddress,
      pincode,
      totalAreaSqft,
      totalSeats,
      buildingGrade = "Grade A",
      buildingType = "Commercial Tech Park",
      dedicatedDeskMonthly,
      privateCabinMonthly,
      hotDeskMonthly,
      virtualOfficeMonthly,
      managedOfficeMonthly,
      dayPassPrice,
      meetingRoomHourly,
      rentPerSqft,
      depositMonths,
      lockInMonths,
      amenities = [],
      photos = []
    } = body;

    if (!spaceName || !city || !contactName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: spaceName, city, contactName, email, and phone are mandatory." },
        { status: 400 }
      );
    }

    // 1. Find or create MARKETPLACE OWNER (Strictly isolated from Rent Roll SaaS users/organizations)
    let owner = await db
      .select()
      .from(marketplaceOwners)
      .where(or(eq(marketplaceOwners.email, email.trim().toLowerCase()), eq(marketplaceOwners.phone, phone.trim())))
      .limit(1)
      .then((rows) => rows[0]);

    if (!owner) {
      const [newOwner] = await db
        .insert(marketplaceOwners)
        .values({
          companyName: companyName ? String(companyName).trim() : brandName ? String(brandName).trim() : "Independent Host",
          contactName: String(contactName).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          roleType: "MARKETPLACE_OWNER",
          operatorType: String(operatorType),
          status: "active",
          verified: false
        })
        .returning();
      owner = newOwner;
    }

    // 2. Generate unique slug
    let baseSlug = slugify(`${spaceName}-${city}`);
    if (!baseSlug) baseSlug = `workspace-${Date.now()}`;
    let uniqueSlug = baseSlug;
    
    // Check if slug exists
    const existingSlug = await db
      .select({ id: marketplaceListings.id })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.slug, uniqueSlug))
      .limit(1);

    if (existingSlug.length > 0) {
      uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Pricing plans mapping
    const pricingPlans: any = {};
    if (hotDeskMonthly) pricingPlans.hotDeskMonthly = Number(hotDeskMonthly);
    if (dedicatedDeskMonthly) pricingPlans.dedicatedDeskMonthly = Number(dedicatedDeskMonthly);
    if (privateCabinMonthly) pricingPlans.privateCabinMonthly = Number(privateCabinMonthly);
    if (managedOfficeMonthly) pricingPlans.managedOfficeMonthly = Number(managedOfficeMonthly);
    if (virtualOfficeMonthly) pricingPlans.virtualOfficeMonthly = Number(virtualOfficeMonthly);
    if (dayPassPrice) pricingPlans.dayPassPrice = Number(dayPassPrice);
    if (meetingRoomHourly) pricingPlans.meetingRoomHourly = Number(meetingRoomHourly);
    if (rentPerSqft) pricingPlans.rentPerSqft = Number(rentPerSqft);
    if (depositMonths) pricingPlans.depositMonths = Number(depositMonths);
    if (lockInMonths) pricingPlans.lockInMonths = Number(lockInMonths);

    // Starting price determination
    let startingPrice = 7999;
    let startingPriceUnit = "per_seat_month";

    if (vertical === "coworking") {
      startingPrice = pricingPlans.dedicatedDeskMonthly || pricingPlans.hotDeskMonthly || pricingPlans.privateCabinMonthly || 7999;
      startingPriceUnit = "per_seat_month";
    } else if (vertical === "virtual_office") {
      startingPrice = pricingPlans.virtualOfficeMonthly || 999;
      startingPriceUnit = "per_month";
    } else if (vertical === "managed_office") {
      startingPrice = pricingPlans.managedOfficeMonthly || 12000;
      startingPriceUnit = "per_seat_month";
    } else if (vertical === "commercial") {
      startingPrice = pricingPlans.rentPerSqft || 85;
      startingPriceUnit = "per_sqft_month";
    } else if (vertical === "meeting_room") {
      startingPrice = pricingPlans.meetingRoomHourly || 750;
      startingPriceUnit = "per_hour";
    } else if (vertical === "day_pass") {
      startingPrice = pricingPlans.dayPassPrice || 499;
      startingPriceUnit = "per_day";
    }

    // Filter valid photos (exclude mock unsplash URLs if user passed empty)
    const validPhotos = Array.isArray(photos) ? photos.filter((p: string) => typeof p === "string" && p.trim().length > 0) : [];
    const featuredImage = validPhotos[0] || null;

    // 3. Insert into marketplace_listings
    const [listing] = await db
      .insert(marketplaceListings)
      .values({
        slug: uniqueSlug,
        name: String(spaceName).trim(),
        brandName: brandName ? String(brandName).trim() : companyName ? String(companyName).trim() : null,
        vertical: String(vertical),
        status: "active",
        city: String(city).trim(),
        locality: locality ? String(locality).trim() : null,
        microMarket: locality ? String(locality).trim() : null,
        fullAddress: fullAddress ? String(fullAddress).trim() : `${locality || ""}, ${city}`,
        pincode: pincode ? String(pincode).trim() : null,
        totalAreaSqft: totalAreaSqft ? Number(totalAreaSqft) : null,
        totalSeats: totalSeats ? Number(totalSeats) : null,
        buildingGrade: String(buildingGrade),
        buildingType: String(buildingType),
        furnishingStatus: "Furnished",
        images: validPhotos,
        featuredImage: featuredImage,
        amenities: Array.isArray(amenities) ? amenities : [],
        pricingPlans: pricingPlans,
        startingPrice: String(startingPrice),
        startingPriceUnit: startingPriceUnit,
        description: `${spaceName} is a premier ${vertical.replace("_", " ")} workspace in ${city}, managed by ${brandName || companyName || "OfficeX Partner"}.`,
        operatingHours: {
          monSat: "09:00 AM - 08:00 PM",
          sun: "Closed"
        },
        avgRating: "4.80",
        totalReviews: 1,
        consultantName: contactName ? String(contactName) : "OfficeX Marketplace Team",
        consultantPhone: phone ? String(phone) : "+91 98200 12345",
        source: "partner_submission",
        marketplaceOwnerId: owner.id
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Listing published successfully to Office Marketplace",
      listing,
      owner
    });
  } catch (error: any) {
    console.error("List space API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit marketplace listing" },
      { status: 500 }
    );
  }
}
