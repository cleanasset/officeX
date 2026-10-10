import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { ilike, or, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = q.trim();
    let matches: any[] = [];

    try {
      matches = await db
        .select()
        .from(organizations)
        .where(
          or(
            ilike(organizations.name, `%${cleanQuery}%`),
            cleanQuery.length === 10 ? eq(organizations.pan, cleanQuery.toUpperCase()) : undefined,
            cleanQuery.length === 15 ? eq(organizations.gstin, cleanQuery.toUpperCase()) : undefined
          )
        )
        .limit(10);
    } catch (e) {
      console.warn("Org search DB warning:", e);
    }

    return NextResponse.json({
      query: cleanQuery,
      count: matches.length,
      results: matches
    });
  } catch (err: any) {
    console.error("Organization search error:", err);
    return NextResponse.json({ error: err.message || "Failed to search organizations" }, { status: 500 });
  }
}
