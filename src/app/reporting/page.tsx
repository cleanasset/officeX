import React from "react";
import { FileText, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

export default function ReportingDashboard() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Metrics & Reporting</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">MIS PDF report generators, energy allocations, ESG metrics, and AI summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-colors flex items-center gap-2">
            <FileText size={16} />
            Generate MIS Report (PDF)
          </button>
        </div>
      </div>

      {/* KPI BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Energy Used</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">120k kWh</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">↓ 4.5% vs last month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Utility Costs</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">₹2.4L</div>
            <span className="text-[10px] text-[#2563EB] font-bold mt-1 inline-block">Electricity/Water aggregate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">ESG Scorecard</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">85%</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">Grade A Certification</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">AI Executive Summaries</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">Review</div>
            <span className="text-[10px] text-amber-500 font-bold mt-1 inline-block">Draft pending verification</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* PDF Generators Selection Section */}
      <div className="premium-card p-6 border border-gray-100 bg-white">
        <h3 className="text-base font-bold text-gray-900 mb-6">Report Compilers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-gray-900">Commercial Leasing Summary Report</div>
              <div className="text-gray-400 mt-1">Concludes closed deals, pipeline conversion, and brokerage rollups.</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold">Download</button>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-gray-900">FM Marketplace Procurement Report</div>
              <div className="text-gray-400 mt-1">Audit trail lists matching logs, split escrow payments, and ratings.</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold">Download</button>
          </div>
        </div>
      </div>

    </div>
  );
}
