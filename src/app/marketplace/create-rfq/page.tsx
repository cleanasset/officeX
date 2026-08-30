"use client";
import React, { useState } from "react";
import { Calendar, Upload, Sliders, CheckCircle, Send } from "lucide-react";

export default function CreateRFQ() {
  const [form, setForm] = useState({
    title: "", property: "", category: "", subCategory: "", scope: "",
    frequency: "Daily", area: "", manpower: "", materialProvisioning: "Vendor Provides Materials & Consumables",
    contractDuration: "1 Year", startDate: "", deadline: "",
    autoMatch: true, minRating: 4.0
  });
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (action: "draft" | "publish") => {
    setToast(action === "draft" ? "RFQ saved as draft!" : "RFQ published successfully! Vendors notified.");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Facility Management RFQ</h1>
        <p className="text-sm text-gray-500 mt-1">Define scope, requirements, and target vendors to receive competitive bids.</p>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Main Form */}
        <div className="flex flex-col gap-6">
          {/* 1. Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">1. Basic Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">RFQ Title <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Q3 HVAC Maintenance Contract"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Property / Location <span className="text-red-500">*</span></label>
                <select
                  value={form.property}
                  onChange={(e) => setForm({ ...form, property: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="">Select Property...</option>
                  <option>Apex Tower</option>
                  <option>Meridian Park</option>
                  <option>Nexus Hub</option>
                  <option>Crystal Tower</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Service Category <span className="text-red-500">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="">Select Category...</option>
                  <option>MEP</option>
                  <option>HVAC</option>
                  <option>Security</option>
                  <option>Housekeeping</option>
                  <option>Fire Safety</option>
                  <option>Pest Control</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Sub-Category</label>
                <select
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="">Select Category first...</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Scope & Specifications */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">2. Scope & Specifications</h2>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700">Detailed Scope of Work <span className="text-red-500">*</span></label>
              <textarea
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                placeholder="Describe the specific services required, areas covered, and expected outcomes..."
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-28 focus:outline-none focus:border-[#0F8B7D]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Provide enough detail for vendors to submit accurate bids.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Service Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annual</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Coverage Area (sq ft)</label>
                <input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g., 50000"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Manpower Requirements</label>
                <input
                  value={form.manpower}
                  onChange={(e) => setForm({ ...form, manpower: e.target.value })}
                  placeholder="e.g., 2 Supervisors, 10 Janitors"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Material Provisioning</label>
                <select
                  value={form.materialProvisioning}
                  onChange={(e) => setForm({ ...form, materialProvisioning: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Vendor Provides Materials & Consumables</option>
                  <option>Client Provides Materials</option>
                  <option>Shared Responsibility</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-[#0F8B7D]" />
              <h2 className="text-base font-bold text-gray-900">Timeline</h2>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700">Contract Duration</label>
              <select
                value={form.contractDuration}
                onChange={(e) => setForm({ ...form, contractDuration: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
              >
                <option>6 Months</option>
                <option>1 Year</option>
                <option>2 Years</option>
                <option>3 Years</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700">Expected Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Bid Submission Deadline <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>
          </div>

          {/* Targeting & Assets */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders size={16} className="text-[#0F8B7D]" />
              <h2 className="text-base font-bold text-gray-900">Targeting & Assets</h2>
            </div>
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl">
              <div>
                <p className="text-xs font-bold text-gray-800">Auto-Match Vendors</p>
                <p className="text-[10px] text-gray-500">Notify suitable vendors automatically.</p>
              </div>
              <button
                onClick={() => setForm({ ...form, autoMatch: !form.autoMatch })}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${form.autoMatch ? "bg-[#0F8B7D]" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.autoMatch ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">Minimum Vendor Rating</label>
                <span className="px-2 py-0.5 rounded-lg bg-[#0F8B7D] text-white text-[10px] font-bold">{form.minRating}+</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={form.minRating}
                onChange={(e) => setForm({ ...form, minRating: parseFloat(e.target.value) })}
                className="w-full accent-[#0F8B7D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Supporting Documents</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#0F8B7D] transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-[#0F8B7D]">Click to upload or drag & drop</p>
                <p className="text-[10px] text-gray-400 mt-1">Blueprints, SLA terms, Floor plans<br />(PDF, DOCX max 10MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between py-4 border-t border-gray-200">
        <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit("draft")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit("publish")}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            Publish RFQ <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
