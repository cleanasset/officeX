"use client";

import React, { useState } from "react";
import {
  X,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Building2,
  Percent,
  FileCheck2,
  ShieldCheck,
  DollarSign
} from "lucide-react";
import { EnrichedLease } from "./MasterGridTab";
import { formatINR } from "./DashboardTab";

interface ApplyEscalationModalProps {
  lease: EnrichedLease | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyEscalationModal: React.FC<ApplyEscalationModalProps> = ({
  lease,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [notes, setNotes] = useState("Contractual escalation approved and applied per registered lease agreement.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen || !lease) return null;

  const escalationPct = lease.escalationPct || 15;
  const currentRent = lease.monthlyRent;
  const currentRentPsf = lease.baseRentPsf;
  const escalationMultiplier = 1 + escalationPct / 100;
  const newRent = Math.round(currentRent * escalationMultiplier);
  const newRentPsf = Math.round(currentRentPsf * escalationMultiplier * 100) / 100;
  const monthlyIncrement = newRent - currentRent;
  const annualIncrement = monthlyIncrement * 12;

  const handleApply = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/rent-roll/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          action: "apply",
          customNewRent: newRent,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to apply escalation");
      }

      setSuccessMsg(`Escalation of +${escalationPct}% applied successfully! New base rent: ${formatINR(newRent)}/mo`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Error applying escalation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/60 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 text-[#0F8B7D] rounded-xl border border-teal-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">Apply Compounding Rent Escalation</h3>
              <p className="text-xs text-gray-500 font-medium">Contractual rate increase &amp; ledger update</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Lease Context Summary */}
          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 text-sm">{lease.tenantName}</span>
              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {lease.leaseCode}
              </span>
            </div>
            <p className="text-gray-500">{lease.propertyName} • Floor {lease.floorNumber} • Unit {lease.unitNumber} ({lease.chargeableArea.toLocaleString('en-IN')} sq ft)</p>
          </div>

          {/* Before & After Comparison Bento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Current Contract Rent</span>
              <div className="text-base font-black text-gray-900 font-mono">{formatINR(currentRent)}/mo</div>
              <p className="text-[11px] text-gray-600 font-mono">₹{currentRentPsf.toFixed(2)} PSF</p>
            </div>

            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">New Escalated Rent</span>
                <span className="text-[10px] font-extrabold bg-[#0F8B7D] text-white px-1.5 py-0.2 rounded">
                  +{escalationPct}%
                </span>
              </div>
              <div className="text-base font-black text-[#0F8B7D] font-mono">{formatINR(newRent)}/mo</div>
              <p className="text-[11px] text-teal-700 font-mono">₹{newRentPsf.toFixed(2)} PSF</p>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between font-medium text-emerald-900">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Net Monthly Revenue Increase:</span>
            </div>
            <span className="font-mono font-bold text-emerald-800">+{formatINR(monthlyIncrement)}/mo</span>
          </div>

          {/* Escalation Terms Details */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Next Escalation Due Date:</span>
              <span className="font-mono font-bold text-gray-900">{lease.nextEscalationDate || "2026-10-01"}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frequency:</span>
              <span className="font-semibold text-gray-800">Every {lease.escalationFrequencyMonths || 36} Months (Compounding)</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-gray-700 font-semibold">Audit Approval Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Updating Ledger..." : `Confirm & Apply (+${escalationPct}%)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
