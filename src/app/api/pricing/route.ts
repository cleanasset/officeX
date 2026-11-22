import { NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = getAdminPool();

    // Check system_kv_store for global pricing
    const res = await pool.query(
      `SELECT data FROM system_kv_store WHERE key = 'officex_global_pricing' LIMIT 1`
    ).catch(() => ({ rows: [] }));

    const defaultPricing = {
      taxConfig: {
        enabled: true,
        gstMode: "exclusive" as const,
        gstRatePct: 18,
        sacCode: "997212",
      },
      cafmSuite: {
        essentialsMonthly: 19999,
        proMonthly: 39999,
        enterpriseMonthly: 79999,
        proRatePerSqft: 2.0,
        enterpriseRatePerSqft: 3.5,
      },
      standaloneModules: {
        rentRoll: {
          ratePerSqft: 1.0,
          starterMonthly: 9999,
          growthMonthly: 24999,
          enterpriseMonthly: 49999,
        },
        ppm: {
          monthly: 6999,
          unit: "per building / mo",
          title: "52-Week PPM & Asset QR",
        },
        visitor: {
          monthly: 4999,
          unit: "per speed-gate / mo",
          title: "Visitor Flow & Speed-Gate Access",
        },
        compliance: {
          monthly: 3999,
          unit: "per property / mo",
          title: "Statutory Compliance Calendar",
        },
        leaseCrm: {
          monthly: 5999,
          unit: "per leasing team / mo",
          title: "Commercial Lease Dealflow CRM",
        },
        helpdesk: {
          monthly: 3499,
          unit: "per building / mo",
          title: "Tenant Helpdesk & Room Booking",
        },
      },
    };

    if (res.rows && res.rows.length > 0 && res.rows[0].data?.saasModules) {
      const saas = res.rows[0].data.saasModules;
      return NextResponse.json({
        success: true,
        pricing: {
          taxConfig: {
            enabled: res.rows[0].data?.taxConfig?.enabled ?? true,
            gstMode: res.rows[0].data?.taxConfig?.gstMode || "exclusive",
            gstRatePct: (res.rows[0].data?.taxConfig?.enabled ?? true)
              ? (Number(res.rows[0].data?.taxConfig?.gstRatePct) ?? 18)
              : 0,
            sacCode: res.rows[0].data?.taxConfig?.sacCode || "997212",
            itemOverrides: res.rows[0].data?.taxConfig?.itemOverrides || {},
          },
          cafmSuite: {
            essentialsMonthly: saas.cafmEssentialsMonthly || defaultPricing.cafmSuite.essentialsMonthly,
            proMonthly: saas.cafmProMonthly || defaultPricing.cafmSuite.proMonthly,
            enterpriseMonthly: saas.cafmEnterpriseMonthly || defaultPricing.cafmSuite.enterpriseMonthly,
            proRatePerSqft: saas.cafmProRatePerSqft || defaultPricing.cafmSuite.proRatePerSqft,
            enterpriseRatePerSqft: saas.cafmEnterpriseRatePerSqft || defaultPricing.cafmSuite.enterpriseRatePerSqft,
          },
          standaloneModules: {
            rentRoll: {
              ratePerSqft: saas.rentRollRatePerSqft || defaultPricing.standaloneModules.rentRoll.ratePerSqft,
              starterMonthly: saas.rentRollStarterMonthly || defaultPricing.standaloneModules.rentRoll.starterMonthly,
              growthMonthly: saas.rentRollGrowthMonthly || defaultPricing.standaloneModules.rentRoll.growthMonthly,
              enterpriseMonthly: saas.rentRollEnterpriseMonthly || defaultPricing.standaloneModules.rentRoll.enterpriseMonthly,
            },
            ppm: {
              monthly: saas.ppmModuleMonthly || defaultPricing.standaloneModules.ppm.monthly,
              unit: "per building / mo",
              title: "52-Week PPM & Asset QR",
            },
            visitor: {
              monthly: saas.visitorModuleMonthly || defaultPricing.standaloneModules.visitor.monthly,
              unit: "per speed-gate / mo",
              title: "Visitor Flow & Speed-Gate Access",
            },
            compliance: {
              monthly: saas.complianceModuleMonthly || defaultPricing.standaloneModules.compliance.monthly,
              unit: "per property / mo",
              title: "Statutory Compliance Calendar",
            },
            leaseCrm: {
              monthly: saas.leaseCrmMonthly || defaultPricing.standaloneModules.leaseCrm.monthly,
              unit: "per leasing team / mo",
              title: "Commercial Lease Dealflow CRM",
            },
            helpdesk: {
              monthly: saas.helpdeskModuleMonthly || defaultPricing.standaloneModules.helpdesk.monthly,
              unit: "per building / mo",
              title: "Tenant Helpdesk & Room Booking",
            },
          },
          updatedAt: res.rows[0].data.updatedAt || new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      pricing: defaultPricing,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      pricing: {
        cafmSuite: {
          essentialsMonthly: 19999,
          proMonthly: 39999,
          enterpriseMonthly: 79999,
          proRatePerSqft: 2.0,
          enterpriseRatePerSqft: 3.5,
        },
        standaloneModules: {
          rentRoll: { ratePerSqft: 1.0, starterMonthly: 9999, growthMonthly: 24999, enterpriseMonthly: 49999 },
          ppm: { monthly: 6999, unit: "per building / mo", title: "52-Week PPM & Asset QR" },
          visitor: { monthly: 4999, unit: "per speed-gate / mo", title: "Visitor Flow & Speed-Gate Access" },
          compliance: { monthly: 3999, unit: "per property / mo", title: "Statutory Compliance Calendar" },
          leaseCrm: { monthly: 5999, unit: "per leasing team / mo", title: "Commercial Lease Dealflow CRM" },
          helpdesk: { monthly: 3499, unit: "per building / mo", title: "Tenant Helpdesk & Room Booking" },
        },
      },
    });
  }
}

