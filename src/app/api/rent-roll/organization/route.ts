import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";

export async function GET() {
  try {
    const db = getRentRollDb();
    const primaryBe = (db.billingEntities || []).find((b: any) => b.isDefault) || db.billingEntities?.[0] || {};
    const orgWithFallbacks = {
      ...db.organization,
      tradeName: db.organization.tradeName || primaryBe.tradeName || db.organization.name,
      pan: db.organization.pan || primaryBe.pan || "",
      gstin: db.organization.gstin || primaryBe.gstin || "",
      bankName: db.organization.bankName || primaryBe.bankName || "",
      bankAccountNumber: db.organization.bankAccountNumber || primaryBe.bankAccountNumber || "",
      bankIfsc: db.organization.bankIfsc || primaryBe.bankIfsc || "",
      bankBranch: db.organization.bankBranch || primaryBe.bankBranch || "",
      accountType: db.organization.accountType || "Current Account",
      escrowNodalVerified: db.organization.escrowNodalVerified ?? true,
      address: db.organization.address || primaryBe.registeredAddress || "",
      city: db.organization.city || "",
      state: db.organization.state || "",
      currency: db.organization.currency || "INR"
    };
    return NextResponse.json({
      ...orgWithFallbacks,
      organization: orgWithFallbacks,
      config: db.config,
      billingEntities: db.billingEntities || [],
      chargeMaster: db.chargeMaster || []
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/organization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();

    // 1. Update Core Organization
    db.organization = {
      ...db.organization,
      name: body.name || body.legalName || db.organization.name || "",
      tradeName: body.tradeName || db.organization.tradeName || "",
      pan: (body.pan || db.organization.pan || "").toUpperCase().trim(),
      gstin: (body.gstin || db.organization.gstin || "").toUpperCase().trim(),
      address: body.address || body.primaryAddress || db.organization.address || "",
      city: body.city || db.organization.city || "",
      state: body.state || db.organization.state || "",
      pincode: body.pincode || db.organization.pincode || "",
      currency: body.currency || db.organization.currency || "INR",
      bankName: body.bankName || db.organization.bankName || "",
      bankAccountNumber: body.bankAccountNumber || db.organization.bankAccountNumber || "",
      bankIfsc: (body.bankIfsc || db.organization.bankIfsc || "").toUpperCase().trim(),
      bankBranch: body.bankBranch || db.organization.bankBranch || "",
      upiVpa: body.upiVpa || (db.organization as any).upiVpa || "",
      accountType: body.accountType || db.organization.accountType || "Current Account",
      escrowNodalVerified: body.escrowNodalVerified ?? db.organization.escrowNodalVerified ?? true,
      contactPerson: body.contactPerson || db.organization.contactPerson || "",
      contactEmail: body.contactEmail || db.organization.contactEmail || "",
      contactPhone: body.contactPhone || db.organization.contactPhone || ""
    };

    // 2. Update Extended Configuration
    if (!db.config) {
      db.config = {
        leaseExpiryAlertDays: 90,
        escalationAlertDays: 30,
        defaultGstPct: 18,
        defaultPaymentDueDays: 15,
        currency: "INR",
        asOfDate: "2026-10-01"
      };
    }

    if (body.taxProfiles) {
      db.config.taxProfiles = {
        ...db.config.taxProfiles,
        ...body.taxProfiles
      };
    }

    if (body.branding) {
      db.config.branding = {
        ...db.config.branding,
        ...body.branding
      };
    }

    if (body.domainConfig) {
      db.config.domainConfig = {
        ...db.config.domainConfig,
        ...body.domainConfig
      };
    }

    if (body.users) {
      db.config.users = body.users;
    }

    if (body.chargeTypesList) {
      db.config.chargeTypesList = body.chargeTypesList;
    }

    if (body.goLiveChecklist) {
      db.config.goLiveChecklist = {
        ...db.config.goLiveChecklist,
        ...body.goLiveChecklist
      };
    }

    if (typeof body.makerCheckerLease === "boolean") {
      db.config.makerCheckerLease = body.makerCheckerLease;
    }
    if (typeof body.makerCheckerBilling === "boolean") {
      db.config.makerCheckerBilling = body.makerCheckerBilling;
    }

    // 3. Batch Update Billing Entities if supplied
    if (Array.isArray(body.billingEntities) && body.billingEntities.length > 0) {
      // Retain existing non-conflicting or replace with full configured list
      db.billingEntities = body.billingEntities.map((be: any, idx: number) => ({
        id: be.id || `BE-${Date.now()}-${idx}`,
        orgId: db.organization.id,
        clientAccountId: be.clientAccountId || "CA-SELF",
        legalName: be.legalName || be.spvName || db.organization.name,
        tradeName: be.tradeName || db.organization.name,
        pan: (be.pan || db.organization.pan || "").toUpperCase().trim(),
        gstin: (be.gstin || db.organization.gstin || "").toUpperCase().trim(),
        stateCode: be.stateCode || (be.gstin ? be.gstin.substring(0, 2) : "27"),
        registeredAddress: be.registeredAddress || db.organization.address,
        bankName: be.bankName || "HDFC Bank Ltd",
        bankAccountNumber: be.bankAccountNumber || be.accountNumber || "",
        bankIfsc: (be.bankIfsc || be.ifscCode || "").toUpperCase().trim(),
        bankBranch: be.bankBranch || "",
        invoicePrefix: be.invoicePrefix || `INV-${idx + 1}`,
        isDefault: be.isDefault ?? idx === 0
      }));
    }

    saveRentRollDb(db);

    recordAuditLog({
      entityName: "OrganizationConfig",
      action: "UPDATE_ONBOARDING_CONFIG",
      newValues: {
        orgName: db.organization.name,
        billingEntitiesCount: db.billingEntities.length,
        hasBranding: !!db.config.branding,
        hasTaxProfiles: !!db.config.taxProfiles
      },
      changedBy: "Org Super Admin"
    });

    return NextResponse.json({
      success: true,
      organization: db.organization,
      config: db.config,
      billingEntities: db.billingEntities
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/organization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
