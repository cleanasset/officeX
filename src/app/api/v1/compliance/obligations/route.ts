import { NextResponse } from "next/server";
import {
  getComplianceScorecardAndObligations,
  createObligation
} from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const propertyId = searchParams.get("propertyId") || "";

    const data = getComplianceScorecardAndObligations({
      propertyId: propertyId || undefined,
      category: category || undefined
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      authority,
      frequency = "ANNUAL",
      criticality = "HIGH",
      dueDate,
      ownerName,
      description,
      propertyId,
      propertyName
    } = body;

    if (!name || !category || !authority || !dueDate) {
      return NextResponse.json(
        { error: "Obligation Name, Category, Authority, and Due Date are mandatory." },
        { status: 400 }
      );
    }

    const obligation = createObligation({
      name,
      category,
      authority,
      frequency,
      criticality,
      dueDate,
      ownerName,
      description,
      propertyId,
      propertyName
    });

    return NextResponse.json({
      success: true,
      message: "Statutory obligation registered successfully. Scheduled in compliance calendar.",
      obligation
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
