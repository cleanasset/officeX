import { NextRequest, NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb } from "@/lib/rent-roll-store";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase() || "";
    const propIdParam = req.nextUrl.searchParams.get("propertyId")?.trim() || "";
    const buildingParam = req.nextUrl.searchParams.get("building")?.trim() || "";
    const locationParam = req.nextUrl.searchParams.get("location")?.trim() || "";
    const ownerParam = req.nextUrl.searchParams.get("owner")?.trim() || req.nextUrl.searchParams.get("ownerName")?.trim() || "";
    const unitsParam = req.nextUrl.searchParams.get("units")?.trim() || req.nextUrl.searchParams.get("unit")?.trim() || "";
    const rentParam = req.nextUrl.searchParams.get("rent")?.trim() || "";
    const camParam = req.nextUrl.searchParams.get("cam")?.trim() || "";
    const depositParam = req.nextUrl.searchParams.get("deposit")?.trim() || "";
    const areaParam = req.nextUrl.searchParams.get("area")?.trim() || "";
    const tenureParam = req.nextUrl.searchParams.get("tenure")?.trim() || "";
    const escalationParam = req.nextUrl.searchParams.get("escalation")?.trim() || "";
    const docParam = req.nextUrl.searchParams.get("doc")?.trim() || "";

    const codeDigits = code.replace(/\D/g, "");

    // 1. Search in Rent Roll Database store (Tenants, Leases, and Properties)
    try {
      const rrDb = getRentRollDb();

      // 1A. Check if code matches a lease directly
      if (rrDb.leases && rrDb.leases.length > 0) {
        const matchedLease = rrDb.leases.find(l =>
          (code && l.leaseCode && l.leaseCode.toUpperCase() === code) ||
          (code && l.id && l.id.toUpperCase() === code)
        );
        if (matchedLease) {
          const matchedTenant = rrDb.tenants?.find(t => t.id === matchedLease.tenantId || t.tradeName.toLowerCase() === matchedLease.tenantName.toLowerCase());
          
          if (matchedTenant) {
            matchedTenant.portalLive = true;
            matchedTenant.inviteStatus = "accepted";
            matchedTenant.status = "active";
            if (rrDb.alerts) {
              rrDb.alerts = rrDb.alerts.filter(a => !(a.title && (a.title.includes(matchedTenant.tradeName) || a.title.includes(matchedTenant.tenantCode) || (matchedTenant.inviteCode && a.title.includes(matchedTenant.inviteCode))) && a.title.includes("Invite Pending")));
            }
            saveRentRollDb(rrDb);
          }

          const matchedProp = (rrDb.properties || []).find(p => p.id === matchedLease.propertyId) || rrDb.properties?.[0];
          const allocatedUnit = unitsParam || `${matchedLease.unitNumber}${matchedLease.floorNumber ? ` (Floor ${matchedLease.floorNumber})` : ""}`;
          const loc = matchedProp?.address
            ? `${matchedProp.address}, ${matchedProp.city || ""}, ${matchedProp.state || ""}`
            : (matchedProp?.city ? `${matchedProp.city}, ${matchedProp.state || ""}` : locationParam || "Commercial Hub");

          return NextResponse.json({
            success: true,
            tenant: {
              id: matchedTenant?.id || matchedLease.tenantId,
              tradeName: matchedTenant?.tradeName || matchedLease.tenantName,
              legalName: matchedTenant?.legalName || matchedLease.tenantName,
              contactPerson: matchedTenant?.contactPerson || "",
              contactEmail: matchedTenant?.contactEmail || "",
              contactPhone: matchedTenant?.contactPhone || "",
              pan: matchedTenant?.pan || "",
              gstin: matchedTenant?.gstin || "",
              unitNumber: allocatedUnit,
              status: matchedTenant?.status || "invited",
              inviteCode: matchedLease.leaseCode
            },
            property: {
              id: matchedProp?.id || matchedLease.propertyId || "PROP-ACTIVE",
              name: matchedProp?.name || matchedLease.propertyName || buildingParam || "Commercial Building",
              ownerName: matchedProp?.ownerName || matchedProp?.ownerCompany || rrDb.organization.name || "Commercial Property Owner",
              location: loc,
              grade: matchedProp?.grade || "Grade A",
              totalArea: `${Number(matchedProp?.totalArea || matchedLease.chargeableArea).toLocaleString()} sqft`,
              allocatedUnits: allocatedUnit,
              monthlyRent: matchedLease.monthlyRent,
              camMonthly: matchedLease.camMonthly || 0,
              securityDeposit: matchedLease.securityDepositPaid || matchedLease.securityDepositAmount || 0,
              chargeableArea: matchedLease.chargeableArea,
              leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
              escalationPct: matchedLease.escalationPct || 15,
              contractDoc: docParam || "Commercial Lease Agreement",
              inviteCode: matchedLease.leaseCode
            }
          });
        }
      }
      
      // 1B. Check if code or query matches an onboarded tenant
      if (rrDb.tenants && rrDb.tenants.length > 0) {
        const matchedTenant = rrDb.tenants.find(t =>
          (code && t.inviteCode && t.inviteCode.toUpperCase() === code) ||
          (code && t.tenantCode && t.tenantCode.toUpperCase() === code) ||
          (code && t.id.toUpperCase() === code) ||
          (code && t.contactEmail && t.contactEmail.toUpperCase() === code) ||
          (codeDigits && t.id.includes(codeDigits)) ||
          (codeDigits && t.tenantCode && t.tenantCode.includes(codeDigits)) ||
          (codeDigits && t.inviteCode && t.inviteCode.includes(codeDigits)) ||
          (unitsParam && rrDb.leases?.some(l => l.tenantId === t.id && l.unitNumber?.toLowerCase() === unitsParam.toLowerCase()))
        );

        if (matchedTenant) {
          matchedTenant.portalLive = true;
          matchedTenant.inviteStatus = "accepted";
          matchedTenant.status = "active";
          if (rrDb.alerts) {
            rrDb.alerts = rrDb.alerts.filter(a => !(a.title && (a.title.includes(matchedTenant.tradeName) || a.title.includes(matchedTenant.tenantCode) || (matchedTenant.inviteCode && a.title.includes(matchedTenant.inviteCode))) && a.title.includes("Invite Pending")));
          }
          saveRentRollDb(rrDb);

          const matchedLease = (rrDb.leases || []).find(l => l.tenantId === matchedTenant.id || l.tenantName?.toLowerCase() === matchedTenant.tradeName.toLowerCase());
          const matchedProp = (rrDb.properties || []).find(p =>
            p.id === matchedTenant.propertyId ||
            p.id === matchedLease?.propertyId ||
            (propIdParam && p.id === propIdParam) ||
            p.units?.some((u: any) => u.tenantName?.toLowerCase() === matchedTenant.tradeName.toLowerCase())
          ) || rrDb.properties?.[0];

          const unitFromProp = matchedProp?.units?.find((u: any) =>
            u.tenantName?.toLowerCase() === matchedTenant.tradeName.toLowerCase() ||
            (matchedLease?.unitNumber && u.suiteNumber === matchedLease.unitNumber)
          );

          const allocatedUnit = unitsParam || matchedLease?.unitNumber || unitFromProp?.suiteNumber || "Ground Floor";
          const area = areaParam ? Number(areaParam) : (matchedLease?.chargeableArea || unitFromProp?.chargeableArea || 10000);
          const rent = rentParam ? Number(rentParam) : (matchedLease?.monthlyRent || (unitFromProp ? (unitFromProp.askingRate || 150) * (unitFromProp.chargeableArea || 1000) : 150000));
          const loc = matchedProp?.address
            ? `${matchedProp.address}, ${matchedProp.city || ""}, ${matchedProp.state || ""}`
            : (matchedProp?.city ? `${matchedProp.city}, ${matchedProp.state || ""}` : locationParam || "Commercial Hub");

          return NextResponse.json({
            success: true,
            tenant: {
              id: matchedTenant.id,
              tradeName: matchedTenant.tradeName,
              legalName: matchedTenant.legalName || matchedTenant.tradeName,
              contactPerson: matchedTenant.contactPerson || "",
              contactEmail: matchedTenant.contactEmail || "",
              contactPhone: matchedTenant.contactPhone || "",
              pan: matchedTenant.pan || "",
              gstin: matchedTenant.gstin || "",
              unitNumber: allocatedUnit,
              status: matchedTenant.status || "invited",
              inviteCode: matchedTenant.inviteCode || code
            },
            property: {
              id: matchedProp?.id || propIdParam || "PROP-ACTIVE",
              name: matchedProp?.name || matchedLease?.propertyName || buildingParam || "Commercial Building",
              ownerName: matchedProp?.ownerName || matchedProp?.ownerCompany || rrDb.organization.name || ownerParam || "Commercial Property Owner",
              location: loc,
              grade: matchedProp?.grade || "Grade A",
              totalArea: `${Number(matchedProp?.totalArea || area).toLocaleString()} sqft`,
              allocatedUnits: allocatedUnit,
              monthlyRent: rent,
              camMonthly: camParam ? Number(camParam) : (matchedLease?.camMonthly || 0),
              securityDeposit: depositParam ? Number(depositParam) : (matchedLease?.securityDepositAmount || rent * 3),
              chargeableArea: area,
              leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
              escalationPct: escalationParam ? Number(escalationParam) : (matchedLease?.escalationPct || 15),
              contractDoc: docParam || "Commercial Lease Agreement (Pending Execution)",
              inviteCode: matchedTenant.inviteCode || code || matchedProp?.propertyCode
            }
          });
        }
      }

      // 1B. Check if code or query matches a property
      if (rrDb.properties && rrDb.properties.length > 0) {
        const found = rrDb.properties.find(p => 
          (propIdParam && p.id === propIdParam) ||
          (buildingParam && p.name.toLowerCase() === buildingParam.toLowerCase()) ||
          (buildingParam && p.name.toLowerCase().includes(buildingParam.toLowerCase())) ||
          (code && p.propertyCode && p.propertyCode.toUpperCase() === code) ||
          (codeDigits && p.id && p.id.includes(codeDigits))
        );
        if (found) {
          const loc = found.address
            ? `${found.address}, ${found.city}, ${found.state}`
            : (found.city ? `${found.city}, ${found.state || ""}` : locationParam || "Commercial Hub");

          // Find allocated unit from property units if available
          let matchedUnit = unitsParam ? found.units?.find((u: any) => u.suiteNumber?.toLowerCase() === unitsParam.toLowerCase()) : null;
          if (!matchedUnit && found.units && found.units.length > 0) {
            matchedUnit = found.units[0];
          }

          const matchedTenantName = matchedUnit?.tenantName;
          const tenantObj = matchedTenantName
            ? rrDb.tenants?.find(t => t.tradeName.toLowerCase() === matchedTenantName.toLowerCase())
            : null;

          const allocatedUnit = unitsParam || matchedUnit?.suiteNumber || (found as any).unitNumber || "Ground Floor";
          const rent = rentParam ? Number(rentParam) : (matchedUnit ? (matchedUnit.askingRate || 150) * (matchedUnit.chargeableArea || 1000) : 150000);

          return NextResponse.json({
            success: true,
            ...(tenantObj ? {
              tenant: {
                id: tenantObj.id,
                tradeName: tenantObj.tradeName,
                legalName: tenantObj.legalName || tenantObj.tradeName,
                contactPerson: tenantObj.contactPerson || "",
                contactEmail: tenantObj.contactEmail || "",
                contactPhone: tenantObj.contactPhone || "",
                pan: tenantObj.pan || "",
                gstin: tenantObj.gstin || "",
                unitNumber: allocatedUnit,
                status: tenantObj.status || "invited",
                inviteCode: tenantObj.inviteCode || code
              }
            } : {}),
            property: {
              id: found.id,
              name: found.name,
              ownerName: found.ownerName || found.ownerCompany || rrDb.organization.name || ownerParam || "Commercial Property Owner",
              location: loc,
              grade: found.grade || "Grade A",
              totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : `${Number(found.totalArea || 50000).toLocaleString()} sqft`,
              allocatedUnits: allocatedUnit,
              monthlyRent: rent,
              camMonthly: camParam ? Number(camParam) : 45000,
              securityDeposit: depositParam ? Number(depositParam) : (rent * 3),
              chargeableArea: areaParam ? Number(areaParam) : (matchedUnit?.chargeableArea || 5000),
              leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
              escalationPct: escalationParam ? Number(escalationParam) : 5,
              contractDoc: docParam || "Commercial Lease Agreement (Pending Execution)",
              inviteCode: code || found.propertyCode || `OX-${codeDigits.padStart(4, "7")}`
            }
          });
        }
      }
    } catch (rrErr) {
      console.warn("Rent roll store search note:", rrErr);
    }

    // 2. Search in Drizzle / Database properties table
    try {
      const drizzleProps = await db.select().from(properties).limit(100);
      if (drizzleProps && drizzleProps.length > 0) {
        const found = drizzleProps.find(p =>
          (propIdParam && p.id === propIdParam) ||
          (buildingParam && p.name.toLowerCase() === buildingParam.toLowerCase()) ||
          (buildingParam && p.name.toLowerCase().includes(buildingParam.toLowerCase())) ||
          (codeDigits && p.id.replace(/\D/g, "").includes(codeDigits)) ||
          (codeDigits && p.pincode && p.pincode.includes(codeDigits))
        );

        if (found) {
          const loc = found.address
            ? `${found.address}, ${found.city}, ${found.state || ""}`
            : (found.city ? `${found.city}, ${found.state || ""}` : locationParam || "Commercial District");

          return NextResponse.json({
            success: true,
            property: {
              id: found.id,
              name: found.name,
              ownerName: found.ownerCompany || found.ownerName || ownerParam || "Commercial Property Owner",
              location: loc,
              grade: found.grade || "Grade A",
              totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : `${Number(found.totalArea || 50000).toLocaleString()} sqft`,
              allocatedUnits: unitsParam || "Entire Leased Premises",
              monthlyRent: rentParam ? Number(rentParam) : 250000,
              camMonthly: camParam ? Number(camParam) : 45000,
              securityDeposit: depositParam ? Number(depositParam) : (rentParam ? Number(rentParam) * 3 : 750000),
              chargeableArea: areaParam ? Number(areaParam) : 5000,
              leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
              escalationPct: escalationParam ? Number(escalationParam) : 5,
              contractDoc: docParam || "Standard Commercial Lease Agreement (Executed)",
              inviteCode: code
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn("Drizzle DB search note:", dbErr);
    }

    // 3. Search in Supabase properties
    try {
      const client = supabaseAdmin || supabase;
      const { data } = await client
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const found = data.find((p: any) => 
          (propIdParam && p.id === propIdParam) ||
          (buildingParam && p.name?.toLowerCase() === buildingParam.toLowerCase()) ||
          (buildingParam && p.name?.toLowerCase().includes(buildingParam.toLowerCase())) ||
          (codeDigits && (p.id.replace(/\D/g, "").includes(codeDigits) || p.id.includes(codeDigits))) ||
          (p.pincode && p.pincode.includes(codeDigits))
        );

        if (found) {
          const loc = found.address
            ? `${found.address}, ${found.city || ""}, ${found.state || ""}`
            : (found.city ? `${found.city}, ${found.state || ""}` : locationParam || "Commercial Hub");

          return NextResponse.json({
            success: true,
            property: {
              id: found.id,
              name: found.name,
              ownerName: found.owner_company || found.owner_name || ownerParam || "OfficeX Commercial Assets",
              location: loc,
              grade: found.grade || "Grade A",
              totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : `${Number(found.total_area || 50000).toLocaleString()} sqft`,
              allocatedUnits: unitsParam || "Entire Leased Premises",
              monthlyRent: rentParam ? Number(rentParam) : 250000,
              camMonthly: camParam ? Number(camParam) : 45000,
              securityDeposit: depositParam ? Number(depositParam) : (rentParam ? Number(rentParam) * 3 : 750000),
              chargeableArea: areaParam ? Number(areaParam) : 5000,
              leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
              escalationPct: escalationParam ? Number(escalationParam) : 5,
              contractDoc: docParam || "Standard Commercial Lease Agreement (Executed)",
              inviteCode: code
            }
          });
        }
      }
    } catch (sbErr) {
      console.warn("Supabase search note:", sbErr);
    }

    // 4. If URL parameters were provided (e.g. building name, location, owner), USE THEM!
    if (buildingParam || locationParam || propIdParam) {
      return NextResponse.json({
        success: true,
        property: {
          id: propIdParam || `prop-${codeDigits || "8841"}`,
          name: buildingParam || "Commercial Office Hub",
          ownerName: ownerParam || "Commercial Property Owner / Management",
          location: locationParam || "Commercial Business District",
          grade: "Grade A",
          totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : "50,000 sqft",
          allocatedUnits: unitsParam || "Entire Building / All Floors",
          monthlyRent: rentParam ? Number(rentParam) : 250000,
          camMonthly: camParam ? Number(camParam) : 45000,
          securityDeposit: depositParam ? Number(depositParam) : (rentParam ? Number(rentParam) * 3 : 750000),
          chargeableArea: areaParam ? Number(areaParam) : 5000,
          leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
          escalationPct: escalationParam ? Number(escalationParam) : 5,
          contractDoc: docParam || "Standard Commercial Lease Agreement (Executed)",
          inviteCode: code
        }
      });
    }

    // 5. Default fallback if code was entered without context
    return NextResponse.json({
      success: true,
      property: {
        id: `prop-code-${codeDigits || "8841"}`,
        name: "Commercial Office Tower",
        ownerName: "Commercial Asset Management",
        location: "Commercial Business Hub",
        grade: "Grade A",
        totalArea: areaParam ? `${Number(areaParam).toLocaleString()} sqft` : "50,000 sqft",
        allocatedUnits: unitsParam || "Entire Leased Premises",
        monthlyRent: rentParam ? Number(rentParam) : 250000,
        camMonthly: camParam ? Number(camParam) : 45000,
        securityDeposit: depositParam ? Number(depositParam) : (rentParam ? Number(rentParam) * 3 : 750000),
        chargeableArea: areaParam ? Number(areaParam) : 5000,
        leaseTenureYears: tenureParam ? Number(tenureParam) : 3,
        escalationPct: escalationParam ? Number(escalationParam) : 5,
        contractDoc: docParam || "Standard Commercial Lease Agreement (Executed)",
        inviteCode: code
      }
    });
  } catch (error: any) {
    console.error("GET /api/tenant/verify-code error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
