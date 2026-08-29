"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, ArrowRight, Upload, X, CheckCircle, Bell, Clock, Calendar } from "lucide-react";

export default function ComplianceTracker() {
  const [certs, setCerts] = useState([
    { id: 1, name: "Fire NOC Safety Certificate", property: "Apex Business Tower", authority: "State Fire Services", expiry: "2026-09-20", remaining: 22, status: "Expiring Soon", escalation: "L1 Alert Sent (30d)" },
    { id: 2, name: "Lift Safety License", property: "Meridian Tech Park", authority: "PWD Electrical Inspectorate", expiry: "2026-08-10", remaining: 0, status: "Expired", escalation: "L2 Alert Sent (15d)" },
    { id: 3, name: "Diesel Generator Emissions NOC", property: "Nexus Hub", authority: "Pollution Control Board", expiry: "2026-12-15", remaining: 108, status: "Healthy", escalation: "Normal Monitoring" },
    { id: 4, name: "Structural Stability Certificate", property: "Devasya Gold Plus", authority: "Municipal Corporation Office", expiry: "2026-10-30", remaining: 62, status: "Healthy", escalation: "Normal Monitoring" }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "Fire NOC Safety Certificate",
    property: "Apex Business Tower",
    authority: "State Fire Services",
    expiryDate: ""
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.expiryDate) {
      alert("Please select expiry date");
      return;
    }

    const expiry = new Date(uploadForm.expiryDate);
    const diffTime = expiry.getTime() - new Date().getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const newCert = {
      id: certs.length + 1,
      name: uploadForm.name,
      property: uploadForm.property,
      authority: uploadForm.authority,
      expiry: uploadForm.expiryDate,
      remaining: diffDays,
      status: diffDays <= 0 ? "Expired" : diffDays <= 30 ? "Expiring Soon" : "Healthy",
      escalation: "Pending Verification"
    };

    setCerts([newCert, ...certs]);
    setIsUploading(false);
    showToast(`NOC certificate receipt uploaded and submitted for audit verification!`);
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compliance Command Centre</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Audit statutory property NOCs, fire rescue certs, and lift inspectors approvals.</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Upload size={14} /> Upload Renewed NOC
        </button>
      </div>

      {/* COMPLIANCE HEALTH GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Score */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Portfolio Health</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-black text-[#2563EB]">96%</span>
              <span className="text-xs text-slate-400 font-bold">compliance score</span>
            </div>
            <span className="text-xs font-extrabold text-slate-900 mt-2 block uppercase tracking-wider">Statutory NOC Status</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: "96%" }}></div>
          </div>
        </div>

        {/* Warning cards / Countdown status */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-red-50/20 md:col-span-2 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-red-600 font-black uppercase tracking-widest block">Critical Countdown Alert</span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-2.5">Auto-escalation triggers active</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
              Compliance alerts are generated at **60**, **30**, and **15** days before expiry. Critical failures are auto-dispatched to the regional operations auditor.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="p-2.5 rounded-xl bg-white border border-red-150">
              <div className="text-[9px] text-slate-400 font-bold uppercase">15d Failure</div>
              <div className="text-base font-black text-red-650 mt-1">1 Case</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-150">
              <div className="text-[9px] text-slate-400 font-bold uppercase">30d Warning</div>
              <div className="text-base font-black text-amber-700 mt-1">1 Case</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-150">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Healthy NOC</div>
              <div className="text-base font-black text-slate-700 mt-1">2 Cases</div>
            </div>
          </div>
        </div>

      </div>

      {/* Compliance Register Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4">Certificate Name</th>
              <th className="py-4">Building Property</th>
              <th className="py-4">Authority</th>
              <th className="py-4">Expiry Date</th>
              <th className="py-4">Days Left</th>
              <th className="py-4">Escalation Status</th>
              <th className="py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 text-xs hover:bg-blue-50/10 transition-colors font-semibold">
                <td className="py-4 font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#2563EB]" />
                  {c.name}
                </td>
                <td className="py-4 text-slate-700">{c.property}</td>
                <td className="py-4 text-slate-500 font-bold">{c.authority}</td>
                <td className="py-4 text-slate-650">{new Date(c.expiry).toLocaleDateString()}</td>
                <td className="py-4">
                  {c.remaining === 0 ? (
                    <span className="text-red-500 font-black">Expired</span>
                  ) : (
                    <span className="text-slate-900 font-bold">{c.remaining} Days</span>
                  )}
                </td>
                <td className="py-4 text-slate-400 font-bold">{c.escalation}</td>
                <td className="py-4 text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    c.status === "Healthy" 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-250" 
                      : c.status === "Expiring Soon"
                      ? "bg-amber-50 text-amber-700 border border-amber-250"
                      : "bg-red-50 text-red-600 border border-red-250"
                  }`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Renewal Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleUploadSubmit}
            className="w-full max-w-md bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-2xl border border-slate-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Upload Renewed Statutory NOC</h3>
              <button 
                type="button" 
                onClick={() => setIsUploading(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select NOC Type</label>
                <select 
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                >
                  <option>Fire NOC Safety Certificate</option>
                  <option>Lift Safety License</option>
                  <option>Diesel Generator Emissions NOC</option>
                  <option>Structural Stability Certificate</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Operating Property</label>
                <select 
                  value={uploadForm.property}
                  onChange={(e) => setUploadForm({ ...uploadForm, property: e.target.value })}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                >
                  <option>Apex Business Tower</option>
                  <option>Meridian Tech Park</option>
                  <option>Nexus Hub</option>
                  <option>Devasya Gold Plus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Issuing Authority</label>
                  <input 
                    type="text" 
                    value={uploadForm.authority}
                    onChange={(e) => setUploadForm({ ...uploadForm, authority: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">New Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition-colors flex flex-col items-center justify-center gap-1">
                <Upload size={20} className="text-slate-400" />
                <span className="font-bold text-slate-800 text-[10px]">Select PDF or PNG Scan</span>
                <span className="text-[8px] text-slate-400">Max size limit 5MB</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsUploading(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Submit NOC renewal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
