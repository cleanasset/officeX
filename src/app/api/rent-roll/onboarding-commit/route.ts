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
      tenants: stagedTenants = [],
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

      // Automatically register any users added with role "occupant" as Tenant Entities
      const occupantUsers = users.filter((u: any) => u.role === "occupant");
      occupantUsers.forEach((u: any, idx: number) => {
        const uName = (u.name || "").trim();
        if (!uName) return;
        const exists = db.tenants.some(t => 
          t.tradeName.toLowerCase() === uName.toLowerCase() || 
          (u.email && t.contactEmail?.toLowerCase() === u.email.toLowerCase())
        );
        if (!exists) {
          db.tenants.unshift({
            id: `TEN-${Date.now()}-${idx}`,
            orgId: db.organization.id,
            tenantCode: `TNT-${Math.floor(100 + Math.random() * 900)}`,
            tradeName: uName,
            legalName: `${uName} Pvt Ltd`,
            industry: "Commercial Occupant",
            pan: (u.pan || "").toUpperCase().trim(),
            gstin: (u.gstin || "").toUpperCase().trim(),
            contactPerson: (u.contactPerson || "").trim(),
            contactEmail: (u.email || u.contactEmail || "").trim(),
            contactPhone: (u.phone || u.contactPhone || "").trim(),
            billingAddress: organization.primaryAddress || organization.address || "Commercial Premises",
            billingCity: organization.city || "",
            billingState: organization.state || "",
            billingPincode: organization.pincode || "",
            status: "active",
            creditLimit: 0,
            paymentTermsDays: 15,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    // Also register explicitly staged tenants if provided
    if (Array.isArray(stagedTenants) && stagedTenants.length > 0) {
      stagedTenants.forEach((st: any, idx: number) => {
        const sName = (st.tradeName || st.name || "").trim();
        if (!sName) return;
        const exists = db.tenants.some(t => t.tradeName.toLowerCase() === sName.toLowerCase());
        if (!exists) {
          db.tenants.unshift({
            id: st.id || `TEN-${Date.now()}-${idx}`,
            orgId: db.organization.id,
            tenantCode: st.tenantCode || `TNT-${Math.floor(100 + Math.random() * 900)}`,
            tradeName: sName,
            legalName: st.legalName || `${sName} Pvt Ltd`,
            industry: st.industry || "Commercial Occupant",
            pan: (st.pan || "").toUpperCase().trim(),
            gstin: (st.gstin || "").toUpperCase().trim(),
            contactPerson: (st.contactPerson || "").trim(),
            contactEmail: (st.contactEmail || "").trim(),
            contactPhone: (st.contactPhone || "").trim(),
            billingAddress: st.billingAddress || organization.primaryAddress || organization.address || "Commercial Premises",
            billingCity: st.billingCity || organization.city || "",
            billingState: st.billingState || organization.state || "",
            billingPincode: st.billingPincode || organization.pincode || "",
            status: "active",
            creditLimit: st.creditLimit || 0,
            paymentTermsDays: st.paymentTermsDays || 15,
            createdAt: new Date().toISOString()
          });
        }
      });
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
    const userEmail = (body.userEmail || body.ownerEmail || cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();

    if (property && property.name && property.name.trim()) {
      const propId = property.id || `PROP-${Date.now()}`;
      const totalArea = Number(property.totalArea) || 50000;
      const cleanCode = property.name.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase();

      const newProp: PropertyEntity = {
        id: propId,
        orgId: db.organization.id,
        propertyCode: `PRP-${cleanCode}`,
        name: property.name.trim(),
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
    } else {
      // Option 1: Clean 0-property state — do NOT auto-create a dummy fallback property
      // If user skipped adding a property during onboarding, start clean with 0 properties.
      committedProperty = null;
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
            legalName: r.legalName || `${tenantName} Pvt Ltd`,
            industry: r.industry || "Commercial Occupant",
            pan: (r.pan || "").toUpperCase().trim(),
            gstin: (r.gstin || "").toUpperCase().trim(),
            contactPerson: (r.contactPerson || "").trim(),
            contactEmail: (r.contactEmail || "").trim(),
            contactPhone: (r.contactPhone || "").trim(),
            billingAddress: `${prop.address || ""}, ${unit}`.trim(),
            billingCity: prop.city || "",
            billingState: prop.state || "",
            billingPincode: prop.pincode || "",
            status: "active",
            creditLimit: 0,
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

    // If tenant was added during onboarding, assign to primary property lease
    if (committedProperty && Array.isArray(stagedTenants) && stagedTenants.length > 0) {
      const firstTenant = stagedTenants[0];
      const tenantRecord = db.tenants.find(t => t.tradeName.toLowerCase() === (firstTenant.tradeName || "").toLowerCase());
      if (tenantRecord) {
        const propLease = db.leases.find(l => l.propertyId === committedProperty?.id);
        if (propLease) {
          propLease.tenantId = tenantRecord.id;
          propLease.tenantName = tenantRecord.tradeName;
          propLease.status = "active";
          propLease.approvalStatus = "active";
        }
      }
    }

    saveRentRollDb(db);

    // 7. Sync Organization & Property to Supabase/PostgreSQL Database
    try {
      const client = supabaseAdmin || supabase;
      if (client && committedProperty) {
        const cookieStore = await cookies();
        const userEmail = (
          cookieStore.get("officex_user_email")?.value ||
          body.userEmail ||
          organization.email ||
          ""
        ).trim().toLowerCase();

        // 1. Resolve active user UUID in public.users
        let activeUserId: string | null = null;
        if (userEmail) {
          const { data: userRow } = await client
            .from("users")
            .select("id")
            .eq("email", userEmail)
            .maybeSingle();

          if (userRow?.id) {
            activeUserId = userRow.id;
          } else if (supabaseAdmin) {
            try {
              const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
              const existingAuth = usersData?.users?.find(
                (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
              );
              if (existingAuth) {
                activeUserId = existingAuth.id;
              } else {
                const { data: newAuthUser } = await supabaseAdmin.auth.admin.createUser({
                  email: userEmail,
                  email_confirm: true,
                  user_metadata: { full_name: orgName, role: "property_manager" }
                });
                if (newAuthUser?.user?.id) {
                  activeUserId = newAuthUser.user.id;
                }
              }

              if (activeUserId) {
                await client.from("users").upsert({
                  id: activeUserId,
                  email: userEmail,
                  full_name: orgName,
                  role: "property_manager",
                  password_hash: "SUPABASE_AUTH_MANAGED"
                }, { onConflict: "email" });
              }
            } catch (err) {
              console.warn("[ONBOARDING] Supabase Auth/User provision notice:", err);
            }
          }
        }

        // 2. Insert Organization into Supabase Postgres
        let orgId: string | null = null;
        try {
          const { data: orgRow } = await client.from("organizations").insert({
            name: orgName,
            pan: (db.organization.pan || "").toUpperCase() || null,
            gstin: (db.organization.gstin || "").toUpperCase() || null,
            address: db.organization.address || null,
            city: db.organization.city || null,
            state: db.organization.state || null,
            currency: db.organization.currency || "INR"
          }).select("id").maybeSingle();
          if (orgRow?.id) orgId = orgRow.id;
        } catch (orgErr) {
          console.warn("[ONBOARDING] Postgres organization insert warning:", orgErr);
        }

        // 3. Insert Property into Supabase Postgres
        const isUuid = committedProperty.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(committedProperty.id);
        const { data: propRow, error: propErr } = await client.from("properties").insert({
          id: isUuid ? committedProperty.id : undefined,
          org_id: orgId || undefined,
          name: committedProperty.name || "Primary Commercial Asset",
          type: committedProperty.type || "Commercial Office",
          address: committedProperty.address || committedProperty.city || "Commercial Street",
          city: committedProperty.city || "Mumbai",
          state: committedProperty.state || "Maharashtra",
          micro_market: committedProperty.microMarket || "",
          pincode: committedProperty.pincode || "400051",
          grade: "A",
          total_area: committedProperty.totalArea || 25000,
          chargeable_area: committedProperty.chargeableArea || 25000,
          owner_name: committedProperty.ownerName || orgName,
          owner_company: committedProperty.ownerCompany || orgName,
          owner_user_id: activeUserId || undefined
        }).select().maybeSingle();

        if (propErr) {
          console.warn("[ONBOARDING] Postgres property insert notice:", propErr.message);
        }

        // 4. Link user to property in user_properties
        if (activeUserId && propRow?.id) {
          await client.from("user_properties").insert({
            user_id: activeUserId,
            property_id: propRow.id
          }).maybeSingle();
        }

        // 5. Insert Spaces if present
        if (propRow?.id && db.spaces.length > 0) {
          for (const sp of db.spaces.slice(0, 5)) {
            await client.from("spaces").insert({
              property_id: propRow.id,
              space_number: sp.unitNumber || "Unit 101",
              chargeable_area: sp.chargeableArea || 5000,
              base_rent_psf: sp.standardRatePsf || 150,
              cam_rate_psf: sp.standardCamPsf || 25,
              status: sp.status === "occupied" || sp.status === "leased" ? "leased" : "available"
            }).maybeSingle();
          }
        }
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
      billingEntities: db.billingEntities,
      tenants: db.tenants
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/onboarding-commit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
