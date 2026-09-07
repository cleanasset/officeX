"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Send, Calendar } from "lucide-react";

export interface EnquiryFormProps {
  prefill?: {
    audience?: string;
    modules?: string[];
  };
  heading?: string;
  variant?: "inline" | "modal";
  onSuccess?: () => void;
}

const AUDIENCE_OPTIONS = [
  "Building Owner",
  "Property Manager",
  "Corporate Occupier",
  "Facility Manager",
  "FM Vendor",
  "Investor / REIT",
  "Commercial Broker",
  "Other"
];

const MODULE_OPTIONS = [
  { id: "marketplace", label: "Marketplace (Discovery & RFQ)" },
  { id: "operate", label: "Operate (CAFM & 52-Wk PPM)" },
  { id: "manage", label: "Manage (Rent Roll & Compliance)" },
  { id: "intelligence", label: "Intelligence (Analytics & ESG)" },
  { id: "managed-services", label: "Managed Services (On-Ground PM/FM)" },
  { id: "not-sure", label: "Not sure / Need consultation" }
];

const SOURCE_OPTIONS = [
  "Google Search",
  "LinkedIn",
  "Industry Event / Summit",
  "Referral from Peer",
  "News / Media Article",
  "Other"
];

export default function EnquiryForm({
  prefill,
  heading,
  variant = "inline",
  onSuccess
}: EnquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [audience, setAudience] = useState(prefill?.audience || "");
  const [modules, setModules] = useState<string[]>(prefill?.modules || []);
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModuleToggle = (modId: string) => {
    setModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !companyName.trim() || !workEmail.trim() || !audience) {
      setErrorMsg("Please complete all required fields marked with *.");
      return;
    }

    if (modules.length === 0) {
      setErrorMsg("Please select at least one module of interest.");
      return;
    }

    setLoading(true);

    try {
      // Simulate submission or submit to API
      const refNumber = `OX-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const payload = {
        fullName,
        companyName,
        workEmail,
        phone,
        audience,
        modules,
        message,
        source,
        refNumber,
        submittedAt: new Date().toISOString()
      };

      // Store in localStorage for audit/mock persistence if offline
      try {
        const stored = JSON.parse(localStorage.getItem("officex_enquiries") || "[]");
        stored.push(payload);
        localStorage.setItem("officex_enquiries", JSON.stringify(stored));
      } catch {
        // ignore
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmittedRef(refNumber);
      if (onSuccess) onSuccess();
    } catch {
      setErrorMsg("Failed to submit enquiry. Please try again or reach us at sales@officex.in.");
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Thank you! Enquiry Received</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
          We will review your requirements and respond within <strong className="text-emerald-700">24 business hours</strong>.
        </p>
        <div className="inline-block bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-gray-700 mb-6">
          Reference Number: <span className="text-emerald-700">{submittedRef}</span>
        </div>
        <div className="border-t border-emerald-200/80 pt-5 mt-2">
          <p className="text-xs text-gray-500 mb-3">Want an immediate consultation?</p>
          <a
            href="https://calendly.com/officex-sales/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#071324] hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Calendar size={14} className="text-[#0F8B7D]" />
            <span>Schedule Directly on Calendly</span>
          </a>
        </div>
      </div>
    );
  }

  const isModal = variant === "modal";

  return (
    <div className={`w-full ${isModal ? "p-1" : "bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm"}`}>
      {heading && (
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{heading}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Connect with our commercial solutions engineering team. Guaranteed response in 24 business hours.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Ascendas / DLF / Colliers"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            I am a... <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
          >
            <option value="">Select your role</option>
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Modules of Interest <span className="text-red-500">*</span>{" "}
            <span className="text-gray-400 font-normal text-[11px]">(Select one or more)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODULE_OPTIONS.map((mod) => {
              const checked = modules.includes(mod.id);
              return (
                <label
                  key={mod.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    checked
                      ? "border-[#0F8B7D] bg-teal-50/70 text-gray-900 font-bold"
                      : "border-gray-200 bg-white hover:bg-slate-50 text-gray-700 font-medium"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleModuleToggle(mod.id)}
                    className="w-4 h-4 text-[#0F8B7D] rounded border-gray-300 focus:ring-[#0F8B7D] accent-[#0F8B7D]"
                  />
                  <span>{mod.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Message / Requirements <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your portfolio size, square footage, key operational challenges, or timeline..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            How did you hear about us? <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F8B7D] focus:bg-white text-gray-900 transition-colors"
          >
            <option value="">Select an option</option>
            {SOURCE_OPTIONS.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7368] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Submitting Enquiry...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Send Enquiry</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-gray-400 text-center font-medium">
          Protected under DPDP Act 2023. We never share your commercial details with third parties.
        </p>
      </form>
    </div>
  );
}
