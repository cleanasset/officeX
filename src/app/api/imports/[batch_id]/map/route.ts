import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { explodeSourceRow } from "@/lib/rent-roll/import/explode";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { batch_id } = await params;
    const body = await req.json();

    const mapping = body.mapping as Record<string, string>;
    if (!mapping || typeof mapping !== "object") {
      return NextResponse.json({ error: "Invalid mapping rules provided" }, { status: 400 });
    }

    const [batch] = await db
      .select()
      .from(import_batch)
      .where(and(eq(import_batch.id, batch_id), eq(import_batch.org_id, auth.orgId)));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Retrieve all staged rows
    const stagingRows = await db
      .select()
      .from(import_row_staging)
      .where(eq(import_row_staging.import_batch_id, batch_id));

    let mappedCount = 0;
    const sampleExploded: any[] = [];

    for (const staged of stagingRows) {
      const rawData = staged.source_row_json as Record<string, any>;
      const { exploded, parsedRow, unmapped } = explodeSourceRow(rawData, mapping, {
        defaultPropertyName: body.defaultPropertyName,
        defaultBuildingName: body.defaultBuildingName,
      });

      if (sampleExploded.length < 5) {
        sampleExploded.push({ row_num: staged.source_row_num, exploded });
      }

      await db
        .update(import_row_staging)
        .set({
          parsed_row_json: parsedRow,
          unmapped_columns: unmapped,
          mapped_to_entity: { exploded },
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(import_row_staging.id, staged.id));

      mappedCount++;
    }

    // Update batch status
    await db
      .update(import_batch)
      .set({
        import_status: "mapping",
        mapping_template_id: body.template_id || null,
        unmapped_rows: 0,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id));

    return NextResponse.json({
      success: true,
      mapped_rows_count: mappedCount,
      sample_preview: sampleExploded,
    });
  } catch (err: any) {
    console.error("Apply mapping failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
