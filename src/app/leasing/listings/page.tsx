"use client";
import React, { useState } from "react";
import { Building, Plus, Search, MapPin, Layers, X, Check, Bell, Edit3, ArrowRight, Trash2, Printer, Download, Sparkles, Phone, Mail, QrCode } from "lucide-react";

export default function ListingsPage() {
  const [listings, setListings] = useState([
    { id: 1, name: "Apex Business Tower - Floor 4", type: "Office Space", area: "8,500 sq.ft", rate: "₹180/sq.ft", status: "Vacant", address: "BKC, Mumbai", amenities: "24/7 Power, VRV Air Conditioning, 100% DG Backup, Mechanized Scrubbing" },
    { id: 2, name: "Meridian Tech Park - Block B", type: "IT/ITeS Space", area: "15,000 sq.ft", rate: "₹120/sq.ft", status: "Occupied", address: "Whitefield, Bengaluru", amenities: "Central Chillers, Fibre Optic, LEED Certified, Multi-Level Parking" },
    { id: 3, name: "Nexus Hub - Desk Space", type: "Coworking", area: "200 Desks", rate: "₹12,000/desk", status: "Vacant", address: "Hinjewadi, Pune", amenities: "Shared Lounge, Meeting Rooms, 24/7 Security, High-Speed Wifi" }
  ]);

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState("");
  const [editingRate, setEditingRate] = useState("");
  const [brochureListing, setBrochureListing] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    type: "Office Space",
    area: "",
    rate: "",
    status: "Vacant",
    address: "",
    amenities: ""
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
      area: form.area,
      rate: form.rate,
      status: form.status,
      address: form.address || "Main City Road",
      amenities: form.amenities || "Standard CAFM Assets"
    };
    setListings([...listings, newL]);
    setIsAdding(false);
    setForm({ name: "", type: "Office Space", area: "", rate: "", status: "Vacant", address: "", amenities: "" });
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
    <div className="flex flex-col gap-8 relative font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Listings</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Configure physical listings, rental rates, and unit availabilities.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Add Listing
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 font-bold text-xs flex items-center gap-2 max-w-2xl animate-bounce">
          <Bell size={16} />
          {notification}
        </div>
      )}

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Property Name</th>
              <th className="py-4">Space Type</th>
              <th className="py-4">Area / Count</th>
              <th className="py-4">Rental Rate</th>
              <th className="py-4">Vacancy</th>
              <th className="py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr 
                key={l.id} 
                className="border-b border-gray-200 text-xs hover:bg-[#F0FDFA]/40 transition-colors"
              >
                <td 
                  onClick={() => { setSelectedListing(l); setEditingRate(l.rate); }}
                  className="py-4 font-bold text-blue-700 flex items-center gap-2 hover:underline cursor-pointer"
                >
                  <Building size={14} className="text-blue-500" />
                  {l.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{l.type}</td>
                <td className="py-4 text-gray-700 font-semibold">{l.area}</td>
                <td className="py-4 text-gray-900 font-extrabold">{l.rate}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    l.status === "Vacant" ? "bg-emerald-600 text-white" : "bg-gray-600 text-white"
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="py-4 text-right flex items-center justify-end gap-2">
                  <button
                    onClick={() => setBrochureListing(l)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Brochure
                  </button>
                  <button
                    onClick={() => handleDeleteListing(l.id, l.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Listing Configurations</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{selectedListing.name}</span>
                </div>
                <button 
                  onClick={() => setSelectedListing(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Building Address</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{selectedListing.address}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Key Specifications</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <Layers size={14} className="text-gray-500" />
                    <span>{selectedListing.amenities}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Staging Rental Rate</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={editingRate}
                      onChange={(e) => setEditingRate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                    <button 
                      onClick={() => handleUpdateRate(selectedListing.id, editingRate)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  setBrochureListing(selectedListing);
                  setSelectedListing(null);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Generate Brochure <ArrowRight size={14} />
              </button>

              <button 
                onClick={() => handleDeleteListing(selectedListing.id, selectedListing.name)}
                className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} /> Delist & Delete Property Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateListing}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Create Workspace Listing</h3>
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
                <label className="text-[10px] font-bold text-gray-500 uppercase">Property & Unit Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Apex Tower - Unit 502"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Space Type</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Office Space">Office Space</option>
                    <option value="IT/ITeS Space">IT/ITeS Space</option>
                    <option value="Coworking">Coworking</option>
                    <option value="Bare Shell">Bare Shell</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Area / Desks</label>
                  <input 
                    type="text"
                    placeholder="e.g. 5,000 sq.ft"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Rate (e.g. /sq.ft)</label>
                  <input 
                    type="text"
                    placeholder="₹150/sq.ft"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Initial Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Vacant">Vacant</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Address / Location</label>
                <input 
                  type="text"
                  placeholder="e.g. BKC, Mumbai"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DYNAMIC SALES BROCHURE MODAL & PRINT GENERATOR */}
      {brochureListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl flex flex-col gap-6 relative border border-gray-100 print:p-0 print:border-none print:shadow-none animate-scale-up">
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <span>Sales Brochure Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} /> Print/Save PDF
                </button>
                <button 
                  onClick={() => setBrochureListing(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Brochure Template */}
            <div className="flex flex-col gap-6 border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden print:border-none print:p-0">
              
              {/* Premium Top Bar Design */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-widest">
                    OfficeX Exclusive Listing
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-2 tracking-tight">{brochureListing.name}</h2>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-blue-500" /> {brochureListing.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Asking Rental</span>
                  <span className="text-xl font-extrabold text-blue-600 block mt-0.5">{brochureListing.rate}</span>
                  <span className="text-[9px] text-gray-400 font-semibold">Leasable area: {brochureListing.area}</span>
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
                <div className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Space Category</span>
                  <span className="font-extrabold text-gray-900 mt-1 block">{brochureListing.type}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Occupancy Status</span>
                  <span className="font-extrabold text-emerald-600 mt-1 block">{brochureListing.status}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm text-xs">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Key Specifications & Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {(brochureListing.amenities || "Standard CAFM Assets").split(",").map((a: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">
                      ✓ {a.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & QR Code Footer */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-5 mt-2 bg-blue-50/30 p-4 rounded-xl">
                <div className="text-xs">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Leasing Enquiry</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <Phone size={12} className="text-blue-500" /> +91 22 4987 6000
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-600 mt-0.5">
                    <Mail size={12} className="text-blue-500" /> leasing@officex.in
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Scan to Visit</span>
                    <span className="text-[9px] text-blue-600 font-bold uppercase">officex.in/listings</span>
                  </div>
                  <div className="p-1 bg-white rounded-lg border border-gray-200">
                    <QrCode size={36} className="text-gray-900" />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setBrochureListing(null)}
                className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
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
