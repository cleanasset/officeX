import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/me/organization
 * Returns the authenticated user's organization and properties.
 */
export async function GET(req: NextRequest) {
  try {
    const client = supabaseAdmin || supabase;
    const userId = req.nextUrl.searchParams.get("userId");
    const orgNameParam = req.nextUrl.searchParams.get("orgName");

    // 1. Fetch properties for this specific user or matching company
    if (!orgNameParam && (!userId || !/^[0-9a-fA-F-]{36}$/.test(userId))) {
      return NextResponse.json({ organizations: [] });
    }

    let query = client.from("properties").select("*").order("created_at", { ascending: false });
    if (orgNameParam) {
      query = query.ilike("owner_company", `%${orgNameParam}%`);
    } else if (userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
      query = query.eq("owner_user_id", userId);
    }

    const { data: props, error: pErr } = await query;

    if (!pErr && props && props.length > 0) {
      const orgCompany = props[0].owner_company || "My Commercial Assets";
      return NextResponse.json({
        organizations: [
          {
            id: props[0].id,
            name: orgCompany,
            legalName: orgCompany,
            city: props[0].city || "Ahmedabad",
            state: props[0].state || "Gujarat",
            properties: props
          }
        ]
      });
    }

    return NextResponse.json({ organizations: [] });
  } catch (error: any) {
    console.error("GET /api/me/organization error:", error);
    return NextResponse.json({ organizations: [] });
  }
}
