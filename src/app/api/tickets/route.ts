import { NextResponse } from "next/server";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";

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
  orgId?: string;
  userId?: string;
  userEmail?: string;
}

// Global in-memory tickets store (shared across server runtime, zero mock data)
const globalTickets: Ticket[] = [];

export async function GET(request: Request) {
  const auth = getAuthContext(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const unit = searchParams.get("unit");

  let result = globalTickets.filter((t) => !t.orgId || !auth.orgId || t.orgId === auth.orgId);

  // Strict role isolation: tenants only see tickets created by themselves or matching their email
  if (auth.role === "occupant" || auth.role === "tenant") {
    result = result.filter(
      (t) =>
        Boolean(auth.userEmail && t.userEmail?.toLowerCase() === auth.userEmail.toLowerCase()) ||
        t.userId === auth.userId ||
        Boolean(auth.userEmail && t.requester.toLowerCase().includes(auth.userEmail.toLowerCase()))
    );
  }

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
    const auth = getAuthContext(request);
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
      requester: requester || auth.userEmail || "Tenant User",
      description: description || "Reported via Tenant Self-Service Portal.",
      unit: unit || "Unit 5A",
      createdAtTimestamp: Date.now(),
      orgId: auth.orgId,
      userId: auth.userId,
      userEmail: auth.userEmail || undefined,
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
    const auth = getAuthContext(request);
    const body = await request.json();
    const { id, status, assignee } = body;

    const ticket = globalTickets.find((t) => t.id === id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.orgId && auth.orgId && ticket.orgId !== auth.orgId) {
      return NextResponse.json({ error: "Access denied to this ticket" }, { status: 403 });
    }

    // Role check: tenants can only mark resolved or add comments, cannot reassign to arbitrary staff
    if (auth.role === "occupant" || auth.role === "tenant") {
      const isOwner = Boolean(auth.userEmail && ticket.userEmail?.toLowerCase() === auth.userEmail.toLowerCase()) || ticket.userId === auth.userId;
      if (!isOwner) {
        return NextResponse.json({ error: "Access denied to modify this ticket" }, { status: 403 });
      }
      if (assignee && assignee !== ticket.assignee) {
        return NextResponse.json({ error: "Tenants cannot reassign tickets" }, { status: 403 });
      }
    }

    if (status) ticket.status = status;
    if (assignee && auth.role !== "occupant" && auth.role !== "tenant") ticket.assignee = assignee;

    return NextResponse.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
