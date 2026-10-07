import { NextResponse } from "next/server";
import { db } from "@/db";
import { contractDocument } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * RR-CONT-05: Soft delete document
 * - Executed docs can't be deleted; drafts soft-deleted by uploader/admin
 */
export async function DELETE(
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

    if (doc.status === "executed" || doc.status === "signed") {
      return NextResponse.json(
        { error: "Executed or signed documents cannot be deleted." },
        { status: 400 }
      );
    }

    // Role check: uploader or admin/manager
    const isUploader = doc.created_by === auth.userId;
    const isAdmin = ["super_admin", "owner", "property_manager"].includes(auth.role);
    if (!isUploader && !isAdmin) {
      return NextResponse.json(
        { error: "Only the uploader or an administrator can delete this draft document" },
        { status: 403 }
      );
    }

    await db
      .update(contractDocument)
      .set({
        deleted_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(contractDocument.id, id));

    return NextResponse.json({
      success: true,
      message: "Draft document deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete document", message: err.message }, { status: 500 });
  }
}
