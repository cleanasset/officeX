import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.companyName || !data.desiredSqft) {
      return NextResponse.json({ error: "Missing required companyName or desiredSqft fields." }, { status: 400 });
    }

    // Insert audit log to track lead receipt in CRM
    const traceId = "TR-" + Math.floor(Math.random() * 900000 + 100000);
    await db.insert(auditLogs).values({
      traceId: traceId,
      module: "Leasing CRM",
      action: `Lead Requirement Logged: ${data.companyName} | SqFt: ${data.desiredSqft} | Budget: ₹${data.budgetRange || "Flexible"}`,
      ipAddress: "127.0.0.1",
      severity: "info"
    });

    return NextResponse.json({
      success: true,
      traceId: traceId,
      message: "Lead requirement captured successfully in CRM pipeline."
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error inserting lead record." }, { status: 500 });
  }
}
