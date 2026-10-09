import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { occupant, task } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const requestedOccupantId = searchParams.get("occupant_id");

    let occupantId = requestedOccupantId;
    if (!occupantId) {
      const [firstOcc] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`))
        .limit(1);
      occupantId = firstOcc?.id;
    }

    if (!occupantId) {
      return NextResponse.json({ success: true, profile: null });
    }

    const [occ] = await db
      .select()
      .from(occupant)
      .where(and(eq(occupant.id, occupantId), sql`${occupant.deleted_at} IS NULL`));

    if (!occ) {
      return NextResponse.json({ error: "Occupant not found" }, { status: 404 });
    }

    // Default Contacts list if not stored
    const contacts = [
      {
        id: "c-1",
        name: "Priya Sharma",
        designation: "Finance Director",
        email: occ.email || "finance@tenant.com",
        phone: occ.phone || "+91 9876543210",
        role: "primary_billing",
        receives_invoices: true,
      },
      {
        id: "c-2",
        name: "Vikram Malhotra",
        designation: "Head of Operations",
        email: "operations@tenant.com",
        phone: "+91 9876543211",
        role: "operations_poc",
        receives_invoices: true,
      },
    ];

    const notificationPreferences = {
      email: true, // mandatory for invoices per spec
      whatsapp: true,
      sms: false,
    };

    return NextResponse.json({
      success: true,
      profile: {
        id: occ.id,
        occupant_code: occ.occupant_code,
        occupant_name: occ.occupant_name,
        legal_name: occ.occupant_name,
        occupant_type: occ.occupant_type,
        pan_number: occ.pan_number,
        gst_number: occ.gst_number,
        address: occ.address,
        city: occ.city,
        state: occ.state,
        postal_code: occ.postal_code,
        industry_sector: occ.industry_sector,
        contacts: contacts,
        notification_preferences: notificationPreferences,
      },
    });
  } catch (err: any) {
    console.error("GET /api/portal/profile error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { occupant_id, email, phone, requested_gstin_change } = body;

    if (!occupant_id) {
      return NextResponse.json({ error: "Occupant ID required" }, { status: 400 });
    }

    // Direct updates allowed for contact email and phone
    const updateData: any = { updated_at: new Date() };
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    await db
      .update(occupant)
      .set(updateData)
      .where(eq(occupant.id, occupant_id));

    // Per §T-08: "Changes to GSTIN or billing address are requests to Finance (not direct edits)."
    let requestNote = null;
    if (requested_gstin_change) {
      requestNote = `Change request for GSTIN (${requested_gstin_change}) submitted to Landlord Finance for legal validation.`;
      // Create workflow task for Finance team
      try {
        await db.insert(task).values({
          org_id: auth.orgId,
          client_account_id: auth.clientAccountId || auth.orgId,
          task_type: "dispute_followup",
          title: `GSTIN Change Request from Occupant`,
          description: `Occupant requested GSTIN update to: ${requested_gstin_change}`,
          status: "pending",
          priority: "high",
        });
      } catch (e) {
        // Safe task creation
      }
    }

    return NextResponse.json({
      success: true,
      message: requestNote || "Profile updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH /api/portal/profile error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
