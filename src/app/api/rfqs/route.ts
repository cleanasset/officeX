import { db } from "@/db";
import { rfqs, auditLogs } from "@/db/schema";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.title || !data.category || !data.scopeOfWork || !data.propertyId) {
      return NextResponse.json({ error: "Missing required fields: title, category, scopeOfWork, or propertyId." }, { status: 400 });
    }

    const deadline = data.quoteDeadline ? new Date(data.quoteDeadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from now

    // Insert new RFQ into Supabase via Drizzle
    const newRfq = await db.insert(rfqs).values({
      propertyId: data.propertyId,
      title: data.title,
      category: data.category,
      scopeOfWork: data.scopeOfWork,
      manpowerRequired: data.manpowerRequired ? parseInt(data.manpowerRequired) : null,
      quoteDeadline: deadline,
      status: "open"
    }).returning();

    // Log the event in Audit Trails
    await db.insert(auditLogs).values({
      traceId: "TR-" + Math.floor(Math.random() * 900000 + 100000),
      module: "FM Marketplace",
      action: `RFQ Posted: "${data.title}" | Category: ${data.category}`,
      ipAddress: "127.0.0.1",
      severity: "info"
    });

    return NextResponse.json({
      success: true,
      rfq: newRfq[0],
      message: "RFQ posted successfully in FM Marketplace directory."
    }, { status: 200 });

  } catch (error) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json({ error: "Failed to post RFQ to marketplace database." }, { status: 500 });
  }
}
