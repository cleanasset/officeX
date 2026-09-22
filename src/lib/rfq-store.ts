export interface RFQQuote {
  id: string;
  rfqId: string;
  vendorName: string;
  verified: boolean;
  score: number; // 0-100
  badge: string; // "Recommended Winner" | "Higher SLA" | "Competitive Price"
  tagColor: string;
  bidAmount: string; // e.g. "₹3,80,000"
  monthlyAmount: string; // e.g. "₹1,85,000"
  gstAmount: string; // e.g. "₹33,300"
  grossAmount: string; // e.g. "₹2,18,300"
  timeline: string;
  warranty: string;
  manpower: string;
  materials: string;
  emergencySla: string;
  statutoryCompliance: string;
  tco12Month: string;
  notes: string;
  submittedAt: string;
  status: "submitted" | "shortlisted" | "awarded" | "declined";
  scoreBreakdown: {
    priceScore: string;
    slaScore: string;
    technicalScore: string;
    qualityScore: string;
    complianceScore: string;
    experienceScore: string;
    esgScore: string;
  };
}

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
  quotes: RFQQuote[];
  awardedTo?: string;
  awardedWorkOrderId?: string;
  awardedAt?: string;
}

export interface WorkOrderItem {
  id: string;
  rfqId?: string;
  title?: string;
  client: string;
  vendor: string;
  property: string;
  startDate: string;
  progress: string;
  pct: number;
  status: "Active" | "Mobilising" | "Completed" | "Closed";
  statusClass: string;
  contractValue: string;
  escrowStatus: string;
  milestoneRule: string;
  manpowerCount?: number;
  leadTechnician?: string;
}

// Canonical Initial RFQs Database
const initialRfqs: RFQItem[] = [
  {
    id: "RFQ-2026-8842",
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
    status: "evaluating",
    quotesCount: 3,
    createdAt: "Sep 18, 2026",
    createdAtTimestamp: Date.now() - 2 * 24 * 3600 * 1000,
    quotes: [
      {
        id: "QT-2026-081",
        rfqId: "RFQ-2026-8842",
        vendorName: "TechServe Solutions",
        verified: true,
        score: 91,
        badge: "Recommended Winner",
        tagColor: "bg-emerald-100 text-emerald-800",
        bidAmount: "₹3,80,000",
        monthlyAmount: "₹1,85,000",
        gstAmount: "₹33,300",
        grossAmount: "₹2,18,300",
        timeline: "10 Days Mobilization",
        warranty: "12 Months OEM Warranty",
        manpower: "5 (3 Tech, 2 Helper)",
        materials: "Consumables Included",
        emergencySla: "2 Hours",
        statutoryCompliance: "100% Verified (PF/ESIC)",
        tco12Month: "₹26,19,600",
        notes: "Comprehensive OEM upkeep for Cummins 1000kVA DG sets, Mobil Delvac lubricant, quarterly load runs, and 2-hour emergency response.",
        submittedAt: "2026-09-19",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "24 / 25",
          slaScore: "19 / 20",
          technicalScore: "14 / 15",
          qualityScore: "14 / 15",
          complianceScore: "10 / 10",
          experienceScore: "9 / 10",
          esgScore: "5 / 5"
        }
      },
      {
        id: "QT-2026-082",
        rfqId: "RFQ-2026-8842",
        vendorName: "MEP Experts Pvt. Ltd.",
        verified: true,
        score: 84,
        badge: "Higher SLA",
        tagColor: "bg-blue-100 text-blue-800",
        bidAmount: "₹4,10,000",
        monthlyAmount: "₹2,10,000",
        gstAmount: "₹37,800",
        grossAmount: "₹2,47,800",
        timeline: "14 Days Mobilization",
        warranty: "6 Months Spares",
        manpower: "6 (4 Tech, 2 Helper)",
        materials: "Up to ₹10k/mo limit",
        emergencySla: "4 Hours",
        statutoryCompliance: "100% Verified",
        tco12Month: "₹29,73,600",
        notes: "Preventive monthly maintenance with specialized oil analysis lab kits and quarterly filter renewals.",
        submittedAt: "2026-09-19",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "21 / 25",
          slaScore: "17 / 20",
          technicalScore: "13 / 15",
          qualityScore: "13 / 15",
          complianceScore: "10 / 10",
          experienceScore: "8 / 10",
          esgScore: "4 / 5"
        }
      },
      {
        id: "QT-2026-083",
        rfqId: "RFQ-2026-8842",
        vendorName: "ElectroMech Services",
        verified: true,
        score: 78,
        badge: "Higher Price",
        tagColor: "bg-gray-100 text-gray-800",
        bidAmount: "₹3,95,000",
        monthlyAmount: "₹1,95,000",
        gstAmount: "₹35,100",
        grossAmount: "₹2,30,100",
        timeline: "21 Days Mobilization",
        warranty: "Standard 30 Days",
        manpower: "4 (2 Tech, 2 Helper)",
        materials: "Billable at Actuals",
        emergencySla: "6 Hours",
        statutoryCompliance: "Pending Audit",
        tco12Month: "₹27,61,200",
        notes: "Standard DG upkeep, routine load testing, and emergency technician dispatch on escalation.",
        submittedAt: "2026-09-20",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "22 / 25",
          slaScore: "15 / 20",
          technicalScore: "12 / 15",
          qualityScore: "12 / 15",
          complianceScore: "7 / 10",
          experienceScore: "7 / 10",
          esgScore: "3 / 5"
        }
      }
    ]
  },
  {
    id: "RFQ-2026-8843",
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
    createdAtTimestamp: Date.now() - 1 * 24 * 3600 * 1000,
    quotes: [
      {
        id: "QT-2026-084",
        rfqId: "RFQ-2026-8843",
        vendorName: "Apex High-Rise Cleaners",
        verified: true,
        score: 93,
        badge: "IRATA Certified",
        tagColor: "bg-emerald-100 text-emerald-800",
        bidAmount: "₹2,40,000",
        monthlyAmount: "₹60,000",
        gstAmount: "₹10,800",
        grossAmount: "₹70,800",
        timeline: "7 Days per Quarter",
        warranty: "Streak-Free Guarantee",
        manpower: "6 Certified Rope Technicians",
        materials: "Eco-friendly Pure Water System",
        emergencySla: "24 Hours",
        statutoryCompliance: "100% Verified (Safety/IRATA)",
        tco12Month: "₹8,49,600",
        notes: "Full exterior facade wash with BMU cradle and rope access, zero-chemical wash option.",
        submittedAt: "2026-09-20",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "23 / 25",
          slaScore: "19 / 20",
          technicalScore: "15 / 15",
          qualityScore: "14 / 15",
          complianceScore: "10 / 10",
          experienceScore: "8 / 10",
          esgScore: "4 / 5"
        }
      },
      {
        id: "QT-2026-085",
        rfqId: "RFQ-2026-8843",
        vendorName: "CleanTech Facilities India",
        verified: true,
        score: 87,
        badge: "Competitive Price",
        tagColor: "bg-blue-100 text-blue-800",
        bidAmount: "₹2,10,000",
        monthlyAmount: "₹52,500",
        gstAmount: "₹9,450",
        grossAmount: "₹61,950",
        timeline: "10 Days per Quarter",
        warranty: "Standard Clean Sign-off",
        manpower: "5 Technicians",
        materials: "Standard Detergents Included",
        emergencySla: "48 Hours",
        statutoryCompliance: "100% Verified",
        tco12Month: "₹7,43,400",
        notes: "Comprehensive glass cleaning including ground-floor entrance canopy and atriums.",
        submittedAt: "2026-09-20",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "25 / 25",
          slaScore: "16 / 20",
          technicalScore: "13 / 15",
          qualityScore: "13 / 15",
          complianceScore: "9 / 10",
          experienceScore: "7 / 10",
          esgScore: "4 / 5"
        }
      }
    ]
  },
  {
    id: "RFQ-2026-8844",
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
    quotesCount: 2,
    createdAt: "Sep 20, 2026",
    createdAtTimestamp: Date.now() - 12 * 3600 * 1000,
    quotes: [
      {
        id: "QT-2026-086",
        rfqId: "RFQ-2026-8844",
        vendorName: "Schneider Power Systems India",
        verified: true,
        score: 95,
        badge: "OEM Authorized",
        tagColor: "bg-emerald-100 text-emerald-800",
        bidAmount: "₹6,80,000",
        monthlyAmount: "₹2,26,667",
        gstAmount: "₹40,800",
        grossAmount: "₹2,67,467",
        timeline: "14 Days",
        warranty: "24 Months Replacement",
        manpower: "4 Certified Power Engineers",
        materials: "120 Exide SMF Cells Included",
        emergencySla: "1 Hour",
        statutoryCompliance: "100% Verified (CEA/ISO)",
        tco12Month: "₹6,80,000 (One-Time)",
        notes: "Authorized turnkey supply, impedance testing report, and certified green disposal.",
        submittedAt: "2026-09-20",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "24 / 25",
          slaScore: "20 / 20",
          technicalScore: "15 / 15",
          qualityScore: "15 / 15",
          complianceScore: "10 / 10",
          experienceScore: "9 / 10",
          esgScore: "5 / 5"
        }
      },
      {
        id: "QT-2026-087",
        rfqId: "RFQ-2026-8844",
        vendorName: "ElectroMech Power Tech",
        verified: true,
        score: 88,
        badge: "Competitive Pricing",
        tagColor: "bg-blue-100 text-blue-800",
        bidAmount: "₹6,20,000",
        monthlyAmount: "₹2,06,667",
        gstAmount: "₹37,200",
        grossAmount: "₹2,43,867",
        timeline: "21 Days",
        warranty: "12 Months Replacement",
        manpower: "3 Electricians",
        materials: "Cells & Busbars Included",
        emergencySla: "4 Hours",
        statutoryCompliance: "100% Verified",
        tco12Month: "₹6,20,000 (One-Time)",
        notes: "Comprehensive supply, installation, and impedance load certificate.",
        submittedAt: "2026-09-21",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "25 / 25",
          slaScore: "17 / 20",
          technicalScore: "13 / 15",
          qualityScore: "13 / 15",
          complianceScore: "9 / 10",
          experienceScore: "8 / 10",
          esgScore: "4 / 5"
        }
      }
    ]
  },
  {
    id: "RFQ-2026-8845",
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
    createdAtTimestamp: Date.now() - 6 * 3600 * 1000,
    quotes: [
      {
        id: "QT-2026-088",
        rfqId: "RFQ-2026-8845",
        vendorName: "Gunnebo Security Group",
        verified: true,
        score: 92,
        badge: "OEM Access Integrator",
        tagColor: "bg-emerald-100 text-emerald-800",
        bidAmount: "₹4,50,000",
        monthlyAmount: "₹37,500",
        gstAmount: "₹6,750",
        grossAmount: "₹44,250",
        timeline: "30 Days Mobilization",
        warranty: "24 Months Comprehensive AMC",
        manpower: "3 Certified Security Engineers",
        materials: "15 Optical Flap Barriers Hardware Included",
        emergencySla: "2 Hours",
        statutoryCompliance: "100% PSARA & ISO Certified",
        tco12Month: "₹5,31,000",
        notes: "Direct integration with OfficeX Speed-Gate SDK and biometric reader retrofit.",
        submittedAt: "2026-09-21",
        status: "submitted",
        scoreBreakdown: {
          priceScore: "22 / 25",
          slaScore: "19 / 20",
          technicalScore: "15 / 15",
          qualityScore: "15 / 15",
          complianceScore: "10 / 10",
          experienceScore: "9 / 10",
          esgScore: "4 / 5"
        }
      }
    ]
  }
];

// Canonical Initial Work Orders Registry
const initialWorkOrders: WorkOrderItem[] = [
  {
    id: "#WO-2026-089",
    rfqId: "RFQ-2026-7712",
    title: "Comprehensive MEP Operations & Preventive Maintenance",
    client: "Apex Tech Pvt Ltd",
    vendor: "TechServe Solutions",
    property: "CyberCity Tower B, Floor 4",
    startDate: "01 Nov 2025",
    progress: "Month 4 of 12",
    pct: 33,
    status: "Active",
    statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    contractValue: "₹2,18,300 / mo",
    escrowStatus: "Escrow Milestone Funded (Razorpay)",
    milestoneRule: "80% Monthly Base + 20% Outcome Milestone",
    manpowerCount: 4,
    leadTechnician: "Rahul S. (Lead)"
  },
  {
    id: "#WO-2025-412",
    rfqId: "RFQ-2025-3419",
    title: "Central Chiller Plant Overhaul & Descaling",
    client: "Nexus Malls",
    vendor: "Carrier Comfort MEP",
    property: "Nexus Seawoods, Navi Mumbai",
    startDate: "15 Mar 2025",
    progress: "Month 11 of 12",
    pct: 91,
    status: "Active",
    statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    contractValue: "₹3,40,000 / mo",
    escrowStatus: "Escrow Milestone Funded (Razorpay)",
    milestoneRule: "90% Monthly Base + 10% SLA Retention",
    manpowerCount: 6,
    leadTechnician: "Suresh P."
  },
  {
    id: "#WO-2026-002",
    rfqId: "RFQ-2026-6621",
    title: "Facade Glazing & Glass Sealant Restoration",
    client: "Global Tech Park",
    vendor: "Apex High-Rise Cleaners",
    property: "Block C, Hinjewadi Phase 1",
    startDate: "05 Jan 2026",
    progress: "Month 2 of 24",
    pct: 8,
    status: "Mobilising",
    statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
    contractValue: "₹1,85,000 / mo",
    escrowStatus: "Mobilization Escrow Advance Released",
    milestoneRule: "80% Monthly + 20% Outcome Milestone",
    manpowerCount: 5,
    leadTechnician: "Vikas R."
  },
  {
    id: "#WO-2022-881",
    rfqId: "RFQ-2022-1092",
    title: "11kV HT Substation Transformer Testing",
    client: "Infosys Ltd",
    vendor: "ElectroMech Services",
    property: "Campus 4, Electronic City",
    startDate: "10 Dec 2022",
    progress: "Completed 100%",
    pct: 100,
    status: "Closed",
    statusClass: "bg-gray-100 text-gray-600 border border-gray-200",
    contractValue: "₹5,20,000",
    escrowStatus: "Fully Settled",
    milestoneRule: "100% on Service Sign-off",
    manpowerCount: 4,
    leadTechnician: "Amit K."
  }
];

// Attach to globalThis for shared memory persistence across Next.js Turbopack route modules
const globalForOfficeX = globalThis as unknown as {
  globalRfqs?: RFQItem[];
  globalWorkOrders?: WorkOrderItem[];
};

if (!globalForOfficeX.globalRfqs) {
  globalForOfficeX.globalRfqs = [...initialRfqs];
}
if (!globalForOfficeX.globalWorkOrders) {
  globalForOfficeX.globalWorkOrders = [...initialWorkOrders];
}

const globalRfqs = globalForOfficeX.globalRfqs;
const globalWorkOrders = globalForOfficeX.globalWorkOrders;

export function getAllRfqs(filters?: { category?: string; city?: string; id?: string }): RFQItem[] {
  let list = [...globalRfqs];

  if (filters?.id) {
    const found = list.find((r) => r.id === filters.id);
    return found ? [found] : [];
  }
  if (filters?.category && filters.category !== "all" && filters.category !== "All Categories") {
    list = list.filter((r) => r.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }
  if (filters?.city && filters.city !== "all" && filters.city !== "All Cities") {
    list = list.filter((r) => r.property.toLowerCase().includes(filters.city!.toLowerCase()));
  }

  // Sort newest first
  list.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
  return list;
}

export function getRfqById(id: string): RFQItem | undefined {
  return globalRfqs.find((r) => r.id === id);
}

export function createRfq(data: Partial<RFQItem>): RFQItem {
  const rfqId = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const title = data.title || "Facility Management Tender";
  const property = data.property || "Apex Business Tower, Mumbai BKC";
  const category = data.category || "MEP";
  const scopeOfWork = data.scopeOfWork || data.desc || "General Facility Works";

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
      : property.includes("Cyber")
      ? "Cyber City, Gurugram"
      : `${property}, Commercial Hub`,
    desc: scopeOfWork.length > 150 ? scopeOfWork.slice(0, 147) + "..." : scopeOfWork,
    scopeOfWork,
    manpowerRequired: data.manpowerRequired || 3,
    frequency: data.frequency || "Monthly",
    contractDuration: data.contractDuration || "1 Year",
    deadline: data.deadline || "2026-10-30",
    timeRemaining: "6d : 23h : 59m",
    status: "open",
    quotesCount: 0,
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    createdAtTimestamp: Date.now(),
    quotes: []
  };

  globalRfqs.unshift(newRfq);
  return newRfq;
}

export function submitQuoteToRfq(
  rfqId: string,
  quoteData: {
    vendorName?: string;
    bidAmount?: string;
    timeline?: string;
    warranty?: string;
    notes?: string;
  }
): { quote: RFQQuote; rfq: RFQItem } | null {
  const rfq = globalRfqs.find((r) => r.id === rfqId);
  if (!rfq) return null;

  const quoteId = `QT-2026-${Math.floor(100 + Math.random() * 900)}`;
  const vendorName = quoteData.vendorName || "Apex FM Solutions";
  const rawBid = quoteData.bidAmount || "₹3,50,000";
  const numBid = parseInt(rawBid.replace(/[^0-9]/g, "")) || 350000;
  const monthlyNum = Math.round(numBid / 2);
  const gstNum = Math.round(monthlyNum * 0.18);
  const grossNum = monthlyNum + gstNum;

  const newQuote: RFQQuote = {
    id: quoteId,
    rfqId,
    vendorName,
    verified: true,
    score: Math.floor(85 + Math.random() * 11), // 85 - 95
    badge: "Verified Bidder",
    tagColor: "bg-teal-50 text-teal-800",
    bidAmount: rawBid,
    monthlyAmount: `₹${monthlyNum.toLocaleString("en-IN")}`,
    gstAmount: `₹${gstNum.toLocaleString("en-IN")}`,
    grossAmount: `₹${grossNum.toLocaleString("en-IN")}`,
    timeline: quoteData.timeline || "15 Days Mobilization",
    warranty: quoteData.warranty || "12 Months Comprehensive",
    manpower: "4 (2 Tech, 2 Helper)",
    materials: "Consumables Included",
    emergencySla: "2 Hours",
    statutoryCompliance: "100% Verified (PF/ESIC)",
    tco12Month: `₹${(grossNum * 12).toLocaleString("en-IN")}`,
    notes: quoteData.notes || "Official quotation submitted through OfficeX Vendor Hub.",
    submittedAt: new Date().toISOString().split("T")[0],
    status: "submitted",
    scoreBreakdown: {
      priceScore: "23 / 25",
      slaScore: "18 / 20",
      technicalScore: "14 / 15",
      qualityScore: "14 / 15",
      complianceScore: "10 / 10",
      experienceScore: "8 / 10",
      esgScore: "4 / 5"
    }
  };

  rfq.quotes.unshift(newQuote);
  rfq.quotesCount = rfq.quotes.length;
  rfq.status = "evaluating";

  return { quote: newQuote, rfq };
}

export function awardRfq(
  rfqId: string,
  vendorName: string,
  auditNotes?: string,
  milestoneSplit?: string,
  escrowHold: boolean = true
): { rfq: RFQItem; workOrder: WorkOrderItem } | null {
  const rfq = globalRfqs.find((r) => r.id === rfqId);
  if (!rfq) return null;

  rfq.status = "awarded";
  rfq.awardedTo = vendorName;
  rfq.awardedAt = new Date().toISOString().split("T")[0];

  const matchedQuote = rfq.quotes.find((q) => q.vendorName.toLowerCase() === vendorName.toLowerCase()) || rfq.quotes[0];
  if (matchedQuote) {
    matchedQuote.status = "awarded";
  }

  const woId = `#WO-2026-${Math.floor(100 + Math.random() * 900)}`;
  rfq.awardedWorkOrderId = woId;

  const newWorkOrder: WorkOrderItem = {
    id: woId,
    rfqId: rfq.id,
    title: rfq.title,
    client: "Apex Commercial Estates Ltd",
    vendor: vendorName,
    property: rfq.property,
    startDate: "01 Nov 2026",
    progress: "Month 1 of 12",
    pct: 8,
    status: "Active",
    statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    contractValue: matchedQuote ? `${matchedQuote.grossAmount} / mo` : "₹2,18,300 / mo",
    escrowStatus: escrowHold ? "Escrow Funded (Razorpay Live Mode)" : "Direct Billing",
    milestoneRule: milestoneSplit || "80% Monthly Base + 20% Outcome Milestone",
    manpowerCount: rfq.manpowerRequired || 4,
    leadTechnician: `${vendorName.split(" ")[0]} Lead Engineer`
  };

  globalWorkOrders.unshift(newWorkOrder);
  return { rfq, workOrder: newWorkOrder };
}

export function getAllWorkOrders(): WorkOrderItem[] {
  return [...globalWorkOrders];
}

export function getWorkOrderById(id: string): WorkOrderItem | undefined {
  return globalWorkOrders.find((w) => w.id === id);
}

export function createWorkOrder(wo: Partial<WorkOrderItem>): WorkOrderItem {
  const newWo: WorkOrderItem = {
    id: wo.id || `#WO-2026-${Math.floor(100 + Math.random() * 900)}`,
    rfqId: wo.rfqId,
    title: wo.title || "Facility Maintenance Contract",
    client: wo.client || "OfficeX Commercial Tenant",
    vendor: wo.vendor || "TechServe Solutions",
    property: wo.property || "Commercial Hub",
    startDate: wo.startDate || "01 Nov 2026",
    progress: wo.progress || "Month 1 of 12",
    pct: wo.pct || 8,
    status: wo.status || "Active",
    statusClass: wo.statusClass || "bg-emerald-50 text-emerald-700 border border-emerald-200",
    contractValue: wo.contractValue || "₹2,18,300 / mo",
    escrowStatus: wo.escrowStatus || "Escrow Funded (Razorpay)",
    milestoneRule: wo.milestoneRule || "80% Monthly Base + 20% Outcome Milestone",
    manpowerCount: wo.manpowerCount || 4,
    leadTechnician: wo.leadTechnician || "Lead Site Engineer"
  };

  globalWorkOrders.unshift(newWo);
  return newWo;
}
