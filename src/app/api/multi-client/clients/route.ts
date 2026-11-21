import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { db } from "@/db";
import { client_account } from "@/db/rent-roll-schema";
import { eq, sql } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot access client accounts" }, { status: 403 });
    }

    let clients = await db
      .select({
        id: client_account.id,
        client_name: client_account.client_name,
        client_code: client_account.client_code,
        is_self: client_account.is_self,
        management_mandate: client_account.management_mandate,
      })
      .from(client_account)
      .where(
        sql`${client_account.org_id} = ${auth.orgId} AND ${client_account.deleted_at} IS NULL`
      );

    // Strictly database client accounts (zero mock data)
    if (!clients) {
      clients = [];
    }

    return NextResponse.json({
      success: true,
      data: clients,
      clients,
    });
  } catch (error: any) {
    console.error("Error fetching clients list:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients", message: error.message },
      { status: 500 }
    );
  }
}
