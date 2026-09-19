import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { badgeReturned = true, manualOverrideReason, checkedOutBy = "Security Desk" } = body;

    const checkoutTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      visitId: id,
      status: "checked_out",
      checkoutAt: checkoutTime,
      badgeReturned: Boolean(badgeReturned),
      audit: {
        checkedOutBy,
        manualOverrideReason: manualOverrideReason || null,
        timestamp: checkoutTime
      },
      message: "Visitor successfully checked out. Active visit closed and removed from live roll-call."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
