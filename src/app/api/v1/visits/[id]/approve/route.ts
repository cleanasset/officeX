import { NextResponse } from "next/server";
import { approveVisit } from "@/lib/visitor-compliance-store";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { decision = "approved", approver = "Host Manager", remarks } = body;

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json({ error: "Decision must be 'approved' or 'rejected'." }, { status: 400 });
    }

    const updated = approveVisit(id, decision, approver, remarks);
    return NextResponse.json({
      success: true,
      message: decision === "approved" ? "Visit approved. Digital pass activated." : "Visit request rejected.",
      visit: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process visit approval" },
      { status: 400 }
    );
  }
}
