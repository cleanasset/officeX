import { NextResponse } from 'next/server';

export interface RFQItem {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  match: string;
  property: string;
  desc: string;
  scopeOfWork?: string;
  manpowerRequired?: number;
  frequency?: string;
  contractDuration?: string;
  deadline: string;
  timeRemaining: string;
  status: "open" | "evaluating" | "awarded" | "closed";
  quotesCount: number;
  createdAt: string;
  createdAtTimestamp: number;
}

// Global in-memory RFQs store (shared across server runtime)
const globalRfqs: RFQItem[] = [
  {
    id: "RFQ-2024-8842",
    title: "DG Set Annual Maintenance Contract",
    category: "HVAC",
    subCategory: "Diesel Genset Systems",
    match: "98% Match",
    property: "Apex Business Tower, Mumbai BKC",
    desc: "Comprehensive AMC for 3x 1000kVA Cummins DG sets including preventive maintenance, breakdown calls, and genuine filter kit replenishment.",
    scopeOfWork: "Quarterly inspection, load testing, oil analysis, filter replacement, 2-hour breakdown response SLA.",
    manpowerRequired: 2,
    frequency: "Monthly",
    contractDuration: "1 Year",
    deadline: "2026-10-15",
    timeRemaining: "1d : 08h : 45m",
    status: "open",
    quotesCount: 3,
    createdAt: "Sep 18, 2026",
    createdAtTimestamp: Date.now() - 2 * 24 * 3600 * 1000
  },
  {
    id: "RFQ-2024-8843",
    title: "Facade Glass Cleaning Service — Quarterly",
    category: "Cleaning",
    subCategory: "High-Rise Exterior",
    match: "96% Match",
    property: "Global Tech Park, Bengaluru",
    desc: "Quarterly facade cleaning for 3 glass towers. Requires specialized cradle equipment and IRATA certified rope access personnel.",
    scopeOfWork: "Cleaning 42,000 sq.ft of double-glazed curtain wall facade, silicone seal inspection, safety harness certification.",
    manpowerRequired: 6,
    frequency: "Quarterly",
    contractDuration: "1 Year",
    deadline: "2026-10-18",
    timeRemaining: "2d : 14h : 05m",
    status: "open",
    quotesCount: 2,
    createdAt: "Sep 19, 2026",
    createdAtTimestamp: Date.now() - 1 * 24 * 3600 * 1000
  },
  {
    id: "RFQ-2024-8844",
    title: "UPS Battery Replacement & Load Testing",
    category: "Electrical",
    subCategory: "Power Infrastructure",
    match: "92% Match",
    property: "Cyber City, Gurugram",
    desc: "Supply, installation, and testing of 120 SMF batteries for centralized UPS systems across 4 server room floors.",
    scopeOfWork: "Replace 12V 100AH Exide SMF batteries, safe disposal of old cells, impedance testing, 30-minute full load backup test.",
    manpowerRequired: 4,
    frequency: "One-Time Project",
    contractDuration: "3 Months",
    deadline: "2026-10-22",
    timeRemaining: "4d : 09h : 20m",
    status: "open",
    quotesCount: 4,
    createdAt: "Sep 20, 2026",
    createdAtTimestamp: Date.now() - 12 * 3600 * 1000
  },
  {
    id: "RFQ-2024-8845",
    title: "Access Control & Turnstile Upgrade",
    category: "Security",
    subCategory: "Physical Access Systems",
    match: "88% Match",
    property: "Pioneer Plaza, Pune",
    desc: "Migration from legacy RFID to biometric/mobile access control for 15 entry points including optical turnstiles and server rooms.",
    scopeOfWork: "Hardware retrofit, SDK integration with OfficeX Speed-Gate API, 3,500 active employee badge provisioning.",
    manpowerRequired: 3,
    frequency: "Project & AMC",
    contractDuration: "2 Years",
    deadline: "2026-10-28",
    timeRemaining: "7d : 11h : 00m",
    status: "open",
    quotesCount: 1,
    createdAt: "Sep 20, 2026",
    createdAtTimestamp: Date.now() - 6 * 3600 * 1000
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");

  let list = [...globalRfqs];

  if (category && category !== "all" && category !== "All Categories") {
    list = list.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (city && city !== "all" && city !== "All Cities") {
    list = list.filter((r) => r.property.toLowerCase().includes(city.toLowerCase()));
  }

  // Sort newest first
  list.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

  return NextResponse.json({
    success: true,
    count: list.length,
    rfqs: list
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const title = data.title;
    const property = data.property || data.propertyId || "Commercial Campus";
    const category = data.category || "MEP";
    const scopeOfWork = data.scope || data.scopeOfWork || "General Facility Works";

    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title." },
        { status: 400 }
      );
    }

    const rfqId = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRfq: RFQItem = {
      id: rfqId,
      title,
      category,
      subCategory: data.subCategory || "General Maintenance",
      match: "95% Match",
      property: property.includes("Apex")
        ? "Apex Business Tower, Mumbai BKC"
        : property.includes("Meridian")
        ? "Meridian Tech Park, Bengaluru"
        : property.includes("Nexus")
        ? "Nexus Knowledge Hub, Hyderabad"
        : `${property}, Commercial Hub`,
      desc: scopeOfWork.length > 150 ? scopeOfWork.slice(0, 147) + "..." : scopeOfWork,
      scopeOfWork,
      manpowerRequired: data.manpower ? parseInt(data.manpower) : 2,
      frequency: data.frequency || "Monthly",
      contractDuration: data.contractDuration || "1 Year",
      deadline: data.deadline || "2026-10-30",
      timeRemaining: "6d : 23h : 59m",
      status: "open",
      quotesCount: 0,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAtTimestamp: Date.now()
    };

    globalRfqs.unshift(newRfq);

    return NextResponse.json(
      {
        success: true,
        rfq: newRfq,
        message: "RFQ published successfully and dispatched to verified vendor marketplace network."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json(
      { error: "Failed to post RFQ to marketplace database." },
      { status: 500 }
    );
  }
}
