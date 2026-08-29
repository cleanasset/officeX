"use client";
import React, { useState, useEffect } from "react";
import { 
  Building, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  X, 
  CheckCircle, 
  Phone, 
  Mail, 
  Send, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText,
  Bell,
  Sparkles,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function LeasingDashboard() {
  const [activeListingsDrawer, setActiveListingsDrawer] = useState(false);
  const [openLeadsDrawer, setOpenLeadsDrawer] = useState(false);
  const [visitsDrawer, setVisitsDrawer] = useState(false);
  const [commissionDrawer, setCommissionDrawer] = useState(false);
  const [contactLeadModal, setContactLeadModal] = useState<any>(null);
  const [sendAlertModal, setSendAlertModal] = useState<any>(null);
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic States for Critical Actions
  const [leadStale, setLeadStale] = useState({
    id: "Lead #L-089",
    name: "HCL Tech",
    contactPerson: "Vikram Malhotra (Procurement VP)",
    phone: "+91 98765 43210",
    email: "vikram.m@hcl.com",
    status: "Stale (No follow-up activity in 7 days)",
    updated: false
  });

  const [loiPending, setLoiPending] = useState({
    id: "LOI-012",
    name: "Tata Motors Commercial Wing",
    contactPerson: "Rajiv Sen (Real Estate Lead)",
    phone: "+91 98112 23344",
    email: "rajiv.sen@tatamotors.com",
    status: "LOI sent to client for 5 days",
    sent: false
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [brokerPartnershipInvite, setBrokerPartnershipInvite] = useState({
    id: "BP-503",
    landlord: "Rajesh Kumar (Property Manager)",
    property: "Apex Business Tower - Floor 4",
    commission: "1 Month Rent (8.33% Comm)",
    status: "Pending Acceptance",
    accepted: false
  });

  const activeListings = [
    { id: 1, name: "Apex Business Tower - Floor 4", type: "Office Space", area: "8,500 sq.ft", rate: "₹180/sq.ft", status: "Vacant", address: "BKC, Mumbai" },
    { id: 2, name: "Meridian Tech Park - Block B", type: "IT/ITeS Space", area: "15,000 sq.ft", rate: "₹120/sq.ft", status: "Occupied", address: "Whitefield, Bengaluru" },
    { id: 3, name: "Nexus Hub - Desk Space", type: "Coworking", area: "200 Desks", rate: "₹12,000/desk", status: "Vacant", address: "Hinjewadi, Pune" }
  ];

  const [listingsList, setListingsList] = useState(activeListings);

  const defaultLeads = [
    { id: "L-089", company: "HCL Tech", contact: "Vikram Malhotra", area: "12,000 sq.ft", budget: "₹150-180/sq.ft", status: "Stale", date: "Aug 19, 2026" },
    { id: "L-091", company: "Jio Logistics", contact: "Aniket Shah", area: "25,000 sq.ft", budget: "₹110-130/sq.ft", status: "Viewing Properties", date: "Aug 22, 2026" },
    { id: "L-092", company: "Infosys Ltd", contact: "Meera Nair", area: "45,000 sq.ft", budget: "₹120-140/sq.ft", status: "Negotiating LOI", date: "Aug 23, 2026" },
    { id: "L-093", company: "Nykaa Retail Office", contact: "Deepika Sen", area: "8,000 sq.ft", budget: "₹170-190/sq.ft", status: "Hot Lead", date: "Aug 24, 2026" },
    { id: "L-094", company: "CRED HQ Space", contact: "Kunal Shah", area: "18,000 sq.ft", budget: "₹160-180/sq.ft", status: "Site Visit Scheduled", date: "Aug 25, 2026" }
  ];

  const [leadsList, setLeadsList] = useState(defaultLeads);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leasing/leads");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLeadsList([...data, ...defaultLeads]);
        }
      } catch (err) {
        console.error("Failed to fetch leads", err);
      }
    }
    fetchLeads();
  }, []);


  const visits = [
    { id: "V-201", visitor: "Jio Logistics (Aniket Shah)", time: "11:30 AM", site: "Meridian Tech Park Block B", host: "Ravi Menon" },
    { id: "V-202", visitor: "CRED HQ (Kunal Shah Team)", time: "02:00 PM", site: "Apex Business Tower Floor 4", host: "Ravi Menon" },
    { id: "V-203", visitor: "Nykaa Retail (Deepika Sen)", time: "03:30 PM", site: "Apex Business Tower Floor 4", host: "Ravi Menon" },
    { id: "V-204", visitor: "Razorpay Office Expansion Team", time: "05:00 PM", site: "Nexus Hub Hinjewadi", host: "Amit Kumar" }
  ];

  const commissions = [
    { deal: "HCL Tech - Apex Floor 4", type: "Brokerage Share", estRent: "₹15.3L / month", estComm: "₹3,06,000", expectedClose: "Sep 2026" },
    { deal: "Infosys - Meridian Block B", type: "Direct Landlord Com", estRent: "₹18.0L / month", estComm: "₹3,60,000", expectedClose: "Oct 2026" },
    { deal: "Nykaa - Apex Floor 4", type: "Channel Partner Share", estRent: "₹8.8L / month", estComm: "₹1,76,000", expectedClose: "Sep 2026" }
  ];

  // Funnel Stage Details
  const funnelStages: Record<string, { title: string; count: number; items: string[] }> = {
    enquiries: {
      title: "Enquiries (156 Active)",
      count: 156,
      items: ["Tata Communications (50,000 sq.ft)", "Lenskart Office (12,000 sq.ft)", "Zomato Kitchens (8,000 sq.ft)", "PhysicsWallah (20,000 sq.ft)", "PharmEasy Hub (15,000 sq.ft)"]
    },
    qualified: {
      title: "Qualified Leads (89)",
      count: 89,
      items: ["Nykaa Retail (8,000 sq.ft)", "CRED HQ (18,000 sq.ft)", "Groww Tech (14,000 sq.ft)", "Meesho Operations (22,000 sq.ft)"]
    },
    visits: {
      title: "Site Visits Scheduled (52)",
      count: 52,
      items: ["Jio Logistics @ Meridian Tech Park", "CRED HQ @ Apex Business Tower", "Razorpay @ Nexus Hub"]
    },
    loi: {
      title: "LOI Negotiation (15)",
      count: 15,
      items: ["Infosys Ltd (LOI Sent - Pending Signature)", "Tata Motors (LOI-012 under legal review)", "HDFC Securities (Finalizing commercial terms)"]
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStale({ ...leadStale, status: "Contacted Today (Follow-up logged)", updated: true });
    setContactLeadModal(null);
    showToast(`Stale Lead follow-up log saved. HCL Tech status updated to Contacted!`);
  };

  const handleSendAlert = () => {
    setLoiPending({ ...loiPending, status: "Alert Sent (WhatsApp/Email dispatched)", sent: true });
    setSendAlertModal(null);
    showToast(`WhatsApp & Email reminder alerts sent to Rajiv Sen (Tata Motors) for signing LOI-012!`);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leasing Portal</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">CRM, pipeline boards, and site visits schedule.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leasing/pipeline" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-colors flex items-center gap-1.5">
            <TrendingUp size={14} /> Pipeline Board
          </Link>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO (Fully Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: Active Listings */}
        <div 
          onClick={() => setActiveListingsDrawer(true)}
          className="premium-card p-6 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active Listings</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-blue-700">{activeListings.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">🟢 Inventory Ready →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Building size={22} />
          </div>
        </div>

        {/* KPI 2: Open Leads */}
        <div 
          onClick={() => setOpenLeadsDrawer(true)}
          className="premium-card p-6 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Open Leads</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-indigo-700">23</div>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">5 qualified this week →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* KPI 3: Visits Today */}
        <div 
          onClick={() => setVisitsDrawer(true)}
          className="premium-card p-6 border border-gray-200 hover:border-amber-300 hover:bg-amber-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Visits Today</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-amber-700">5</div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">Next: 2:00 PM at Apex →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Calendar size={22} />
          </div>
        </div>

        {/* KPI 4: Commission Pipe */}
        <div 
          onClick={() => setCommissionDrawer(true)}
          className="premium-card p-6 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Commission Pipe</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-emerald-700">₹8.4L</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 12% vs last month →</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <DollarSign size={22} />
          </div>
        </div>

      </div>

      {/* BLOCK 2: SPLIT LEADS FUNNEL & CRITICAL ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Interactive Funnel */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            Leasing Pipeline Funnel (Click category to view details)
          </h3>
          <div className="flex flex-col gap-4">
            
            {/* Enquiries */}
            <div 
              onClick={() => setSelectedFunnelStage("enquiries")}
              className="group cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between text-xs text-gray-600 font-bold mb-1">
                <span className="group-hover:text-blue-600">Enquiries (156)</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full group-hover:bg-blue-700 transition-colors" style={{ width: "100%" }}></div>
              </div>
            </div>

            {/* Qualified Leads */}
            <div 
              onClick={() => setSelectedFunnelStage("qualified")}
              className="group cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between text-xs text-gray-600 font-bold mb-1">
                <span className="group-hover:text-blue-600">Qualified Leads (89)</span>
                <span>57%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full group-hover:bg-blue-700 transition-colors" style={{ width: "57%" }}></div>
              </div>
            </div>

            {/* Site Visits */}
            <div 
              onClick={() => setSelectedFunnelStage("visits")}
              className="group cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between text-xs text-gray-600 font-bold mb-1">
                <span className="group-hover:text-blue-600">Site Visits (52)</span>
                <span>33%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full group-hover:bg-blue-700 transition-colors" style={{ width: "33%" }}></div>
              </div>
            </div>

            {/* LOI Negotiation */}
            <div 
              onClick={() => setSelectedFunnelStage("loi")}
              className="group cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between text-xs text-gray-600 font-bold mb-1">
                <span className="group-hover:text-blue-600">LOI Negotiation (15)</span>
                <span>9.6%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full group-hover:bg-blue-700 transition-colors" style={{ width: "9.6%" }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* Critical Actions */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Critical Actions Required
          </h3>
          <div className="flex flex-col gap-4">
            
            {/* Stale Lead Alert */}
            <div className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
              <div className="flex-1 pr-3">
                <div className="font-extrabold text-gray-900">{leadStale.id} ({leadStale.name}) Stale</div>
                <div className="text-gray-500 font-semibold mt-0.5">{leadStale.status}</div>
              </div>
              <button 
                onClick={() => setContactLeadModal(leadStale)}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm transition-colors cursor-pointer shrink-0 ${
                  leadStale.updated 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                disabled={leadStale.updated}
              >
                {leadStale.updated ? "Followed Up" : "Contact Now"}
              </button>
            </div>

            {/* LOI Pending Alert */}
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
              <div className="flex-1 pr-3">
                <div className="font-extrabold text-gray-900">LOI Pending Signature</div>
                <div className="text-gray-500 font-semibold mt-0.5">{loiPending.status}</div>
              </div>
              <button 
                onClick={() => setSendAlertModal(loiPending)}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm transition-colors cursor-pointer shrink-0 ${
                  loiPending.sent 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
                disabled={loiPending.sent}
              >
                {loiPending.sent ? "Sent Alert" : "Send Alert"}
              </button>
            </div>

            {/* Broker Partnership Assignment Invitation */}
            <div className="p-4 rounded-xl border-l-4 border-purple-500 bg-purple-50/50 flex justify-between items-center text-xs">
              <div className="flex-1 pr-3">
                <div className="font-extrabold text-gray-900">Brokerage Assignment Request</div>
                <div className="text-gray-500 font-semibold mt-0.5">
                  {brokerPartnershipInvite.landlord} proposed commission for {brokerPartnershipInvite.property} ({brokerPartnershipInvite.commission})
                </div>
              </div>
              <button 
                onClick={() => {
                  if (brokerPartnershipInvite.accepted) return;
                  setBrokerPartnershipInvite({
                    ...brokerPartnershipInvite,
                    status: "Active Agreement",
                    accepted: true
                  });
                  const newProp = {
                    id: listingsList.length + 1,
                    name: "Apex Business Tower - Floor 4 (Partner Exclusive)",
                    type: "Office Space",
                    area: "12,000 sq.ft",
                    rate: "₹180/sq.ft",
                    status: "Vacant",
                    address: "BKC, Mumbai"
                  };
                  setListingsList([newProp, ...listingsList]);
                  showToast("Exclusive brokerage agreement accepted! Property added to your active inventory.");
                }}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm transition-colors cursor-pointer shrink-0 ${
                  brokerPartnershipInvite.accepted 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
                disabled={brokerPartnershipInvite.accepted}
              >
                {brokerPartnershipInvite.accepted ? "Partnership Active" : "Accept Contract"}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ===== DRAWER 1: ACTIVE LISTINGS ===== */}
      {activeListingsDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Active Property Inventory</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Marketplace Listings</span>
                </div>
                <button 
                  onClick={() => setActiveListingsDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {listingsList.map(l => (
                  <div key={l.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">{l.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">{l.status}</span>
                    </div>
                    <span className="text-gray-500 font-semibold">{l.address}</span>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase mt-2 pt-2 border-t border-gray-100">
                      <span>Area: <strong className="text-gray-700">{l.area}</strong></span>
                      <span>Rate: <strong className="text-blue-600">{l.rate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <Link 
                href="/leasing/listings"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Manage Listings Configurations <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== DRAWER 2: OPEN LEADS ===== */}
      {openLeadsDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Open Leads Pipeline</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Leasing CRM Database</span>
                </div>
                <button 
                  onClick={() => setOpenLeadsDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {leadsList.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => {
                      setContactLeadModal({
                        id: `Lead #${lead.id}`,
                        name: lead.company,
                        contactPerson: lead.contact,
                        phone: "+91 98450 99881",
                        email: `${lead.contact.toLowerCase().replace(" ", ".")}@${lead.company.toLowerCase().replace(" ", "")}.com`,
                        status: `Active CRM Status: ${lead.status}`,
                        updated: false
                      });
                      setOpenLeadsDrawer(false);
                    }}
                    className="p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer transition-all text-xs flex flex-col gap-1.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900 text-sm">{lead.company}</span>
                      <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[#0F8B7D] font-bold text-[9px] uppercase">{lead.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 mt-1">
                      <span>Contact: <strong className="text-gray-700">{lead.contact}</strong></span>
                      <span>Area Req: <strong className="text-gray-700">{lead.area}</strong></span>
                      <span>Budget: <strong className="text-emerald-600">{lead.budget}</strong></span>
                      <span>Created: <strong className="text-gray-700">{lead.date}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <button 
                onClick={() => setOpenLeadsDrawer(false)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DRAWER 3: SITE VISITS TODAY ===== */}
      {visitsDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Site Visits Schedule</h3>
                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Scheduled Today</span>
                </div>
                <button 
                  onClick={() => setVisitsDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {visits.map(visit => (
                  <div key={visit.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-xs flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {visit.time.split(" ")[0]}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">{visit.visitor}</span>
                      <span className="text-[11px] text-gray-500 font-semibold block mt-0.5">🏢 {visit.site}</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">Host: {visit.host}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <Link 
                href="/leasing/visits"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Configure Visits Calendar <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== DRAWER 4: COMMISSION PIPE ===== */}
      {commissionDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Commission Pipe Projection</h3>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Earnings Forecast</span>
                </div>
                <button 
                  onClick={() => setCommissionDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {commissions.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 block">{c.deal}</span>
                      <span className="font-extrabold text-emerald-600 text-sm">{c.estComm}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold pt-2 border-t border-gray-100">
                      <span>Est Rent: {c.estRent}</span>
                      <span>Target: {c.expectedClose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <Link 
                href="/leasing/commissions"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                View Commission Ledger <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== DRAWER 5: FUNNEL STAGES LEADS LIST ===== */}
      {selectedFunnelStage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{funnelStages[selectedFunnelStage].title}</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Funnel Segment Listings</span>
                </div>
                <button 
                  onClick={() => setSelectedFunnelStage(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {funnelStages[selectedFunnelStage].items.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-800">
                    🏢 {item}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 mt-4">
              <button 
                onClick={() => setSelectedFunnelStage(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close Segment View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL 1: CONTACT STALE LEAD ===== */}
      {contactLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleContactSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl animate-scale-up border border-gray-100"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{contactLeadModal.id}</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Contact Client: {contactLeadModal.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setContactLeadModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-gray-700 font-semibold">
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 font-bold">
                ⚠️ {contactLeadModal.status}
              </div>
              
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Primary Contact Point</span>
                <span className="font-bold text-gray-900 block">{contactLeadModal.contactPerson}</span>
                <span className="text-[11px] text-gray-600 block mt-1">📞 {contactLeadModal.phone}</span>
                <span className="text-[11px] text-gray-600 block">✉️ {contactLeadModal.email}</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Compose Email/WhatsApp Response</label>
                <textarea 
                  rows={3}
                  defaultValue={`Hi ${contactLeadModal.contactPerson.split(" ")[0]}, hope you are doing well! Just wanted to follow up regarding the lease terms we sent for HCL Tech's office space requirements...`}
                  className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium leading-relaxed resize-none"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setContactLeadModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={13} /> Log Message & Update Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== MODAL 2: SEND ALERT REMINDER ===== */}
      {sendAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">LOI Signature Alert</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Send Reminder: {sendAlertModal.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSendAlertModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 font-bold">
                📌 LOI-012 under legal review for 5 days.
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 font-semibold text-gray-600">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Tata Motors Real Estate Contact</span>
                <span className="font-bold text-gray-900 block">{sendAlertModal.contactPerson}</span>
                <span className="text-[11px] block mt-1">📞 {sendAlertModal.phone}</span>
                <span className="text-[11px] block">✉️ {sendAlertModal.email}</span>
              </div>

              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                This will dispatch a high-priority automated notification via WhatsApp, SMS, and Email containing the secure sign-off link.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSendAlertModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bell size={13} /> Send WhatsApp & Email Alerts
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
