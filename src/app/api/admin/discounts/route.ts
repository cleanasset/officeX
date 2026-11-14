import { NextRequest, NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

export interface DiscountItem {
  id: string;
  code: string;
  discountPct: number;
  type: "global" | "user_specific";
  targetUserEmail?: string;
  applicablePlans: string[];
  maxUses?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

const DEFAULT_DISCOUNTS: DiscountItem[] = [
  {
    id: "dsc-01",
    code: "OFFICEX100",
    discountPct: 100,
    type: "global",
    applicablePlans: ["all"],
    usedCount: 14,
    isActive: true,
    notes: "Executive Founder 100% off trial code",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dsc-02",
    code: "RENTROLL12",
    discountPct: 100,
    type: "global",
    applicablePlans: ["all"],
    usedCount: 8,
    isActive: true,
    notes: "12-Month Rent Roll complimentary launch license",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dsc-03",
    code: "FOUNDER50",
    discountPct: 50,
    type: "global",
    applicablePlans: ["all"],
    usedCount: 3,
    isActive: true,
    notes: "50% off standard commercial pricing",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const pool = getAdminPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_kv_store (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const res = await pool.query(
      `SELECT data FROM system_kv_store WHERE key = 'officex_discounts' LIMIT 1`
    );

    let discounts: DiscountItem[] = [];

    if (res.rows.length === 0 || !res.rows[0].data) {
      discounts = DEFAULT_DISCOUNTS;
      await pool.query(
        `INSERT INTO system_kv_store (key, data, updated_at) VALUES ('officex_discounts', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
        [JSON.stringify(discounts)]
      );
    } else {
      discounts = Array.isArray(res.rows[0].data) ? res.rows[0].data : DEFAULT_DISCOUNTS;
    }

    return NextResponse.json({
      success: true,
      discounts,
    });
  } catch (err: any) {
    console.error("Discounts GET error:", err);
    return NextResponse.json({ success: true, discounts: DEFAULT_DISCOUNTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, discount, id, discounts: updatedList } = body;
    const pool = getAdminPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_kv_store (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const res = await pool.query(
      `SELECT data FROM system_kv_store WHERE key = 'officex_discounts' LIMIT 1`
    );

    let currentList: DiscountItem[] = res.rows.length > 0 && Array.isArray(res.rows[0].data)
      ? res.rows[0].data
      : DEFAULT_DISCOUNTS;

    if (action === "create" && discount) {
      const newDsc: DiscountItem = {
        id: `dsc-${Date.now()}`,
        code: (discount.code || "").trim().toUpperCase(),
        discountPct: Number(discount.discountPct) || 100,
        type: discount.type === "user_specific" ? "user_specific" : "global",
        targetUserEmail: discount.targetUserEmail ? discount.targetUserEmail.trim().toLowerCase() : undefined,
        applicablePlans: discount.applicablePlans || ["all"],
        usedCount: 0,
        isActive: discount.isActive !== false,
        notes: discount.notes || "",
        createdAt: new Date().toISOString(),
      };

      currentList = [newDsc, ...currentList.filter(d => d.code !== newDsc.code)];
    } else if (action === "toggle" && id) {
      currentList = currentList.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    } else if (action === "delete" && id) {
      currentList = currentList.filter(d => d.id !== id);
    } else if (Array.isArray(updatedList)) {
      currentList = updatedList;
    }

    await pool.query(
      `INSERT INTO system_kv_store (key, data, updated_at) VALUES ('officex_discounts', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
      [JSON.stringify(currentList)]
    );

    return NextResponse.json({
      success: true,
      message: "Discounts and special pricing updated successfully.",
      discounts: currentList,
    });
  } catch (err: any) {
    console.error("Discounts POST error:", err);
    return NextResponse.json(
      { error: "Failed to update discounts", details: err.message },
      { status: 500 }
    );
  }
}

