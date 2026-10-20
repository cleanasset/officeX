"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Building,
  CheckCircle2,
  Upload,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Check,
  Users,
  Coins,
  Calendar,
  Phone,
  Mail,
  Loader2,
  ChevronLeft,
  ArrowUpRight
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";

export default function ListSpacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Owner & Operator Info
    operatorType: "coworking_operator",
    companyName: "",
    brandName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "Bangalore",
    
    // Step 2: Space Details
    spaceName: "",
    vertical: "coworking",
    locality: "",
    fullAddress: "",
    pincode: "",
    totalAreaSqft: "12000",
    totalSeats: "120",
    buildingGrade: "Grade A",
    buildingType: "Commercial Tech Park",
    
    // Step 3: Commercials & Pricing
    dedicatedDeskMonthly: "8500",
    privateCabinMonthly: "12500",
    hotDeskMonthly: "6500",
    virtualOfficeMonthly: "1200",
    lockInMonths: "3",
    depositMonths: "2",
    
    // Amenities
    amenities: [
      "High-Speed WiFi",
      "Centralized AC",
      "100% Power Backup",
      "Reserved Parking",
      "Cafeteria / Pantry",
      "Meeting & Conference Rooms"
    ],
    
    // Step 4: Photo URLs
    photos: [] as string[]
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allAmenitiesOptions = [
    "High-Speed WiFi",
    "Centralized AC",
    "100% Power Backup",
    "Reserved Parking",
    "Cafeteria / Pantry",
    "Meeting & Conference Rooms",
    "Free Tea & Coffee",
    "Printing & Scanning",
    "24/7 Biometric Security",
    "CCTV Surveillance",
    "Fire Alarm & Sprinklers",
    "Clean Washrooms",
    "Gymnasium & Wellness",
    "EV Charging Stations",
    "Executive Lounge"
  ];

  const toggleAmenity = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/marketplace/list-space", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit space listing application.");
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error("List space error:", err);
      setErrorMsg(err.message || "Failed to submit listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <MarketingHeader />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent opacity-60" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <Sparkles size={13} />
            <span>OFFICEX Property Marketplace · Partner Program</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            List Your Commercial &amp; Coworking Spaces
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium">
            Join 3,500+ verified coworking operators, managed office developers, and commercial building owners across India. Get high-intent enterprise tenant leads with zero upfront listing fee.
          </p>

          {/* Quick Value Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">ENTERPRISE LEADS</span>
              <p className="text-xl font-black text-white mt-0.5">15,000+</p>
              <span className="text-[11px] text-slate-300">Monthly active searches</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">CITIES COVERED</span>
              <p className="text-xl font-black text-white mt-0.5">25+ Metros</p>
              <span className="text-[11px] text-slate-300">Pan-India coverage</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">COMMISSION</span>
              <p className="text-xl font-black text-white mt-0.5">Success Only</p>
              <span className="text-[11px] text-slate-300">Zero upfront listing fee</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">DEDICATED CONSOLE</span>
              <p className="text-xl font-black text-white mt-0.5">Partner Portal</p>
              <span className="text-[11px] text-slate-300">Track visits &amp; deals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {submitted ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Workspace Listing Application Submitted!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for listing <b>{formData.spaceName || formData.brandName || "your workspace"}</b> with OfficeX. Our partner acquisition team will review your photos and specs within 4 business hours.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Listing Status:</span>
                <span className="font-bold text-amber-600">Pending Verification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-bold text-slate-900">{formData.contactName || "Operator Admin"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target City:</span>
                <span className="font-bold text-slate-900">{formData.city}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/marketplace/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                Go to Partner Operator Console <ArrowRight size={14} />
              </Link>
              <Link
                href="/marketplace/search"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-700 text-xs font-bold"
              >
                Browse Live Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step Progress Stepper */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              {[
                { s: 1, label: "Operator Info" },
                { s: 2, label: "Space Specs" },
                { s: 3, label: "Pricing & Plans" },
                { s: 4, label: "Review & Submit" }
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === item.s
                        ? "bg-[#0F8B7D] text-white shadow-sm ring-4 ring-teal-50"
                        : step > item.s
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > item.s ? <Check size={13} /> : item.s}
                  </div>
                  <span className={`text-xs hidden sm:inline font-bold ${step === item.s ? "text-slate-900" : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Operator / Owner Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Operator &amp; Business Information</h3>
                  <p className="text-xs text-slate-500">Tell us about your organization or property ownership entity.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Operator Category *</label>
                    <select
                      value={formData.operatorType}
                      onChange={(e) => setFormData({ ...formData, operatorType: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                    >
                      <option value="coworking_operator">Coworking Space Operator (Awfis, WeWork, 91springboard, etc.)</option>
                      <option value="managed_provider">Managed Office &amp; Enterprise Suite Provider</option>
                      <option value="commercial_landlord">Commercial Building Owner / Asset Landlord</option>
                      <option value="business_center">Executive Business Center / Virtual Office Host</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Brand / Center Display Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WorkNest Coworking"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Legal Entity / Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. WorkNest Real Estate Pvt Ltd"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Contact Person *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Official Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="partner@worknest.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Contact Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98200 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Primary Operating Metro City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                    >
                      <option value="Bangalore">Bangalore (Bengaluru)</option>
                      <option value="Gurgaon">Gurgaon (Gurugram)</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Noida">Noida</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Chandigarh">Chandigarh</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.brandName || !formData.contactName || !formData.email) {
                        alert("Please fill in the required brand name, contact name, and email.");
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    Next: Space Specifications <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Space Specifications */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Space Location &amp; Physical Specifications</h3>
                  <p className="text-xs text-slate-500">Provide the exact location and physical parameters of the center.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Center / Building Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WorkNest Nexus Tower"
                        value={formData.spaceName}
                        onChange={(e) => setFormData({ ...formData, spaceName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Product Vertical *</label>
                      <select
                        value={formData.vertical}
                        onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      >
                        <option value="coworking">Coworking Space (Dedicated Desks &amp; Cabins)</option>
                        <option value="managed_office">Enterprise Managed Office (Custom Floors)</option>
                        <option value="commercial">Commercial Warm / Bare Shell (Direct Lease)</option>
                        <option value="virtual_office">Virtual Office (Business Registration &amp; GST)</option>
                        <option value="meeting_room">Meeting &amp; Conference Rooms</option>
                        <option value="day_pass">On-Demand Day Pass Facility</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Locality / Micro-Market *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Koramangala / Indiranagar / BKC"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="560034"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Complete Physical Address *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. 4th Floor, Nexus Koramangala Tower, 80 Feet Road, 7th Block..."
                      value={formData.fullAddress}
                      onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Total Area (sq.ft.)</label>
                      <input
                        type="number"
                        placeholder="12000"
                        value={formData.totalAreaSqft}
                        onChange={(e) => setFormData({ ...formData, totalAreaSqft: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Total Workstations / Seats</label>
                      <input
                        type="number"
                        placeholder="120"
                        value={formData.totalSeats}
                        onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Building Grade</label>
                      <select
                        value={formData.buildingGrade}
                        onChange={(e) => setFormData({ ...formData, buildingGrade: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      >
                        <option value="Grade A">Grade A (Institutional)</option>
                        <option value="Grade A+">Grade A+ (Premium Tech Park)</option>
                        <option value="Grade B">Grade B</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.locality || !formData.fullAddress) {
                        alert("Please provide the locality and complete physical address.");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    Next: Pricing &amp; Amenities <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Amenities */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Commercial Pricing &amp; Campus Amenities</h3>
                  <p className="text-xs text-slate-500">Define your monthly seat pricing plans and available facilities.</p>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100/80">
                      <label className="block font-extrabold text-teal-900 mb-1">Dedicated Desk (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="8500"
                        value={formData.dedicatedDeskMonthly}
                        onChange={(e) => setFormData({ ...formData, dedicatedDeskMonthly: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-teal-200 bg-white font-bold text-teal-800 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">Private Cabin (₹/seat/mo)</label>
                      <input
                        type="number"
                        placeholder="12500"
                        value={formData.privateCabinMonthly}
                        onChange={(e) => setFormData({ ...formData, privateCabinMonthly: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1">Hot Desk (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="6500"
                        value={formData.hotDeskMonthly}
                        onChange={(e) => setFormData({ ...formData, hotDeskMonthly: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Virtual Office (₹/mo)</label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={formData.virtualOfficeMonthly}
                        onChange={(e) => setFormData({ ...formData, virtualOfficeMonthly: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Security Deposit (Months)</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={formData.depositMonths}
                        onChange={(e) => setFormData({ ...formData, depositMonths: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Lock-in Period (Months)</label>
                      <input
                        type="number"
                        placeholder="3"
                        value={formData.lockInMonths}
                        onChange={(e) => setFormData({ ...formData, lockInMonths: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50/50 font-medium focus:ring-2 focus:ring-[#0F8B7D] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Amenities Checklist */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-2">Campus Amenities &amp; Inclusions</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {allAmenitiesOptions.map((item) => {
                        const checked = formData.amenities.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => toggleAmenity(item)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              checked
                                ? "border-[#0F8B7D] bg-teal-50/60 text-[#0F8B7D] font-bold shadow-2xs"
                                : "border-gray-200 bg-white text-slate-600 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                checked ? "bg-[#0F8B7D] text-white" : "border border-gray-300"
                              }`}
                            >
                              {checked && <Check size={11} />}
                            </div>
                            <span className="truncate">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    Next: Review &amp; Submit <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Review Workspace Listing Application</h3>
                  <p className="text-xs text-slate-500">Confirm all details before submitting for marketplace verification.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-slate-400 block font-semibold">Workspace Name</span>
                      <span className="font-bold text-slate-900">{formData.spaceName || formData.brandName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Brand / Operator</span>
                      <span className="font-bold text-slate-900">{formData.brandName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-slate-400 block font-semibold">Location</span>
                      <span className="font-bold text-slate-900">{formData.locality}, {formData.city}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Starting Dedicated Desk</span>
                      <span className="font-bold text-[#0F8B7D]">₹{Number(formData.dedicatedDeskMonthly).toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-1">Amenities ({formData.amenities.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.amenities.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-teal-50/40 border border-teal-100 p-3.5 rounded-xl">
                  <input
                    type="checkbox"
                    required
                    id="partnerAgreement"
                    className="mt-0.5 rounded text-[#0F8B7D] focus:ring-[#0F8B7D]"
                  />
                  <label htmlFor="partnerAgreement" className="cursor-pointer">
                    I confirm that I am an authorized representative of <b>{formData.brandName || "the workspace"}</b> and all stated details, address, and pricing are accurate. I accept the OfficeX Marketplace Partner Terms.
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Submitting Listing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Submit Workspace Listing
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
