import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { batch_id } = await params;

    const [batch] = await db
      .select()
      .from(import_batch)
      .where(and(eq(import_batch.id, batch_id), eq(import_batch.org_id, auth.orgId)));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(import_batch)
      .set({
        import_status: "approved",
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id))
      .returning();

    return NextResponse.json({
      success: true,
      batch: updated,
    });
  } catch (err: any) {
    console.error("Approve import failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
