import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateErrorWorkbook } from "@/lib/rent-roll/import/excel-generator";
import { eq, and } from "drizzle-orm";
import fs from "fs";

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

    let fileBuffer: Buffer | null = null;

    if (batch.error_file_path && fs.existsSync(batch.error_file_path)) {
      fileBuffer = fs.readFileSync(batch.error_file_path);
    } else {
      // Generate on the fly from staging failed rows
      const failedRows = await db
        .select()
        .from(import_row_staging)
        .where(
          and(
            eq(import_row_staging.import_batch_id, batch_id),
            eq(import_row_staging.validation_status, "failed")
          )
        );

      if (failedRows.length === 0) {
        return NextResponse.json({ message: "No failed rows in this batch." }, { status: 200 });
      }

      fileBuffer = generateErrorWorkbook(
        failedRows.map((r) => ({
          source_row_num: r.source_row_num,
          source_row_json: r.source_row_json as any,
          validation_errors: (r.validation_errors as any) || [],
        }))
      );
    }

    const filename = `import_errors_${batch.batch_code}.xlsx`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Download error file failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
