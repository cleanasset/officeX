"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Building,
  Phone,
  Clock,
  ChevronLeft,
  RefreshCw,
  HardHat,
} from "lucide-react";

interface Evacuee {
  id: string;
  name: string;
  company: string;
  mobile: string;
  hostName: string;
  floor: string;
  zone: string;
  checkinTime: string;
  type: string;
  status: "inside" | "safe" | "missing";
}

export default function EmergencyRollCallPage() {
  const [alarmActive, setAlarmActive] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [evacuees, setEvacuees] = useState<Evacuee[]>([
    {
      id: "1",
      name: "Vikram Malhotra",
      company: "Apex Global Advisory",
      mobile: "+91 98201 11223",
      hostName: "Arun Jaitley (Director)",
      floor: "Floor 8",
      zone: "Executive Suite 801",
      checkinTime: "10:15 AM",
      type: "Client",
      status: "inside",
    },
    {
      id: "2",
      name: "Neha Agarwal",
      company: "FinTech Innovations",
      mobile: "+91 98112 33445",
      hostName: "Neha Agarwal (HR Head)",
      floor: "Floor 4",
      zone: "Meeting Room 4B",
      checkinTime: "10:40 AM",
      type: "Guest",
      status: "inside",
    },
    {
      id: "3",
      name: "Ramesh Kumar",
      company: "Otis Elevator India",
      mobile: "+91 97110 55667",
      hostName: "Rajesh Verma (FM Lead)",
      floor: "Service Core",
      zone: "Lift Machine Room #3",
      checkinTime: "09:30 AM",
      type: "Contractor",
      status: "inside",
    },
  ]);

  const total = evacuees.length;
  const safeCount = evacuees.filter((e) => e.status === "safe").length;
  const missingCount = evacuees.filter((e) => e.status === "missing").length;
  const unverifiedCount = evacuees.filter((e) => e.status === "inside").length;

  const markStatus = (id: string, status: "safe" | "missing" | "inside") => {
    setEvacuees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Company,Mobile,Host,Floor,Zone,Evacuation Status",
        ...evacuees.map(
          (e) =>
            `"${e.name}","${e.company}","${e.mobile}","${e.hostName}","${e.floor}","${e.zone}","${e.status.toUpperCase()}"`
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Evacuation_Manifest_CyberCity_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = evacuees.filter((e) =>
    selectedFloor === "all" ? true : e.floor.includes(selectedFloor)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-rose-400 font-bold">Emergency Evacuation (VC-13)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500 animate-bounce" />
            <span>Emergency Roll Call & Evacuation Manifest</span>
          </h1>
          <p className="text-xs text-slate-400">
            Live headcount of active occupants and contractors inside CyberCity Tech Tower A.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Manifest</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export for Fire Dept</span>
          </button>
        </div>
      </div>

      {/* Emergency Status Banner */}
      <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/50 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div>
              <div className="text-sm font-black text-rose-300 uppercase tracking-wider">
                Emergency Evacuation Protocol Activated
              </div>
              <div className="text-xs text-rose-200/80">
                Turnstiles are in fail-safe open mode. Fire Marshals active at Assembly Point 1 & 2.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEvacuees((prev) => prev.map((e) => ({ ...e, status: "safe" })));
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              Mark All Safe at Assembly
            </button>
          </div>
        </div>

        {/* 3 Count Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total People Inside</div>
            <div className="text-3xl font-black text-white mt-1">{total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Occupants & Contractors</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
            <div className="text-xs text-emerald-300 uppercase font-semibold">Accounted Safe</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">{safeCount}</div>
            <div className="text-[10px] text-emerald-500 mt-0.5">Verified at Assembly Area</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-center">
            <div className="text-xs text-rose-300 uppercase font-semibold">Unverified / Trapped</div>
            <div className="text-3xl font-black text-rose-400 mt-1">{unverifiedCount + missingCount}</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Immediate Rescue Priority</div>
          </div>
        </div>
      </div>

      {/* Evacuee List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="text-sm font-extrabold text-white">
            Site Roster by Floor & Assigned Zone
          </div>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Locations ({evacuees.length})</option>
            <option value="Floor 8">Floor 8</option>
            <option value="Floor 4">Floor 4</option>
            <option value="Service">Service Core</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((e) => (
            <div
              key={e.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                e.status === "safe"
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : e.status === "missing"
                  ? "bg-rose-950/40 border-rose-500/60 animate-pulse"
                  : "bg-slate-950/80 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  e.type === "Contractor"
                    ? "bg-amber-900/60 text-amber-300 border border-amber-500/40"
                    : "bg-blue-900/60 text-blue-300 border border-blue-500/40"
                }`}>
                  {e.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{e.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {e.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {e.company} • Host: <span className="text-slate-300 font-medium">{e.hostName}</span>
                  </div>
                </div>
              </div>

              {/* Location Badge */}
              <div className="text-xs space-y-0.5">
                <div className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>{e.floor}</span>
                </div>
                <div className="text-slate-500 text-[11px]">{e.zone}</div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => markStatus(e.id, "safe")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    e.status === "safe"
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                      : "bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Safe</span>
                </button>

                <button
                  type="button"
                  onClick={() => markStatus(e.id, "missing")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    e.status === "missing"
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                      : "bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Missing / Trapped</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
