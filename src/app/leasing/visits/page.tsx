"use client";
import React, { useState, useEffect } from "react";
import { Plus, CheckCircle, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getPublicVisits, PublicVisit } from "@/lib/leasingStore";

export default function SiteVisitPlanner() {
  const [toast, setToast] = useState<string | null>(null);
  const [publicVisits, setPublicVisits] = useState<PublicVisit[]>([]);

  const [scheduleForm, setScheduleForm] = useState({
    client: "",
    property: "",
    date: "2026-10-24",
    time: "10:00",
    agent: "Rohan Sharma (Self)",
    instructions: ""
  });

  const [feedbackForm, setFeedbackForm] = useState({
    visit: "10:00 AM - HCL Tech",
    impression: "Highly Interested",
    nextDate: "2026-10-25",
    notes: ""
  });

  const loadVisits = () => {
    setPublicVisits(getPublicVisits());
  };

  useEffect(() => {
    loadVisits();
    const handleNew = () => {
      loadVisits();
      setToast("⚡ New site visit scheduled from public portal!");
      setTimeout(() => setToast(null), 3500);
    };
    window.addEventListener("officex-visit-added", handleNew);
    return () => window.removeEventListener("officex-visit-added", handleNew);
  }, []);

  const handleCreateVisit = () => {
    setToast("Site visit scheduled successfully!");
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveFeedback = () => {
    setToast("Client visit feedback recorded!");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Section: Month Calendar + Schedule New Visit Form */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">October 2023</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><ChevronLeft size={14} /></button>
              <button className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white">Today</button>
              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><ChevronRight size={14} /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center text-xs border-b border-gray-100 pb-2 mb-2 font-bold text-gray-400">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-gray-700 font-semibold min-h-[220px]">
            {/* Week 1 */}
            <div className="p-2 border border-transparent text-gray-400">1</div>
            <div className="p-2 border border-transparent">2</div>
            <div className="p-2 border border-transparent">3</div>
            <div className="p-2 border border-transparent">4</div>
            <div className="p-2 border border-transparent relative">5 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute bottom-1.5 left-1/2 -translate-x-1/2" /></div>
            <div className="p-2 border border-transparent">6</div>
            <div className="p-2 border border-transparent text-gray-400">7</div>

            {/* Week 2 */}
            <div className="p-2 border border-transparent text-gray-400">8</div>
            <div className="p-2 border border-transparent">9</div>
            <div className="p-2 border border-transparent">10</div>
            <div className="p-2 border border-transparent relative">11 <span className="flex gap-0.5 justify-center mt-1"><span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D]" /><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /></span></div>
            <div className="p-2 border border-transparent">12</div>
            <div className="p-2 border border-transparent">13</div>
            <div className="p-2 border border-transparent text-gray-400">14</div>

            {/* Week 3 */}
            <div className="p-2 border border-transparent text-gray-400">15</div>
            <div className="p-2 border border-transparent">16</div>
            <div className="p-2 border border-transparent relative">17 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1.5 left-1/2 -translate-x-1/2" /></div>
            <div className="p-2 border border-transparent">18</div>
            <div className="p-2 border border-transparent">19</div>
            <div className="p-2 border border-transparent">20</div>
            <div className="p-2 border border-transparent text-gray-400">21</div>

            {/* Week 4 (Active day 23) */}
            <div className="p-2 border border-transparent text-gray-400">22</div>
            <div className="p-2 border-2 border-blue-600 bg-blue-50/50 rounded-xl relative font-black text-blue-900">
              23
              <div className="flex gap-1 justify-center mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
            </div>
            <div className="p-2 border border-transparent">24</div>
            <div className="p-2 border border-transparent">25</div>
            <div className="p-2 border border-transparent">26</div>
            <div className="p-2 border border-transparent relative">27 <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] absolute bottom-1.5 left-1/2 -translate-x-1/2" /></div>
            <div className="p-2 border border-transparent text-gray-400">28</div>

            {/* Week 5 */}
            <div className="p-2 border border-transparent text-gray-400">29</div>
            <div className="p-2 border border-transparent">30</div>
            <div className="p-2 border border-transparent">31</div>
            <div className="p-2 border border-transparent text-gray-300">1</div>
            <div className="p-2 border border-transparent text-gray-300">2</div>
            <div className="p-2 border border-transparent text-gray-300">3</div>
            <div className="p-2 border border-transparent text-gray-300">4</div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-500 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600" /> Tech Parks</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0F8B7D]" /> Standalone Towers</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> SEZ Properties</span>
          </div>
        </div>

        {/* Schedule New Visit Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between space-y-4">
          <h2 className="text-base font-bold text-gray-900">Schedule New Visit</h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SELECT CLIENT</label>
              <select className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white">
                <option>Select a client...</option>
                <option>HCL Tech</option>
                <option>Wipro Limited</option>
                <option>Freshworks</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SELECT PROPERTY</label>
              <select className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white">
                <option>Search properties...</option>
                <option>Apex Business Tower</option>
                <option>Prestige Tech Park</option>
                <option>Nexus Hub</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">DATE</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TIME</label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ASSIGNED AGENT</label>
              <select className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white">
                <option>Rohan Sharma (Self)</option>
                <option>Ravi M.</option>
                <option>Neha S.</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SPECIAL INSTRUCTIONS</label>
              <textarea
                placeholder="E.g., Client wants to focus on cafeteria and server room locations..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 resize-none h-16"
              />
            </div>
          </div>

          <button
            onClick={handleCreateVisit}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Create Site Visit
          </button>
        </div>
      </div>

      {/* Bottom Section: Visits Today + Log Feedback */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Visits Today Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Visits Today (Oct 23)</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">3 Scheduled</span>
            </div>

            <div className="space-y-3">
              {/* Dynamic Public Web Visits */}
              {publicVisits.map((pv) => (
                <div key={pv.id} className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{pv.time}</span>
                        <span className="text-[10px] text-gray-500">• {pv.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">⚡ Live Booking</span>
                      </div>
                      <p className="text-xs text-gray-800 font-bold mt-0.5">
                        {pv.companyName} — <span className="text-gray-600 font-normal">{pv.propertyTitle}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Confirmed Visit
                  </span>
                </div>
              ))}

              {/* Visit 1 */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">10:00 AM</span>
                      <span className="text-[10px] text-gray-400">• Rohan Sharma (Host)</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                      HCL Tech — <span className="text-gray-500 font-normal">Apex Business Tower</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>

              {/* Visit 2 */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">02:00 PM</span>
                      <span className="text-[10px] text-gray-400">• Ravi M.</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                      Wipro Limited — <span className="text-gray-500 font-normal">Prestige Tech Park</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  In Progress
                </span>
              </div>

              {/* Visit 3 */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <CalendarIcon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">04:30 PM</span>
                      <span className="text-[10px] text-gray-400">• Neha S.</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                      Freshworks — <span className="text-gray-500 font-normal">Nexus Hub</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Scheduled
                </span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50">
            View All Schedule
          </button>
        </div>

        {/* Log Feedback Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💬</span>
            <h2 className="text-base font-bold text-gray-900">Log Feedback</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SELECT VISIT</label>
              <select className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white">
                <option>10:00 AM - HCL Tech</option>
                <option>02:00 PM - Wipro Limited</option>
                <option>04:30 PM - Freshworks</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CLIENT IMPRESSION</label>
              <select
                value={feedbackForm.impression}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, impression: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white"
              >
                <option>Highly Interested</option>
                <option>Warm / Negotiating</option>
                <option>Needs Follow-up</option>
                <option>Unfavorable</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">NEXT ACTION DATE</label>
              <input
                type="date"
                value={feedbackForm.nextDate}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, nextDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">FOLLOW-UP NOTES</label>
              <textarea
                placeholder="E.g., Client requested floor plans for 5th floor..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 resize-none h-16"
              />
            </div>
          </div>

          <button
            onClick={handleSaveFeedback}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            💾 Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
