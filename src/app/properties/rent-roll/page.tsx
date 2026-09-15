"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Plus
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

import { LeaseDetailDrawer } from "@/components/rent-roll/LeaseDetailDrawer";
import { TaxInvoiceDrawer } from "@/components/rent-roll/TaxInvoiceDrawer";
import { AddLeaseModal } from "@/components/rent-roll/AddLeaseModal";
import { RecordPaymentModal } from "@/components/rent-roll/RecordPaymentModal";
import { ServeNoticeModal } from "@/components/rent-roll/ServeNoticeModal";
import { AddExpenseModal } from "@/components/rent-roll/AddExpenseModal";
import { AlertsModal, AlertNotification } from "@/components/rent-roll/AlertsModal";
import { AddTenantModal } from "@/components/rent-roll/AddTenantModal";

export default function RentRollPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState<boolean>(false);

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

      if (propRes.ok) setProperties(await propRes.json());
      if (leasesRes.ok) setLeases(await leasesRes.json());
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
        setActiveTab("invoices");
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
    { id: "dashboard", label: "Dashboard", icon: Building2 },
    { id: "rentroll", label: "Rent Roll Master", icon: TrendingUp },
    { id: "invoices", label: "Invoices & Billing", icon: Receipt },
    { id: "collections", label: "Collections Ledger", icon: FileCheck2 },
    { id: "aging", label: "AR Aging Analysis", icon: Clock },
    { id: "escalations", label: "Escalations", icon: ArrowUpRight },
    { id: "occupancy", label: "Stacking & Occupancy", icon: PieChart },
    { id: "forecast", label: "12-Mo Forecast", icon: Calendar },
    { id: "pnl", label: "Property P&L / NOI", icon: DollarSign },
    { id: "tenants", label: "Tenants Master", icon: Users },
    { id: "audit", label: "Audit & Config", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* ──── TOP GLOBAL HEADER ──── */}
      <RentRollHeader
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
        onOpenGenerateInvoices={handleGenerateInvoicesBatch}
        onExportCsv={handleExportCsv}
        onRefresh={fetchAllData}
        isLoading={isLoading}
        unreadAlertsCount={unreadAlerts.length}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
      />

      {/* ──── TAB NAVIGATION BAR ──── */}
      <div className="px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-[138px] lg:top-[118px] z-20 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──── MAIN BODY CONTENT ──── */}
      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === "dashboard" && (
          <DashboardTab
            data={dashboardData}
            onNavigateTab={setActiveTab}
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
            onOpenApplyEscalation={handleApplyEscalation as any}
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

        {activeTab === "audit" && (
          <AuditTab logs={auditLogs} />
        )}
      </main>

      {/* ──── SLIDE-OVER DRAWERS & MODALS ──── */}
      {selectedLeaseForDrawer && (
        <LeaseDetailDrawer
          lease={selectedLeaseForDrawer}
          onClose={() => setSelectedLeaseForDrawer(null)}
          onOpenApplyEscalation={handleApplyEscalation as any}
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
          setActiveTab(tab);
        }}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onSuccess={fetchAllData}
      />
    </div>
  );
}
