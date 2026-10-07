import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateOwnerStatement } from "@/lib/rent-roll/multi-client/owner-statement";
import { db } from "@/db";
import { client_account } from "@/db/rent-roll-schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    let clientAccountId = searchParams.get("client_account_id") || auth.clientAccountId;
    const periodStart = searchParams.get("period_start") || undefined;
    const periodEnd = searchParams.get("period_end") || undefined;

    if (!clientAccountId || clientAccountId === "all") {
      // Pick first client account if not specified
      const [firstClient] = await db
        .select()
        .from(client_account)
        .where(eq(client_account.org_id, auth.orgId))
        .limit(1);

      if (!firstClient) {
        return NextResponse.json(
          { error: "No client account available in this organization" },
          { status: 404 }
        );
      }
      clientAccountId = firstClient.id;
    }

    const statement = await generateOwnerStatement(
      auth.orgId,
      clientAccountId,
      periodStart,
      periodEnd
    );

    return NextResponse.json({
      success: true,
      statement,
      data: statement,
    });
  } catch (err: any) {
    console.error("Owner statement generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
