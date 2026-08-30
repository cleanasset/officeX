"use client";
import React, { useState } from "react";
import { Download, Send, CheckCircle, FileText, Check } from "lucide-react";

export default function MonthlyMISReportGenerator() {
  const [property, setProperty] = useState("Apex Business Tower");
  const [month, setMonth] = useState("October");
  const [year, setYear] = useState("2024");

  const [includeExec, setIncludeExec] = useState(true);
  const [includeSla, setIncludeSla] = useState(true);
  const [includePpm, setIncludePpm] = useState(true);
  const [includeEnergy, setIncludeEnergy] = useState(false);
  const [includeInvoices, setIncludeInvoices] = useState(false);

  const [recipients, setRecipients] = useState("");
  const [autoSend, setAutoSend] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = () => {
    setToast("Generated live MIS preview report for October 2024!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleDistribute = () => {
    setToast("Monthly MIS report distributed to stakeholders & institutional owners!");
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

      {/* Main Split Grid: Left Generator Form + Right Live Document Paper */}
      <div className="grid grid-cols-[380px_1fr] gap-8 items-start">
        {/* Left Form Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">Generate Monthly MIS Report</h2>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                SELECT PROPERTY
              </label>
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
              >
                <option>Apex Business Tower</option>
                <option>Meridian Business Park</option>
                <option>Nexus Innovation Hub</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  MONTH
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
                >
                  <option>October</option>
                  <option>September</option>
                  <option>August</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  YEAR
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white"
                >
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </div>
            </div>

            {/* Include Sections */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                INCLUDE SECTIONS
              </label>

              {[
                { label: "Executive Summary", state: includeExec, set: setIncludeExec },
                { label: "SLA Compliance", state: includeSla, set: setIncludeSla },
                { label: "PPM Tasks", state: includePpm, set: setIncludePpm },
                { label: "Energy Charts", state: includeEnergy, set: setIncludeEnergy },
                { label: "Rent Invoices", state: includeInvoices, set: setIncludeInvoices }
              ].map((sec) => (
                <div key={sec.label} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>{sec.label}</span>
                  <input
                    type="checkbox"
                    checked={sec.state}
                    onChange={(e) => sec.set(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              🔄 Generate Report Preview
            </button>
          </div>

          {/* Distribution Settings Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">DISTRIBUTION SETTINGS</h3>

            <input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="Enter recipient emails (comma separated)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-600"
            />

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-700">
              <span className="flex items-center gap-1.5">🕒 Schedule Auto-Send (Monthly)</span>
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5">
                <Download size={13} /> Download PDF
              </button>
              <button
                onClick={handleDistribute}
                className="py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={13} /> Distribute Now
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Canvas (Document Mockup) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 font-sans space-y-8 min-h-[720px] relative">
          <div>
            <h1 className="text-2xl font-black text-teal-800">Monthly MIS Report</h1>
            <p className="text-xs text-gray-600 font-semibold mt-0.5">{property}</p>
            <p className="text-[11px] text-gray-400">{month} {year}</p>
          </div>

          <div className="h-0.5 bg-teal-800 w-full" />

          {/* Executive Summary */}
          {includeExec && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900">Executive Summary</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Overall facility operations for {property} remained stable and within optimal parameters during {month} {year}. Occupancy held steady at 94%. Utility consumption recorded a marginal 2% decrease compared to the previous month, attributable to optimized HVAC scheduling. Major preventive maintenance tasks were completed on schedule, ensuring minimal disruption to tenant operations.
              </p>
            </div>
          )}

          {/* SLA Compliance */}
          {includeSla && (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-gray-900">SLA Compliance</h2>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                    <span>MEP Systems</span>
                    <span className="font-bold text-teal-700">98.4%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "98.4%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                    <span>HVAC Maintenance</span>
                    <span className="font-bold text-blue-600">96.0%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                    <span>Security Operations</span>
                    <span className="font-bold text-teal-700">99.1%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "99.1%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Active Work Orders Table */}
          {includePpm && (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-gray-900">Key Active Work Orders</h2>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/60 text-[10px] font-bold text-gray-400 uppercase">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">DESCRIPTION</th>
                    <th className="py-2 px-3">PRIORITY</th>
                    <th className="py-2 px-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">WO-4092</td>
                    <td className="py-2.5 px-3 text-gray-700">Chiller Plant Filter Replacement</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">High</span></td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-600">In Progress</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">WO-4105</td>
                    <td className="py-2.5 px-3 text-gray-700">Lobby Lighting Upgrade</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">Medium</span></td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-600">Scheduled</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">WO-4112</td>
                    <td className="py-2.5 px-3 text-gray-700">Quarterly Fire Alarm Test</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">High</span></td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer of the PDF page */}
          <div className="pt-12 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100">
            <span>Page 1 of 5</span>
            <span>Generated via OfficeX MIS Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
