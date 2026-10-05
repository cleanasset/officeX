"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Save, MapPin, Layers, FileText, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export interface PropertyModalData {
  id: string;
  name: string;
  type?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  area?: string | number;
  totalArea?: string | number;
  occupied?: number;
  vacant?: number;
  occPct?: number;
  grade?: string;
  inviteCode?: string;
  propertyCode?: string;
  ownerName?: string;
  panNumber?: string;
  gstin?: string;
  activeLeases?: number;
  isFullyRegistered?: boolean;
  isDetailsPending?: boolean;
}

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyModalData | null;
  onSuccess: (updatedProp: PropertyModalData) => void;
}

export function EditPropertyModal({ isOpen, onClose, property, onSuccess }: EditPropertyModalProps) {
  const [name, setName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [type, setType] = useState("Commercial Office");
  const [grade, setGrade] = useState("A");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [totalArea, setTotalArea] = useState<string | number>("");
  const [panNumber, setPanNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setPropertyCode(property.propertyCode || property.inviteCode || property.id || "");
      setType(property.type || "Commercial Office");
      setGrade(property.grade || "A");
      setAddress(property.address || property.location || "");
      
      // Parse city and state if location is "City, State"
      let parsedCity = property.city || "";
      let parsedState = property.state || "";
      if (!parsedCity && property.location && property.location.includes(",")) {
        const parts = property.location.split(",");
        parsedCity = parts[0]?.trim() || "";
        parsedState = parts[1]?.trim() || "";
      } else if (!parsedCity && property.location) {
        parsedCity = property.location;
      }

      setCity(parsedCity);
      setState(parsedState);
      
      const rawArea = property.totalArea || property.area || "";
      const numArea = String(rawArea).replace(/[^0-9]/g, "");
      setTotalArea(numArea || rawArea);

      setPanNumber(property.panNumber || "");
      setGstin(property.gstin || "");
      setOwnerName(property.ownerName || "");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Property Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const cleanArea = Number(String(totalArea).replace(/[^0-9]/g, "")) || 0;
      const updatedRecord: PropertyModalData = {
        ...property,
        name: name.trim(),
        propertyCode: propertyCode.trim() || property.id,
        inviteCode: propertyCode.trim() || property.inviteCode || property.id,
        type: type.trim(),
        grade: grade.trim(),
        address: address.trim(),
        location: city.trim() ? `${city.trim()}${state.trim() ? `, ${state.trim()}` : ""}` : (address.trim() || "Commercial Location"),
        city: city.trim(),
        state: state.trim(),
        area: cleanArea > 0 ? cleanArea.toLocaleString("en-IN") : (property.area || "25,000"),
        totalArea: cleanArea > 0 ? cleanArea : (property.totalArea || 25000),
        panNumber: panNumber.trim().toUpperCase(),
        gstin: gstin.trim().toUpperCase(),
        ownerName: ownerName.trim() || property.ownerName || "Commercial Property Owner",
        isFullyRegistered: true,
        isDetailsPending: false
      };

      // 1. Override in LocalStorage
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          if (Array.isArray(stored)) {
            const index = stored.findIndex((p: any) => p.id === property.id || (p.name && p.name.toLowerCase().trim() === property.name.toLowerCase().trim()));
            if (index !== -1) {
              stored[index] = { ...stored[index], ...updatedRecord };
            } else {
              stored.unshift(updatedRecord);
            }
            localStorage.setItem("officex_user_properties", JSON.stringify(stored));
          }

          // If active property match, update global storage keys too
          const activeId = localStorage.getItem("officex_property_id");
          if (activeId === property.id) {
            localStorage.setItem("officex_property_name", updatedRecord.name);
          }
        } catch (err) {
          console.warn("Local storage update warning:", err);
        }

        // Notify app components to re-render
        window.dispatchEvent(new CustomEvent("officex-property-added"));
      }

      // 2. Optional backend API sync fallback
      try {
        await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecord)
        });
      } catch (err) {
        // Soft fallback
      }

      setSuccessMsg("Property details updated successfully!");
      setTimeout(() => {
        onSuccess(updatedRecord);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update property details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center font-black">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Edit Property Details</h3>
              <p className="text-xs text-slate-500 font-mono">Asset ID: {property.id}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Property / Building Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Cyber Park, Eka Club"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* Property Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Code / Tag</label>
              <input
                type="text"
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                placeholder="e.g. OX-8841"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="Commercial Office">Commercial Office</option>
                <option value="IT / Tech Park">IT / Tech Park</option>
                <option value="Retail Mall">Retail Mall</option>
                <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                <option value="Industrial Estate">Industrial Estate</option>
                <option value="Mixed Use Commercial">Mixed Use Commercial</option>
              </select>
            </div>

            {/* Total Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Leasable Area (sq ft)</label>
              <input
                type="text"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="A+">Grade A+ (Institutional)</option>
                <option value="A">Grade A</option>
                <option value="B+">Grade B+</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot / Street / Area"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Ahmedabad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, Gujarat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Entity PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 27ABCDE1234F1Z5"
                maxLength={15}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            {/* Owner Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">SPV / Owner Entity Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Apex Realty Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
