"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Filter,
  SlidersHorizontal,
  Bookmark,
  CheckSquare,
  Square,
  FileSpreadsheet
} from "lucide-react";
import { formatINR } from "./DashboardTab";

// RR-VW-05: Saved View Presets & Column Configurations
export interface SavedViewConfig {
  id: string;
  name: string;
  description: string;
  visibleColumns: string[];
  defaultFilter: "all" | "occupied" | "vacant" | "payable" | "pending_approval";
}

export const SAVED_VIEWS: SavedViewConfig[] = [
  {
    id: "all",
    name: "Executive Clean View",
    description: "Streamlined baseline showing core unit, occupant, rent and commercial status without clutter",
    visibleColumns: ["unit", "tenant", "area", "ratePsf", "rent", "cam", "gross", "status", "actions"],
    defaultFilter: "all"
  },
  {
    id: "financial",
    name: "Financial & Commercial Terms",
    description: "Focused view on Base Rent PSF, monthly gross, security deposits & escalations",
    visibleColumns: ["unit", "tenant", "area", "ratePsf", "rent", "cam", "gross", "deposit", "escalation", "status", "actions"],
    defaultFilter: "all"
  },
  {
    id: "statutory",
    name: "Statutory & Tax Compliance",
    description: "Audit view displaying contract codes, agreement status, lock-in & maker-checker sign-off",
    visibleColumns: ["unit", "tenant", "code", "type", "area", "lockIn", "deposit", "status", "actions"],
    defaultFilter: "all"
  },
  {
    id: "flex",
    name: "Flex & Coworking Seats",
    description: "Turnkey office cabins, seats capacity, and flex billing basis",
    visibleColumns: ["unit", "tenant", "type", "area", "ratePsf", "rent", "gross", "status", "actions"],
    defaultFilter: "occupied"
  },
  {
    id: "comprehensive",
    name: "Full Ledger (All 15 Columns)",
    description: "Complete uncompressed spreadsheet showing all 15 parameters with horizontal scroll",
    visibleColumns: ["unit", "tenant", "code", "type", "area", "ratePsf", "rent", "cam", "gross", "escalation", "tenure", "lockIn", "deposit", "status", "actions"],
    defaultFilter: "all"
  }
];

export const ALL_COLUMNS = [
  { id: "tenant", label: "Occupant / Tenant" },
  { id: "code", label: "Contract Code" },
  { id: "type", label: "Type & Direction" },
  { id: "area", label: "Chargeable Area" },
  { id: "ratePsf", label: "Base Rent PSF" },
  { id: "rent", label: "Monthly Base Rent" },
  { id: "cam", label: "CAM Rate PSF" },
  { id: "gross", label: "Total Monthly Gross" },
  { id: "escalation", label: "Escalation %" },
  { id: "tenure", label: "Term (Start – End)" },
  { id: "lockIn", label: "Lock-In Period" },
  { id: "deposit", label: "Security Deposit" },
  { id: "status", label: "Status / Approval" }
];

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
  lockInMonths?: number;
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof RentRollGridRow>("monthlyRent");
  const [sortAsc, setSortAsc] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // RR-VW-05: Saved Views & Column Chooser Persistence
  const DEFAULT_CLEAN_COLUMNS = useMemo(() => ["unit", "tenant", "area", "ratePsf", "rent", "cam", "gross", "status", "actions"], []);
  const [activeSavedView, setActiveSavedView] = useState<string>("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["unit", "tenant", "area", "ratePsf", "rent", "cam", "gross", "status", "actions"])
  );
  const [showColumnChooser, setShowColumnChooser] = useState<boolean>(false);
  const [showSavedViewsMenu, setShowSavedViewsMenu] = useState<boolean>(false);
  const [mobileLayout, setMobileLayout] = useState<"cards" | "table">("cards");

  useEffect(() => {
    try {
      const savedViewId = localStorage.getItem("officex_rentroll_saved_view");
      if (savedViewId && savedViewId !== "all") {
        const found = SAVED_VIEWS.find((v) => v.id === savedViewId);
        if (found) {
          setActiveSavedView(found.id);
          setVisibleColumns(new Set(found.visibleColumns));
          setFilterMode(found.defaultFilter);
          return;
        }
      }
      const savedCols = localStorage.getItem("officex_rentroll_columns");
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        // Only load if it's a customized selection, not the old 15-column bloat
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length < 13) {
          setVisibleColumns(new Set(parsed));
          return;
        }
      }
      setVisibleColumns(new Set(DEFAULT_CLEAN_COLUMNS));
    } catch (e) {
      console.error("Failed to load saved views", e);
    }
  }, [DEFAULT_CLEAN_COLUMNS]);

  const handleSelectSavedView = (view: SavedViewConfig) => {
    setActiveSavedView(view.id);
    setVisibleColumns(new Set(view.visibleColumns));
    setFilterMode(view.defaultFilter);
    setShowSavedViewsMenu(false);
    try {
      localStorage.setItem("officex_rentroll_saved_view", view.id);
      localStorage.setItem("officex_rentroll_columns", JSON.stringify(view.visibleColumns));
    } catch (e) {}
  };

  const handleToggleColumn = (colId: string) => {
    const updated = new Set(visibleColumns);
    if (updated.has(colId)) {
      if (updated.size > 2) updated.delete(colId);
    } else {
      updated.add(colId);
    }
    setVisibleColumns(updated);
    try {
      localStorage.setItem("officex_rentroll_columns", JSON.stringify(Array.from(updated)));
    } catch (e) {}
  };

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
      // Search filter (RR-VW-04)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          r.unitNumber.toLowerCase().includes(q) ||
          r.tenantName.toLowerCase().includes(q) ||
          r.leaseCode.toLowerCase().includes(q) ||
          r.propertyName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterMode === "occupied") return !r.isVacant;
      if (filterMode === "vacant") return r.isVacant;
      if (filterMode === "payable") return r.direction === "payable";
      if (filterMode === "pending_approval") return r.approvalStatus === "submitted" || r.status === "pending_approval";
      return true;
    });
  }, [unifiedRows, filterMode, searchTerm]);

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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Vacant Unit
        </span>
      );
    }
    const isPending = row.approvalStatus === "submitted" || row.status === "pending_approval" || (row.originalLease as any)?.isTermsPending;
    if (isPending) {
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1" title="Lease details skipped during property setup. Pending tenant onboarding & terms confirmation.">
            <Clock size={11} className="text-amber-600" />
            Terms Incomplete (Invite Pending)
          </span>
          <button
            type="button"
            disabled={approvingId === row.leaseId}
            onClick={(e) => handleApproveContract(e, row.leaseId!)}
            className="p-1 rounded bg-teal-700 text-white hover:bg-teal-800 cursor-pointer shadow-2xs"
            title="Confirm & Activate Contract Terms"
          >
            <Check size={11} />
          </button>
        </div>
      );
    }
    if (row.status === "under_notice") {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Under Notice</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">● Active &amp; Live</span>;
  };

  if (unifiedRows.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-teal-50 text-[#0F8B7D] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-2xs">
          <Building2 size={32} />
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">No Properties or Spaces Registered</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Your rent roll portfolio is completely clean. Register your commercial office space or building to activate demised inventory, escalations, and automated tenant billing.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <a
            href="/properties/add"
            className="px-4 py-2.5 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Commercial Property</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Leasable Area</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">{totalLeasableArea.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">sqft</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Occupied</p>
          <p className="text-lg font-black text-teal-700 tracking-tight">{occupiedArea.toLocaleString()} <span className="text-[10px] font-semibold text-teal-600">({occupancyPct}%)</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vacant</p>
          <p className="text-lg font-black text-amber-800 tracking-tight">{vacantArea.toLocaleString()} <span className="text-[10px] font-normal text-amber-600">sqft</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">In-Place Rent</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">{formatINR(inPlaceMonthlyRent)} <span className="text-[10px] font-normal text-slate-400">/mo</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Potential Rent</p>
          <p className="text-lg font-black text-slate-700 tracking-tight">{formatINR(potentialVacantRent)} <span className="text-[10px] font-normal text-slate-400">/mo</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inventory</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">{unifiedRows.filter(r => !r.isVacant).length} <span className="text-[10px] font-semibold text-teal-600">Leased</span> · {unifiedRows.filter(r => r.isVacant).length} <span className="text-[10px] font-semibold text-amber-600">Vacant</span></p>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Row 1: Filter Tabs + View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {[
              { key: "all", label: "All", count: unifiedRows.length },
              { key: "occupied", label: "Occupied", count: unifiedRows.filter(r => !r.isVacant).length },
              { key: "vacant", label: "Vacant", count: unifiedRows.filter(r => r.isVacant).length },
              { key: "payable", label: "Payable", count: unifiedRows.filter(r => r.direction === "payable").length },
              { key: "pending_approval", label: "Pending", count: unifiedRows.filter(r => r.approvalStatus === "submitted" || r.status === "pending_approval").length }
            ].map(tab => {
              const isActive = filterMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterMode(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (In-Place, Contracted, Forecast) */}
          {onViewModeChange && (
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onViewModeChange("current")}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "current" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Current active contracts as of current date"
              >
                In-Place
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("contracted")}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "contracted" ? "bg-[#0F8B7D] text-white shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Contracted + future signed contracts"
              >
                Contracted
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("forecast")}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  viewMode === "forecast" ? "bg-indigo-600 text-white shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Forecast including deals weighted by probability"
              >
                Forecast
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Search Input & View Configuration Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search spaces, tenants, or contract codes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F8B7D] focus:bg-white transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Table Tools (Views, Columns, Export) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setMobileLayout("cards")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mobileLayout === "cards" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setMobileLayout("table")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mobileLayout === "table" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500"
                }`}
              >
                Table
              </button>
            </div>

            {/* Saved Views Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSavedViewsMenu(!showSavedViewsMenu)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <Bookmark size={13} className="text-[#0F8B7D]" />
                <span className="text-slate-500 hidden sm:inline">View:</span>
                <span className="font-bold text-slate-800">{SAVED_VIEWS.find((v) => v.id === activeSavedView)?.name || "Clean View"}</span>
              </button>
              {showSavedViewsMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[9px] font-bold uppercase text-slate-400">View Presets</div>
                  {SAVED_VIEWS.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => handleSelectSavedView(view)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        activeSavedView === view.id ? "bg-teal-50 text-[#0F8B7D] font-bold" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{view.name}</span>
                        {activeSavedView === view.id && <Check size={12} className="text-[#0F8B7D]" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">{view.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Column Chooser */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={13} className="text-slate-600" />
                <span>Columns</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {visibleColumns.size}
                </span>
              </button>
              {showColumnChooser && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 max-h-80 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase text-slate-400 pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>Toggle Columns</span>
                    <button
                      onClick={() => setVisibleColumns(new Set(ALL_COLUMNS.map((c) => c.id).concat(["unit", "actions"])))}
                      className="text-[#0F8B7D] font-bold hover:underline lowercase text-[10px]"
                    >
                      Reset all
                    </button>
                  </div>
                  {ALL_COLUMNS.map((col) => {
                    const isChecked = visibleColumns.has(col.id);
                    return (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleColumn(col.id)}
                          className="rounded border-slate-300 text-[#0F8B7D] focus:ring-[#0F8B7D]"
                        />
                        <span>{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tally Export */}
            <a
              href="/api/rent-roll/export/tally"
              download
              className="px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Export to Tally XML"
            >
              <FileSpreadsheet size={13} className="text-indigo-600" />
              <span>Tally</span>
            </a>
          </div>
        </div>
      </div>

      {/* ──── MOBILE CARDS VIEW (Clean, high-density presentation on mobile) ──── */}
      <div className={`space-y-3 ${mobileLayout === "cards" ? "block md:hidden" : "hidden"}`}>
        {sortedRows.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No spaces found matching filter</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              All physical spaces and active lease contracts for this property are automatically reconciled here.
            </p>
          </div>
        ) : (
          sortedRows.map((row) => (
            <div
              key={`card-${row.id}`}
              onClick={() => row.originalLease && onSelectLease(row.originalLease)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 cursor-pointer hover:border-teal-500/40 transition-colors"
            >
              {/* Card Header: Unit Name + Status */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      row.isVacant ? "bg-amber-400" : row.direction === "payable" ? "bg-purple-500" : "bg-[#0F8B7D]"
                    }`}
                  />
                  <div>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span>{row.unitNumber}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                        {row.spaceType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {row.propertyName}
                    </span>
                  </div>
                </div>

                <div>
                  {row.isVacant ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Vacant
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200">
                      Leased
                    </span>
                  )}
                </div>
              </div>

              {/* Occupant / Lease Info */}
              {!row.isVacant ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[180px]">{row.tenantName}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{row.leaseCode}</span>
                  </div>
                  {getContractTypeBadge(row.contractType, row.direction)}
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-800 italic">
                  Available space · {row.daysVacant} days vacant
                </div>
              )}

              {/* Commercials Grid: 3 columns */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Chargeable</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {row.chargeableArea.toLocaleString()}<span className="text-[9px] font-normal text-slate-500 ml-0.5">sqft</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Base Rent</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    ₹{row.baseRentPsf}<span className="text-[9px] font-normal text-slate-500 ml-0.5">/psf</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Gross</span>
                  <span className="text-xs font-black text-[#0F8B7D] font-mono">
                    {row.isVacant ? "—" : formatINR(row.totalMonthlyGross)}
                  </span>
                </div>
              </div>

              {/* Contract Terms Bar */}
              {!row.isVacant && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{row.startDate ? row.startDate.slice(0, 10) : "—"} → {row.endDate ? row.endDate.slice(0, 10) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <span className="text-teal-700">+{row.escalationPct}%/36m</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700">Dep: {formatINR(row.securityDepositPaid)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5 pt-1">
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
                    className="w-full py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Lease This Unit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span className="text-[10px] text-slate-400">Tap to view</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (row.originalLease) onSelectLease(row.originalLease);
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (row.originalLease) onOpenApplyEscalation(row.originalLease);
                        }}
                        className="p-1.5 hover:bg-teal-50 text-teal-700 rounded-lg border border-slate-200 cursor-pointer"
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
                        className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg border border-slate-200 cursor-pointer"
                        title="Notice"
                      >
                        <AlertCircle size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ──── MASTER REGISTER GRID TABLE (Desktop default, or mobile if 'table' toggled) ──── */}
      <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs ${mobileLayout === "cards" ? "hidden md:block" : "block"}`}>
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className={`w-full text-left text-xs border-collapse ${visibleColumns.size > 9 ? "min-w-[1300px]" : "min-w-full"}`}>
            <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 whitespace-nowrap">Space &amp; Unit</th>
                {visibleColumns.has("tenant") && <th className="px-4 py-3 border-r border-slate-200/80 whitespace-nowrap">Occupant / Tenant</th>}
                {visibleColumns.has("code") && <th className="px-4 py-3 border-r border-slate-200/80 whitespace-nowrap">Contract Code</th>}
                {visibleColumns.has("type") && <th className="px-4 py-3 border-r border-slate-200/80 whitespace-nowrap">Type &amp; Direction</th>}
                {visibleColumns.has("area") && (
                  <th onClick={() => handleSort("chargeableArea")} className="px-4 py-3 text-right cursor-pointer hover:text-slate-900 border-r border-slate-200/80 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <span>Area (Sq Ft)</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.has("ratePsf") && (
                  <th onClick={() => handleSort("baseRentPsf")} className="px-4 py-3 text-right cursor-pointer hover:text-slate-900 border-r border-slate-200/80 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <span>Base PSF</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.has("rent") && (
                  <th onClick={() => handleSort("monthlyRent")} className="px-4 py-3 text-right cursor-pointer hover:text-slate-900 border-r border-slate-200/80 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <span>Monthly Rent</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.has("cam") && <th className="px-4 py-3 text-right border-r border-slate-200/80 whitespace-nowrap">CAM PSF</th>}
                {visibleColumns.has("gross") && <th className="px-4 py-3 text-right font-black text-slate-800 border-r border-slate-200/80 bg-slate-100/50 whitespace-nowrap">Monthly Gross</th>}
                {visibleColumns.has("escalation") && <th className="px-4 py-3 text-center border-r border-slate-200/80 whitespace-nowrap">Escalation</th>}
                {visibleColumns.has("tenure") && <th className="px-4 py-3 text-center border-r border-slate-200/80 whitespace-nowrap">Term (Start – End)</th>}
                {visibleColumns.has("lockIn") && <th className="px-4 py-3 text-center border-r border-slate-200/80 whitespace-nowrap">Lock-In</th>}
                {visibleColumns.has("deposit") && <th className="px-4 py-3 text-right border-r border-slate-200/80 whitespace-nowrap">Security Deposit</th>}
                {visibleColumns.has("status") && <th className="px-4 py-3 text-center border-r border-slate-200/80 whitespace-nowrap">Status</th>}
                <th className="px-4 py-3 text-center sticky right-0 z-30 bg-slate-50 border-l border-slate-200 whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.size + 2} className="py-20 text-center text-slate-500">
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
                    <td className="p-3.5 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            row.isVacant ? "bg-amber-400" : row.direction === "payable" ? "bg-purple-500" : "bg-[#0F8B7D]"
                          }`}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                            <span>{row.unitNumber}</span>
                            {!/^(ground|floor|\d+[a-z]{0,2}\s*floor)/i.test(row.unitNumber?.trim() || "") && (
                              <span className="text-[10px] text-slate-400 font-normal">Flr {row.floorNumber}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block capitalize font-medium">{row.spaceType}</span>
                        </div>
                      </div>
                    </td>

                    {/* Occupant / Tenant */}
                    {visibleColumns.has("tenant") && (
                      <td className="px-4 py-3.5 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? (
                          <span className="text-amber-700 text-xs font-semibold italic">— Vacant —</span>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{row.tenantName}</div>
                            {!visibleColumns.has("code") && row.leaseCode && (
                              <span className="text-[10px] text-slate-400 font-mono tracking-tight block">{row.leaseCode}</span>
                            )}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Contract Code */}
                    {visibleColumns.has("code") && (
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? "—" : row.leaseCode}
                      </td>
                    )}

                    {/* Contract Type & Direction */}
                    {visibleColumns.has("type") && (
                      <td className="px-4 py-3.5 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? (
                          <span className="text-[10px] text-slate-400">Available</span>
                        ) : (
                          getContractTypeBadge(row.contractType, row.direction)
                        )}
                      </td>
                    )}

                    {/* Chargeable Area */}
                    {visibleColumns.has("area") && (
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        {row.chargeableArea.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">sqft</span>
                      </td>
                    )}

                    {/* Base Rent PSF */}
                    {visibleColumns.has("ratePsf") && (
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                        ₹{row.baseRentPsf}
                      </td>
                    )}

                    {/* Monthly Base Rent */}
                    {visibleColumns.has("rent") && (
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-teal-700 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? <span className="text-slate-300 font-normal">—</span> : formatINR(row.monthlyRent)}
                      </td>
                    )}

                    {/* CAM Rate */}
                    {visibleColumns.has("cam") && (
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        ₹{row.camRatePsf}
                      </td>
                    )}

                    {/* Total Monthly Gross */}
                    {visibleColumns.has("gross") && (
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 bg-slate-50/40 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? <span className="text-slate-300 font-normal">—</span> : formatINR(row.totalMonthlyGross)}
                      </td>
                    )}

                    {/* Escalation */}
                    {visibleColumns.has("escalation") && (
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? "—" : <span className="text-teal-700 font-semibold">+{row.escalationPct}%</span>}
                      </td>
                    )}

                    {/* Tenure */}
                    {visibleColumns.has("tenure") && (
                      <td className="px-4 py-3.5 text-center font-mono text-[11px] text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? (
                          <span className="text-amber-700 text-[10px]">{row.daysVacant}d vacant</span>
                        ) : (
                          `${row.startDate ? row.startDate.slice(0, 10) : "—"} → ${row.endDate ? row.endDate.slice(0, 10) : "—"}`
                        )}
                      </td>
                    )}

                    {/* Lock-In */}
                    {visibleColumns.has("lockIn") && (
                      <td className="px-4 py-3.5 text-center text-xs border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? "—" : (
                          <span className="text-slate-600 font-medium">
                            {row.lockInMonths ? `${row.lockInMonths} mo` : (row.lockInEndDate || "—")}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Security Deposit */}
                    {visibleColumns.has("deposit") && (
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {row.isVacant ? "—" : (
                          <span className="font-semibold text-slate-900">{formatINR(row.securityDepositPaid)}</span>
                        )}
                      </td>
                    )}

                    {/* Status / Approval */}
                    {visibleColumns.has("status") && (
                      <td className="px-4 py-3.5 text-center border-r border-slate-100 whitespace-nowrap">
                        {getApprovalBadge(row)}
                      </td>
                    )}

                    {/* Actions (Sticky Right Column) */}
                    <td className="p-3 text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-200 whitespace-nowrap">
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
                          className="px-2.5 py-1 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-lg text-[11px] font-bold cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                        >
                          + Lease
                        </button>
                      ) : (
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (row.originalLease) onSelectLease(row.originalLease);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Lease Details"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Pinned Totals Row (S-10 Requirement) */}
            <tfoot className="bg-slate-100 text-xs font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0 z-20 shadow-xs">
              <tr>
                <td className="px-4 py-3 sticky left-0 z-30 bg-slate-100 border-r border-slate-200 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black text-slate-700">
                    <Layers size={13} className="text-teal-700" />
                    <span>Total (Filtered)</span>
                  </div>
                </td>
                {visibleColumns.has("tenant") && (
                  <td className="px-4 py-3 text-[11px] text-slate-500 font-semibold border-r border-slate-200/80 whitespace-nowrap">
                    {sortedRows.filter(r => !r.isVacant).length} Occupied · {sortedRows.filter(r => r.isVacant).length} Vacant
                  </td>
                )}
                {visibleColumns.has("code") && <td className="px-4 py-3 font-mono text-[11px] text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                {visibleColumns.has("type") && <td className="px-4 py-3 font-mono text-[11px] text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                {visibleColumns.has("area") && (
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-900 border-r border-slate-200/80 whitespace-nowrap">
                    {sortedRows.reduce((acc, r) => acc + (r.chargeableArea || 0), 0).toLocaleString()} sq ft
                  </td>
                )}
                {visibleColumns.has("ratePsf") && (
                  <td className="px-4 py-3 text-right font-mono text-slate-500 font-bold border-r border-slate-200/80 whitespace-nowrap">
                    {(() => {
                      const totalArea = sortedRows.reduce((acc, r) => acc + (r.chargeableArea || 0), 0);
                      const totalRent = sortedRows.reduce((acc, r) => acc + (r.monthlyRent || 0), 0);
                      return totalArea > 0 ? `Avg ₹${(totalRent / totalArea).toFixed(2)}` : "—";
                    })()}
                  </td>
                )}
                {visibleColumns.has("rent") && (
                  <td className="px-4 py-3 text-right font-mono font-black text-[#0F8B7D] border-r border-slate-200/80 whitespace-nowrap">
                    {formatINR(sortedRows.reduce((acc, r) => acc + (r.monthlyRent || 0), 0))}
                  </td>
                )}
                {visibleColumns.has("cam") && (
                  <td className="px-4 py-3 text-right font-mono text-slate-600 font-bold border-r border-slate-200/80 whitespace-nowrap">
                    {formatINR(sortedRows.reduce((acc, r) => acc + (r.camMonthly || 0), 0))}
                  </td>
                )}
                {visibleColumns.has("gross") && (
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-900 bg-slate-200/70 border-r border-slate-200/80 whitespace-nowrap">
                    {formatINR(sortedRows.reduce((acc, r) => acc + (r.totalMonthlyGross || 0), 0))}
                  </td>
                )}
                {visibleColumns.has("escalation") && <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                {visibleColumns.has("tenure") && <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                {visibleColumns.has("lockIn") && <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                {visibleColumns.has("deposit") && (
                  <td className="px-4 py-3 text-right font-mono text-slate-800 font-bold border-r border-slate-200/80 whitespace-nowrap">
                    {formatINR(sortedRows.reduce((acc, r) => acc + (r.securityDepositPaid || 0), 0))}
                  </td>
                )}
                {visibleColumns.has("status") && <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-200/80 whitespace-nowrap">—</td>}
                <td className="px-4 py-3 text-center sticky right-0 z-30 bg-slate-100 border-l border-slate-200 whitespace-nowrap">
                  <span className="text-[10px] text-slate-400 font-mono">{sortedRows.length} Rows</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
