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
  ExternalLink
} from "lucide-react";
import { EnrichedLease } from "./MasterGridTab";
import { formatINR } from "./DashboardTab";

interface LeaseDetailDrawerProps {
  lease: EnrichedLease | null;
  onClose: () => void;
  onOpenApplyEscalation: (lease: EnrichedLease) => void;
  onOpenServeNotice: (lease: EnrichedLease) => void;
  onOpenRecordPayment: (lease: EnrichedLease) => void;
}

export const LeaseDetailDrawer: React.FC<LeaseDetailDrawerProps> = ({
  lease,
  onClose,
  onOpenApplyEscalation,
  onOpenServeNotice,
  onOpenRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<"commercials" | "escalations" | "legal" | "documents">("commercials");
  const [docUploadTitle, setDocUploadTitle] = useState("");
  const [docUploadType, setDocUploadType] = useState("amendment");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState("");

  if (!lease) return null;

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
        setTimeout(() => setDocSuccess(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div>
          <div className="p-6 bg-gray-50/90 border-b border-gray-200 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {lease.leaseCode}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  lease.status === "active"
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : lease.status === "pending_approval"
                    ? "bg-amber-50 text-amber-800 border border-amber-300 animate-pulse"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}>
                  {lease.status === "active" ? "Active Lease" : lease.status === "pending_approval" ? "Pending Checker Approval" : "Under Notice"}
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

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white px-6 gap-6 text-xs font-bold">
            {[
              { id: "commercials", label: "Commercial Terms" },
              { id: "escalations", label: "Escalation Schedule" },
              { id: "legal", label: "Lock-in & Security Deposit" },
              { id: "documents", label: "Documents Vault" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 transition-all cursor-pointer ${
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
