import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  try {
    // Select logs and join user name if available
    const logs = await db.select({
      id: auditLogs.id,
      traceId: auditLogs.traceId,
      module: auditLogs.module,
      action: auditLogs.action,
      ipAddress: auditLogs.ipAddress,
      severity: auditLogs.severity,
      isAiPrediction: auditLogs.isAiPrediction,
      createdAt: auditLogs.createdAt,
      actorName: users.fullName
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt));

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Failed to query audit logs:", error);
    return NextResponse.json({ error: "Failed to query audit logs." }, { status: 500 });
  }
}
