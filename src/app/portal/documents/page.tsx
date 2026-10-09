"use client";

import React, { useState, useEffect } from "react";
import {
  FolderLock,
  FileText,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  X
} from "lucide-react";

export default function TenantDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state (§T-07)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState("insurance_certificate");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  useEffect(() => {
    loadDocuments();

    const handleOccChange = () => {
      loadDocuments();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/documents");
      const json = await res.json();
      if (json.success) {
        setDocuments(json.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName) {
      alert("Please enter a document title or select a file.");
      return;
    }

    try {
      setUploading(true);
      // Fetch contract id to link
      const cRes = await fetch("/api/portal/contract");
      const cJson = await cRes.json();
      const contractId = cJson.contract?.id;

      if (!contractId) {
        alert("Active contract not found to link this document.");
        return;
      }

      const res = await fetch("/api/portal/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: contractId,
          doc_type: docType,
          file_name: fileName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUploadModalOpen(false);
        setFileName("");
        loadDocuments();
        alert("Document uploaded successfully! It is now under review by building management.");
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lease Documents & Repository</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Access signed legal agreements, handover letters, and submit compliance certificates.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Upload size={14} /> Upload Compliance Document
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4 text-center">Version</th>
                <th className="py-3 px-4">Upload / Effective Date</th>
                <th className="py-3 px-4 text-center">Review Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No documents published yet for your tenancy.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.file_name}</span>
                          <span className="text-[10px] text-slate-400">PDF Document</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 capitalize font-semibold">
                      {String(doc.doc_type || "Agreement").replace(/_/g, " ")}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        v{doc.version || "1.0"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {doc.effective_date
                        ? new Date(doc.effective_date).toLocaleDateString("en-IN")
                        : new Date(doc.created_at || Date.now()).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          doc.status === "executed" || doc.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {doc.status === "executed" ? "Active Executed" : doc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                        <a
                          href={doc.file_url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Download size={12} /> Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal (§T-07) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Upload Compliance Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Category *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                >
                  <option value="insurance_certificate">Tenant Insurance Certificate (CGL / Fire)</option>
                  <option value="fire_noc">Fire Safety NOC / Handover Letter</option>
                  <option value="tds_certificate">Form 16A TDS Certificate</option>
                  <option value="trade_license">Municipal Trade License / Registration</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title / File Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CGL_Insurance_Policy_2026_27.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50">
                <Upload size={20} className="text-indigo-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-indigo-600 block">Select PDF Document</span>
                <span className="text-[10px] text-slate-400">PDF, max 15MB</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Viewer */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{viewingDoc.file_name}</h3>
                <p className="text-[11px] text-slate-400 capitalize">Category: {viewingDoc.doc_type}</p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <FileText size={48} className="text-indigo-600 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Official Commercial Lease Record</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Secure digital copy recorded on OFFICEX platform. Stored in tamper-proof cloud vault.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={viewingDoc.file_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download size={14} /> Open / Download File
                </a>
              </div>
            </div>

            <button
              onClick={() => setViewingDoc(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
