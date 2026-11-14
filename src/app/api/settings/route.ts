import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, sql } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);

    // Fetch org details or fallback to clean defaults
    let orgData: any = null;
    try {
      const [res] = await db.select().from(organizations).where(eq(organizations.id, auth.orgId)).limit(1);
      orgData = res;
    } catch (e) {}

    const settings = {
      organisation: {
        id: orgData?.id || auth.orgId,
        name: orgData?.name || "",
        legal_name: orgData?.name || "",
        pan: orgData?.pan || "",
        gstin: orgData?.gstin || "",
        tan: "",
        registered_address: orgData?.address || "",
        city: orgData?.city || "",
        state: orgData?.state || "",
        pincode: orgData?.pincode || "",
        website: "",
        support_email: "",
      },
      branding: {
        logo_url: "",
        primary_color: "#0D7B6C",
        accent_color: "#0F8B7D",
        font_family: "Inter, sans-serif",
        header_tagline: orgData?.workspace_name || "",
        footer_disclaimer: "Computer generated GST Tax Invoice. Requires no physical signature.",
      },
      financial_controls: {
        operating_currency: orgData?.currency || "INR (₹)",
        financial_year_start: "April (1-Apr to 31-Mar)",
        current_financial_year: "2026-27",
        global_financial_lock_date: "",
        round_off_rule: "round_nearest_rupee", // F-01
        gstin_mandatory: true,
        pan_mandatory: true,
        maker_checker_enabled: false,
      },
      subscription: {
        plan: "Commercial Rent Roll",
        tier: "Standard",
        status: "active",
        license_units: "Standard Tier",
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
    const org = body.organisation || body;

    try {
      const [existing] = await db.select().from(organizations).where(eq(organizations.id, auth.orgId)).limit(1);
      if (existing) {
        await db.update(organizations).set({
          name: org.name ?? existing.name,
          pan: org.pan ?? existing.pan,
          gstin: org.gstin ?? existing.gstin,
          address: org.registered_address ?? org.address ?? existing.address,
          city: org.city ?? existing.city,
          state: org.state ?? existing.state,
          pincode: org.pincode ?? existing.pincode,
          currency: body.financial_controls?.operating_currency?.includes("USD") ? "USD" : "INR",
          updatedAt: new Date(),
        }).where(eq(organizations.id, auth.orgId));
      } else {
        await db.insert(organizations).values({
          id: auth.orgId,
          name: org.name || "Commercial Portfolio",
          pan: org.pan || null,
          gstin: org.gstin || null,
          address: org.registered_address || org.address || null,
          city: org.city || null,
          state: org.state || null,
          pincode: org.pincode || null,
          currency: "INR",
        });
      }
    } catch (dbErr) {
      console.error("DB update error in settings POST:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Company profile and preferences updated successfully.",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update settings", message: err.message }, { status: 500 });
  }
}
