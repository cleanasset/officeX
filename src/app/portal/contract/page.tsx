"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Building2,
  Layers,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Download,
  CheckCircle2,
  Tag,
  Key
} from "lucide-react";

export default function TenantContractPage() {
  const [contractData, setContractData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContract();

    const handleOccChange = () => {
      loadContract();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadContract() {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/contract");
      const json = await res.json();
      if (json.success) {
        setContractData(json.contract);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Lease Agreement Terms...</p>
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-3">
        <FileText size={40} className="text-slate-300 mx-auto" />
        <h3 className="text-base font-black text-slate-900">No Active Lease Contract Found</h3>
        <p className="text-xs text-slate-500">
          Your organization does not currently have an active signed lease agreement registered in the portal.
        </p>
      </div>
    );
  }

  const c = contractData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commercial Lease Summary</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
              {c.status || "Active"}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Contract Code: <span className="font-bold text-slate-700">{c.contract_code}</span> · Reference Agreement
          </p>
        </div>

        <Link
          href="/portal/documents"
          className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <FileText size={14} /> View Executed Agreement
        </Link>
      </div>

      {/* Primary Key Terms Card (§T-06 Wireframe) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Demised Premises & Spatial Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Property</span>
            <span className="text-sm font-black text-slate-900 block mt-1">{c.property_name}</span>
            <span className="text-[11px] text-slate-500">{c.property_city || "Commercial CBD"}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Premises Unit</span>
            <span className="text-sm font-black text-slate-900 block mt-1">{c.space_name}</span>
            <span className="text-[11px] text-slate-500">{c.building_name} · {c.floor_name || "Floor"}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chargeable Area</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {Number(c.chargeable_area_sqft || 0).toLocaleString("en-IN")} sq.ft.
            </span>
            <span className="text-[11px] text-slate-500">Basis: Chargeable Area</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carpet Usable Area</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {Number(c.carpet_area_sqft || 0).toLocaleString("en-IN")} sq.ft.
            </span>
            <span className="text-[11px] text-slate-500">Efficiency: ~82%</span>
          </div>
        </div>

        {/* Tenure & Milestones */}
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 pt-4 border-t border-slate-100">
          Tenure & Notice Covenants
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commencement</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {c.commencement_date ? new Date(c.commencement_date).toLocaleDateString("en-IN") : "Active"}
            </span>
            <span className="text-[11px] text-slate-500">Tenure: {c.tenure_months || 36} Months</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lease Expiry Date</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString("en-IN") : "Permanent"}
            </span>
            <span className="text-[11px] text-slate-500">Notice window: 90 days before</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lock-In Period</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {c.lock_in_months ? `${c.lock_in_months} Months` : "None"}
            </span>
            <span className="text-[11px] text-slate-500">
              Ends: {c.lock_in_end_date ? new Date(c.lock_in_end_date).toLocaleDateString("en-IN") : "Completed"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notice Period</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {c.notice_period_months ? `${c.notice_period_months} Months` : "3 Months"}
            </span>
            <span className="text-[11px] text-slate-500">Exit notice requirement</span>
          </div>
        </div>

        {/* Financial Terms & Escalation */}
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 pt-4 border-t border-slate-100">
          Financial Obligations & Rate Escalation (§T-06)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
              Monthly Base Rent
            </span>
            <div className="text-2xl font-black text-indigo-950">
              ₹{Number(c.monthly_base_rent_inr || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-indigo-700 font-medium">Billed advance on 1st of each month</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Security Deposit Held
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(c.deposit_amount_inr || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Status: {c.deposit_status || "Held in Escrow"}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Next Scheduled Escalation
            </span>
            <div className="text-2xl font-black text-slate-900">
              {c.next_escalation ? `+${c.next_escalation.escalation_value || 5}%` : "No pending step"}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Effective:{" "}
              {c.next_escalation?.effective_date
                ? new Date(c.next_escalation.effective_date).toLocaleDateString("en-IN")
                : "None"}
            </p>
          </div>
        </div>

        {/* Charges Breakdown with "Included" Tags */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Contracted Charge Schedule
          </span>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Charge Category</th>
                  <th className="py-2.5 px-4">Calculation Basis</th>
                  <th className="py-2.5 px-4">Contracted Rate</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {c.charges.map((ch: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {ch.charge_type_code.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ch.calc_basis === "per_area"
                        ? "₹ / sq.ft. / month"
                        : ch.calc_basis === "fixed"
                        ? "Fixed Monthly Sum"
                        : ch.calc_basis}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {ch.is_included ? "Included in Base" : `₹${Number(ch.rate).toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ch.is_included ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Included
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                          Billed Monthly
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
