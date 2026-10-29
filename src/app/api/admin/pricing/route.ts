import { NextRequest, NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

export interface GlobalPricingConfig {
  officeMarketplace: {
    hotDeskMonthlyMin: number;
    dedicatedDeskMonthlyMin: number;
    privateCabinMonthlyMin: number;
    managedOfficeMonthlyMin: number;
    dayPassRate: number;
    virtualOfficeMonthlyMin: number;
    cityMultipliers: Record<string, { multiplier: number; minPrice: number }>;
  };
  fmMarketplace: {
    platformCommissionPct: number;
    emergencyCalloutFee: number;
    rateCards: {
      deepCleaningPerSqft: number;
      deepCleaningMinCallout: number;
      hvacAmcPerTonAnnual: number;
      electricalAuditPerSqft: number;
      securityGuardPerMonth: number;
      plumbingBaseVisit: number;
      pestControlPerSqft: number;
    };
  };
  saasModules: {
    rentRollStarterMonthly: number;
    rentRollGrowthMonthly: number;
    rentRollEnterpriseMonthly: number;
    camModuleMonthly: number;
    submeteringModuleMonthly: number;
    cafmPpmModuleMonthly: number;
    visitorModuleMonthly: number;
    tenantPaymentGatewayFeePct: number;
  };
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_GLOBAL_PRICING: GlobalPricingConfig = {
  officeMarketplace: {
    hotDeskMonthlyMin: 7999,
    dedicatedDeskMonthlyMin: 11999,
    privateCabinMonthlyMin: 15999,
    managedOfficeMonthlyMin: 18500,
    dayPassRate: 499,
    virtualOfficeMonthlyMin: 1499,
    cityMultipliers: {
      Bengaluru: { multiplier: 1.0, minPrice: 8500 },
      Mumbai: { multiplier: 1.25, minPrice: 12000 },
      Delhi: { multiplier: 1.1, minPrice: 9500 },
      Gurgaon: { multiplier: 1.15, minPrice: 10000 },
      Noida: { multiplier: 0.95, minPrice: 8000 },
      Hyderabad: { multiplier: 0.9, minPrice: 7500 },
      Pune: { multiplier: 0.85, minPrice: 7000 },
      Chennai: { multiplier: 0.85, minPrice: 7000 },
      Kolkata: { multiplier: 0.75, minPrice: 6000 },
    },
  },
  fmMarketplace: {
    platformCommissionPct: 5.0,
    emergencyCalloutFee: 999,
    rateCards: {
      deepCleaningPerSqft: 1.8,
      deepCleaningMinCallout: 4500,
      hvacAmcPerTonAnnual: 2200,
      electricalAuditPerSqft: 1.2,
      securityGuardPerMonth: 24000,
      plumbingBaseVisit: 1500,
      pestControlPerSqft: 0.75,
    },
  },
  saasModules: {
    rentRollStarterMonthly: 4999,
    rentRollGrowthMonthly: 14999,
    rentRollEnterpriseMonthly: 39999,
    camModuleMonthly: 3999,
    submeteringModuleMonthly: 2499,
    cafmPpmModuleMonthly: 3499,
    visitorModuleMonthly: 1999,
    tenantPaymentGatewayFeePct: 1.2,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "admin@gmail.com",
};

export async function GET() {
  try {
    const pool = getAdminPool();

    // Ensure system_kv_store exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_kv_store (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Fetch existing pricing from KV store
    const res = await pool.query(
      `SELECT data FROM system_kv_store WHERE key = 'officex_global_pricing' LIMIT 1`
    );

    let pricingData: GlobalPricingConfig;

    if (res.rows.length === 0 || !res.rows[0].data) {
      // Initialize with default
      pricingData = DEFAULT_GLOBAL_PRICING;
      await pool.query(
        `INSERT INTO system_kv_store (key, data, updated_at) VALUES ('officex_global_pricing', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
        [JSON.stringify(pricingData)]
      );
    } else {
      // Deep merge with defaults to ensure all fields are present
      pricingData = {
        ...DEFAULT_GLOBAL_PRICING,
        ...res.rows[0].data,
        officeMarketplace: {
          ...DEFAULT_GLOBAL_PRICING.officeMarketplace,
          ...(res.rows[0].data.officeMarketplace || {}),
        },
        fmMarketplace: {
          ...DEFAULT_GLOBAL_PRICING.fmMarketplace,
          ...(res.rows[0].data.fmMarketplace || {}),
        },
        saasModules: {
          ...DEFAULT_GLOBAL_PRICING.saasModules,
          ...(res.rows[0].data.saasModules || {}),
        },
      };
    }

    return NextResponse.json({
      success: true,
      pricing: pricingData,
    });
  } catch (err: any) {
    console.error("Admin Pricing GET error:", err);
    return NextResponse.json(
      { error: "Failed to load pricing configuration", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = getAdminPool();
    const body = await request.json();
    const { pricing, applyToMarketplaceListings = false, city, percentageAdjustment } = body;

    if (!pricing) {
      return NextResponse.json({ error: "Pricing data is required" }, { status: 400 });
    }

    const payload: GlobalPricingConfig = {
      ...pricing,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@gmail.com",
    };

    // Save to system_kv_store
    await pool.query(
      `INSERT INTO system_kv_store (key, data, updated_at) 
       VALUES ('officex_global_pricing', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
      [JSON.stringify(payload)]
    );

    let bulkModifiedCount = 0;

    // Optional: Bulk adjust live marketplace listings starting prices
    if (applyToMarketplaceListings && percentageAdjustment) {
      const pct = Number(percentageAdjustment) / 100;
      let query = `
        UPDATE marketplace_listings
        SET starting_price = ROUND(starting_price * (1 + $1), 0),
            updated_at = NOW()
      `;
      const params: any[] = [pct];

      if (city && city.toLowerCase() !== "all") {
        query += ` WHERE city ILIKE $2`;
        params.push(`%${city}%`);
      }

      const bulkRes = await pool.query(query, params);
      bulkModifiedCount = bulkRes.rowCount || 0;
    }

    return NextResponse.json({
      success: true,
      pricing: payload,
      bulkModifiedCount,
      message: "Global OfficeX pricing successfully updated and active across platform",
    });
  } catch (err: any) {
    console.error("Admin Pricing PUT error:", err);
    return NextResponse.json(
      { error: "Failed to save pricing configuration", details: err.message },
      { status: 500 }
    );
  }
}

