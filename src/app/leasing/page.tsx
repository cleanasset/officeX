import React from "react";
import { db } from "@/db";
import { leaseUnits, leases, users, auditLogs } from "@/db/schema";
import { Building, TrendingUp, Calendar, DollarSign, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function LeasingDashboard() {
  // Query DB state
  const unitsCount = await db.select().from(leaseUnits);
  const activeLeases = await db.select().from(leases);
  const recentLogs = await db.select().from(auditLogs);

  const activeListingsCount = unitsCount.filter(u => u.status === "available").length;
  const closedLeasesCount = activeLeases.length;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leasing Portal</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">CRM, pipeline boards, and site visits schedule.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leasing/pipeline" className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md transition-colors">
            Pipeline Board
          </Link>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Listings</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{activeListingsCount}</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">🟢 Inventory Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB]">
            <Building size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Open Leads</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">23</div>
            <span className="text-[10px] text-blue-500 font-bold mt-1 inline-block">5 qualified this week</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Visits Today</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">5</div>
            <span className="text-[10px] text-amber-500 font-bold mt-1 inline-block">Next: 2:00 PM at Apex</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Calendar size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Commission Pipe</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">₹8.4L</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">↑ 12% vs last month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* BLOCK 2: SPLIT LEADS FUNNEL & CRITICAL ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Funnel */}
        <div className="premium-card p-6 border border-gray-100 bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-6">Leasing Pipeline Funnel</h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Enquiries (156)</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Qualified Leads (89)</span>
                <span>57%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full" style={{ width: "57%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Site Visits (52)</span>
                <span>33%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full" style={{ width: "33%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
                <span>LOI Negotiation (15)</span>
                <span>9.6%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full" style={{ width: "9.6%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="premium-card p-6 border border-gray-100 bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-6">Critical Actions</h3>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-gray-900">Lead #L-089 (HCL Tech) Stale</div>
                <div className="text-gray-400 mt-0.5">No follow-up activity in 7 days.</div>
              </div>
              <button className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Contact Now</button>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-gray-900">LOI Pending Signature</div>
                <div className="text-gray-400 mt-0.5">LOI-012 has been sent to client for 5 days.</div>
              </div>
              <button className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold">Send Alert</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
