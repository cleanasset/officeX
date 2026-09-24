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
  BookOpen
} from "lucide-react";

import { RentRollHeader } from "@/components/rent-roll/RentRollHeader";
import { DashboardTab } from "@/components/rent-roll/DashboardTab";
import { MasterGridTab, EnrichedLease } from "@/components/rent-roll/MasterGridTab";
import { InvoicesTab, InvoiceItem } from "@/components/rent-roll/InvoicesTab";
import { CollectionsTab, CollectionReceipt } from "@/components/rent-roll/CollectionsTab";
import { AgingTab } from "@/components/rent-roll/AgingTab";
import { EscalationsTab, EscalationRecord } from "@/components/rent-roll/EscalationsTab";
import { OccupancyTab } from "@/components/rent-roll/OccupancyTab";
import { ForecastTab } from "@/components/rent-roll/ForecastTab";
import { PnlTab } from "@/components/rent-roll/PnlTab";
import { TenantsTab, TenantSummary } from "@/components/rent-roll/TenantsTab";
import { AuditTab, AuditLogItem } from "@/components/rent-roll/AuditTab";
import { DictionaryTab } from "@/components/rent-roll/DictionaryTab";

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

const SEED_PROP_IDS = new Set([
  "prop-1",
  "prop-2",
  "prop-3",
  "401f394a-6d27-4c23-9a21-411baa7eef3b",
  "cfa13505-71a5-4a43-be33-37497f416fdc",
  "cf5a0b49-c4fd-4762-ae22-40c42ac6332d",
  "PROP-8841",
  "PROP-FORTUNE-SKY",
  "PROP-001",
  "PROP-1790239048961"
]);

const SEED_PROP_NAMES = new Set([
  "fortune sky",
  "apex horizon tower",
  "signature tower b",
  "eka club",
  "business hub",
  "shivalik shilp",
  "apex business tower",
  "apex commercial tower",
  "meridian tech park",
  "nexus hub",
  "maker maxity",
  "godrej bkc horizon"
]);

const isSeedProperty = (p: any) => {
  if (!p) return true;
  if (SEED_PROP_IDS.has(p.id)) return true;
  const name = (p.name || p.propertyName || "").trim().toLowerCase();
  if (SEED_PROP_NAMES.has(name)) return true;
  if (name.includes("fortune sky") || name.includes("apex horizon") || name.includes("signature tower b")) return true;
  return false;
};

const isSeedLeaseItem = (l: any) => {
  if (!l) return true;
  const propName = (l.propertyName || l.buildingName || "").toLowerCase();
  const tenant = (l.tenantName || "").toLowerCase();
  if (propName.includes("fortune sky") || propName.includes("apex horizon") || propName.includes("signature tower b")) return true;
  if (tenant.includes("nexus enterprise") || tenant.includes("tata consultancy") || tenant.includes("hdfc bank corporate")) return true;
  return false;
};

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

  // Data Store State
  const [properties, setProperties] = useState<any[]>([]);
  const [leases, setLeases] = useState<EnrichedLease[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
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

  // Logged-in Landlord identity state
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "Property Owner & Asset Manager",
    primaryBuilding: ""
  });

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
      const propQuery = selectedProperty !== "ALL" ? `?propertyId=${selectedProperty}` : "";
      const statusQuery = selectedStatus !== "ALL" ? `&status=${selectedStatus}` : "";
      const searchQueryParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

      const [
        propRes,
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
        alertRes
      ] = await Promise.all([
        fetch("/api/rent-roll/properties"),
        fetch(`/api/rent-roll/leases${propQuery}${statusQuery}${searchQueryParam}`),
        fetch(`/api/rent-roll/dashboard${propQuery}`),
        fetch(`/api/rent-roll/invoices${propQuery}`),
        fetch(`/api/rent-roll/collections${propQuery}`),
        fetch(`/api/rent-roll/escalations${propQuery}`),
        fetch(`/api/rent-roll/aging${propQuery}`),
        fetch(`/api/rent-roll/occupancy${propQuery}`),
        fetch(`/api/rent-roll/forecast${propQuery}`),
        fetch(`/api/rent-roll/pnl${propQuery}`),
        fetch(`/api/rent-roll/tenants`),
        fetch(`/api/rent-roll/audit`),
        fetch(`/api/rent-roll/alerts`)
      ]);

      if (propRes.ok) {
        const serverProps = await propRes.json();
        let localProps: any[] = [];
        try {
          localProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        } catch {}
        const mergedMap = new Map();
        serverProps.forEach((p: any) => {
          if (!isSeedProperty(p)) mergedMap.set(p.id, p);
        });
        localProps.forEach((p: any) => {
          if (!isSeedProperty(p)) mergedMap.set(p.id, p);
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
          if (!isSeedLeaseItem(l)) mergedMap.set(l.id || l.tenantName, l);
        });
        localLeases.forEach((l: any) => {
          if (!isSeedLeaseItem(l)) mergedMap.set(l.id || l.tenantName, l);
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
  }, [selectedProperty, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Export CSV
  const handleExportCsv = (type: string) => {
    window.open(`/api/rent-roll/export?type=${type}`, "_blank");
  };

  // Handle Generate Invoices Batch
  const handleGenerateInvoicesBatch = async () => {
    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingMonth: "October 2026" })
      });
      if (res.ok) {
        fetchAllData();
        handleTabChange("invoices");
      }
    } catch (e) {
      console.error("Failed to generate invoices:", e);
    }
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
    { id: "collections", label: "Collections & Receipts", icon: FileCheck2 },
    { id: "aging", label: "Arrears & Aging Ledger", icon: Clock },
    { id: "escalations", label: "Escalation & Expiries", icon: ArrowUpRight },
    { id: "occupancy", label: "Stacking & Occupancy", icon: PieChart },
    { id: "forecast", label: "12-Mo Forecast", icon: Calendar },
    { id: "pnl", label: "NOI & Property P&L", icon: DollarSign },
    { id: "tenants", label: "Tenant Directory & Leases", icon: Users },
    { id: "dictionary", label: "Financial Terms Dictionary", icon: BookOpen },
    { id: "audit", label: "Audit & Config", icon: ShieldCheck },
  ];

  // Don't render dashboard until auth is confirmed
  if (!authChecked) {
    return <div className="p-12 text-center text-gray-500 font-medium">Verifying session...</div>;
  }

  return (
    <div className="flex flex-col gap-5 font-sans relative w-full">
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
        onOpenAddLease={() => setIsAddLeaseOpen(true)}
        onOpenRecordPayment={() => {
          setPreSelectedInvoiceForPayment(null);
          setIsRecordPaymentOpen(true);
        }}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddTenant={() => setIsAddTenantOpen(true)}
        onExportCsv={handleExportCsv}
        onRefresh={fetchAllData}
        isLoading={isLoading}
        unreadAlertsCount={unreadAlerts.length}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        userName={userInfo.name}
        userEmail={userInfo.email}
        userRole={userInfo.role}
        primaryBuildingName={userInfo.primaryBuilding}
        onOpenDeleteProperty={(propId) => {
          const p = properties.find((item) => item.id === propId);
          if (p) setPropertyToDelete(p);
        }}
        onOpenManageProperties={() => setIsManagePropertiesOpen(true)}
      />

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
          />
        )}

        {activeTab === "rentroll" && (
          <MasterGridTab
            leases={leases}
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

        {activeTab === "audit" && (
          <AuditTab logs={auditLogs} />
        )}
      </div>

      {/* ──── SLIDE-OVER DRAWERS & MODALS ──── */}
      {selectedLeaseForDrawer && (
        <LeaseDetailDrawer
          lease={selectedLeaseForDrawer}
          onClose={() => setSelectedLeaseForDrawer(null)}
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
        isOpen={isAddLeaseOpen}
        onClose={() => setIsAddLeaseOpen(false)}
        onSuccess={fetchAllData}
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
