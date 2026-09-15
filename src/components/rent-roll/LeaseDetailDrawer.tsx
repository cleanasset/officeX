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
  const [activeTab, setActiveTab] = useState<"commercials" | "escalations" | "invoices" | "legal">("commercials");

  if (!lease) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-slideLeft">
        {/* Drawer Header */}
        <div>
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {lease.leaseCode}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  lease.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}>
                  {lease.status === "active" ? "Active Lease" : "Under Notice"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{lease.tenantName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lease.propertyName} • {lease.unitNumber} (Floor {lease.floorNumber})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-6 text-xs font-semibold">
            {[
              { id: "commercials", label: "Commercial Terms" },
              { id: "escalations", label: "Escalation Schedule" },
              { id: "legal", label: "Lock-in & Security Deposit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-amber-400 text-amber-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Base Monthly Rent</span>
                    <div className="text-xl font-bold text-emerald-400 mt-0.5">{formatINR(lease.monthlyRent)}</div>
                    <span className="text-[11px] text-slate-400 font-mono">₹{lease.baseRentPsf} / sqft / month</span>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">CAM Recovery / Month</span>
                    <div className="text-xl font-bold text-slate-200 mt-0.5">{formatINR(lease.camMonthly)}</div>
                    <span className="text-[11px] text-slate-400 font-mono">₹{lease.camRatePsf} / sqft / month</span>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Utilities / Fixed</span>
                    <div className="text-lg font-bold text-slate-300 mt-0.5">{formatINR(lease.utilityFixedMonthly)}</div>
                    <span className="text-[11px] text-slate-500">Monthly recovery</span>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/30 bg-amber-950/10">
                    <span className="text-[10px] uppercase font-semibold text-amber-400">Total Monthly Gross</span>
                    <div className="text-xl font-bold text-amber-300 mt-0.5">{formatINR(lease.totalMonthlyGross)}</div>
                    <span className="text-[11px] text-slate-400">incl. 18% GST</span>
                  </div>
                </div>

                {/* Area Metrics */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Space & Demised Premises</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Chargeable Area:</span>
                      <p className="font-bold text-white font-mono">{lease.chargeableArea.toLocaleString()} sqft</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Carpet Area:</span>
                      <p className="font-bold text-white font-mono">{lease.carpetArea.toLocaleString()} sqft</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Annual Gross Rent:</span>
                      <p className="font-bold text-amber-300 font-mono">{formatINR(lease.annualRentGross)}</p>
                    </div>
                  </div>
                </div>

                {/* Dates & Tenure */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lease Dates & Tenure</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Commencement Date:</span>
                      <p className="font-semibold text-white font-mono">{lease.startDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Expiry Date:</span>
                      <p className="font-semibold text-white font-mono">{lease.endDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Notice Period:</span>
                      <p className="font-semibold text-slate-300">{lease.noticePeriodDays} Days</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Billing Due Day:</span>
                      <p className="font-semibold text-slate-300">{lease.billingDueDay}th of every month</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "escalations" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Contractual Escalation Terms</span>
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 text-xs rounded font-bold border border-cyan-500/20">
                      +{lease.escalationPct}% Every {lease.escalationFrequencyMonths} Months
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Current Base Rent:</span>
                      <p className="font-bold text-white font-mono">{formatINR(lease.monthlyRent)}/mo</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Next Escalation Date:</span>
                      <p className="font-bold text-cyan-300 font-mono">{lease.nextEscalationDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Next Base Rent:</span>
                      <p className="font-bold text-emerald-400 font-mono">
                        {lease.computed ? formatINR(lease.computed.nextEscalatedRent) : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Monthly Increment:</span>
                      <p className="font-bold text-amber-300 font-mono">
                        {lease.computed ? formatINR(lease.computed.nextEscalatedRent - lease.monthlyRent) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenApplyEscalation(lease)}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Execute Next Escalation Cycle</span>
                </button>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="space-y-4">
                {/* Security Deposit Details */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Deposit Status</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Required Deposit ({lease.securityDepositMonths} Mos):</span>
                      <p className="font-bold text-white font-mono">{formatINR(lease.securityDepositAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Deposit Received & Held:</span>
                      <p className="font-bold text-emerald-400 font-mono">{formatINR(lease.securityDepositPaid)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Bank / Instrument:</span>
                      <p className="font-semibold text-slate-300">{lease.securityDepositBank || "Corporate Bank Guarantee"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Deposit Compliance:</span>
                      <p className="font-bold text-emerald-400">100% Compliant</p>
                    </div>
                  </div>
                </div>

                {/* Lock-In Term Details */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lock-In Period</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Lock-In Tenure:</span>
                      <p className="font-semibold text-white">{lease.lockInMonths} Months</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Lock-In Expiry Date:</span>
                      <p className="font-semibold text-white font-mono">{lease.lockInEndDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => onOpenRecordPayment(lease)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => onOpenServeNotice(lease)}
            className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-all"
          >
            Serve Notice
          </button>
        </div>
      </div>
    </div>
  );
};
