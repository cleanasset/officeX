import React from "react";
import { db } from "@/db";
import { properties, complianceCertificates, helpdeskTickets, auditLogs } from "@/db/schema";
import { Building, ShieldCheck, AlertTriangle, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable caching to fetch live data

export default async function PropertyDashboard() {
  // 1. Fetch live data from Supabase PostgreSQL via Drizzle
  const allProperties = await db.select().from(properties);
  const activeTickets = await db.select().from(helpdeskTickets);
  const certs = await db.select().from(complianceCertificates);
  const logs = await db.select().from(auditLogs);

  // 2. Calculate Dashboard Statistics
  const propertiesCount = allProperties.length;
  const openTicketsCount = activeTickets.filter(t => t.status === "open").length;
  const expiredCertsCount = certs.filter(c => c.status === "expired").length;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good Morning, Rajesh</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">Manage your commercial real estate and statutory records.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/properties/registry" 
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
          >
            Add Property
          </Link>
          <Link 
            href="/properties/collections" 
            className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold shadow-md transition-colors"
          >
            Collect Rent
          </Link>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Properties */}
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Properties</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{propertiesCount}</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">🟢 Active Portfolio</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-[#8B5CF6]">
            <Building size={22} />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Occupancy</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">94.2%</div>
            <span className="text-[10px] text-green-500 font-bold mt-1 inline-block">↑ 1.8% vs last month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUpIcon size={22} />
          </div>
        </div>

        {/* Open Helpdesk Issues */}
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Open Tickets</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{openTicketsCount}</div>
            <span className="text-[10px] text-amber-500 font-bold mt-1 inline-block">⚠ 2 critical priority</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Expired Compliance NOCs */}
        <div className="premium-card p-6 border border-gray-100 flex items-center justify-between bg-white shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Expired NOCs</span>
            <div className="text-3xl font-extrabold text-red-600 mt-2">{expiredCertsCount}</div>
            <span className="text-[10px] text-red-500 font-bold mt-1 inline-block">✗ Renewal Required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <ShieldCheck size={22} />
          </div>
        </div>

      </div>

      {/* BLOCK 2: TWO-COLUMN ALERTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Critical Alerts */}
        <div className="premium-card p-6 border border-gray-100 bg-white">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-red-500" />
            Critical Compliance & Collections Alerts
          </h3>
          <div className="flex flex-col gap-4">
            {certs.filter(c => c.status === "expired").map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expired</div>
                  <div className="text-gray-400 mt-1">Property: {allProperties.find(p => p.id === cert.propertyId)?.name}</div>
                </div>
                <Link href="/properties/compliance" className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                  Renew Certificate
                </Link>
              </div>
            ))}
            
            {certs.filter(c => c.status === "valid" && c.name.includes("Electrical")).map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expiring Soon</div>
                  <div className="text-gray-400 mt-1">Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</div>
                </div>
                <span className="text-amber-600 font-semibold">38 Days Left</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Timeline */}
        <div className="premium-card p-6 border border-gray-100 bg-white">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ClipboardList size={18} className="text-[#8B5CF6]" />
            Security & Audit Activity Logs
          </h3>
          <div className="flex flex-col gap-5 relative border-l border-gray-100 pl-6 ml-3">
            {logs.map((log, idx) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-white"></span>
                <div className="flex justify-between items-center text-gray-400">
                  <span>{new Date(log.createdAt || "").toLocaleDateString()}</span>
                  <span>{log.traceId}</span>
                </div>
                <p className="font-semibold text-gray-800 mt-1">{log.action}</p>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">IP: {log.ipAddress} | Module: {log.module}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BLOCK 3: PROPERTIES DIRECTORY */}
      <div className="premium-card p-6 border border-gray-100 bg-white">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Building size={18} className="text-[#8B5CF6]" />
          Managed Assets Registry
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4">Property Name</th>
                <th className="py-4">Location</th>
                <th className="py-4">Area (Sq.Ft.)</th>
                <th className="py-4">Grade</th>
                <th className="py-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {allProperties.map((prop, idx) => {
                const hasExpired = certs.some(c => c.propertyId === prop.id && c.status === "expired");
                return (
                  <tr key={idx} className="border-b border-gray-100 text-xs hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{prop.name}</td>
                    <td className="py-4 text-gray-500">{prop.address}, {prop.city}</td>
                    <td className="py-4 text-gray-500 font-medium">{parseFloat(prop.totalArea).toLocaleString()}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[10px]">
                        Grade {prop.grade}
                      </span>
                    </td>
                    <td className="py-4">
                      {hasExpired ? (
                        <span className="inline-flex items-center gap-1.5 text-red-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Action Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-green-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-green"></span> Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Simple internal icon component for inline fallback
function TrendingUpIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
}
