import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentRollAuditLogs, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    let logs: any[] = [];
    try {
      const records = await db
        .select()
        .from(rentRollAuditLogs)
        .orderBy(desc(rentRollAuditLogs.createdAt))
        .limit(100);

      logs = records.map((r) => ({
        id: r.id,
        timestamp: r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "—",
        user_name: "System / Authorized User",
        user_role: "finance",
        action: r.action,
        entity: r.entityName,
        record_id: r.leaseId || r.id,
        field_changed: "attributes",
        old_value: r.oldValues ? JSON.stringify(r.oldValues) : null,
        new_value: r.newValues ? JSON.stringify(r.newValues) : null,
        source: "UI",
        ip_address: "127.0.0.1",
        details: `${r.action} performed on ${r.entityName}`,
      }));
    } catch (e) {}

    if (format === "csv") {
      const headers = "Timestamp,User,Role,Action,Entity,Record ID,Field,Old Value,New Value,Source,IP,Details\n";
      const rows = logs
        .map(
          (r) =>
            `"${r.timestamp}","${r.user_name}","${r.user_role}","${r.action}","${r.entity}","${r.record_id}","${r.field_changed || ""}","${r.old_value || ""}","${r.new_value || ""}","${r.source}","${r.ip_address}","${r.details}"`
        )
        .join("\n");

      return new NextResponse(headers + rows, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="OFFICEX_Audit_Log.csv"',
        },
      });
    }

    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch audit log", message: err.message }, { status: 500 });
  }
}
