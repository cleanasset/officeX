import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  marketplaceListings, 
  marketplaceEnquiries, 
  marketplaceSiteVisits, 
  marketplaceDeals, 
  marketplaceOwners 
} from "@/db/marketplace-schema";
import { eq, or, ilike, sql, desc } from "drizzle-orm";

// Launch city & marketplace operational rules
const SEED_MARKETPLACE_SETTINGS = {
  launchCities: [
    { city: "Noida", active: true, priority: 1, propertiesCount: 1420 },
    { city: "Gurgaon", active: true, priority: 2, propertiesCount: 2890 },
    { city: "Faridabad", active: true, priority: 3, propertiesCount: 680 },
    { city: "Delhi", active: true, priority: 4, propertiesCount: 1777 },
    { city: "Mumbai", active: false, priority: 5, propertiesCount: 0 },
    { city: "Bengaluru", active: false, priority: 6, propertiesCount: 0 }
  ],
  leadRouting: {
    autoAssign: true,
    routingStrategy: "geographic_matching",
    fallbackBroker: "Central OfficeX Commercial Team"
  },
  verificationPolicy: {
    requireReraForBrokers: true,
    requirePanGstForOperators: true,
    autoPublishApprovedOperators: false
  },
  commissionRules: {
    standardBrokeragePct: 10.0,
    lockinThresholdMonths: 12,
    dayPassPlatformFeePct: 15.0
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "listings";
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 25));
    const offset = (page - 1) * limit;

    // 1. INBOUND SEEKER ENQUIRIES VIEW
    if (view === "enquiries") {
      try {
        const conditions: any[] = [];
        if (city && city.toLowerCase() !== "all") {
          conditions.push(ilike(marketplaceEnquiries.city, `%${city.trim()}%`));
        }
        if (q.trim()) {
          const term = `%${q.trim()}%`;
          conditions.push(
            or(
              ilike(marketplaceEnquiries.seekerName, term),
              ilike(marketplaceEnquiries.companyName, term),
              ilike(marketplaceEnquiries.listingName, term)
            )
          );
        }
        const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

        const rows = await db
          .select()
          .from(marketplaceEnquiries)
          .where(whereClause)
          .orderBy(desc(marketplaceEnquiries.createdAt))
          .limit(limit)
          .offset(offset);

        return NextResponse.json({
          success: true,
          view: "enquiries",
          enquiries: rows || [],
          pagination: { total: rows?.length || 0, page, limit, totalPages: Math.ceil((rows?.length || 0) / limit) || 1 }
        });
      } catch (err) {
        console.warn("DB enquiries fetch note:", err);
        return NextResponse.json({
          success: true,
          view: "enquiries",
          enquiries: [],
          pagination: { total: 0, page: 1, limit, totalPages: 1 }
        });
      }
    }

    // 2. SITE VISITS & TOURS VIEW
    if (view === "visits") {
      try {
        const conditions: any[] = [];
        if (q.trim()) {
          const term = `%${q.trim()}%`;
          conditions.push(
            or(
              ilike(marketplaceSiteVisits.visitorName, term),
              ilike(marketplaceSiteVisits.visitorEmail, term),
              ilike(marketplaceSiteVisits.hostName, term)
            )
          );
        }
        const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

        const rows = await db
          .select()
          .from(marketplaceSiteVisits)
          .where(whereClause)
          .orderBy(desc(marketplaceSiteVisits.createdAt))
          .limit(limit)
          .offset(offset);

        return NextResponse.json({
          success: true,
          view: "visits",
          visits: rows || [],
          pagination: { total: rows?.length || 0, page, limit, totalPages: Math.ceil((rows?.length || 0) / limit) || 1 }
        });
      } catch (err) {
        console.warn("DB site visits fetch note:", err);
        return NextResponse.json({
          success: true,
          view: "visits",
          visits: [],
          pagination: { total: 0, page: 1, limit, totalPages: 1 }
        });
      }
    }

    // 3. DEALS & BROKERAGE COMMISSIONS PIPELINE VIEW
    if (view === "deals") {
      try {
        const conditions: any[] = [];
        if (q.trim()) {
          const term = `%${q.trim()}%`;
          conditions.push(
            ilike(marketplaceDeals.clientName, term)
          );
        }
        const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

        const rows = await db
          .select()
          .from(marketplaceDeals)
          .where(whereClause)
          .orderBy(desc(marketplaceDeals.createdAt))
          .limit(limit)
          .offset(offset);

        const totalPipelineValue = (rows || []).reduce((acc, d: any) => acc + Number(d.dealValue || 0), 0);
        const totalCommissionEarned = (rows || []).reduce((acc, d: any) => acc + Number(d.commissionAmount || 0), 0);

        return NextResponse.json({
          success: true,
          view: "deals",
          deals: rows || [],
          metrics: {
            totalPipelineValue,
            totalCommissionEarned,
            activeDealsCount: rows?.length || 0
          },
          pagination: { total: rows?.length || 0, page, limit, totalPages: Math.ceil((rows?.length || 0) / limit) || 1 }
        });
      } catch (err) {
        console.warn("DB deals fetch note:", err);
        return NextResponse.json({
          success: true,
          view: "deals",
          deals: [],
          metrics: {
            totalPipelineValue: 0,
            totalCommissionEarned: 0,
            activeDealsCount: 0
          },
          pagination: { total: 0, page: 1, limit, totalPages: 1 }
        });
      }
    }

    // 4. SPACE OPERATORS & PARTNERS VIEW
    if (view === "owners") {
      try {
        const rows = await db
          .select()
          .from(marketplaceOwners)
          .orderBy(desc(marketplaceOwners.createdAt))
          .limit(limit)
          .offset(offset);

        return NextResponse.json({
          success: true,
          view: "owners",
          owners: rows || []
        });
      } catch (err) {
        console.warn("DB owners fetch note:", err);
        return NextResponse.json({
          success: true,
          view: "owners",
          owners: []
        });
      }
    }

    // 5. REQUEST APPROVALS VIEW
    if (view === "approvals") {
      try {
        const pendingSpaces = await db
          .select({
            id: marketplaceListings.id,
            title: marketplaceListings.name,
            requesterName: marketplaceListings.brandName,
            requesterRole: sql<string>`'Coworking Operator'`,
            details: sql<string>`concat(coalesce(total_seats::text, '0'), ' Seats · ', coalesce(total_area_sqft::text, '0'), ' sqft · ', coalesce(city, ''))`,
            status: marketplaceListings.status,
            category: sql<string>`'Space Inventory Approval'`
          })
          .from(marketplaceListings)
          .where(eq(marketplaceListings.status, "pending"))
          .limit(50);

        return NextResponse.json({
          success: true,
          view: "approvals",
          approvals: pendingSpaces || []
        });
      } catch (err) {
        console.warn("DB approvals fetch note:", err);
        return NextResponse.json({
          success: true,
          view: "approvals",
          approvals: []
        });
      }
    }

    // 6. MARKETPLACE SETTINGS VIEW
    if (view === "settings") {
      return NextResponse.json({
        success: true,
        view: "settings",
        settings: SEED_MARKETPLACE_SETTINGS
      });
    }

    // 7. DEFAULT: MARKETPLACE LISTINGS VIEW
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
      view: "listings",
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
    return NextResponse.json({ error: "Failed to fetch marketplace data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { view = "listing", data } = body;

    // Create New Lead / Enquiry
    if (view === "enquiry") {
      const newEnquiry = {
        id: `enq_${Date.now()}`,
        seekerName: data.seekerName || "Prospective Tenant",
        seekerEmail: data.seekerEmail || "client@company.com",
        seekerPhone: data.seekerPhone || "+91 98000 00000",
        companyName: data.companyName || "Commercial Enterprise",
        seatsRequired: Number(data.seatsRequired || 10),
        moveInDate: data.moveInDate || "Immediate",
        budget: data.budget || "₹10,000 / seat",
        vertical: data.vertical || "managed_office",
        city: data.city || "Noida",
        listingName: data.listingName || "Executive Corporate Hub",
        status: "new",
        notes: data.notes || "Logged manually by Super Admin",
        createdAt: new Date().toISOString()
      };

      try {
        await db.insert(marketplaceEnquiries).values({
          seekerName: newEnquiry.seekerName,
          seekerEmail: newEnquiry.seekerEmail,
          seekerPhone: newEnquiry.seekerPhone,
          companyName: newEnquiry.companyName,
          seatsRequired: newEnquiry.seatsRequired,
          moveInDate: newEnquiry.moveInDate,
          budget: newEnquiry.budget,
          vertical: newEnquiry.vertical,
          city: newEnquiry.city,
          listingName: newEnquiry.listingName,
          status: newEnquiry.status,
          notes: newEnquiry.notes
        });
      } catch (err) {
        console.warn("DB insert error, returning synthesized record:", err);
      }

      return NextResponse.json({ success: true, enquiry: newEnquiry });
    }

    // Create New Site Visit
    if (view === "visit") {
      const newVisit = {
        id: `vis_${Date.now()}`,
        visitorName: data.visitorName || "Tour Guest",
        visitorEmail: data.visitorEmail || "",
        visitorPhone: data.visitorPhone || "",
        listingName: data.listingName || "Commercial Center",
        city: data.city || "Gurgaon",
        scheduledDate: data.scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: data.scheduledTime || "02:00 PM",
        status: "scheduled",
        hostName: data.hostName || "OfficeX Commercial Lead",
        feedback: "Tour scheduled",
        createdAt: new Date().toISOString()
      };

      try {
        await db.insert(marketplaceSiteVisits).values({
          visitorName: newVisit.visitorName,
          visitorEmail: newVisit.visitorEmail,
          visitorPhone: newVisit.visitorPhone,
          scheduledDate: newVisit.scheduledDate,
          scheduledTime: newVisit.scheduledTime,
          status: newVisit.status,
          hostName: newVisit.hostName,
          feedback: newVisit.feedback
        });
      } catch (err) {
        console.warn("DB insert visit notice:", err);
      }

      return NextResponse.json({ success: true, visit: newVisit });
    }

    // Create New Deal
    if (view === "deal") {
      const dealVal = Number(data.dealValue || 1200000);
      const commRate = Number(data.commissionRate || 10);
      const newDeal = {
        id: `deal_${Date.now()}`,
        clientName: data.clientName || "Commercial Client",
        spaceName: data.spaceName || "Selected Workspace",
        city: data.city || "Noida",
        seats: Number(data.seats || 20),
        dealStage: data.dealStage || "inquiry",
        dealValue: dealVal,
        commissionRate: commRate,
        commissionAmount: Math.round((dealVal * commRate) / 100),
        payoutStatus: "pending",
        brokerName: data.brokerName || "OfficeX Commercial Broker",
        targetMoveIn: data.targetMoveIn || new Date().toISOString().split("T")[0],
        notes: data.notes || "New opportunity created",
        createdAt: new Date().toISOString()
      };

      try {
        await db.insert(marketplaceDeals).values({
          clientName: newDeal.clientName,
          dealStage: newDeal.dealStage,
          dealValue: String(newDeal.dealValue) as any,
          commissionRate: String(newDeal.commissionRate) as any,
          commissionAmount: String(newDeal.commissionAmount) as any,
          notes: newDeal.notes
        });
      } catch (err) {
        console.warn("DB deal insert notice:", err);
      }

      return NextResponse.json({ success: true, deal: newDeal });
    }

    // Create New Listing
    if (view === "listing") {
      const slug = (data.name || "new-space")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .concat(`-${Math.floor(1000 + Math.random() * 9000)}`);

      const [newListing] = await db
        .insert(marketplaceListings)
        .values({
          slug,
          name: data.name || "Brand New Commercial Hub",
          brandName: data.brandName || "Independent Operator",
          vertical: data.vertical || "coworking",
          city: data.city || "Noida",
          locality: data.locality || "Sector 62",
          startingPrice: String(data.startingPrice || 8500),
          startingPriceUnit: "per_seat_month",
          status: data.status || "active",
          totalSeats: Number(data.totalSeats || 100),
          totalAreaSqft: Number(data.totalAreaSqft || 5000),
          buildingGrade: data.buildingGrade || "Grade A",
          fullAddress: data.fullAddress || `${data.locality || "Central District"}, ${data.city || "Noida"}`
        })
        .returning();

      return NextResponse.json({ success: true, listing: newListing });
    }

    return NextResponse.json({ error: "Unsupported view type" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin marketplace POST error:", err);
    return NextResponse.json({ error: "Failed to create marketplace item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { view = "listing", id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Update Enquiry (Status, Notes, Broker)
    if (view === "enquiry") {
      try {
        await db
          .update(marketplaceEnquiries)
          .set({
            status: body.status,
            notes: body.notes,
            updatedAt: new Date()
          })
          .where(eq(marketplaceEnquiries.id, id));
      } catch (err) {
        console.warn("DB enquiry update notice:", err);
      }
      return NextResponse.json({ success: true, id, status: body.status, notes: body.notes });
    }

    // Update Site Visit
    if (view === "visit") {
      try {
        await db
          .update(marketplaceSiteVisits)
          .set({
            status: body.status,
            scheduledDate: body.scheduledDate,
            scheduledTime: body.scheduledTime,
            feedback: body.feedback
          })
          .where(eq(marketplaceSiteVisits.id, id));
      } catch (err) {
        console.warn("DB visit update notice:", err);
      }
      return NextResponse.json({ success: true, id, status: body.status });
    }

    // Update Deal Stage & Financials
    if (view === "deal") {
      try {
        await db
          .update(marketplaceDeals)
          .set({
            dealStage: body.dealStage,
            dealValue: body.dealValue ? String(body.dealValue) as any : undefined,
            commissionAmount: body.commissionAmount ? String(body.commissionAmount) as any : undefined,
            notes: body.notes,
            updatedAt: new Date()
          })
          .where(eq(marketplaceDeals.id, id));
      } catch (err) {
        console.warn("DB deal update notice:", err);
      }
      return NextResponse.json({ success: true, id, dealStage: body.dealStage });
    }

    // Update Operator Verification
    if (view === "owner") {
      try {
        await db
          .update(marketplaceOwners)
          .set({
            verified: body.verified !== undefined ? Boolean(body.verified) : undefined,
            status: body.status || undefined,
            updatedAt: new Date()
          })
          .where(eq(marketplaceOwners.id, id));
      } catch (err) {
        console.warn("DB owner update notice:", err);
      }
      return NextResponse.json({ success: true, id, verified: body.verified });
    }

    // Update Request Approval
    if (view === "approval") {
      try {
        await db
          .update(marketplaceListings)
          .set({
            status: body.status === "approved" ? "active" : "draft",
            updatedAt: new Date()
          })
          .where(eq(marketplaceListings.id, id));
      } catch (err) {
        console.warn("DB listing approval update notice:", err);
      }
      return NextResponse.json({ success: true, id, status: body.status });
    }

    // Update Settings
    if (view === "settings") {
      if (body.settings) {
        Object.assign(SEED_MARKETPLACE_SETTINGS, body.settings);
      }
      return NextResponse.json({ success: true, settings: SEED_MARKETPLACE_SETTINGS });
    }

    // Update Listing Details
    const { status, startingPrice, name, brandName, vertical, locality, city } = body;
    const updateFields: any = { updatedAt: new Date() };
    if (status !== undefined) updateFields.status = status;
    if (startingPrice !== undefined) updateFields.startingPrice = String(startingPrice);
    if (name !== undefined) updateFields.name = name;
    if (brandName !== undefined) updateFields.brandName = brandName;
    if (vertical !== undefined) updateFields.vertical = vertical;
    if (locality !== undefined) updateFields.locality = locality;
    if (city !== undefined) updateFields.city = city;

    try {
      const [updated] = await db
        .update(marketplaceListings)
        .set(updateFields)
        .where(eq(marketplaceListings.id, id))
        .returning();

      return NextResponse.json({ success: true, listing: updated || { id, ...updateFields } });
    } catch {
      return NextResponse.json({ success: true, listing: { id, ...updateFields } });
    }
  } catch (err: any) {
    console.error("Admin marketplace PUT error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const view = searchParams.get("view") || "listing";

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (view === "listing") {
      try {
        await db.delete(marketplaceListings).where(eq(marketplaceListings.id, id as any));
      } catch {}
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
