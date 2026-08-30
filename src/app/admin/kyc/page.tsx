"use client";
import React, { useState } from "react";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function VendorKYCDashboard() {
  const [selectedVendor, setSelectedVendor] = useState("TechServe Solutions");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const vendors = [
    { name: "TechServe Solutions", submitted: "22-Aug", category: "Facility Management" },
    { name: "CleanPro Services", submitted: "21-Aug", category: "Housekeeping" },
    { name: "SafeSecure Systems", submitted: "20-Aug", category: "Security" },
    { name: "GreenScape Ltd", submitted: "19-Aug", category: "Landscaping" },
    { name: "PowerLink Electrics", submitted: "18-Aug", category: "Electrical" }
  ];

  const documents = [
    { type: "Trade License", status: "Valid", approved: true },
    { type: "Labor License", status: "Valid", approved: true },
    { type: "Insurance Certificate", status: "Valid", approved: true }
  ];

  return (
    <div className="flex gap-0 font-sans h-[calc(100vh-120px)] relative">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /><span>{toast}</span></div>}

      {/* Vendor List */}
      <div className="w-[380px] border-r border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-sm font-bold text-gray-900">Pending Verification</h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">5 Applications</span>
        </div>
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.name} onClick={() => setSelectedVendor(v.name)} className={`p-4 rounded-xl border cursor-pointer ${selectedVendor === v.name ? "border-red-400 border-l-4 border-l-red-500 bg-white" : "border-gray-200 hover:bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-900">{v.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">Pending</span>
              </div>
              <p className="text-[10px] text-gray-500">📅 Submitted: {v.submitted}</p>
              <p className="text-[10px] text-gray-500">🏢 Category: {v.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">TechServe Solutions</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">Facility Management</span>
              <span className="text-xs text-gray-500">⭐ Verified Rating: 4.8/5</span>
            </div>
          </div>
          <button className="text-gray-400 cursor-pointer"><ExternalLink size={18} /></button>
        </div>

        {/* Automated Verifications */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Automated Verifications</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-1">GSTIN: 27AABCS1420M1Z3</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Checked (GST database match)</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-1">PAN: AABCS1420M</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Checked (Income tax match)</p>
          </div>
        </div>

        {/* Document Checklist */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Document Checklist</h3>
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 px-4">Document Type</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Action</th><th className="py-3 px-4">Approve</th></tr></thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.type} className="border-b border-gray-100 text-xs">
                  <td className="py-3 px-4 font-semibold text-gray-900">{d.type}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{d.status}</td>
                  <td className="py-3 px-4"><button className="text-blue-600 text-xs flex items-center gap-1 cursor-pointer">📄 View PDF</button></td>
                  <td className="py-3 px-4"><div className="w-5 h-5 rounded bg-[#0F8B7D] flex items-center justify-center text-white"><CheckCircle size={12} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Notes */}
        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Verification Notes</h3>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes regarding this vendor verification..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-24 mb-6 focus:outline-none focus:border-[#0F8B7D]" />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">Request Clarification</button>
          <button onClick={() => { setToast("Application rejected"); setTimeout(() => setToast(null), 3500); }} className="px-6 py-3 rounded-xl bg-red-500 text-white text-xs font-bold cursor-pointer">Reject Application</button>
          <button onClick={() => { setToast("Vendor profile approved!"); setTimeout(() => setToast(null), 3500); }} className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">Approve Vendor Profile</button>
        </div>
      </div>
    </div>
  );
}
