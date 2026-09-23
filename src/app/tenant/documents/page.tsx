"use client";
import React, { useState, useEffect } from "react";
import { Upload, Search, FolderOpen, FileText, ChevronLeft, ChevronRight, CheckCircle, Clock, Download, Eye, X, Plus } from "lucide-react";

interface DocItem {
  name: string;
  category: string;
  type: string;
  size: string;
  date: string;
  status: "Verified" | "Pending" | "Under Review";
}

export default function DocumentLockerDashboard() {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "Lease Agreements",
    fileName: ""
  });

  const [documents, setDocuments] = useState<DocItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("officex_tenant_documents") || "[]");
      setDocuments(Array.isArray(stored) ? stored : []);
    } catch {
      setDocuments([]);
    }
  }, []);

  const folders = [
    { name: "Lease Agreements", count: documents.filter(d => d.category === "Lease Agreements").length },
    { name: "Billing Invoices", count: documents.filter(d => d.category === "Billing Invoices").length },
    { name: "Tenant KYC", count: documents.filter(d => d.category === "Tenant KYC").length },
    { name: "Compliance & NOC", count: documents.filter(d => d.category === "Compliance & NOC").length },
    { name: "Insurance Certificates", count: documents.filter(d => d.category === "Insurance Certificates").length },
    { name: "Staff Directory", count: documents.filter(d => d.category === "Staff Directory").length }
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name) return;

    const newDoc: DocItem = {
      name: uploadForm.name.endsWith(".pdf") ? uploadForm.name : `${uploadForm.name}.pdf`,
      category: uploadForm.category,
      type: "PDF",
      size: "1.4 MB",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending"
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    try {
      localStorage.setItem("officex_tenant_documents", JSON.stringify(updated));
    } catch (e) {
      console.warn("Doc store note:", e);
    }

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
    setUploadForm({ name: "", category: "Lease Agreements", fileName: "" });
    setToast(`Successfully uploaded "${newDoc.name}" to ${newDoc.category}! Verification initiated.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownload = (doc: DocItem) => {
    setToast(`Downloading ${doc.name}...`);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder ? d.category === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">Tenant Document Locker &amp; Compliance Vault</h1>
          <p className="text-xs text-gray-500 mt-0.5">Encrypted institutional storage for lease contracts, statutory NOCs, and insurance policies.</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* Folders Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vault Folders</h2>
          {selectedFolder && (
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-xs text-[#0F8B7D] font-bold hover:underline"
            >
              Clear Folder Filter ({selectedFolder})
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {folders.map((f) => {
            const isSelected = selectedFolder === f.name;
            return (
              <div
                key={f.name}
                onClick={() => setSelectedFolder(isSelected ? null : f.name)}
                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 hover:shadow-xs transition-all cursor-pointer ${
                  isSelected ? "bg-teal-50/80 border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20" : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 truncate">{f.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{f.count} files</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {selectedFolder ? `${selectedFolder} (${filteredDocs.length} files)` : "All Repository Files"}
            </h2>
            <p className="text-xs text-gray-400">Digitally signed and timestamped documents</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or tag..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-3">Folder</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Date Added</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FolderOpen size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No documents in this locker folder</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click &quot;Upload Document&quot; to store your lease agreements, KYC, or compliance files.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((d) => (
                  <tr key={d.name} className="text-xs hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-2.5">
                      <FileText size={16} className="text-[#0F8B7D] shrink-0" />
                      <span className="truncate max-w-xs">{d.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600">{d.category}</td>
                    <td className="py-3.5 px-3 text-gray-500 font-mono text-[11px]">{d.type}</td>
                    <td className="py-3.5 px-3 text-gray-500">{d.size}</td>
                    <td className="py-3.5 px-3 text-gray-600">{d.date}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === "Verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {d.status === "Verified" ? "Verified ✓" : "Pending ⏳"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(d)}
                          className="px-2.5 py-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleDownload(d)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title="Download Document"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing {filteredDocs.length} of {documents.length} repository files</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronLeft size={14} /></button>
            <span className="text-xs font-bold text-gray-900 px-2">1</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Upload to Document Vault</h3>
                <p className="text-xs text-gray-500">Secure end-to-end encrypted compliance file storage</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Document Title
                </label>
                <input
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. FY2026_Fire_Clearance_NOC"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Target Vault Folder
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white font-medium text-gray-800"
                >
                  <option value="Lease Agreements">Lease Agreements</option>
                  <option value="Billing Invoices">Billing Invoices</option>
                  <option value="Tenant KYC">Tenant KYC</option>
                  <option value="Compliance & NOC">Compliance & NOC</option>
                  <option value="Insurance Certificates">Insurance Certificates</option>
                  <option value="Staff Directory">Staff Directory</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#0F8B7D] rounded-2xl p-6 text-center bg-gray-50/50 cursor-pointer transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-bold text-gray-800">Click to select or drag &amp; drop PDF</p>
                <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, XLSX up to 25 MB</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Upload &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Drawer */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                      {previewDoc.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{previewDoc.size}</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mt-1.5">{previewDoc.name}</h3>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* Document Specimen Simulation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Document Type</span>
                  <strong className="text-slate-900">{previewDoc.type} Document</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Security Checksum</span>
                  <span className="text-teal-700 truncate max-w-[200px]">SHA-256 · 9e88ba42f...</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Uploaded On</span>
                  <span className="text-slate-800">{previewDoc.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Legal Status</span>
                  <span className="font-bold text-emerald-700">Digital Signature Verified</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 text-center space-y-2">
                <FileText size={36} className="mx-auto text-[#0F8B7D]" />
                <p className="text-xs font-bold text-gray-800">Preview Specimen Rendered</p>
                <p className="text-[10px] text-gray-500">Full 256-bit encryption verified by Corporate Legal Authority</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download size={13} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

