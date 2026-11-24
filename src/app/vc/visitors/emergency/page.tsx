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
  Loader2,
} from "lucide-react";

interface Evacuee {
  visitId: string;
  name: string;
  company: string;
  mobile: string;
  hostName: string;
  floor: string;
  zoneId: string;
  checkinAt: string;
  visitorType: string;
  status: "inside" | "safe" | "missing";
}

export default function EmergencyRollCallPage() {
  const [alarmActive, setAlarmActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [evacuees, setEvacuees] = useState<Evacuee[]>([]);

  const fetchLiveEvacuees = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors/emergency?orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.occupants)) {
        setEvacuees(
          json.occupants.map((occ: any) => ({
            visitId: occ.visitId,
            name: occ.name,
            company: occ.company || "Individual",
            mobile: occ.mobile,
            hostName: occ.hostName || "Reception",
            floor: occ.floor || "Lobby",
            zoneId: occ.zoneId || "Main Building",
            checkinAt: occ.checkinAt,
            visitorType: occ.visitorType,
            status: "inside",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching emergency list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEvacuees();
  }, []);

  const total = evacuees.length;
  const safeCount = evacuees.filter((e) => e.status === "safe").length;
  const missingCount = evacuees.filter((e) => e.status === "missing").length;
  const unverifiedCount = evacuees.filter((e) => e.status === "inside").length;

  const markStatus = (visitId: string, status: "safe" | "missing" | "inside") => {
    setEvacuees((prev) =>
      prev.map((e) => (e.visitId === visitId ? { ...e, status } : e))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Name,Company,Mobile,Host,Floor,Zone,Evacuation Status",
        ...evacuees.map(
          (e) =>
            `"${e.name}","${e.company}","${e.mobile}","${e.hostName}","${e.floor}","${e.zoneId}","${e.status.toUpperCase()}"`
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `officex_evacuation_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = evacuees.filter((e) => {
    if (selectedFloor === "all") return true;
    return (e.floor || "").includes(selectedFloor);
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Alarm Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/80 border-2 border-rose-500 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-slate-950 px-2 py-0.5 rounded">
                INCIDENT RESPONSE MODE
              </span>
              <span className="text-xs text-rose-300 font-mono">CODE RED EVACUATION</span>
            </div>
            <h1 className="text-xl font-black text-white mt-0.5">Emergency Roll Call & Accountability</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLiveEvacuees}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Headcount</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {/* KPI Tally Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total On-Site</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active checked-in visitors</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-bold">Marked Safe</div>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{safeCount}</div>
          <div className="text-[11px] text-emerald-400/70 mt-0.5">Verified at assembly point</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
          <div className="text-xs text-rose-400 font-bold">Unaccounted / Missing</div>
          <div className="text-2xl font-black text-rose-300 font-mono mt-1">{missingCount}</div>
          <div className="text-[11px] text-rose-400/70 mt-0.5">Action team dispatched</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <div className="text-xs text-amber-400 font-bold">Pending Status</div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">{unverifiedCount}</div>
          <div className="text-[11px] text-amber-400/70 mt-0.5">Awaiting floor warden check</div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Filter Floor / Core:</span>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
          >
            <option value="all">All Locations</option>
            <option value="Floor 8">Floor 8</option>
            <option value="Floor 4">Floor 4</option>
            <option value="Lobby">Lobby</option>
            <option value="Service">Service Core</option>
          </select>
        </div>

        <div className="text-slate-400">
          Showing: <span className="text-white font-mono font-bold">{filtered.length}</span> occupants
        </div>
      </div>

      {/* Manifest Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Visitor & Entity</th>
              <th className="py-3 px-4">Phone / Contact</th>
              <th className="py-3 px-4">Host Person</th>
              <th className="py-3 px-4">Floor / Zone</th>
              <th className="py-3 px-4">Tally Status</th>
              <th className="py-3 px-4 text-right">Floor Warden Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading && evacuees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-400 mb-2" />
                  <div>Loading live occupants for evacuation roll call...</div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((person) => (
                <tr key={person.visitId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{person.name}</div>
                    <div className="text-slate-400 text-[11px]">{person.company} • {person.visitorType?.toUpperCase()}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <a href={`tel:${person.mobile}`} className="hover:text-blue-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{person.mobile}</span>
                    </a>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{person.hostName}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-white font-medium">{person.floor}</div>
                    <div className="text-slate-500 text-[11px]">{person.zoneId}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                        person.status === "safe"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : person.status === "missing"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {person.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => markStatus(person.visitId, "safe")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        person.status === "safe"
                          ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                          : "bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-700"
                      }`}
                    >
                      Safe
                    </button>
                    <button
                      type="button"
                      onClick={() => markStatus(person.visitId, "missing")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        person.status === "missing"
                          ? "bg-rose-500 text-slate-950 font-black shadow-md"
                          : "bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700"
                      }`}
                    >
                      Missing
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                  <div>All clear! No visitors or contractors currently inside this building zone.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
