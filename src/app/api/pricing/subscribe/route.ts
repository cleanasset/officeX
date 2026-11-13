import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entitlements, organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAdminPool } from "@/lib/admin-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productCode = "CAFM", // CAFM, RR, PPM, VISITOR, COMPLIANCE, CRM, HELPDESK
      planName = "CAFM Pro Suite",
      edition = "professional",
      amount = 0,
      razorpay_payment_id,
      razorpay_order_id,
      orgId,
      userEmail,
    } = body;

    // Resolve target organization
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const [firstOrg] = await db.select({ id: organizations.id }).from(organizations).limit(1);
      targetOrgId = firstOrg?.id || "a411dd64-65db-462d-8eef-336f9768f44d";
    }

    const validUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days validity

    // Upsert entitlement
    const existing = await db
      .select()
      .from(entitlements)
      .where(
        and(
          eq(entitlements.orgId, targetOrgId),
          eq(entitlements.productCode, productCode)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(entitlements)
        .set({
          edition,
          status: "active",
          validUntil,
          updatedAt: new Date(),
        })
        .where(eq(entitlements.id, existing[0].id));
    } else {
      await db.insert(entitlements).values({
        orgId: targetOrgId,
        productCode,
        edition,
        status: "active",
        validUntil,
        addons: [],
      });
    }

    // Record payment in system_kv_store audit log
    const pool = getAdminPool();
    await pool.query(
      `INSERT INTO system_kv_store (key, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
      [
        `sub_tx_${razorpay_payment_id || Date.now()}`,
        JSON.stringify({
          productCode,
          planName,
          edition,
          amount,
          razorpay_payment_id,
          razorpay_order_id,
          userEmail,
          activatedAt: new Date().toISOString(),
          validUntil: validUntil.toISOString(),
        }),
      ]
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Subscription successfully activated for ${planName}`,
      productCode,
      edition,
      validUntil: validUntil.toISOString(),
    });
  } catch (err: any) {
    console.error("Subscription activation error:", err);
    return NextResponse.json(
      { error: "Failed to activate subscription", message: err.message },
      { status: 500 }
    );
  }
}

