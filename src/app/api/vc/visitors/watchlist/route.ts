import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vcWatchlist } from "@/db/visitor-compliance-schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/vc/visitors/watchlist — Get active watchlist
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "default_org";

    const list = await db
      .select()
      .from(vcWatchlist)
      .where(eq(vcWatchlist.orgId, orgId))
      .orderBy(desc(vcWatchlist.createdAt));

    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (err: any) {
    console.error("Watchlist fetch error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST /api/vc/visitors/watchlist — Add to blacklist/watchlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId = "default_org",
      name,
      mobile,
      email,
      identityReference,
      reason,
      severity = "high",
      createdBy = "Security Manager",
    } = body;

    if (!name || !reason) {
      return NextResponse.json(
        { success: false, message: "Name and Reason are required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(vcWatchlist)
      .values({
        orgId,
        name,
        mobile,
        email,
        identityReference,
        reason,
        severity,
        createdBy,
        approvalStatus: "active",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Entity added to watchlist",
      data: inserted[0],
    });
  } catch (err: any) {
    console.error("Watchlist insert error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/vc/visitors/watchlist — Remove from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    await db.delete(vcWatchlist).where(eq(vcWatchlist.id, id));

    return NextResponse.json({
      success: true,
      message: "Entity removed from watchlist",
    });
  } catch (err: any) {
    console.error("Watchlist delete error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
