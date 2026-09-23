"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  CreditCard, Wrench, Users, FileText, Calendar, Clock, 
  MapPin, Maximize2, X, CheckCircle2, Download, ShieldCheck,
  Send, AlertTriangle, Check, Bell, Laptop, ArrowRight,
  Loader2, KeyRound, Plus, HelpCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { initiateRazorpayPayment } from "@/lib/razorpay-client";

interface TicketItem {
  id: string;
  title: string;
  priority: string;
  priorityColor: string;
  status?: string;
  remaining?: string;
  progress?: number;
  chatLabel?: string;
}

interface NoticeItem {
  day: string;
  date: string;
  title: string;
  time: string;
  color: string;
}

export default function TenantHomepage() {
  const [buildingName, setBuildingName] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [unitNumber, setUnitNumber] = useState<string | null>(null);
  const [areaSqft, setAreaSqft] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [leaseCode, setLeaseCode] = useState<string | null>(null);

  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [rentPaid, setRentPaid] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<{
    paymentId: string;
    orderId?: string;
    date: string;
    amount: number;
  } | null>(null);

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [visitorsCount, setVisitorsCount] = useState<number>(0);
  const [documentsCount, setDocumentsCount] = useState<number>(0);

  const [tenantOrg, setTenantOrg] = useState("");
  const [tenantUser, setTenantUser] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [noticeIndex, setNoticeIndex] = useState(0);

  // Chat with Helpdesk state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState<TicketItem | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");

  // Book a Room state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("boardroom");
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState("02:00 PM - 03:00 PM");
  const [roomBookedSuccess, setRoomBookedSuccess] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(0);

  // Ticket Escalation state
  const [escalated, setEscalated] = useState(false);

  // Initialize and load real tenant data
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedEmail = localStorage.getItem("officex_user_email") || "";
    const savedUser = localStorage.getItem("officex_user_name") || "";
    const savedOrg = localStorage.getItem("officex_active_org") || "";
    const savedCode = localStorage.getItem("officex_invite_code") || "";

    setTenantEmail(savedEmail);
    setTenantUser(savedUser);
    setTenantOrg(savedOrg);

    const b = localStorage.getItem("officex_tenant_building");
    const o = localStorage.getItem("officex_tenant_owner");
    const u = localStorage.getItem("officex_tenant_unit");

    // Clean out known mock demo seeds if they were stored from old runs without an explicit user invite
    const DEMO_SEEDS = [
      "eka club",
      "business hub",
      "shivalik shilp",
      "apex business tower",
      "apex commercial tower",
      "meridian tech park",
      "nexus hub",
      "maker maxity",
      "godrej bkc horizon",
      "commercial workplace tower"
    ];

    if (b && !DEMO_SEEDS.includes(b.trim().toLowerCase())) {
      setBuildingName(b);
      if (o) setOwnerName(o);
      if (u) setUnitNumber(u);
    } else if (b && savedCode) {
      // If tenant explicitly joined with an invite code, retain it
      setBuildingName(b);
      if (o) setOwnerName(o);
      if (u) setUnitNumber(u);
    } else {
      setBuildingName(null);
    }

    // Load real tickets from storage (default empty)
    try {
      const storedTickets = JSON.parse(localStorage.getItem("officex_tenant_tickets") || "[]");
      setTickets(Array.isArray(storedTickets) ? storedTickets : []);
    } catch {
      setTickets([]);
    }

    // Load real notices from storage (default empty)
    try {
      const storedNotices = JSON.parse(localStorage.getItem("officex_building_notices") || "[]");
      setNotices(Array.isArray(storedNotices) ? storedNotices : []);
    } catch {
      setNotices([]);
    }

    // Load visitors count (default 0)
    try {
      const storedVisitors = JSON.parse(localStorage.getItem("officex_tenant_visitors") || "[]");
      setVisitorsCount(Array.isArray(storedVisitors) ? storedVisitors.length : 0);
    } catch {
      setVisitorsCount(0);
    }

    // Load documents count (default 0)
    try {
      const storedDocs = JSON.parse(localStorage.getItem("officex_tenant_documents") || "[]");
      setDocumentsCount(Array.isArray(storedDocs) ? storedDocs.length : 0);
    } catch {
      setDocumentsCount(0);
    }

    // Check payment status
    if (localStorage.getItem("officex_tenant_rent_paid") === "1") {
      setRentPaid(true);
      const pid = localStorage.getItem("officex_tenant_last_payment_id") || "pay_verified";
      setPaymentReceipt({
        paymentId: pid,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        amount: Number(localStorage.getItem("officex_tenant_paid_amount") || 0)
      });
    }

    // Query active lease & billing details from API
    const lookupParam = encodeURIComponent(savedOrg || savedUser);
    const emailParam = encodeURIComponent(savedEmail);
    fetch(`/api/tenant/invoices?email=${emailParam}&name=${lookupParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.tenant) {
          if (data.leases && data.leases.length > 0) {
            const primaryLease = data.leases[0];
            if (primaryLease.propertyName) setBuildingName(primaryLease.propertyName);
            if (primaryLease.unitNumber) setUnitNumber(primaryLease.unitNumber);
            if (primaryLease.leaseCode) setLeaseCode(primaryLease.leaseCode);
            if (primaryLease.chargeableArea) {
              setAreaSqft(`${Number(primaryLease.chargeableArea).toLocaleString("en-IN")} sqft`);
            }
            if (primaryLease.monthlyRent && !rentPaid) {
              setMonthlyRent(primaryLease.monthlyRent);
            }
          }
          if (data.summary && data.summary.nextDueInvoice) {
            const due = data.summary.nextDueInvoice.balanceDue || data.summary.nextDueInvoice.grossTotal || 0;
            if (!rentPaid) setMonthlyRent(due);
          }
        }
      })
      .catch((err) => console.warn("Tenant billing sync note:", err));
  }, [rentPaid]);

  const handlePayRentRazorpay = async (amountInRupees: number) => {
    if (!amountInRupees || amountInRupees <= 0) return;
    setPaymentStatus("processing");
    try {
      await initiateRazorpayPayment({
        amount: amountInRupees * 100, // in paise
        receipt: `RENT-${Date.now()}`,
        description: `Monthly Commercial Rent — ${unitNumber || "Unit"} (${buildingName || "Workspace"}) [₹${amountInRupees.toLocaleString("en-IN")}]`,
        prefillName: tenantOrg || tenantUser || "Tenant Occupier",
        prefillEmail: tenantEmail || "accounts@officex.pro",
        notes: {
          tenant: tenantOrg || tenantUser || "Tenant Occupier",
          unit: unitNumber || "Unit",
          property: buildingName || "OfficeX Commercial Asset",
          billingMonth: "Current Billing Cycle",
          type: "commercial_lease_rent"
        },
        onSuccess: async (response) => {
          setRentPaid(true);
          setPaymentStatus("success");
          const nowStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          setPaymentReceipt({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            date: nowStr,
            amount: amountInRupees
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_tenant_rent_paid", "1");
            localStorage.setItem("officex_tenant_last_payment_id", response.razorpay_payment_id);
            localStorage.setItem("officex_tenant_paid_amount", amountInRupees.toString());
          }
          try {
            await fetch("/api/rent-roll/collections", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                invoiceId: `INV-${Date.now()}`,
                leaseId: leaseCode || "LS-ACTIVE",
                amountReceived: amountInRupees,
                tdsDeducted: Math.round(amountInRupees * 0.1),
                paymentMode: "razorpay_live",
                referenceNumber: response.razorpay_payment_id,
                paymentDate: new Date().toISOString().split("T")[0],
                bankAccount: "Razorpay Live Escrow Nodal",
                notes: `Live Verified Razorpay Payment | Order: ${response.razorpay_order_id || ""} | ID: ${response.razorpay_payment_id}`
              })
            });
          } catch (e) {
            console.error("Collections recording note:", e);
          }
        },
        onFailure: (err) => {
          console.error("Razorpay payment failed:", err);
          setPaymentStatus("idle");
        }
      });
    } catch (err: any) {
      console.error("Razorpay init error:", err);
      setPaymentStatus("idle");
      alert(err.message || "Failed to initialize Razorpay");
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: tenantUser || "You",
      time: "Just now",
      text: newChatMessage,
      isAgent: false
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewChatMessage("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "Facility Management Desk",
          time: "Just now",
          text: "Your message has been logged. An assigned technician will contact your suite coordinator shortly.",
          isAgent: true
        }
      ]);
    }, 1200);
  };

  const handleBookRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomBookedSuccess(true);
    setCreditsRemaining((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Hero Property Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Workspace Card */}
        {buildingName ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <div className="bg-slate-100 relative h-36 sm:h-auto border-r border-slate-100 flex items-center justify-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center shadow-xs">
                <Laptop size={32} />
              </div>
            </div>
            <div className="p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  ACTIVE LEASE
                </span>
                {leaseCode && (
                  <span className="text-[10px] font-mono text-slate-400">ID: {leaseCode}</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{buildingName}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {unitNumber ? `Unit: ${unitNumber}` : "Commercial Suite"}
                </p>
                {ownerName && (
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    Landlord: {ownerName}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-6 mt-3 text-xs text-gray-600">
                {areaSqft && (
                  <div className="flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Leased Area</p>
                      <p className="text-xs font-bold text-gray-700">{areaSqft}</p>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Location</p>
                      <p className="text-xs font-bold text-gray-700">{location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Status</p>
                    <p className="text-xs font-bold text-emerald-700">Verified Occupier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0 border border-teal-200">
                <KeyRound size={22} />
              </div>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 mb-1">
                  TENANT PORTAL GATEWAY
                </span>
                <h2 className="text-lg font-black text-slate-900">No Commercial Workspace Linked</h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                  Enter the building invitation code provided by your landlord or property manager to access your lease terms, rent invoices, and workplace services.
                </p>
              </div>
            </div>
            <Link
              href="/tenant/join"
              className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shrink-0 shadow-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <KeyRound size={14} />
              <span>Join with Invite Code</span>
            </Link>
          </div>
        )}

        {/* Quick Action Cards - 5 Cards (2x3 responsive layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 w-full lg:w-[360px]">
          {/* Monthly Rent */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#14B8A6] rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CreditCard size={12} />
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${rentPaid ? "bg-emerald-800/80 text-white" : monthlyRent > 0 ? "bg-white/20 text-white" : "bg-teal-900/60 text-white"}`}>
                  {rentPaid ? "PAID ✓" : monthlyRent > 0 ? "DUE" : "NO DUES"}
                </span>
              </div>
              <p className="text-[10px] text-white/80">Monthly Rent</p>
              <p className="text-base sm:text-lg font-black">
                {rentPaid ? "₹0 Due" : monthlyRent > 0 ? `₹${monthlyRent.toLocaleString("en-IN")}` : "₹0 Due"}
              </p>
              <p className="text-[10px] text-teal-100 mt-0.5">
                {rentPaid ? "Settled for current month" : monthlyRent > 0 ? "Due for current period" : "No pending invoice"}
              </p>
            </div>
            {monthlyRent > 0 && !rentPaid ? (
              <button 
                onClick={() => { setPaymentStatus("idle"); setIsPaymentModalOpen(true); }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-[11px] font-bold cursor-pointer text-center w-full transition-colors shadow-2xs"
              >
                Pay Now
              </button>
            ) : rentPaid ? (
              <button 
                onClick={() => { setPaymentStatus("success"); setIsPaymentModalOpen(true); }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-[11px] font-bold cursor-pointer text-center w-full transition-colors shadow-2xs"
              >
                View Receipt
              </button>
            ) : (
              <Link
                href="/tenant/payments"
                className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold cursor-pointer text-center w-full transition-colors block"
              >
                View Invoices
              </Link>
            )}
          </div>

          {/* Helpdesk */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <Wrench size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Helpdesk</p>
              <p className="text-base sm:text-lg font-black">{tickets.length} active tickets</p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                {tickets.length > 0 ? "In SLA pipeline" : "No tickets pending"}
              </p>
            </div>
            <Link href="/tenant/helpdesk" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Raise Ticket</Link>
          </div>

          {/* Visitors */}
          <div className="bg-gradient-to-br from-[#0F8B7D] to-[#0D7A6E] rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <Users size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Visitors</p>
              <p className="text-base sm:text-lg font-black">{visitorsCount} registered today</p>
              <p className="text-[10px] text-teal-100 mt-0.5">
                {visitorsCount > 0 ? "Turnstile pass active" : "No visitors scheduled"}
              </p>
            </div>
            <Link href="/tenant/visitors" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">Register</Link>
          </div>

          {/* Documents */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
            <div>
              <FileText size={14} className="mb-1" />
              <p className="text-[10px] text-white/80">Documents</p>
              <p className="text-base sm:text-lg font-black">{documentsCount} files</p>
              <p className="text-[11px] font-medium text-teal-200 truncate mt-0.5">
                {documentsCount > 0 ? "Lease & compliance" : "No files uploaded"}
              </p>
            </div>
            <Link href="/tenant/documents" className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-[11px] font-bold hover:bg-white/30 cursor-pointer text-center block">View Files</Link>
          </div>

          {/* 5th Quick Action Card: Book a Room */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-3.5 text-white flex items-center justify-between border border-teal-800/60 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-teal-300 text-[10px] font-bold mb-0.5">
                <Calendar size={12} />
                <span>MEETING SPACES</span>
              </div>
              <p className="text-xs font-bold text-white">Conference &amp; Meeting Pods</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Available on reservation</p>
            </div>
            <button
              onClick={() => { setRoomBookedSuccess(false); setIsRoomModalOpen(true); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Book Room
            </button>
          </div>
        </div>
      </div>

      {/* Active Helpdesk Tickets + Building Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Helpdesk Tickets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Active Helpdesk Tickets</h2>
              <p className="text-xs text-slate-500">Facility tickets and engineering dispatch</p>
            </div>
            <Link href="/tenant/helpdesk" className="text-xs font-semibold text-[#0F8B7D] hover:underline cursor-pointer">
              View All
            </Link>
          </div>

          {tickets.length > 0 ? (
            <div className="flex flex-col gap-4">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                      <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.priorityColor}`}>
                      {t.priority}
                    </span>
                  </div>
                  {t.remaining && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                      <Clock size={11} /> {t.remaining}
                    </div>
                  )}
                  {t.progress !== undefined && (
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${t.progress}%` }} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-1">
                    {t.chatLabel ? (
                      <button 
                        type="button"
                        onClick={() => { setActiveChatTicket(t); setIsChatOpen(true); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                      >
                        <span>{t.chatLabel}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Assigned to Facility Team</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-4 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Active Helpdesk Tickets</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                All facilities in your workspace are functioning normally. Need maintenance or IT support?
              </p>
              <Link
                href="/tenant/helpdesk"
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>Raise New Ticket</span>
              </Link>
            </div>
          )}
        </div>

        {/* Building Notices */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Building Notices</h2>
            {notices.length > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setNoticeIndex(Math.max(0, noticeIndex - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setNoticeIndex(Math.min(notices.length - 1, noticeIndex + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {notices.length > 0 ? (
            <div className="flex flex-col gap-3">
              {notices.map((n, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border border-gray-200 border-l-4 ${n.color}`}>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{n.day}</p>
                    <p className="text-xl font-black text-gray-900">{n.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{n.title}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-4 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <Bell size={32} className="text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Building Notices</h4>
              <p className="text-xs text-slate-500 mt-1">
                No circulars or maintenance alerts posted by property management at this time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Rent Payment & GST Tax Receipt Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            {rentPaid || paymentStatus === "success" ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Payment Completed</h3>
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck size={12} />
                        <span>Settled via Live Razorpay Escrow</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* GST Tax Invoice Box */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 font-mono">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900 text-sm font-sans">{buildingName || "COMMERCIAL ASSET"}</p>
                      <p className="text-[10px] text-slate-500 font-sans">Verified Nodal Escrow Account</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider font-sans">
                      PAID ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] py-1">
                    <div>
                      <p className="text-slate-400 text-[10px] font-sans uppercase">Receipt ID</p>
                      <p className="font-bold text-slate-800 font-mono truncate">{paymentReceipt?.paymentId || "pay_verified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-sans uppercase">Payment Date</p>
                      <p className="font-bold text-slate-800">{paymentReceipt?.date || "Today"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-sans uppercase">Tenant</p>
                      <p className="font-bold text-slate-800">{tenantOrg || tenantUser || "Tenant Occupier"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-sans uppercase">Unit &amp; Property</p>
                      <p className="font-bold text-slate-800">{unitNumber || "Suite"}, {buildingName || "Workspace"}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-900 font-black text-sm pt-1">
                      <span className="font-sans">Total Amount Settled</span>
                      <span className="font-mono text-emerald-700">₹{(paymentReceipt?.amount || monthlyRent || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-0.5">
                    <p><strong>Razorpay Payment ID:</strong> {paymentReceipt?.paymentId || "pay_verified"}</p>
                    <p><strong>Escrow Settlement:</strong> Instant (Auto-reconciled with Rent Roll)</p>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Download Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Commercial Lease Rent Payment</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{buildingName || "Workspace"} · {unitNumber || "Office Suite"}</p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-slate-900">Total Net Payable</span>
                    <span className="text-xl font-black text-[#0F8B7D] font-mono">₹{monthlyRent.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl mb-4 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                  <div className="text-[11px] text-teal-900">
                    <p className="font-bold">Live Razorpay Escrow Gateway</p>
                    <p className="text-teal-700 mt-0.5 leading-relaxed">
                      Secured by 256-bit encryption. Supports UPI, NetBanking, NEFT/RTGS, and Corporate Cards.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={paymentStatus === "processing"}
                    onClick={() => handlePayRentRazorpay(monthlyRent)}
                    className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {paymentStatus === "processing" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening Razorpay Live Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Pay ₹{monthlyRent.toLocaleString("en-IN")} with Razorpay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={paymentStatus === "processing"}
                    onClick={() => handlePayRentRazorpay(1)}
                    className="w-full py-2.5 rounded-xl border border-teal-300 hover:bg-teal-50/50 text-[#0F8B7D] text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Test Live ₹1 Real Payment Verification</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book a Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {roomBookedSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Meeting Room Reserved</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirmation logged for {selectedRoom.toUpperCase()} on {selectedDate} ({selectedSlot}).
                </p>
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Reserve Meeting Space</h3>
                <p className="text-xs text-slate-500 mb-4">Select meeting room or conference space in your facility.</p>

                <form onSubmit={handleBookRoom} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Select Space:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "boardroom", name: "Boardroom", cap: "18 Pax" },
                        { id: "strategy", name: "Strategy Pod", cap: "6 Pax" },
                        { id: "focus", name: "Focus Booth", cap: "1 Pax" }
                      ].map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => setSelectedRoom(rm.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedRoom === rm.id
                              ? "border-[#0F8B7D] bg-teal-50/60 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{rm.name}</p>
                          <p className="text-[10px] text-slate-500">{rm.cap}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Meeting Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Client Presentation / Review"
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
                  >
                    Confirm Reservation
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
