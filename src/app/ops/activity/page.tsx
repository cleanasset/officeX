"use client";
import React, { useState } from "react";
import { Send, Upload, CheckCircle, Camera } from "lucide-react";

export default function DailyActivityLogger() {
  const [shift, setShift] = useState("Morning Shift (6 AM - 2 PM)");
  const [staff, setStaff] = useState([
    { name: "Rajesh K.", role: "MEP Tech", present: true },
    { name: "Suman V.", role: "HK Lead", present: true },
    { name: "Amit P.", role: "Security", present: false }
  ]);

  const [checklists, setChecklists] = useState([
    { label: "Check DG Set fuel and battery levels.", checked: false },
    { label: "Inspect HVAC chiller compressor readings.", checked: false },
    { label: "Hourly water pump tank level inspection.", checked: true },
    { label: "Verify fire sprinkler pressure readings.", checked: false }
  ]);

  const [incidentTitle, setIncidentTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [desc, setDesc] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const toggleStaff = (idx: number) => {
    const next = [...staff];
    next[idx].present = !next[idx].present;
    setStaff(next);
  };

  const toggleCheck = (idx: number) => {
    const next = [...checklists];
    next[idx].checked = !next[idx].checked;
    setChecklists(next);
  };

  const handleSubmit = () => {
    setToast("Daily shift log and handover notes submitted to facility supervisor!");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto py-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Card Header with Shift Switcher */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-black text-gray-900">Daily Shift Log</h1>
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
            {["Morning Shift (6 AM - 2 PM)", "Afternoon Shift", "Night Shift"].map((s) => (
              <button
                key={s}
                onClick={() => setShift(s)}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  shift === s ? "bg-amber-100 text-amber-900 shadow-sm" : "hover:text-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Pane Grid: Left Attendance & Checklists + Right Incident & Handover */}
        <div className="grid grid-cols-[1fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Staff Attendance Tracker */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                👥 Staff Attendance Tracker
              </h2>
              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-gray-50 p-2.5 px-4 font-bold text-[10px] text-gray-400 uppercase">
                  <span>NAME & ROLE</span>
                  <span className="text-right">STATUS</span>
                </div>
                {staff.map((s, idx) => (
                  <div key={s.name} className="grid grid-cols-2 p-3 px-4 border-t border-gray-100 items-center">
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.role}</p>
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="checkbox"
                        checked={s.present}
                        onChange={() => toggleStaff(idx)}
                        className="w-5 h-5 accent-[#0F8B7D] cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PPM & Routine Checklists */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                📋 PPM & Routine Checklists
              </h2>
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 text-xs bg-gray-50/30">
                {checklists.map((c, idx) => (
                  <label key={c.label} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={c.checked}
                      onChange={() => toggleCheck(idx)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#0F8B7D]"
                    />
                    <span className={c.checked ? "font-semibold text-gray-900" : "text-gray-600"}>
                      {c.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Log Shift Incident & Shift Handover Notes */}
          <div className="space-y-6">
            {/* Log Shift Incident */}
            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/40 space-y-3 text-xs">
              <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                ⚠️ Log Shift Incident
              </h2>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Incident Title
                </label>
                <input
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Brief summary of issue..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs resize-none h-16 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Photo Upload
                </label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-white hover:border-amber-500">
                  <Camera size={18} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-[11px] text-gray-500 font-semibold">Click or drag photo to upload</p>
                </div>
              </div>
            </div>

            {/* Shift Handover Notes */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                🤝 Shift Handover Notes
              </h2>
              <textarea
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="Important notes for the incoming shift team..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs resize-none h-24 focus:outline-none focus:border-amber-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <Send size={13} /> Submit Shift Log
          </button>
        </div>
      </div>
    </div>
  );
}
