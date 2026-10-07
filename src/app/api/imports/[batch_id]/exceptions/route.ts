import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_exception } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { batch_id } = await params;

    const exceptions = await db
      .select()
      .from(import_exception)
      .where(and(eq(import_exception.import_batch_id, batch_id), eq(import_exception.org_id, auth.orgId)))
      .orderBy(asc(import_exception.source_row_num));

    return NextResponse.json({ exceptions });
  } catch (err: any) {
    console.error("Get exceptions failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { batch_id } = await params;
    const body = await req.json();

    const exceptionId = body.exception_id;
    const resolution = body.resolution || "User acknowledged and approved";

    if (!exceptionId) {
      return NextResponse.json({ error: "exception_id is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(import_exception)
      .set({
        user_resolved_at: new Date(),
        user_resolution: resolution,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(
        and(
          eq(import_exception.id, exceptionId),
          eq(import_exception.import_batch_id, batch_id),
          eq(import_exception.org_id, auth.orgId)
        )
      )
      .returning();

    return NextResponse.json({ success: true, exception: updated });
  } catch (err: any) {
    console.error("Resolve exception failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
