"use client";
import React, { useState, useEffect, useRef } from "react";
import { Building, MapPin, Plus, ArrowLeft, Check, Sparkles, Upload, Image as ImageIcon, Link as LinkIcon, X, Tag, ShieldCheck, Zap, Coffee, Wifi, Car, Trash2, AlertTriangle, Bell } from "lucide-react";

export default function PropertyRegistry() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [step, setStep] = useState(1);
  const [imageUploadType, setImageUploadType] = useState<"preset" | "upload" | "url">("preset");
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [propertyToDelete, setPropertyToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // City Search Dropdown State
  const [citySearch, setCitySearch] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const popularCities = [
    "Ahmedabad, Gujarat",
    "Mumbai, Maharashtra",
    "Bengaluru, Karnataka",
    "Delhi NCR (Gurgaon / Noida)",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Jaipur, Rajasthan",
    "Surat, Gujarat",
    "Indore, Madhya Pradesh",
    "Chandigarh, Punjab",
    "Kochi, Kerala",
    "Lucknow, Uttar Pradesh"
  ];

  const presetImages = [
    { name: "Modern Glass Tower", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
    { name: "Classic Brick Plaza", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop" },
    { name: "Futuristic Tech Space", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" },
    { name: "Executive Corporate Park", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop" },
    { name: "Sustainable Eco-Building", url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800&auto=format&fit=crop" },
    { name: "Minimalist Urban Studio", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop" }
  ];

  const categorizedAmenities = [
    {
      category: "Core Infrastructure & Power",
      icon: <Zap size={14} className="text-amber-500" />,
      items: [
        "100% DG Power Backup",
        "High-Speed Passenger Elevators",
        "Dedicated Freight & Service Lifts",
        "Centralized Chilled Water HVAC",
        "VRV / VRF Energy Efficient AC",
        "Multi-Level Covered Parking",
        "Dedicated Substation (11kV/22kV)",
        "24/7 Pressurized Water Supply"
      ]
    },
    {
      category: "Safety, Security & Surveillance",
      icon: <ShieldCheck size={14} className="text-emerald-500" />,
      items: [
        "3-Tier 24/7 Security & CCTV",
        "Integrated Fire Sprinklers & Hydrants",
        "Automated Boom Barriers & RFID Access",
        "Visitor Management System (VMS)",
        "Smoke & Gas Detection Sensors",
        "Emergency Evacuation Stairwells"
      ]
    },
    {
      category: "Hospitality, Food & Wellness",
      icon: <Coffee size={14} className="text-orange-500" />,
      items: [
        "Multi-Cuisine Food Court & Cafeteria",
        "Executive Business Lounge",
        "Gymnasium & Wellness Center",
        "Crèche & Child Daycare Facility",
        "Rooftop Terrace Garden & Cafe",
        "ATM & Banking Kiosk"
      ]
    },
    {
      category: "Technology, Connectivity & ESG",
      icon: <Wifi size={14} className="text-blue-500" />,
      items: [
        "Dual-Ring High-Speed Fiber Optic",
        "EV Vehicle Charging Stations",
        "Conference & Board Rooms",
        "Smart BMS Automated Controls",
        "Solar Rooftop Power Grid",
        "Rainwater Harvesting System",
        "Zero Waste Water Recycling (STP)"
      ]
    }
  ];

  // Form state
  const [form, setForm] = useState({
    name: "",
    type: "Commercial Office",
    grade: "A",
    address: "",
    city: "Ahmedabad",
    pincode: "",
    totalArea: "",
    floors: "",
    furnishing: "Fully Fitted",
    power: "100% DG Backup",
    hvac: "Centralized Chilled Water",
    parking: "1 Car / 1,000 Sq.Ft",
    leed: "Gold Certified",
    owner: "",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    customImageUrl: "",
    amenities: [
      "100% DG Power Backup",
      "High-Speed Passenger Elevators",
      "3-Tier 24/7 Security & CCTV",
      "Centralized Chilled Water HVAC",
      "Multi-Level Covered Parking",
      "Dual-Ring High-Speed Fiber Optic"
    ] as string[]
  });

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          location: (p.address ? p.address + ", " : "") + p.city,
          city: p.city,
          address: p.address,
          units: "Commercial Space",
          area: parseFloat(p.totalArea || "0").toLocaleString() + " sq.ft",
          owner: p.ownerCompany || "OfficeX Management",
          grade: p.grade,
          power: "100% Backup",
          hvac: "Centralized HVAC",
          leed: "Gold Certified",
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
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

  const handleAmenityToggle = (amenity: string) => {
    if (form.amenities.includes(amenity)) {
      setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
    } else {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
    }
  };

  const handleAddCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmenityInput.trim()) return;
    const trimmed = customAmenityInput.trim();
    if (!form.amenities.includes(trimmed)) {
      setForm({ ...form, amenities: [...form.amenities, trimmed] });
    }
    setCustomAmenityInput("");
  };

  const handleRemoveCustomAmenity = (amenity: string) => {
    setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setForm({ ...form, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (form.customImageUrl.trim()) {
      setForm({ ...form, imageUrl: form.customImageUrl.trim() });
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
          address: form.address || "Main Road",
          city: form.city || "Ahmedabad",
          pincode: form.pincode || "380015",
          totalArea: parseFloat(form.totalArea || "0") || 100000,
          ownerCompany: form.owner || "OfficeX Management",
          imageUrl: form.imageUrl
        })
      });

      if (res.ok) {
        await fetchProperties();
        showToast(`Successfully published ${form.name || "Building Asset"} to marketplace registry!`);
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
      city: "Ahmedabad",
      pincode: "",
      totalArea: "",
      floors: "",
      furnishing: "Fully Fitted",
      power: "100% DG Backup",
      hvac: "Centralized Chilled Water",
      parking: "1 Car / 1,000 Sq.Ft",
      leed: "Gold Certified",
      owner: "",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
      customImageUrl: "",
      amenities: [
        "100% DG Power Backup",
        "High-Speed Passenger Elevators",
        "3-Tier 24/7 Security & CCTV"
      ]
    });
  };

  // Delete Listing Handler
  const handleDeleteListing = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties?id=${propertyToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== propertyToDelete.id));
        showToast(`Listing "${propertyToDelete.name}" has been permanently delisted and removed.`);
      } else {
        showToast("Error removing property listing. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      showToast("Error removing property listing.");
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  if (isAdding) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsAdding(false); setStep(1); }}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Guided Property Listing Builder</h1>
              <p className="text-xs text-gray-500 font-semibold">Upload photos, configure building specifications, and select verified amenities.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 border border-teal-100 text-[#0F8B7D] rounded-full">
            Step {step} of 5
          </span>
        </div>

        {/* Multi-step progress tracker bar */}
        <div className="grid grid-cols-5 gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          {[
            { s: 1, label: "1. Specs & Image" },
            { s: 2, label: "2. Physical Areas" },
            { s: 3, label: "3. Power & HVAC" },
            { s: 4, label: "4. All Amenities" },
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

        {/* STEP 1: Basic Specs, City Autocomplete & Photo Upload */}
        {step === 1 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 1: Property Specs, City Location & Cover Image
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Property Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Property Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Brick Plaza" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {/* Property Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Property Type</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Commercial Office">Commercial Office Space</option>
                  <option value="IT Park">IT / ITeS Tech Park</option>
                  <option value="Coworking Center">Coworking & Managed Office</option>
                  <option value="Industrial Park">Industrial & Logistics Park</option>
                </select>
              </div>

              {/* Building Grade */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Building Grade</label>
                <select 
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="A">Grade A (Institutional / Premium)</option>
                  <option value="B">Grade B (Standard Commercial)</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              {/* Owner Company */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Owner / Landlord Developer</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Real Estate Developers LLP" 
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {/* Address Location */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Street Address / Micro-market</label>
                <input 
                  type="text" 
                  placeholder="e.g. S G Highway, Near Iscon Cross Road" 
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {/* Searchable City Selector */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">City (Searchable Dropdown)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type to search city (e.g. Ahmedabad, Mumbai)..." 
                    value={form.city}
                    onChange={(e) => {
                      setForm({ ...form, city: e.target.value });
                      setCitySearch(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-white"
                  />
                  <MapPin size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>

                {/* City Suggestions Dropdown */}
                {isCityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    <div className="p-1.5 bg-gray-50 border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase">
                      Select Major Commercial Hub
                    </div>
                    {popularCities
                      .filter(c => !citySearch || c.toLowerCase().includes(citySearch.toLowerCase()))
                      .map((c) => {
                        const cityName = c.split(",")[0].trim();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, city: cityName });
                              setIsCityDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-teal-50 hover:text-[#0F8B7D] flex items-center justify-between transition-colors cursor-pointer border-b border-gray-50"
                          >
                            <span>{c}</span>
                            {form.city.toLowerCase() === cityName.toLowerCase() && (
                              <Check size={12} className="text-[#0F8B7D]" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Pincode</label>
                <input 
                  type="text" 
                  placeholder="e.g. 380015" 
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {/* --- IMAGE SELECTION & UPLOAD SECTION --- */}
              <div className="flex flex-col gap-3 md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-900 block">Building Cover Photo / Aesthetic Image</label>
                    <p className="text-[11px] text-gray-500 font-semibold">Upload your own building image, paste an image URL, or choose from our architectural presets.</p>
                  </div>
                  
                  {/* Mode Switcher */}
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setImageUploadType("preset")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        imageUploadType === "preset" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Presets (6)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType("upload")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        imageUploadType === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType("url")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        imageUploadType === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* 1. Preset Gallery */}
                {imageUploadType === "preset" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {presetImages.map((theme) => {
                      const isSelected = form.imageUrl === theme.url;
                      return (
                        <button
                          key={theme.name}
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: theme.url })}
                          className={`flex flex-col rounded-xl overflow-hidden border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-md" 
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="h-24 w-full bg-gray-100 relative">
                            <img src={theme.url} alt={theme.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-[10px] shadow">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="p-2 text-[10px] font-bold text-gray-800 bg-white border-t border-gray-50 truncate">
                            {theme.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. File Upload */}
                {imageUploadType === "upload" && (
                  <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <div className="p-3 bg-white rounded-full shadow-sm border border-gray-200 text-[#0F8B7D] mb-2">
                      <Upload size={22} />
                    </div>
                    <span className="font-bold text-xs text-gray-900">Upload Building Image from Device</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-0.5">Supports PNG, JPG, WEBP up to 10MB</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Browse Image File
                    </button>
                  </div>
                )}

                {/* 3. Custom URL */}
                {imageUploadType === "url" && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        placeholder="Paste image web link (e.g. https://images.unsplash.com/...)"
                        value={form.customImageUrl}
                        onChange={(e) => setForm({ ...form, customImageUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                      >
                        Apply Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Preview Hero Card */}
                {form.imageUrl && (
                  <div className="mt-3 p-3 rounded-2xl border border-teal-100 bg-teal-50/20 flex items-center gap-4">
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shrink-0">
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider block">Active Building Cover Photo</span>
                      <span className="text-xs font-extrabold text-gray-900 block truncate mt-0.5">{form.name || "Building Asset Cover"}</span>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Next Button */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 mt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next: Physical Areas →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Physical Areas */}
        {step === 2 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 2: Physical Areas & Floor Capacities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Super Built-up Area (Sq.Ft.)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 250000" 
                  value={form.totalArea}
                  onChange={(e) => setForm({ ...form, totalArea: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Floors</label>
                <input 
                  type="number" 
                  placeholder="e.g. 14" 
                  value={form.floors}
                  onChange={(e) => setForm({ ...form, floors: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Furnishing Status</label>
                <select 
                  value={form.furnishing}
                  onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Fully Fitted">Fully Fitted (Plug & Play)</option>
                  <option value="Warm Shell">Warm Shell (Flooring & HVAC done)</option>
                  <option value="Bare Shell">Bare Shell</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Dedicated Parking Ratio</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Car per 1,000 Sq.Ft." 
                  value={form.parking}
                  onChange={(e) => setForm({ ...form, parking: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-100 pt-5 mt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next: Power & HVAC →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Power & HVAC */}
        {step === 3 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 3: Power Backup & HVAC Systems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Power Backup Specification</label>
                <input 
                  type="text" 
                  placeholder="e.g. 100% DG Backup (2x 1500 kVA Cummins)" 
                  value={form.power}
                  onChange={(e) => setForm({ ...form, power: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">HVAC System Type</label>
                <select 
                  value={form.hvac}
                  onChange={(e) => setForm({ ...form, hvac: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Centralized Chilled Water">Centralized Chilled Water System</option>
                  <option value="VRV/VRF System">VRV / VRF Energy Efficient System</option>
                  <option value="DX Split Units">DX Split Units AC</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">LEED / Green Building Certification</label>
                <select 
                  value={form.leed}
                  onChange={(e) => setForm({ ...form, leed: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="Platinum Certified">LEED Platinum Certified</option>
                  <option value="Gold Certified">LEED Gold Certified</option>
                  <option value="Silver Certified">LEED Silver Certified</option>
                  <option value="IGBC Certified">IGBC Green Certified</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-100 pt-5 mt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button 
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next: Amenities →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Comprehensive Categorized Amenities & Custom Amenity Adder */}
        {step === 4 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#0F8B7D]" /> Step 4: Comprehensive Amenities & Features
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Select from categorized amenities or type your own custom features.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F8B7D] text-xs font-extrabold border border-teal-100">
                {form.amenities.length} Selected
              </span>
            </div>

            {/* Categorized Amenities Lists */}
            <div className="flex flex-col gap-6">
              {categorizedAmenities.map((cat) => (
                <div key={cat.category} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-gray-800 border-b border-gray-50 pb-1.5">
                    {cat.icon}
                    <span>{cat.category}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {cat.items.map((amenity) => {
                      const isSelected = form.amenities.includes(amenity);
                      return (
                        <button 
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-teal-50 border-teal-300 text-[#0F8B7D] shadow-sm" 
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate pr-2">{amenity}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? "bg-[#0F8B7D] text-white" : "border border-gray-300"
                          }`}>
                            {isSelected && "✓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Amenity Adder */}
            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3 bg-gray-50/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Tag size={14} className="text-[#0F8B7D]" /> Add Custom Amenity or Special Facility
              </span>
              <form onSubmit={handleAddCustomAmenity} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Helipad, Squash Court, Solar Carport, In-house Clinic..." 
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D] bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  + Add Amenity
                </button>
              </form>

              {/* Display Custom Tag Badges */}
              {form.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.amenities.map((a) => (
                    <span 
                      key={a} 
                      className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-bold text-[#0F8B7D] flex items-center gap-1.5"
                    >
                      <span>✓ {a}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCustomAmenity(a)}
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-100 pt-5 mt-2">
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button 
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Next: Review & Publish →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Publish */}
        {step === 5 && (
          <div className="premium-card p-8 border border-gray-200 bg-white flex flex-col gap-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F8B7D]" /> Step 5: Review Building Asset & Publish
            </h3>

            {/* Preview Banner */}
            <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
              <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="px-2 py-0.5 rounded bg-[#0F8B7D] text-[9px] font-extrabold uppercase tracking-wider">
                    Grade {form.grade} Asset
                  </span>
                  <h2 className="text-xl font-extrabold mt-1">{form.name || "Commercial Building Asset"}</h2>
                  <p className="text-xs opacity-90">{form.address ? `${form.address}, ` : ""}{form.city} - {form.pincode}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Owner / Landlord Developer</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{form.owner || "OfficeX Management"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Property Category</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{form.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Super Built-up Area</span>
                <span className="font-extrabold text-[#0F8B7D] mt-0.5 block">{parseFloat(form.totalArea || "0").toLocaleString()} Sq.Ft.</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Floors / Capacity</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{form.floors} Floors</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">HVAC System</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{form.hvac}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Power Backup</span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">{form.power}</span>
              </div>
            </div>

            {form.amenities.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-2">Verified Amenities ({form.amenities.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {form.amenities.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-bold text-[#0F8B7D]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 border-t border-gray-100 pt-5 mt-2">
              <button 
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button 
                type="button"
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
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
    <div className="flex flex-col gap-8 font-sans relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <Bell size={16} className="text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Registry</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Detailed directory of building assets, physical areas, and landlord profiles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Add Property
        </button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="premium-card border border-gray-200 bg-white flex flex-col justify-between hover:border-purple-300 transition-all shadow-sm overflow-hidden rounded-2xl group">
            <div>
              {/* Building Image Banner */}
              <div className="h-40 w-full relative overflow-hidden bg-gray-100 border-b border-gray-100">
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider shadow">
                    Grade {p.grade}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Building size={16} className="text-purple-600 animate-pulse-green" />
                    {p.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5 font-medium">
                  <MapPin size={12} className="text-gray-400 shrink-0" /> <span className="truncate">{p.location}</span>
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 text-[11px] border-t border-gray-50 pt-3">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Total Area</span>
                    <span className="font-bold text-gray-800">{p.area}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Owner / Landlord</span>
                    <span className="font-bold text-gray-800 truncate block">{p.owner}</span>
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

            {/* Card Actions: Delete / Delist Option */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Active Listed
              </span>
              <button
                type="button"
                onClick={() => setPropertyToDelete(p)}
                className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Delete or delist this property listing"
              >
                <Trash2 size={12} />
                <span>Delete Listing</span>
              </button>
            </div>
          </div>
        ))}

        {properties.length === 0 && (
          <div className="md:col-span-3 p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <Building size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-sm">No Property Listings in Registry</h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">Click the "Add Property" button to list your first building asset.</p>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL: Delete Property Listing */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl animate-scale-up border border-gray-100">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3.5 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Delete & Delist Property</h3>
                <span className="text-[11px] text-gray-500 font-semibold">Permanently remove asset from registry</span>
              </div>
            </div>

            {/* Asset Info Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-1.5">
              <div className="font-bold text-gray-900 text-sm">{propertyToDelete.name}</div>
              <div className="text-gray-500 font-semibold flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                {propertyToDelete.location}
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                Total Area: <strong className="text-gray-800">{propertyToDelete.area}</strong> • Grade {propertyToDelete.grade}
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Are you sure you want to delist and delete this listing? It will be removed from marketplace search, rent collection roll, and broker pipeline views.
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteListing}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeleting ? "Delisting..." : "Confirm Delete Listing"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
