import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { db } from "@/db";
import { client_account } from "@/db/rent-roll-schema";
import { eq, sql } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);

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

    // If no client account rows yet in database, provide standard specification defaults
    if (!clients || clients.length === 0) {
      clients = [
        {
          id: "00000000-0000-0000-0000-000000000002",
          client_name: "Self (Owner Portfolio)",
          client_code: "SELF",
          is_self: true,
          management_mandate: { fee_type: "fixed", fee_percentage: 0 },
        },
        {
          id: "11111111-1111-1111-1111-111111111111",
          client_name: "Sharma Estates (Managed)",
          client_code: "SHARMA",
          is_self: false,
          management_mandate: { fee_type: "percentage_of_collections", fee_percentage: 4.0 },
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          client_name: "Meridian Holdings (Mandate)",
          client_code: "MERIDIAN",
          is_self: false,
          management_mandate: { fee_type: "percentage_of_collections", fee_percentage: 5.0 },
        },
      ];
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
