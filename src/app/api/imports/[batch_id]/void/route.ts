import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  import_batch,
  contract,
  space,
  occupant,
  building,
  property,
  contract_charge,
  rent_step,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
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
      return NextResponse.json({ error: "Import batch not found" }, { status: 404 });
    }

    if (batch.import_status === "voided") {
      return NextResponse.json({ error: "Import batch has already been voided" }, { status: 400 });
    }

    const now = new Date();

    // Soft delete all rows created from this import batch
    await db
      .update(contract)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(contract.source_import_batch_id, batch_id), eq(contract.org_id, auth.orgId)));

    await db
      .update(space)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(space.source_import_batch_id, batch_id), eq(space.org_id, auth.orgId)));

    await db
      .update(occupant)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(occupant.source_import_batch_id, batch_id), eq(occupant.org_id, auth.orgId)));

    await db
      .update(building)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(building.source_import_batch_id, batch_id), eq(building.org_id, auth.orgId)));

    await db
      .update(property)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(property.source_import_batch_id, batch_id), eq(property.org_id, auth.orgId)));

    await db
      .update(contract_charge)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(contract_charge.source_import_batch_id, batch_id), eq(contract_charge.org_id, auth.orgId)));

    await db
      .update(rent_step)
      .set({ deleted_at: now, updated_at: now, updated_by: auth.userId })
      .where(and(eq(rent_step.source_import_batch_id, batch_id), eq(rent_step.org_id, auth.orgId)));

    // Update batch to voided
    const [voided] = await db
      .update(import_batch)
      .set({
        import_status: "voided",
        voided_at: now,
        voided_by: auth.userId,
        updated_at: now,
        updated_by: auth.userId,
      })
      .where(eq(import_batch.id, batch_id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Batch ${batch.batch_code} and all associated records have been successfully voided.`,
      batch: voided,
    });
  } catch (err: any) {
    console.error("Void import failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
