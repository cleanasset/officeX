import { NextResponse } from "next/server";
import { db } from "@/db";
import { contractDocument } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-05: Download / View document with watermark and audit logging
 * - Watermark: "Confidential — <user> — <date>"
 * - Audit: every download/view logged
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;

    const [doc] = await db
      .select()
      .from(contractDocument)
      .where(
        and(
          eq(contractDocument.id, id),
          eq(contractDocument.org_id, auth.orgId),
          sql`${contractDocument.deleted_at} IS NULL`
        )
      );

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const watermarkText = `Confidential — ${auth.userId} — ${todayDate}`;

    // Audit log this view/download
    console.log(`[AUDIT LOG] Document downloaded/viewed: DocID=${doc.id}, ContractID=${doc.contract_id}, UserID=${auth.userId}, Time=${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      document: doc,
      watermark: watermarkText,
      download_url: doc.storage_path,
      audit: {
        viewed_by: auth.userId,
        viewed_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to download document", message: err.message }, { status: 500 });
  }
}
