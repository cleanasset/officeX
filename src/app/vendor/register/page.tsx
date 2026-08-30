"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function VendorRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [bizType, setBizType] = useState("Private Limited");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const steps = [
    { num: 1, label: "Company Info" },
    { num: 2, label: "KYC Documents" },
    { num: 3, label: "Services & Cities" },
    { num: 4, label: "Review" }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setToast("Vendor application submitted! Institutional verification will complete in 2-3 business days.");
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-slate-50 to-blue-50/40 font-sans flex flex-col justify-between">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="px-12 py-5 flex items-center justify-between">
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
          <Link href="/tenant" className="hover:text-gray-900">Contact Support</Link>
          <Link href="/tenant" className="hover:text-gray-900">Help Center</Link>
          <button className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md">
            Get Help
          </button>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="relative flex items-center justify-between mb-10 px-6">
          <div className="absolute left-10 right-10 top-4 h-0.5 bg-gray-200 z-0" />
          {steps.map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s.num
                    ? "bg-[#0F8B7D] text-white shadow-md ring-4 ring-white"
                    : "bg-gray-200 text-gray-500 ring-4 ring-white"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-xs mt-2 font-bold ${step >= s.num ? "text-[#0F8B7D]" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-8 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-gray-900">Company Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  COMPANY NAME
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  BUSINESS TYPE
                </label>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Private Limited</option>
                  <option>Public Limited</option>
                  <option>LLP / Partnership</option>
                  <option>Proprietorship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  CONTACT PERSON
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  EMAIL ADDRESS
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                COMPANY DESCRIPTION
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description of services"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs resize-none h-24 focus:outline-none focus:border-[#0F8B7D] bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
            <span className="text-teal-600">ℹ</span>
            <span>Our operations team will review your submitted KYC documents within 2-3 business days.</span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              {step === 4 ? "Complete Onboarding" : "Next Step"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 text-center text-xs text-gray-400">
        © 2024 OfficeX Vendor Management Platform
      </div>
    </div>
  );
}
