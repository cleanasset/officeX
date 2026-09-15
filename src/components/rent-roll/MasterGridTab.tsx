"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  MoreHorizontal,
  Sparkles,
  Calendar,
  Layers,
  Percent
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface EnrichedLease {
  id: string;
  propertyId: string;
  propertyName: string;
  spaceId: string;
  unitNumber: string;
  floorNumber: number;
  tenantId: string;
  tenantName: string;
  leaseCode: string;
  startDate: string;
  endDate: string;
  carpetArea: number;
  chargeableArea: number;
  monthlyRent: number;
  baseRentPsf: number;
  camRatePsf: number;
  camMonthly: number;
  utilityFixedMonthly: number;
  parkingChargesMonthly: number;
  signageChargesMonthly: number;
  otherChargesMonthly: number;
  totalMonthlyGross: number;
  annualRentGross: number;
  securityDepositMonths: number;
  securityDepositAmount: number;
  securityDepositPaid: number;
  securityDepositBank?: string;
  escalationPct: number;
  escalationFrequencyMonths: number;
  nextEscalationDate: string;
  lockInMonths: number;
  lockInEndDate: string;
  noticePeriodDays: number;
  status: "draft" | "active" | "under_notice" | "expired" | "terminated" | "holdover";
  renewalStatus: "not_due" | "approaching" | "under_negotiation" | "renewed" | "vacating";
  billingFrequency: string;
  billingDueDay: number;
  gstRate: number;
  brokerName?: string;
  notes?: string;
  totalOutstanding: number;
  hasOverdue: boolean;
  computed?: {
    depositShortfall: number;
    depositCompliancePct: number;
    nextEscalatedRent: number;
    daysToExpiry: number;
    expiryBucket: string;
    isLockInActive: boolean;
  };
}

interface MasterGridTabProps {
  leases: EnrichedLease[];
  onSelectLease: (lease: EnrichedLease) => void;
  onOpenApplyEscalation: (lease: EnrichedLease) => void;
  onOpenServeNotice: (lease: EnrichedLease) => void;
  onOpenRecordPayment: (lease: EnrichedLease) => void;
}

export const MasterGridTab: React.FC<MasterGridTabProps> = ({
  leases,
  onSelectLease,
  onOpenApplyEscalation,
  onOpenServeNotice,
  onOpenRecordPayment,
}) => {
  const [sortField, setSortField] = useState<keyof EnrichedLease>("monthlyRent");
  const [sortAsc, setSortAsc] = useState(false);
  const [activeMenuLeaseId, setActiveMenuLeaseId] = useState<string | null>(null);

  const handleSort = (field: keyof EnrichedLease) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedLeases = [...leases].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    if (typeof valA === "string" && typeof valB === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Active</span>;
      case "under_notice":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">Under Notice</span>;
      case "expired":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">Expired</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">{status}</span>;
    }
  };

  const getExpiryBadge = (lease: EnrichedLease) => {
    const bucket = lease.computed?.expiryBucket;
    const days = lease.computed?.daysToExpiry || 0;

    if (bucket === "expired") {
      return <span className="text-[11px] font-bold text-red-400">Expired</span>;
    }
    if (bucket === "critical_30") {
      return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold text-[11px] border border-red-500/40">Critical ({days}d)</span>;
    }
    if (bucket === "warning_60" || bucket === "approaching_90") {
      return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/40">Expires in {days}d</span>;
    }
    return <span className="text-[11px] text-slate-400 font-medium">Normal ({Math.round(days / 365)}y)</span>;
  };

  return (
    <div className="space-y-4">
      {/* Table Action & Information Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-white">{sortedLeases.length}</span> Master Leases Loaded
          <span className="text-slate-600">|</span>
          <span>Click any row to open full 360° Commercial Drawer</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active (
            {leases.filter((l) => l.status === "active").length})
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Notice (
            {leases.filter((l) => l.status === "under_notice").length})
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Overdue Arrears (
            {leases.filter((l) => l.totalOutstanding > 0).length})
          </span>
        </div>
      </div>

      {/* ──── MASTER 39-COLUMN TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[680px]">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            {/* Table Header */}
            <thead className="bg-slate-950/90 text-slate-400 font-semibold tracking-wider sticky top-0 z-20 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-slate-950 border-r border-slate-800">
                  Tenant & Trade Name
                </th>
                <th
                  onClick={() => handleSort("leaseCode")}
                  className="p-3 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span>Lease ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("propertyName")}
                  className="p-3 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span>Property & Unit</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("chargeableArea")}
                  className="p-3 text-right hover:text-white cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Area (Sq Ft)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("monthlyRent")}
                  className="p-3 text-right hover:text-white cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Base Rent / Mo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("baseRentPsf")}
                  className="p-3 text-right hover:text-white cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rent PSF</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-right">CAM / Mo</th>
                <th className="p-3 text-right">Util / Mo</th>
                <th
                  onClick={() => handleSort("totalMonthlyGross")}
                  className="p-3 text-right text-amber-300 font-bold hover:text-amber-200 cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Billing / Mo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-right">Deposit (Paid/Req)</th>
                <th className="p-3 text-center">Escalation</th>
                <th className="p-3 text-center">Next Escalation</th>
                <th className="p-3 text-center">Tenure (Start – End)</th>
                <th className="p-3 text-center">Lock-In</th>
                <th className="p-3 text-right">Outstanding</th>
                <th className="p-3 text-center">Expiry Alert</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center sticky right-0 z-30 bg-slate-950 border-l border-slate-800">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sortedLeases.map((lease) => (
                <tr
                  key={lease.id}
                  onClick={() => onSelectLease(lease)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  {/* Sticky Tenant Name */}
                  <td className="p-3 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-850 border-r border-slate-800 font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div>
                      <div>{lease.tenantName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{lease.tenantId}</div>
                    </div>
                  </td>

                  {/* Lease ID */}
                  <td className="p-3 font-mono text-xs text-amber-400 font-semibold">
                    {lease.leaseCode}
                  </td>

                  {/* Property & Space */}
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{lease.propertyName}</div>
                    <div className="text-[11px] text-slate-500">{lease.unitNumber} (Flr {lease.floorNumber})</div>
                  </td>

                  {/* Area */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    {lease.chargeableArea.toLocaleString()}
                    <span className="text-[10px] text-slate-500 block">Carpet: {lease.carpetArea.toLocaleString()}</span>
                  </td>

                  {/* Base Rent */}
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    {formatINR(lease.monthlyRent)}
                  </td>

                  {/* Base Rent PSF */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    ₹{lease.baseRentPsf}
                  </td>

                  {/* CAM Monthly */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(lease.camMonthly)}
                    <span className="text-[10px] text-slate-500 block">(₹{lease.camRatePsf} PSF)</span>
                  </td>

                  {/* Utility Monthly */}
                  <td className="p-3 text-right font-mono text-slate-400">
                    {formatINR(lease.utilityFixedMonthly)}
                  </td>

                  {/* Total Monthly Gross Billing */}
                  <td className="p-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10">
                    {formatINR(lease.totalMonthlyGross)}
                    <span className="text-[10px] text-slate-500 block">incl. 18% GST</span>
                  </td>

                  {/* Security Deposit */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    <div>{formatINR(lease.securityDepositPaid)}</div>
                    <div className="text-[10px] text-slate-500">
                      Req: {formatINR(lease.securityDepositAmount)} ({lease.securityDepositMonths}m)
                    </div>
                  </td>

                  {/* Escalation % */}
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded font-semibold text-[11px] border border-cyan-500/20">
                      +{lease.escalationPct}% / {lease.escalationFrequencyMonths}m
                    </span>
                  </td>

                  {/* Next Escalation Date */}
                  <td className="p-3 text-center font-mono text-slate-300 text-[11px]">
                    <div>{lease.nextEscalationDate}</div>
                    {lease.computed && (
                      <div className="text-[10px] text-emerald-400">→ {formatINR(lease.computed.nextEscalatedRent)}</div>
                    )}
                  </td>

                  {/* Lease Start - End */}
                  <td className="p-3 text-center font-mono text-slate-300 text-[11px]">
                    <div>{lease.startDate}</div>
                    <div className="text-slate-500">to {lease.endDate}</div>
                  </td>

                  {/* Lock-In End Date */}
                  <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                    <div>{lease.lockInEndDate}</div>
                    <div className="text-[10px] text-slate-500">({lease.lockInMonths}m lock-in)</div>
                  </td>

                  {/* Outstanding Balance */}
                  <td className="p-3 text-right font-mono">
                    {lease.totalOutstanding > 0 ? (
                      <div>
                        <span className="text-red-400 font-bold">{formatINR(lease.totalOutstanding)}</span>
                        <span className="text-[10px] text-red-500 block">Overdue Arrears</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-semibold">₹0 Cleared</span>
                    )}
                  </td>

                  {/* Expiry Alert */}
                  <td className="p-3 text-center">
                    {getExpiryBadge(lease)}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    {getStatusBadge(lease.status)}
                  </td>

                  {/* Sticky Right Action Buttons */}
                  <td
                    className="p-3 text-center sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-850 border-l border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectLease(lease)}
                        className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="View 360° Lease Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        onClick={() => onOpenApplyEscalation(lease)}
                        className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="Apply Escalation"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        onClick={() => onOpenRecordPayment(lease)}
                        className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="Record Payment"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => onOpenServeNotice(lease)}
                        className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="Serve Vacation Notice"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
