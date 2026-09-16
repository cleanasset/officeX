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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200">Active</span>;
      case "under_notice":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Under Notice</span>;
      case "expired":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Expired</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const getExpiryBadge = (lease: EnrichedLease) => {
    const bucket = lease.computed?.expiryBucket;
    const days = lease.computed?.daysToExpiry || 0;

    if (bucket === "expired") {
      return <span className="text-[11px] font-bold text-rose-600">Expired</span>;
    }
    if (bucket === "critical_30") {
      return <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">Critical ({days}d)</span>;
    }
    if (bucket === "warning_60" || bucket === "approaching_90") {
      return <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">Expires in {days}d</span>;
    }
    return <span className="text-[11px] text-gray-500 font-medium">Normal ({Math.round(days / 365)}y)</span>;
  };

  return (
    <div className="space-y-4">
      {/* Table Action & Information Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
          <span className="font-black text-gray-900">{sortedLeases.length}</span> Master Leases Loaded
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Click any row to open full 360° Commercial Drawer</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span> Active (
            {leases.filter((l) => l.status === "active").length})
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Notice (
            {leases.filter((l) => l.status === "under_notice").length})
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Overdue Arrears (
            {leases.filter((l) => l.totalOutstanding > 0).length})
          </span>
        </div>
      </div>

      {/* ──── MASTER 39-COLUMN TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[680px]">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            {/* Table Header */}
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider sticky top-0 z-20 border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5 sticky left-0 z-30 bg-gray-50 border-r border-gray-200 text-gray-900">
                  Tenant &amp; Trade Name
                </th>
                <th
                  onClick={() => handleSort("leaseCode")}
                  className="p-3.5 hover:text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span>Lease ID</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("propertyName")}
                  className="p-3.5 hover:text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span>Property &amp; Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("chargeableArea")}
                  className="p-3.5 text-right hover:text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Area (Sq Ft)</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("monthlyRent")}
                  className="p-3.5 text-right hover:text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Base Rent / Mo</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("baseRentPsf")}
                  className="p-3.5 text-right hover:text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rent PSF</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="p-3.5 text-right">CAM / Mo</th>
                <th className="p-3.5 text-right">Util / Mo</th>
                <th
                  onClick={() => handleSort("totalMonthlyGross")}
                  className="p-3.5 text-right text-amber-900 font-black hover:text-amber-700 cursor-pointer bg-amber-50/50"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Billing / Mo</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-700" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Deposit (Paid/Req)</th>
                <th className="p-3.5 text-center">Escalation</th>
                <th className="p-3.5 text-center">Next Escalation</th>
                <th className="p-3.5 text-center">Tenure (Start – End)</th>
                <th className="p-3.5 text-center">Lock-In</th>
                <th className="p-3.5 text-right">Outstanding</th>
                <th className="p-3.5 text-center">Expiry Alert</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center sticky right-0 z-30 bg-gray-50 border-l border-gray-200 text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 font-medium">
              {sortedLeases.map((lease) => (
                <tr
                  key={lease.id}
                  onClick={() => onSelectLease(lease)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                >
                  {/* Sticky Tenant Name */}
                  <td className="p-3.5 sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0F8B7D] shrink-0"></div>
                    <div>
                      <div className="font-black text-gray-950">{lease.tenantName}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{lease.tenantId}</div>
                    </div>
                  </td>

                  {/* Lease ID */}
                  <td className="p-3.5 font-mono text-xs text-indigo-700 font-bold">
                    {lease.leaseCode}
                  </td>

                  {/* Property & Space */}
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900">{lease.propertyName}</div>
                    <div className="text-[11px] text-gray-500">{lease.unitNumber} (Flr {lease.floorNumber})</div>
                  </td>

                  {/* Area */}
                  <td className="p-3.5 text-right font-mono text-gray-700 font-semibold">
                    {lease.chargeableArea?.toLocaleString() || "0"}
                    <span className="text-[10px] text-gray-400 block font-normal">Carpet: {lease.carpetArea?.toLocaleString() || "0"}</span>
                  </td>

                  {/* Base Rent */}
                  <td className="p-3.5 text-right font-mono font-bold text-[#0F8B7D]">
                    {formatINR(lease.monthlyRent)}
                  </td>

                  {/* Base Rent PSF */}
                  <td className="p-3.5 text-right font-mono text-gray-700">
                    ₹{lease.baseRentPsf || 0}
                  </td>

                  {/* CAM Monthly */}
                  <td className="p-3.5 text-right font-mono text-gray-700">
                    {formatINR(lease.camMonthly)}
                    <span className="text-[10px] text-gray-400 block font-normal">(₹{lease.camRatePsf || 0} PSF)</span>
                  </td>

                  {/* Utility Monthly */}
                  <td className="p-3.5 text-right font-mono text-gray-500">
                    {formatINR(lease.utilityFixedMonthly)}
                  </td>

                  {/* Total Monthly Gross Billing */}
                  <td className="p-3.5 text-right font-mono font-black text-amber-900 bg-amber-50/40">
                    {formatINR(lease.totalMonthlyGross)}
                    <span className="text-[10px] text-amber-700 block font-normal">incl. 18% GST</span>
                  </td>

                  {/* Security Deposit */}
                  <td className="p-3.5 text-right font-mono text-gray-700">
                    <div className="font-bold text-gray-900">{formatINR(lease.securityDepositPaid)}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      Req: {formatINR(lease.securityDepositAmount || 0)} ({lease.securityDepositMonths || 6}m)
                    </div>
                  </td>

                  {/* Escalation % */}
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[11px] border border-blue-200">
                      +{lease.escalationPct}% / {lease.escalationFrequencyMonths}m
                    </span>
                  </td>

                  {/* Next Escalation Date */}
                  <td className="p-3.5 text-center font-mono text-gray-700 text-[11px]">
                    <div className="font-semibold">{lease.nextEscalationDate}</div>
                    {lease.computed && (
                      <div className="text-[10px] text-teal-700 font-bold">→ {formatINR(lease.computed.nextEscalatedRent)}</div>
                    )}
                  </td>

                  {/* Lease Start - End */}
                  <td className="p-3.5 text-center font-mono text-gray-600 text-[11px]">
                    <div className="font-medium text-gray-900">{lease.startDate}</div>
                    <div className="text-gray-400">to {lease.endDate}</div>
                  </td>

                  {/* Lock-In End Date */}
                  <td className="p-3.5 text-center font-mono text-gray-500 text-[11px]">
                    <div>{lease.lockInEndDate}</div>
                    <div className="text-[10px] text-gray-400 font-normal">({lease.lockInMonths}m lock-in)</div>
                  </td>

                  {/* Outstanding Balance */}
                  <td className="p-3.5 text-right font-mono">
                    {lease.totalOutstanding > 0 ? (
                      <div>
                        <span className="text-rose-600 font-black">{formatINR(lease.totalOutstanding)}</span>
                        <span className="text-[10px] text-rose-500 block font-normal">Overdue Arrears</span>
                      </div>
                    ) : (
                      <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">₹0 Cleared</span>
                    )}
                  </td>

                  {/* Expiry Alert */}
                  <td className="p-3.5 text-center">
                    {getExpiryBadge(lease)}
                  </td>

                  {/* Status */}
                  <td className="p-3.5 text-center">
                    {getStatusBadge(lease.status)}
                  </td>

                  {/* Sticky Right Action Buttons */}
                  <td
                    className="p-3.5 text-center sticky right-0 z-10 bg-white group-hover:bg-gray-50 border-l border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectLease(lease)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                        title="View 360° Lease Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                      </button>

                      <button
                        onClick={() => onOpenApplyEscalation(lease)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                        title="Apply Escalation"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      </button>

                      <button
                        onClick={() => onOpenRecordPayment(lease)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                        title="Record Payment"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      <button
                        onClick={() => onOpenServeNotice(lease)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                        title="Serve Vacation Notice"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
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
