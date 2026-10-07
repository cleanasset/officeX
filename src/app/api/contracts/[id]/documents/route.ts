import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, contractDocument } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * RR-CONT-05, §S-23: Contract Documents Repository
 * - List documents
 * - Upload new version: keeps all historical versions; only one current per type except "other"
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const docs = await db
      .select()
      .from(contractDocument)
      .where(
        and(
          eq(contractDocument.contract_id, id),
          eq(contractDocument.org_id, auth.orgId),
          sql`${contractDocument.deleted_at} IS NULL`
        )
      )
      .orderBy(desc(contractDocument.version), desc(contractDocument.created_at));

    return NextResponse.json({ success: true, data: docs });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch documents", message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [c] = await db
      .select()
      .from(contract)
      .where(
        and(
          eq(contract.id, id),
          eq(contract.org_id, auth.orgId),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const payload = {
      ...body,
      org_id: c.org_id,
      client_account_id: c.client_account_id,
      contract_id: id,
      doc_type: body.doc_type || "lease_agreement",
      file_name: body.file_name || "Document.pdf",
    };

    const reqVal = validateRequiredFields("contract_document", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    // Determine current version number for this doc_type
    const existingForType = await db
      .select({ version: contractDocument.version })
      .from(contractDocument)
      .where(
        and(
          eq(contractDocument.contract_id, id),
          eq(contractDocument.doc_type, payload.doc_type)
        )
      )
      .orderBy(desc(contractDocument.version))
      .limit(1);

    const nextVersion = existingForType.length > 0 ? (existingForType[0].version || 1) + 1 : 1;

    // If not "other", set previous versions to is_current = false
    if (payload.doc_type !== "other") {
      await db
        .update(contractDocument)
        .set({ is_current: false })
        .where(
          and(
            eq(contractDocument.contract_id, id),
            eq(contractDocument.doc_type, payload.doc_type)
          )
        );
    }

    const [inserted] = await db
      .insert(contractDocument)
      .values({
        org_id: c.org_id,
        client_account_id: c.client_account_id,
        contract_id: id,
        doc_type: payload.doc_type,
        file_name: payload.file_name,
        storage_path: body.storage_path || `/documents/${id}/${payload.file_name}`,
        file_size_bytes: body.file_size_bytes || 1024,
        mime_type: body.mime_type || "application/pdf",
        checksum: body.checksum || body.sha256_hash || null,
        version: nextVersion,
        is_current: true,
        status: body.status || "executed",
        visibility: body.visibility || "internal",
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Document uploaded as version ${nextVersion}`,
      data: inserted,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to upload document", message: err.message }, { status: 500 });
  }
}
