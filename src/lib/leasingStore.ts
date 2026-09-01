export interface PublicEnquiry {
  id: string;
  companyName: string;
  contactName?: string;
  email: string;
  phone: string;
  propertyTitle: string;
  buildingName: string;
  seats: string;
  area?: string;
  moveInDate: string;
  budget?: string;
  type?: string;
  createdAt: string;
}

export interface PublicVisit {
  id: string;
  companyName: string;
  propertyTitle: string;
  date: string;
  time: string;
  phone?: string;
  email?: string;
  status: string;
  createdAt: string;
}

const LEADS_KEY = "officex_leasing_leads";
const VISITS_KEY = "officex_leasing_visits";
const PIPELINE_KEY = "officex_leasing_pipeline";

export function savePublicEnquiry(enquiry: Omit<PublicEnquiry, "id" | "createdAt">): PublicEnquiry {
  if (typeof window === "undefined") return { ...enquiry, id: "lead-temp", createdAt: new Date().toISOString() };

  const id = `lead-${Date.now()}`;
  const newLead: PublicEnquiry = {
    ...enquiry,
    id,
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  };

  try {
    const existingLeads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    const updated = [newLead, ...existingLeads];
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated));

    // Also add to pipeline stage 0 (Enquiry)
    const pipelineDeals = JSON.parse(localStorage.getItem(PIPELINE_KEY) || "[]");
    const newPipelineCard = {
      id: `deal-${Date.now()}`,
      company: enquiry.companyName,
      contact: enquiry.email || enquiry.phone || "Website Enquiry",
      property: enquiry.propertyTitle || enquiry.buildingName || "Commercial Space",
      area: `${enquiry.seats} Seats (${parseInt(enquiry.seats || "50") * 75} sqft)`,
      budget: enquiry.budget || "₹1.5L - ₹3.0L/mo",
      dealHealth: 95,
      stageIndex: 0,
      time: "Just now (Live Public Search)",
      badge: "⚡ Live Web Enquiry",
      badgeColor: "bg-emerald-100 text-emerald-800"
    };
    localStorage.setItem(PIPELINE_KEY, JSON.stringify([newPipelineCard, ...pipelineDeals]));

    window.dispatchEvent(new CustomEvent("officex-lead-added", { detail: newLead }));
  } catch (e) {
    console.error("Error saving lead to storage", e);
  }

  return newLead;
}

export function savePublicVisit(visit: Omit<PublicVisit, "id" | "createdAt" | "status">): PublicVisit {
  if (typeof window === "undefined") return { ...visit, id: "visit-temp", status: "Upcoming", createdAt: new Date().toISOString() };

  const id = `visit-${Date.now()}`;
  const newVisit: PublicVisit = {
    ...visit,
    id,
    status: "Upcoming",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
  };

  try {
    const existingVisits = JSON.parse(localStorage.getItem(VISITS_KEY) || "[]");
    const updated = [newVisit, ...existingVisits];
    localStorage.setItem(VISITS_KEY, JSON.stringify(updated));

    // Also add to pipeline stage 1 (Site Visit)
    const pipelineDeals = JSON.parse(localStorage.getItem(PIPELINE_KEY) || "[]");
    const newPipelineCard = {
      id: `deal-${Date.now()}`,
      company: visit.companyName,
      contact: visit.email || visit.phone || "Scheduled Visitor",
      property: visit.propertyTitle || "Commercial Tower",
      area: "Site Tour Booked",
      budget: "₹1.8L - ₹4.5L/mo",
      dealHealth: 90,
      stageIndex: 1,
      time: `Tour on ${visit.date} (${visit.time})`,
      badge: "🗓️ Guided Visit Booked",
      badgeColor: "bg-blue-100 text-blue-800"
    };
    localStorage.setItem(PIPELINE_KEY, JSON.stringify([newPipelineCard, ...pipelineDeals]));

    window.dispatchEvent(new CustomEvent("officex-visit-added", { detail: newVisit }));
  } catch (e) {
    console.error("Error saving visit to storage", e);
  }

  return newVisit;
}

export function getPublicEnquiries(): PublicEnquiry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getPublicVisits(): PublicVisit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(VISITS_KEY) || "[]");
  } catch {
    return [];
  }
}
