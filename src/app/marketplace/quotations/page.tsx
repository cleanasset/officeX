"use client";
import React, { useState } from "react";
import { Download, Star, CheckCircle, Clock, Users, Package, Calendar, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";

export default function VendorQuotationsViewer() {
  const [selected, setSelected] = useState<string[]>(["TechServe Solutions", "MEP Experts Pvt. Ltd."]);
  const [toast, setToast] = useState<string | null>(null);

  const quotes = [
    {
      vendor: "TechServe Solutions", verified: true, badge: "Gold Partner", rating: 4.6, reviews: 120, projects: 89,
      resource: "4 technicians assigned", materials: "Included in AMC", tenure: "12-month contract", sla: "2h response time",
      net: "₹1,85,000/mo", gst: "+ ₹33,300", gross: "₹2,18,300"
    },
    {
      vendor: "MEP Experts Pvt. Ltd.", verified: true, badge: "Silver Partner", rating: 4.2, reviews: 85, projects: 42,
      resource: "3 technicians assigned", materials: "Billed separately", tenure: "", sla: "",
      net: "", gst: "", gross: "₹2,36,000"
    },
    {
      vendor: "ElectroMech Services", verified: true, badge: "Verified Vendor", rating: 4.4, reviews: 150, projects: 55,
      resource: "5 technicians assigned", materials: "", tenure: "", sla: "",
      net: "", gst: "", gross: "₹2,10,000"
    }
  ];

  const toggleSelect = (vendor: string) => {
    setSelected((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]
    );
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

      {/* RFQ Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200">RFQ-089</span>
            <h1 className="text-xl font-black text-gray-900">DG Set Maintenance</h1>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={13} /> 5 quotes received</span>
            <span className="flex items-center gap-1 text-red-500"><Clock size={13} /> Deadline: Aug 26</span>
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#0F8B7D] hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
          <Download size={14} /> Download All
        </button>
      </div>

      {/* Vendor Quote Cards */}
      <div className="flex flex-col gap-4">
        {quotes.map((q) => (
          <div key={q.vendor} className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-6">
            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-black text-gray-900">{q.vendor}</h2>
                {q.verified && <CheckCircle size={18} className="text-[#0F8B7D]" />}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-600">{q.badge}</span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <Star size={13} className="text-amber-500 fill-amber-500" /> {q.rating} ({q.reviews})
                </span>
                <span className="text-xs text-gray-500">📁 {q.projects} projects</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {q.resource && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resource</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.resource}</p>
                  </div>
                )}
                {q.materials && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Materials</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.materials}</p>
                  </div>
                )}
                {q.tenure && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tenure</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.tenure}</p>
                  </div>
                )}
                {q.sla && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SLA</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.sla}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Panel */}
            <div className="w-[220px] bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
              {q.net && (
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Net Price</span>
                  <span className="font-semibold text-gray-700">{q.net}</span>
                </div>
              )}
              {q.gst && (
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-700">{q.gst}</span>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Monthly</p>
                <p className="text-2xl font-black text-[#0F8B7D] mt-0.5">{q.gross}</p>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(q.vendor)}
                  onChange={() => toggleSelect(q.vendor)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0F8B7D] focus:ring-[#0F8B7D] accent-[#0F8B7D]"
                />
                <span className="text-xs font-semibold text-gray-700">Select for Comparison Board</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Selection Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between z-40 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#0F8B7D] text-white font-bold text-sm flex items-center justify-center">{selected.length}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">Vendors Selected</p>
              <p className="text-xs text-gray-500">Ready for detailed comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected([])} className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer">Cancel selection</button>
            <Link href="/marketplace/compare" className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer">
              ⇄ Compare Side-by-Side
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
