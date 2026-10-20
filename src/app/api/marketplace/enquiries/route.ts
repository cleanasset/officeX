import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceEnquiries, marketplaceSiteVisits, marketplaceDeals } from "@/db/marketplace-schema";
import { desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listingId,
      listingName,
      seekerName,
      seekerEmail,
      seekerPhone,
      companyName,
      seatsRequired,
      moveInDate,
      budget,
      vertical,
      city,
      isSiteVisit,
      visitDate,
      visitTime,
      notes
    } = body;

    if (!seekerName || !seekerEmail || !seekerPhone) {
      return NextResponse.json(
        { error: "Name, email, and phone number are required" },
        { status: 400 }
      );
    }

    // 1. Create Enquiry Record
    const [enquiry] = await db
      .insert(marketplaceEnquiries)
      .values({
        listingId: listingId || null,
        listingName: listingName || null,
        seekerName,
        seekerEmail,
        seekerPhone,
        companyName: companyName || null,
        seatsRequired: seatsRequired ? Number(seatsRequired) : null,
        moveInDate: moveInDate || null,
        budget: budget || null,
        vertical: vertical || null,
        city: city || null,
        notes: notes || null,
        status: isSiteVisit ? "visit_scheduled" : "new"
      })
      .returning();

    // 2. If it's a Site Visit booking, insert into marketplaceSiteVisits
    let siteVisit = null;
    if (isSiteVisit && visitDate) {
      const [visit] = await db
        .insert(marketplaceSiteVisits)
        .values({
          enquiryId: enquiry.id,
          listingId: listingId || null,
          visitorName: seekerName,
          visitorEmail: seekerEmail,
          visitorPhone: seekerPhone,
          scheduledDate: visitDate,
          scheduledTime: visitTime || "11:00 AM",
          status: "scheduled"
        })
        .returning();
      siteVisit = visit;
    }

    // 3. Create initial Deal in marketplaceDeals pipeline
    const [deal] = await db
      .insert(marketplaceDeals)
      .values({
        enquiryId: enquiry.id,
        listingId: listingId || null,
        clientName: companyName || seekerName,
        dealStage: isSiteVisit ? "site_visit" : "inquiry",
        dealValue: seatsRequired ? String(Number(seatsRequired) * 12000 * 12) : "500000.00",
        commissionRate: "10.00",
        commissionAmount: seatsRequired ? String(Number(seatsRequired) * 12000 * 12 * 0.1) : "50000.00"
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: isSiteVisit
        ? "Site visit successfully scheduled! Our space host will reach out shortly."
        : "Requirement submitted successfully! Dedicated workspace advisory team is on it.",
      enquiryId: enquiry.id,
      siteVisitId: siteVisit?.id,
      dealId: deal?.id
    });
  } catch (error: any) {
    console.error("Error creating marketplace enquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const list = await db
      .select()
      .from(marketplaceEnquiries)
      .orderBy(desc(marketplaceEnquiries.createdAt))
      .limit(50);

    return NextResponse.json({ enquiries: list });
  } catch (error: any) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries", details: error.message },
      { status: 500 }
    );
  }
}
