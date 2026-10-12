"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  X,
  User,
  Building2,
  DollarSign,
  Maximize2,
  Calendar,
  ShieldAlert,
  Percent,
} from "lucide-react";

export interface AgreementDiffItem {
  fieldKey: string;
  label: string;
  currentValue: string;
  agreementValue: string;
  hasVariance: boolean;
  category?: "tenant" | "commercial" | "property" | "terms";
}

interface AgreementVarianceModalProps {
  isOpen: boolean;
  fileName: string;
  differences: AgreementDiffItem[];
  onApplyAgreement: () => void;
  onKeepCurrent: () => void;
  onClose: () => void;
}

export default function AgreementVarianceModal({
  isOpen,
  fileName,
  differences,
  onApplyAgreement,
  onKeepCurrent,
  onClose,
}: AgreementVarianceModalProps) {
  if (!isOpen) return null;

  const variancesOnly = differences.filter((d) => d.hasVariance);
  const matchingItems = differences.filter((d) => !d.hasVariance);

  const getFieldIcon = (key: string) => {
    switch (key) {
      case "occupantName":
      case "occupant_id":
      case "companyName":
        return <User size={15} className="text-teal-600 shrink-0" />;
      case "propertyName":
      case "property_id":
      case "spaceName":
      case "buildingName":
        return <Building2 size={15} className="text-blue-600 shrink-0" />;
      case "monthlyRent":
      case "monthly_rent":
      case "ratePerSqft":
      case "rate_per_sqft":
      case "securityDeposit":
      case "security_deposit":
        return <DollarSign size={15} className="text-emerald-600 shrink-0" />;
      case "areaSqft":
      case "area_sqft":
        return <Maximize2 size={15} className="text-indigo-600 shrink-0" />;
      case "startDate":
      case "start_date":
      case "endDate":
      case "end_date":
      case "lockInMonths":
      case "lock_in_months":
        return <Calendar size={15} className="text-amber-600 shrink-0" />;
      case "escalationPct":
      case "escalation_pct":
        return <Percent size={15} className="text-purple-600 shrink-0" />;
      default:
        return <FileText size={15} className="text-slate-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-amber-200 shadow-2xl text-left overflow-hidden">
        {/* Top Warning Gradient Bar */}
        <div className="h-2.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
              <AlertTriangle size={20} className="text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                  Document Differences Detected
                </span>
                <span className="text-xs text-slate-500 font-semibold truncate max-w-[220px]">
                  {fileName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Agreement Variance Review
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informational Guidance Callout */}
        <div className="px-5 sm:px-7 py-3 bg-linear-to-r from-amber-50/60 to-orange-50/40 border-b border-amber-100 text-xs text-amber-950 flex items-start gap-2.5 shrink-0">
          <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            The uploaded agreement contains different particulars than what you entered (e.g. tenant name, rent, or area).
            Choose whether to update your form to match the agreement or keep your manually entered values.
          </p>
        </div>

        {/* Differences Table / Cards Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-7 py-4 flex-1 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Variances Found:{" "}
              <strong className="text-amber-700 font-black">{variancesOnly.length}</strong>
            </span>
            <span>
              Matching Terms:{" "}
              <strong className="text-emerald-700 font-black">{matchingItems.length}</strong>
            </span>
          </div>

          {variancesOnly.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <div className="font-black text-sm">Perfect Match!</div>
              <p className="text-slate-600 max-w-sm mx-auto">
                All details extracted from the rent agreement match your entered records. No discrepancies found.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {variancesOnly.map((diff) => (
                <div
                  key={diff.fieldKey}
                  className="p-3.5 rounded-2xl border-2 border-amber-200/90 bg-amber-50/30 hover:bg-amber-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 sm:w-1/3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      {getFieldIcon(diff.fieldKey)}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">
                        {diff.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                        Difference
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    {/* Current Value */}
                    <div className="border-r border-slate-100 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Your Entered Value
                      </span>
                      <span className="font-bold text-slate-700 text-xs break-words line-through decoration-rose-500/80 decoration-2">
                        {diff.currentValue || "(Empty)"}
                      </span>
                    </div>

                    {/* Agreement Value */}
                    <div className="pl-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                        <span>In Agreement</span>
                        <ArrowRight size={10} className="text-amber-500" />
                      </span>
                      <span className="font-black text-amber-900 text-xs break-words bg-amber-100/60 px-1.5 py-0.5 rounded">
                        {diff.agreementValue || "(Not specified)"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Collapsible Matching Items */}
          {matchingItems.length > 0 && (
            <details className="mt-3 group">
              <summary className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5 py-1">
                <span>View {matchingItems.length} matching terms (already identical)</span>
              </summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {matchingItems.map((item) => (
                  <div
                    key={item.fieldKey}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={12} />
                      <span className="truncate max-w-[120px]">{item.agreementValue}</span>
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
            Choosing agreement updates will highlight changed fields in{" "}
            <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              yellow
            </span>{" "}
            temporarily.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Option 1: Continue Without Changing */}
            <button
              type="button"
              onClick={onKeepCurrent}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw size={13} className="text-slate-500" />
              <span>Continue Without Changing</span>
            </button>

            {/* Option 2: Change According to Rent Agreement */}
            <button
              type="button"
              onClick={onApplyAgreement}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Sparkles size={14} className="text-slate-950" />
              <span>Change According to Rent Agreement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
