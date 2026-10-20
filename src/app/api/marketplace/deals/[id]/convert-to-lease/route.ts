import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceDeals, marketplaceEnquiries, marketplaceListings } from "@/db/marketplace-schema";
import { leases, properties, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params;

    // 1. Fetch deal
    const dealResults = await db
      .select()
      .from(marketplaceDeals)
      .where(eq(marketplaceDeals.id, dealId))
      .limit(1);

    const deal = dealResults[0];
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // 2. Fetch enquiry & listing
    const [enquiry, listing] = await Promise.all([
      deal.enquiryId
        ? db.select().from(marketplaceEnquiries).where(eq(marketplaceEnquiries.id, deal.enquiryId)).limit(1).then(r => r[0])
        : null,
      deal.listingId
        ? db.select().from(marketplaceListings).where(eq(marketplaceListings.id, deal.listingId)).limit(1).then(r => r[0])
        : null
    ]);

    // 3. Find or create matching property in SaaS properties table
    let propId: string | null = null;
    if (listing) {
      const existingProps = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.name, listing.name))
        .limit(1);

      if (existingProps.length > 0) {
        propId = existingProps[0].id;
      }
    }

    // 4. Update deal stage to closed_won
    await db
      .update(marketplaceDeals)
      .set({
        dealStage: "closed_won",
        updatedAt: new Date()
      })
      .where(eq(marketplaceDeals.id, dealId));

    // 5. Create or connect tenant
    const tenantName = deal.clientName || enquiry?.companyName || "Marketplace Corporate Tenant";
    const tenantCode = `TNT-MP-${Date.now().toString().slice(-4)}`;

    const [createdTenant] = await db
      .insert(tenants)
      .values({
        tenantCode,
        tradeName: tenantName,
        legalName: tenantName,
        contactPerson: enquiry?.seekerName || tenantName,
        contactEmail: enquiry?.seekerEmail || "corporate@tenant.in",
        contactPhone: enquiry?.seekerPhone || "+91 98000 00000",
        billingAddress: listing?.fullAddress || "Marketplace Facility Center",
        billingCity: listing?.city || "Bangalore",
        billingState: "State",
        billingPincode: listing?.pincode || "560001",
        status: "active"
      })
      .returning();

    // 6. Create active Lease record in Rent Roll
    const monthlyRent = deal.dealValue ? String(Math.round(Number(deal.dealValue) / 12)) : "150000.00";
    const leaseCode = `LSE-MP-${Date.now().toString().slice(-4)}`;

    const [createdLease] = await db
      .insert(leases)
      .values({
        leaseCode,
        tenantCompanyId: createdTenant.id,
        propertyId: propId || undefined,
        unitNumber: "Suite-MP-101",
        chargeableArea: "3500.00",
        carpetArea: "2800.00",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3).toISOString().split("T")[0],
        billingFrequency: "monthly",
        baseRentPsf: "125.00",
        monthlyRent: monthlyRent,
        camRatePsf: "18.00",
        camMonthly: "63000.00",
        securityDeposit: String(Number(monthlyRent) * 3),
        securityDepositMonths: 3,
        lockInMonths: 36,
        noticePeriodDays: 90,
        escalationPct: "5.00",
        status: "active"
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Marketplace deal closed and synced to Rent Roll SaaS!",
      dealId: deal.id,
      tenantId: createdTenant.id,
      leaseId: createdLease.id,
      leaseCode: createdLease.leaseCode || leaseCode,
      rentRollUrl: `/properties/rent-roll?tab=contracts`
    });
  } catch (error: any) {
    console.error("Deal to lease conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert deal to lease", details: error.message },
      { status: 500 }
    );
  }
}
