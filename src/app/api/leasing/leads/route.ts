import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq, like, and, desc } from "drizzle-orm";

export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all audit logs for the Leasing CRM containing lead submissions
    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.module, "Leasing CRM"),
          like(auditLogs.action, "Lead Requirement Logged:%")
        )
      )
      .orderBy(desc(auditLogs.createdAt));

    // Parse logs into lead objects
    const parsedLeads = logs.map((log) => {
      // Action format: `Lead Requirement Logged: ${companyName} | SqFt: ${desiredSqft} | Budget: ₹${budgetRange}`
      const actionText = log.action;
      const cleanText = actionText.replace("Lead Requirement Logged:", "").trim();
      const parts = cleanText.split("|").map(p => p.trim());
      
      const companyName = parts[0] || "Unknown Client";
      const sqftPart = parts[1] ? parts[1].replace("SqFt:", "").trim() : "8,500";
      const budgetPart = parts[2] ? parts[2].replace("Budget:", "").trim() : "Flexible";

      return {
        id: log.traceId,
        company: companyName,
        contact: "Web Lead Prospect",
        area: sqftPart.includes("sq.ft") ? sqftPart : `${sqftPart} sq.ft`,
        budget: budgetPart.startsWith("₹") ? budgetPart : `₹${budgetPart}`,
        status: "New Lead",
        date: new Date(log.createdAt || new Date()).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      };
    });

    return NextResponse.json(parsedLeads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
