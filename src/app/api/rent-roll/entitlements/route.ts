import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export interface OrganizationEntitlements {
  orgId: string;
  edition: "Essentials" | "Professional" | "Enterprise";
  isRentRollSubscribed: boolean;
  isCafmSubscribed: boolean;
  isLeasingCrmSubscribed: boolean;
  isMarketplaceSubscribed: boolean;
  addons: {
    multi_client_operator: boolean;
    flex_seats: boolean;
    integrations: boolean;
  };
  features: Record<string, boolean>;
}

export function getOrgEntitlements(edition: "Essentials" | "Professional" | "Enterprise" = "Enterprise"): OrganizationEntitlements {
  const isEssentials = edition === "Essentials";
  const isPro = edition === "Professional" || edition === "Enterprise";
  const isEnterprise = edition === "Enterprise";

  return {
    orgId: "ORG-SCALEZIX",
    edition,
    isRentRollSubscribed: true,
    isCafmSubscribed: false, // Standalone Rent Roll (UAT-41)
    isLeasingCrmSubscribed: false,
    isMarketplaceSubscribed: false,
    addons: {
      multi_client_operator: isPro,
      flex_seats: isPro,
      integrations: isEnterprise
    },
    features: {
      rent_roll_register: true,
      contract_master: true,
      document_versioning: true,
      escalation_engine: true,
      expiry_engine: true,
      import_wizard: true,
      occupancy_analytics: true,
      wale_analytics: true,
      rollover_analytics: true,
      csv_exports: true,
      audit_trail: true,
      // Professional+ features
      billing_runs: isPro,
      separate_invoicing: isPro,
      gst_tax_invoices: isPro,
      credit_debit_notes: isPro,
      payments_allocation: isPro,
      aging_buckets: isPro,
      forecast_12m: isPro,
      property_pnl: isPro,
      monthly_mis: isPro,
      exception_centre: isPro,
      // Operator & Flex Addons
      multi_client_operator: isPro,
      owner_statements: isPro,
      management_fee_calc: isPro,
      flex_seats_engine: isPro,
      head_lease_pnl: isPro,
      cam_pools_trueup: isPro,
      // Enterprise features
      custom_roles: isEnterprise,
      api_access: isEnterprise,
      sso_saml: isEnterprise,
      data_export_bundle: isEnterprise
    }
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featureToCheck = searchParams.get("check_feature");
    const editionParam = (searchParams.get("edition") as any) || "Enterprise";

    const entitlements = getOrgEntitlements(editionParam);

    // Feature permission guard (UAT-43: Call non-entitled feature API -> 403 with feature code)
    if (featureToCheck) {
      const isEntitled = !!entitlements.features[featureToCheck];
      if (!isEntitled) {
        return NextResponse.json({
          error: `Feature not entitled: ${featureToCheck}`,
          feature: featureToCheck,
          requiredEdition: "Professional or Enterprise",
          currentEdition: entitlements.edition
        }, { status: 403 });
      }
      return NextResponse.json({ success: true, feature: featureToCheck, isEntitled: true });
    }

    return NextResponse.json(entitlements);
  } catch (error: any) {
    console.error("GET /api/rent-roll/entitlements error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feature } = body;
    const edition = body.edition || "Essentials"; // Test with Essentials by default for non-entitled checks

    const entitlements = getOrgEntitlements(edition);

    if (feature && !entitlements.features[feature]) {
      // Return 403 with feature code per UAT-43
      return NextResponse.json({
        error: `Feature not entitled: ${feature}`,
        feature,
        status: 403,
        currentEdition: edition
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, feature, isEntitled: true, entitlements });
  } catch (error: any) {
    console.error("POST /api/rent-roll/entitlements error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
