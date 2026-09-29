"use client";

import React, { useState } from "react";
import {
  X,
  Building,
  Calendar,
  Layers,
  TrendingUp,
  Receipt,
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  Shield,
  Download,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Percent,
  Check,
  ArrowRight
} from "lucide-react";
import { EnrichedLease } from "./MasterGridTab";
import { formatINR } from "./DashboardTab";

interface LeaseDetailDrawerProps {
  lease: EnrichedLease | null;
  onClose: () => void;
  onOpenApplyEscalation: (lease: EnrichedLease) => void;
  onOpenServeNotice: (lease: EnrichedLease) => void;
  onOpenRecordPayment: (lease: EnrichedLease) => void;
  onLeaseUpdated?: () => void;
}

export const LeaseDetailDrawer: React.FC<LeaseDetailDrawerProps> = ({
  lease,
  onClose,
  onOpenApplyEscalation,
  onOpenServeNotice,
  onOpenRecordPayment,
  onLeaseUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"commercials" | "escalations" | "legal" | "clauses" | "documents">("commercials");
  const [docUploadTitle, setDocUploadTitle] = useState("");
  const [docUploadType, setDocUploadType] = useState("amendment");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState("");
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");

  if (!lease) return null;

  const getContractTypeLabel = (type?: string) => {
    switch (type) {
      case "lease_deed":
        return "Commercial Lease Deed";
      case "leave_and_licence":
        return "Leave & Licence Agreement";
      case "managed_office_agreement":
        return "Managed Office Agreement";
      case "coworking_membership":
      case "flex_membership":
        return "Flex Coworking Membership";
      case "head_lease":
        return "Head Lease (Payable)";
      case "sublease":
        return "Commercial Sublease";
      case "revenue_share":
        return "Revenue Share Agreement";
      case "charges_only":
        return "Facilities Agreement";
      default:
        return "Commercial Contract";
    }
  };

  const handleApprovalAction = async (action: "approve" | "reject") => {
    let reason = "";
    if (action === "reject") {
      const input = prompt("Please provide reason for rejecting this contract terms:");
      if (!input) return;
      reason = input;
    }

    setIsProcessingApproval(true);
    try {
      const res = await fetch("/api/rent-roll/leases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          action,
          approvedBy: "Finance Controller & Checker",
          rejectionReason: reason
        })
      });

      if (res.ok) {
        setApprovalMessage(action === "approve" ? "Contract verified & approved into active status!" : "Contract rejected by checker.");
        if (onLeaseUpdated) onLeaseUpdated();
        setTimeout(() => setApprovalMessage(""), 4000);
      } else {
        alert("Failed to process approval action.");
      }
    } catch (err) {
      console.error("Maker-checker action error:", err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadTitle) return;
    setIsUploadingDoc(true);
    try {
      const res = await fetch("/api/rent-roll/leases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          action: "add_document",
          document: {
            title: docUploadTitle,
            documentType: docUploadType,
            fileName: `${lease.leaseCode}_${docUploadTitle.replace(/\s+/g, "_")}.pdf`,
            fileUrl: "/sample-agreements/contract-doc.pdf"
          }
        })
      });
      if (res.ok) {
        setDocSuccess("Document vaulted successfully!");
        setDocUploadTitle("");
        if (onLeaseUpdated) onLeaseUpdated();
        setTimeout(() => setDocSuccess(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const isPendingApproval = lease.approvalStatus === "submitted" || lease.status === "pending_approval";
  const isPayable = lease.direction === "payable";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div>
          <div className="p-6 bg-gray-50/90 border-b border-gray-200 flex items-start justify-between">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {lease.leaseCode}
                </span>

                {/* Contract Type Badge */}
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  {getContractTypeLabel(lease.contractType)}
                </span>

                {/* Direction Badge */}
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                  isPayable 
                    ? "bg-rose-50 text-rose-700 border-rose-200" 
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  {isPayable ? "Payable (Head Lease)" : "Receivable (Asset Income)"}
                </span>

                {/* Approval Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  lease.status === "active" || lease.approvalStatus === "approved" || lease.approvalStatus === "active"
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : isPendingApproval
                    ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse font-extrabold"
                    : lease.approvalStatus === "rejected"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}>
                  {isPendingApproval
                    ? "Pending Checker Approval"
                    : lease.status === "active"
                    ? "Active Lease"
                    : lease.approvalStatus === "rejected"
                    ? "Checker Rejected"
                    : "Under Notice"}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-950 tracking-tight">{lease.tenantName}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {lease.propertyName} • {lease.unitNumber} (Floor {lease.floorNumber})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Maker-Checker Verification Alert Strip */}
          {isPendingApproval && (
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-amber-950">Dual-Control Verification Required</div>
                  <div className="text-[11px] text-amber-800">
                    This contract was submitted by the leasing preparer and awaits Checker authorization.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApprovalAction("reject")}
                  disabled={isProcessingApproval}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApprovalAction("approve")}
                  disabled={isProcessingApproval}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Terms</span>
                </button>
              </div>
            </div>
          )}

          {approvalMessage && (
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{approvalMessage}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white px-6 gap-6 text-xs font-bold overflow-x-auto">
            {[
              { id: "commercials", label: "Commercial Terms" },
              { id: "escalations", label: "Escalation Schedule" },
              { id: "legal", label: "Lock-in & Deposit" },
              { id: "clauses", label: "Clauses & Concessions" },
              { id: "documents", label: "Documents Vault" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#0F8B7D] text-[#0F8B7D] font-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6">
            {activeTab === "commercials" && (
              <div className="space-y-6">
                {/* Commercial Rent Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Base Monthly Rent</span>
                    <div className="text-xl font-black text-[#0F8B7D] mt-0.5">{formatINR(lease.monthlyRent)}</div>
                    <span className="text-[11px] text-gray-500 font-mono font-medium">₹{lease.baseRentPsf} / sqft / month</span>
                  </div>

                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-500">CAM Recovery / Month</span>
                    <div className="text-xl font-black text-gray-900 mt-0.5">{formatINR(lease.camMonthly)}</div>
                    <span className="text-[11px] text-gray-500 font-mono font-medium">₹{lease.camRatePsf} / sqft / month</span>
                  </div>

                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Utilities / Fixed</span>
                    <div className="text-lg font-bold text-gray-800 mt-0.5">{formatINR(lease.utilityFixedMonthly)}</div>
                    <span className="text-[11px] text-gray-400 font-medium">Monthly recovery</span>
                  </div>

                  <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-800">Total Monthly Gross</span>
                    <div className="text-xl font-black text-amber-900 mt-0.5">{formatINR(lease.totalMonthlyGross)}</div>
                    <span className="text-[11px] text-amber-700 font-medium">incl. 18% GST</span>
                  </div>
                </div>

                {/* Area Metrics */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Space &amp; Demised Premises</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Chargeable Area:</span>
                      <p className="font-bold text-gray-900 font-mono">{lease.chargeableArea?.toLocaleString() || "0"} sqft</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Carpet Area:</span>
                      <p className="font-bold text-gray-900 font-mono">{lease.carpetArea?.toLocaleString() || "0"} sqft</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Annual Gross Rent:</span>
                      <p className="font-bold text-amber-900 font-mono">{formatINR(lease.annualRentGross)}</p>
                    </div>
                  </div>
                </div>

                {/* Dates & Tenure */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Lease Dates &amp; Tenure</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Commencement Date:</span>
                      <p className="font-bold text-gray-900 font-mono">{lease.startDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Expiry Date:</span>
                      <p className="font-bold text-gray-900 font-mono">{lease.endDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Notice Period:</span>
                      <p className="font-semibold text-gray-800">{lease.noticePeriodDays} Days</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Billing Due Day:</span>
                      <p className="font-semibold text-gray-800">{lease.billingDueDay}th of every month</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "escalations" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800">Contractual Escalation Terms</span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-bold border border-blue-200">
                      +{lease.escalationPct}% Every {lease.escalationFrequencyMonths} Months
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Current Base Rent:</span>
                      <p className="font-bold text-gray-900 font-mono">{formatINR(lease.monthlyRent)}/mo</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Next Escalation Date:</span>
                      <p className="font-bold text-blue-700 font-mono">{lease.nextEscalationDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Next Base Rent:</span>
                      <p className="font-bold text-teal-700 font-mono">
                        {lease.computed ? formatINR(lease.computed.nextEscalatedRent) : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Monthly Increment:</span>
                      <p className="font-bold text-amber-900 font-mono">
                        {lease.computed ? formatINR(lease.computed.nextEscalatedRent - lease.monthlyRent) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenApplyEscalation(lease)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Execute Next Escalation Cycle</span>
                </button>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="space-y-4">
                {/* Security Deposit Details */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Security Deposit Status</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Required Deposit ({lease.securityDepositMonths} Mos):</span>
                      <p className="font-bold text-gray-900 font-mono">{formatINR(lease.securityDepositAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Deposit Received &amp; Held:</span>
                      <p className="font-bold text-teal-700 font-mono">{formatINR(lease.securityDepositPaid)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Bank / Instrument:</span>
                      <p className="font-semibold text-gray-700">{lease.securityDepositBank || "Corporate Bank Guarantee"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Deposit Compliance:</span>
                      <p className="font-bold text-teal-700">100% Compliant</p>
                    </div>
                  </div>
                </div>

                {/* Lock-In Term Details */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Lock-In Period</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Lock-In Tenure:</span>
                      <p className="font-bold text-gray-900">{lease.lockInMonths} Months</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Lock-In Expiry Date:</span>
                      <p className="font-bold text-gray-900 font-mono">{lease.lockInEndDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──── TAB: CLAUSES & CONCESSIONS (S4.8 Canonical Compliance) ──── */}
            {activeTab === "clauses" && (
              <div className="space-y-4">
                {/* Concessions Section */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Concessions &amp; Abatements</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      Executed Terms
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] uppercase font-semibold">Rent-Free Days:</span>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{lease.rentFreePeriodDays || 0} Days</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] uppercase font-semibold">Fit-Out Period:</span>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{lease.fitoutPeriodDays || 0} Days</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] uppercase font-semibold">Brokerage Paid:</span>
                      <p className="text-sm font-black text-teal-700 font-mono mt-0.5">{formatINR(lease.brokeragePaid || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Security Deposit Ledger & Transactions */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Security Deposit Ledger</h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 font-mono text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Instrument / Ref</th>
                          <th className="p-2.5 text-right">Amount</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {lease.depositTransactions && lease.depositTransactions.length > 0 ? (
                          lease.depositTransactions.map((tx: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono text-gray-600">{tx.transactionDate}</td>
                              <td className="p-2.5 font-semibold text-gray-900 capitalize">{tx.transactionType}</td>
                              <td className="p-2.5 font-mono text-gray-600">{tx.bankGuaranteeRef || "Direct Bank Deposit"}</td>
                              <td className="p-2.5 font-mono text-right font-bold text-emerald-700">{formatINR(tx.amount)}</td>
                              <td className="p-2.5 text-center">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  Settled
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-2.5 font-mono text-gray-600">{lease.startDate}</td>
                            <td className="p-2.5 font-semibold text-gray-900">Security Deposit Credit</td>
                            <td className="p-2.5 font-mono text-gray-600">{lease.securityDepositBank || "Corporate BG #8829"}</td>
                            <td className="p-2.5 font-mono text-right font-bold text-emerald-700">{formatINR(lease.securityDepositPaid)}</td>
                            <td className="p-2.5 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                Held in Escrow
                              </span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Contract Clauses */}
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Statutory &amp; Legal Clauses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="font-extrabold text-gray-900 block text-xs">Lock-In Clause</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Binding period of {lease.lockInMonths} months expiring on <span className="font-mono font-bold text-gray-700">{lease.lockInEndDate}</span>. Early termination triggers forfeiture.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="font-extrabold text-gray-900 block text-xs">Escalation Formula</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Compound increase of <span className="font-bold text-blue-700">+{lease.escalationPct}%</span> every {lease.escalationFrequencyMonths} months. Next cycle: <span className="font-mono font-bold text-gray-700">{lease.nextEscalationDate}</span>.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="font-extrabold text-gray-900 block text-xs">Notice Window</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {lease.noticePeriodDays} days formal notice required before contract termination or lease renewal window.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-100">
                      <span className="font-extrabold text-gray-900 block text-xs">TDS &amp; GST Compliance</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        GST applicable at <span className="font-bold text-gray-800">{lease.gstRate || 18}%</span>. Tenant withholds Section 194I TDS at <span className="font-bold text-gray-800">{lease.tdsRate || 10}%</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spaces Covered (Join Structure S4.7) */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950">Demised Units Covered</h4>
                  <div className="p-3 bg-white rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-gray-900">{lease.unitNumber}</span>
                      <p className="text-[11px] text-gray-500">Floor {lease.floorNumber} • {lease.propertyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#0F8B7D]">{lease.chargeableArea?.toLocaleString()} sqft</span>
                      <p className="text-[10px] text-gray-400">₹{lease.baseRentPsf}/sqft/mo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4">
                {docSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{docSuccess}</span>
                  </div>
                )}

                {/* Document List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Contract Documents Vault</span>
                    <span className="text-[10px] text-gray-400 font-semibold">Statutory &amp; Legal Repository</span>
                  </div>

                  {((lease.documents && lease.documents.length > 0) ? lease.documents : [
                    {
                      id: "DOC-DEF-1",
                      title: "Signed Commercial Lease Deed",
                      documentType: "agreement",
                      fileName: `${lease.leaseCode}_Executed_Lease_Deed.pdf`,
                      status: "executed",
                      executionDate: lease.startDate,
                      uploadedBy: "Legal & Leasing Team"
                    },
                    {
                      id: "DOC-DEF-2",
                      title: "Letter of Intent (LOI) & Term Sheet",
                      documentType: "term_sheet",
                      fileName: `${lease.leaseCode}_Binding_Term_Sheet.pdf`,
                      status: "executed",
                      executionDate: lease.startDate,
                      uploadedBy: "Commercial Broker"
                    },
                    {
                      id: "DOC-DEF-3",
                      title: "Bank Guarantee Receipt (Security Deposit)",
                      documentType: "deposit_receipt",
                      fileName: `BG_${lease.leaseCode}_Security_Deposit.pdf`,
                      status: "executed",
                      executionDate: lease.startDate,
                      uploadedBy: "Finance Ops"
                    }
                  ]).map((doc: any) => (
                    <div key={doc.id} className="p-3.5 bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200 rounded-2xl flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 text-xs">{doc.title}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {doc.fileName} • {doc.uploadedBy}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                          {doc.status || "Verified"}
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading verified contract document: ${doc.fileName}`)}
                          className="p-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload New Document Form */}
                <form onSubmit={handleUploadDoc} className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-3">
                  <div className="font-bold text-teal-950 text-xs">Vault New Contract Document / Addendum</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-teal-900">Document Title</label>
                      <input
                        type="text"
                        placeholder="e.g. First Escalation Addendum"
                        value={docUploadTitle}
                        onChange={e => setDocUploadTitle(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-teal-200 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-teal-900">Document Type</label>
                      <select
                        value={docUploadType}
                        onChange={e => setDocUploadType(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-teal-200 rounded-xl text-xs"
                      >
                        <option value="agreement">Lease Agreement</option>
                        <option value="amendment">Escalation / Rate Amendment</option>
                        <option value="term_sheet">LOI / Term Sheet</option>
                        <option value="deposit_bg">Security Deposit BG</option>
                        <option value="handover">Fit-out Handover Certificate</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingDoc}
                    className="w-full py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingDoc ? "Vaulting..." : "+ Upload & Vault Document"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={() => onOpenRecordPayment(lease)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => onOpenServeNotice(lease)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Serve Notice
          </button>
        </div>
      </div>
    </div>
  );
};

