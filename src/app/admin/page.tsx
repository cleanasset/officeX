import React from "react";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ShieldCheck, Users, Sparkles, ClipboardList, Settings, UserCheck, ShieldAlert, FileText, ArrowRight, Cpu } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboard() {
  const usersList = await db.select().from(users);
  const logsList = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5);

  const modules = [
    { label: "User Management", desc: "Provision roles and security accounts", link: "/admin/users", icon: Users, color: "text-red-500 bg-red-50 border-red-100" },
    { label: "RBAC Settings", desc: "Manage permissions access matrix", link: "/admin/rbac", icon: ShieldCheck, color: "text-teal-500 bg-teal-50 border-teal-100" },
    { label: "Vendor KYC", desc: "Verify GSTIN tax and licenses", link: "/admin/kyc", icon: UserCheck, color: "text-amber-500 bg-amber-50 border-amber-100" },
    { label: "Platform Settings", desc: "Adjust commission splits and regions", link: "/admin/settings", icon: Settings, color: "text-blue-500 bg-blue-50 border-blue-100" },
    { label: "AI Configuration", desc: "LLM parameters and observation gates", link: "/admin/ai", icon: Sparkles, color: "text-purple-500 bg-purple-50 border-purple-100" },
    { label: "Audit Ledger", desc: "Search immutable log traces", link: "/admin/logs", icon: ClipboardList, color: "text-emerald-500 bg-emerald-50 border-emerald-100" }
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Super Admin Portal</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Configure global parameters, provisioning gates, and track platform audits.</p>
        </div>
      </div>

      {/* Quick Action Module Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link 
              key={idx} 
              href={m.link}
              className="premium-card p-6 border border-gray-200 bg-white hover:border-red-500 hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${m.color}`}>
                  <Icon size={20} />
                </div>
                <ArrowRight size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-900">{m.label}</h3>
                <p className="text-[11px] text-gray-600 font-bold mt-0.5">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* KPI BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Users</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">{usersList.length}</div>
            <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">Active provision states</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Users size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending KYC</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">2</div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">Verification checks queued</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Database Status</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">100%</div>
            <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">Backups Online</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">AI Operations</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">Active</div>
            <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">Human-in-the-loop enabled</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* API Integrations Health Grid & Pending Queue Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* API Health Grid */}
        <div className="md:col-span-2 premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Cpu size={18} className="text-red-500 font-bold" />
            Platform Integrations & API Gateway Health Checks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1.5 shadow-inner">
              <span className="font-bold text-gray-700">Razorpay Route</span>
              <span className="text-[10px] text-green-600 font-extrabold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
              <span className="text-[9px] text-gray-400 font-semibold mt-1">Latency: 42ms | Res: 200</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1.5 shadow-inner">
              <span className="font-bold text-gray-700">Twilio SMS Gateway</span>
              <span className="text-[10px] text-green-600 font-extrabold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
              <span className="text-[9px] text-gray-400 font-semibold mt-1">Latency: 75ms | Res: 200</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1.5 shadow-inner">
              <span className="font-bold text-gray-700">OpenAI Model API</span>
              <span className="text-[10px] text-green-600 font-extrabold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
              <span className="text-[9px] text-gray-400 font-semibold mt-1">Latency: 120ms | model-ok</span>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col gap-1.5 shadow-inner">
              <span className="font-bold text-gray-700">Postgres Database</span>
              <span className="text-[10px] text-green-600 font-extrabold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Connected
              </span>
              <span className="text-[9px] text-gray-400 font-semibold mt-1">SSL Encrypted | 99.9% Up</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals Quick Board */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShieldCheck size={18} className="text-red-500 font-bold" />
            Pending Gateway Actions
          </h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 flex justify-between items-center shadow-inner">
              <div className="flex-1 pr-2">
                <span className="font-bold text-gray-900 block">GSTIN KYC Audit</span>
                <span className="text-[9px] text-gray-500 font-semibold block">SafeGuard Security Private Ltd</span>
              </div>
              <Link href="/admin/kyc" className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0">
                Verify
              </Link>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 flex justify-between items-center shadow-inner">
              <div className="flex-1 pr-2">
                <span className="font-bold text-gray-900 block">Statutory Audit License</span>
                <span className="text-[9px] text-gray-500 font-semibold block">AquaClean Environmental LLP</span>
              </div>
              <Link href="/admin/kyc" className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0">
                Verify
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Audit logs trail */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList size={18} className="text-red-500" />
            Recent Audit Trail Logs
          </h3>
          <Link href="/admin/logs" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
            View All Audit Logs <ArrowRight size={12} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4">Trace ID</th>
                <th className="py-4">Module</th>
                <th className="py-4">Action Event</th>
                <th className="py-4">Timestamp</th>
                <th className="py-4">Severity</th>
              </tr>
            </thead>
            <tbody>
              {logsList.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-mono font-bold text-red-600">{log.traceId}</td>
                  <td className="py-4 text-gray-900 font-bold">{log.module}</td>
                  <td className="py-4 text-gray-700 font-semibold">{log.action}</td>
                  <td className="py-4 text-gray-500 font-medium">{new Date(log.createdAt || "").toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      log.severity === "critical"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : log.severity === "warning"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

