"use client";
import React, { useState } from "react";
import { Upload, Search, CheckCircle, AlertTriangle, XCircle, Code, Shield } from "lucide-react";

export default function ComplianceTrackerDashboard() {
  const [notify30, setNotify30] = useState(true);
  const [autoEscalate15, setAutoEscalate15] = useState(true);
  const [subject, setSubject] = useState("[ACTION REQUIRED] License Expiring: {{LicenseName}} at {{Property}}");
  const [toast, setToast] = useState<string | null>(null);

  const certificates = [
    { name: "Fire NOC", property: "Crystal Tower", authority: "Fire Department", expiry: "12-Sep-2025", days: "18 days", dayColor: "text-amber-600 font-bold", status: "Expiring Soon", stClass: "bg-amber-50 text-amber-800 border-amber-200", action: "Renew Now", actColor: "text-purple-600 font-bold hover:underline" },
    { name: "Lift Fitness", property: "Apex Tower", authority: "PWD Lift Inspector", expiry: "01-Jan-2026", days: "129 days", dayColor: "text-gray-600", status: "Valid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "PESO License", property: "Meridian Park", authority: "Petroleum Safety Org", expiry: "15-Jul-2025", days: "-40 days", dayColor: "text-red-600 font-bold", status: "Expired", stClass: "bg-red-50 text-red-600 border-red-200 font-bold", action: "Re-apply", actColor: "text-red-600 font-bold hover:underline" },
    { name: "PCB Consent", property: "Nexus Hub", authority: "Pollution Control Board", expiry: "30-Nov-2025", days: "98 days", dayColor: "text-gray-600", status: "Valid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Building Insurance", property: "Crystal Tower", authority: "HDFC Ergo", expiry: "22-Aug-2025", days: "-2 days", dayColor: "text-red-600 font-bold", status: "Expired", stClass: "bg-red-50 text-red-600 border-red-200 font-bold", action: "Renew Now", actColor: "text-purple-600 font-bold hover:underline" }
  ];

  const handleUploadCert = () => {
    setToast("Upload new compliance certificate modal opened!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveTemplate = () => {
    setToast("Escalation email template saved successfully!");
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time statutory license status, automated escalations, and renewals.</p>
        </div>
        <button
          onClick={handleUploadCert}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Upload size={14} /> Upload Certificate
        </button>
      </div>

      {/* KPI + Health Overview Row */}
      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Metric Counter Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Licenses</p>
            <p className="text-3xl font-black text-gray-900 mt-1">48</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Valid</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">38</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Expiring &lt;60d</p>
            <p className="text-3xl font-black text-amber-500 mt-1">6</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Expired</p>
            <p className="text-3xl font-black text-red-500 mt-1">4</p>
          </div>
        </div>

        {/* Health Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900">Health Overview</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">License status distribution</p>
            <div className="space-y-1 mt-2 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Valid (79%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Expiring (12.5%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Expired (8.5%)</div>
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900">
            79%
          </div>
        </div>
      </div>

      {/* Compliance Registry Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Compliance Registry</h2>
          <button className="text-xs font-bold text-purple-600 hover:underline">
            View All →
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3">CERTIFICATE NAME</th>
                <th className="py-3">PROPERTY</th>
                <th className="py-3">ISSUING AUTHORITY</th>
                <th className="py-3">EXPIRY DATE</th>
                <th className="py-3">DAYS REMAINING</th>
                <th className="py-3">STATUS</th>
                <th className="py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.name} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{cert.name}</td>
                  <td className="py-3.5 text-gray-600">{cert.property}</td>
                  <td className="py-3.5 text-gray-600">{cert.authority}</td>
                  <td className={`py-3.5 ${cert.days.includes("-") ? "text-red-500 font-bold" : "text-gray-600"}`}>{cert.expiry}</td>
                  <td className={`py-3.5 ${cert.dayColor}`}>{cert.days}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cert.stClass}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {cert.action ? (
                      <button className={`text-xs ${cert.actColor}`}>
                        {cert.action}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Automated Alert Escalations + Email Template Editor */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Automated Alert Escalations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900">Automated Alert Escalations</h2>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-700">&ldquo;Expiring Soon&rdquo; Flag Lead Time</span>
              <span className="text-purple-600">60 Days</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: "60%" }} />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">Daily alerts to PM at 30 days</p>
                <p className="text-[10px] text-gray-400">Notify Property Manager via email & app</p>
              </div>
              <input
                type="checkbox"
                checked={notify30}
                onChange={(e) => setNotify30(e.target.checked)}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">Auto-escalate to Facility Head at 15 days</p>
                <p className="text-[10px] text-gray-400">Cc senior management on critical alerts</p>
              </div>
              <input
                type="checkbox"
                checked={autoEscalate15}
                onChange={(e) => setAutoEscalate15(e.target.checked)}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-600 flex items-start gap-2">
            <span className="text-gray-400">ℹ</span>
            <p>Status automatically flags as <b className="text-red-500 font-bold">&ldquo;Expired&rdquo;</b> on the exact expiry date at 00:00 local time.</p>
          </div>
        </div>

        {/* Email Template Editor */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-900">Email Template Editor</h2>
              <button className="text-xs font-bold text-purple-600 hover:underline">Preview</button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                SUBJECT LINE
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-white"
              />
            </div>

            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-2 text-xs text-gray-500 font-bold">
                  <span>B</span><span>I</span><span>🔗</span>
                </div>
                <button className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  {"{ } Variables"}
                </button>
              </div>
              <textarea
                defaultValue={`Hello Team,\n\nThis is an automated reminder that the {{LicenseName}} for {{Property}} is due to expire in {{DaysRemaining}} days.\n\nPlease initiate renewal documents.`}
                className="w-full p-3 text-xs text-gray-700 resize-none h-24 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
