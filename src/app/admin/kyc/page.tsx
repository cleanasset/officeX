"use client";
import React, { useState } from "react";
import { CheckCircle, ExternalLink, FileText, X, Download, ShieldCheck } from "lucide-react";

export default function VendorKYCDashboard() {
  const [selectedVendor, setSelectedVendor] = useState("TechServe Solutions");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ type: string; file: string; size: string } | null>(null);

  const [vendors, setVendors] = useState([
    { name: "TechServe Solutions", submitted: "22-Aug", category: "Facility Management", status: "Pending", gstin: "27AABCS1420M1Z3", pan: "AABCS1420M", rating: "4.8/5" },
    { name: "CleanPro Services", submitted: "21-Aug", category: "Housekeeping", status: "Pending", gstin: "24AAACZ1120K1Z9", pan: "AAACZ1120K", rating: "4.6/5" },
    { name: "SafeSecure Systems", submitted: "20-Aug", category: "Security", status: "Pending", gstin: "27BBBPS9021M2Z1", pan: "BBBPS9021M", rating: "4.9/5" },
    { name: "GreenScape Ltd", submitted: "19-Aug", category: "Landscaping", status: "Approved", gstin: "27CCCPL3310N1Z4", pan: "CCCPL3310N", rating: "4.7/5" },
    { name: "PowerLink Electrics", submitted: "18-Aug", category: "Electrical", status: "Approved", gstin: "24DDDPK8890P1Z6", pan: "DDDPK8890P", rating: "4.5/5" }
  ]);

  const documents = [
    { type: "Trade License", status: "Valid", approved: true, file: "Municipal_Trade_License_2026.pdf", size: "1.4 MB" },
    { type: "Labor License", status: "Valid", approved: true, file: "Contract_Labor_Regulation_Certificate.pdf", size: "2.1 MB" },
    { type: "Insurance Certificate", status: "Valid", approved: true, file: "Workmen_Compensation_Policy_2026.pdf", size: "890 KB" }
  ];

  const currentVendor = vendors.find(v => v.name === selectedVendor) || vendors[0];

  const handleApprove = () => {
    setVendors(prev => prev.map(v => v.name === selectedVendor ? { ...v, status: "Approved" } : v));
    setToast(`Successfully approved ${selectedVendor}! Live vendor badge granted.`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleReject = () => {
    setVendors(prev => prev.map(v => v.name === selectedVendor ? { ...v, status: "Rejected" } : v));
    setToast(`Application for ${selectedVendor} marked as Rejected.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex gap-0 font-sans h-[calc(100vh-120px)] relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Vendor List */}
      <div className="w-[360px] border-r border-gray-200 p-6 overflow-y-auto bg-slate-50/50 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">KYC Verification</h2>
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-800 border border-teal-200">
            {vendors.filter(v => v.status === "Pending").length} Pending
          </span>
        </div>
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.name}
              onClick={() => setSelectedVendor(v.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedVendor === v.name
                  ? "border-[#0F8B7D] border-l-4 bg-white shadow-2xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-900">{v.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  v.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                  v.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {v.status}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">📅 Submitted: {v.submitted}</p>
              <p className="text-[10px] text-gray-500">🏢 Category: {v.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-gray-900">{currentVendor.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentVendor.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                currentVendor.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
              }`}>
                {currentVendor.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600">{currentVendor.category}</span>
              <span className="text-xs text-gray-500">⭐ Verified Rating: {currentVendor.rating}</span>
            </div>
          </div>
        </div>

        {/* Automated Verifications */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">1. Automated Database Verification</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-1">GSTIN: {currentVendor.gstin}</p>
            <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold"><CheckCircle size={14} /> Checked (Active GSTN match)</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-1">PAN: {currentVendor.pan}</p>
            <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold"><CheckCircle size={14} /> Checked (Corporate Income Tax match)</p>
          </div>
        </div>

        {/* Document Checklist */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">2. Compliance Document Checklist</h3>
        <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.type} className="border-b border-gray-100 text-xs hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{d.type}</td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{d.file}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{d.status}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setPreviewDoc({ type: d.type, file: d.file, size: d.size })}
                      className="text-[#0F8B7D] hover:underline text-xs flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <FileText size={13} /> View PDF
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center ml-auto">
                      <CheckCircle size={12} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Notes */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">3. SuperAdmin Audit Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes regarding this vendor verification or bank penny drop remarks..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-20 mb-6 focus:outline-none focus:border-[#0F8B7D]"
        />

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setToast("Requested clarification notice dispatched to vendor.");
              setTimeout(() => setToast(null), 3000);
            }}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Request Clarification
          </button>
          <button
            onClick={handleReject}
            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
          >
            Reject Application
          </button>
          <button
            onClick={handleApprove}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle size={14} /> Approve Vendor Profile
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                  {previewDoc.type}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-1">{previewDoc.file}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">File Size</span>
                <strong className="text-slate-900">{previewDoc.size}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuing Authority</span>
                <span className="text-slate-800">Govt. of Maharashtra / Municipal Corp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Hash</span>
                <span className="text-teal-700">SHA-256 Verified ✓</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 text-center space-y-2">
              <FileText size={36} className="mx-auto text-[#0F8B7D]" />
              <p className="text-xs font-bold text-gray-800">Specimen Document Preview</p>
              <p className="text-[10px] text-gray-400">Digitally notarized statutory compliance certificate</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setToast(`Downloading ${previewDoc.file}...`);
                  setTimeout(() => setToast(null), 2500);
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
