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

// Global in-memory tickets store (shared across server runtime)
const globalTickets: Ticket[] = [
  {
    id: "TK-4501",
    title: "AC not cooling — Zone B, Floor 4",
    category: "HVAC",
    priority: "Critical",
    status: "in-progress",
    assignee: "Rajesh Kumar (HVAC Lead)",
    location: "One BKC (Apex Tower) · F4 · Zone B",
    asset: "AHU-03 (Chilled Water Coil)",
    slaDeadline: "14:30",
    slaRemaining: "1h 12m",
    slaState: "At Risk",
    created: "2h ago",
    requester: "Priya Nair (Tata Digital)",
    description: "Tenant reports temperature in meeting room is 27°C despite thermostat set to 21°C. Condenser line inspection required.",
    unit: "Unit 4B",
    createdAtTimestamp: Date.now() - 2 * 3600 * 1000
  },
  {
    id: "TK-4499",
    title: "Lift #2 intermittent destination dispatch error",
    category: "Mechanical",
    priority: "High",
    status: "assigned",
    assignee: "Metro Elevators OEM (Schindler)",
    location: "One BKC · Main Lobby Passenger Bank",
    asset: "LIFT-02 (Schindler 7000)",
    slaDeadline: "16:00",
    slaRemaining: "2h 45m",
    slaState: "Normal",
    created: "3h ago",
    requester: "Security Control Room",
    description: "Lift car stopped between Floor 7 and 8 for 45 seconds before resuming. Safety interlock sensor error code E-42.",
    unit: "Lobby",
    createdAtTimestamp: Date.now() - 3 * 3600 * 1000
  },
  {
    id: "TK-4497",
    title: "Water leakage from ceiling — Conf Room Orchid",
    category: "Plumbing",
    priority: "High",
    status: "open",
    assignee: "Unassigned",
    location: "One BKC · F5 · Executive Suite",
    asset: "PLMB-FCU-Drain-05",
    slaDeadline: "13:00",
    slaRemaining: "Breached",
    slaState: "Breached",
    created: "5h ago",
    requester: "Amit Shah (Google Enterprise)",
    description: "Drain tray overflow dripping above conference table. Water supply isolated.",
    unit: "Unit 5A",
    createdAtTimestamp: Date.now() - 5 * 3600 * 1000
  },
  {
    id: "TK-4493",
    title: "Flickering tube light near Desk C-04",
    category: "Electrical",
    priority: "Medium",
    status: "in-progress",
    assignee: "Sanjay Patel (Electrician)",
    location: "One BKC · F3 · Zone C",
    asset: "LT-F3-C04",
    slaDeadline: "17:00",
    slaRemaining: "4h 10m",
    slaState: "Normal",
    created: "6h ago",
    requester: "Divya Rao (Deloitte)",
    description: "Driver ballast failure on 40W LED panel.",
    unit: "Unit 3C",
    createdAtTimestamp: Date.now() - 6 * 3600 * 1000
  },
  {
    id: "TK-4491",
    title: "Pantry hot water dispenser not heating",
    category: "Appliance",
    priority: "Low",
    status: "resolved",
    assignee: "Kailash Verma (MEP Tech)",
    location: "One BKC · F5 · Central Pantry",
    asset: "APP-PNT-02",
    slaDeadline: "11:00",
    slaRemaining: "Met",
    slaState: "Normal",
    created: "Yesterday",
    requester: "Neha Gupta (Freshworks)",
    description: "Heating element scaled over, descaled and restored to 92°C dispense.",
    unit: "Unit 5A",
    createdAtTimestamp: Date.now() - 24 * 3600 * 1000
  }
];

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
