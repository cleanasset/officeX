import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getRentRollDb, saveRentRollDb, PropertyEntity, SpaceEntity, LeaseEntity, TenantEntity, EscalationEntity, ensureSpacesAndContractsForProperties } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const ownerUserId = searchParams.get("ownerUserId")?.trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail && !ownerUserId) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();

    // Auto-sync from Postgres only if explicitly requested via ?sync=1
    const shouldSync = searchParams.get("sync") === "1";
    if (shouldSync) {
      try {
        const client = supabaseAdmin || supabase;
        if (client) {
          const { data: dbProps } = await client.from('properties').select('*').order('created_at', { ascending: false });
          if (dbProps && dbProps.length > 0) {
            const existingNames = new Set(db.properties.map(p => (p.name || "").toLowerCase().trim()));
            let hasNew = false;
            for (const dp of dbProps) {
              const cleanName = (dp.name || "").toLowerCase().trim();
              if (cleanName && !existingNames.has(cleanName)) {
                db.properties.push({
                  id: dp.id,
                  orgId: db.organization.id,
                  propertyCode: `PRP-${(dp.name || 'PROP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`,
                  name: dp.name,
                  type: dp.type || "Commercial Office",
                  address: dp.address || "",
                  city: dp.city || "",
                  state: dp.state || "",
                  microMarket: dp.micro_market || dp.city || "",
                  pincode: dp.pincode || "",
                  grade: dp.grade || "A",
                  totalArea: Number(dp.total_area) || 0,
                  chargeableArea: Number(dp.total_area) || 0,
                  carpetArea: Number(dp.total_area) * 0.8,
                  occupancyTargetPct: 95,
                  ownerName: dp.owner_name || dp.owner_company,
                  ownerUserId: dp.owner_user_id || "",
                  ownerEmail: ownerEmail || "owner@officex.com",
                  sourceSystem: "postgres_sync",
                  version: 1,
                  dataQualityStatus: "passed",
                  status: "operational"
                });
                existingNames.add(cleanName);
                hasNew = true;
              }
            }
            if (hasNew) {
              saveRentRollDb(db);
            }
          }
        }
      } catch (syncErr) {
        console.warn("Postgres to rent-roll sync warning:", syncErr);
      }
    }

    const allDbProps = db.properties || [];
    const clientAccountId = searchParams.get("clientAccountId");
    let scopedProps: PropertyEntity[] = [];

    if (clientAccountId && clientAccountId !== "ALL") {
      scopedProps = allDbProps.filter(p => p.clientAccountId === clientAccountId);
    } else if (ownerEmail || ownerUserId) {
      const owned = allDbProps.filter(p => 
        (ownerEmail && (p.ownerEmail || "").toLowerCase().trim() === ownerEmail) ||
        (ownerUserId && p.ownerUserId === ownerUserId)
      );
      const isDemoUser = (ownerEmail && ownerEmail.includes("demo")) || isDemo;
      scopedProps = isDemoUser && owned.length === 0 ? allDbProps : owned;
    } else {
      scopedProps = allDbProps;
    }

    const properties = scopedProps.map(p => {
      const propLeases = db.leases.filter(l => l.propertyId === p.id && (l.status === "active" || l.status === "under_notice"));
      const occupiedArea = propLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
      const occupancyPct = p.totalArea > 0 ? Math.round((occupiedArea / p.totalArea) * 1000) / 10 : 0;
      const totalMonthlyRent = propLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
      const totalBilling = propLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);

      const propSpaces = (db.spaces || []).filter(s => s.propertyId === p.id);

      return {
        ...p,
        activeLeasesCount: propLeases.length,
        occupiedArea,
        vacantArea: Math.max(0, p.totalArea - occupiedArea),
        occupancyPct,
        totalMonthlyRent,
        totalBilling,
        spaces: propSpaces,
      };
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("GET /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      propertyCode,
      type,
      address,
      city,
      state,
      microMarket,
      pincode,
      grade,
      totalArea,
      chargeableArea,
      carpetArea,
      currency,
      operatingCurrency,
      areaUnit,
      geoLat,
      geoLng,
      status,
      entityType,
      cinNumber,
      llpinNumber,
      panNumber,
      gstin,
      assetValue,
      ownerEmail,
      ownerUserId,
      ownerName,
      clientAccountId,
      billingEntityId,
      towers,
      units,
      compliance,
      sourceSystem,
      version,
      dataQualityStatus
    } = body;
    if (!name) {
      return NextResponse.json({ error: "Property name is required" }, { status: 400 });
    }

    let effectiveEmail = (ownerEmail || "").toLowerCase().trim();
    if (!effectiveEmail) {
      try {
        const cookieStore = await cookies();
        effectiveEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    const propId = `PROP-${Date.now()}`;
    const newProp: PropertyEntity = {
      id: propId,
      orgId: body.orgId || db.organization.id,
      propertyCode: propertyCode || `PRP-${Date.now().toString().slice(-4)}`,
      clientAccountId: clientAccountId || "CLI-DEFAULT",
      billingEntityId: billingEntityId || undefined,
      name: name.trim(),
      type: type || "Commercial Office",
      address: address || "",
      city: city || "",
      state: state || "",
      microMarket: microMarket || city || "",
      pincode: pincode || "",
      grade: (grade as any) || "A",
      totalArea: Number(totalArea) || Number(chargeableArea) || 0,
      chargeableArea: Number(chargeableArea) || Number(totalArea) || 0,
      carpetArea: Number(carpetArea) || 0,
      occupancyTargetPct: 95,
      assetValue: Number(assetValue) || 0,
      operatingCurrency: currency || operatingCurrency || "INR",
      areaUnit: areaUnit || "sqft",
      geoLat: geoLat || "",
      geoLng: geoLng || "",
      status: status || "operational",
      entityType: entityType || "pvt_ltd",
      cinNumber: cinNumber || undefined,
      llpinNumber: llpinNumber || undefined,
      panNumber: panNumber || undefined,
      gstin: gstin || undefined,
      towers: Array.isArray(towers) ? towers : [],
      units: Array.isArray(units) ? units : [],
      compliance: compliance || {},
      ownerEmail: effectiveEmail,
      ownerUserId: ownerUserId || "",
      ownerName: ownerName || "",
      sourceSystem: sourceSystem || "manual",
      version: Number(version) || 1,
      dataQualityStatus: dataQualityStatus || "passed"
    };
    db.properties.unshift(newProp);

    // Sync leasable units into db.spaces and active commercial leases into db.leases
    if (Array.isArray(units) && units.length > 0) {
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const spaceRow: SpaceEntity = {
          id: u.id || `SPC-${Date.now()}-${i + 1}`,
          propertyId: propId,
          spaceCode: u.spaceCode || `${newProp.propertyCode}-${u.buildingCode || 'T1'}-${String(u.floorNumber || 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
          buildingName: u.buildingCode || (towers && towers[0]?.name) || "Tower 1",
          floorNumber: Number(u.floorNumber) || 1,
          unitNumber: u.suiteNumber || `Suite ${u.floorNumber}0${i + 1}`,
          spaceType: (u.spaceType as any) || "office",
          carpetArea: Number(u.carpetArea) || 0,
          chargeableArea: Number(u.chargeableArea) || 0,
          seatCapacity: Number(u.seatCapacity) || undefined,
          standardRatePsf: Number(u.contractedRentPsf) || Number(u.askingRate) || 0,
          standardCamPsf: Number(u.camRatePsf) || Number(body.standardCamPsf) || 0,
          status: (u.status === "occupied" && u.tenantName?.trim()) ? "occupied" : "vacant"
        };

        // If unit is explicitly marked occupied with real tenant name, sync to Rent Roll
        const cleanTenantName = (u.tenantName || "").trim();
        if (u.status === "occupied" && cleanTenantName) {
          const tenantName = cleanTenantName;
          let tenantObj = db.tenants.find(t => t.tradeName.toLowerCase() === tenantName.toLowerCase());
          if (!tenantObj) {
            const newTenantId = `TEN-${Date.now()}-${i + 1}`;
            tenantObj = {
              id: newTenantId,
              orgId: newProp.orgId,
              tenantCode: `TNT-${Math.floor(100 + Math.random() * 900)}`,
              tradeName: tenantName,
              legalName: tenantName,
              industry: "Commercial Occupant",
              pan: newProp.panNumber || "AAACR1234F",
              gstin: newProp.gstin && newProp.gstin !== "UNREGISTERED" ? newProp.gstin : "27AAACR1234F1Z5",
              contactPerson: "Authorized Representative",
              contactEmail: `leasing@${tenantName.toLowerCase().replace(/[^a-z0-9]/g, "") || "tenant"}.com`,
              contactPhone: "+91 98000 00000",
              billingAddress: newProp.address,
              billingCity: newProp.city,
              billingState: newProp.state,
              billingPincode: newProp.pincode,
              status: "invited",
              portalLive: false,
              inviteCode: `OFFICEX-${newProp.propertyCode}-${String(i + 1).padStart(2, '0')}`,
              inviteStatus: "pending",
              creditLimit: (Number(u.contractedRentPsf) || 150) * spaceRow.chargeableArea * 12,
              paymentTermsDays: 15,
              createdAt: new Date().toISOString().split("T")[0]
            };
            db.tenants.push(tenantObj);
          }

          const numChargeable = spaceRow.chargeableArea;
          const numCarpet = spaceRow.carpetArea;
          const contractedRatePsf = Number(u.contractedRentPsf) || Number(u.askingRate) || 150;
          const numMonthlyRent = Math.round(numChargeable * contractedRatePsf);
          const camRate = Number(u.camRatePsf) || Number(body.standardCamPsf) || 0;
          const startDate = u.leaseStartDate || new Date().toISOString().split("T")[0];
          let endDate = u.leaseExpiryDate;
          if (!endDate) {
            const expDate = new Date(startDate);
            expDate.setFullYear(expDate.getFullYear() + 3);
            endDate = expDate.toISOString().split("T")[0];
          }

          const escPct = Number(u.escalationPct) || 15;
          const escFreqYears = Number(u.escalationFrequencyYears) || 3;
          const escFreqMonths = escFreqYears * 12;
          const depMonths = Number(u.securityDepositMonths) || 6;
          const depPaid = numMonthlyRent * depMonths;

          const leaseSummary = computeFullLeaseSummary({
            chargeableArea: numChargeable,
            carpetArea: numCarpet,
            monthlyRent: numMonthlyRent,
            camRatePsf: camRate,
            startDate,
            endDate,
            escalationPct: escPct,
            escalationFrequencyMonths: escFreqMonths,
            securityDepositMonths: depMonths,
            securityDepositPaid: depPaid,
            lockInMonths: 36
          });

          const newLeaseId = `LEASE-${Date.now()}-${i + 1}`;
          const leaseCode = `LSE-${newProp.propertyCode}-${spaceRow.unitNumber.replace(/[^a-zA-Z0-9]/g, "")}`;

          const newLease: LeaseEntity = {
            id: newLeaseId,
            orgId: newProp.orgId,
            clientAccountId: newProp.clientAccountId,
            billingEntityId: newProp.billingEntityId,
            propertyId: newProp.id,
            propertyName: newProp.name,
            spaceId: spaceRow.id,
            unitNumber: spaceRow.unitNumber,
            floorNumber: spaceRow.floorNumber,
            tenantId: tenantObj.id,
            tenantName: tenantObj.tradeName,
            leaseCode,
            startDate,
            endDate,
            fitoutPeriodDays: 0,
            rentFreePeriodDays: 0,
            carpetArea: numCarpet,
            chargeableArea: numChargeable,
            monthlyRent: numMonthlyRent,
            baseRentPsf: contractedRatePsf,
            camRatePsf: camRate,
            camMonthly: leaseSummary.camMonthly,
            utilityFixedMonthly: 0,
            parkingChargesMonthly: 0,
            signageChargesMonthly: 0,
            otherChargesMonthly: 0,
            totalMonthlyGross: leaseSummary.totalMonthlyGross,
            annualRentGross: leaseSummary.annualRentGross,
            securityDepositMonths: depMonths,
            securityDepositAmount: leaseSummary.securityDepositRequired,
            securityDepositPaid: depPaid,
            securityDepositBank: "Corporate Escrow Bank Guarantee",
            securityDepositBgReference: `BG-${newProp.propertyCode}-${i + 1}`,
            escalationPct: escPct,
            escalationFrequencyMonths: escFreqMonths,
            nextEscalationDate: (leaseSummary.nextEscalationDate instanceof Date && !isNaN(leaseSummary.nextEscalationDate.getTime()))
              ? leaseSummary.nextEscalationDate.toISOString().split("T")[0]
              : new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
            lockInMonths: 36,
            lockInEndDate: (leaseSummary.lockInEndDate instanceof Date && !isNaN(leaseSummary.lockInEndDate.getTime()))
              ? leaseSummary.lockInEndDate.toISOString().split("T")[0]
              : new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
            noticePeriodDays: 90,
            status: "pending_approval",
            approvalStatus: "submitted",
            isTermsPending: true,
            renewalStatus: "not_due",
            billingFrequency: "monthly",
            billingDueDay: 5,
            gstRate: 18,
            tdsRate: 10,
            brokerName: "Direct Institutional Lease",
            brokeragePaid: 0,
            notes: "Skipped terms during property creation - Pending tenant onboarding & acceptance",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          spaceRow.currentLeaseId = newLeaseId;
          spaceRow.status = "occupied";
          db.leases.unshift(newLease);

          // Add active management alert for landlord
          db.alerts = db.alerts || [];
          db.alerts.unshift({
            id: `ALT-${Date.now()}-${i + 1}`,
            title: `${tenantName} — Invite & Terms Pending`,
            message: `Tenant has not accepted portal invite yet. Commercial terms & signed deed pending confirmation.`,
            severity: "warning",
            triggerDate: new Date().toISOString().split("T")[0],
            isRead: false
          });

          // Add scheduled escalation
          db.escalations.push({
            id: `ESC-${Date.now()}-${i + 1}`,
            leaseId: newLease.id,
            leaseCode: newLease.leaseCode,
            tenantName: newLease.tenantName,
            propertyName: newLease.propertyName,
            escalationDate: newLease.nextEscalationDate,
            previousRent: newLease.monthlyRent,
            newRent: leaseSummary.nextEscalatedRent || Math.round(newLease.monthlyRent * 1.15),
            escalationPct: newLease.escalationPct,
            calculatedIncrease: (leaseSummary.nextEscalatedRent || Math.round(newLease.monthlyRent * 1.15)) - newLease.monthlyRent,
            status: "pending",
            notes: "Auto-scheduled escalation from commercial property master registration"
          });
        }

        db.spaces.push(spaceRow);
      }
    } else {
      ensureSpacesAndContractsForProperties(db);
    }

    // Compute enriched property metrics for immediate UI reflection
    const propLeases = db.leases.filter(l => l.propertyId === propId && (l.status === "active" || l.status === "under_notice"));
    const occupiedArea = propLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
    const occupancyPct = newProp.totalArea > 0 ? Math.round((occupiedArea / newProp.totalArea) * 1000) / 10 : 0;
    const totalMonthlyRent = propLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
    const totalBilling = propLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);

    const enrichedProp = {
      ...newProp,
      activeLeasesCount: propLeases.length,
      occupiedArea,
      vacantArea: Math.max(0, newProp.totalArea - occupiedArea),
      occupancyPct,
      totalMonthlyRent,
      totalBilling,
    };

    saveRentRollDb(db);
    return NextResponse.json(enrichedProp);
  } catch (error: any) {
    console.error("POST /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query param is preferred
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Property ID is required for deletion" }, { status: 400 });
    }

    const db = getRentRollDb();
    const propIndex = db.properties.findIndex(p => p.id === id);

    if (propIndex === -1) {
      return NextResponse.json({ error: `Property with ID ${id} not found` }, { status: 404 });
    }

    const deletedProp = db.properties[propIndex];

    // Remove the property
    db.properties.splice(propIndex, 1);

    // Clean up spaces associated with this property
    db.spaces = db.spaces.filter(s => s.propertyId !== id);

    // Clean up leases associated with this property
    const removedLeaseIds = new Set(db.leases.filter(l => l.propertyId === id).map(l => l.id));
    db.leases = db.leases.filter(l => l.propertyId !== id);

    // Clean up escalations for removed leases
    db.escalations = db.escalations.filter(e => !removedLeaseIds.has(e.leaseId));

    // Clean up invoices for removed leases or property
    db.invoices = db.invoices.filter(i => i.propertyId !== id && !removedLeaseIds.has(i.leaseId));

    // Clean up expenses for removed property
    db.expenses = db.expenses.filter(e => e.propertyId !== id);

    // Save database
    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: `Property "${deletedProp.name}" removed successfully`,
      deletedId: id,
      deletedProperty: deletedProp
    });
  } catch (error: any) {
    console.error("DELETE /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
