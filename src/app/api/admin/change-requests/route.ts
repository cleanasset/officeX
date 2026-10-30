import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// Memory & DB change requests store
let memoryChangeRequests: Array<{
  id: string;
  property_id: string;
  property_name: string;
  user_email: string;
  request_type: string;
  description: string;
  floors_to_remove?: string[];
  new_area_sqft?: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}> = [];

export async function GET(req: Request) {
  try {
    return NextResponse.json({
      success: true,
      data: memoryChangeRequests,
      pendingCount: memoryChangeRequests.filter((r) => r.status === "pending").length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch change requests", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRequest = {
      id: `CR-${Date.now()}`,
      property_id: body.property_id,
      property_name: body.property_name || "Commercial Asset",
      user_email: body.user_email || "owner@officex.com",
      request_type: body.request_type || "sell_floors",
      description: body.description || "De-registration / Sale of floors requested by owner",
      floors_to_remove: body.floors_to_remove || [],
      new_area_sqft: body.new_area_sqft,
      status: "pending" as const,
      created_at: new Date().toISOString(),
    };

    memoryChangeRequests.unshift(newRequest);

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: "Change request submitted to Admin for verification and approval.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to submit change request", message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body; // action: "approve" | "reject"

    const targetReq = memoryChangeRequests.find((r) => r.id === id);
    if (!targetReq) {
      return NextResponse.json({ error: "Change request not found" }, { status: 404 });
    }

    if (action === "approve") {
      targetReq.status = "approved";

      // If floors were sold / de-registered, remove them from database
      if (targetReq.floors_to_remove && targetReq.floors_to_remove.length > 0) {
        const floorNames = targetReq.floors_to_remove.map((f) =>
          f === "0" ? "Ground Floor" : `Floor ${f}`
        );

        // Find spaces on those floors
        const spacesToRemove = await db
          .select({ id: space.id })
          .from(space)
          .where(inArray(space.floor_name, floorNames));

        if (spacesToRemove.length > 0) {
          const sIds = spacesToRemove.map((s) => s.id);
          await db
            .update(space)
            .set({ deleted_at: new Date() })
            .where(inArray(space.id, sIds));
        }
      }

      // If total area changed, update property table
      if (targetReq.new_area_sqft) {
        await db
          .update(property)
          .set({ total_leasable_area_sqft: String(targetReq.new_area_sqft) })
          .where(eq(property.id, targetReq.property_id));
      }

      return NextResponse.json({
        success: true,
        message: "Request approved and property records updated successfully.",
        data: targetReq,
      });
    } else {
      targetReq.status = "rejected";
      return NextResponse.json({
        success: true,
        message: "Request rejected.",
        data: targetReq,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process change request", message: err.message }, { status: 500 });
  }
}

