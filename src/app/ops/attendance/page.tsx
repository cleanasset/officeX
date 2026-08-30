"use client";
import React, { useState } from "react";
import { Search, Filter, Calendar, Users, UserCheck, UserX, Clock } from "lucide-react";

export default function StaffAttendanceDashboard() {
  const [date, setDate] = useState("Oct 24, 2023");
  const [search, setSearch] = useState("");

  const kpis = [
    { label: "PRESENT", value: "42", sub: "/ 48", icon: <UserCheck size={18} className="text-emerald-500" />, bar: 87.5 },
    { label: "ON LEAVE", value: "4", icon: <Calendar size={18} className="text-amber-500" /> },
    { label: "ABSENT", value: "2", icon: <UserX size={18} className="text-rose-500" /> },
    { label: "OVERTIME HOURS", value: "14", sub: "hrs today", icon: <Clock size={18} className="text-blue-500" /> }
  ];

  const roster = [
    { name: "Ramesh Kumar", desig: "Electrician", property: "Apex Tower", shift: "Morning", in: "06:05 AM", out: "02:00 PM", hrs: "8h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Sunita Devi", desig: "Housekeeping", property: "Apex Tower", shift: "Morning", in: "06:10 AM", out: "02:05 PM", hrs: "7.9h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Anil Sharma", desig: "HVAC Tech", property: "Meridian Park", shift: "Afternoon", in: "-", out: "-", hrs: "-", status: "On Leave", stClass: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Vijay Dev", desig: "Security Guard", property: "Nexus Hub", shift: "Night", in: "-", out: "-", hrs: "-", status: "Absent", stClass: "bg-rose-50 text-rose-600 border-rose-200 font-bold" },
    { name: "Mohammed Ali", desig: "Plumber", property: "Nexus Hub", shift: "General", in: "09:00 AM", out: "Active", hrs: "4h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Kavita Rao", desig: "Receptionist", property: "Meridian Park", shift: "General", in: "08:55 AM", out: "Active", hrs: "4.1h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Prakash Singh", desig: "Elevator Tech", property: "Apex Tower", shift: "Afternoon", in: "01:50 PM", out: "Active", hrs: "0.5h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Deepak Verma", desig: "Security Guard", property: "Apex Tower", shift: "Morning", in: "05:45 AM", out: "02:15 PM", hrs: "8.5h", status: "Present", stClass: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Staff Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time facility staff attendance tracking and duty rosters.</p>
        </div>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
        >
          <option>Oct 24, 2023</option>
          <option>Oct 23, 2023</option>
          <option>Oct 22, 2023</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                {k.icon}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-black text-gray-900">
                {k.value} {k.sub && <span className="text-xs font-normal text-gray-500">{k.sub}</span>}
              </p>
              {k.bar && (
                <div className="w-full h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                  <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: `${k.bar}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Today&apos;s Roster</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D] w-52"
              />
            </div>
            <button className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-50">
              <Filter size={13} /> Filter
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3">STAFF NAME</th>
              <th className="py-3">DESIGNATION</th>
              <th className="py-3">PROPERTY</th>
              <th className="py-3">SHIFT</th>
              <th className="py-3">CHECK-IN</th>
              <th className="py-3">CHECK-OUT</th>
              <th className="py-3">HOURS</th>
              <th className="py-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.name} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-3.5 font-bold text-gray-900">{r.name}</td>
                <td className="py-3.5 text-gray-600">{r.desig}</td>
                <td className="py-3.5 text-gray-600">{r.property}</td>
                <td className="py-3.5 text-gray-600">{r.shift}</td>
                <td className="py-3.5 text-gray-700 font-mono">{r.in}</td>
                <td className="py-3.5 text-gray-700 font-mono">{r.out}</td>
                <td className="py-3.5 font-semibold text-gray-900">{r.hrs}</td>
                <td className="py-3.5 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${r.stClass}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
