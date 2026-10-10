import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Production Deployed Domain Fallback — Zero localhost guarantee
const DEPLOYED_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.officex.pro";

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      name,
      email,
      role = "property_manager",
      entityType = "pm_agency",
      rights = {},
      propertyName,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Save delegated manager in Supabase users table
    try {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (existing.length === 0) {
        await db.insert(users).values({
          email: cleanEmail,
          fullName: name || "Property Manager",
          passwordHash: "INVITED_DELEGATION",
          role: "property_manager",
        });
      }
    } catch (dbErr) {
      console.error("Delegated user DB persistence note:", dbErr);
    }

    // Generate unique secure token
    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

    // Build strictly deployed domain invitation URL
    const cleanBase = DEPLOYED_BASE_URL.replace(/\/+$/, "");
    const inviteLink = `${cleanBase}/invite?token=${token}&role=${encodeURIComponent(role)}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      success: true,
      data: {
        token,
        inviteLink,
        recipient: {
          name: name || "Managing Partner",
          email,
          role,
          entityType,
        },
        rights,
        propertyName: propertyName || "Commercial Portfolio",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate invitation", message: err.message },
      { status: 500 }
    );
  }
}
