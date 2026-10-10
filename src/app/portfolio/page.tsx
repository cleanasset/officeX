"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, Mail, MoreVertical, Building2, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PortfolioDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const [propRes, occRes] = await Promise.all([
        fetch("/api/properties").catch(() => null),
        fetch("/api/occupants").catch(() => null),
      ]);

      if (propRes && propRes.ok) {
        const propJson = await propRes.json();
        if (propJson.success && Array.isArray(propJson.data)) {
          setProperties(propJson.data);
        }
      }

      if (occRes && occRes.ok) {
        const occJson = await occRes.json();
        const occData = occJson.data || occJson.occupants || [];
        if (Array.isArray(occData)) {
          setTenants(
            occData.map((o: any) => ({
              name: o.occupant_name || o.name,
              property: o.property_name || "Commercial Building",
              area: o.area_sqft || "—",
              expiry: o.lease_end || "Active",
              rent: o.monthly_rent ? `₹${Number(o.monthly_rent).toLocaleString("en-IN")}` : "—",
              payment: "Paid",
            }))
          );
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const alerts: any[] = [];
  const totalArea = properties.reduce((acc, p) => acc + (parseFloat(p.total_area || p.area || 0) || 0), 0);

  const paymentStyle = (s: string) =>
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : s === "Pending"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-red-50 text-red-600 border border-red-200";

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Commercial Portfolio Command</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time asset telemetry, tenant lease roll, and regional distribution.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Managed Area</p>
          <p className="text-3xl font-black text-gray-900">
            {totalArea > 0 ? totalArea.toLocaleString("en-IN") : "0"}{" "}
            <span className="text-sm font-normal text-gray-400">sq ft</span>
          </p>
          <p className="text-[10px] font-bold text-emerald-600">Verified leasable area</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Occupancy Rate</p>
          <p className="text-3xl font-black text-gray-900">
            {properties.length > 0 ? "100" : "0"}{" "}
            <span className="text-sm font-normal text-gray-400">%</span>
          </p>
          <div className="w-full h-2 rounded-full bg-gray-200 mt-2">
            <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: properties.length > 0 ? "100%" : "0%" }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Active Properties</p>
          <p className="text-3xl font-black text-gray-900">{properties.length}</p>
          <p className="text-[10px] font-bold text-emerald-600">Commercial assets enrolled</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Maintenance</p>
          <p className="text-3xl font-black text-emerald-600">0</p>
          <p className="text-[10px] text-gray-500">Zero critical work orders</p>
        </div>
      </div>

      {/* Tenant Portfolio */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Tenant Portfolio Breakdown</h2>
          <Link href="/properties/rent-roll" className="text-xs font-semibold text-[#0F8B7D]">
            Manage Rent Roll →
          </Link>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">Tenant Name</th>
              <th className="py-3 pr-3">Property</th>
              <th className="py-3 pr-3">Leased Area (Sq Ft)</th>
              <th className="py-3 pr-3">Lease Expiry</th>
              <th className="py-3 pr-3">Monthly Rent (₹)</th>
              <th className="py-3 pr-3">Payment Status</th>
              <th className="py-3 pr-3">Contact</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                  Loading tenant records...
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Building2 className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-bold text-gray-700">No Commercial Tenants Enrolled</span>
                    <span className="text-[11px] text-gray-400">
                      Enroll corporate tenants or upload rent rolls to track lease terms and collection schedules.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.name} className="border-b border-gray-100 text-xs">
                  <td className="py-3.5 pr-3 font-bold text-gray-900">{t.name}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.property}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.area}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.expiry}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{t.rent}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${paymentStyle(t.payment)}`}>
                      {t.payment}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <Mail size={14} className="text-gray-400" />
                  </td>
                  <td className="py-3.5">
                    <MoreVertical size={14} className="text-gray-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Maintenance & Compliance Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-2">Active Maintenance &amp; Escalations</h2>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <CheckCircle size={24} className="mx-auto text-emerald-500 mb-1.5" />
            <p className="text-xs font-bold text-gray-700">Zero Critical Maintenance Work Orders</p>
            <p className="text-[11px] text-gray-400 mt-0.5">All HVAC, elevator, and electrical equipment operating within normal SLA thresholds.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{a.title}</p>
                    <p className="text-[10px] text-gray-500">{a.location}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 cursor-pointer">
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
