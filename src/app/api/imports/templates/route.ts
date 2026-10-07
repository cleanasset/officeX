import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mapping_template } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, desc, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);

    const templates = await db
      .select()
      .from(mapping_template)
      .where(and(eq(mapping_template.org_id, auth.orgId), isNull(mapping_template.deleted_at)))
      .orderBy(desc(mapping_template.created_at));

    return NextResponse.json({ templates });
  } catch (err: any) {
    console.error("List mapping templates failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    if (!body.template_name) {
      return NextResponse.json({ error: "template_name is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(mapping_template)
      .values({
        org_id: auth.orgId,
        client_account_id: auth.clientAccountId || null,
        template_name: body.template_name,
        template_version: body.template_version || 1,
        mapping_rules: body.mapping_rules || {},
        synonym_dict: body.synonym_dict || {},
        transform_rules: body.transform_rules || {},
        is_active: body.is_active ?? true,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      template: created,
    });
  } catch (err: any) {
    console.error("Create mapping template failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
