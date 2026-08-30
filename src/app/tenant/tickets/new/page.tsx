"use client";
import React, { useState } from "react";
import { Upload, CheckCircle, ArrowRight } from "lucide-react";

export default function HelpdeskTicketCreator() {
  const [unit, setUnit] = useState("Unit 5A");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [impact, setImpact] = useState("Low - Minimal disruption");
  const [priority, setPriority] = useState("Medium");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const priorities = [
    { label: "Low", sla: "24h / 72h", activeBg: "bg-gray-100 text-gray-800 border-gray-400" },
    { label: "Medium", sla: "4h / 24h", activeBg: "bg-blue-50 text-blue-800 border-blue-500" },
    { label: "High", sla: "2h / 8h", activeBg: "bg-amber-50 text-amber-800 border-amber-500" },
    { label: "Critical", sla: "1h / 4h", activeBg: "bg-red-50 text-red-700 border-red-500" }
  ];

  const handleSubmit = () => {
    setToast("Helpdesk ticket raised! Assigned to facility engineering team.");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto py-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Raise New Helpdesk Ticket</h1>
          <p className="text-xs text-gray-500 mt-1">Please provide detailed information to help us resolve your issue promptly.</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                UNIT / FLOOR
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                SPECIFIC AREA
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
              >
                <option value="">Select Area</option>
                <option>Main Conference Room</option>
                <option>Server Room B</option>
                <option>Cafeteria / Pantry</option>
                <option>Restroom Block 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
              >
                <option>Electrical</option>
                <option>HVAC / AC Cooling</option>
                <option>Plumbing & Water</option>
                <option>Housekeeping</option>
                <option>Access & Security</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                BUSINESS IMPACT
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
              >
                <option>Low - Minimal disruption</option>
                <option>Medium - Partial floor affected</option>
                <option>High - Severe impact to work</option>
                <option>Critical - Complete work stoppage</option>
              </select>
            </div>
          </div>

          {/* Priority Level 4-Button Selector */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-4 gap-3">
              {priorities.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPriority(p.label)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === p.label ? p.activeBg + " border-2 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <p className="text-xs font-bold">{p.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">SLA: {p.sla}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              TICKET TITLE
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              DETAILED DESCRIPTION
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide specific details to help the maintenance team..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-24 focus:outline-none focus:border-purple-600 bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              ATTACHMENTS (OPTIONAL)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-purple-600 bg-gray-50/50">
              <Upload size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs font-semibold text-gray-700">Click to upload or drag and drop</p>
              <p className="text-[10px] text-gray-400 mt-0.5">SVG, PNG, JPG or MP4 (max 5 files, 10MB each)</p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">ℹ SLA timeline begins immediately on submission.</p>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              Submit Helpdesk Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
