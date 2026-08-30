"use client";
import React, { useState } from "react";
import { CheckCircle, ArrowRight, Save, Upload, Plus, Trash2, Building, ShieldCheck, FileText, Check } from "lucide-react";

export default function PropertyListingBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Listing Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic & Location
    propertyName: "",
    propertyType: "Commercial Office Park",
    grade: "Grade A",
    address: "",
    city: "Mumbai",
    microMarket: "Bandra Kurla Complex (BKC)",
    pincode: "400051",
    metroDistance: "350m (4 mins walk)",

    // Step 2: Building Specs & Floors
    totalSuperArea: "150,000 sq.ft.",
    totalFloors: "G + 14 Floors",
    typicalFloorPlate: "12,500 sq.ft.",
    availableArea: "25,000 sq.ft.",
    seatingCapacity: "350 Seats",
    ceilingHeight: "3.8m Clear Height",
    passengerLifts: 6,
    serviceLifts: 2,

    // Step 3: Commercial Terms & Lease Model
    baseRentPerSqft: "185",
    camPerSqft: "18",
    securityDepositMonths: "3 Months",
    lockInPeriodMonths: "36 Months",
    annualEscalationPct: "5%",
    carParkingCharges: "₹5,000 / slot / mo",
    bikeParkingCharges: "₹1,200 / slot / mo",

    // Step 4: Power, HVAC & Technical Redundancy
    powerLoadKVA: "2,000 kVA",
    dgBackupPct: "100% N+1 DG Backup",
    hvacType: "Central Chiller Water-Cooled",
    telecomProviders: ["Tata Communications", "Airtel Business", "Reliance Jio"],

    // Step 5: Campus Amenities & Parking
    carParkingSlots: 150,
    twoWheelerSlots: 300,
    evChargingStations: 12,
    amenities: ["Food Court & Cafeteria", "24/7 Security & CCTV", "Executive Lounge", "Gymnasium & Fitness", "Visitor Parking", "Conference Center"],

    // Step 6: Statutory Compliance & Documents
    fireNocExpiry: "12-Sep-2027",
    liftLicenseExpiry: "01-Jan-2028",
    pollutionConsentExpiry: "30-Nov-2027",
    occupancyCertificate: true
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.propertyName) {
      showToast("Please enter property title / name.");
      return;
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast("Property listing successfully published to the public marketplace!");
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
        <div>
          <h1 className="text-3xl font-black text-gray-900">Property Listing Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Multi-step commercial property listing creator with complete technical & commercial specs.</p>
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
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">1. Basic Property Information & Micro-market</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PROPERTY TITLE / NAME</label>
                <input
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  placeholder="e.g. Prestige Tech Park - Tower 3"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CITY</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>Mumbai</option>
                  <option>Bengaluru</option>
                  <option>Gurugram / NCR</option>
                  <option>Pune</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">MICRO-MARKET</label>
                <input
                  value={formData.microMarket}
                  onChange={(e) => setFormData({ ...formData, microMarket: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">METRO / TRANSIT PROXIMITY</label>
                <input
                  value={formData.metroDistance}
                  onChange={(e) => setFormData({ ...formData, metroDistance: e.target.value })}
                  placeholder="350m (4 mins walk)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">FULL PHYSICAL ADDRESS</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot No, Street, Landmark, Pincode..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 resize-none h-20"
              />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TOTAL FLOORS</label>
                <input
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TYPICAL FLOOR PLATE</label>
                <input
                  value={formData.typicalFloorPlate}
                  onChange={(e) => setFormData({ ...formData, typicalFloorPlate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">AVAILABLE VACANT AREA</label>
                <input
                  value={formData.availableArea}
                  onChange={(e) => setFormData({ ...formData, availableArea: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SEATING CAPACITY</label>
                <input
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CLEAR CEILING HEIGHT</label>
                <input
                  value={formData.ceilingHeight}
                  onChange={(e) => setFormData({ ...formData, ceilingHeight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Commercial Terms */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">3. Commercial Terms, CAM & Security Deposits</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">BASE RENT (₹ / SQ.FT. / MONTH)</label>
                <input
                  value={formData.baseRentPerSqft}
                  onChange={(e) => setFormData({ ...formData, baseRentPerSqft: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAM CHARGES (₹ / SQ.FT. / MONTH)</label>
                <input
                  value={formData.camPerSqft}
                  onChange={(e) => setFormData({ ...formData, camPerSqft: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ANNUAL RENT ESCALATION (%)</label>
                <input
                  value={formData.annualEscalationPct}
                  onChange={(e) => setFormData({ ...formData, annualEscalationPct: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-teal-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAR PARKING CHARGE / SLOT</label>
                <input
                  value={formData.carParkingCharges}
                  onChange={(e) => setFormData({ ...formData, carParkingCharges: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Power, HVAC & Telecom */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">4. Power Infrastructure, HVAC & Redundancy</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SANCTIONED POWER LOAD</label>
                <input
                  value={formData.powerLoadKVA}
                  onChange={(e) => setFormData({ ...formData, powerLoadKVA: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">DG BACKUP LEVEL</label>
                <input
                  value={formData.dgBackupPct}
                  onChange={(e) => setFormData({ ...formData, dgBackupPct: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">HVAC COOLING SYSTEM</label>
                <input
                  value={formData.hvacType}
                  onChange={(e) => setFormData({ ...formData, hvacType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Amenities & Parking */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">5. Amenities, Parking & Sustainability</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAR PARKING SLOTS</label>
                <input
                  type="number"
                  value={formData.carParkingSlots}
                  onChange={(e) => setFormData({ ...formData, carParkingSlots: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TWO-WHEELER SLOTS</label>
                <input
                  type="number"
                  value={formData.twoWheelerSlots}
                  onChange={(e) => setFormData({ ...formData, twoWheelerSlots: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">EV CHARGING STATIONS</label>
                <input
                  type="number"
                  value={formData.evChargingStations}
                  onChange={(e) => setFormData({ ...formData, evChargingStations: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">CAMPUS AMENITIES CHECKLIST</label>
              <div className="grid grid-cols-3 gap-2">
                {["Food Court & Cafeteria", "24/7 Security & CCTV", "Executive Lounge", "Gymnasium & Fitness", "Visitor Parking", "Conference Center", "Creche / Daycare", "Pharmacy & ATM", "Rooftop Garden"].map((am) => {
                  const isSel = formData.amenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        isSel
                          ? "bg-teal-50 border-[#0F8B7D] text-[#0F8B7D]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {isSel ? "✓ " : "+ "} {am}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Compliance & Documents */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">6. Statutory Compliance & Verification Documents</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">FIRE NOC EXPIRY DATE</label>
                <input
                  type="date"
                  value="2027-09-12"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">LIFT FITNESS LICENSE</label>
                <input
                  type="date"
                  value="2028-01-01"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">POLLUTION CONTROL BOARD (PCB)</label>
                <input
                  type="date"
                  value="2027-11-30"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">UPLOAD FLOOR PLANS & PROPERTY PHOTOS</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0F8B7D] bg-gray-50/50">
                <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="font-semibold text-gray-700">Click to upload architectural CAD, PDF floor plans or High-Res Photos</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Supports PDF, DWG, PNG, JPG (Max 50MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Preview & Publish */}
        {currentStep === 7 && (
          <div className="space-y-5 text-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">7. Listing Summary & Quality Verification</h2>

            <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">GRADE A LISTING</span>
                  <h3 className="text-xl font-black text-gray-900 mt-1">{formData.propertyName || "Prestige Tech Park - Tower 3"}</h3>
                  <p className="text-gray-600 mt-0.5">📍 {formData.microMarket}, {formData.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">₹{formData.baseRentPerSqft} <span className="text-xs font-normal text-gray-500">/ sq.ft. / mo</span></p>
                  <p className="text-[11px] text-teal-700 font-bold">Estimated Property Score: 88/100</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-teal-100 text-[11px]">
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">AVAILABLE SPACE</span>
                  <span className="font-bold text-gray-900">{formData.availableArea}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">SEATS</span>
                  <span className="font-bold text-gray-900">{formData.seatingCapacity}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">CAM CHARGES</span>
                  <span className="font-bold text-gray-900">₹{formData.camPerSqft}/sq.ft.</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">SECURITY DEPOSIT</span>
                  <span className="font-bold text-gray-900">{formData.securityDepositMonths}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>All mandatory statutory fields completed. Listing will be activated immediately on the Property Marketplace.</span>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            {currentStep === 7 ? "Publish Listing to Marketplace" : "Save & Continue"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
