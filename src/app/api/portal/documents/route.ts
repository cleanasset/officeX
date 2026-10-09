import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  occupant,
  contract,
  contract_document,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const requestedOccupantId = searchParams.get("occupant_id");

    let occupantId = requestedOccupantId;
    if (!occupantId) {
      const [firstOcc] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`))
        .limit(1);
      occupantId = firstOcc?.id;
    }

    if (!occupantId) {
      return NextResponse.json({ success: true, documents: [] });
    }

    // Find contracts for this occupant
    const occupantContracts = await db
      .select({ id: contract.id })
      .from(contract)
      .where(
        and(
          eq(contract.occupant_id, occupantId),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    const contractIds = occupantContracts.map((c) => c.id);
    if (!contractIds.length) {
      return NextResponse.json({ success: true, documents: [] });
    }

    // Query documents visible to occupant
    const docs = await db
      .select({
        id: contract_document.id,
        contract_id: contract_document.contract_id,
        doc_type: contract_document.doc_type,
        file_name: contract_document.file_name,
        storage_path: contract_document.storage_path,
        version: contract_document.version,
        is_current: contract_document.is_current,
        status: contract_document.status,
        effective_date: contract_document.effective_date,
        expiry_date: contract_document.expiry_date,
        created_at: contract_document.created_at,
      })
      .from(contract_document)
      .where(
        and(
          sql`${contract_document.contract_id} IN ${contractIds}`,
          or(
            eq(contract_document.visibility, "occupant_visible"),
            eq(contract_document.visibility, "client_visible")
          ),
          sql`${contract_document.deleted_at} IS NULL`
        )
      )
      .orderBy(desc(contract_document.created_at));

    return NextResponse.json({
      success: true,
      documents: docs.map((d) => ({
        ...d,
        file_url: d.storage_path,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/portal/documents error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { contract_id, doc_type, file_name, file_url, expiry_date } = body;

    if (!contract_id || !file_name) {
      return NextResponse.json({ error: "Missing required document fields" }, { status: 400 });
    }

    const [newDoc] = await db
      .insert(contract_document)
      .values({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || auth.orgId,
        contract_id: contract_id,
        doc_type: doc_type || "other",
        file_name: file_name,
        storage_path: file_url || `/uploads/${file_name}`,
        status: "under_review",
        visibility: "occupant_visible",
        is_current: true,
        expiry_date: expiry_date || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully for review",
      document: newDoc,
    });
  } catch (err: any) {
    console.error("POST /api/portal/documents error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
