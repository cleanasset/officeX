import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { calculateImportDiff } from "@/lib/rent-roll/import/diff";
import { eq, and, ne } from "drizzle-orm";

export async function GET(
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

    // Retrieve validated staging rows (passed or warning)
    const stagingRows = await db
      .select()
      .from(import_row_staging)
      .where(
        and(
          eq(import_row_staging.import_batch_id, batch_id),
          ne(import_row_staging.validation_status, "failed")
        )
      );

    const stagedEntities = stagingRows
      .map((r) => {
        const ent = (r.mapped_to_entity as any)?.exploded;
        return ent ? { source_row_num: r.source_row_num, entities: ent } : null;
      })
      .filter(Boolean) as any[];

    const diff = await calculateImportDiff(auth.orgId, auth.clientAccountId, stagedEntities);

    // Update status to diffing
    await db
      .update(import_batch)
      .set({
        import_status: "diffing",
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id));

    return NextResponse.json({
      success: true,
      diff,
    });
  } catch (err: any) {
    console.error("Calculate diff failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
