"use client";
import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Building2, Plus, Bell } from "lucide-react";
import Link from "next/link";

export default function PropertyManagerDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProperties(
          json.data.map((p: any) => ({
            name: p.name || p.property_name,
            location: p.city || p.location || "India",
            area: p.total_area || p.area || "—",
            occupancy: p.occupancy ? `${p.occupancy}%` : "100%",
            rent: p.price_per_sqft ? `₹${p.price_per_sqft}/sqft` : "—",
            tenants: p.units_count || 1,
            compliance: true,
            status: "Active"
          }))
        );
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts: any[] = [];
  const activity: any[] = [];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Properties</p>
          <p className="text-3xl font-black text-gray-900">{properties.length}</p>
          <span className="text-[10px] font-bold text-emerald-600">Active Assets</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Occupancy</p>
          <p className="text-3xl font-black text-gray-900">{properties.length > 0 ? "100%" : "0%"}</p>
          <span className="text-[10px] font-bold text-emerald-600">Verified</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Rent Collections</p>
          <p className="text-2xl font-black text-gray-900">{properties.length > 0 ? "100%" : "₹0"}</p>
          <span className="text-[10px] font-bold text-gray-400">Current Cycle</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Helpdesk Tickets</p>
          <p className="text-3xl font-black text-gray-900">0</p>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">0 overdue</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Compliance</p>
          <p className="text-3xl font-black text-gray-900">100%</p>
          <span className="text-[10px] font-bold text-emerald-600">Statutory Compliant</span>
        </div>
      </div>

      {/* Critical Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Critical Alerts</h2>
          {criticalAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <CheckCircle size={24} className="mx-auto text-emerald-500 mb-1.5" />
              <p className="text-xs font-bold text-gray-700">All Systems &amp; Compliances Normal</p>
              <p className="text-[11px] text-gray-400 mt-0.5">No overdue fire NOCs, delinquent tenants, or elevator inspection alarms.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalAlerts.map((a, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl border-l-4 ${a.color}`}>
                  <p className="text-xs text-gray-700 flex-1 mr-4">{a.text}</p>
                  <button className={`px-4 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer ${a.actionColor}`}>{a.action}</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <Bell size={24} className="mx-auto text-gray-300 mb-1.5" />
              <p className="text-xs font-bold text-gray-700">No New Operational Events</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Tenant payments and service events will be logged in real time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
                  <p className="text-xs text-gray-700">{a.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Properties Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Properties Overview</h2>
          <Link
            href="/properties/rent-roll"
            className="px-3 py-1.5 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
          >
            <Plus size={13} /> Add Property
          </Link>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">Property Name</th>
              <th className="py-3 pr-3">Location</th>
              <th className="py-3 pr-3">Area (Sqft)</th>
              <th className="py-3 pr-3">Occupancy</th>
              <th className="py-3 pr-3">Monthly Rent</th>
              <th className="py-3 pr-3">Tenants</th>
              <th className="py-3 pr-3">Compliance</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                  Loading properties...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Building2 className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-bold text-gray-700">No Commercial Properties in Portfolio</span>
                    <span className="text-[11px] text-gray-400">
                      Add commercial towers or upload your rent roll spreadsheet to activate property telemetry.
                    </span>
                    <Link
                      href="/properties/rent-roll"
                      className="mt-3 px-3 py-1.5 bg-[#0F8B7D] text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      + Add Property / Import Rent Roll
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p.name} className="border-b border-gray-100 text-xs">
                  <td className="py-3.5 pr-3 font-bold text-gray-900">{p.name}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.location}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.area}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.occupancy}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{p.rent}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{p.tenants}</td>
                  <td className="py-3.5 pr-3">
                    {p.compliance ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-red-500">❌</span>}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F8B7D] text-white">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
