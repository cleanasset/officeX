import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging, import_exception } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { validateImportRow } from "@/lib/rent-roll/import/validation";
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

    // Delete prior exceptions for idempotency
    await db.delete(import_exception).where(eq(import_exception.import_batch_id, batch_id));

    const stagingRows = await db
      .select()
      .from(import_row_staging)
      .where(eq(import_row_staging.import_batch_id, batch_id));

    let passedCount = 0;
    let warningCount = 0;
    let failedCount = 0;

    const seenSpaceCodes = new Set<string>();
    const batchExceptionsToInsert: any[] = [];

    for (const staged of stagingRows) {
      const mappedEntityObj = staged.mapped_to_entity as any;
      const entities = mappedEntityObj?.exploded;

      if (!entities) {
        // Row was not mapped yet
        await db
          .update(import_row_staging)
          .set({
            validation_status: "failed",
            validation_errors: [{ field: "mapping", expected: "Mapped entity", actual: "null", message: "Row has not been mapped." }],
          })
          .where(eq(import_row_staging.id, staged.id));
        failedCount++;
        continue;
      }

      const result = validateImportRow(entities, staged.source_row_json as any, seenSpaceCodes);

      if (result.status === "passed") passedCount++;
      else if (result.status === "warning") warningCount++;
      else failedCount++;

      // Update staging row
      await db
        .update(import_row_staging)
        .set({
          validation_status: result.status,
          validation_errors: result.errors,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(import_row_staging.id, staged.id));

      // Collect exceptions
      for (const exc of result.exceptions) {
        batchExceptionsToInsert.push({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId || null,
          import_batch_id: batch.id,
          source_row_num: staged.source_row_num,
          field_name: exc.field_name,
          flag_type: exc.flag_type,
          flag_message: exc.flag_message,
          expected_value: exc.expected_value || null,
          actual_value: exc.actual_value || null,
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      }
    }

    // Insert exceptions in chunks
    if (batchExceptionsToInsert.length > 0) {
      for (let i = 0; i < batchExceptionsToInsert.length; i += 100) {
        const chunk = batchExceptionsToInsert.slice(i, i + 100);
        await db.insert(import_exception).values(chunk);
      }
    }

    // Update batch stats
    await db
      .update(import_batch)
      .set({
        passed_rows: passedCount,
        warning_rows: warningCount,
        failed_rows: failedCount,
        import_status: "validating",
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id));

    return NextResponse.json({
      success: true,
      total_rows: stagingRows.length,
      passed_rows: passedCount,
      warning_rows: warningCount,
      failed_rows: failedCount,
      exceptions_count: batchExceptionsToInsert.length,
    });
  } catch (err: any) {
    console.error("Run validation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
