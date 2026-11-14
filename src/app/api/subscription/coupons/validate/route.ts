import { NextRequest, NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || "").trim().toUpperCase();
    const userEmail = (searchParams.get("email") || "").trim().toLowerCase();

    if (!code) {
      return NextResponse.json({ valid: false, message: "Enter a coupon code" }, { status: 400 });
    }

    // Built-in hardcoded fallback codes for safety
    if (code === "OFFICEX100" || code === "RENTROLL12" || code === "FREE100") {
      return NextResponse.json({
        valid: true,
        discountPct: 100,
        code,
        message: `🎉 Promo code '${code}' applied: 100% Free Plan Access!`,
      });
    }

    // Query system_kv_store for admin-managed discounts
    let discounts: any[] = [];
    try {
      const pool = getAdminPool();
      const res = await pool.query(
        `SELECT data FROM system_kv_store WHERE key = 'officex_discounts' LIMIT 1`
      );
      if (res.rows.length > 0 && Array.isArray(res.rows[0].data)) {
        discounts = res.rows[0].data;
      }
    } catch {}

    const match = discounts.find((d) => d.code === code && d.isActive);

    if (!match) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or expired coupon code.",
      });
    }

    // Check user-specific restriction
    if (match.type === "user_specific") {
      if (!userEmail) {
        return NextResponse.json({
          valid: false,
          message: "Please sign in with your authorized email to use this special discount.",
        });
      }
      if (match.targetUserEmail && match.targetUserEmail.toLowerCase() !== userEmail) {
        return NextResponse.json({
          valid: false,
          message: `This special discount is exclusive to ${match.targetUserEmail}.`,
        });
      }
    }

    return NextResponse.json({
      valid: true,
      discountPct: match.discountPct,
      code: match.code,
      message: `🎉 Special discount '${match.code}' applied: ${match.discountPct}% off!`,
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: "Error validating coupon" }, { status: 500 });
  }
}

