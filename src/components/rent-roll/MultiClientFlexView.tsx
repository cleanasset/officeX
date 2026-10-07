"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Download,
} from "lucide-react";

interface MultiClientFlexViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MultiClientFlexView({
  isOpen,
  onClose,
}: MultiClientFlexViewProps) {
  const [activeTab, setActiveTab] = useState<"statements" | "flex" | "pnl">("statements");

  // Client accounts list
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Owner statement
  const [statement, setStatement] = useState<any | null>(null);
  const [loadingStatement, setLoadingStatement] = useState(false);

  // Flex dashboard & Centre P&L
  const [flexDashboard, setFlexDashboard] = useState<any | null>(null);
  const [loadingFlex, setLoadingFlex] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadFlexDashboard();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedClientId) {
      loadStatement(selectedClientId);
    }
  }, [isOpen, selectedClientId]);

  async function loadClients() {
    try {
      const res = await fetch("/api/rent-roll/occupants");
      // Also fetch properties to get client accounts
      const stmtRes = await fetch("/api/multi-client/owner-statement");
      const stmtJson = await stmtRes.json();
      if (stmtJson.success && stmtJson.statement) {
        setSelectedClientId(stmtJson.statement.client_account_id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadStatement(clientId: string) {
    try {
      setLoadingStatement(true);
      const res = await fetch(`/api/multi-client/owner-statement?client_account_id=${clientId}`);
      const json = await res.json();
      if (json.success) {
        setStatement(json.statement);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatement(false);
    }
  }

  async function loadFlexDashboard() {
    try {
      setLoadingFlex(true);
      const res = await fetch("/api/flex/dashboard");
      const json = await res.json();
      if (json.success) {
        setFlexDashboard(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFlex(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Multi-Client Portfolios & Flex Operations (§4.3, §4.7, §5.10–11)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  PHASE P4 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generate owner statements with management fee deductions, manage flex seat billing, and track centre P&L against head leases.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("statements")}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === "statements"
                ? "border-indigo-600 text-indigo-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Owner Statements & Mandates (RR-MC-01, RR-MC-02)
          </button>

          <button
            onClick={() => setActiveTab("flex")}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === "flex"
                ? "border-indigo-600 text-indigo-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Flex Operations & Seat Billing (RR-MC-04)
          </button>

          <button
            onClick={() => setActiveTab("pnl")}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === "pnl"
                ? "border-indigo-600 text-indigo-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Centre P&L & Head Leases (RR-MC-05, RR-MC-06)
          </button>
        </div>

        {/* Tab 1: Owner Statements */}
        {activeTab === "statements" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {loadingStatement ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Computing owner statement...
              </div>
            ) : !statement ? (
              <div className="text-center py-12 text-slate-400 text-xs">No statement data available</div>
            ) : (
              <>
                {/* Client Account Summary Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                      Client Account
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {statement.client_name} ({statement.client_code})
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Billing Entity: <span className="text-white font-semibold">{statement.billing_entity?.entity_name || "Primary Operator Entity"}</span> • 
                      GSTIN: <span className="font-mono text-indigo-200">{statement.billing_entity?.gst_number || "27AABCT2345M1Z2"}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Statement Period</span>
                    <p className="text-xs font-semibold text-white">{statement.period_start} to {statement.period_end}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-[11px] font-bold">
                      Mandate: {statement.management_fee?.rate_or_fixed}
                    </span>
                  </div>
                </div>

                {/* Financial Statement Flow Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">1. Gross Invoiced</p>
                    <p className="text-base font-bold text-slate-900 font-mono mt-1">
                      ₹{statement.gross_invoiced_inr?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Total billings raised</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                    <p className="text-[11px] font-semibold text-emerald-800 uppercase">2. Gross Collections</p>
                    <p className="text-base font-bold text-emerald-950 font-mono mt-1">
                      ₹{statement.gross_collections_inr?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Actual cash collected</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase">3. Management Fee Deducted</p>
                    <p className="text-base font-bold text-amber-950 font-mono mt-1">
                      -₹{statement.management_fee?.fee_amount_inr?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-amber-700 mt-0.5">{statement.management_fee?.rate_or_fixed}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-indigo-300 bg-indigo-900 text-white">
                    <p className="text-[11px] font-semibold text-indigo-200 uppercase">4. Net Payout to Owner</p>
                    <p className="text-lg font-bold text-white font-mono mt-1">
                      ₹{statement.net_payable_to_owner_inr?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-indigo-300 mt-0.5">Post fee &amp; opex remittance</p>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">
                      Client Portfolio Invoices ({statement.invoices_summary?.length || 0})
                    </h4>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-4">Invoice #</th>
                        <th className="py-2.5 px-4">Occupant</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4 text-right">Gross Total (₹)</th>
                        <th className="py-2.5 px-4 text-right">Collected (₹)</th>
                        <th className="py-2.5 px-4 text-right">Balance Due (₹)</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statement.invoices_summary?.map((inv: any) => (
                        <tr key={inv.invoice_number} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{inv.occupant_name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{inv.invoice_date}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-700">₹{inv.gross_total?.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">₹{inv.amount_paid?.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-rose-700">₹{inv.balance_due?.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Flex Operations & Seat Billing */}
        {activeTab === "flex" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {loadingFlex ? (
              <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading flex seat operations...
              </div>
            ) : !flexDashboard ? (
              <div className="text-center py-12 text-slate-400 text-xs">No flex data available</div>
            ) : (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Capacity</p>
                    <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                      {flexDashboard.summary.total_seats} Seats
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Across {flexDashboard.summary.total_centres} centres</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                    <p className="text-[11px] font-semibold text-emerald-800 uppercase">Occupied Seats</p>
                    <p className="text-xl font-bold text-emerald-950 font-mono mt-1">
                      {flexDashboard.summary.occupied_seats} Seats
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">{flexDashboard.summary.overall_occupancy_pct}% occupancy</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase">Vacant Seats</p>
                    <p className="text-xl font-bold text-amber-950 font-mono mt-1">
                      {flexDashboard.summary.vacant_seats} Seats
                    </p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Available for leasing</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60">
                    <p className="text-[11px] font-semibold text-indigo-800 uppercase">Monthly Flex Revenue</p>
                    <p className="text-xl font-bold text-indigo-950 font-mono mt-1">
                      ₹{flexDashboard.summary.total_monthly_revenue_inr?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-indigo-700 mt-0.5">Seat contracts + ancillary</p>
                  </div>
                </div>

                {/* Centres List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">
                      Flex Centre Seat Inventories &amp; Occupancy (RR-MC-04)
                    </h4>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-4">Centre / Property</th>
                        <th className="py-2.5 px-4 text-center">Total Seats</th>
                        <th className="py-2.5 px-4 text-center">Occupied</th>
                        <th className="py-2.5 px-4 text-center">Vacant</th>
                        <th className="py-2.5 px-4 text-center">Occupancy %</th>
                        <th className="py-2.5 px-4 text-right">Seat Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {flexDashboard.centres?.map((c: any) => (
                        <tr key={c.property_id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {c.property_name}
                            <span className="block text-[10px] text-slate-500 font-mono font-normal">{c.property_code}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold">{c.total_seats}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{c.occupied_seats}</td>
                          <td className="py-3 px-4 text-center font-mono text-amber-700">{c.vacant_seats}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {c.seat_occupancy_pct}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₹{c.revenue.seat_billing_revenue_inr?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Centre P&L & Head Leases */}
        {activeTab === "pnl" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase">
                  Flex Operator Centre P&amp;L Matrix (§4.8, §5.10–11)
                </h4>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Centre P&amp;L = Flex Seat Revenue − Head Lease Cost (direction=payable to Landlord) − Operating Expenses.
                </p>
              </div>
            </div>

            {flexDashboard?.centres?.map((c: any) => (
              <div key={c.property_id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <h4 className="text-sm font-bold text-slate-900">{c.property_name} ({c.property_code})</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    NOI Margin: {c.profit_margin_pct}%
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Flex Revenue</span>
                    <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                      ₹{c.revenue.total_flex_revenue_inr?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500">Seat billing + ancillary</span>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-[10px] text-rose-800 font-semibold uppercase block">Head Lease Cost (Payable)</span>
                    <span className="text-base font-bold font-mono text-rose-950 mt-1 block">
                      -₹{c.costs.head_lease_cost_inr?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-rose-700">Payable contract to landlord</span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-[10px] text-amber-800 font-semibold uppercase block">Operating Expenses</span>
                    <span className="text-base font-bold font-mono text-amber-950 mt-1 block">
                      -₹{c.costs.operating_expenses_inr?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-amber-700">Facilities, utilities, community</span>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] text-emerald-800 font-semibold uppercase block">Net Operating Income</span>
                    <span className="text-base font-bold font-mono text-emerald-950 mt-1 block">
                      ₹{c.net_operating_income_inr?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-emerald-700">Net centre profit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
