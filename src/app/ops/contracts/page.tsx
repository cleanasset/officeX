"use client";
import React, { useState } from "react";
import { Briefcase, FileText, Plus, X, Download, ShieldCheck, ArrowRight, Bell } from "lucide-react";

export default function OperationsContracts() {
  const [contracts, setContracts] = useState([
    { id: 1, name: "AMC Chiller Maintenance", property: "Apex Business Tower", value: "₹4,80,000/yr", vendor: "TechServe Solutions", renewal: "Dec 15, 2026", scope: "Quarterly descaling, 24/7 breakdown support, refrigerant top-ups", status: "Active" },
    { id: 2, name: "Soft Services & Housekeeping", property: "Meridian Tech Park", value: "₹12,40,000/yr", vendor: "CleanForce Labs", renewal: "Oct 01, 2026", scope: "Daily 3-shift cleaning, mechanized scrubbing, waste disposal compliance", status: "Active" },
    { id: 3, name: "Elevator & Lift Maintenance", property: "Nexus Hub", value: "₹3,20,000/yr", vendor: "Otis Elevators India", renewal: "Jan 10, 2027", scope: "Monthly safety inspection, governor testing, emergency entrapment hotline", status: "Active" }
  ]);

  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    property: "Apex Business Tower",
    value: "",
    vendor: "",
    renewal: "",
    scope: ""
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.value || !form.vendor) {
      alert("Please fill all required fields");
      return;
    }
    const newC = {
      id: contracts.length + 1,
      name: form.name,
      property: form.property,
      value: form.value,
      vendor: form.vendor,
      renewal: form.renewal || "Dec 31, 2026",
      scope: form.scope || "Standard operations SLA",
      status: "Active"
    };
    setContracts([...contracts, newC]);
    setIsAdding(false);
    setForm({ name: "", property: "Apex Business Tower", value: "", vendor: "", renewal: "", scope: "" });
    showToast(`New contract "${newC.name}" registered successfully!`);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Managed Contracts</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Review operations contracts, service level agreements, and annual maintenance agreements.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Add Managed Contract
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Contract Name</th>
              <th className="py-4">Property</th>
              <th className="py-4">Annual Value</th>
              <th className="py-4">Contractor Vendor</th>
              <th className="py-4">Renewal Date</th>
              <th className="py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr 
                key={c.id} 
                onClick={() => setSelectedContract(c)}
                className="border-b border-gray-200 text-xs hover:bg-amber-50/30 cursor-pointer transition-colors"
              >
                <td className="py-4 font-bold text-amber-700 flex items-center gap-2 hover:underline">
                  <Briefcase size={14} className="text-amber-600" />
                  {c.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{c.property}</td>
                <td className="py-4 text-gray-900 font-extrabold">{c.value}</td>
                <td className="py-4 text-gray-700 font-semibold">{c.vendor}</td>
                <td className="py-4 text-red-600 font-bold">{c.renewal}</td>
                <td className="py-4">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract Detail Drawer */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Managed Operations Agreement</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-1">{selectedContract.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedContract(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Building Asset</span>
                  <span className="font-bold text-gray-900">{selectedContract.property}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Annual Value</span>
                    <span className="font-extrabold text-amber-600">{selectedContract.value}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Renewal Date</span>
                    <span className="font-bold text-red-600">{selectedContract.renewal}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Contractor Vendor</span>
                  <span className="font-bold text-gray-900">{selectedContract.vendor}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Service Scope & SLA Deliverables</span>
                  <p className="text-gray-700 mt-1 leading-relaxed">{selectedContract.scope}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  showToast(`Downloaded SLA Agreement Package for ${selectedContract.name}`);
                  setSelectedContract(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Download SLA Contract PDF
              </button>
              <button 
                onClick={() => setSelectedContract(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleCreate}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Register Managed Service Contract</h3>
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
                <label className="text-[10px] font-bold text-gray-500 uppercase">Contract Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Diesel Generator AMC & Fuel SLA"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Property Asset</label>
                  <select 
                    value={form.property}
                    onChange={(e) => setForm({ ...form, property: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Apex Business Tower">Apex Business Tower</option>
                    <option value="Meridian Tech Park">Meridian Tech Park</option>
                    <option value="Nexus Hub">Nexus Hub</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Annual Value</label>
                  <input 
                    type="text"
                    placeholder="e.g. ₹6,50,000/yr"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Contractor Vendor</label>
                  <input 
                    type="text"
                    placeholder="e.g. Cummins Power India"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Renewal Expiry</label>
                  <input 
                    type="date"
                    value={form.renewal}
                    onChange={(e) => setForm({ ...form, renewal: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Service Scope Description</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Monthly B-check, filter changes, 1-hour emergency breakdown response."
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600 resize-none"
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
                Register Contract
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
