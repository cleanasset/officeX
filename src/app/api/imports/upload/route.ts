import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch, import_row_staging } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { profileFile } from "@/lib/rent-roll/import/profiler";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    let fileName = "rent_roll_upload.xlsx";
    let fileBuffer: Buffer | null = null;
    let rawRowsData: Record<string, any>[] | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form-data" }, { status: 400 });
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON payload fallback
      const body = await req.json();
      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, "base64");
        fileName = body.fileName || fileName;
      } else if (Array.isArray(body.rows) && body.rows.length > 0) {
        const rowsArray = body.rows as Record<string, any>[];
        fileName = body.fileName || "manual_data.json";
        // Create an in-memory workbook to run standard profiler
        const ws = XLSX.utils.json_to_sheet(rowsArray);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        fileBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      } else {
        return NextResponse.json({ error: "Missing file or rows in request" }, { status: 400 });
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "Failed to read file buffer" }, { status: 400 });
    }

    // Profile the file and extract preview + suggestions
    const { data: cleanRows, profile } = profileFile(fileBuffer, fileName);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const batchCode = `IMPORT-${dateStr}-${randomSuffix}`;

    // 1. Create import_batch record
    const [batch] = await db
      .insert(import_batch)
      .values({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || null,
        batch_code: batchCode,
        file_name: fileName,
        file_size_bytes: fileBuffer.length,
        total_rows: cleanRows.length,
        passed_rows: 0,
        warning_rows: 0,
        failed_rows: 0,
        unmapped_rows: cleanRows.length,
        import_status: "uploading",
        imported_by: auth.userId,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    // 2. Insert rows into staging table
    if (cleanRows.length > 0) {
      const stagingRows = cleanRows.map((row, index) => ({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || null,
        import_batch_id: batch.id,
        source_row_num: index + 1,
        source_row_json: row,
        validation_status: "unmapped" as const,
        validation_errors: [],
        unmapped_columns: row,
        created_by: auth.userId,
        updated_by: auth.userId,
      }));

      // Insert in chunks of 100 for batch efficiency
      for (let i = 0; i < stagingRows.length; i += 100) {
        const chunk = stagingRows.slice(i, i + 100);
        await db.insert(import_row_staging).values(chunk);
      }
    }

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      batch_code: batch.batch_code,
      total_rows: cleanRows.length,
      headers: profile.headers,
      column_suggestions: profile.columnSuggestions,
      preview_rows: profile.previewRows,
      quality_warnings: profile.qualityWarnings,
    });
  } catch (err: any) {
    console.error("Import upload failed:", err);
    return NextResponse.json({ error: err.message || "Failed to parse upload" }, { status: 500 });
  }
}
