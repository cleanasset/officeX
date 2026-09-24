"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Building2, Layers, CheckCircle2 } from "lucide-react";

interface DeletePropertyModalProps {
  isOpen: boolean;
  property: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    totalArea?: number;
    activeLeasesCount?: number;
  } | null;
  onClose: () => void;
  onConfirm: (propertyId: string) => Promise<void>;
}

export const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  property,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !property) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirm(property.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove property. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Remove Property</h3>
              <p className="text-xs text-rose-700">Permanent portfolio deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to remove <strong className="text-gray-900 font-bold">{property.name}</strong> from your Rent Roll portfolio?
          </p>

          {/* Property Summary Card */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Property ID
              </span>
              <span className="font-mono font-bold text-gray-800">{property.id}</span>
            </div>
            {property.city && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Location</span>
                <span className="font-semibold text-gray-800">{property.city}{property.state ? `, ${property.state}` : ""}</span>
              </div>
            )}
            {property.totalArea !== undefined && property.totalArea > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Total Area</span>
                <span className="font-semibold text-gray-800">{property.totalArea.toLocaleString("en-IN")} sq ft</span>
              </div>
            )}
            {property.activeLeasesCount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Active Leases</span>
                <span className="font-semibold text-rose-600">{property.activeLeasesCount} lease(s) attached</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <span className="font-bold shrink-0 mt-0.5">⚠️ Note:</span>
            <span>
              Removing this property will delete associated spaces, active leases, invoices, and rental schedules from your dashboard.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Removing Property..." : "Yes, Remove Property"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
