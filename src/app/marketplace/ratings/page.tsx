"use client";
import React, { useState } from "react";
import { Star, CheckCircle, Upload, Eye } from "lucide-react";

export default function VendorRatingSystem() {
  const [scores, setScores] = useState<Record<string, number>>({
    "Quality of Work": 5,
    "Timeliness": 4,
    "Professionalism": 5,
    "SLA Compliance": 5,
    "Communication": 4
  });

  const [notes, setNotes] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [rehire, setRehire] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const setRating = (crit: string, val: number) => {
    setScores({ ...scores, [crit]: val });
  };

  const handleSubmit = () => {
    setToast("Vendor performance rating submitted to FM Marketplace!");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Vendor Performance Rating</h1>
        <p className="text-sm text-gray-500 mt-1">Evaluate the recent service provided by TechServe Solutions to maintain quality standards.</p>
      </div>

      {/* Vendor Top Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold text-xl">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">TechServe Solutions</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
                HVAC Maintenance
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Work Order: <span className="font-semibold text-gray-800">WO-045</span> • Completed: Aug 22, 2023 • BKC Mumbai Facility, Tower B
            </p>
          </div>
        </div>

        <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
          <Eye size={14} /> View Work Order
        </button>
      </div>

      {/* Rating Dimensions Grid */}
      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Overall Score Dial */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">OVERALL VENDOR SCORE</p>
          
          <div className="relative w-36 h-36 mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0F8B7D" strokeWidth="3.2" strokeDasharray="92, 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-900">4.6</span>
              <span className="text-xs text-gray-400 font-semibold">/ 5.0</span>
            </div>
          </div>

          <div className="flex gap-1 text-amber-400 text-sm">
            {"★★★★★"}
          </div>
        </div>

        {/* Performance Criteria Sliders/Stars */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">Performance Criteria</h2>
          <p className="text-xs text-gray-500">Rate the vendor across these key SLA dimensions to ensure accurate marketplace standing.</p>

          <div className="space-y-4 pt-2">
            {[
              { name: "Quality of Work", sub: "Adherence to technical specifications" },
              { name: "Timeliness", sub: "Punctuality and completion within SLA" },
              { name: "Professionalism", sub: "Staff conduct on premises" },
              { name: "SLA Compliance", sub: "Met contractual obligations" },
              { name: "Communication", sub: "Clarity and frequency of updates" }
            ].map((crit) => (
              <div key={crit.name} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-bold text-gray-800">{crit.name}</p>
                  <p className="text-[11px] text-gray-400">{crit.sub}</p>
                </div>
                <div className="flex gap-1 text-amber-400 cursor-pointer text-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(crit.name, star)}
                      className="hover:scale-125 transition-transform"
                    >
                      {star <= (scores[crit.name] || 0) ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Qualitative Feedback Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-gray-900">Qualitative Feedback</h2>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            DETAILED REVIEW NOTES
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide context regarding the vendor's performance, highlighting any exceptional service or areas needing improvement..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-24 focus:outline-none focus:border-[#0F8B7D]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">Recommend to others?</p>
              <p className="text-[10px] text-gray-400">Visible on marketplace</p>
            </div>
            <input
              type="checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">Rehire vendor?</p>
              <p className="text-[10px] text-gray-400">Internal metric only</p>
            </div>
            <input
              type="checkbox"
              checked={rehire}
              onChange={(e) => setRehire(e.target.checked)}
              className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            SUPPORTING DOCUMENTS (OPTIONAL)
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#0F8B7D] bg-gray-50/50">
            <Upload size={20} className="mx-auto text-gray-400 mb-1" />
            <p className="text-xs font-semibold text-gray-700">Click to upload or drag and drop</p>
            <p className="text-[10px] text-gray-400 mt-0.5">SLA sheets, post-work photos, or invoices (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Footer Submit */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <p className="text-xs text-gray-400">ℹ Note: Ratings are public on the FM Marketplace.</p>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle size={14} /> Submit Rating & Review
          </button>
        </div>
      </div>
    </div>
  );
}
