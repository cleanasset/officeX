"use client";

import React, { useState } from "react";
import { Building, Plus, Search, MapPin, Layers, X, Check, Bell, Edit3, ArrowRight, Trash2, Printer, Download, Sparkles, Phone, Mail, QrCode } from "lucide-react";

export default function ListingsPage() {
  const [listings, setListings] = useState([
    { id: 1, name: "Apex Business Tower - Floor 4", type: "Office Space", area: "8,500 sq.ft", rate: "₹180/sq.ft", status: "Vacant", address: "BKC, Mumbai", amenities: "24/7 Power, VRV Air Conditioning, 100% DG Backup, Mechanized Scrubbing", securityDeposit: "6 Months", escalation: "5.00%", camFee: "₹18/sq.ft" },
    { id: 2, name: "Meridian Tech Park - Block B", type: "IT/ITeS Space", area: "15,000 sq.ft", rate: "₹120/sq.ft", status: "Occupied", address: "Whitefield, Bengaluru", amenities: "Central Chillers, Fibre Optic, LEED Certified, Multi-Level Parking", securityDeposit: "6 Months", escalation: "5.00%", camFee: "₹12/sq.ft" },
    { id: 3, name: "Nexus Hub - Desk Space", type: "Coworking", area: "200 Desks", rate: "₹12,000/desk", status: "Vacant", address: "Hinjewadi, Pune", amenities: "Shared Lounge, Meeting Rooms, 24/7 Security, High-Speed Wifi", securityDeposit: "3 Months", escalation: "5.00%", camFee: "₹0" }
  ]);

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState("");
  const [editingRate, setEditingRate] = useState("");
  const [brochureListing, setBrochureListing] = useState<any>(null);

  // Tabbed Wizard State for Add Listing
  const [activeTab, setActiveTab] = useState<string | number>("basics");
  const [form, setForm] = useState({
    name: "",
    type: "Office Space",
    address: "",
    area: "",
    desks: "",
    grade: "A",
    amenities: "",
    rate: "",
    camFee: "",
    securityDeposit: "6 Months",
    escalation: "5.00%",
    photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.area || !form.rate) {
      alert("Please fill all required fields");
      return;
    }
    const newL = {
      id: listings.length + 1,
      name: form.name,
      type: form.type,
      area: form.area + (form.type === "Coworking" ? " Desks" : " sq.ft"),
      rate: `₹${form.rate}/${form.type === "Coworking" ? "desk" : "sq.ft"}`,
      status: "Vacant",
      address: form.address || "Main City Road",
      amenities: form.amenities || "Standard CAFM Assets",
      securityDeposit: form.securityDeposit,
      escalation: form.escalation,
      camFee: `₹${form.camFee}/${form.type === "Coworking" ? "desk" : "sq.ft"}`
    };
    setListings([...listings, newL]);
    setIsAdding(false);
    // Reset form
    setForm({
      name: "",
      type: "Office Space",
      address: "",
      area: "",
      desks: "",
      grade: "A",
      amenities: "",
      rate: "",
      camFee: "",
      securityDeposit: "6 Months",
      escalation: "5.00%",
      photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
    });
    setActiveTab("basics");
    setNotification("Successfully created new workspace listing!");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleUpdateRate = (id: number, newRate: string) => {
    setListings(listings.map(l => l.id === id ? { ...l, rate: newRate } : l));
    setSelectedListing(null);
    setEditingRate("");
    setNotification("Rental rate updated successfully!");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleDeleteListing = (id: number, name: string) => {
    if (confirm(`Are you sure you want to permanently delist and delete "${name}"?`)) {
      setListings(listings.filter(l => l.id !== id));
      setSelectedListing(null);
      setNotification(`Listing "${name}" was permanently removed.`);
      setTimeout(() => setNotification(""), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Property Listings</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Configure workspace listing records, monthly rentals, and broker stage catalogs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Add Listing
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-150 text-[#0F8B7D] font-bold text-xs flex items-center gap-2 max-w-2xl animate-pulse">
          <Bell size={16} />
          {notification}
        </div>
      )}

      {/* Listings Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4">Property Name</th>
              <th className="py-4">Space Type</th>
              <th className="py-4">Area / Count</th>
              <th className="py-4">Base Rental</th>
              <th className="py-4">CAM / sq.ft</th>
              <th className="py-4">Vacancy</th>
              <th className="py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr 
                key={l.id} 
                className="border-b border-slate-100 text-xs hover:bg-blue-50/10 transition-colors font-semibold"
              >
                <td 
                  onClick={() => { setSelectedListing(l); setEditingRate(l.rate); }}
                  className="py-4 font-black text-slate-900 flex items-center gap-2.5 hover:text-[#0F8B7D] hover:underline cursor-pointer"
                >
                  <Building size={14} className="text-[#0F8B7D]" />
                  {l.name}
                </td>
                <td className="py-4 text-slate-700">{l.type}</td>
                <td className="py-4 text-slate-700">{l.area}</td>
                <td className="py-4 text-slate-900 font-extrabold">{l.rate}</td>
                <td className="py-4 text-red-650">{l.camFee || "₹15/sq.ft"}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    l.status === "Vacant" ? "bg-emerald-50 text-emerald-650 border border-emerald-250" : "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="py-4 text-right flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setBrochureListing(l)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-[#0F8B7D] rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Brochure
                  </button>
                  <button
                    onClick={() => handleDeleteListing(l.id, l.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Listing Details Drawer */}
      {selectedListing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Listing Configurations</h3>
                  <span className="text-[10px] text-[#0F8B7D] font-bold uppercase tracking-wider">{selectedListing.name}</span>
                </div>
                <button 
                  onClick={() => setSelectedListing(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs font-semibold text-slate-700">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Building Address</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <MapPin size={14} className="text-slate-500" />
                    <span>{selectedListing.address}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Key Specifications</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <Layers size={14} className="text-slate-500" />
                    <span>{selectedListing.amenities}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Staging Rental Rate</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input 
                      type="text" 
                      value={editingRate}
                      onChange={(e) => setEditingRate(e.target.value)}
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                    />
                    <button 
                      onClick={() => handleUpdateRate(selectedListing.id, editingRate)}
                      className="px-4 py-2 bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] shadow-md transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  setBrochureListing(selectedListing);
                  setSelectedListing(null);
                }}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Generate Brochure <ArrowRight size={14} />
              </button>

              <button 
                onClick={() => handleDeleteListing(selectedListing.id, selectedListing.name)}
                className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-650 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} /> Delist & Delete Property Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13-Step Guided Property Listing Builder Wizard */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">13-Step Listing Builder</span>
                <h3 className="font-extrabold text-slate-900 text-base mt-0.5">Guided Property Listing Creator</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper progress indicator */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              {Array.from({ length: 13 }).map((_, idx) => {
                const stepNum = idx + 1;
                const stepLabels = [
                  "Basic", "Location", "Building", "Floors", "Commercials", 
                  "Amenities", "Parking", "HVAC", "Photos", "Floor Plan", 
                  "Compliance", "Docs", "Preview"
                ];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (stepNum < 13) {
                        // Allow clicking back/forth
                        setActiveTab(stepNum as any);
                      }
                    }}
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] shrink-0 font-extrabold ${
                      (activeTab === "basics" ? 1 : Number(activeTab)) === stepNum
                        ? "bg-[#0F8B7D] text-white"
                        : (activeTab === "basics" ? 1 : Number(activeTab)) > stepNum
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    title={stepLabels[idx]}
                  >
                    {stepNum}
                  </button>
                );
              })}
              <span className="text-[10px] font-black text-[#0F8B7D] ml-2">
                Step {activeTab === "basics" ? 1 : activeTab} / 13
              </span>
            </div>

            {/* Wizard Form */}
            <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              
              {/* Step 1: Basic */}
              {(activeTab === "basics" || activeTab === 1) && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 1: Basic Information</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Listing Name / Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Apex Business Tower - Floor 4"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Workspace Type</label>
                    <select 
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="Office Space">Office Space</option>
                      <option value="IT/ITeS Space">IT/ITeS Space</option>
                      <option value="Coworking">Coworking</option>
                      <option value="Bare Shell">Bare Shell</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab(2 as any)}
                    className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs mt-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Next: Location <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Location */}
              {activeTab === 2 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 2: Location Details</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Full Address</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Bandra Kurla Complex, Mumbai"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">City</label>
                      <input type="text" placeholder="Mumbai" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Micro-market</label>
                      <input type="text" placeholder="BKC" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(1 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(3 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Building <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 3: Building */}
              {activeTab === 3 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 3: Building Structure</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Building Name</label>
                      <input type="text" placeholder="Tower A" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Developer</label>
                      <input type="text" placeholder="Apex Realty" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Building Grade</label>
                    <select 
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(2 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(4 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Floors <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 4: Floors/Spaces */}
              {activeTab === 4 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 4: Floors & Spaces Allocation</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Leasable Area (Sq.Ft)</label>
                      <input 
                        type="number"
                        placeholder="e.g. 5000"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Floor Number</label>
                      <input type="text" placeholder="4th Floor" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Total Desks</label>
                      <input 
                        type="number" 
                        placeholder="100 Desks" 
                        value={form.desks}
                        onChange={(e) => setForm({ ...form, desks: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(3 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(5 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Commercials <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 5: Commercials */}
              {activeTab === 5 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 5: Commercial Parameters</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Base Rental Rate (₹/sq.ft)</label>
                      <input 
                        type="number"
                        placeholder="150"
                        value={form.rate}
                        onChange={(e) => setForm({ ...form, rate: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">CAM Fee (₹/sq.ft)</label>
                      <input 
                        type="number"
                        placeholder="15"
                        value={form.camFee}
                        onChange={(e) => setForm({ ...form, camFee: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Security Deposit</label>
                      <select 
                        value={form.securityDeposit}
                        onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                      >
                        <option>3 Months</option>
                        <option>6 Months</option>
                        <option>9 Months</option>
                        <option>12 Months</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Annual Escalation %</label>
                      <input 
                        type="text"
                        value={form.escalation}
                        onChange={(e) => setForm({ ...form, escalation: e.target.value })}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(4 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(6 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Amenities <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 6: Amenities */}
              {activeTab === 6 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 6: Key Amenities</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Amenities Checklist (Comma-separated)</label>
                    <textarea 
                      rows={3}
                      placeholder="Conference Rooms, Lounge, Pantry, Breakout Zone, High Speed Wifi, 24/7 Security"
                      value={form.amenities}
                      onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                    />
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(5 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(7 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Parking <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 7: Parking */}
              {activeTab === 7 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 7: Parking Integration</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Car Bays Allocation</label>
                      <input type="number" placeholder="5" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Two-wheeler Bays</label>
                      <input type="number" placeholder="10" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">EV Charging Bays</label>
                      <input type="number" placeholder="2" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(6 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(8 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: HVAC/Power <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 8: Power/HVAC */}
              {activeTab === 8 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 8: HVAC & Utilities</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">HVAC system type</label>
                      <select className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold">
                        <option>Central Chiller</option>
                        <option>VRV/VRF</option>
                        <option>Split unit systems</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Power Backup (KVA)</label>
                      <input type="text" placeholder="e.g. 500 KVA" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(7 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(9 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Photos <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 9: Photos/Video */}
              {activeTab === 9 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 9: Media Assets</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Photo Reference URL</label>
                    <input 
                      type="text"
                      value={form.photoUrl}
                      onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-[10px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Video Walkthrough URL</label>
                    <input type="text" placeholder="https://youtube.com/watch?v=..." className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-[10px]" />
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(8 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(10 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Floor Plans <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 10: Floor Plans */}
              {activeTab === 10 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 10: Floor Plans Attachment</span>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Floor Plan Image/CAD URL</label>
                    <input type="text" placeholder="https://officex-plans.s3.amazonaws.com/plan4.png" className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-[10px]" />
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(9 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(11 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Compliance <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 11: Compliance */}
              {activeTab === 11 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 11: Compliance Verification</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Fire NOC Certificate</label>
                      <select className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold">
                        <option>Verified & Active</option>
                        <option>Awaiting Clearance</option>
                        <option>Not Applicable</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Occupancy Certificate (OC)</label>
                      <select className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold">
                        <option>Issued</option>
                        <option>Pending Appeal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(10 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(12 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Docs <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 12: Documents */}
              {activeTab === 12 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 12: Title & Mutation Documents</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Title Deed (Registered)</label>
                      <select className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold">
                        <option>Attached PDF</option>
                        <option>Awaiting Escrow</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Mutation Certificate</label>
                      <select className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold">
                        <option>Available</option>
                        <option>Not Available</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(11 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button type="button" onClick={() => setActiveTab(13 as any)} className="px-5 py-2.5 bg-[#0F8B7D] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">Next: Preview <ArrowRight size={13} /></button>
                  </div>
                </div>
              )}

              {/* Step 13: Preview & Publish */}
              {activeTab === 13 && (
                <div className="flex flex-col gap-3.5">
                  <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-widest">Step 13: Publish & Launch Preview</span>
                  
                  <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 flex flex-col gap-2">
                    <span className="text-[9px] text-[#0F8B7D] font-black uppercase tracking-widest block">Review Parameters</span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Workspace Title:</span>
                      <span className="font-extrabold text-slate-900">{form.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-extrabold text-slate-900">{form.address || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Rent:</span>
                      <span className="font-extrabold text-slate-900">₹{form.rate || "0"}/{form.type === "Coworking" ? "desk" : "sq.ft"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Area:</span>
                      <span className="font-extrabold text-slate-900">{form.area || "0"} Sq.Ft</span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-2">
                    <button type="button" onClick={() => setActiveTab(12 as any)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Back</button>
                    <button 
                      onClick={(e) => {
                        handleCreateListing(e);
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl cursor-pointer"
                    >
                      Publish Listing
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC SALES BROCHURE MODAL & PRINT GENERATOR */}
      {brochureListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl flex flex-col gap-6 relative border border-slate-100 print:p-0 print:border-none print:shadow-none animate-scale-up">
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-[#0F8B7D] font-bold text-sm">
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <span>Sales Brochure Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0F8B7D] font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} /> Print/Save PDF
                </button>
                <button 
                  onClick={() => setBrochureListing(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Brochure Template */}
            <div className="flex flex-col gap-6 border border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden print:border-none print:p-0">
              
              {/* Premium Top Bar Design */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-widest">
                    OfficeX Exclusive Listing
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight">{brochureListing.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-blue-500" /> {brochureListing.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Asking Rental</span>
                  <span className="text-xl font-extrabold text-[#0F8B7D] block mt-0.5">{brochureListing.rate}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Leasable area: {brochureListing.area}</span>
                </div>
              </div>

              {/* Graphic Banner */}
              <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-100 relative">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" 
                  alt="Office Workspace" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  Premium Grade-A commercial workspace
                </div>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Space Category</span>
                  <span className="font-extrabold text-slate-900 mt-1 block">{brochureListing.type}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Occupancy Status</span>
                  <span className="font-extrabold text-emerald-600 mt-1 block">{brochureListing.status}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-xs font-semibold">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Key Specifications & Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {(brochureListing.amenities || "Standard CAFM Assets").split(",").map((a: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">
                      ✓ {a.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & QR Code Footer */}
              <div className="flex justify-between items-center border-t border-slate-200 pt-5 mt-2 bg-blue-50/30 p-4 rounded-xl">
                <div className="text-xs font-semibold">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Leasing Enquiry</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone size={12} className="text-[#0F8B7D]" /> +91 22 4987 6000
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600 mt-0.5">
                    <Mail size={12} className="text-[#0F8B7D]" /> leasing@officex.in
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scan to Visit</span>
                    <span className="text-[9px] text-[#0F8B7D] font-bold uppercase">officex.in/listings</span>
                  </div>
                  <div className="p-1 bg-white rounded-lg border border-slate-200">
                    <QrCode size={36} className="text-slate-900" />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setBrochureListing(null)}
                className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={13} /> Print/Save PDF Brochure
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
