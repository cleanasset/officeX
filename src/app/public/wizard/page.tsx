"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";

export default function RequirementWizard() {
  const [step, setStep] = useState(1);
  const [gstin, setGstin] = useState("");
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [gstinError, setGstinError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    desiredSqft: "",
    budgetRange: "1-2 Lakhs",
    city: "Mumbai",
    timeline: "3 Months"
  });

  const [manualMode, setManualMode] = useState(false);

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
    // Call CRM leads API
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
        setStep(3);
      }
    } catch (err) {
      alert("Failed to submit requirements.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="h-[60px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={30} height={30} className="object-contain" />
          <Image src="/name-removebg-preview.png" alt="OfficeX" width={95} height={19} className="object-contain" />
        </Link>
        <Link href="/public/search" className="text-xs font-semibold text-gray-500 hover:text-primary-teal transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Search
        </Link>
      </header>

      {/* Wizard Form Container */}
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-10 text-xs font-bold text-gray-400">
            <span className={step >= 1 ? "text-primary-teal" : ""}>1. GSTIN Check</span>
            <ChevronRight size={14} />
            <span className={step >= 2 ? "text-primary-teal" : ""}>2. Space Scope</span>
            <ChevronRight size={14} />
            <span className={step >= 3 ? "text-primary-teal" : ""}>3. Lead Summary</span>
          </div>

          {/* STEP 1: GSTIN Verification or Manual Mode */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {manualMode ? "Enter Corporate Details" : "Verify Corporate Legal Entity"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {manualMode ? "Manually fill in your company records to log the lead." : "Enter your Indian GSTIN registration to auto-fill company records."}
                </p>
              </div>

              {!manualMode ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">GSTIN Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 27AAACT1234F1ZP" 
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                    />
                    {gstinError && <span className="text-red-500 text-[10px] font-bold mt-1">⚠ {gstinError}</span>}
                  </div>

                  <button 
                    onClick={handleGstinCheck}
                    disabled={isValidating}
                    className="w-full py-3 rounded-xl bg-primary-teal text-white hover:bg-teal-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {isValidating ? "Validating Entity..." : "Verify & Continue"}
                  </button>

                  <button 
                    onClick={() => { setManualMode(true); setGstinError(""); }}
                    className="text-xs text-center text-gray-600 hover:text-teal-600 font-bold underline cursor-pointer"
                  >
                    Or fill details manually without GSTIN
                  </button>
                </>
              ) : (
                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Infy Labs Private Limited" 
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. admin@infylabs.com" 
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                    />
                  </div>

                  {gstinError && <span className="text-red-500 text-[10px] font-bold">⚠ {gstinError}</span>}

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary-teal text-white hover:bg-teal-700 font-semibold text-xs transition-colors shadow-md cursor-pointer"
                  >
                    Continue to Space Scope
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setManualMode(false); setGstinError(""); }}
                    className="text-xs text-center text-gray-600 hover:text-teal-600 font-bold underline cursor-pointer"
                  >
                    Back to GSTIN Verification
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: Space Requirements */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{formData.companyName}</h2>
                <p className="text-xs text-emerald-600 font-semibold mt-1">✔ Corporate entity successfully verified via GST portal.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Desired Area (Sq.Ft.)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={formData.desiredSqft}
                    onChange={(e) => setFormData({ ...formData, desiredSqft: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operating City</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                  >
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Pune</option>
                    <option>Chennai</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Budget Range</label>
                <select 
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-teal text-xs bg-white"
                >
                  <option>Under 1 Lakh</option>
                  <option>1-2 Lakhs</option>
                  <option>2-5 Lakhs</option>
                  <option>Above 5 Lakhs</option>
                </select>
              </div>

              <button 
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-primary-teal text-white hover:bg-teal-700 font-semibold text-xs transition-colors shadow-md"
              >
                Submit Requirements
              </button>
            </div>
          )}

          {/* STEP 3: Completion */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 animate-float">
                <CheckCircle size={36} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Requirements Logged</h2>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Your requirements have been successfully registered under the Leasing CRM pipeline. A leasing manager will follow up within 2 hours.
                </p>
              </div>
              <Link href="/public/search" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
                Back to Listings
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
