"use client";
import React, { useState } from "react";
import { Building, Plus, Search, MapPin, Layers, X, Check, Bell, Edit3, ArrowRight } from "lucide-react";

export default function ListingsPage() {
  const [listings, setListings] = useState([
    { id: 1, name: "Apex Business Tower - Floor 4", type: "Office Space", area: "8,500 sq.ft", rate: "₹180/sq.ft", status: "Vacant", address: "BKC, Mumbai", amenities: "24/7 Power, VRV Air Conditioning" },
    { id: 2, name: "Meridian Tech Park - Block B", type: "IT/ITeS Space", area: "15,000 sq.ft", rate: "₹120/sq.ft", status: "Occupied", address: "Whitefield, Bengaluru", amenities: "Central Chillers, Fibre Optic" },
    { id: 3, name: "Nexus Hub - Desk Space", type: "Coworking", area: "200 Desks", rate: "₹12,000/desk", status: "Vacant", address: "Hinjewadi, Pune", amenities: "Shared Lounge, Meeting Rooms" }
  ]);

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState("");
  const [editingRate, setEditingRate] = useState("");

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
    setNotification("Successfully created new staging workspace listing!");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleUpdateRate = (id: number, newRate: string) => {
    setListings(listings.map(l => l.id === id ? { ...l, rate: newRate } : l));
    setSelectedListing(null);
    setEditingRate("");
    setNotification("Staging rental rate updated successfully!");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="flex flex-col gap-8 relative">
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
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 font-bold text-xs flex items-center gap-2 max-w-2xl">
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
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr 
                key={l.id} 
                onClick={() => { setSelectedListing(l); setEditingRate(l.rate); }}
                className="border-b border-gray-200 text-xs hover:bg-[#F0FDFA]/40 cursor-pointer transition-colors"
              >
                <td className="py-4 font-bold text-blue-700 flex items-center gap-2 hover:underline">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Listing Details Drawer */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/35 flex justify-end z-50 animate-fade-in">
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
            
            <div className="border-t border-gray-100 pt-5">
              <button 
                onClick={() => alert(`Staging sales brochure compiled for ${selectedListing.name}!`)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Generate Brochure <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateListing}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-6 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 text-base">Register New Workspace Listing</h3>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Property & Unit Details</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Tower - Suite 501"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Space Type</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Office Space">Office Space</option>
                    <option value="IT/ITeS Space">IT/ITeS Space</option>
                    <option value="Coworking">Coworking</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Vacancy Status</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Area (Sq.Ft./Desks)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5,000 sq.ft"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Rental Rate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₹150/sq.ft"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer"
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
    </div>
  );
}
