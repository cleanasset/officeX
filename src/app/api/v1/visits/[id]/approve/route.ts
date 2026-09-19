import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { decision, reason, approverName = "Host Approver" } = body;

    if (!decision || !["approved", "rejected"].includes(decision.toLowerCase())) {
      return NextResponse.json({ error: "Valid decision ('approved' or 'rejected') is required." }, { status: 400 });
    }

    const isApproved = decision.toLowerCase() === "approved";

    return NextResponse.json({
      success: true,
      visitId: id,
      decision: isApproved ? "approved" : "rejected",
      status: isApproved ? "approved" : "denied",
      audit: {
        approver: approverName,
        reason: reason || (isApproved ? "Approved by Host" : "Host unavailable"),
        decidedAt: new Date().toISOString()
      },
      message: isApproved
        ? "Visitor approved. Access pass activated."
        : "Visitor request rejected with audit reason logged."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
