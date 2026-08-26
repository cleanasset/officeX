"use client";
import React, { useState } from "react";
import { Building, Clipboard, Plus, X, QrCode, ShieldCheck, Wrench, Bell } from "lucide-react";

export default function OperationsAssets() {
  const [assets, setAssets] = useState([
    { id: 1, name: "BlueStar Chiller 150TR", code: "AX-CH-01", location: "Apex Basement 2", lastMaint: "July 12, 2026", status: "Operational", manufacturer: "BlueStar India", warranty: "Valid till Nov 2028", powerRating: "120 kW" },
    { id: 2, name: "Kirloskar Fire Pump 45kW", code: "MR-FP-03", location: "Meridian Pump Room Wing A", lastMaint: "Aug 02, 2026", status: "Operational", manufacturer: "Kirloskar Brothers", warranty: "Valid till May 2027", powerRating: "45 kW" },
    { id: 3, name: "Cummins 500kVA Diesel Generator", code: "NX-DG-01", location: "Nexus DG Yard", lastMaint: "Aug 18, 2026", status: "Operational", manufacturer: "Cummins India", warranty: "Valid till Jan 2029", powerRating: "500 kVA" }
  ]);

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "Apex Basement 2",
    manufacturer: ""
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
      lastMaint: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: "Operational",
      manufacturer: form.manufacturer || "OEM Certified",
      warranty: "Valid till Dec 2028",
      powerRating: "Standard OEM"
    };
    setAssets([...assets, newA]);
    setIsAdding(false);
    setForm({ name: "", code: "", location: "Apex Basement 2", manufacturer: "" });
    showToast(`Asset "${newA.name}" tagged and registered successfully!`);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <Bell size={16} className="text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Asset Registry</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Directory of HVAC Chillers, water treatment pumps, and fire safety assets.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Register Asset Tag
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Asset Name</th>
              <th className="py-4">Tag Code</th>
              <th className="py-4">Assigned Location</th>
              <th className="py-4">Last Inspected</th>
              <th className="py-4">Asset Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr 
                key={a.id} 
                onClick={() => setSelectedAsset(a)}
                className="border-b border-gray-200 text-xs hover:bg-amber-50/20 cursor-pointer transition-colors"
              >
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2 hover:text-amber-600 hover:underline">
                  <Building size={14} className="text-amber-600" />
                  {a.name}
                </td>
                <td className="py-4 font-mono font-bold text-purple-600">{a.code}</td>
                <td className="py-4 text-gray-700 font-semibold">{a.location}</td>
                <td className="py-4 text-gray-700 font-semibold">{a.lastMaint}</td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asset Detail Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-purple-600 uppercase tracking-wider">{selectedAsset.code}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-1">{selectedAsset.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Asset Tag Code</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">{selectedAsset.code}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-gray-200">
                    <QrCode size={24} className="text-gray-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Location</span>
                    <span className="font-bold text-gray-900">{selectedAsset.location}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Power / Rating</span>
                    <span className="font-bold text-amber-600">{selectedAsset.powerRating}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Manufacturer & Warranty</span>
                  <span className="font-bold text-gray-900 block">{selectedAsset.manufacturer}</span>
                  <span className="text-emerald-700 font-semibold mt-1 block">{selectedAsset.warranty}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Last Maintenance Run</span>
                  <span className="font-bold text-gray-900">{selectedAsset.lastMaint} (Passed All Checks)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  showToast(`Maintenance log scheduled for ${selectedAsset.name}`);
                  setSelectedAsset(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench size={14} /> Log Maintenance Service
              </button>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleAdd}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Register New Asset Tag</h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Asset Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Voltas Central AHU 2000CFM"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tag Code</label>
                  <input 
                    type="text"
                    placeholder="e.g. AX-AHU-04"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Location</label>
                  <input 
                    type="text"
                    placeholder="e.g. Apex 4th Floor AHU Room"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Manufacturer OEM</label>
                <input 
                  type="text"
                  placeholder="e.g. Voltas India Limited"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
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
