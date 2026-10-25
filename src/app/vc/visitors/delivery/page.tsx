"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Search,
  CheckCircle2,
  Clock,
  User,
  Building,
  Plus,
} from "lucide-react";

export default function DeliveryRegisterPage() {
  const [deliveries, setDeliveries] = useState([
    {
      id: "DEL-2026-081",
      agentName: "Sanjay Yadav",
      service: "BlueDart Express",
      trackingNo: "BD-88492019",
      recipient: "Priya Sharma (FinTech)",
      floor: "Floor 4 Suite B",
      items: "2 Hardware Servers / Courier",
      arrivedAt: "11:20 AM",
      status: "Waiting at Lobby",
    },
    {
      id: "DEL-2026-079",
      agentName: "Mohd. Irfan",
      service: "Amazon Business",
      trackingNo: "AMZ-9910401",
      recipient: "Office Admin (TechCorp)",
      floor: "Floor 8 Main Desk",
      items: "Pantry Supplies / Consumables",
      arrivedAt: "10:05 AM",
      status: "Delivered & Signed",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Delivery Register (VC-12)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Parcel & Courier Movement Log</h1>
          <p className="text-xs text-slate-400">
            Track courier delivery personnel, package references, and recipient acknowledgments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Log New Incoming Delivery")}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Log Incoming Courier</span>
        </button>
      </div>

      <div className="space-y-3">
        {deliveries.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{d.service}</span>
                  <span className="font-mono text-slate-400 text-xs font-normal">• {d.trackingNo}</span>
                </div>
                <div className="text-slate-400 mt-0.5">
                  Courier Agent: <strong className="text-slate-200">{d.agentName}</strong> ({d.items})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500">Destination:</span>
                <div className="text-slate-200 font-semibold">{d.recipient} ({d.floor})</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                d.status.includes("Delivered")
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
