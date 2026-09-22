import { NextResponse } from 'next/server';
import { getAllWorkOrders, getWorkOrderById, createWorkOrder, WorkOrderItem } from "@/lib/rfq-store";

export type { WorkOrderItem };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const wo = getWorkOrderById(id);
    if (!wo) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, workOrder: wo });
  }

  const workOrders = getAllWorkOrders();
  return NextResponse.json({
    success: true,
    count: workOrders.length,
    workOrders
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newWo = createWorkOrder(data);

    return NextResponse.json(
      {
        success: true,
        workOrder: newWo,
        message: `Work Order ${newWo.id} created successfully.`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: "Failed to create work order." },
      { status: 500 }
    );
  }
}
