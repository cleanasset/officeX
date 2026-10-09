import { NextResponse } from "next/server";
import { db } from "@/db";
import { camPools, camPoolCosts, property, contract, space } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");

    let pools = await db
      .select()
      .from(camPools)
      .orderBy(desc(camPools.created_at));

    if (propertyId) {
      pools = pools.filter((p) => p.property_id === propertyId);
    }

    // Fetch costs for each pool
    const poolsWithDetails = await Promise.all(
      pools.map(async (p) => {
        const costs = await db
          .select()
          .from(camPoolCosts)
          .where(eq(camPoolCosts.pool_id, p.id));

        const totalBudget = costs.reduce(
          (sum, c) => sum + parseFloat(c.budget_amount || "0"),
          0
        );
        const totalActual = costs.reduce(
          (sum, c) => sum + parseFloat(c.actual_cost || "0"),
          0
        );
        const totalVariance = totalActual - totalBudget;

        return {
          ...p,
          costs,
          calculated_budget: totalBudget,
          calculated_actual: totalActual,
          variance: totalVariance,
        };
      })
    );

    return NextResponse.json({
      success: true,
      pools: poolsWithDetails,
      count: poolsWithDetails.length,
    });
  } catch (err: any) {
    console.error("GET /api/cam-pools error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch CAM pools" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json().catch(() => ({}));

    if (!body.pool_name || !body.financial_year) {
      return NextResponse.json(
        { error: "Pool name and financial year (e.g. FY 2026-27) are required" },
        { status: 400 }
      );
    }

    // Get default property if not passed
    let propId = body.property_id;
    if (!propId) {
      const [firstProp] = await db.select({ id: property.id }).from(property).limit(1);
      propId = firstProp?.id;
    }

    if (!propId) {
      return NextResponse.json(
        { error: "Valid property ID is required" },
        { status: 400 }
      );
    }

    const annualBudget = parseFloat(body.annual_budget || "0");
    const totalArea = parseFloat(body.total_apportionment_area || "0");

    // 1. Create CAM Pool
    const [newPool] = await db
      .insert(camPools)
      .values({
        org_id: auth.orgId,
        property_id: propId,
        pool_name: body.pool_name,
        financial_year: body.financial_year,
        annual_budget: annualBudget.toFixed(2),
        apportionment_method: body.apportionment_method || "area_weighted",
        total_apportionment_area: totalArea.toFixed(2),
        status: "active",
      })
      .returning();

    // 2. Insert standard CAM cost categories if provided or use standard CRE breakdown
    const defaultCategories = body.categories || [
      { category: "Security & Guarding Services", budget: annualBudget * 0.22, actual: annualBudget * 0.22 },
      { category: "Housekeeping & Waste Management", budget: annualBudget * 0.18, actual: annualBudget * 0.18 },
      { category: "HVAC & Electrical Substation AMC", budget: annualBudget * 0.28, actual: annualBudget * 0.28 },
      { category: "Common Area Power & DG Fuel", budget: annualBudget * 0.16, actual: annualBudget * 0.16 },
      { category: "Water Supply & Sewage Treatment (STP)", budget: annualBudget * 0.08, actual: annualBudget * 0.08 },
      { category: "Landscaping, Horticulture & Façade", budget: annualBudget * 0.08, actual: annualBudget * 0.08 },
    ];

    for (const cat of defaultCategories) {
      const bAmt = parseFloat(cat.budget || cat.budget_amount || "0");
      const aAmt = parseFloat(cat.actual || cat.actual_cost || "0");
      await db.insert(camPoolCosts).values({
        pool_id: newPool.id,
        category: cat.category,
        budget_amount: bAmt.toFixed(2),
        actual_cost: aAmt.toFixed(2),
        variance: (aAmt - bAmt).toFixed(2),
        period: body.financial_year,
        notes: cat.notes || "Annual audited operational expenses",
      });
    }

    return NextResponse.json({
      success: true,
      pool: newPool,
      message: `CAM Pool ${newPool.pool_name} created successfully with categories.`,
    });
  } catch (err: any) {
    console.error("POST /api/cam-pools error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create CAM pool" },
      { status: 500 }
    );
  }
}
