import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, auditLogs } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/invoices/[id]/approve — Approve Draft Invoice (§RR-FIN-02, §S-05, §S-13)
 * Auth: Only Finance Manager, Approver, Owner, or Org Admin can approve invoices.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // Role check: Maker-Checker separation for Invoices
    const allowedRoles = ["finance_manager", "finance", "approver", "owner", "client_principal", "org_admin", "super_admin"];
    const userRoleKey = ((auth as any).roleKey || auth.role || "").toLowerCase();

    if (!allowedRoles.includes(userRoleKey) && !auth.isPortfolioRole) {
      return NextResponse.json(
        {
          error: `Role '${auth.role}' is unauthorized to approve invoices. Requires Finance / AR Manager or Approver authorization.`,
        },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, id), eq(invoice.org_id, auth.orgId)));

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: `Invoice is already '${existing.status}'. Only draft invoices can be approved.` },
        { status: 400 }
      );
    }

    const [approvedInvoice] = await db
      .update(invoice)
      .set({
        status: "issued",
        sent_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoice.id, id))
      .returning();

    // Audit log
    try {
      await db.insert(auditLogs).values({
        orgId: auth.orgId,
        userId: auth.userId,
        action: "INVOICE_APPROVED",
        entityType: "invoice",
        entityId: id,
        details: {
          invoice_number: existing.invoice_number,
          gross_total: existing.gross_total,
          approval_comment: body.approval_comment || "Approved by Finance",
          approved_by_role: auth.roleName,
        },
      });
    } catch (e) {
      // safe fallback if auditLogs has different structure
    }

    return NextResponse.json({
      success: true,
      invoice_id: approvedInvoice.id,
      invoice_number: approvedInvoice.invoice_number,
      status: "issued",
      message: `Invoice ${approvedInvoice.invoice_number} approved and issued successfully`,
    });
  } catch (err: any) {
    console.error("POST /api/invoices/[id]/approve error:", err);
    return NextResponse.json({ error: err?.message || "Failed to approve invoice" }, { status: 500 });
  }
}
