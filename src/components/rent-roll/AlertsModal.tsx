"use client";

import React from "react";
import {
  X,
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  entityType: string;
  severity: "info" | "warning" | "critical";
  isRead: boolean;
  triggerDate: string;
}

interface AlertsModalProps {
  alerts: AlertNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  alerts,
  isOpen,
  onClose,
  onMarkAllRead,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-xs flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Commercial Management Alerts</h3>
              <p className="text-xs text-gray-500 font-medium">Expiring leases, upcoming escalations &amp; overdue invoices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              All portfolio leases, invoices and escalations in perfect compliance.
            </div>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  a.severity === "critical"
                    ? "bg-rose-50/80 border-rose-200 text-rose-950"
                    : a.severity === "warning"
                    ? "bg-amber-50/80 border-amber-200 text-amber-950"
                    : "bg-blue-50/80 border-blue-200 text-blue-950"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  a.severity === "critical" ? "text-rose-600" : a.severity === "warning" ? "text-amber-600" : "text-blue-600"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-gray-950">{a.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono font-medium">{a.triggerDate}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] font-medium mt-0.5">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-gray-600 hover:text-gray-900 font-bold transition-colors cursor-pointer"
          >
            Mark all as read
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
