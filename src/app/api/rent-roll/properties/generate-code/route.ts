import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { property } from "@/db/rent-roll-schema";
import { sql, eq } from "drizzle-orm";

export function getCleanPrefixFromName(propertyName: string): string {
  const clean = (propertyName || "").trim();
  if (!clean) return "PROP";

  // Split into alphanumeric words
  const words = clean.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  // Strategy 1: If 2 or 3 words (e.g. "Prestige Tech Park" -> "PTP", "Divi Towers" -> "DT")
  if (words.length >= 2) {
    const initials = words.map((w) => w[0].toUpperCase()).join("");
    if (initials.length >= 2 && initials.length <= 4) {
      return initials;
    }
  }

  // Strategy 2: First word's first 3-4 letters (e.g. "Prestige" -> "PRE", "Cyber" -> "CYB")
  const firstWord = words[0] || "";
  const firstLetters = firstWord.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  if (firstLetters.length >= 2) {
    return firstLetters;
  }

  return (clean.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3) || "PROP").toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";

    if (!name.trim()) {
      return NextResponse.json({ success: true, code: "" });
    }

    const prefix = getCleanPrefixFromName(name);

    // Query existing codes matching this prefix across ALL properties and ALL users in the entire database
    const existing = await db
      .select({ code: property.property_code })
      .from(property)
      .where(sql`${property.property_code} ILIKE ${prefix + '-%'}`);

    const existingSet = new Set(existing.map((e) => (e.code || "").toUpperCase()));

    // Generate a unique 4-digit code that does not collide globally with ANY property of ANY user
    let candidate = "";
    let attempts = 0;
    while (attempts < 50) {
      const num = Math.floor(1000 + Math.random() * 9000);
      candidate = `${prefix}-${num}`;
      if (!existingSet.has(candidate)) {
        // Double-check exact global uniqueness
        const [exact] = await db
          .select({ id: property.id })
          .from(property)
          .where(eq(property.property_code, candidate))
          .limit(1);

        if (!exact) break;
      }
      attempts++;
    }

    return NextResponse.json({ success: true, code: candidate, prefix });
  } catch (err: any) {
    console.error("Failed to generate global property code:", err);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}

