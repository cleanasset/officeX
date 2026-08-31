"use client";
import React, { useState } from "react";
import { 
  Upload, Search, CheckCircle, AlertTriangle, XCircle, Code, Shield, 
  FileText, ShieldCheck, Download, Plus, X, Calendar 
} from "lucide-react";
import Link from "next/link";

export default function FMComplianceCentre() {
  const [notify30, setNotify30] = useState(true);
  const [autoEscalate15, setAutoEscalate15] = useState(true);
  const [subject, setSubject] = useState("[ACTION REQUIRED] License Expiring: {{LicenseName}} at {{Property}}");
  const [toast, setToast] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [certificates, setCertificates] = useState([
    { id: "CERT-01", name: "Fire Safety NOC", property: "One BKC (Apex Tower)", authority: "Mumbai Fire Brigade (CFO)", expiry: "12-Sep-2026", days: "18 days remaining", dayColor: "text-amber-600 font-bold", status: "Expiring Soon", stClass: "bg-amber-50 text-amber-800 border-amber-200", action: "Renew Now" },
    { id: "CERT-02", name: "Lift Fitness Certificate", property: "One BKC (Apex Tower)", authority: "PWD Electrical Inspector", expiry: "01-Jan-2027", days: "129 days remaining", dayColor: "text-gray-600", status: "Valid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200", action: "View Cert" },
    { id: "CERT-03", name: "PESO Diesel Storage License", property: "Maker Maxity Mumbai", authority: "Petroleum & Explosives Safety Org", expiry: "15-Jul-2026", days: "Expired 40d ago", dayColor: "text-red-600 font-bold", status: "Expired", stClass: "bg-red-50 text-red-600 border-red-200 font-bold", action: "Re-apply" },
    { id: "CERT-04", name: "Pollution Control Board Consent (CTO)", property: "Godrej BKC Horizon", authority: "Maharashtra Pollution Control Board", expiry: "30-Nov-2026", days: "98 days remaining", dayColor: "text-gray-600", status: "Valid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200", action: "View Cert" },
    { id: "CERT-05", name: "Building Comprehensive Insurance", property: "One BKC (Apex Tower)", authority: "HDFC Ergo General Insurance", expiry: "22-Aug-2026", days: "Valid", dayColor: "text-emerald-600 font-bold", status: "Valid", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200", action: "View Cert" }
  ]);

  const [newCert, setNewCert] = useState({
    name: "",
    property: "One BKC (Apex Tower)",
    authority: "Mumbai Fire Brigade",
    expiry: "2027-03-31"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name.trim()) {
      showToast("Please enter certificate name.");
      return;
    }
    const newEntry = {
      id: `CERT-0${certificates.length + 1}`,
      name: newCert.name,
      property: newCert.property,
      authority: newCert.authority,
      expiry: newCert.expiry,
      days: "365 days remaining",
      dayColor: "text-gray-600",
      status: "Valid",
      stClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: "View Cert"
    };
    setCertificates([newEntry, ...certificates]);
    setShowUploadModal(false);
    showToast(`Uploaded statutory certificate: ${newCert.name}!`);
    setNewCert({ name: "", property: "One BKC (Apex Tower)", authority: "Mumbai Fire Brigade", expiry: "2027-03-31" });
  };

  const handleRenew = (cert: any) => {
    setCertificates(prev => prev.map(c => {
      if (c.id === cert.id) {
        return {
          ...c,
          status: "Valid",
          stClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          expiry: "15-Dec-2027",
          days: "Renewed · Valid"
        };
      }
      return c;
    }));
    showToast(`Renewal initiated for ${cert.name}! Audit verification updated.`);
  };

  const filtered = certificates.filter(c => 
    !searchQuery.trim() || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.authority.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">FM Statutory Compliance Centre</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time statutory license status, automated escalations, NOC renewals, and building safety audit logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Upload size={14} /> Upload Certificate
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL LICENSES</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{certificates.length} Statutory NOCs</p>
          <span className="text-[10px] text-gray-400">Across 3 Campus Buildings</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">VALID &amp; AUDITED</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{certificates.filter(c => c.status === "Valid").length}</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Fire &amp; Lift Safety</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EXPIRING (&lt;30 DAYS)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{certificates.filter(c => c.status === "Expiring Soon").length}</p>
          <span className="text-[10px] text-amber-700 font-bold">Renewal Active</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">OVERDUE / BREACHED</span>
          <p className="text-2xl font-black text-red-600 mt-1">{certificates.filter(c => c.status === "Expired").length}</p>
          <span className="text-[10px] text-red-600 font-bold">Action Required</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by license name, building, or issuing authority..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D] shadow-2xs"
        />
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">CERTIFICATE</th>
              <th className="py-3 px-4">PROPERTY</th>
              <th className="py-3 px-4">ISSUING AUTHORITY</th>
              <th className="py-3 px-4">EXPIRY DATE</th>
              <th className="py-3 px-4">DAYS REMAINING</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cert) => (
              <tr key={cert.id} className="border-b border-gray-100 hover:bg-teal-50/20 transition-colors">
                <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#0F8B7D]" />
                  <span>{cert.name}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{cert.property}</td>
                <td className="py-3.5 px-4 text-gray-600">{cert.authority}</td>
                <td className="py-3.5 px-4 font-mono">{cert.expiry}</td>
                <td className={`py-3.5 px-4 ${cert.dayColor}`}>{cert.days}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${cert.stClass}`}>
                    {cert.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {cert.status !== "Valid" ? (
                    <button
                      onClick={() => handleRenew(cert)}
                      className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      {cert.action}
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast(`Downloading verified certificate for ${cert.name}...`)}
                      className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download size={10} /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900">Upload Statutory Certificate</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add Fire NOC, Lift Fitness, or PESO documentation</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CERTIFICATE NAME</label>
                <input
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  placeholder="e.g. DG Emission Clearance (CPCB)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CAMPUS BUILDING</label>
                <select
                  value={newCert.property}
                  onChange={(e) => setNewCert({ ...newCert, property: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>One BKC (Apex Tower)</option>
                  <option>Maker Maxity Mumbai</option>
                  <option>Godrej BKC Horizon</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ISSUING AUTHORITY</label>
                <input
                  value={newCert.authority}
                  onChange={(e) => setNewCert({ ...newCert, authority: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">VALIDITY EXPIRY DATE</label>
                <input
                  type="date"
                  value={newCert.expiry}
                  onChange={(e) => setNewCert({ ...newCert, expiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Upload size={12} /> Upload &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
