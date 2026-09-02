"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle, ArrowRight, Save, Upload, Plus, Trash2, Building, ShieldCheck, FileText, Check, ArrowLeft } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import AddressMapAutocomplete from "@/components/AddressMapAutocomplete";
import PropertyTitleAutocomplete from "@/components/PropertyTitleAutocomplete";
import { IndianLocationItem, AddressSuggestion } from "@/lib/indianLocations";

const MapPinPicker = dynamic(() => import("@/components/MapPinPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400">
      Loading Interactive Map Pin Locator...
    </div>
  )
});

export default function OwnerPropertyBuilder() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Clean Blank Listing Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic & Location
    propertyName: "",
    propertyType: "Commercial Office Park",
    grade: "Grade A",
    address: "",
    city: "",
    state: "",
    microMarket: "",
    pincode: "",
    metroDistance: "",

    // Step 2: Building Specs & Floors
    totalSuperArea: "",
    totalFloors: "",
    typicalFloorPlate: "",
    availableArea: "",
    seatingCapacity: "",
    ceilingHeight: "",
    passengerLifts: 0,
    serviceLifts: 0,

    // Step 3: Commercial Terms & Lease Model
    baseRentPerSqft: "",
    camPerSqft: "",
    securityDepositMonths: "3 Months",
    lockInPeriodMonths: "36 Months",
    annualEscalationPct: "5%",
    carParkingCharges: "",
    bikeParkingCharges: "",

    // Step 4: Power, HVAC & Technical Redundancy
    powerLoadKVA: "",
    dgBackupPct: "100% DG Backup",
    hvacType: "Central Air Conditioning",
    telecomProviders: [] as string[],

    // Step 5: Campus Amenities & Parking
    carParkingSlots: 0,
    twoWheelerSlots: 0,
    evChargingStations: 0,
    amenities: [] as string[],

    // Step 6: Statutory Compliance & Documents
    fireNocExpiry: "",
    liftLicenseExpiry: "",
    pollutionConsentExpiry: "",
    occupancyCertificate: true,

    // Building Photo / Media
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",

    // GPS Coordinates (auto-filled from geocode)
    latitude: null as number | null,
    longitude: null as number | null
  });

  const steps = [
    { num: 1, label: "Basic & Location" },
    { num: 2, label: "Building & Spaces" },
    { num: 3, label: "Commercial Terms" },
    { num: 4, label: "Power & HVAC" },
    { num: 5, label: "Amenities & Parking" },
    { num: 6, label: "Compliance & Docs" },
    { num: 7, label: "Preview & Publish" }
  ];

  const handleLocationSelect = (displayText: string, loc?: any) => {
    if (loc) {
      setFormData(prev => ({
        ...prev,
        propertyName: prev.propertyName || loc.buildingName || "",
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        microMarket: loc.area || displayText.split(",")[0] || prev.microMarket,
        pincode: loc.pincode || prev.pincode,
        address: loc.displayName || displayText || prev.address
      }));
    }
  };

  const handleAddressSelect = (fullAddr: string, addr?: AddressSuggestion) => {
    if (addr) {
      setFormData(prev => ({
        ...prev,
        address: addr.fullAddress,
        city: addr.city,
        state: addr.state,
        microMarket: addr.microMarket,
        pincode: addr.pincode,
        metroDistance: addr.metroDistance
      }));
    } else {
      setFormData(prev => ({ ...prev, address: fullAddr }));
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleNext = async () => {
    if (currentStep === 1 && !formData.propertyName) {
      showToast("Please enter property title / name.");
      return;
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 7: Publish to real database
      const ownerUserId = typeof window !== "undefined" ? localStorage.getItem("officex_user_id") || "" : "";
      const ownerName = typeof window !== "undefined" ? localStorage.getItem("officex_user_name") || "" : "";
      const ownerCompany = typeof window !== "undefined" ? localStorage.getItem("officex_user_company") || "" : "";

      const propertyPayload = {
        name: formData.propertyName || "Commercial Tower",
        type: formData.propertyType || "Commercial Office Park",
        grade: formData.grade?.replace(/^Grade\s+/i, "") || "A",
        address: formData.address || `${formData.microMarket}, ${formData.city}`,
        city: formData.city || "Unknown",
        state: formData.state || "",
        microMarket: formData.microMarket || "",
        pincode: formData.pincode || "000000",
        totalArea: parseFloat(formData.totalSuperArea?.replace(/,/g, "") || "0") || 1000,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ownerName: ownerName,
        ownerCompany: ownerCompany,
        ownerUserId: ownerUserId || undefined,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
        compliance: {
          fireNocExpiry: formData.fireNocExpiry || undefined,
          liftLicenseExpiry: formData.liftLicenseExpiry || undefined,
          pollutionConsentExpiry: formData.pollutionConsentExpiry || undefined,
          occupancyCertificate: formData.occupancyCertificate
        }
      };

      try {
        const res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyPayload)
        });

        const dbProp = await res.json();

        if (res.ok) {
          // Also store in localStorage for immediate UI display
          if (typeof window !== "undefined") {
            const newProp = {
              id: dbProp.id || `prop-${Date.now()}`,
              name: formData.propertyName,
              city: formData.city,
              state: formData.state,
              microMarket: formData.microMarket,
              grade: formData.grade,
              totalArea: formData.totalSuperArea,
              availableArea: formData.availableArea,
              baseRent: formData.baseRentPerSqft,
              cam: formData.camPerSqft,
              address: formData.address,
              pincode: formData.pincode,
              latitude: formData.latitude,
              longitude: formData.longitude,
              date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            };
            const existing = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
            localStorage.setItem("officex_user_properties", JSON.stringify([newProp, ...existing]));
            window.dispatchEvent(new CustomEvent("officex-property-added", { detail: newProp }));
          }

          showToast("Property listing published successfully to your portfolio & database!");
          setTimeout(() => {
            router.push("/properties");
          }, 1200);
        } else {
          showToast(`Error: ${dbProp.error || "Failed to publish property."}`);
        }
      } catch (err) {
        console.error("Property publish error:", err);
        showToast("Network error publishing property. Saved locally.");
        // Fallback: save to localStorage only
        if (typeof window !== "undefined") {
          const newProp = {
            id: `prop-${Date.now()}`,
            name: formData.propertyName,
            city: formData.city,
            state: formData.state,
            microMarket: formData.microMarket,
            grade: formData.grade,
            totalArea: formData.totalSuperArea,
            address: formData.address,
            pincode: formData.pincode,
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          };
          const existing = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          localStorage.setItem("officex_user_properties", JSON.stringify([newProp, ...existing]));
        }
        setTimeout(() => {
          router.push("/properties");
        }, 1200);
      }
    }
  };

  const toggleAmenity = (item: string) => {
    const next = formData.amenities.includes(item)
      ? formData.amenities.filter((a) => a !== item)
      : [...formData.amenities, item];
    setFormData({ ...formData, amenities: next });
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-12 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/properties" className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">List New Commercial Property</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Property Owner Portal • Complete Technical & Commercial Specification</p>
          </div>
        </div>
        <button
          onClick={() => showToast("Draft listing saved!")}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
        >
          <Save size={13} /> Save Draft
        </button>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between overflow-x-auto">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              currentStep === s.num
                ? "bg-[#0F8B7D] text-white shadow-xs"
                : currentStep > s.num
                ? "bg-teal-50 text-teal-800"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === s.num ? "bg-white text-[#0F8B7D]" : "bg-gray-200 text-gray-700"
            }`}>
              {currentStep > s.num ? "✓" : s.num}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main Step Content Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        {/* STEP 1: Basic & Location */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>1. Basic Property Information & Location</span>
              <span className="text-[10px] font-bold text-[#0F8B7D] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                Google Maps Places Search Active
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    PROPERTY TITLE / NAME *
                  </label>
                  <span className="text-[9px] font-bold text-[#0F8B7D] flex items-center gap-1">
                    Google Maps Autocomplete Active
                  </span>
                </div>
                <PropertyTitleAutocomplete
                  value={formData.propertyName}
                  onChange={(name, selectedMeta) => {
                    if (selectedMeta) {
                      setFormData(prev => ({
                        ...prev,
                        propertyName: name,
                        microMarket: selectedMeta.area || prev.microMarket,
                        city: selectedMeta.city || prev.city,
                        state: selectedMeta.state || prev.state,
                        pincode: selectedMeta.pincode || prev.pincode,
                        address: selectedMeta.fullAddress || selectedMeta.displayName || prev.address,
                        metroDistance: selectedMeta.metroDistance || prev.metroDistance,
                        latitude: selectedMeta.latitude ?? prev.latitude,
                        longitude: selectedMeta.longitude ?? prev.longitude
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, propertyName: name }));
                    }
                  }}
                  placeholder="Type to search on Google Maps (e.g. Shivalik Shilp, Mondeal Heights, Devasya...)"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">BUILDING GRADE</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>Grade A+</option>
                  <option>Grade A</option>
                  <option>Grade B</option>
                </select>
              </div>
            </div>

            {/* Location & Address Fields (Auto-filled from Google Maps or Manually Editable) */}
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">
                  📍 Verified Location & Address Details (Auto-Filled / Editable)
                </span>
                <span className="text-[9px] text-gray-500 font-medium">
                  Click any field to edit manually if property is not on Google Maps
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">AREA / LOCALITY</label>
                  <input
                    value={formData.microMarket}
                    onChange={(e) => setFormData({ ...formData, microMarket: e.target.value })}
                    placeholder="e.g. Satellite / Nikol"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">CITY</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Ahmedabad"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">STATE</label>
                  <input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Gujarat"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">PINCODE</label>
                  <input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 380015"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">FULL PHYSICAL ADDRESS</label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Shivalik Shilp, Near Iskcon Cross Road, Sanidhya, Satellite, Ahmedabad, Gujarat 380015"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">METRO / TRANSIT PROXIMITY</label>
                  <input
                    value={formData.metroDistance}
                    onChange={(e) => setFormData({ ...formData, metroDistance: e.target.value })}
                    placeholder="e.g. 1.2km (Metro Station)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Map Pin Locator */}
            <MapPinPicker
              lat={formData.latitude}
              lng={formData.longitude}
              onChange={(newLat, newLng) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: newLat,
                  longitude: newLng
                }));
              }}
            />

            {/* Building Photo / Media Selector */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  🏢 Building Photo & Showcase Media
                </span>
                <span className="text-[9px] text-gray-400">
                  Select a template photo or enter custom image URL
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {[
                  {
                    label: "Glass High-Rise",
                    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    label: "Corporate Tower",
                    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    label: "Tech Business Park",
                    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    label: "Modern Facade",
                    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: item.url }))}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 w-28 h-20 group cursor-pointer ${
                      formData.imageUrl === item.url ? "border-[#0F8B7D] ring-2 ring-teal-500/20 shadow-sm" : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-semibold py-0.5 text-center">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Or paste custom image URL (e.g. https://...)"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Building Specs & Spaces */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">2. Physical Building Specifications & Floor Plates</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TOTAL SUPER BUILT-UP AREA</label>
                <input
                  value={formData.totalSuperArea}
                  onChange={(e) => setFormData({ ...formData, totalSuperArea: e.target.value })}
                  placeholder="e.g. 150,000 sq.ft."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TOTAL FLOORS (STRUCTURE)</label>
                <input
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                  placeholder="e.g. G + 14 Floors"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TYPICAL FLOOR PLATE</label>
                <input
                  value={formData.typicalFloorPlate}
                  onChange={(e) => setFormData({ ...formData, typicalFloorPlate: e.target.value })}
                  placeholder="e.g. 12,500 sq.ft."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AVAILABLE VACANCY</label>
                <input
                  value={formData.availableArea}
                  onChange={(e) => setFormData({ ...formData, availableArea: e.target.value })}
                  placeholder="e.g. 25,000 sq.ft."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SEATING CAPACITY</label>
                <input
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                  placeholder="e.g. 350 Seats"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CLEAR CEILING HEIGHT</label>
                <input
                  value={formData.ceilingHeight}
                  onChange={(e) => setFormData({ ...formData, ceilingHeight: e.target.value })}
                  placeholder="e.g. 3.8m Clear Height"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PASSENGER LIFTS</label>
                <input
                  type="number"
                  value={formData.passengerLifts || ""}
                  onChange={(e) => setFormData({ ...formData, passengerLifts: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 6"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SERVICE LIFTS</label>
                <input
                  type="number"
                  value={formData.serviceLifts || ""}
                  onChange={(e) => setFormData({ ...formData, serviceLifts: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Commercial Terms */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">3. Commercial Lease Terms & Pricing Model</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">BASE RENT (₹ / SQ.FT. / MONTH)</label>
                <input
                  value={formData.baseRentPerSqft}
                  onChange={(e) => setFormData({ ...formData, baseRentPerSqft: e.target.value })}
                  placeholder="e.g. 185"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-green-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAM / MAINTENANCE (₹ / SQ.FT. / MO)</label>
                <input
                  value={formData.camPerSqft}
                  onChange={(e) => setFormData({ ...formData, camPerSqft: e.target.value })}
                  placeholder="e.g. 18"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SECURITY DEPOSIT</label>
                <select
                  value={formData.securityDepositMonths}
                  onChange={(e) => setFormData({ ...formData, securityDepositMonths: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>9 Months</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">LOCK-IN PERIOD</label>
                <select
                  value={formData.lockInPeriodMonths}
                  onChange={(e) => setFormData({ ...formData, lockInPeriodMonths: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>12 Months</option>
                  <option>24 Months</option>
                  <option>36 Months</option>
                  <option>60 Months</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ANNUAL ESCALATION</label>
                <select
                  value={formData.annualEscalationPct}
                  onChange={(e) => setFormData({ ...formData, annualEscalationPct: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>5%</option>
                  <option>7.5%</option>
                  <option>10%</option>
                  <option>15% (Every 3 Years)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Power, HVAC */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">4. Power Infrastructure, HVAC & Redundancy</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SANCTIONED POWER LOAD</label>
                <input
                  value={formData.powerLoadKVA}
                  onChange={(e) => setFormData({ ...formData, powerLoadKVA: e.target.value })}
                  placeholder="e.g. 2,000 kVA"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">DIESEL GENERATOR (DG) BACKUP</label>
                <select
                  value={formData.dgBackupPct}
                  onChange={(e) => setFormData({ ...formData, dgBackupPct: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>100% N+1 DG Backup</option>
                  <option>100% DG Backup</option>
                  <option>50% Critical Load</option>
                  <option>No DG Backup</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">HVAC / COOLING ARCHITECTURE</label>
                <select
                  value={formData.hvacType}
                  onChange={(e) => setFormData({ ...formData, hvacType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>Central Chiller Water-Cooled</option>
                  <option>VRV / VRF High Efficiency</option>
                  <option>Split Units / DX System</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Amenities */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">5. Campus Amenities & Parking Infrastructure</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAR PARKING SLOTS</label>
                <input
                  type="number"
                  value={formData.carParkingSlots || ""}
                  onChange={(e) => setFormData({ ...formData, carParkingSlots: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 150"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TWO WHEELER SLOTS</label>
                <input
                  type="number"
                  value={formData.twoWheelerSlots || ""}
                  onChange={(e) => setFormData({ ...formData, twoWheelerSlots: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 300"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">EV CHARGING STATIONS</label>
                <input
                  type="number"
                  value={formData.evChargingStations || ""}
                  onChange={(e) => setFormData({ ...formData, evChargingStations: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 12"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">CAMPUS & BUILDING AMENITIES</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Food Court & Cafeteria",
                  "24/7 Security & CCTV",
                  "Executive Lounge",
                  "Gymnasium & Fitness",
                  "Visitor Parking",
                  "Conference Center",
                  "Creche / Daycare",
                  "ATM & Banking",
                  "Pharmacy / First Aid"
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      formData.amenities.includes(item)
                        ? "bg-teal-50 border-[#0F8B7D] text-[#0F8B7D] font-bold shadow-2xs"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{item}</span>
                    {formData.amenities.includes(item) && <Check size={14} className="text-[#0F8B7D]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Compliance */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">6. Statutory Compliance & Verification</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">FIRE SAFETY NOC EXPIRY</label>
                <input
                  type="date"
                  value={formData.fireNocExpiry}
                  onChange={(e) => setFormData({ ...formData, fireNocExpiry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">LIFT LICENSE EXPIRY</label>
                <input
                  type="date"
                  value={formData.liftLicenseExpiry}
                  onChange={(e) => setFormData({ ...formData, liftLicenseExpiry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">POLLUTION CONSENT (CTO) EXPIRY</label>
                <input
                  type="date"
                  value={formData.pollutionConsentExpiry}
                  onChange={(e) => setFormData({ ...formData, pollutionConsentExpiry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Preview & Publish */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">7. Review & Publish Listing to Portfolio</h2>

            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-gray-900">{formData.propertyName || "Untitled Property"}</span>
                <span className="px-3 py-1 rounded-full bg-[#0F8B7D] text-white text-[10px] font-bold">{formData.grade}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">{formData.address || `${formData.microMarket}, ${formData.city}`}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">Base Rent</span>
                  <span className="text-sm font-extrabold text-[#0F8B7D]">₹{formData.baseRentPerSqft || "0"}/sq.ft.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">Available Space</span>
                  <span className="text-sm font-extrabold text-gray-900">{formData.availableArea || "0 sq.ft."}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">CAM Maintenance</span>
                  <span className="text-sm font-extrabold text-gray-900">₹{formData.camPerSqft || "0"}/sq.ft.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">Escalation</span>
                  <span className="text-sm font-extrabold text-gray-900">{formData.annualEscalationPct}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>{currentStep === 7 ? "Publish Listing to Portfolio" : `Next: ${steps[currentStep]?.label} →`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
