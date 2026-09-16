"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Calendar,
  Building,
  FileText,
  ShieldAlert,
  Send
} from "lucide-react";
import { EnrichedLease } from "./MasterGridTab";

interface ServeNoticeModalProps {
  lease: EnrichedLease | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServeNoticeModal: React.FC<ServeNoticeModalProps> = ({
  lease,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState("2026-11-30");
  const [noticeReason, setNoticeReason] = useState<string>("lease_expiry");
  const [initiatedBy, setInitiatedBy] = useState<string>("tenant");
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("Standard lease exit notice served.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !lease) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          noticeDate,
          effectiveDate,
          noticeReason,
          initiatedBy,
          penaltyAmount,
          remarks,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to serve notice");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Serve Lease Vacation Notice</h3>
              <p className="text-xs text-gray-500 font-medium">Updates lease status to Under Notice and triggers exit pipeline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Lease Summary */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-gray-950">{lease.tenantName}</span>
            <span className="font-mono text-indigo-700 font-bold">{lease.leaseCode}</span>
          </div>
          <p className="text-gray-500 font-medium">
            {lease.propertyName} • {lease.unitNumber} ({lease.chargeableArea.toLocaleString()} sqft)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-gray-700">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Notice Served Date *</label>
              <input
                type="date"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Effective Vacation Date *</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Initiated By *</label>
              <select
                value={initiatedBy}
                onChange={(e) => setInitiatedBy(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs cursor-pointer font-medium"
              >
                <option value="tenant">Tenant Initiated</option>
                <option value="landlord">Landlord Initiated</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Primary Exit Reason *</label>
              <select
                value={noticeReason}
                onChange={(e) => setNoticeReason(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none shadow-2xs cursor-pointer font-medium"
              >
                <option value="lease_expiry">Standard Lease Expiry</option>
                <option value="relocation">Corporate Relocation</option>
                <option value="downsizing">Team Downsizing</option>
                <option value="cost">Cost Rationalization</option>
                <option value="dispute">Commercial Dispute</option>
                <option value="other">Other Commercial Reason</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Lock-In Breach Penalty (₹)</label>
            <input
              type="number"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 focus:border-[#0F8B7D] focus:outline-none font-mono shadow-2xs"
              placeholder="0 if lock-in expired"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Remarks &amp; Commercial Handover Notes</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl p-3 focus:border-[#0F8B7D] focus:outline-none shadow-2xs font-medium"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Serve Vacation Notice"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
