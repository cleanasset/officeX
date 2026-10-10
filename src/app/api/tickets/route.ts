import { NextResponse } from "next/server";

export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus = "open" | "assigned" | "in-progress" | "resolved" | "closed";

export interface Ticket {
  id: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  location: string;
  asset?: string;
  slaDeadline: string;
  slaRemaining: string;
  slaState: "Normal" | "At Risk" | "Breached";
  created: string;
  requester: string;
  description?: string;
  unit?: string;
  createdAtTimestamp: number;
}

// Global in-memory tickets store (shared across server runtime, zero mock data)
const globalTickets: Ticket[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const unit = searchParams.get("unit");

  let result = [...globalTickets];

  if (status && status !== "all") {
    result = result.filter((t) => t.status === status);
  }
  if (priority && priority !== "all") {
    result = result.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
  }
  if (unit) {
    result = result.filter((t) => t.unit?.toLowerCase() === unit.toLowerCase());
  }

  // Sort newest first
  result.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

  return NextResponse.json({
    success: true,
    count: result.length,
    tickets: result
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, priority, unit, area, description, requester } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title and category." },
        { status: 400 }
      );
    }

    const priorityVal: TicketPriority =
      priority === "Critical" || priority === "High" || priority === "Low"
        ? priority
        : "Medium";

    // SLA Remaining computation
    let slaHours = 4;
    if (priorityVal === "Critical") slaHours = 1;
    else if (priorityVal === "High") slaHours = 2;
    else if (priorityVal === "Low") slaHours = 24;

    const deadlineDate = new Date(Date.now() + slaHours * 3600 * 1000);
    const deadlineTimeStr = deadlineDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    const newTicket: Ticket = {
      id: `TK-${Math.floor(4500 + Math.random() * 500)}`,
      title,
      category: category.includes("HVAC")
        ? "HVAC"
        : category.includes("Electrical")
        ? "Electrical"
        : category.includes("Plumbing")
        ? "Plumbing"
        : category.includes("Security")
        ? "Security"
        : "Facility",
      priority: priorityVal,
      status: "open",
      assignee: "Unassigned",
      location: `One BKC · ${unit || "Floor 5"} · ${area || "General Area"}`,
      asset: category.includes("HVAC") ? "HVAC-ZONE-01" : "FAC-ELEC-01",
      slaDeadline: deadlineTimeStr,
      slaRemaining: `${slaHours}h 00m remaining`,
      slaState: priorityVal === "Critical" ? "At Risk" : "Normal",
      created: "Just now",
      requester: requester || "Enterprise Tenant Admin (Unit 5A)",
      description: description || "Reported via Tenant Self-Service Portal.",
      unit: unit || "Unit 5A",
      createdAtTimestamp: Date.now()
    };

    globalTickets.unshift(newTicket);

    return NextResponse.json(
      {
        success: true,
        message: "Ticket created and synced to FM Ops Command Centre queue.",
        ticket: newTicket
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to process ticket creation." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignee } = body;

    const ticket = globalTickets.find((t) => t.id === id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (status) ticket.status = status;
    if (assignee) ticket.assignee = assignee;

    return NextResponse.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
