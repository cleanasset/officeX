"use client";
import React, { useState, useEffect } from "react";
import { Building, MapPin, Plus, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function PropertyRegistry() {
  const [properties, setProperties] = useState<any[]>([]);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Map postgres values to format expected by cards
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          location: p.address + ", " + p.city,
          units: "Commercial Space",
          area: parseFloat(p.totalArea).toLocaleString() + " sq.ft",
          owner: p.ownerCompany || "OfficeX Management",
          grade: p.grade,
          power: "100% Backup",
          hvac: "Centralized HVAC",
          leed: "Gold Certified"
        }));
        setProperties(formatted);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "true") {
        setIsAdding(true);
      }
    }
  }, []);

  const [isAdding, setIsAdding] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [form, setForm] = useState({
    name: "",
    type: "Commercial Office",
    grade: "A",
    address: "",
    city: "Mumbai",
    pincode: "",
    totalArea: "",
    floors: "",
    furnishing: "Fully Fitted",
    power: "100% DG Backup",
    hvac: "Centralized Chilled Water",
    parking: "1 Car / 1,000 Sq.Ft",
    leed: "Gold Certified",
    owner: "",
    amenities: [] as string[]
  });

  const handleAmenityToggle = (amenity: string) => {
    if (form.amenities.includes(amenity)) {
      setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
    } else {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || "Unnamed Building Asset",
          type: form.type,
          grade: form.grade,
          address: form.address,
          city: form.city,
          pincode: form.pincode || "400001",
          totalArea: parseFloat(form.totalArea || "0") || 10000,
          ownerCompany: form.owner || "OfficeX Management"
        })
      });

      if (res.ok) {
        await fetchProperties();
      }
    } catch (err) {
      console.error("Error creating property:", err);
    }
    
    setIsAdding(false);
    setStep(1);
    setForm({
      name: "",
      type: "Commercial Office",
      grade: "A",
      address: "",
      city: "Mumbai",
      pincode: "",
      totalArea: "",
      floors: "",
      furnishing: "Fully Fitted",
      power: "100% DG Backup",
      hvac: "Centralized Chilled Water",
      parking: "1 Car / 1,000 Sq.Ft",
      leed: "Gold Certified",
      owner: "",
      amenities: []
    });
  };

  if (isAdding) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsAdding(false); setStep(1); }}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Guided Property Listing Builder</h1>
              <p className="text-xs text-gray-500 font-semibold">Standardize your commercial building assets parameters.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 border border-teal-100 text-[#0F8B7D] rounded-full">
            Step {step} of 5
          </span>
        </div>

        {/* Multi-step progress tracker bar */}
        <div className="grid grid-cols-5 gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          {[
            { s: 1, label: "1. Basic Specs" },
            { s: 2, label: "2. Physical Areas" },
            { s: 3, label: "3. Power & HVAC" },
            { s: 4, label: "4. Services" },
            { s: 5, label: "5. Review & Publish" }
          ].map((item) => (
            <div 
              key={item.s} 
              className={`pb-2 border-b-4 transition-all duration-300 ${
                step >= item.s ? "border-[#0F8B7D] text-[#0F8B7D]" : "border-gray-100"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* STEP 1: Basic Spec */}
        {step === 1 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 1: Basic Specifications & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Property Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Business Tower" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Property Type</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Commercial Office">Commercial Office Space</option>
                  <option value="IT Park">IT Park</option>
                  <option value="Coworking Center">Coworking Center</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Building Grade</label>
                <select 
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="A">Grade A (Premium Quality)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Owner / Landlord Company</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dharma Estates" 
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Address Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. BKC, Bandra East" 
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">City</label>
                <input 
                  type="text" 
                  placeholder="Mumbai" 
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Pincode</label>
                <input 
                  type="text" 
                  placeholder="400051" 
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-50 pt-5 mt-4">
              <button 
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Physical Areas */}
        {step === 2 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 2: Physical Areas & Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Area (Sq.Ft.)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 250000" 
                  value={form.totalArea}
                  onChange={(e) => setForm({ ...form, totalArea: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Floors</label>
                <input 
                  type="number" 
                  placeholder="e.g. 12" 
                  value={form.floors}
                  onChange={(e) => setForm({ ...form, floors: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Furnishing Status</label>
                <select 
                  value={form.furnishing}
                  onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Fully Fitted">Fully Fitted</option>
                  <option value="Warm Shell">Warm Shell</option>
                  <option value="Bare Shell">Bare Shell</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Parking Ratio</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Car / 1,000 Sq.Ft" 
                  value={form.parking}
                  onChange={(e) => setForm({ ...form, parking: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-50 pt-5 mt-4">
              <button 
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Power & HVAC */}
        {step === 3 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 3: Power Backup & HVAC Systems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Power Backup Capacity</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100% (2x 1500 kVA DG)" 
                  value={form.power}
                  onChange={(e) => setForm({ ...form, power: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">HVAC System Type</label>
                <select 
                  value={form.hvac}
                  onChange={(e) => setForm({ ...form, hvac: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Centralized Chilled Water">Centralized Chilled Water</option>
                  <option value="VRV/VRF System">VRV/VRF System</option>
                  <option value="Split Units AC">Split Units AC</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">LEED Certification Status</label>
                <select 
                  value={form.leed}
                  onChange={(e) => setForm({ ...form, leed: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Platinum Certified">LEED Platinum Certified</option>
                  <option value="Gold Certified">LEED Gold Certified</option>
                  <option value="Silver Certified">LEED Silver Certified</option>
                  <option value="Certified">LEED Certified</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-50 pt-5 mt-4">
              <button 
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Amenities & Services */}
        {step === 4 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 4: Key Amenities & Security Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "24/7 Security Operations",
                "Visitor Management System",
                "Food Court & Executive Lounge",
                "Multi-level Covered Parking",
                "Fiber-optic Connectivity",
                "Integrated Fire Sprinkler System",
                "Professional FM Services"
              ].map((amenity) => {
                const isSelected = form.amenities.includes(amenity);
                return (
                  <button 
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-teal-50 border-teal-200 text-[#0F8B7D]" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0F8B7D] flex items-center justify-center text-white text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-50 pt-5 mt-4">
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Publish */}
        {step === 5 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 5: Review Details & Publish to Marketplace
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Property Name</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Property Type</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Owner Company</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.owner || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Grade</span>
                <span className="font-extrabold text-gray-900 mt-1 block">Grade {form.grade}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Address Location</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.address ? `${form.address}, ` : ""}{form.city} - {form.pincode}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Area</span>
                <span className="font-extrabold text-[#0F8B7D] mt-1 block">{parseFloat(form.totalArea || "0").toLocaleString()} Sq.Ft.</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Floors / Capacity</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.floors} Floors</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">HVAC System</span>
                <span className="font-extrabold text-gray-900 mt-1 block">{form.hvac}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">LEED Rating</span>
                <span className="font-extrabold text-emerald-600 mt-1 block">{form.leed}</span>
              </div>
            </div>

            {form.amenities.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-2">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-2">Selected Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {form.amenities.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-bold text-[#0F8B7D]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 border-t border-gray-50 pt-5 mt-4">
              <button 
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} /> Publish Building Asset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Registry</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Detailed directory of building assets, physical areas, and landlord profiles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[220px] hover:border-purple-300 transition-colors shadow-sm">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Building size={16} className="text-purple-600 animate-pulse-green" />
                  {p.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-600 text-[9px] font-extrabold uppercase tracking-wider">
                  Grade {p.grade}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-2 font-medium">
                <MapPin size={12} className="text-gray-400" /> {p.location}
              </p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-[11px] border-t border-gray-50 pt-3">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Capacity</span>
                  <span className="font-bold text-gray-800">{p.units}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Total Area</span>
                  <span className="font-bold text-gray-800">{p.area}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">HVAC System</span>
                  <span className="font-semibold text-gray-700">{p.hvac}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">LEED Cert</span>
                  <span className="font-bold text-emerald-600">{p.leed}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
