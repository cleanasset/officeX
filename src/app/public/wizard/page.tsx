"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldCheck, CheckCircle, ArrowRight, Sparkles, Building, Settings, Check } from "lucide-react";

export default function RequirementWizard() {
  const [step, setStep] = useState(1);
  const [gstin, setGstin] = useState("");
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [gstinError, setGstinError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    seats: "50",
    desiredSqft: "3500",
    city: "Mumbai",
    moveInDate: "",
    itNetworking: true,
    housekeeping: false,
    mepServices: true,
    catering: false,
    budgetRange: "2-5 Lakhs",
    lockInMonths: "36",
    leaseTermYears: "5"
  });

  const handleGstinCheck = async () => {
    if (!gstin) {
      setGstinError("Please enter a GSTIN.");
      return;
    }
    setIsValidating(true);
    setGstinError("");

    try {
      const res = await fetch("/api/verify-gst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin })
      });
      const data = await res.json();
      if (data.valid) {
        setCompanyInfo(data);
        setFormData({ ...formData, companyName: data.legalName });
        setStep(2);
      } else {
        setGstinError(data.message || "Invalid GSTIN verification details.");
      }
    } catch (err) {
      setGstinError("Verification check timed out. Try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setGstinError("Company Name is required.");
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          desiredSqft: formData.desiredSqft,
          budgetRange: formData.budgetRange,
          city: formData.city
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep(5); // Completion step
      }
    } catch (err) {
      alert("Failed to submit requirements.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Navbar */}
      <header className="h-[60px] bg-white border-b border-slate-100 px-8 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={30} height={30} className="object-contain" />
          <Image src="/name-removebg-preview.png" alt="OfficeX" width={95} height={19} className="object-contain" />
        </Link>
        <Link href="/public/search" className="text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Search
        </Link>
      </header>

      {/* Wizard Form Container */}
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-8 text-[9px] font-black text-slate-400 uppercase tracking-wider">
            <span className={step >= 1 ? "text-[#2563EB]" : ""}>1. GSTIN Check</span>
            <ChevronRight size={12} />
            <span className={step >= 2 ? "text-[#2563EB]" : ""}>2. Space Needs</span>
            <ChevronRight size={12} />
            <span className={step >= 3 ? "text-[#2563EB]" : ""}>3. FM Services</span>
            <ChevronRight size={12} />
            <span className={step >= 4 ? "text-[#2563EB]" : ""}>4. Commercials</span>
          </div>

          {/* STEP 1: GSTIN Verification or Manual Mode */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {manualMode ? "Enter Corporate Details" : "Verify Corporate Legal Entity"}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  {manualMode ? "Manually fill in your company records to log the lead." : "Enter your Indian GSTIN registration to auto-fill company records."}
                </p>
              </div>

              {!manualMode ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GSTIN Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 27AAACT1234F1ZP" 
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold uppercase"
                    />
                    {gstinError && <span className="text-red-500 text-[10px] font-bold mt-1">⚠ {gstinError}</span>}
                  </div>

                  <button 
                    onClick={handleGstinCheck}
                    disabled={isValidating}
                    className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {isValidating ? "Validating Entity..." : "Verify & Continue"}
                  </button>

                  <button 
                    onClick={() => { setManualMode(true); setGstinError(""); }}
                    className="text-xs text-center text-slate-500 hover:text-[#2563EB] font-bold underline cursor-pointer"
                  >
                    Or fill details manually without GSTIN
                  </button>
                </>
              ) : (
                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Infy Labs Private Limited" 
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold text-slate-900"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. admin@infylabs.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold text-slate-900"
                      required
                    />
                  </div>

                  {gstinError && <span className="text-red-500 text-[10px] font-bold">⚠ {gstinError}</span>}

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
                  >
                    Continue to Space Scope
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setManualMode(false); setGstinError(""); }}
                    className="text-xs text-center text-slate-500 hover:text-[#2563EB] font-bold underline cursor-pointer"
                  >
                    Back to GSTIN Verification
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: Workspace Space Needs */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{formData.companyName}</h2>
                <p className="text-xs text-emerald-600 font-semibold mt-1">✔ Entity details successfully logged.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seats Needed</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50" 
                    value={formData.seats}
                    onChange={(e) => {
                      const seatsVal = e.target.value;
                      const estimatedSqft = seatsVal ? (parseInt(seatsVal) * 70).toString() : "";
                      setFormData({ ...formData, seats: seatsVal, desiredSqft: estimatedSqft });
                    }}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Area (Est. Sq.Ft.)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 3500" 
                    value={formData.desiredSqft}
                    onChange={(e) => setFormData({ ...formData, desiredSqft: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operating City</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white font-semibold cursor-pointer"
                  >
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Pune</option>
                    <option>Ahmedabad</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Move-in</label>
                  <input 
                    type="date" 
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-between mt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  Continue to Services <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Operational Services */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Select Facility Management Services</h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Select which core facility operations you require in your space package.</p>
              </div>

              <div className="flex flex-col gap-3 font-semibold text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-extrabold text-slate-900">IT & Telecom Networking Setup</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">High-speed server links, routers, and switches.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.itNetworking}
                    onChange={(e) => setFormData({ ...formData, itNetworking: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-extrabold text-slate-900">Mechanized Cleaning & Housekeeping</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Daily cleaning staff deployment and checklist audits.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.housekeeping}
                    onChange={(e) => setFormData({ ...formData, housekeeping: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-extrabold text-slate-900">MEP Hard Services Maintenance</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mechanical, electrical, plumbing support and annual AMCs.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.mepServices}
                    onChange={(e) => setFormData({ ...formData, mepServices: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-extrabold text-slate-900">Corporate Catering & Pantry Services</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Daily cafeteria food and executive pantry management.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.catering}
                    onChange={(e) => setFormData({ ...formData, catering: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB] border-slate-300 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex gap-3 justify-between mt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  Continue to Commercials <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Commercial Terms */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Target Commercial Specifications</h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Define budget parameters, lock-in requirements, and target lease term.</p>
              </div>

              <div className="flex flex-col gap-4 font-semibold text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Budget Range</label>
                  <select 
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-white cursor-pointer"
                  >
                    <option>Under 1 Lakh</option>
                    <option>1-2 Lakhs</option>
                    <option>2-5 Lakhs</option>
                    <option>Above 5 Lakhs</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lock-in Period (Months)</label>
                    <input 
                      type="number" 
                      value={formData.lockInMonths}
                      onChange={(e) => setFormData({ ...formData, lockInMonths: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Lease (Years)</label>
                    <input 
                      type="number" 
                      value={formData.leaseTermYears}
                      onChange={(e) => setFormData({ ...formData, leaseTermYears: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-between mt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinish}
                  className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  Submit Requirements
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Completion */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 animate-pulse">
                <CheckCircle size={36} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Requirements Registered</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
                  Your corporate workspace requirements have been successfully logged in the OFFICEX Leasing CRM. A leasing supervisor will follow up with verified property proposals within 2 hours.
                </p>
              </div>
              <Link href="/public/search" className="px-6 py-3 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md">
                View Similar Listings
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
