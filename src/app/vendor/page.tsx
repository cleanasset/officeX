"use client";
import React, { useState } from "react";
import { 
  Briefcase, 
  ClipboardList, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Users, 
  X, 
  Upload, 
  FileText, 
  Star, 
  ShieldCheck, 
  Send,
  Building,
  Phone,
  Calendar,
  AlertCircle,
  Bell,
  Download
} from "lucide-react";
import Link from "next/link";

export default function VendorDashboard() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [selectedRfqModal, setSelectedRfqModal] = useState<any>(null);
  const [selectedStaffModal, setSelectedStaffModal] = useState<any>(null);
  const [selectedPayoutModal, setSelectedPayoutModal] = useState(false);
  const [selectedRatingModal, setSelectedRatingModal] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("140000");
  const [milestoneNotes, setMilestoneNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Active Work Orders State
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WO-801",
      title: "HVAC Maintenance & Chiller Overhaul",
      property: "Apex Business Tower (BKC, Mumbai)",
      milestone: "Milestone 2/3 (Chiller verification & Pressure Testing)",
      deadline: "Due in 3 days",
      status: "In Progress",
      client: "Rajesh Kumar (Property Manager)",
      budget: "₹1,40,000",
      assignedTech: "Sanjay Kumar (Senior HVAC Specialist)",
      techPhone: "+91 98450 11223",
      shiftTime: "Morning Shift (09:00 AM - 05:00 PM)",
      tasks: [
        { name: "Condenser coil descaling and flushing", done: true },
        { name: "Refrigerant R-134a pressure and leak test", done: false },
        { name: "BMS sensor calibration and temperature log", done: false }
      ]
    },
    {
      id: "WO-802",
      title: "Weekly Deep Cleaning & Mechanized Scrubbing",
      property: "Meridian Tech Park (Whitefield, Bengaluru)",
      milestone: "Milestone 1/1 completed - Awaiting validation from facility lead",
      deadline: "Completed today",
      status: "Review Pending",
      client: "Vijay Dev (Facility Manager)",
      budget: "₹45,000",
      assignedTech: "Vikram Shah (Housekeeping Supervisor + 4 Crew)",
      techPhone: "+91 98450 44556",
      shiftTime: "Evening Shift (02:00 PM - 10:00 PM)",
      tasks: [
        { name: "Mechanized single-disc floor scrubbing (Floors 1-6)", done: true },
        { name: "Washroom sanitization & air freshener refill", done: true },
        { name: "Glass facade internal wipe-down", done: true }
      ]
    }
  ]);

  // Matched RFQs
  const matchedRfqs = [
    { id: 1, title: "150TR Chiller Descaling & Overhaul", property: "Apex Business Tower, Mumbai", budget: "₹1,50,000", matchReason: "Matches HVAC Specialist + Mumbai Region", deadline: "Sep 05, 2026", client: "Rajesh Kumar" },
    { id: 2, title: "DG Set 500kVA B-Check & Filter AMC", property: "Meridian Tech Park, Bengaluru", budget: "₹85,000", matchReason: "Matches Electrical AMC + Bengaluru", deadline: "Sep 08, 2026", client: "Vijay Dev" },
    { id: 3, title: "Fire Hydrant Pump Replacement", property: "Crystal Tower, Chennai", budget: "₹2,10,000", matchReason: "Matches Fire Safety + Verified PSARA", deadline: "Sep 12, 2026", client: "Dharma Estates" },
    { id: 4, title: "Quarterly Indoor Air Quality (IAQ) Audit", property: "Nexus Hub, Pune", budget: "₹40,000", matchReason: "Matches Specialized Compliance", deadline: "Sep 15, 2026", client: "Nexus Management" }
  ];

  // Deployed On-Ground Technicians & Staff Roster
  const deployedStaff = [
    { id: 1, name: "Sanjay Kumar", trade: "Senior HVAC Specialist", phone: "+91 98450 11223", deployedAt: "Apex Business Tower", shift: "09:00 AM - 05:00 PM", status: "On-Site Active", certification: "BEE Certified HVAC Tech" },
    { id: 2, name: "Vikram Shah", trade: "Plumbing & Drainage Lead", phone: "+91 98450 44556", deployedAt: "Meridian Tech Park", shift: "02:00 PM - 10:00 PM", status: "On-Site Active", certification: "Certified MEP Lead" },
    { id: 3, name: "Ramesh Dev", trade: "High-Tension Electrician", phone: "+91 98450 77889", deployedAt: "Nexus Hub, Pune", shift: "07:00 AM - 03:00 PM", status: "Available for Dispatch", certification: "Govt Class-A License" },
    { id: 4, name: "Anita Rao", trade: "Facility Sanitization Supervisor", phone: "+91 98450 99001", deployedAt: "Crystal Tower, Chennai", shift: "06:00 AM - 02:00 PM", status: "On-Site Active", certification: "BICSc Certified Cleaning Lead" }
  ];

  const handleMilestoneComplete = (woId: string) => {
    setWorkOrders(workOrders.map(w => {
      if (w.id === woId) {
        return {
          ...w,
          status: "Review Pending",
          milestone: "Milestone submitted — Awaiting manager verification",
          tasks: w.tasks.map(t => ({ ...t, done: true }))
        };
      }
      return w;
    }));
    setSelectedWorkOrder(null);
    showToast(`Proof of work for ${woId} submitted to Property Manager for sign-off!`);
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Quotation bid of ₹${parseInt(bidAmount).toLocaleString()} submitted for "${selectedRfqModal?.title}"! Client notified.`);
    setSelectedRfqModal(null);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Operating Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">
              <ShieldCheck size={12} /> KYC Verified Contractor
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium mt-1">TechServe Solutions Private Limited • GSTIN: 27AABCT9876C1ZR • Active Service Provider</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/vendor/rfqs" 
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Briefcase size={14} /> Browse Matched RFQs (4)
          </Link>
        </div>
      </div>

      {/* KPI BENTO CARDS (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Matched RFQs */}
        <Link 
          href="/vendor/rfqs"
          className="premium-card p-6 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Matched RFQs</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-emerald-700">4</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              🟢 Matching Categories →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Briefcase size={22} />
          </div>
        </Link>

        {/* Active Work Orders */}
        <Link 
          href="/vendor/work-orders"
          className="premium-card p-6 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Active Work Orders</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-blue-700">3</div>
            <span className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
              1 milestone ending soon →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <ClipboardList size={22} />
          </div>
        </Link>

        {/* Invoices & Payouts */}
        <div 
          onClick={() => setSelectedPayoutModal(true)}
          className="premium-card p-6 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Invoices & Payouts</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-700">₹1.8L</div>
            <span className="text-[10px] text-purple-600 font-bold mt-1 flex items-center gap-1">
              ₹45k released yesterday →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Average Rating */}
        <div 
          onClick={() => setSelectedRatingModal(true)}
          className="premium-card p-6 border border-gray-200 hover:border-amber-300 hover:bg-amber-50/20 flex items-center justify-between bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Average Rating</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-amber-700">4.8</div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
              ⭐⭐⭐⭐⭐ Excellent →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Sparkles size={22} />
          </div>
        </div>

      </div>

      {/* SECTION 1: Active Work Orders & Logs Status (Clickable) */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-600" />
              Active Work Orders & Milestone Logs (Click to inspect / update)
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Click any job to see assigned technicians, checklist items, and submit milestone completion proof.</p>
          </div>
          <Link href="/vendor/work-orders" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Work Orders →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {workOrders.map((wo) => (
            <div 
              key={wo.id}
              onClick={() => setSelectedWorkOrder(wo)}
              className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[10px] text-gray-400">{wo.id}</span>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700">{wo.title}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium text-[11px] mt-0.5">
                  <span className="flex items-center gap-1"><Building size={12} className="text-gray-400" /> {wo.property}</span>
                  <span className="flex items-center gap-1"><UserCheck size={12} className="text-gray-400" /> Tech: <strong className="text-gray-800">{wo.assignedTech}</strong></span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {wo.shiftTime}</span>
                </div>
                <div className="text-gray-500 font-semibold text-[11px] mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit">
                  📌 {wo.milestone}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-extrabold text-gray-900 text-sm">{wo.budget}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  wo.status === "In Progress" 
                    ? "bg-amber-50 border border-amber-200 text-amber-700" 
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}>
                  {wo.status}
                </span>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Deployed Technicians & On-Ground Staff Roster */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Deployed Technicians & Service Staff Roster
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Track on-ground engineers, assigned shifts, building sites, and qualifications.</p>
          </div>
          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {deployedStaff.length} Staff Deployed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deployedStaff.map((staff) => (
            <div 
              key={staff.id}
              onClick={() => setSelectedStaffModal(staff)}
              className="p-4 rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/10 flex items-start justify-between cursor-pointer transition-all shadow-sm text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm hover:text-blue-700">{staff.name}</h4>
                  <span className="text-[11px] text-gray-600 font-semibold block">{staff.trade}</span>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold mt-2">
                    <span>🏢 {staff.deployedAt}</span>
                    <span>⏰ {staff.shift}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                staff.status === "On-Site Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}>
                {staff.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Service Catalogue & Rate Card */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-amber-600" />
          Verified Service Catalogue & Standard Rate Card
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">HVAC & Chiller Maintenance</span>
            <span className="font-extrabold text-gray-900 text-sm block mt-1">₹1,500 / Hr</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">Includes chemical descaling, gas charging, & 24/7 breakdown SLA</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Electrical AMC & HT Grid</span>
            <span className="font-extrabold text-gray-900 text-sm block mt-1">₹1,200 / Hr</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">Transformer oil filtration, relay testing, and DG sync</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Mechanized Housekeeping</span>
            <span className="font-extrabold text-gray-900 text-sm block mt-1">₹450 / Hr</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">Single-disc floor scrubbing, facade cleaning, & waste disposal</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Statutory Fire Safety Audit</span>
            <span className="font-extrabold text-gray-900 text-sm block mt-1">₹25,000 / Audit</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">NFPA-25 sprinkler testing, fire pump cert, & NOC documentation</span>
          </div>
        </div>
      </div>

      {/* DRAWER 1: Work Order Milestone & Proof-of-Work Submission */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[9px] font-extrabold font-mono text-gray-400 uppercase tracking-wider">{selectedWorkOrder.id}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">{selectedWorkOrder.title}</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedWorkOrder.property}</span>
                </div>
                <button 
                  onClick={() => setSelectedWorkOrder(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                
                {/* Client & Payout Card */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Contract Amount</span>
                    <span className="font-extrabold text-emerald-600 text-sm">{selectedWorkOrder.budget}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Job Status</span>
                    <span className="font-bold text-gray-900">{selectedWorkOrder.status}</span>
                  </div>
                </div>

                {/* On-Site Technician Details */}
                <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Assigned On-Site Engineer</span>
                  <span className="font-extrabold text-gray-900 block text-xs">{selectedWorkOrder.assignedTech}</span>
                  <div className="flex items-center gap-4 text-[11px] text-gray-600 mt-1.5">
                    <span>📞 {selectedWorkOrder.techPhone}</span>
                    <span>⏰ {selectedWorkOrder.shiftTime}</span>
                  </div>
                </div>

                {/* Milestone Checklist */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Milestone Checklist Tasks</span>
                  <div className="flex flex-col gap-2">
                    {selectedWorkOrder.tasks.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <CheckCircle size={15} className={t.done ? "text-emerald-600" : "text-gray-300"} />
                        <span className={`font-semibold ${t.done ? "text-gray-900 line-through opacity-70" : "text-gray-800"}`}>
                          {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submission Notes */}
                {selectedWorkOrder.status === "In Progress" && (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Technician Work Notes & Readings</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Pressure tested at 7.2 bar for 45 mins. Condenser coils thoroughly cleaned."
                      value={milestoneNotes}
                      onChange={(e) => setMilestoneNotes(e.target.value)}
                      className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 resize-none font-medium"
                    />
                  </div>
                )}

              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              {selectedWorkOrder.status === "In Progress" ? (
                <button 
                  onClick={() => handleMilestoneComplete(selectedWorkOrder.id)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Submit Milestone Proof & Request Payout
                </button>
              ) : (
                <button 
                  onClick={() => {
                    showToast("Reminder alert sent to Facility Manager to validate milestone signoff.");
                    setSelectedWorkOrder(null);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell size={14} /> Send Signoff Reminder to Client
                </button>
              )}
              <button 
                onClick={() => setSelectedWorkOrder(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Payouts & Escrow Ledger Breakdown */}
      {selectedPayoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 flex flex-col gap-6 shadow-2xl animate-scale-up border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Invoices & Escrow Payouts Ledger</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">Automated 90% Vendor Payout / 10% Platform Commission</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPayoutModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Total Lifetime Earnings</span>
                  <span className="text-xl font-extrabold text-gray-900 block mt-0.5">₹1,80,000</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Released to Bank</span>
                  <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">₹1,35,000</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-purple-600 font-bold uppercase">Currently Held in Escrow</span>
                  <span className="font-bold text-gray-900 text-sm block mt-0.5">TX-302: AC Overhaul - Apex</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                  ₹45,000 (Pending Signoff)
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  showToast("Downloading tax invoice statement PDF...");
                  setSelectedPayoutModal(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Download Invoices PDF
              </button>
              <button
                onClick={() => setSelectedPayoutModal(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Client Reviews Scorecard */}
      {selectedRatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 flex flex-col gap-6 shadow-2xl animate-scale-up border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Star size={24} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Client Trust & Rating Scorecard</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">4.8 / 5.0 Average Rating across 18 jobs</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRatingModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Rajesh Kumar (Apex Business Tower)</span>
                  <div className="flex text-amber-500">★★★★★</div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">
                  "Superb execution on our chiller maintenance. Tech arrived on time and resolved the vibration issue within 4 hours."
                </p>
                <span className="text-[10px] text-gray-400 font-bold">Aug 22, 2026</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedRatingModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Technician Staff Details */}
      {selectedStaffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl animate-scale-up border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Technician Profile</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">{selectedStaffModal.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedStaffModal(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Trade Specialization</span>
                <span className="font-bold text-gray-900 text-sm">{selectedStaffModal.trade}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Deployment Location</span>
                <span className="font-bold text-gray-900">{selectedStaffModal.deployedAt}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Assigned Shift</span>
                <span className="font-bold text-purple-700">{selectedStaffModal.shift}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Government / Trade License</span>
                <span className="font-bold text-gray-900">{selectedStaffModal.certification}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedStaffModal(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
