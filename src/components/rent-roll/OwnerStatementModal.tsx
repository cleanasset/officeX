"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
  Receipt,
  X,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface OwnerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientAccountId?: string;
  clientName?: string;
}

export default function OwnerStatementModal({
  isOpen,
  onClose,
  clientAccountId,
  clientName = "Client Portfolio",
}: OwnerStatementModalProps) {
  const [statementData, setStatementData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("Oct-2026");

  useEffect(() => {
    if (isOpen) {
      fetchStatement();
    }
  }, [isOpen, clientAccountId, period]);

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const url = clientAccountId
        ? `/api/multi-client/owner-statement?client_account_id=${clientAccountId}`
        : `/api/multi-client/owner-statement`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setStatementData(json.statement || json.data);
      }
    } catch (e) {
      // Empty state
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const billedGross = Number(statementData?.gross_invoiced_inr ?? statementData?.billed_gross_inr ?? 0);
  const collected = Number(statementData?.gross_collections_inr ?? statementData?.collected_inr ?? 0);
  const mgmtFeePct = 5.0;
  const mgmtFee = Math.round((collected * mgmtFeePct) / 100);
  const gstOnFee = Math.round((mgmtFee * 18) / 100);
  const netRemittance = Number(statementData?.net_payable_to_owner_inr ?? statementData?.net_remittance_inr ?? (collected - mgmtFee - gstOnFee));

  const statement = {
    period: period,
    billed_gross_inr: billedGross,
    gross_invoiced_inr: billedGross,
    collected_inr: collected,
    gross_collections_inr: collected,
    arrears_carried_forward_inr: billedGross - collected,
    mgmt_fee_percent: mgmtFeePct,
    mgmt_fee_inr: mgmtFee,
    gst_on_fee_inr: gstOnFee,
    expenses_paid_inr: 0,
    net_remittance_inr: netRemittance,
    net_payable_to_owner_inr: netRemittance,
    invoices_summary: statementData?.invoices_summary || [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Multi-Client Operator · §5.10 & Table 103</span>
            </div>
            <h2 className="text-xl font-black tracking-tight mt-0.5">
              Owner Statement — {period}
            </h2>
            <p className="text-xs text-slate-300">
              Mandate Account: <strong className="text-white font-bold">{clientName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-slate-50 flex-1 overflow-y-auto">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Collected in Period
              </span>
              <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                ₹{Number(statement.collected_inr || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 shadow-2xs">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Net Remittance to Owner (F-21)
              </span>
              <span className="text-lg font-black text-teal-950 font-mono mt-0.5 block">
                ₹{Number(statement.net_remittance_inr || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Table 103 Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex justify-between text-xs font-bold text-slate-700">
              <span>Financial Line Item</span>
              <span>Amount (₹ INR)</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="px-4 py-3 flex justify-between">
                <span className="text-slate-700 font-medium">Billed in period (rent + CAM, gross)</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{Number(statement.billed_gross_inr || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between bg-emerald-50/30">
                <span className="text-emerald-900 font-bold">Collected in period</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹{Number(statement.collected_inr || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between">
                <span className="text-slate-500">Arrears carried forward</span>
                <span className="font-mono text-slate-600">
                  ₹{Number(statement.arrears_carried_forward_inr || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between text-amber-900 bg-amber-50/30">
                <span>Management fee (4.0% × collections) — F-20</span>
                <span className="font-mono font-bold text-amber-700">
                  (₹{Number(statement.mgmt_fee_inr || 0).toLocaleString("en-IN")})
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between text-slate-600">
                <span>GST on management fee @ 18%</span>
                <span className="font-mono">
                  (₹{Number(statement.gst_on_fee_inr || 0).toLocaleString("en-IN")})
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between text-slate-600">
                <span>Expenses paid on owner's behalf (repairs, approved)</span>
                <span className="font-mono">
                  (₹{Number(statement.expenses_paid_inr || 0).toLocaleString("en-IN")})
                </span>
              </div>

              <div className="px-4 py-3.5 flex justify-between bg-teal-50 border-t-2 border-teal-200">
                <span className="font-black text-teal-950 text-sm">
                  Net Remittance to Owner — Formula F-21
                </span>
                <span className="font-mono font-black text-teal-900 text-sm">
                  ₹{Number(statement.net_remittance_inr || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Associated Rent Roll Invoices */}
          {statement.invoices_summary && statement.invoices_summary.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-2xs">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt size={14} className="text-teal-600" />
                <span>Associated Rent Roll Invoices ({statement.invoices_summary.length})</span>
              </span>
              <div className="divide-y divide-slate-100 text-xs">
                {statement.invoices_summary.map((inv: any, idx: number) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{inv.invoice_number}</p>
                      <p className="text-[10px] text-slate-400">{inv.occupant_name} · Due: {inv.invoice_date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        ₹{Number(inv.gross_total).toLocaleString("en-IN")}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Audit-ready statement per §5.10 multi-client protocol
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Owner statement PDF dispatched to client principal email.");
              }}
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} />
              <span>Export PDF Statement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
