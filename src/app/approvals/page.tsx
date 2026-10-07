"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Building2,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  TrendingUp,
  User,
  ArrowLeft
} from "lucide-react";
import Topbar from "@/components/Topbar";

interface SubmittedContract {
  id: string;
  type: string;
  contractCode: string;
  occupantName: string;
  spaceName: string;
  propertyName: string;
  monthlyRent: string;
  financialImpact: string;
  submittedBy: string;
  makerRole: string;
  submittedDate: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  targetStatus: "active" | "future";
  startDate: string;
  endDate: string;
  escalationTerms: string;
  depositAmount: string;
  isMaker: boolean;
}

export default function ApprovalsInboxPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Modals
  const [selectedContract, setSelectedContract] = useState<SubmittedContract | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [contracts, setContracts] = useState<SubmittedContract[]>([
    {
      id: "CON-SUB-01",
      type: "New Contract",
      contractCode: "APX-L-0057",
      occupantName: "Global Logistics Warehousing",
      spaceName: "Floor 4 · East Wing",
      propertyName: "Apex Business Tower",
      monthlyRent: "₹34,80,000",
      financialImpact: "+₹34.80 L / month",
      submittedBy: "Anita Desai",
      makerRole: "Leasing Manager",
      submittedDate: "27-Sep-2026",
      dueDate: "30-Sep-2026",
      priority: "High",
      targetStatus: "active",
      startDate: "01-Oct-2026",
      endDate: "30-Sep-2029",
      escalationTerms: "+5% annually (Compounded)",
      depositAmount: "₹1,04,40,000 (3 Months)",
      isMaker: false,
    },
    {
      id: "CON-SUB-02",
      type: "Financial change",
      contractCode: "MTP-L-0012",
      occupantName: "TechNova Financial Systems",
      spaceName: "Floor 3 · Entire Floor",
      propertyName: "Meridian Tech Park",
      monthlyRent: "₹18,62,000",
      financialImpact: "+₹66,000 / month (Rate ₹95 → ₹98)",
      submittedBy: "Ravi Kumar",
      makerRole: "Property Manager",
      submittedDate: "28-Sep-2026",
      dueDate: "02-Oct-2026",
      priority: "Medium",
      targetStatus: "active",
      startDate: "01-Aug-2025",
      endDate: "31-Jul-2028",
      escalationTerms: "Rate amendment step",
      depositAmount: "₹55,86,000",
      isMaker: false,
    },
    {
      id: "CON-SUB-03",
      type: "Escalation apply",
      contractCode: "GFT-L-0003",
      occupantName: "FinTech Trade Labs",
      spaceName: "Suite 502",
      propertyName: "Nexus Corporate Hub",
      monthlyRent: "₹8,25,000",
      financialImpact: "+₹37,500 / month (+5.0% Step)",
      submittedBy: "System (Scheduled Auto-Trigger)",
      makerRole: "Automated Workflow Engine",
      submittedDate: "29-Sep-2026",
      dueDate: "01-Oct-2026",
      priority: "High",
      targetStatus: "active",
      startDate: "01-Oct-2024",
      endDate: "30-Sep-2027",
      escalationTerms: "+5% at Year 2 Anniversary",
      depositAmount: "₹24,75,000",
      isMaker: false,
    },
    {
      id: "CON-SUB-04",
      type: "Billing run",
      contractCode: "RUN-OCT-2026",
      occupantName: "October 2026 Portfolio Run (148 Invoices)",
      spaceName: "All Leased Spaces",
      propertyName: "All Properties",
      monthlyRent: "₹1,52,40,000",
      financialImpact: "₹1.52 Cr Gross Receivable",
      submittedBy: "Meera Sen",
      makerRole: "Finance Specialist",
      submittedDate: "01-Oct-2026",
      dueDate: "03-Oct-2026",
      priority: "High",
      targetStatus: "active",
      startDate: "01-Oct-2026",
      endDate: "31-Oct-2026",
      escalationTerms: "Standard Monthly Run",
      depositAmount: "N/A",
      isMaker: false,
    },
  ]);

  const [historyItems, setHistoryItems] = useState([
    {
      id: "HIST-01",
      code: "NXH-L-0021",
      occupant: "FreshMart Omnichannel",
      action: "Approved",
      date: "25-Sep-2026",
      approver: "Vikram Mehta (Principal)",
      impact: "+₹12.80 L/m",
    },
    {
      id: "HIST-02",
      code: "APX-L-0044",
      occupant: "Krypton Design Studio",
      action: "Rejected",
      date: "22-Sep-2026",
      approver: "Vikram Mehta (Principal)",
      reason: "Deposit lock-in clause missing 60-day notice requirement",
      impact: "Returned to draft",
    },
  ]);

  useEffect(() => {
    fetchSubmittedContracts();
  }, [typeFilter, propertyFilter]);

  const fetchSubmittedContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contracts?approval_status=submitted");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const apiItems: SubmittedContract[] = json.data.map((row: any) => ({
            id: row.contract.id,
            type: "New Contract",
            contractCode: row.contract.contract_code,
            occupantName: row.occupant_name || "Commercial Tenant",
            spaceName: row.space_name || "Designated Floor",
            propertyName: row.property_name || "Portfolio Asset",
            monthlyRent: `₹${Number(row.contract.contract_rent_inr || 0).toLocaleString("en-IN")}`,
            financialImpact: `₹${Number(row.contract.contract_rent_inr || 0).toLocaleString("en-IN")} / month`,
            submittedBy: row.contract.created_by ? `User ${row.contract.created_by.slice(0, 6)}` : "Operations Team",
            makerRole: "Property Manager",
            submittedDate: new Date(row.contract.created_at || Date.now()).toLocaleDateString("en-GB"),
            dueDate: "In 3 Days",
            priority: "High",
            targetStatus: row.contract.start_date > new Date().toISOString().split("T")[0] ? "future" : "active",
            startDate: row.contract.start_date || "2026-10-01",
            endDate: row.contract.end_date || "2029-09-30",
            escalationTerms: "+5% Annual",
            depositAmount: `₹${Number(row.contract.security_deposit_inr || 0).toLocaleString("en-IN")}`,
            isMaker: false,
          }));
          // Merge with default spec entries
          setContracts((prev) => {
            const existingCodes = new Set(apiItems.map((a) => a.contractCode));
            return [...apiItems, ...prev.filter((p) => !existingCodes.has(p.contractCode))];
          });
        }
      }
    } catch (e) {
      // Keep spec fallback items
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConfirm = async () => {
    if (!selectedContract) return;
    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      const res = await fetch(`/api/contracts/${selectedContract.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: approvalComment || "Approved by Checker" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMessage({
          type: "error",
          text: data.error || data.message || "Approval failed (RR-CON-09 maker-checker constraint).",
        });
        setIsSubmitting(false);
        return;
      }

      setAlertMessage({
        type: "success",
        text: `Contract ${selectedContract.contractCode} approved successfully! Status set to '${selectedContract.targetStatus}'. Confirmation email dispatched to submitter.`,
      });

      setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id));
      setHistoryItems((prev) => [
        {
          id: `HIST-${Date.now()}`,
          code: selectedContract.contractCode,
          occupant: selectedContract.occupantName,
          action: "Approved",
          date: "Today",
          approver: "You (Authorized Approver)",
          impact: selectedContract.financialImpact,
        },
        ...prev,
      ]);

      setIsApproveOpen(false);
      setSelectedContract(null);
      setApprovalComment("");
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        text: "Network issue while approving contract. Please retry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedContract) return;
    if (!rejectionReason.trim()) {
      setAlertMessage({ type: "error", text: "A rejection reason is mandatory (§S-06)." });
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      const res = await fetch(`/api/contracts/${selectedContract.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMessage({
          type: "error",
          text: data.error || data.message || "Failed to reject contract.",
        });
        setIsSubmitting(false);
        return;
      }

      setAlertMessage({
        type: "success",
        text: `Contract ${selectedContract.contractCode} rejected and reverted to draft. Rejection notification sent to maker.`,
      });

      setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id));
      setHistoryItems((prev) => [
        {
          id: `HIST-${Date.now()}`,
          code: selectedContract.contractCode,
          occupant: selectedContract.occupantName,
          action: "Rejected",
          date: "Today",
          approver: "You (Authorized Approver)",
          reason: rejectionReason,
          impact: "Returned to draft",
        },
        ...prev,
      ]);

      setIsRejectOpen(false);
      setSelectedContract(null);
      setRejectionReason("");
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        text: "Network issue while rejecting contract.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (typeFilter !== "all" && !c.type.toLowerCase().includes(typeFilter.toLowerCase())) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.contractCode.toLowerCase().includes(q) ||
        c.occupantName.toLowerCase().includes(q) ||
        c.submittedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Topbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb & Navigation Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Approvals Inbox</span>
          </div>

          <Link
            href="/properties/rent-roll"
            className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back to Rent Roll Register (§S-10)</span>
          </Link>
        </div>

        {/* Header (§S-06) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                §S-06 Wireframe Spec
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Maker-Checker Financial Sign-Off Desk
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <ShieldCheck size={24} className="text-[#0F8B7D]" />
              <span>Contract & Financial Approvals Inbox</span>
            </h1>
            <p className="text-xs text-slate-500">
              One unified inbox for approvers to review submitted contracts, financial amendments, scheduled escalations, and billing runs. Maker cannot approve own item (RR-CON-09).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchSubmittedContracts}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-[#0F8B7D]" : ""} />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xs flex items-center gap-2">
              <span>Pending Review:</span>
              <span className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-[11px] font-bold">
                {contracts.length}
              </span>
            </div>
          </div>
        </div>

        {alertMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
              alertMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {alertMessage.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
        )}

        {/* Tabs & Controls (§S-06 Top Strip) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Pending ({contracts.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "approved"
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Approved by Me (30d)
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Rejected (30d)
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, occupant..."
                className="pl-8 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="new contract">New Contract</option>
              <option value="financial change">Financial Change</option>
              <option value="escalation">Escalation Apply</option>
              <option value="billing run">Billing Run</option>
            </select>
          </div>
        </div>

        {/* TAB 1: PENDING APPROVALS LIST (§S-06 Core Wireframe Table) */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-3.5 font-semibold">Priority</th>
                    <th className="py-3 px-3.5 font-semibold">Approval Type</th>
                    <th className="py-3 px-3.5 font-semibold">Record Code</th>
                    <th className="py-3 px-3.5 font-semibold">Occupant & Property</th>
                    <th className="py-3 px-3.5 font-semibold">Submitted By</th>
                    <th className="py-3 px-3.5 font-semibold">Financial Impact</th>
                    <th className="py-3 px-3.5 font-semibold">Due Date</th>
                    <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContracts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === "High"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-bold text-slate-900">{item.contractCode}</div>
                        <span className="text-[10px] text-slate-400">Target: {item.targetStatus}</span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900">{item.occupantName}</div>
                        <span className="text-[11px] text-slate-500">{item.propertyName} · {item.spaceName}</span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-medium text-slate-800">{item.submittedBy}</div>
                        <span className="text-[10px] text-slate-400">{item.makerRole} on {item.submittedDate}</span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-bold text-emerald-700">{item.financialImpact}</div>
                        <span className="text-[10px] text-slate-400">Rent: {item.monthlyRent}</span>
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-700">
                        {item.dueDate}
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Side-by-Side Compare */}
                          <button
                            onClick={() => {
                              setSelectedContract(item);
                              setIsCompareOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Side-by-side comparison"
                          >
                            <Eye size={12} />
                            <span>Compare</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => {
                              setSelectedContract(item);
                              setIsRejectOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X size={12} />
                            <span>Reject</span>
                          </button>

                          {/* Approve Button */}
                          <button
                            onClick={() => {
                              setSelectedContract(item);
                              setIsApproveOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Approve</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredContracts.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No contracts currently pending approval matching your filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 & 3: HISTORY */}
        {activeTab !== "pending" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {activeTab === "approved" ? "Approved Contracts (Last 30 Days)" : "Rejected Items (Last 30 Days)"}
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {historyItems
                .filter((h) => (activeTab === "approved" ? h.action === "Approved" : h.action === "Rejected"))
                .map((h) => (
                  <div key={h.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{h.occupant}</div>
                      <span className="font-mono text-slate-500">{h.code} · {h.date}</span>
                      {h.reason && <p className="text-rose-700 text-[11px] mt-0.5 italic">Reason: "{h.reason}"</p>}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          h.action === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {h.action}
                      </span>
                      <div className="font-mono text-[11px] text-slate-700 mt-0.5">{h.impact}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* MODAL 1: APPROVE CONTRACT MODAL */}
        {isApproveOpen && selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <h3 className="text-base font-black text-slate-950">
                    Approve Contract {selectedContract.contractCode}
                  </h3>
                </div>
                <button onClick={() => setIsApproveOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              {/* Contract Summary */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Occupant:</span>
                  <span className="font-bold text-slate-900">{selectedContract.occupantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Space & Center:</span>
                  <span className="font-medium text-slate-800">{selectedContract.spaceName} ({selectedContract.propertyName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Rent:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedContract.monthlyRent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lease Period:</span>
                  <span className="font-mono text-slate-700">{selectedContract.startDate} → {selectedContract.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Lifecycle Status:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-800">
                    {selectedContract.targetStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted By:</span>
                  <span className="text-slate-700">{selectedContract.submittedBy} ({selectedContract.makerRole})</span>
                </div>
              </div>

              {/* Approval Comment */}
              <div className="mt-4">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Approval Notes / Comment (Optional)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Terms reviewed against commercial LOI. Approved for tenant onboarding."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Enforces RR-CON-09 maker-checker</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsApproveOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveConfirm}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>{isSubmitting ? "Approving..." : "Confirm Approval"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: REJECT CONTRACT MODAL */}
        {isRejectOpen && selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <XCircle size={18} />
                  </div>
                  <h3 className="text-base font-black text-slate-950">
                    Reject Contract {selectedContract.contractCode}
                  </h3>
                </div>
                <button onClick={() => setIsRejectOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3">
                Rejecting this contract will return it to <strong className="text-slate-900 font-bold">Draft</strong> status so the submitter ({selectedContract.submittedBy}) can modify commercial terms or attach missing documents.
              </p>

              {/* Rejection Reason (Mandatory §S-06) */}
              <div className="mt-4">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Rejection Reason (Required) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Deposit amount does not match standard 3-month calculation. Please adjust before resubmitting."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsRejectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X size={14} />
                  <span>{isSubmitting ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: SIDE-BY-SIDE COMPARE DRAWER (§S-06 Detail Panel) */}
        {isCompareOpen && selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-950">
                  Side-by-Side Review: {selectedContract.contractCode}
                </h3>
                <button onClick={() => setIsCompareOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                {/* Previous / Baseline */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                    BASELINE / PROPOSAL
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly Base Rent</span>
                      <span className="font-mono font-bold text-slate-700">₹32,00,000</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Escalation Schedule</span>
                      <span className="text-slate-700">+4.5% annual</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deposit Required</span>
                      <span className="font-mono text-slate-700">₹96,00,000</span>
                    </div>
                  </div>
                </div>

                {/* Submitted Version */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                  <div className="font-bold text-teal-800 uppercase tracking-wider text-[10px] mb-2">
                    SUBMITTED BY MAKER
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-teal-600 block text-[10px]">Monthly Base Rent</span>
                      <span className="font-mono font-bold text-teal-950">{selectedContract.monthlyRent}</span>
                    </div>
                    <div>
                      <span className="text-teal-600 block text-[10px]">Escalation Schedule</span>
                      <span className="text-teal-950 font-medium">{selectedContract.escalationTerms}</span>
                    </div>
                    <div>
                      <span className="text-teal-600 block text-[10px]">Deposit Amount</span>
                      <span className="font-mono font-bold text-teal-950">{selectedContract.depositAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setIsCompareOpen(false);
                    setIsApproveOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Proceed to Approve →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
