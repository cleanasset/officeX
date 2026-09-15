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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Commercial Management Alerts</h3>
              <p className="text-xs text-slate-400">Expiring leases, upcoming escalations & overdue invoices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All portfolio leases, invoices and escalations in perfect compliance.
            </div>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  a.severity === "critical"
                    ? "bg-red-950/30 border-red-800/50 text-red-200"
                    : a.severity === "warning"
                    ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                    : "bg-blue-950/30 border-blue-800/50 text-blue-200"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-amber-400" : "text-blue-400"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-white">{a.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.triggerDate}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Mark all as read
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
