import { NextResponse } from "next/server";
import { db } from "@/db";
import { ownerProfiles, brokerProfiles, vendorProfiles } from "@/db/schema";

export async function POST(req: Request, { params }: { params: Promise<{ role: string }> }) {
  try {
    const { role } = await params;
    const normalizedRole = role.toLowerCase().replace(/_/g, "-");
    const body = await req.json();
    const { organizationId, ...profileData } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is mandatory." }, { status: 400 });
    }

    if (normalizedRole === "owner" || normalizedRole === "property-owner") {
      const {
        ownershipType = "OWNER",
        assetTypes = ["OFFICE"],
        portfolioPropertyCount = 1,
        portfolioAreaSqft = 0,
        operatingCities = ["Mumbai"],
        approxLeasableAreaSqft = 0,
        approxOccupancyPct = 90,
        servicesRequired = ["LEASING", "PROPERTY_MGMT", "RENT_ROLL"]
      } = profileData;

      try {
        if (/^[0-9a-fA-F-]{36}$/.test(organizationId)) {
          await db.insert(ownerProfiles).values({
            organizationId,
            ownershipType,
            assetTypes,
            portfolioPropertyCount: parseInt(portfolioPropertyCount) || 0,
            portfolioAreaSqft: String(portfolioAreaSqft),
            operatingCities,
            approxLeasableAreaSqft: String(approxLeasableAreaSqft),
            approxOccupancyPct: String(approxOccupancyPct),
            servicesRequired,
            ownershipProofRequired: true
          });
        }
      } catch (dbErr) {
        console.warn("Could not insert owner profile to DB:", dbErr);
      }

      return NextResponse.json({
        success: true,
        role: "OWNER",
        message: "Property Owner business profile saved.",
        profile: {
          organizationId,
          ownershipType,
          assetTypes,
          portfolioPropertyCount,
          portfolioAreaSqft,
          operatingCities,
          approxLeasableAreaSqft,
          approxOccupancyPct,
          servicesRequired
        }
      });
    }

    if (normalizedRole === "broker" || normalizedRole === "leasing-broker") {
      const {
        brokerType = "FIRM",
        services = ["COMMERCIAL_LEASING", "OFFICE"],
        operatingCities = ["Mumbai"],
        operatingMicroMarkets = [],
        reraApplicable = false,
        reraRegistrationNo = "",
        yearsInBusiness = 5,
        teamSizeBand = "6–10",
        clientTypes = ["CORPORATE", "SME"],
        typicalDealSizeBand = "₹25L – ₹1Cr",
        transactionsPerYearBand = "6–20"
      } = profileData;

      if (reraApplicable && !reraRegistrationNo) {
        return NextResponse.json(
          { error: "RERA Registration Number is required when RERA is applicable." },
          { status: 400 }
        );
      }

      try {
        if (/^[0-9a-fA-F-]{36}$/.test(organizationId)) {
          await db.insert(brokerProfiles).values({
            organizationId,
            brokerType,
            services,
            operatingCities,
            operatingMicroMarkets,
            reraApplicable: Boolean(reraApplicable),
            reraRegistrationNo: reraRegistrationNo || null,
            yearsInBusiness: parseInt(yearsInBusiness) || 0,
            teamSizeBand,
            clientTypes,
            typicalDealSizeBand,
            transactionsPerYearBand
          });
        }
      } catch (dbErr) {
        console.warn("Could not insert broker profile to DB:", dbErr);
      }

      return NextResponse.json({
        success: true,
        role: "BROKER",
        message: "Commercial Leasing Broker profile saved.",
        profile: {
          organizationId,
          brokerType,
          services,
          operatingCities,
          operatingMicroMarkets,
          reraApplicable,
          reraRegistrationNo,
          yearsInBusiness,
          teamSizeBand,
          clientTypes,
          typicalDealSizeBand,
          transactionsPerYearBand
        }
      });
    }

    if (normalizedRole === "vendor" || normalizedRole === "service-vendor") {
      const {
        vendorCategory = ["MEP", "HVAC"],
        serviceSubcategories = [],
        citiesServed = ["Mumbai"],
        buildingSegments = ["OFFICE", "IT_PARK"],
        yearsInBusiness = 8,
        employeeCount = 45,
        technicalStaffCount = 20,
        activeClientCount = 12,
        managedAreaSqft = 250000,
        insuranceAvailable = true,
        pfRegistration = true,
        esicRegistration = true,
        isoCertifications = ["ISO 9001:2015"],
        licensesCertifications = ["Electrical Contractor License A-Grade"],
        rfpResponseEnabled = true
      } = profileData;

      try {
        if (/^[0-9a-fA-F-]{36}$/.test(organizationId)) {
          await db.insert(vendorProfiles).values({
            organizationId,
            vendorCategory,
            serviceSubcategories,
            citiesServed,
            buildingSegments,
            yearsInBusiness: parseInt(yearsInBusiness) || 0,
            employeeCount: parseInt(employeeCount) || 0,
            technicalStaffCount: parseInt(technicalStaffCount) || 0,
            activeClientCount: parseInt(activeClientCount) || 0,
            managedAreaSqft: String(managedAreaSqft),
            insuranceAvailable: Boolean(insuranceAvailable),
            pfRegistration: Boolean(pfRegistration),
            esicRegistration: Boolean(esicRegistration),
            isoCertifications,
            licensesCertifications,
            rfpResponseEnabled: Boolean(rfpResponseEnabled),
            bankDetailsStatus: "pending"
          });
        }
      } catch (dbErr) {
        console.warn("Could not insert vendor profile to DB:", dbErr);
      }

      return NextResponse.json({
        success: true,
        role: "VENDOR",
        message: "Facility & Service Vendor profile saved.",
        profile: {
          organizationId,
          vendorCategory,
          citiesServed,
          buildingSegments,
          yearsInBusiness,
          employeeCount,
          technicalStaffCount,
          insuranceAvailable,
          pfRegistration,
          esicRegistration
        }
      });
    }

    return NextResponse.json(
      { error: `Profile saving for role '${role}' is not supported yet.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Profile saving error:", err);
    return NextResponse.json({ error: err.message || "Failed to save profile." }, { status: 500 });
  }
}
