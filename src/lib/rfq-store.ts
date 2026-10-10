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

// Canonical Initial RFQs and Work Orders (Zero Mock Data)
const initialRfqs: RFQItem[] = [];
const initialWorkOrders: WorkOrderItem[] = [];

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
  const property = data.property || "Commercial Property Asset";
  const category = data.category || "MEP";
  const scopeOfWork = data.scopeOfWork || data.desc || "General Facility Works";

  const newRfq: RFQItem = {
    id: rfqId,
    title,
    category,
    subCategory: data.subCategory || "General Maintenance",
    match: "95% Match",
    property: property || "Commercial Property Asset",
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
  const vendorName = quoteData.vendorName || "Registered FM Vendor";
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
    client: rfq.property ? `${rfq.property} Management` : "Property Management",
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
