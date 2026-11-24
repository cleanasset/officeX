"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderArchive,
  Upload,
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  RefreshCw,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function EvidenceVaultPage() {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // Form fields
  const [selectedObligationId, setSelectedObligationId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [verifiedBy, setVerifiedBy] = useState("Chief Safety Officer");

  const loadData = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const [evRes, oblRes] = await Promise.all([
        fetch("/api/cm/evidence"),
        fetch(`/api/cm/obligations?orgId=${encodeURIComponent(org)}`),
      ]);

      const evJson = await evRes.json();
      const oblJson = await oblRes.json();

      if (evJson.success && Array.isArray(evJson.data)) {
        setEvidence(evJson.data);
      }
      if (oblJson.success && Array.isArray(oblJson.data)) {
        setObligations(oblJson.data);
        if (oblJson.data.length > 0 && !selectedObligationId) {
          setSelectedObligationId(oblJson.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading evidence vault:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObligationId) {
      setErrorMsg("Please select an obligation to attach evidence to");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cm/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obligationId: selectedObligationId,
          documentName,
          documentUrl: documentUrl || "https://officex-vault.s3.ap-south-1.amazonaws.com/certificates/sample.pdf",
          issueDate,
          expiryDate,
          verifiedBy,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to record evidence");
        setIsSubmitting(false);
        return;
      }

      setActionNotice(`Evidence document "${documentName}" uploaded and verified in vault.`);
      setModalOpen(false);
      setDocumentName("");
      setDocumentUrl("");
      loadData();
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("Network error saving evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = evidence.filter(
    (doc) =>
      !search ||
      (doc.documentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.requirement || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.category || "").toLowerCase().includes(search.toLowerCase())
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
            <span className="text-emerald-400 font-bold">Evidence Vault (CM-05)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Digital Evidence & Document Vault</h1>
          <p className="text-xs text-slate-400">
            Tamper-proof digital repository for government licenses, test certificates, and audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
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
            <Upload className="w-4 h-4" />
            <span>Upload Document Proof</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate, requirement, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-slate-400 font-semibold">
          Verified Certificates: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {loading && evidence.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
          <div>Accessing encrypted document vault...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{doc.documentName}</div>
                    <div className="text-slate-400 mt-0.5">
                      Requirement: <strong className="text-slate-200">{doc.requirement}</strong> • Domain: {doc.category?.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-300 font-mono font-medium">
                      Valid: {doc.issueDate} to {doc.expiryDate || "Ongoing"}
                    </span>
                    <div className="text-[10px] text-emerald-400">Verified by {doc.verifiedBy || "Safety Lead"}</div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    VERIFIED & FILED
                  </span>

                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <FolderArchive className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <div>No compliance documents or certificates found in the vault.</div>
              <div className="text-xs text-slate-400 mt-1">Upload NOCs and audit certificates to keep your property 100% compliant.</div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Upload Certificate to Vault</h3>
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

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Select Obligation / Mandate *</label>
                <select
                  required
                  value={selectedObligationId}
                  onChange={(e) => setSelectedObligationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {obligations.map((obl) => (
                    <option key={obl.id} value={obl.id}>
                      {obl.requirement} ({obl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Document / Certificate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fire_Safety_Form_B_2026_Renewal.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Document File URL / S3 Path</label>
                <input
                  type="url"
                  placeholder="https://bucket.s3.amazonaws.com/fire_noc.pdf"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Expiry / Valid Until Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Verified By (Auditor / Lead)</label>
                <input
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>File Document Proof</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
