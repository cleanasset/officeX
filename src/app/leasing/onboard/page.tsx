"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building, MapPin, Layers, Settings, Wrench, Briefcase, 
  CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, ShieldCheck, Zap
} from "lucide-react";

function WorkspaceOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantName = searchParams.get("tenant") || "Razorpay Software";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyName: "Apex Business Tower",
    buildingName: "Tower A",
    floorNumber: "Floor 4",
    spaceName: "Zone A (50 Seats)",
    assets: [
      { id: "1", name: "AHU-04 (Air Handling Unit)", criticality: "Critical", pmSchedule: "Monthly", amcVendor: "Voltas Services", warranty: "2028-12-31" },
      { id: "2", name: "UPS-02 (200KVA Power Backup)", criticality: "Critical", pmSchedule: "Quarterly", amcVendor: "APC Schneider", warranty: "2027-06-30" }
    ],
    services: [
      { name: "IT & Network Support", sla: "2 Hours" },
      { name: "Pantry & Cafeteria Services", sla: "15 Mins" },
      { name: "HVAC & Climate Control", sla: "1 Hour" }
    ],
    vendors: [
      { name: "Voltas Services", category: "HVAC", status: "Active" },
      { name: "APC Schneider", category: "Electrical", status: "Active" }
    ]
  });

  const [newAsset, setNewAsset] = useState({ name: "", criticality: "Medium", pmSchedule: "Monthly", amcVendor: "", warranty: "" });

  const addAsset = () => {
    if (newAsset.name) {
      setFormData({
        ...formData,
        assets: [...formData.assets, { ...newAsset, id: Date.now().toString() }]
      });
      setNewAsset({ name: "", criticality: "Medium", pmSchedule: "Monthly", amcVendor: "", warranty: "" });
    }
  };

  const removeAsset = (id: string) => {
    setFormData({
      ...formData,
      assets: formData.assets.filter(a => a.id !== id)
    });
  };

  const handleGoLive = () => {
    // Show success message and redirect
    alert(`Workspace Onboarding completed for ${tenantName}! System has provisioned tenant portals, auto-assigned service SLAs, and registered assets.`);
    router.push("/leasing/loi");
  };

  const steps = [
    { num: 1, label: "Property", icon: MapPin },
    { num: 2, label: "Building", icon: Building },
    { num: 3, label: "Floor & Space", icon: Layers },
    { num: 4, label: "Assets", icon: Settings },
    { num: 5, label: "Services", icon: Wrench },
    { num: 6, label: "Vendors", icon: Briefcase },
    { num: 7, label: "Go Live", icon: ShieldCheck }
  ];

  return (
    <div className="flex flex-col gap-8 font-sans text-slate-900 bg-slate-50/20 p-2 min-h-screen">
      <div>
        <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-widest">Lease Executed → Onboarding Journey</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workspace Onboarding Wizard</h1>
        <p className="text-xs text-slate-500 font-bold mt-1">Configuring Tenant: <span className="text-slate-800">{tenantName}</span></p>
      </div>

      {/* Progress Wizard Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto gap-4">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step === s.num ? "bg-[#0F8B7D] text-white" : step > s.num ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}>
              {step > s.num ? <CheckCircle2 size={16} /> : <s.icon size={14} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden md:inline whitespace-nowrap ${
              step === s.num ? "text-slate-900 font-black" : "text-slate-400"
            }`}>{s.label}</span>
            {s.num < 7 && <ChevronRightIcon className="text-gray-300 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Steps Content Area */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex-1">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 1: Select Property</h3>
            <p className="text-xs text-slate-500 font-semibold">Confirm target property linked with executed lease.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#0F8B7D] bg-[#0F8B7D]/5">
                <h4 className="text-xs font-bold text-[#0F8B7D] mb-1">Apex Business Tower</h4>
                <p className="text-[11px] text-slate-600 font-medium">Bandra Kurla Complex, Mumbai</p>
                <div className="mt-4 text-[10px] text-slate-400 font-bold">PROVISIONED PROPERTY</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Meridian Block B</h4>
                <p className="text-[11px] text-slate-500 font-medium">Cyber City, Gurugram</p>
                <div className="mt-4 text-[10px] text-slate-400 font-bold">AVAILABLE OPTION</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 2: Confirm Building Structure</h3>
            <p className="text-xs text-slate-500 font-semibold">Select physical building node within property architecture.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Tower A", "Tower B", "Annex Block"].map((tower) => (
                <div 
                  key={tower}
                  onClick={() => setFormData({ ...formData, buildingName: tower })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.buildingName === tower ? "border-2 border-[#0F8B7D] bg-[#0F8B7D]/5" : "border-gray-200"
                  }`}
                >
                  <Building size={20} className={formData.buildingName === tower ? "text-[#0F8B7D]" : "text-slate-400"} />
                  <h4 className="text-xs font-bold text-slate-900 mt-3">{tower}</h4>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">Apex Business Tower</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 3: Space & Floor Allocation</h3>
            <p className="text-xs text-slate-500 font-semibold">Allocate specific floor levels and workspace capacities.</p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Floor Level</label>
                <input 
                  type="text" 
                  value={formData.floorNumber}
                  onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0F8B7D]" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Workspace Zone / Unit</label>
                <input 
                  type="text" 
                  value={formData.spaceName}
                  onChange={(e) => setFormData({ ...formData, spaceName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0F8B7D]" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 4: Register Tenant Assets</h3>
            <p className="text-xs text-slate-500 font-semibold">Register HVAC, power, compliance units to build active Asset Register.</p>
            
            {/* Asset Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Criticality</th>
                    <th className="p-3">PM Schedule</th>
                    <th className="p-3">AMC Vendor</th>
                    <th className="p-3">Warranty Expiry</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.assets.map((asset) => (
                    <tr key={asset.id} className="border-t border-gray-100 text-xs">
                      <td className="p-3 font-bold text-slate-800">{asset.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          asset.criticality === "Critical" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}>{asset.criticality}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{asset.pmSchedule}</td>
                      <td className="p-3 font-semibold text-slate-600">{asset.amcVendor}</td>
                      <td className="p-3 font-bold text-slate-700">{asset.warranty}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeAsset(asset.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Asset Form */}
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Asset Name</label>
                <input type="text" placeholder="e.g. Fire Panel" className="w-full text-xs p-2 rounded-lg border border-gray-200" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Criticality</label>
                <select className="w-full text-xs p-2 rounded-lg border border-gray-200" value={newAsset.criticality} onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Warranty</label>
                <input type="date" className="w-full text-xs p-2 rounded-lg border border-gray-200" value={newAsset.warranty} onChange={(e) => setNewAsset({ ...newAsset, warranty: e.target.value })} />
              </div>
              <button onClick={addAsset} className="bg-[#0F8B7D] hover:bg-[#0b6c61] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 5: Define Service & SLA Mapping</h3>
            <p className="text-xs text-slate-500 font-semibold">Bind service workflows with target SLAs for Helpdesk operations.</p>
            <div className="flex flex-col gap-2.5 max-w-lg">
              {formData.services.map((svc, i) => (
                <div key={i} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-800">{svc.name}</span>
                  <span className="px-2.5 py-1 rounded bg-[#0F8B7D]/10 text-[#0F8B7D] text-[9px] font-black uppercase border border-[#0F8B7D]/20">SLA: {svc.sla}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Step 6: Map AMC & Service Vendors</h3>
            <p className="text-xs text-slate-500 font-semibold">Ensure compliance certs and contracts are mapped to the workspace.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
              {formData.vendors.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-slate-500"><Briefcase size={18} /></div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 block">{v.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{v.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-black uppercase">{v.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col gap-6 text-center max-w-md mx-auto py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><ShieldCheck size={36} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Onboarding Ready to Go Live</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">Verify summary parameters before deploying tenant instance.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left flex flex-col gap-2">
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Tenant:</span> <span className="font-extrabold text-slate-800">{tenantName}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Location:</span> <span className="font-bold text-slate-800">{formData.propertyName} · {formData.buildingName}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Floor & Space:</span> <span className="font-bold text-slate-800">{formData.floorNumber} · {formData.spaceName}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Assets Provisioned:</span> <span className="font-extrabold text-slate-800">{formData.assets.length} Units</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
          className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-slate-700 flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>
        
        {step < 7 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0b6c61] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button 
            onClick={handleGoLive}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Deploy & Go Live <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceOnboarding() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading Workspace Onboarding Wizard...</div>}>
      <WorkspaceOnboardingContent />
    </Suspense>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
