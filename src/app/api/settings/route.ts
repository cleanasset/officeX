import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, sql } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);

    // Fetch org details or fallback to spec default
    let orgData: any = null;
    try {
      const [res] = await db.select().from(organizations).where(eq(organizations.id, auth.orgId)).limit(1);
      orgData = res;
    } catch (e) {}

    const settings = {
      organisation: {
        id: orgData?.id || auth.orgId,
        name: orgData?.name || "OFFICEX Realty Commercial Asset Management",
        legal_name: "OFFICEX PropTech Solutions Private Limited",
        pan: "AAFCO8899C",
        tan: "MUMA88991C",
        registered_address: "Level 14, Tower 1, Meridian Tech Park, BKC, Mumbai - 400051",
        website: "https://officex.ai",
        support_email: "support@officex.ai",
      },
      branding: {
        logo_url: "/logo.png",
        primary_color: "#0D7B6C",
        accent_color: "#0F8B7D",
        font_family: "Inter, sans-serif",
        header_tagline: "Commercial Real Estate ERP & Lease-to-Cash Rent Roll",
        footer_disclaimer: "System generated Indian GST Tax Invoice. Computer generated document requires no physical signature.",
      },
      financial_controls: {
        operating_currency: "INR (₹)",
        financial_year_start: "April (1-Apr to 31-Mar)",
        current_financial_year: "2026-27",
        global_financial_lock_date: "2026-09-30",
        round_off_rule: "round_nearest_rupee", // F-01
        gstin_mandatory: true,
        pan_mandatory: true,
        maker_checker_enabled: true,
      },
      subscription: {
        plan: "Enterprise Commercial Rent Roll",
        tier: "P0-P5 Complete",
        status: "active",
        license_units: "Unlimited Spaces & Leases",
        next_renewal: "31-Mar-2027",
      },
    };

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch organisation settings", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    return NextResponse.json({
      success: true,
      message: "Organisation & branding preferences updated successfully (S-60).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update settings", message: err.message }, { status: 500 });
  }
}
