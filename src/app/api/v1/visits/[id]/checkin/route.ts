import { NextResponse } from "next/server";
import { checkinVisit } from "@/lib/visitor-compliance-store";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Visit ID or Pass Token is required" }, { status: 400 });
    }

    const result = checkinVisit(id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to check in visitor" },
      { status: 400 }
    );
  }
}
