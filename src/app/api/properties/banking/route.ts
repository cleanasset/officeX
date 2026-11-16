import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { billingEntities } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { supabase } from "@/lib/supabase";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);

    // 1. Check system_kv_store for globally saved landlord banking
    try {
      const { data: kv } = await supabase
        .from("system_kv_store")
        .select("data")
        .eq("key", "officex_landlord_bank_details")
        .maybeSingle();

      if (kv?.data && (kv.data as any).bankAccount) {
        return NextResponse.json({
          success: true,
          bank_details: kv.data,
        });
      }
    } catch (e) {}

    // 2. Check billing_entities
    try {
      const [be] = await db
        .select()
        .from(billingEntities)
        .where(eq(billingEntities.orgId, auth.orgId))
        .orderBy(desc(billingEntities.isDefault), desc(billingEntities.createdAt))
        .limit(1);

      if (be && be.bankAccountNumber) {
        return NextResponse.json({
          success: true,
          bank_details: {
            spvName: be.legalName,
            bankName: be.bankName,
            bankAccount: be.bankAccountNumber,
            bankIfsc: be.bankIfsc,
            bankBranch: be.bankBranch,
          },
        });
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      bank_details: null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      spvName = "Panchshil Realty Infrastructure Ltd",
      bankName = "HDFC Bank Commercial Escrow",
      bankAccount = "",
      bankIfsc = "",
      bankBranch = "Main Commercial Branch",
    } = body;

    const bankPayload = {
      spvName,
      bankName,
      bankAccount,
      bankIfsc: bankIfsc?.toUpperCase(),
      bankBranch,
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist to system_kv_store for universal multi-tenant availability
    try {
      await supabase
        .from("system_kv_store")
        .upsert(
          {
            key: "officex_landlord_bank_details",
            data: bankPayload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
    } catch (e) {
      console.warn("KV store save failed:", e);
    }

    // 2. Persist/Upsert to billing_entities
    try {
      const [existing] = await db
        .select()
        .from(billingEntities)
        .where(eq(billingEntities.orgId, auth.orgId))
        .limit(1);

      if (existing) {
        await db
          .update(billingEntities)
          .set({
            legalName: spvName,
            bankName: bankName,
            bankAccountNumber: bankAccount,
            bankIfsc: bankIfsc?.toUpperCase(),
            bankBranch: bankBranch,
            updatedAt: new Date(),
          })
          .where(eq(billingEntities.id, existing.id));
      } else {
        await db.insert(billingEntities).values({
          orgId: auth.orgId,
          legalName: spvName,
          tradeName: spvName,
          pan: "AABCP5544J",
          gstin: "27AABCP5544J1ZK",
          stateCode: "27",
          registeredAddress: "Kharadi, Knowledge Park, Pune, Maharashtra 411014",
          bankName: bankName,
          bankAccountNumber: bankAccount,
          bankIfsc: bankIfsc?.toUpperCase(),
          bankBranch: bankBranch,
          isDefault: true,
        });
      }
    } catch (e) {
      console.warn("Billing entity upsert warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Landlord bank details saved to master registry.",
      bank_details: bankPayload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
