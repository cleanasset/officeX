"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Building,
  User,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CapaManagementPage() {
  const [capas, setCapas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<any>(null);
  const [closingEvidenceUrl, setClosingEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // New CAPA fields
  const [title, setTitle] = useState("");
  const [action, setAction] = useState("");
  const [actionType, setActionType] = useState("corrective");
  const [ownerName, setOwnerName] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState("high");

  const loadCapas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cm/capa");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCapas(json.data);
      }
    } catch (err) {
      console.error("Error loading CAPAs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapas();
  }, []);

  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cm/capa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          action,
          actionType,
          ownerName: ownerName || "FM Lead Engineer",
          dueDate,
          priority,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to create CAPA");
        setIsSubmitting(false);
        return;
      }

      setActionNotice(`CAPA "${title}" created and assigned.`);
      setModalOpen(false);
      setTitle("");
      setAction("");
      setOwnerName("");
      loadCapas();
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      console.error("Create error:", err);
      setErrorMsg("Network error saving CAPA");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingEvidenceUrl.trim()) {
      setErrorMsg("Rule BR-C08 requires verified evidence URL before closing CAPA");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cm/capa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCapa.id,
          status: "closed",
          evidenceUrl: closingEvidenceUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to close CAPA");
        setIsSubmitting(false);
        return;
      }

      setActionNotice(`CAPA "${selectedCapa.title}" verified and closed with proof.`);
      setCloseModalOpen(false);
      setSelectedCapa(null);
      setClosingEvidenceUrl("");
      loadCapas();
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      console.error("Close error:", err);
      setErrorMsg("Failed to close CAPA");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">CAPA Management (CM-08)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Corrective & Preventive Actions (CAPA)</h1>
          <p className="text-xs text-slate-400">
            Action items triggered from statutory audits, equipment failures, and safety incidents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadCapas}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New CAPA Item</span>
          </button>
        </div>
      </div>

      {loading && capas.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
          <div>Loading live CAPA action items...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {capas.length > 0 ? (
            capas.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white flex items-center gap-2">
                        <span>{c.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Source: <strong className="text-slate-200">{c.sourceType?.toUpperCase()}</strong> • Action: {c.actionType}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                    c.status === "closed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500">Responsible Owner:</span>
                    <div className="text-slate-200 font-semibold">{c.ownerName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Due Resolution Date:</span>
                    <div className="text-slate-200 font-mono font-medium">{c.dueDate}</div>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-900">
                    <span className="text-slate-500">Action Plan:</span>
                    <div className="text-slate-300 mt-0.5">{c.action}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rule BR-C08: Requires uploaded proof of resolution to close.</span>
                  </div>

                  {c.status !== "closed" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCapa(c);
                        setCloseModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Verify Proof & Close
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Closed on {new Date(c.closedAt || c.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
              <div>No open Corrective or Preventive Action items.</div>
              <div className="text-xs text-slate-400 mt-1">All inspection findings and audit snags are fully resolved.</div>
            </div>
          )}
        </div>
      )}

      {/* New CAPA Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Create CAPA Action Plan</h3>
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

            <form onSubmit={handleCreateCapa} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">CAPA Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Replace Emergency Stairwell Fire Door Seals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="corrective">Corrective</option>
                    <option value="preventive">Preventive</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Action Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Exact steps to resolve the root cause..."
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Assigned Lead / Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikas Bansal (FM Lead)"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Target Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                  <span>Issue CAPA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Close Modal (Rule BR-C08) */}
      {closeModalOpen && selectedCapa && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Verify Proof & Close CAPA</h3>
              </div>
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
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

            <form onSubmit={handleCloseCapa} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                <div className="text-slate-500 font-semibold mb-0.5">Closing CAPA:</div>
                <div className="font-bold text-white text-sm">{selectedCapa.title}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Resolution Proof Document / Certificate URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://officex-vault.s3.amazonaws.com/repairs/hydro_test.pdf"
                  value={closingEvidenceUrl}
                  onChange={(e) => setClosingEvidenceUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Rule BR-C08: Must link to contractor service report or testing certificate.
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
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
                  <span>Verify & Mark Closed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
