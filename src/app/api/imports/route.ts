import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { import_batch } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);

    const batches = await db
      .select()
      .from(import_batch)
      .where(eq(import_batch.org_id, auth.orgId))
      .orderBy(desc(import_batch.imported_at))
      .limit(50);

    return NextResponse.json({ batches });
  } catch (err: any) {
    console.error("List imports failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
