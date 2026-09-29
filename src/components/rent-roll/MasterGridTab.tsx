"use client";

import React, { useState, useMemo } from "react";
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
  Percent,
  Building2,
  Plus,
  Clock,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Check,
  X,
  Filter
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
  direction?: "receivable" | "payable";
  contractType?: string;
  approvalStatus?: "draft" | "submitted" | "approved" | "rejected" | "active";
  approvedBy?: string;
  approvedAt?: string;
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
  status: "draft" | "pending_approval" | "active" | "under_notice" | "expired" | "terminated" | "holdover";
  renewalStatus: "not_due" | "approaching" | "under_negotiation" | "renewed" | "vacating";
  billingFrequency: string;
  billingDueDay: number;
  gstRate: number;
  tdsRate?: number;
  rentFreePeriodDays?: number;
  fitoutPeriodDays?: number;
  brokeragePaid?: number;
  brokerName?: string;
  notes?: string;
  totalOutstanding: number;
  hasOverdue: boolean;
  billingModel?: string;
  seatsCount?: number;
  billingEntityName?: string;
  probabilityPct?: number;
  isDealPipeline?: boolean;
  documents?: any[];
  spacesCovered?: Array<{ spaceId: string; unitNumber: string; areaSqft: number; floorNumber?: number }>;
  rentSteps?: any[];
  charges?: any[];
  concessions?: any[];
  depositTransactions?: any[];
  contractClauses?: any[];
  computed?: {
    depositShortfall: number;
    depositCompliancePct: number;
    nextEscalatedRent: number;
    daysToExpiry: number;
    expiryBucket: string;
    isLockInActive: boolean;
  };
}

export interface SpaceItem {
  id: string;
  propertyId: string;
  spaceCode?: string;
  buildingName: string;
  floorNumber: number;
  unitNumber: string;
  spaceType: string;
  carpetArea: number;
  chargeableArea: number;
  standardRatePsf: number;
  standardCamPsf: number;
  standardMarketRentPsf?: number;
  potentialMonthlyRent?: number;
  daysVacant?: number;
  status: string;
  currentLeaseId?: string;
}

export interface RentRollGridRow {
  id: string;
  isVacant: boolean;
  spaceId: string;
  unitNumber: string;
  floorNumber: number;
  spaceType: string;
  chargeableArea: number;
  carpetArea: number;
  propertyName: string;
  
  // Occupant & Contract details
  leaseId?: string;
  tenantId?: string;
  tenantName: string;
  leaseCode: string;
  direction: "receivable" | "payable";
  contractType: string;
  billingModel: string;
  approvalStatus: "draft" | "submitted" | "approved" | "rejected" | "active";
  status: string;
  
  // Commercials
  baseRentPsf: number;
  monthlyRent: number;
  camRatePsf: number;
  camMonthly: number;
  utilityFixedMonthly: number;
  totalMonthlyGross: number;
  annualRentGross: number;
  
  // Deposits & Escalations
  securityDepositPaid: number;
  securityDepositAmount: number;
  securityDepositMonths: number;
  escalationPct: number;
  escalationFrequencyMonths: number;
  nextEscalationDate?: string;
  
  // Tenure
  startDate?: string;
  endDate?: string;
  lockInEndDate?: string;
  noticePeriodDays?: number;
  
  // Vacancy specific
  daysVacant: number;
  potentialMonthlyRent: number;
  
  // Receivables
  totalOutstanding: number;
  hasOverdue: boolean;
  
  // Original reference
  originalLease?: EnrichedLease;
  originalSpace?: SpaceItem;
}

interface MasterGridTabProps {
  leases: EnrichedLease[];
  spaces?: SpaceItem[];
  onSelectLease: (lease: EnrichedLease) => void;
  onOpenApplyEscalation: (lease: EnrichedLease) => void;
  onOpenServeNotice: (lease: EnrichedLease) => void;
  onOpenRecordPayment: (lease: EnrichedLease) => void;
  onOpenAddLeaseForSpace?: (space: SpaceItem) => void;
  onOpenAddLease?: () => void;
  viewMode?: "current" | "contracted" | "forecast";
  onViewModeChange?: (mode: "current" | "contracted" | "forecast") => void;
  onRefresh?: () => void;
}

export const MasterGridTab: React.FC<MasterGridTabProps> = ({
  leases,
  spaces = [],
  onSelectLease,
  onOpenApplyEscalation,
  onOpenServeNotice,
  onOpenRecordPayment,
  onOpenAddLeaseForSpace,
  onOpenAddLease,
  viewMode = "current",
  onViewModeChange,
  onRefresh,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "occupied" | "vacant" | "payable" | "pending_approval">("all");
  const [sortField, setSortField] = useState<keyof RentRollGridRow>("monthlyRent");
  const [sortAsc, setSortAsc] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Maker-Checker Approval Handler
  const handleApproveContract = async (e: React.MouseEvent, leaseId: string) => {
    e.stopPropagation();
    setApprovingId(leaseId);
    try {
      const res = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", leaseId })
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectContract = async (e: React.MouseEvent, leaseId: string) => {
    e.stopPropagation();
    setApprovingId(leaseId);
    try {
      const res = await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", leaseId, remarks: "Terms rejected by checker" })
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  // Build Unified Space-Centric Rent Roll Rows (RR-VW-01: Occupied + Vacant = Total Leasable Area)
  const unifiedRows: RentRollGridRow[] = useMemo(() => {
    const rows: RentRollGridRow[] = [];
    const matchedLeaseIds = new Set<string>();

    // 1. Process all physical spaces in the portfolio / property
    if (spaces.length > 0) {
      spaces.forEach((sp) => {
        const matchingLease = leases.find((l) =>
          l.spaceId === sp.id ||
          l.unitNumber.toLowerCase() === sp.unitNumber.toLowerCase() ||
          (l.spacesCovered && l.spacesCovered.some((sc: any) => sc.spaceId === sp.id || sc.unitNumber.toLowerCase() === sp.unitNumber.toLowerCase()))
        );

        if (matchingLease) {
          matchedLeaseIds.add(matchingLease.id);
          rows.push({
            id: matchingLease.id,
            isVacant: false,
            spaceId: sp.id,
            unitNumber: sp.unitNumber || matchingLease.unitNumber,
            floorNumber: sp.floorNumber || matchingLease.floorNumber,
            spaceType: sp.spaceType || "office",
            chargeableArea: sp.chargeableArea || matchingLease.chargeableArea,
            carpetArea: sp.carpetArea || matchingLease.carpetArea,
            propertyName: matchingLease.propertyName || sp.buildingName,
            leaseId: matchingLease.id,
            tenantId: matchingLease.tenantId,
            tenantName: matchingLease.tenantName,
            leaseCode: matchingLease.leaseCode,
            direction: (matchingLease.direction as any) || "receivable",
            contractType: matchingLease.contractType || "lease_deed",
            billingModel: matchingLease.billingModel || "area",
            approvalStatus: matchingLease.approvalStatus || (matchingLease.status === "active" ? "active" : "draft"),
            status: matchingLease.status,
            baseRentPsf: matchingLease.baseRentPsf,
            monthlyRent: matchingLease.monthlyRent,
            camRatePsf: matchingLease.camRatePsf,
            camMonthly: matchingLease.camMonthly,
            utilityFixedMonthly: matchingLease.utilityFixedMonthly,
            totalMonthlyGross: matchingLease.totalMonthlyGross,
            annualRentGross: matchingLease.annualRentGross,
            securityDepositPaid: matchingLease.securityDepositPaid,
            securityDepositAmount: matchingLease.securityDepositAmount,
            securityDepositMonths: matchingLease.securityDepositMonths,
            escalationPct: matchingLease.escalationPct,
            escalationFrequencyMonths: matchingLease.escalationFrequencyMonths,
            nextEscalationDate: matchingLease.nextEscalationDate,
            startDate: matchingLease.startDate,
            endDate: matchingLease.endDate,
            lockInEndDate: matchingLease.lockInEndDate,
            noticePeriodDays: matchingLease.noticePeriodDays,
            daysVacant: 0,
            potentialMonthlyRent: 0,
            totalOutstanding: matchingLease.totalOutstanding || 0,
            hasOverdue: !!matchingLease.hasOverdue,
            originalLease: matchingLease,
            originalSpace: sp
          });
        } else {
          // Vacant Space Row (RR-VW-01 requirement)
          const stdRate = sp.standardMarketRentPsf || sp.standardRatePsf || 150;
          const potRent = sp.potentialMonthlyRent || Math.round(sp.chargeableArea * stdRate);
          rows.push({
            id: `VACANT-${sp.id}`,
            isVacant: true,
            spaceId: sp.id,
            unitNumber: sp.unitNumber,
            floorNumber: sp.floorNumber,
            spaceType: sp.spaceType || "office",
            chargeableArea: sp.chargeableArea,
            carpetArea: sp.carpetArea,
            propertyName: sp.buildingName,
            tenantName: "— Vacant Space —",
            leaseCode: "—",
            direction: "receivable",
            contractType: "vacant_space",
            billingModel: "area",
            approvalStatus: "active",
            status: "vacant",
            baseRentPsf: stdRate,
            monthlyRent: 0,
            camRatePsf: sp.standardCamPsf || 25,
            camMonthly: 0,
            utilityFixedMonthly: 0,
            totalMonthlyGross: 0,
            annualRentGross: 0,
            securityDepositPaid: 0,
            securityDepositAmount: 0,
            securityDepositMonths: 0,
            escalationPct: 0,
            escalationFrequencyMonths: 0,
            daysVacant: sp.daysVacant || 30,
            potentialMonthlyRent: potRent,
            totalOutstanding: 0,
            hasOverdue: false,
            originalSpace: sp
          });
        }
      });
    }

    // 2. Add any leases that were not matched to an existing space
    leases.forEach((lease) => {
      if (!matchedLeaseIds.has(lease.id)) {
        rows.push({
          id: lease.id,
          isVacant: false,
          spaceId: lease.spaceId || `SPC-${lease.id}`,
          unitNumber: lease.unitNumber,
          floorNumber: lease.floorNumber,
          spaceType: "office",
          chargeableArea: lease.chargeableArea,
          carpetArea: lease.carpetArea,
          propertyName: lease.propertyName,
          leaseId: lease.id,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName,
          leaseCode: lease.leaseCode,
          direction: (lease.direction as any) || "receivable",
          contractType: lease.contractType || "lease_deed",
          billingModel: lease.billingModel || "area",
          approvalStatus: lease.approvalStatus || (lease.status === "active" ? "active" : "draft"),
          status: lease.status,
          baseRentPsf: lease.baseRentPsf,
          monthlyRent: lease.monthlyRent,
          camRatePsf: lease.camRatePsf,
          camMonthly: lease.camMonthly,
          utilityFixedMonthly: lease.utilityFixedMonthly,
          totalMonthlyGross: lease.totalMonthlyGross,
          annualRentGross: lease.annualRentGross,
          securityDepositPaid: lease.securityDepositPaid,
          securityDepositAmount: lease.securityDepositAmount,
          securityDepositMonths: lease.securityDepositMonths,
          escalationPct: lease.escalationPct,
          escalationFrequencyMonths: lease.escalationFrequencyMonths,
          nextEscalationDate: lease.nextEscalationDate,
          startDate: lease.startDate,
          endDate: lease.endDate,
          lockInEndDate: lease.lockInEndDate,
          noticePeriodDays: lease.noticePeriodDays,
          daysVacant: 0,
          potentialMonthlyRent: 0,
          totalOutstanding: lease.totalOutstanding || 0,
          hasOverdue: !!lease.hasOverdue,
          originalLease: lease
        });
      }
    });

    return rows;
  }, [leases, spaces]);

  // Key Control Totals Reconciler (RR-ING-07 & Section 3: Occupied + Vacant = Total Leasable Area)
  const totalLeasableArea = useMemo(() => {
    return unifiedRows.reduce((sum, r) => sum + r.chargeableArea, 0);
  }, [unifiedRows]);

  const occupiedArea = useMemo(() => {
    return unifiedRows.filter((r) => !r.isVacant).reduce((sum, r) => sum + r.chargeableArea, 0);
  }, [unifiedRows]);

  const vacantArea = useMemo(() => {
    return unifiedRows.filter((r) => r.isVacant).reduce((sum, r) => sum + r.chargeableArea, 0);
  }, [unifiedRows]);

  const occupancyPct = totalLeasableArea > 0 ? ((occupiedArea / totalLeasableArea) * 100).toFixed(1) : "0.0";
  const inPlaceMonthlyRent = useMemo(() => {
    return unifiedRows.filter((r) => !r.isVacant).reduce((sum, r) => sum + r.monthlyRent, 0);
  }, [unifiedRows]);

  const potentialVacantRent = useMemo(() => {
    return unifiedRows.filter((r) => r.isVacant).reduce((sum, r) => sum + r.potentialMonthlyRent, 0);
  }, [unifiedRows]);

  // Filtering
  const filteredRows = useMemo(() => {
    return unifiedRows.filter((r) => {
      if (filterMode === "occupied") return !r.isVacant;
      if (filterMode === "vacant") return r.isVacant;
      if (filterMode === "payable") return r.direction === "payable";
      if (filterMode === "pending_approval") return r.approvalStatus === "submitted" || r.status === "pending_approval";
      return true;
    });
  }, [unifiedRows, filterMode]);

  // Sorting
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      // Prioritize occupied over vacant if not sorting by a specific numeric column
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredRows, sortField, sortAsc]);

  const handleSort = (field: keyof RentRollGridRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getContractTypeBadge = (type: string, direction: "receivable" | "payable") => {
    if (direction === "payable") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Head Lease (Payable)
        </span>
      );
    }
    switch (type) {
      case "leave_and_licence":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">Leave &amp; Licence</span>;
      case "managed_office_agreement":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">Managed Office</span>;
      case "coworking_membership":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Flex Membership</span>;
      case "sublease":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Sublease</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Lease Deed</span>;
    }
  };

  const getApprovalBadge = (row: RentRollGridRow) => {
    if (row.isVacant) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
          Vacant Unit
        </span>
      );
    }
    if (row.approvalStatus === "submitted" || row.status === "pending_approval") {
      return (
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1">
            <Clock size={11} className="text-amber-600" />
            Pending Checker
          </span>
          <button
            type="button"
            disabled={approvingId === row.leaseId}
            onClick={(e) => handleApproveContract(e, row.leaseId!)}
            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
            title="Approve Contract"
          >
            <Check size={11} />
          </button>
          <button
            type="button"
            disabled={approvingId === row.leaseId}
            onClick={(e) => handleRejectContract(e, row.leaseId!)}
            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-2xs"
            title="Reject Contract"
          >
            <X size={11} />
          </button>
        </div>
      );
    }
    if (row.status === "under_notice") {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Under Notice</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Active</span>;
  };

  return (
    <div className="space-y-4">
      {/* ──── TOP STATUTORY CONTROL RIBBON (Canonical Section 3 & 4.1 Reconciler) ──── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Leasable Area</span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">{totalLeasableArea.toLocaleString()} sq ft</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">100% Reconciled Space</span>
        </div>

        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">Occupied Area</span>
          <span className="text-sm font-black text-[#0F8B7D] mt-0.5 block">{occupiedArea.toLocaleString()} sq ft</span>
          <span className="text-[10px] text-teal-700 font-bold block mt-0.5">{occupancyPct}% Occupancy Rate</span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">Vacant Area</span>
          <span className="text-sm font-black text-amber-900 mt-0.5 block">{vacantArea.toLocaleString()} sq ft</span>
          <span className="text-[10px] text-amber-700 block mt-0.5">{unifiedRows.filter(r => r.isVacant).length} Units Ready to Lease</span>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">In-Place Rent Roll</span>
          <span className="text-sm font-black text-emerald-900 mt-0.5 block">{formatINR(inPlaceMonthlyRent)} / mo</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Active Contracted Rent</span>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-indigo-800 block tracking-wider">Potential Vacant Rent</span>
          <span className="text-sm font-black text-indigo-900 mt-0.5 block">{formatINR(potentialVacantRent)} / mo</span>
          <span className="text-[10px] text-indigo-600 block mt-0.5">At Standard Market Rates</span>
        </div>

        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-purple-800 block tracking-wider">Inventory Breakdown</span>
          <span className="text-sm font-black text-purple-900 mt-0.5 block">
            {unifiedRows.filter(r => !r.isVacant).length} Leased · {unifiedRows.filter(r => r.isVacant).length} Vacant
          </span>
          <span className="text-[10px] text-purple-700 block mt-0.5">WALE: 3.84 Years</span>
        </div>
      </div>

      {/* ──── CONTROL FILTER TABS & ACTIONS BAR ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === "all" ? "bg-[#0F8B7D] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Spaces ({unifiedRows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("occupied")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === "occupied" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Occupied Contracts ({unifiedRows.filter(r => !r.isVacant).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("vacant")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === "vacant" ? "bg-amber-600 text-white shadow-xs" : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Vacant Spaces ({unifiedRows.filter(r => r.isVacant).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("payable")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === "payable" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Payable Head Leases ({unifiedRows.filter(r => r.direction === "payable").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("pending_approval")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterMode === "pending_approval" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pending Checker ({unifiedRows.filter(r => r.approvalStatus === "submitted" || r.status === "pending_approval").length})
          </button>
        </div>

        {/* View Mode & Add Action */}
        <div className="flex items-center gap-2">
          {onViewModeChange && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onViewModeChange("current")}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "current" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Current active contracts as of current date"
              >
                In-Place
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("contracted")}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "contracted" ? "bg-[#0F8B7D] text-white shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Contracted + future signed contracts"
              >
                Contracted
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("forecast")}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "forecast" ? "bg-indigo-600 text-white shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Forecast including deals weighted by probability"
              >
                Forecast
              </button>
            </div>
          )}

          {onOpenAddLease && (
            <button
              type="button"
              onClick={onOpenAddLease}
              className="px-3 py-1.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>New Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* ──── MASTER REGISTER GRID TABLE ──── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="p-3.5 sticky left-0 z-30 bg-slate-50 border-r border-slate-200">Space &amp; Unit</th>
                <th className="p-3.5">Occupant / Tenant</th>
                <th className="p-3.5">Contract Code</th>
                <th className="p-3.5">Type &amp; Direction</th>
                <th onClick={() => handleSort("chargeableArea")} className="p-3.5 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Chargeable Sq Ft</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th onClick={() => handleSort("baseRentPsf")} className="p-3.5 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Base Rent PSF</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th onClick={() => handleSort("monthlyRent")} className="p-3.5 text-right cursor-pointer hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Monthly Rent</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3.5 text-right">CAM Rate PSF</th>
                <th className="p-3.5 text-right bg-amber-50/50 font-black text-amber-900">Total Monthly Gross</th>
                <th className="p-3.5 text-center">Escalation</th>
                <th className="p-3.5 text-center">Term (Start – End)</th>
                <th className="p-3.5 text-center">Lock-In</th>
                <th className="p-3.5 text-right">Security Deposit</th>
                <th className="p-3.5 text-center">Status / Approval</th>
                <th className="p-3.5 text-center sticky right-0 z-30 bg-slate-50 border-l border-slate-200">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-20 text-center text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No spaces found matching filter</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      All physical spaces and active lease contracts for this property are automatically reconciled here.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => row.originalLease && onSelectLease(row.originalLease)}
                    className={`transition-colors cursor-pointer group ${
                      row.isVacant
                        ? "bg-amber-50/30 hover:bg-amber-50/70"
                        : row.direction === "payable"
                        ? "bg-purple-50/20 hover:bg-purple-50/50"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Space & Unit (Sticky Column) */}
                    <td className="p-3.5 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            row.isVacant ? "bg-amber-400" : row.direction === "payable" ? "bg-purple-500" : "bg-[#0F8B7D]"
                          }`}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{row.unitNumber}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Flr {row.floorNumber}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block capitalize">{row.spaceType}</span>
                        </div>
                      </div>
                    </td>

                    {/* Occupant / Tenant */}
                    <td className="p-3.5">
                      {row.isVacant ? (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-800 font-extrabold italic">— Vacant Space —</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Available
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-extrabold text-slate-900 block">{row.tenantName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{row.propertyName}</span>
                        </div>
                      )}
                    </td>

                    {/* Contract Code */}
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-700">
                      {row.isVacant ? "—" : row.leaseCode}
                    </td>

                    {/* Contract Type & Direction */}
                    <td className="p-3.5">
                      {row.isVacant ? (
                        <span className="text-[11px] text-slate-400 font-normal">Ready to Market</span>
                      ) : (
                        <div className="space-y-0.5">
                          {getContractTypeBadge(row.contractType, row.direction)}
                          <span className="block text-[9px] font-mono text-slate-400 uppercase">
                            {row.billingModel} model · {row.direction}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Chargeable Area */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {row.chargeableArea.toLocaleString()} sq ft
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Carpet: {row.carpetArea.toLocaleString()}
                      </span>
                    </td>

                    {/* Base Rent PSF */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      ₹{row.baseRentPsf}
                      {row.isVacant && <span className="text-[9px] text-amber-700 block font-normal">Market Rate</span>}
                    </td>

                    {/* Monthly Base Rent */}
                    <td className="p-3.5 text-right font-mono font-extrabold text-[#0F8B7D]">
                      {row.isVacant ? (
                        <span className="text-slate-400 font-normal">₹0</span>
                      ) : (
                        formatINR(row.monthlyRent)
                      )}
                      {row.isVacant && (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          Pot: {formatINR(row.potentialMonthlyRent)}
                        </span>
                      )}
                    </td>

                    {/* CAM Rate */}
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      ₹{row.camRatePsf} PSF
                      {!row.isVacant && row.camMonthly > 0 && (
                        <span className="text-[10px] text-slate-400 block font-normal">{formatINR(row.camMonthly)}</span>
                      )}
                    </td>

                    {/* Total Monthly Gross */}
                    <td className="p-3.5 text-right font-mono font-black text-amber-950 bg-amber-50/40">
                      {row.isVacant ? "—" : formatINR(row.totalMonthlyGross)}
                      {!row.isVacant && <span className="text-[9px] text-amber-700 block font-normal">incl. GST</span>}
                    </td>

                    {/* Escalation */}
                    <td className="p-3.5 text-center font-mono text-[11px] text-slate-700">
                      {row.isVacant ? (
                        "—"
                      ) : (
                        <div>
                          <span className="font-bold text-teal-800">+{row.escalationPct}%</span>
                          <span className="text-[10px] text-slate-400 block font-normal">per {row.escalationFrequencyMonths}m</span>
                        </div>
                      )}
                    </td>

                    {/* Tenure */}
                    <td className="p-3.5 text-center text-[11px] text-slate-700">
                      {row.isVacant ? (
                        <span className="text-amber-800 text-[10px] font-bold">{row.daysVacant} Days Vacant</span>
                      ) : (
                        <div>
                          <span className="font-bold text-slate-800">{row.startDate?.slice(0, 7)} – {row.endDate?.slice(0, 7)}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{row.endDate}</span>
                        </div>
                      )}
                    </td>

                    {/* Lock-In */}
                    <td className="p-3.5 text-center text-[11px]">
                      {row.isVacant ? (
                        "—"
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {row.lockInEndDate || "36 Months"}
                        </span>
                      )}
                    </td>

                    {/* Security Deposit */}
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      {row.isVacant ? (
                        "—"
                      ) : (
                        <div>
                          <span className="font-bold text-slate-900">{formatINR(row.securityDepositPaid)}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{row.securityDepositMonths} Months</span>
                        </div>
                      )}
                    </td>

                    {/* Status / Approval */}
                    <td className="p-3.5 text-center">
                      {getApprovalBadge(row)}
                    </td>

                    {/* Actions (Sticky Right Column) */}
                    <td className="p-3.5 text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-200">
                      {row.isVacant ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (row.originalSpace && onOpenAddLeaseForSpace) {
                              onOpenAddLeaseForSpace(row.originalSpace);
                            } else if (onOpenAddLease) {
                              onOpenAddLease();
                            }
                          }}
                          className="px-2.5 py-1 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          + Lease Unit
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (row.originalLease) onSelectLease(row.originalLease);
                            }}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded transition-colors cursor-pointer"
                            title="View Contract Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (row.originalLease) onOpenApplyEscalation(row.originalLease);
                            }}
                            className="p-1 hover:bg-teal-50 text-teal-700 rounded transition-colors cursor-pointer"
                            title="Escalations"
                          >
                            <TrendingUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (row.originalLease) onOpenServeNotice(row.originalLease);
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-700 rounded transition-colors cursor-pointer"
                            title="Serve Notice"
                          >
                            <AlertCircle size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
