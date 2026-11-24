"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  AlertTriangle,
  Calendar,
  FolderArchive,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Download,
  Flame,
  Activity,
  ChevronRight,
  X,
  Upload,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ComplianceRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [obligations, setObligations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    complianceScore: 100,
    overdueCount: 0,
    criticalOverdueCount: 0,
    dueSoonCount: 0,
    compliantCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // New obligation form
  const [newRequirement, setNewRequirement] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [newCategory, setNewCategory] = useState("fire_safety");
  const [newFrequency, setNewFrequency] = useState("annual");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [newCriticality, setNewCriticality] = useState("critical");

  const loadObligations = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/cm/obligations?orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setObligations(json.data);
        if (json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error("Error loading obligations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObligations();
  }, []);

  const handleCreateObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch("/api/cm/obligations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: org,
          category: newCategory,
          authority: newAuthority || "Government Regulatory Authority",
          requirement: newRequirement,
          frequency: newFrequency,
          ownerName: newOwner || "Compliance Officer",
          criticality: newCriticality,
          nextDueDate: newDueDate,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to create obligation");
        setIsSubmitting(false);
        return;
      }

      setModalOpen(false);
      setActionNotice(`Obligation "${newRequirement}" saved to live database.`);
      setNewRequirement("");
      setNewAuthority("");
      setNewOwner("");
      loadObligations();
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      console.error("Create obligation error:", err);
      setErrorMsg("Network error saving obligation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = obligations.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (o.requirement || "").toLowerCase().includes(q) ||
      (o.authority || "").toLowerCase().includes(q) ||
      (o.ownerName || "").toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" || o.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || (o.computedStatus || o.status) === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Compliance Master (CM-02)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Statutory & Facility Obligations Register
          </h1>
          <p className="text-xs text-slate-400">
            Centrally governed register for Fire NOC, Lift Licenses, Electrical Inspections, and Labour Law mandates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadObligations}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Obligation</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Compliance Score</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{summary.complianceScore}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Weighted statutory rating</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Due Soon (30 Days)</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{summary.dueSoonCount} Renewals</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Approaching regulatory window</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Overdue Obligations</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{summary.overdueCount} Critical</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requires immediate filing</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-500/30" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mandate, authority, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Domains</option>
            <option value="fire_safety">Fire Safety</option>
            <option value="hvac_lift">Elevator / Escalator</option>
            <option value="environmental">Environmental (PCB/STP)</option>
            <option value="labor_law">Labour & Security</option>
            <option value="structural">Structural Stability</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="due_soon">Due Soon (30d)</option>
            <option value="overdue">Overdue</option>
            <option value="critical_overdue">Critical Overdue</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold">
          Active Records: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Obligations Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Requirement & Domain</th>
              <th className="py-3 px-4">Authority</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Assigned Lead</th>
              <th className="py-3 px-4">Next Due Date</th>
              <th className="py-3 px-4">Regulatory Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading && obligations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                  <div>Loading statutory register from live database...</div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{item.requirement}</div>
                    <div className="text-[11px] text-emerald-400 capitalize">{item.category?.replace("_", " ")}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{item.authority || "Municipal Corp"}</td>
                  <td className="py-3.5 px-4 capitalize font-mono text-slate-400">{item.frequency}</td>
                  <td className="py-3.5 px-4 text-slate-200">{item.ownerName || "Compliance Lead"}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Ongoing"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        (item.computedStatus || item.status) === "compliant"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : (item.computedStatus || item.status) === "due_soon"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {(item.computedStatus || item.status)?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/vc/compliance/evidence?obligationId=${item.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 inline-flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Evidence</span>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <FileCheck2 className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <div>No compliance obligations found. Click &quot;Add Obligation&quot; to seed your register.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Add Compliance Obligation</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateObligation} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Requirement / Obligation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Fire Safety Form B NOC Renewal"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Regulatory Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. State Fire Services"
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Domain Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="fire_safety">Fire Safety</option>
                    <option value="hvac_lift">Lift / HVAC</option>
                    <option value="environmental">Environmental</option>
                    <option value="labor_law">Labour Compliance</option>
                    <option value="structural">Structural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Audit Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="annual">Annual (1 Year)</option>
                    <option value="half_yearly">Half-Yearly (6 Mo)</option>
                    <option value="quarterly">Quarterly (3 Mo)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Criticality</label>
                  <select
                    value={newCriticality}
                    onChange={(e) => setNewCriticality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="critical">Critical (Mandatory Gating)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Owner / Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Safety Officer"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Next Due / Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save to Live Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
