"use client";

import React, { useState } from "react";
import { Building, Clipboard, Plus, X, QrCode, ShieldCheck, Wrench, Bell, SlidersHorizontal, Settings } from "lucide-react";

export default function OperationsAssets() {
  const [assets, setAssets] = useState([
    { id: 1, name: "BlueStar Chiller 150TR", code: "AX-CH-01", location: "Apex Basement 2", lastMaint: "July 12, 2026", status: "Operational", manufacturer: "BlueStar India", warranty: "Valid till Nov 2028", powerRating: "120 kW", healthScore: 94, criticality: "High", amcStatus: "Active" },
    { id: 2, name: "Kirloskar Fire Pump 45kW", code: "MR-FP-03", location: "Meridian Pump Room Wing A", lastMaint: "Aug 02, 2026", status: "Operational", manufacturer: "Kirloskar Brothers", warranty: "Valid till May 2027", powerRating: "45 kW", healthScore: 97, criticality: "Critical", amcStatus: "Active" },
    { id: 3, name: "Cummins 500kVA Diesel Generator", code: "NX-DG-01", location: "Nexus DG Yard", lastMaint: "Aug 18, 2026", status: "Operational", manufacturer: "Cummins India", warranty: "Valid till Jan 2029", powerRating: "500 kVA", healthScore: 92, criticality: "High", amcStatus: "Active" },
    { id: 4, name: "Voltas Air Handling Unit AHU-04", code: "AX-AHU-04", location: "Apex Floor 4", lastMaint: "Aug 26, 2026", status: "Operational", manufacturer: "Voltas India", warranty: "Valid till Oct 2028", powerRating: "15 kW", healthScore: 94, criticality: "Normal", amcStatus: "Active" }
  ]);

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "Apex Basement 2",
    manufacturer: "",
    criticality: "Normal"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      alert("Please fill asset name and code");
      return;
    }
    const newA = {
      id: assets.length + 1,
      name: form.name,
      code: form.code,
      location: form.location,
      lastMaint: new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: "Operational",
      manufacturer: form.manufacturer || "OEM Certified",
      warranty: "Valid till Dec 2028",
      powerRating: "Standard OEM",
      healthScore: 95,
      criticality: form.criticality,
      amcStatus: "Active"
    };
    setAssets([...assets, newA]);
    setIsAdding(false);
    setForm({ name: "", code: "", location: "Apex Basement 2", manufacturer: "", criticality: "Normal" });
    showToast(`Asset "${newA.name}" tagged and registered successfully!`);
  };

  // Filter based on criticality
  const filteredAssets = assets.filter(a => {
    if (criticalityFilter === "ALL") return true;
    return a.criticality === criticalityFilter;
  });

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <Bell size={16} className="text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Register</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Directory of HVAC Chillers, water treatment pumps, and critical physical building assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
          >
            <option value="ALL">All Criticality</option>
            <option value="Critical">Critical</option>
            <option value="High">High Criticality</option>
            <option value="Normal">Normal Criticality</option>
          </select>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus size={14} /> Register Asset Tag
          </button>
        </div>
      </div>

      {/* Assets List Grid/Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4">Asset Name</th>
              <th className="py-4">Tag Code</th>
              <th className="py-4">Location</th>
              <th className="py-4">Criticality</th>
              <th className="py-4">Health Score</th>
              <th className="py-4 text-right">AMC Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((a) => (
              <tr 
                key={a.id} 
                onClick={() => setSelectedAsset(a)}
                className="border-b border-slate-100 text-xs hover:bg-blue-50/10 cursor-pointer transition-colors font-semibold"
              >
                <td className="py-4 font-black text-slate-900 flex items-center gap-2.5">
                  <Building size={14} className="text-[#0F8B7D]" />
                  {a.name}
                </td>
                <td className="py-4 font-mono font-bold text-indigo-600">{a.code}</td>
                <td className="py-4 text-slate-650">{a.location}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    a.criticality === "Critical" 
                      ? "bg-red-50 text-red-600 border border-red-200" 
                      : a.criticality === "High"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200"
                  }`}>
                    {a.criticality}
                  </span>
                </td>
                <td className="py-4 font-extrabold text-[#0F8B7D]">
                  {a.healthScore}%
                </td>
                <td className="py-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider">
                    {a.amcStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asset Detail Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-[#0F8B7D] uppercase tracking-wider">{selectedAsset.code}</span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">{selectedAsset.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Asset Tag Code</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{selectedAsset.code}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <QrCode size={24} className="text-slate-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Location</span>
                    <span className="font-bold text-slate-900">{selectedAsset.location}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Power / Rating</span>
                    <span className="font-bold text-amber-700">{selectedAsset.powerRating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Health Score</span>
                    <span className="font-black text-[#0F8B7D]">{selectedAsset.healthScore}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Criticality</span>
                    <span className="font-black text-red-650">{selectedAsset.criticality}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Manufacturer & Warranty</span>
                  <span className="font-bold text-slate-900 block">{selectedAsset.manufacturer}</span>
                  <span className="text-emerald-700 font-bold mt-1 block">{selectedAsset.warranty}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Last Maintenance Run</span>
                  <span className="font-bold text-slate-900">{selectedAsset.lastMaint} (Passed All Checks)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  showToast(`Maintenance log scheduled for ${selectedAsset.name}`);
                  setSelectedAsset(null);
                }}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench size={14} /> Log Maintenance Service
              </button>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleAdd}
            className="w-full max-w-md bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-2xl border border-slate-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Register New Asset Tag</h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Asset Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Voltas Central AHU 2000CFM"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tag Code</label>
                  <input 
                    type="text"
                    placeholder="e.g. AX-AHU-04"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0F8B7D] font-mono bg-slate-50 uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                  <input 
                    type="text"
                    placeholder="e.g. Floor 4 AHU Room"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Manufacturer OEM</label>
                  <input 
                    type="text"
                    placeholder="e.g. Voltas India"
                    value={form.manufacturer}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Criticality</label>
                  <select 
                    value={form.criticality}
                    onChange={(e) => setForm({ ...form, criticality: e.target.value })}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#0F8B7D] bg-white cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Register Asset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
