import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getRentRollDb,
  saveRentRollDb,
  recordAuditLog,
  PropertyEntity,
  SpaceEntity,
  LeaseEntity,
  TenantEntity,
  ensureSpacesAndContractsForProperties
} from "@/lib/rent-roll-store";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();

    const {
      organization = {},
      billingEntities = [],
      chargeTypesList = [],
      branding = {},
      domainConfig = {},
      users = [],
      property = null,
      uploadedRows = [],
      makerCheckerLease = true,
      makerCheckerBilling = true,
      goLiveChecklist = {}
    } = body;

    // 1. Commit Organization Details
    const orgName = organization.legalName || organization.name || db.organization.name || "Commercial Assets";
    db.organization = {
      ...db.organization,
      name: orgName,
      pan: (organization.pan || db.organization.pan || "").toUpperCase().trim(),
      gstin: (organization.gstin || db.organization.gstin || "").toUpperCase().trim(),
      address: organization.primaryAddress || organization.address || db.organization.address || "",
      city: organization.city || db.organization.city || "",
      state: organization.state || db.organization.state || "",
      currency: organization.currency || "INR"
    };

    // 2. Commit Config & Visual Branding
    if (!db.config) {
      db.config = {
        leaseExpiryAlertDays: 90,
        escalationAlertDays: 30,
        defaultGstPct: 18,
        defaultPaymentDueDays: 15,
        currency: "INR",
        asOfDate: new Date().toISOString().split("T")[0]
      };
    }

    db.config.branding = {
      ...db.config.branding,
      portfolioDisplayName: branding.portfolioDisplayName || orgName,
      invoiceHeaderMemo: branding.invoiceHeaderMemo || "",
      brandColor: branding.brandColor || "#0F8B7D",
      logoUrl: branding.logoUrl || branding.logoPreview || ""
    };

    db.config.domainConfig = {
      ...db.config.domainConfig,
      ...domainConfig
    };

    db.config.makerCheckerLease = makerCheckerLease;
    db.config.makerCheckerBilling = makerCheckerBilling;
    db.config.goLiveChecklist = goLiveChecklist;

    if (users.length > 0) {
      db.config.users = users;
    }
    if (chargeTypesList.length > 0) {
      db.config.chargeTypesList = chargeTypesList;
    }

    // 3. Commit Billing Entities (SPVs)
    if (Array.isArray(billingEntities) && billingEntities.length > 0) {
      db.billingEntities = billingEntities.map((be: any, idx: number) => ({
        id: be.id || `BE-${Date.now()}-${idx}`,
        orgId: db.organization.id,
        clientAccountId: be.clientAccountId || "CA-SELF",
        legalName: be.legalName || be.spvName || orgName,
        tradeName: be.tradeName || organization.tradeName || orgName,
        pan: (be.pan || db.organization.pan || "").toUpperCase().trim(),
        gstin: (be.gstin || db.organization.gstin || "").toUpperCase().trim(),
        stateCode: be.stateCode || (be.gstin ? be.gstin.substring(0, 2) : "27"),
        registeredAddress: be.registeredAddress || db.organization.address,
        bankName: be.bankName || "HDFC Bank Ltd",
        bankAccountNumber: be.bankAccountNumber || be.accountNumber || "",
        bankIfsc: (be.bankIfsc || be.ifscCode || "").toUpperCase().trim(),
        bankBranch: be.bankBranch || "",
        invoicePrefix: be.invoicePrefix || `INV-${idx + 1}`,
        isDefault: be.isDefault ?? (idx === 0)
      }));
    }

    // 4. Resolve Primary Property & Spaces
    let committedProperty: PropertyEntity | null = null;
    const cookieStore = await cookies();
    const userEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();

    if (property && property.name) {
      const propId = property.id || `PROP-${Date.now()}`;
      const totalArea = Number(property.totalArea) || 50000;
      const cleanCode = property.name.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase();

      const newProp: PropertyEntity = {
        id: propId,
        orgId: db.organization.id,
        propertyCode: `PRP-${cleanCode}`,
        name: property.name,
        type: property.type || "Commercial Asset",
        address: property.address || db.organization.address,
        city: property.city || db.organization.city,
        state: property.state || db.organization.state,
        microMarket: property.microMarket || property.city || "",
        pincode: property.pincode || "380001",
        grade: property.grade || "A",
        totalArea,
        chargeableArea: totalArea,
        carpetArea: Math.round(totalArea * 0.8),
        occupancyTargetPct: 95,
        ownerName: orgName,
        ownerCompany: orgName,
        ownerEmail: userEmail || "owner@officex.com",
        status: "operational",
        sourceSystem: "onboarding_wizard",
        version: 1,
        dataQualityStatus: "passed"
      };

      committedProperty = newProp;
      // Remove any duplicate with the same id
      db.properties = db.properties.filter(p => p.id !== propId);
      db.properties.unshift(newProp);
    } else if (db.properties.length > 0) {
      // Use the first property
      committedProperty = db.properties[0];
      if (userEmail && (!committedProperty.ownerEmail || committedProperty.ownerEmail.includes("officex.com"))) {
        committedProperty.ownerEmail = userEmail;
      }
    } else {
      // Create primary property based on organization details
      const propId = `PROP-${Date.now()}`;
      const propName = `${orgName} Tower`;
      const totalArea = 50000;

      const autoProp: PropertyEntity = {
        id: propId,
        orgId: db.organization.id,
        propertyCode: "PRP-MAIN",
        name: propName,
        type: "Commercial Office",
        address: db.organization.address || "Main Commercial Street",
        city: db.organization.city || "Mumbai",
        state: db.organization.state || "Maharashtra",
        microMarket: "Prime Commercial",
        pincode: "400001",
        grade: "A",
        totalArea,
        chargeableArea: totalArea,
        carpetArea: Math.round(totalArea * 0.8),
        occupancyTargetPct: 95,
        ownerName: orgName,
        ownerCompany: orgName,
        ownerEmail: userEmail || "owner@officex.com",
        status: "operational",
        sourceSystem: "onboarding_auto",
        version: 1,
        dataQualityStatus: "passed"
      };
      committedProperty = autoProp;
      db.properties.unshift(autoProp);
    }

    // 5. Ingest Uploaded CSV Rows if provided
    if (Array.isArray(uploadedRows) && uploadedRows.length > 0 && committedProperty) {
      const prop = committedProperty;
      uploadedRows.forEach((r: any, idx: number) => {
        const area = Number(r.chargeableArea) || 5000;
        const rent = Number(r.monthlyRent) || (area * 150);
        const camPsf = Number(r.camRatePsf) || 25;
        const camMonthly = area * camPsf;
        const unit = r.unitNumber || `Unit ${101 + idx}`;
        const spaceId = `SPC-${prop.id.slice(-4)}-${unit.replace(/[^a-zA-Z0-9]/g, "")}`;
        const leaseId = `LEASE-${prop.id.slice(-4)}-${idx + 1}`;

        // Space
        db.spaces.push({
          id: spaceId,
          propertyId: prop.id,
          spaceCode: `${prop.propertyCode || "PRP"}-${unit}`,
          buildingName: prop.name,
          floorNumber: Number(r.floorNumber) || 1,
          unitNumber: unit,
          spaceType: "office",
          carpetArea: Math.round(area * 0.8),
          chargeableArea: area,
          standardRatePsf: Math.round(rent / area) || 150,
          standardCamPsf: camPsf,
          standardMarketRentPsf: Math.round(rent / area) || 150,
          potentialMonthlyRent: rent,
          daysVacant: 0,
          status: "occupied",
          currentLeaseId: leaseId
        });

        // Tenant
        const tenantName = r.tenantName || `Corporate Tenant ${idx + 1}`;
        let tenant = db.tenants.find(t => t.tradeName.toLowerCase() === tenantName.toLowerCase());
        if (!tenant) {
          tenant = {
            id: `TEN-${Date.now()}-${idx}`,
            orgId: db.organization.id,
            tenantCode: `T-${idx + 1}`,
            tradeName: tenantName,
            legalName: `${tenantName} India Pvt Ltd`,
            industry: "Technology / Corporate",
            pan: "AABCT9988F",
            gstin: "27AABCT9988F1Z2",
            contactPerson: "Corporate Real Estate Head",
            contactEmail: `admin@tenant${idx + 1}.com`,
            contactPhone: "+91 98200 11223",
            billingAddress: `${prop.address}, ${unit}`,
            billingCity: prop.city,
            billingState: prop.state || "Maharashtra",
            billingPincode: prop.pincode || "400001",
            status: "active",
            creditLimit: 5000000,
            paymentTermsDays: 15,
            createdAt: new Date().toISOString()
          };
          db.tenants.push(tenant);
        }

        // Contract
        db.leases.push({
          id: leaseId,
          orgId: db.organization.id,
          clientAccountId: "CA-SELF",
          billingEntityId: db.billingEntities[0]?.id || "",
          propertyId: prop.id,
          propertyName: prop.name,
          spaceId: spaceId,
          unitNumber: unit,
          floorNumber: Number(r.floorNumber) || 1,
          tenantId: tenant.id,
          tenantName,
          leaseCode: `${prop.propertyCode || "PRP"}-L-${idx + 1}`,
          direction: "receivable",
          contractType: "lease_deed",
          approvalStatus: "active",
          approvedBy: "System Onboarding",
          approvedAt: new Date().toISOString(),
          startDate: r.startDate || "2025-04-01",
          endDate: r.endDate || "2030-03-31",
          fitoutPeriodDays: 30,
          rentFreePeriodDays: 30,
          carpetArea: Math.round(area * 0.8),
          chargeableArea: area,
          monthlyRent: rent,
          baseRentPsf: Math.round(rent / area) || 150,
          camRatePsf: camPsf,
          camMonthly,
          utilityFixedMonthly: 25000,
          parkingChargesMonthly: 30000,
          signageChargesMonthly: 10000,
          otherChargesMonthly: 0,
          totalMonthlyGross: rent + camMonthly + 65000,
          annualRentGross: (rent + camMonthly + 65000) * 12,
          securityDepositMonths: 6,
          securityDepositAmount: rent * 6,
          securityDepositPaid: rent * 6,
          escalationPct: Number(r.escalationPct) || 15,
          escalationFrequencyMonths: 36,
          nextEscalationDate: "2028-04-01",
          lockInMonths: 36,
          lockInEndDate: "2028-03-31",
          noticePeriodDays: 90,
          status: "active",
          renewalStatus: "not_due",
          billingFrequency: "monthly",
          billingDueDay: 5,
          gstRate: 18,
          tdsRate: 10,
          brokeragePaid: rent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }

    // 6. Ensure every property has full spaces & contracts
    ensureSpacesAndContractsForProperties(db);
    saveRentRollDb(db);

    // 7. Sync Property to Supabase/PostgreSQL if configured
    try {
      const client = supabaseAdmin || supabase;
      if (client && committedProperty) {
        await client.from("properties").upsert({
          id: committedProperty.id,
          name: committedProperty.name,
          type: committedProperty.type,
          address: committedProperty.address,
          city: committedProperty.city,
          state: committedProperty.state,
          micro_market: committedProperty.microMarket,
          pincode: committedProperty.pincode,
          grade: committedProperty.grade,
          total_area: committedProperty.totalArea,
          owner_name: committedProperty.ownerName,
          owner_company: committedProperty.ownerCompany,
          owner_user_id: userEmail || "owner@officex.com"
        });
      }
    } catch (pgErr) {
      console.warn("Postgres sync on onboarding commit warning:", pgErr);
    }

    recordAuditLog({
      entityName: "OnboardingSuite",
      action: "PRODUCTION_GO_LIVE_COMMIT",
      newValues: {
        orgName,
        property: committedProperty?.name,
        spacesCount: db.spaces.length,
        contractsCount: db.leases.length,
        billingEntitiesCount: db.billingEntities.length
      },
      changedBy: "Org Super Admin"
    });

    return NextResponse.json({
      success: true,
      message: "Enterprise Rent Roll Master committed to production successfully.",
      organization: db.organization,
      branding: db.config.branding,
      property: committedProperty,
      spacesCount: db.spaces.length,
      contractsCount: db.leases.length,
      billingEntities: db.billingEntities
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/onboarding-commit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
