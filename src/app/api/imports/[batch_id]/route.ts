import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, asc } from "drizzle-orm";

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
      return NextResponse.json({ error: "Import batch not found" }, { status: 404 });
    }

    const rows = await db
      .select()
      .from(import_row_staging)
      .where(eq(import_row_staging.import_batch_id, batch_id))
      .orderBy(asc(import_row_staging.source_row_num))
      .limit(100);

    return NextResponse.json({
      batch,
      staging_rows: rows,
    });
  } catch (err: any) {
    console.error("Get import batch failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
