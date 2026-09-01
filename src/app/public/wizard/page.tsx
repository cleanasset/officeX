"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Save, Building, Users, Calendar, ShieldCheck, Sparkles, Check } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";

export default function RequirementSubmissionWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: "",
    legalEntity: "Private Limited",
    industry: "Technology / IT",
    gstin: "",
    contactPerson: "",
    email: "",
    phone: "",

    // Step 2: Space & Location Needs
    targetCity: "Mumbai",
    microMarket: "BKC / Bandra Kurla Complex",
    workspaceType: "Enterprise Managed Office",
    seatsRequired: 60,
    areaSqft: 4500,
    cabins: 4,
    meetingRooms: 3,

    // Step 3: Budget, Timeline & Operations
    monthlyBudget: "₹1,25,000 - ₹1,80,000 / month",
    targetMoveIn: "Within 30 Days",
    leaseTermYears: "3 Years (36 Months)",
    powerBackupNeed: "100% DG Redundancy",
    hvacType: "Central Air Conditioning",
    existingFMRequired: true,
    requiredFMServices: ["Daily Housekeeping", "24/7 Security Guarding", "MEP & Electrical AMC"]
  });

  const [matchedSpaces, setMatchedSpaces] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const steps = [
    { num: 1, label: "Company & Identity" },
    { num: 2, label: "Space & Floor Needs" },
    { num: 3, label: "Commercials & FM Ops" },
    { num: 4, label: "Intelligent Matches" }
  ];

  const handleNext = () => {
    if (step === 1 && !formData.companyName) {
      showToast("Please enter company name.");
      return;
    }
    if (step === 3) {
      // Simulate intelligent marketplace matching
      setMatchedSpaces([
        {
          id: "apex-bkc",
          name: "Apex Business Tower - Block B",
          location: "BKC, Mumbai",
          seats: "60 Seats (4,500 sq.ft.)",
          rate: "₹1.25L / mo",
          matchScore: "98% Match",
          score: 86
        },
        {
          id: "nexus-hub",
          name: "Nexus Innovation Tower",
          location: "BKC Annex, Mumbai",
          seats: "70 Seats (5,200 sq.ft.)",
          rate: "₹1.45L / mo",
          matchScore: "94% Match",
          score: 92
        }
      ]);
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      showToast("Requirement confirmed! Transitioning to Workspace Onboarding & CRM...");
      setTimeout(() => {
        router.push("/leasing/onboard");
      }, 1200);
    }
  };

  const handleSaveDraft = () => {
    showToast("Progress saved to your browser session.");
  };

  const toggleFMService = (srv: string) => {
    const next = formData.requiredFMServices.includes(srv)
      ? formData.requiredFMServices.filter((s) => s !== srv)
      : [...formData.requiredFMServices, srv];
    setFormData({ ...formData, requiredFMServices: next });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 font-sans flex flex-col justify-between">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="px-12 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <img 
            src="/logo-removebg-preview.png" 
            alt="OfficeX Logo" 
            className="w-8 h-8 object-contain"
          />
          <img 
            src="/name-removebg-preview.png" 
            alt="OfficeX" 
            className="h-5 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-6 text-xs font-semibold text-gray-600">
          <Link href="/public/search" className="hover:text-gray-900">Property Marketplace</Link>
          <Link href="/marketplace" className="hover:text-gray-900">FM Marketplace</Link>
          <Link href="/portfolio" className="hover:text-gray-900">OFFICEX.PRO</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Save size={13} /> Save Draft
          </button>
        </div>
      </div>

      {/* Main Wizard Container */}
      <div className="max-w-3xl w-full mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="relative flex items-center justify-between mb-8 px-6">
          <div className="absolute left-10 right-10 top-4 h-0.5 bg-gray-300 z-0" />
          {steps.map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s.num
                    ? "bg-[#0F8B7D] text-white shadow-md ring-4 ring-white"
                    : "bg-gray-300 text-gray-600 ring-4 ring-white"
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-bold ${
                  step >= s.num ? "text-[#0F8B7D]" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-8 shadow-xl space-y-6">
          {/* STEP 1: Company & Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Corporate Identity & Point of Contact</h2>
                <p className="text-xs text-gray-500 mt-0.5">Captures legal entity details for automated LOI / Lease drafting.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">COMPANY LEGAL NAME</label>
                  <input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Tata Digital Private Limited"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">BUSINESS STRUCTURE</label>
                  <select
                    value={formData.legalEntity}
                    onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>Private Limited (Pvt Ltd)</option>
                    <option>Public Limited</option>
                    <option>LLP / Partnership</option>
                    <option>Multinational Subsidiary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">INDUSTRY SECTOR</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>Technology / IT & SaaS</option>
                    <option>BFSI & Investment Banking</option>
                    <option>Healthcare & Pharma</option>
                    <option>Consulting & Professional Services</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">GSTIN (OPTIONAL)</label>
                  <input
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="27AAACT2727Q1ZB"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] bg-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CONTACT PERSON</label>
                  <input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Aditya Verma (Head of Real Estate)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OFFICIAL EMAIL</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aditya.verma@tatadigital.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CONTACT PHONE</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98201 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Space & Floor Needs */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Space, Seating & Floor Configuration</h2>
                <p className="text-xs text-gray-500 mt-0.5">Define exact physical workspace specifications.</p>
              </div>

              <div className="space-y-3">
                <LocationAutocomplete
                  value={`${formData.microMarket}, ${formData.targetCity}`}
                  onChange={(displayText, loc) => {
                    if (loc) {
                      setFormData(prev => ({
                        ...prev,
                        targetCity: loc.city,
                        microMarket: loc.microMarket || loc.name || ""
                      }));
                    }
                  }}
                  label="TARGET LOCATION / CITY / MICRO-MARKET (ALL 28 STATES & 8 UTS)"
                  placeholder="Type to search e.g. Gujarat, GIFT City, Mumbai BKC, Bengaluru ORR, Cyber City..."
                  required
                />

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SELECTED CITY</label>
                    <input
                      value={formData.targetCity}
                      onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                      placeholder="e.g. Gandhinagar, Mumbai, Bengaluru"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PREFERRED MICRO-MARKET</label>
                    <input
                      value={formData.microMarket}
                      onChange={(e) => setFormData({ ...formData, microMarket: e.target.value })}
                      placeholder="e.g. GIFT City, SG Highway, BKC, HITEC City"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">WORKSPACE MODEL</label>
                  <select
                    value={formData.workspaceType}
                    onChange={(e) => setFormData({ ...formData, workspaceType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>Enterprise Managed Office</option>
                    <option>Bare Shell Commercial</option>
                    <option>Warm Shell Fit-out</option>
                    <option>Coworking Dedicated Floor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">REQUIRED SEATS</label>
                  <input
                    type="number"
                    value={formData.seatsRequired}
                    onChange={(e) => setFormData({ ...formData, seatsRequired: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">APPROX AREA (SQ.FT.)</label>
                  <input
                    type="number"
                    value={formData.areaSqft}
                    onChange={(e) => setFormData({ ...formData, areaSqft: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Commercials & FM Ops */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Commercial Terms & Facility Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">Budget parameters and integrated FM operational requirements.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">MONTHLY BUDGET</label>
                  <select
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>₹1,00,000 - ₹1,50,000 / month</option>
                    <option>₹1,50,000 - ₹2,50,000 / month</option>
                    <option>₹2,50,000+ / month</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TARGET MOVE-IN</label>
                  <select
                    value={formData.targetMoveIn}
                    onChange={(e) => setFormData({ ...formData, targetMoveIn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>Immediate Move-in</option>
                    <option>Within 30 Days</option>
                    <option>Within 60 Days</option>
                    <option>Q4 2026</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">LEASE DURATION</label>
                  <select
                    value={formData.leaseTermYears}
                    onChange={(e) => setFormData({ ...formData, leaseTermYears: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>3 Years (36 Months)</option>
                    <option>5 Years (60 Months)</option>
                    <option>9 Years (108 Months)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">REQUIRED FM & OPERATIONS SERVICES</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["Daily Housekeeping", "24/7 Security Guarding", "MEP & Electrical AMC", "HVAC Chiller Maintenance", "Pest Control & Hygiene", "Pantry & Cafeteria Staff"].map((srv) => {
                    const isSel = formData.requiredFMServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleFMService(srv)}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                          isSel
                            ? "bg-teal-50 border-[#0F8B7D] text-[#0F8B7D]"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {isSel ? "✓ " : "+ "} {srv}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Intelligent Matches */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Recommended Verified Matches</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Ranked by OFFICEX Property Score & requirement fit.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <Sparkles size={12} /> Auto-Matched
                </span>
              </div>

              <div className="space-y-3">
                {matchedSpaces.map((m) => (
                  <div key={m.name} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{m.name}</h3>
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">{m.matchScore}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {m.location} • {m.seats}</p>
                      <p className="text-xs font-black text-gray-900 mt-1">{m.rate} • <span className="text-teal-700 font-bold">Property Score: {m.score}/100</span></p>
                    </div>

                    <Link
                      href={`/public/property/${m.id || "apex-bkc"}`}
                      className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      View &amp; Request Proposal <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                ← Back
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-75 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>{step === 4 ? "Complete Requirement & Onboard" : "Next Step"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-gray-400 bg-gray-900 text-gray-400">
        © 2026 OfficeX Workspaces. Institutional Commercial Space & FM Operating Platform.
      </div>
    </div>
  );
}
