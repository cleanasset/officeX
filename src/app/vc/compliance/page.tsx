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
} from "lucide-react";

export default function ComplianceRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [obligations, setObligations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // New obligation form
  const [newRequirement, setNewRequirement] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [newCategory, setNewCategory] = useState("fire_safety");
  const [newFrequency, setNewFrequency] = useState("annual");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-12-31");
  const [newCriticality, setNewCriticality] = useState("critical");

  const loadObligations = async () => {
    try {
      const res = await fetch("/api/vc/dashboard?orgId=org_officex_demo");
      const json = await res.json();
      if (json.success && json.data.recentObligations) {
        setObligations(json.data.recentObligations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObligations();
  }, []);

  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: `obl_${Date.now()}`,
      category: newCategory,
      authority: newAuthority,
      requirement: newRequirement,
      frequency: newFrequency,
      ownerName: newOwner,
      criticality: newCriticality,
      status: "compliant",
      nextDueDate: newDueDate,
    };
    setObligations([newItem, ...obligations]);
    setModalOpen(false);
    setActionNotice(`New compliance obligation "${newRequirement}" added to register.`);
    setNewRequirement("");
    setNewAuthority("");
    setNewOwner("");
    setTimeout(() => setActionNotice(""), 4000);
  };

  const filtered = obligations.filter((o) => {
    const matchesSearch =
      (o.requirement || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.authority || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.ownerName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || o.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || o.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const compliantCount = obligations.filter((o) => o.status === "compliant").length;
  const dueSoonCount = obligations.filter((o) => o.status === "due_soon").length;
  const overdueCount = obligations.filter((o) => o.status === "overdue" || o.status === "critical_overdue").length;

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
            <div className="text-xs text-slate-400 font-semibold uppercase">Compliant Obligations</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{compliantCount} Active</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Valid certificates filed</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Due Next 30 Days</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{dueSoonCount} Renewals</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requires vendor/lab submission</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Overdue Items</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{overdueCount} Overdue</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Risk of statutory audit penalties</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-500/30" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search obligation, authority, owner..."
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
            <option value="fire_safety">Fire & Life Safety</option>
            <option value="hvac_lift">Elevator & Electrical</option>
            <option value="environmental">Environmental / Pollution</option>
            <option value="statutory">Structural & Building</option>
            <option value="labor_law">Labour Law & Security</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="due_soon">Due Soon</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold">
          Filtered Obligations: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Statutory Requirement</th>
              <th className="py-3 px-4">Authority & Domain</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Responsible Lead</th>
              <th className="py-3 px-4">Next Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs">
                    <div className="line-clamp-2">{o.requirement}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                      Criticality: <span className={o.criticality === "critical" ? "text-rose-400 font-bold" : "text-blue-400"}>{o.criticality.toUpperCase()}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{o.authority || "State Authority"}</div>
                    <div className="text-slate-500 text-[11px] uppercase tracking-wider">
                      {o.category.replace("_", " ")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-slate-300">
                    {o.frequency.replace("_", " ")}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{o.ownerName}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {o.nextDueDate ? new Date(o.nextDueDate).toLocaleDateString() : "Ongoing"}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      o.status === "compliant"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : o.status === "due_soon"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                    }`}>
                      {o.status === "compliant" ? "Compliant" : o.status === "due_soon" ? "Due Soon" : "Overdue"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Opening certificate proof for ${o.requirement}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-1"
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
                      <span>Evidence</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <FileCheck2 className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <div>No obligations matching criteria.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD OBLIGATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Add Compliance Obligation</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObligation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Obligation Requirement Title *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. DG Set Smoke Emission & Acoustic Enclosure Decibel Audit"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Regulatory Authority *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State PCB"
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Compliance Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="fire_safety">Fire & Safety</option>
                    <option value="hvac_lift">Elevator / HVAC</option>
                    <option value="environmental">Environmental</option>
                    <option value="statutory">Structural</option>
                    <option value="labor_law">Labour Law</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Recurrence Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Responsible Officer / Facility Lead *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Sharma (EHS Manager)"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Save Obligation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
