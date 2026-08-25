"use client";
import React, { useState } from "react";
import { DollarSign, BarChart } from "lucide-react";

export default function FinancialAnalytics() {
  const [stats] = useState([
    { id: 1, label: "Gross Marketplace Volume (GMV)", value: "₹45,82,000", change: "+12.5% vs last month" },
    { id: 2, label: "OfficeX Commission Revenue (10%)", value: "₹4,58,200", change: "+12.5% vs last month" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Analytics</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Audit platform commission revenues, transaction rollups, and payouts ledgers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((st) => (
          <div key={st.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">{st.label}</span>
              <span className="text-3xl font-extrabold text-gray-900 block mt-3">{st.value}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-2">{st.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
