"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardHat,
  Wrench,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileCheck,
  ChevronLeft,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function PermitToWorkPage() {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // Form fields
  const [contractorName, setContractorName] = useState("");
  const [permitType, setPermitType] = useState("hot_work");
  const [location, setLocation] = useState("Tower 1 • Technical Plant Room");
  const [riskControls, setRiskControls] = useState("PPE mandatory, fire extinguisher standby, work area barricaded.");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 16));
  const [validTo, setValidTo] = useState(
    new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cm/permits");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPermits(json.data);
      }
    } catch (err) {
      console.error("Error fetching permits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, []);

  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cm/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorName,
          permitType,
          riskControls,
          validFrom,
          validTo,
          propertyName: location,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to create permit");
        setIsSubmitting(false);
        return;
      }

      setActionNotice(`Permit ${json.data.permitNumber} generated and authorized.`);
      setModalOpen(false);
      setContractorName("");
      fetchPermits();
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      console.error("Create permit error:", err);
      setErrorMsg("Network error creating permit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = permits.filter(
    (p) =>
      !search ||
      (p.contractorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.permitNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.permitType || "").toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="text-amber-400 font-bold">Permits to Work (CM-09)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Contractor Work Permits (PTW)</h1>
          <p className="text-xs text-slate-400">
            Digital permits for hazardous tasks: Hot Work, Height Work, Confined Space, and Electrical Isolation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPermits}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Permit</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contractor, PTW #, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-slate-400 font-semibold">
          Authorized Permits: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {loading && permits.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
          <div>Checking active work permits from database...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-400">{p.permitNumber}</span>
                        <span className="text-sm font-bold text-white capitalize">{p.permitType?.replace("_", " ")}</span>
                      </div>
                      <div className="text-xs text-slate-400">{p.contractorName}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase self-start sm:self-center ${
                    p.status === "approved" || p.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500">Authorized Facility / Location:</span>
                    <div className="text-slate-200 font-semibold">{p.propertyName || "Tower A"}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Safety Approver:</span>
                    <div className="text-slate-200">{p.approverName || "Safety Officer"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Validity Window:</span>
                    <div className="text-slate-300 font-mono mt-0.5">
                      {new Date(p.validFrom).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} to {new Date(p.validTo).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-900">
                    <span className="text-slate-500">Mandatory Controls:</span>
                    <div className="text-amber-300/80 text-[11px] mt-0.5">{p.riskControls}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <HardHat className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <div>No Work Permits on file. Click &quot;New Work Permit&quot; to issue one.</div>
            </div>
          )}
        </div>
      )}

      {/* New Permit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Issue Permit to Work (PTW)</h3>
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

            <form onSubmit={handleCreatePermit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Contractor / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Otis Elevator India Pvt Ltd"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Permit Classification</label>
                  <select
                    value={permitType}
                    onChange={(e) => setPermitType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="hot_work">Hot Work & Welding</option>
                    <option value="height">Working at Height</option>
                    <option value="electrical">Electrical Isolation</option>
                    <option value="confined_space">Confined Space</option>
                    <option value="maintenance">Heavy Equipment Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Location / Zone</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    required
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mandatory Risk Controls</label>
                <textarea
                  rows={2}
                  value={riskControls}
                  onChange={(e) => setRiskControls(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Authorize Permit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
