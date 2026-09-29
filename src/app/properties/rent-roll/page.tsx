"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  Receipt,
  FileCheck2,
  Clock,
  ArrowUpRight,
  PieChart,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  Layers,
  Sparkles,
  RefreshCw,
  Bell,
  CheckCircle2,
  Plus,
  BookOpen,
  Zap,
  Sliders
} from "lucide-react";

import { RentRollHeader } from "@/components/rent-roll/RentRollHeader";
import { DashboardTab } from "@/components/rent-roll/DashboardTab";
import { MasterGridTab, EnrichedLease } from "@/components/rent-roll/MasterGridTab";
import { InvoicesTab, InvoiceItem } from "@/components/rent-roll/InvoicesTab";
import { MeterReadingsTab } from "@/components/rent-roll/MeterReadingsTab";
import { CollectionsTab, CollectionReceipt } from "@/components/rent-roll/CollectionsTab";
import { AgingTab } from "@/components/rent-roll/AgingTab";
import { EscalationsTab, EscalationRecord } from "@/components/rent-roll/EscalationsTab";
import { OccupancyTab } from "@/components/rent-roll/OccupancyTab";
import { ForecastTab } from "@/components/rent-roll/ForecastTab";
import { PnlTab } from "@/components/rent-roll/PnlTab";
import { TenantsTab, TenantSummary } from "@/components/rent-roll/TenantsTab";
import { AuditTab, AuditLogItem } from "@/components/rent-roll/AuditTab";
import { DictionaryTab } from "@/components/rent-roll/DictionaryTab";
import { FlexCentreTab } from "@/components/rent-roll/FlexCentreTab";
import { CamPoolsTab } from "@/components/rent-roll/CamPoolsTab";
import { IntegrationsTab } from "@/components/rent-roll/IntegrationsTab";

import { RentRollConfigWizardModal } from "@/components/rent-roll/RentRollConfigWizardModal";
import { ProfileAndBankingModal } from "@/components/rent-roll/ProfileAndBankingModal";
import { AccountingIntegrationsModal } from "@/components/rent-roll/AccountingIntegrationsModal";

import { LeaseDetailDrawer } from "@/components/rent-roll/LeaseDetailDrawer";
import { TaxInvoiceDrawer } from "@/components/rent-roll/TaxInvoiceDrawer";
import { AddLeaseModal } from "@/components/rent-roll/AddLeaseModal";
import { RecordPaymentModal } from "@/components/rent-roll/RecordPaymentModal";
import { ServeNoticeModal } from "@/components/rent-roll/ServeNoticeModal";
import { AddExpenseModal } from "@/components/rent-roll/AddExpenseModal";
import { AlertsModal, AlertNotification } from "@/components/rent-roll/AlertsModal";
import { AddTenantModal } from "@/components/rent-roll/AddTenantModal";
import { ApplyEscalationModal } from "@/components/rent-roll/ApplyEscalationModal";
import { ManagePropertiesModal } from "@/components/rent-roll/ManagePropertiesModal";
import { DeletePropertyModal } from "@/components/rent-roll/DeletePropertyModal";
import { ImportRentRollModal } from "@/components/rent-roll/ImportRentRollModal";
import { OwnerStatementsModal } from "@/components/rent-roll/OwnerStatementsModal";
import { DealsModal } from "@/components/rent-roll/DealsModal";
import { BillingRunModal } from "@/components/rent-roll/BillingRunModal";
import { AdjustmentNoteModal } from "@/components/rent-roll/AdjustmentNoteModal";

const DEPRECATED_PROP_IDS = new Set([
  "357554cc-221d-4c7f-9465-32afcec7a8e7",
  "72b18ad7-0ee0-4ac5-bfc9-156c6dc10625",
  "8b1b9613-b890-4540-9139-6c2a6bb6cf60",
  "401f394a-6d27-4c23-9a21-411baa7eef3b",
  "cfa13505-71a5-4a43-be33-37497f416fdc",
  "cf5a0b49-c4fd-4762-ae22-40c42ac6332d",
  "PROP-FORTUNE-SKY",
  "PROP-001",
  "PROP-002",
  "PROP-APX",
  "PROP-MTP",
  "PROP-NXN",
  "PROP-1790239048961",
  "PROP-1790659297701"
]);

const DEPRECATED_PROP_NAMES = new Set([
  "apex business tower",
  "nexus hub",
  "meridian tech park",
  "shivalik shilp",
  "business hub",
  "test commercial tower",
  "fortune sky",
  "signature tower b"
]);

// Active real inventory validator (never filter out user-registered entities)
const isDeprecatedMockProperty = (p: any) => !p;
const isDeprecatedMockLease = (l: any) => !l;

function RentRollPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") || "dashboard";

  // Auth Gate: Redirect to login if no active session
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSession =
        localStorage.getItem("officex_session_active") === "1" ||
        sessionStorage.getItem("officex_session_active") === "1" ||
        document.cookie.includes("officex_auth=1");
      if (!hasSession) {
        const fullPath = window.location.pathname + window.location.search;
        router.replace(`/login?context=rent-roll&redirect=${encodeURIComponent(fullPath)}`);
        return;
      }
      setAuthChecked(true);
    }
  }, [router]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);

  // Sync activeTab whenever URL search parameter ?tab=... changes (e.g. sidebar navigation)
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Open Add Tenant modal when action=add-tenant is in URL
  const actionFromUrl = searchParams.get("action");
  useEffect(() => {
    if (actionFromUrl === "add-tenant") {
      setIsAddTenantOpen(true);
    }
  }, [actionFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/properties/rent-roll?tab=${tabId}`, { scroll: false });
  };

  // Global Filters State
  const [selectedProperty, setSelectedProperty] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClientAccount, setSelectedClientAccount] = useState<string>("ALL");
  const [selectedBillingEntity, setSelectedBillingEntity] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"current" | "contracted" | "forecast">("current");

  // Data Store State
  const [properties, setProperties] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [billingEntities, setBillingEntities] = useState<any[]>([]);
  const [leases, setLeases] = useState<EnrichedLease[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [orgBranding, setOrgBranding] = useState<{
    name?: string;
    legalName?: string;
    tradeName?: string;
    pan?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    currency?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankBranch?: string;
    accountType?: string;
    escrowNodalVerified?: boolean;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    logoUrl?: string;
    brandColor?: string;
  }>({});
  const [isProfileBankingOpen, setIsProfileBankingOpen] = useState<boolean>(false);
  const [preSelectedSpaceForLease, setPreSelectedSpaceForLease] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [collections, setCollections] = useState<CollectionReceipt[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [agingData, setAgingData] = useState<any | null>(null);
  const [occupancyData, setOccupancyData] = useState<any | null>(null);
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [pnlData, setPnlData] = useState<any | null>(null);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawer States
  const [selectedLeaseForDrawer, setSelectedLeaseForDrawer] = useState<EnrichedLease | null>(null);
  const [selectedInvoiceForTaxDrawer, setSelectedInvoiceForTaxDrawer] = useState<InvoiceItem | null>(null);
  const [isAddLeaseOpen, setIsAddLeaseOpen] = useState<boolean>(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [preSelectedInvoiceForPayment, setPreSelectedInvoiceForPayment] = useState<any>(null);
  const [isServeNoticeOpen, setIsServeNoticeOpen] = useState<boolean>(false);
  const [leaseForNotice, setLeaseForNotice] = useState<EnrichedLease | null>(null);
  const [isApplyEscalationOpen, setIsApplyEscalationOpen] = useState<boolean>(false);
  const [leaseForEscalation, setLeaseForEscalation] = useState<EnrichedLease | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isOwnerStatementsOpen, setIsOwnerStatementsOpen] = useState<boolean>(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState<boolean>(false);
  const [isBillingRunModalOpen, setIsBillingRunModalOpen] = useState<boolean>(false);
  const [isAdjustmentNoteOpen, setIsAdjustmentNoteOpen] = useState<boolean>(false);
  const [selectedInvoiceForAdjustment, setSelectedInvoiceForAdjustment] = useState<InvoiceItem | null>(null);
  const [isConfigWizardOpen, setIsConfigWizardOpen] = useState<boolean>(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState<boolean>(false);

  // Month-End Snapshots (RR-AUD-03)
  const [isFreezingSnapshot, setIsFreezingSnapshot] = useState<boolean>(false);
  const [isSnapshotsModalOpen, setIsSnapshotsModalOpen] = useState<boolean>(false);
  const [historicalSnapshots, setHistoricalSnapshots] = useState<any[]>([]);

  // Logged-in Landlord identity state
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "Property Owner & Asset Manager",
    primaryBuilding: ""
  });

  const handleFreezeSnapshot = async () => {
    const month = asOfDate.slice(0, 7);
    if (!confirm(`Confirm freeze month-end statutory snapshot for ${month}? This will create an immutable audit record of the current rent roll.`)) {
      return;
    }
    setIsFreezingSnapshot(true);
    try {
      const res = await fetch("/api/rent-roll/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshotMonth: month,
          asOfDate,
          propertyId: selectedProperty !== "ALL" ? selectedProperty : undefined,
          frozenBy: userInfo.name || "Finance Controller"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback(data.message || `Month-end rent roll frozen for ${month}.`);
        setTimeout(() => setActionFeedback(null), 5000);
      } else {
        alert(data.error || "Failed to freeze snapshot.");
      }
    } catch (err) {
      console.error(err);
      alert("Error freezing snapshot.");
    } finally {
      setIsFreezingSnapshot(false);
    }
  };

  const handleOpenSnapshots = async () => {
    try {
      const res = await fetch(`/api/rent-roll/snapshots${selectedProperty !== "ALL" ? `?propertyId=${selectedProperty}` : ""}`);
      const data = await res.json();
      if (res.ok) {
        setHistoricalSnapshots(data.snapshots || []);
        setIsSnapshotsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLockSnapshot = async (snapshotId: string) => {
    if (!confirm("Lock this month-end snapshot permanently? Once locked, it becomes strictly immutable per RR-AUD-03.")) return;
    try {
      const res = await fetch("/api/rent-roll/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lock",
          snapshotId,
          lockedBy: userInfo.name || "Finance Controller"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionFeedback("Snapshot locked and marked immutable.");
        setTimeout(() => setActionFeedback(null), 5000);
        handleOpenSnapshots();
      } else {
        alert(data.error || "Failed to lock snapshot.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name") || "";
      const email = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "";
      const role = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "Property Owner & Asset Manager";
      const primaryBuilding = localStorage.getItem("officex_property_name") || sessionStorage.getItem("officex_property_name") || "";

      setUserInfo({
        name,
        email,
        role,
        primaryBuilding
      });
    }
  }, []);

  // Property removal & management states
  const [isManagePropertiesOpen, setIsManagePropertiesOpen] = useState<boolean>(false);
  const [propertyToDelete, setPropertyToDelete] = useState<any | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Property Removal Handler
  const handleRemoveProperty = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/rent-roll/properties?id=${encodeURIComponent(propertyId)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove property");
      }

      if (typeof window !== "undefined") {
        try {
          const localProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          const filtered = localProps.filter((p: any) => p.id !== propertyId);
          localStorage.setItem("officex_user_properties", JSON.stringify(filtered));
        } catch {}

        if (userInfo.primaryBuilding === data.deletedProperty?.name) {
          localStorage.removeItem("officex_property_name");
          setUserInfo(prev => ({ ...prev, primaryBuilding: "" }));
        }
      }

      if (selectedProperty === propertyId) {
        setSelectedProperty("ALL");
      }

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      await fetchAllData();

      setActionFeedback(`Property "${data.deletedProperty?.name || propertyId}" removed successfully from portfolio.`);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to remove property:", err);
      throw err;
    }
  };

  // Load all data from API
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const email = typeof window !== "undefined"
        ? (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "")
        : "";
      const emailParam = email ? `ownerEmail=${encodeURIComponent(email)}` : "";

      const propParam = selectedProperty !== "ALL" ? `propertyId=${encodeURIComponent(selectedProperty)}` : "";
      const statusParam = selectedStatus !== "ALL" ? `status=${encodeURIComponent(selectedStatus)}` : "";
      const searchParam = searchQuery ? `search=${encodeURIComponent(searchQuery)}` : "";
      const clientAccountParam = selectedClientAccount !== "ALL" ? `clientAccountId=${encodeURIComponent(selectedClientAccount)}` : "";
      const billingEntityParam = selectedBillingEntity !== "ALL" ? `billingEntityId=${encodeURIComponent(selectedBillingEntity)}` : "";
      const viewModeParam = `viewMode=${encodeURIComponent(viewMode)}`;
      const asOfDateParam = asOfDate ? `asOfDate=${encodeURIComponent(asOfDate)}` : "";

      const makeQuery = (extra: string[] = []) => {
        const parts = [emailParam, ...extra].filter(Boolean);
        return parts.length > 0 ? `?${parts.join("&")}` : "";
      };

      const [
        propRes,
        spacesRes,
        leasesRes,
        dashRes,
        invRes,
        colRes,
        escRes,
        agingRes,
        occRes,
        foreRes,
        pnlRes,
        tntRes,
        auditRes,
        alertRes,
        clientAccRes,
        billingEntRes,
        orgRes
      ] = await Promise.all([
        fetch(`/api/rent-roll/properties${makeQuery([clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/spaces${makeQuery([propParam])}`),
        fetch(`/api/rent-roll/leases${makeQuery([propParam, statusParam, searchParam, clientAccountParam, billingEntityParam, viewModeParam, asOfDateParam])}`),
        fetch(`/api/rent-roll/dashboard${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/invoices${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/collections${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/escalations${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/aging${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/occupancy${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/forecast${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/pnl${makeQuery([propParam, clientAccountParam, billingEntityParam])}`),
        fetch(`/api/rent-roll/tenants${makeQuery()}`),
        fetch(`/api/rent-roll/audit${makeQuery()}`),
        fetch(`/api/rent-roll/alerts${makeQuery()}`),
        fetch(`/api/rent-roll/client-accounts`),
        fetch(`/api/rent-roll/billing-entities${makeQuery([clientAccountParam])}`),
        fetch(`/api/rent-roll/organization`)
      ]);

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        if (orgData) {
          const org = orgData.organization || orgData;
          setOrgBranding({
            name: org.name || org.legalName || orgData.name,
            legalName: org.legalName || org.name,
            tradeName: org.tradeName || orgData.tradeName,
            pan: org.pan || orgData.pan,
            gstin: org.gstin || orgData.gstin,
            address: org.address || orgData.address,
            city: org.city || orgData.city,
            state: org.state || orgData.state,
            pincode: org.pincode || orgData.pincode,
            currency: org.currency || orgData.currency || "INR",
            bankName: org.bankName || orgData.bankName,
            bankAccountNumber: org.bankAccountNumber || orgData.bankAccountNumber,
            bankIfsc: org.bankIfsc || orgData.bankIfsc,
            bankBranch: org.bankBranch || orgData.bankBranch,
            accountType: org.accountType || orgData.accountType,
            escrowNodalVerified: org.escrowNodalVerified ?? orgData.escrowNodalVerified,
            contactPerson: org.contactPerson || orgData.contactPerson,
            contactEmail: org.contactEmail || orgData.contactEmail,
            contactPhone: org.contactPhone || orgData.contactPhone,
            logoUrl: orgData.branding?.logoUrl || orgData.branding?.logoPreview || org.logoUrl,
            brandColor: orgData.branding?.brandColor || org.brandColor
          });
        }
      }

      if (spacesRes.ok) {
        const spacesData = await spacesRes.json();
        if (Array.isArray(spacesData)) {
          setSpaces(spacesData);
        }
      }

      if (clientAccRes.ok) {
        setClientAccounts(await clientAccRes.json());
      }
      if (billingEntRes.ok) {
        setBillingEntities(await billingEntRes.json());
      }

      if (propRes.ok) {
        const serverProps = await propRes.json();
        let localProps: any[] = [];
        try {
          localProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        } catch {}
        const mergedMap = new Map();
        serverProps.forEach((p: any) => {
          if (p) mergedMap.set(p.id, p);
        });
        localProps.forEach((p: any) => {
          if (p && (!p.ownerEmail || (email && p.ownerEmail.toLowerCase() === email.toLowerCase()))) {
            mergedMap.set(p.id, p);
          }
        });
        setProperties(Array.from(mergedMap.values()));
      }
      if (leasesRes.ok) {
        const serverLeases = await leasesRes.json();
        let localLeases: any[] = [];
        try {
          localLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
        } catch {}
        const mergedMap = new Map();
        serverLeases.forEach((l: any) => {
          if (l) mergedMap.set(l.id || l.tenantName, l);
        });
        localLeases.forEach((l: any) => {
          if (l && (!l.ownerEmail || (email && l.ownerEmail.toLowerCase() === email.toLowerCase()))) {
            mergedMap.set(l.id || l.tenantName, l);
          }
        });
        setLeases(Array.from(mergedMap.values()));
      }
      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (colRes.ok) setCollections(await colRes.json());
      if (escRes.ok) setEscalations(await escRes.json());
      if (agingRes.ok) setAgingData(await agingRes.json());
      if (occRes.ok) setOccupancyData(await occRes.json());
      if (foreRes.ok) setForecastData(await foreRes.json());
      if (pnlRes.ok) setPnlData(await pnlRes.json());
      if (tntRes.ok) setTenants(await tntRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
    } catch (err) {
      console.error("Failed to load rent roll data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty, selectedStatus, searchQuery, selectedClientAccount, selectedBillingEntity, viewMode, asOfDate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Export CSV
  const handleExportCsv = (type: string) => {
    window.open(`/api/rent-roll/export?type=${type}`, "_blank");
  };

  // Handle Generate Invoices Batch (RR-BIL-01)
  const handleGenerateInvoicesBatch = () => {
    setIsBillingRunModalOpen(true);
  };

  // Handle Apply Escalation
  const handleApplyEscalation = async (esc: EscalationRecord) => {
    try {
      const res = await fetch("/api/rent-roll/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escalationId: esc.id, action: "apply" })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to apply escalation:", e);
    }
  };

  // Handle Waive Escalation
  const handleWaiveEscalation = async (esc: EscalationRecord) => {
    try {
      const res = await fetch("/api/rent-roll/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escalationId: esc.id, action: "waive", notes: "Waived by commercial management" })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to waive escalation:", e);
    }
  };

  // Handle Mark All Alerts Read
  const handleMarkAllAlertsRead = async () => {
    try {
      await fetch("/api/rent-roll/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true })
      });
      fetchAllData();
    } catch (e) {
      console.error("Failed to mark alerts as read:", e);
    }
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const tabs = [
    { id: "dashboard", label: "Executive Dashboard", icon: Building2 },
    { id: "rentroll", label: "Active Rent Roll Master", icon: TrendingUp },
    { id: "invoices", label: "Monthly Billing & Invoices", icon: Receipt },
    { id: "meter-readings", label: "Meter Readings & Utilities", icon: Zap },
    { id: "collections", label: "Collections & Receipts", icon: FileCheck2 },
    { id: "aging", label: "Arrears & Aging Ledger", icon: Clock },
    { id: "escalations", label: "Escalation & Expiries", icon: ArrowUpRight },
    { id: "occupancy", label: "Stacking & Occupancy", icon: PieChart },
    { id: "forecast", label: "12-Mo Forecast", icon: Calendar },
    { id: "pnl", label: "NOI & Property P&L", icon: DollarSign },
    { id: "flex-centre", label: "Centre P&L (Flex)", icon: Layers },
    { id: "cam-pools", label: "CAM Pools & True-Up", icon: Sparkles },
    { id: "tenants", label: "Tenant Directory & Leases", icon: Users },
    { id: "dictionary", label: "Financial Terms Dictionary", icon: BookOpen },
    { id: "integrations", label: "Accounting & ERP Sync", icon: Zap },
    { id: "audit", label: "Audit & Config", icon: ShieldCheck },
  ];

  // Don't render dashboard until auth is confirmed
  if (!authChecked) {
    return <div className="p-12 text-center text-gray-500 font-medium">Verifying session...</div>;
  }

  return (
    <div className="flex flex-col gap-3 font-sans relative w-full">
      {/* ──── TOP GLOBAL HEADER & CONTROLS ──── */}
      <RentRollHeader
        activeTab={activeTab}
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        clientAccounts={clientAccounts}
        selectedClientAccount={selectedClientAccount}
        onSelectClientAccount={setSelectedClientAccount}
        billingEntities={billingEntities}
        selectedBillingEntity={selectedBillingEntity}
        onSelectBillingEntity={setSelectedBillingEntity}
        onOpenOwnerStatements={() => setIsOwnerStatementsOpen(true)}
        onOpenDeals={() => setIsDealsModalOpen(true)}
        onOpenConfigWizard={() => setIsConfigWizardOpen(true)}
        onOpenProfileBanking={() => setIsProfileBankingOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenAddLease={() => setIsAddLeaseOpen(true)}
        onOpenRecordPayment={() => {
          setPreSelectedInvoiceForPayment(null);
          setIsRecordPaymentOpen(true);
        }}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddTenant={() => setIsAddTenantOpen(true)}
        onOpenImportCsv={() => setIsImportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onRefresh={fetchAllData}
        isLoading={isLoading}
        unreadAlertsCount={unreadAlerts.length}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        userName={userInfo.name}
        userEmail={userInfo.email}
        userRole={userInfo.role}
        primaryBuildingName={userInfo.primaryBuilding}
        orgName={orgBranding.name || userInfo.name}
        orgTradeName={orgBranding.tradeName}
        logoUrl={orgBranding.logoUrl}
        brandColor={orgBranding.brandColor}
        asOfDate={asOfDate}
        onAsOfDateChange={setAsOfDate}
        onFreezeSnapshot={handleFreezeSnapshot}
        onOpenSnapshots={handleOpenSnapshots}
        isFreezingSnapshot={isFreezingSnapshot}
        onOpenDeleteProperty={(propId) => {
          const p = properties.find((item) => item.id === propId);
          if (p) setPropertyToDelete(p);
        }}
        onOpenManageProperties={() => setIsManagePropertiesOpen(true)}
      />

      {/* ──── COMPACT TAB INDICATOR (sidebar handles full navigation) ──── */}
      {(() => {
        const currentTab = tabs.find(t => t.id === activeTab);
        const Icon = currentTab?.icon || Building2;
        return (
          <div className="flex items-center gap-2 px-1 text-xs text-gray-500">
            <Icon className="w-3.5 h-3.5 text-[#0F8B7D]" />
            <span className="font-bold text-gray-900">{currentTab?.label || "Dashboard"}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">FY 2026-27</span>
          </div>
        );
      })()}

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 px-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ──── MAIN BODY CONTENT ──── */}
      <div className="w-full">
        {activeTab === "dashboard" && (
          <DashboardTab
            data={dashboardData}
            onNavigateTab={handleTabChange}
            onOpenRecordPayment={() => {
              setPreSelectedInvoiceForPayment(null);
              setIsRecordPaymentOpen(true);
            }}
            onOpenGenerateInvoices={handleGenerateInvoicesBatch}
            propertiesCount={properties.length}
            onOpenAddProperty={() => router.push("/properties/add")}
            onOpenImportCsv={() => setIsImportModalOpen(true)}
            onOpenProfileSettings={() => setIsProfileBankingOpen(true)}
            organizationData={orgBranding}
            billingEntities={billingEntities}
          />
        )}

        {activeTab === "rentroll" && (
          <MasterGridTab
            leases={leases}
            spaces={spaces}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSelectLease={setSelectedLeaseForDrawer}
            onOpenApplyEscalation={(l) => {
              setLeaseForEscalation(l);
              setIsApplyEscalationOpen(true);
            }}
            onOpenServeNotice={(l) => {
              setLeaseForNotice(l);
              setIsServeNoticeOpen(true);
            }}
            onOpenRecordPayment={(l) => {
              const inv = invoices.find(i => i.leaseId === l.id && i.balanceDue > 0);
              setPreSelectedInvoiceForPayment(inv || { leaseId: l.id, balanceDue: l.totalOutstanding, netPayable: l.totalMonthlyGross });
              setIsRecordPaymentOpen(true);
            }}
            onOpenAddLeaseForSpace={(sp) => {
              setPreSelectedSpaceForLease(sp);
              setIsAddLeaseOpen(true);
            }}
            onOpenAddLease={() => {
              setPreSelectedSpaceForLease(null);
              setIsAddLeaseOpen(true);
            }}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "invoices" && (
          <InvoicesTab
            invoices={invoices}
            onOpenTaxInvoice={setSelectedInvoiceForTaxDrawer}
            onOpenRecordPayment={(inv) => {
              setPreSelectedInvoiceForPayment(inv);
              setIsRecordPaymentOpen(true);
            }}
            onOpenGenerateInvoices={handleGenerateInvoicesBatch}
            onOpenAdjustmentNote={(inv) => {
              setSelectedInvoiceForAdjustment(inv);
              setIsAdjustmentNoteOpen(true);
            }}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "meter-readings" && (
          <MeterReadingsTab
            properties={properties}
            selectedProperty={selectedProperty}
          />
        )}

        {activeTab === "collections" && (
          <CollectionsTab
            collections={collections}
            onOpenRecordPayment={() => {
              setPreSelectedInvoiceForPayment(null);
              setIsRecordPaymentOpen(true);
            }}
          />
        )}

        {activeTab === "aging" && (
          <AgingTab
            agingData={agingData}
            onOpenRecordPayment={() => {
              setPreSelectedInvoiceForPayment(null);
              setIsRecordPaymentOpen(true);
            }}
          />
        )}

        {activeTab === "escalations" && (
          <EscalationsTab
            escalations={escalations}
            onApplyEscalation={handleApplyEscalation}
            onWaiveEscalation={handleWaiveEscalation}
          />
        )}

        {activeTab === "occupancy" && (
          <OccupancyTab occupancyData={occupancyData} />
        )}

        {activeTab === "forecast" && (
          <ForecastTab forecastData={forecastData} />
        )}

        {activeTab === "pnl" && (
          <PnlTab
            pnlData={pnlData}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {activeTab === "flex-centre" && (
          <FlexCentreTab />
        )}

        {activeTab === "cam-pools" && (
          <CamPoolsTab selectedProperty={selectedProperty} />
        )}

        {activeTab === "tenants" && (
          <TenantsTab
            tenants={tenants}
            onOpenAddTenant={() => setIsAddTenantOpen(true)}
            onSelectTenant={(t) => {
              const lease = leases.find(l => l.tenantId === t.id);
              if (lease) setSelectedLeaseForDrawer(lease);
            }}
          />
        )}

        {activeTab === "dictionary" && (
          <DictionaryTab />
        )}

        {activeTab === "integrations" && (
          <IntegrationsTab
            organizationName={orgBranding.name}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "audit" && (
          <AuditTab logs={auditLogs} />
        )}
      </div>

      {/* ──── SLIDE-OVER DRAWERS & MODALS ──── */}
      {selectedLeaseForDrawer && (
        <LeaseDetailDrawer
          lease={selectedLeaseForDrawer}
          onClose={() => setSelectedLeaseForDrawer(null)}
          onLeaseUpdated={fetchAllData}
          onOpenApplyEscalation={(l) => {
            setLeaseForEscalation(l);
            setIsApplyEscalationOpen(true);
          }}
          onOpenServeNotice={(l) => {
            setLeaseForNotice(l);
            setIsServeNoticeOpen(true);
          }}
          onOpenRecordPayment={(l) => {
            const inv = invoices.find(i => i.leaseId === l.id && i.balanceDue > 0);
            setPreSelectedInvoiceForPayment(inv || { leaseId: l.id, balanceDue: l.totalOutstanding });
            setIsRecordPaymentOpen(true);
          }}
        />
      )}

      {selectedInvoiceForTaxDrawer && (
        <TaxInvoiceDrawer
          invoice={selectedInvoiceForTaxDrawer}
          onClose={() => setSelectedInvoiceForTaxDrawer(null)}
          onOpenRecordPayment={(inv) => {
            setSelectedInvoiceForTaxDrawer(null);
            setPreSelectedInvoiceForPayment(inv);
            setIsRecordPaymentOpen(true);
          }}
        />
      )}

      <AddLeaseModal
        properties={properties}
        preSelectedSpace={preSelectedSpaceForLease}
        isOpen={isAddLeaseOpen}
        onClose={() => {
          setIsAddLeaseOpen(false);
          setPreSelectedSpaceForLease(null);
        }}
        onSuccess={() => {
          fetchAllData();
          setActionFeedback("Contract successfully created and registered in rent roll.");
          setTimeout(() => setActionFeedback(null), 5000);
        }}
        onOpenAddProperty={() => router.push("/properties/add")}
      />

      <ApplyEscalationModal
        lease={leaseForEscalation}
        isOpen={isApplyEscalationOpen}
        onClose={() => {
          setIsApplyEscalationOpen(false);
          setLeaseForEscalation(null);
        }}
        onSuccess={fetchAllData}
      />

      <RecordPaymentModal
        invoices={invoices}
        preSelectedInvoice={preSelectedInvoiceForPayment}
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPreSelectedInvoiceForPayment(null);
        }}
        onSuccess={fetchAllData}
      />

      <ServeNoticeModal
        lease={leaseForNotice}
        isOpen={isServeNoticeOpen}
        onClose={() => {
          setIsServeNoticeOpen(false);
          setLeaseForNotice(null);
        }}
        onSuccess={fetchAllData}
      />

      <AddExpenseModal
        properties={properties}
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={fetchAllData}
      />

      <AlertsModal
        alerts={alerts}
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        onMarkAllRead={handleMarkAllAlertsRead}
        onNavigateTab={(tab) => {
          setIsAlertsModalOpen(false);
          handleTabChange(tab);
        }}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => {
          setIsAddTenantOpen(false);
          if (searchParams.get("action") === "add-tenant") {
            const currentTab = searchParams.get("tab") || "dashboard";
            router.replace(`/properties/rent-roll?tab=${currentTab}`, { scroll: false });
          }
        }}
        onSuccess={() => {
          fetchAllData();
          if (searchParams.get("action") === "add-tenant") {
            const currentTab = searchParams.get("tab") || "dashboard";
            router.replace(`/properties/rent-roll?tab=${currentTab}`, { scroll: false });
          }
        }}
        properties={properties}
      />

      <ImportRentRollModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAllData}
        properties={properties}
        selectedPropertyId={selectedProperty}
      />

      <ManagePropertiesModal
        isOpen={isManagePropertiesOpen}
        properties={properties}
        onClose={() => setIsManagePropertiesOpen(false)}
        onRemoveProperty={handleRemoveProperty}
        onOpenAddProperty={() => router.push("/properties/add")}
      />

      <DeletePropertyModal
        isOpen={Boolean(propertyToDelete)}
        property={propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={async (id) => {
          await handleRemoveProperty(id);
          setPropertyToDelete(null);
        }}
      />

      {/* Multi-Client Owner Statements Modal (Section 11) */}
      <OwnerStatementsModal
        isOpen={isOwnerStatementsOpen}
        onClose={() => setIsOwnerStatementsOpen(false)}
        clientAccounts={clientAccounts}
      />

      {/* Leasing Deals & Pipeline Modal (Section 7) */}
      <DealsModal
        isOpen={isDealsModalOpen}
        onClose={() => setIsDealsModalOpen(false)}
        onSuccess={fetchAllData}
        properties={properties}
      />

      {/* Automated Billing Run Modal (Section 8 · RR-BIL-01) */}
      <BillingRunModal
        isOpen={isBillingRunModalOpen}
        onClose={() => setIsBillingRunModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          handleTabChange("invoices");
        }}
        activeLeasesCount={leases.filter((l) => l.status === "active" || l.status === "under_notice").length}
      />

      {/* Statutory Adjustment Note Modal (Section 8 · RR-BIL-08) */}
      <AdjustmentNoteModal
        isOpen={isAdjustmentNoteOpen}
        invoice={selectedInvoiceForAdjustment}
        onClose={() => {
          setIsAdjustmentNoteOpen(false);
          setSelectedInvoiceForAdjustment(null);
        }}
        onSuccess={() => {
          fetchAllData();
          setIsAdjustmentNoteOpen(false);
          setSelectedInvoiceForAdjustment(null);
        }}
      />

      {/* Dedicated 4-Section Rent Roll Setup Wizard (RR-ONB-01) */}
      <RentRollConfigWizardModal
        isOpen={isConfigWizardOpen}
        onClose={() => setIsConfigWizardOpen(false)}
        onSuccess={fetchAllData}
      />

      {/* ──── HISTORICAL MONTH-END SNAPSHOTS MODAL (RR-AUD-03) ──── */}
      {isSnapshotsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Historical Month-End Rent Roll Snapshots</h3>
                  <p className="text-xs text-gray-500">Immutable point-in-time statutory audit freeze records (S4.12)</p>
                </div>
              </div>
              <button
                onClick={() => setIsSnapshotsModalOpen(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {historicalSnapshots.length === 0 ? (
              <div className="p-10 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No historical month-end snapshots frozen yet.</p>
                <p className="text-[11px] text-slate-500">
                  Click &ldquo;Freeze Snapshot&rdquo; in the rent roll header to lock the current month-end state for statutory compliance.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {historicalSnapshots.map((snap: any) => (
                  <div
                    key={snap.id}
                    className="p-4 bg-slate-50/80 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-200 rounded-2xl transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black font-mono bg-purple-100 text-purple-800">
                          {snap.snapshotMonth}
                        </span>
                        <span className="text-xs font-bold text-gray-800">As of {snap.asOfDate}</span>
                        {snap.isLocked ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            🔒 Locked &amp; Immutable
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLockSnapshot(snap.id)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                            title="Lock this snapshot to prevent any changes or re-freezes"
                          >
                            Lock Snapshot
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Frozen by {snap.frozenBy || "Finance Controller"} • {new Date(snap.frozenAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Area:</span>
                        <p className="font-bold text-gray-900 font-mono">{(snap.totalArea || snap.totalAreaSqFt)?.toLocaleString()} sqft</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Occupied / Vacant:</span>
                        <p className="font-bold text-teal-700 font-mono">{snap.occupiedSpaces} Occ / {snap.vacantSpaces} Vac</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Monthly Base Rent:</span>
                        <p className="font-bold text-gray-900 font-mono">₹{(snap.totalBaseRent || snap.totalMonthlyRent)?.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Gross:</span>
                        <p className="font-bold text-purple-800 font-mono">₹{snap.totalMonthlyGross?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {snap.lines?.length || 0} demised line items locked
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAsOfDate(snap.asOfDate);
                          setIsSnapshotsModalOpen(false);
                          setActionFeedback(`Loaded historical rent roll view for as-of date: ${snap.asOfDate}`);
                        }}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                      >
                        Inspect As-Of Date →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSnapshotsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── PROFILE & BANKING MODAL ──── */}
      <ProfileAndBankingModal
        isOpen={isProfileBankingOpen}
        onClose={() => setIsProfileBankingOpen(false)}
        onSuccess={fetchAllData}
      />

      {/* ──── ACCOUNTING & ERP INTEGRATIONS HUB ──── */}
      <AccountingIntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
        orgName={orgBranding.name}
      />
    </div>
  );
}

export default function RentRollPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500 font-medium">Loading Rent Roll Engine...</div>}>
      <RentRollPageInner />
    </Suspense>
  );
}
