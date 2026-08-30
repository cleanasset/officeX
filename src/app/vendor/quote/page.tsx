"use client";
import React, { useState } from "react";
import { CheckCircle, Send, Clock, FileText } from "lucide-react";

export default function QuoteSubmissionForm() {
  const [items, setItems] = useState([
    { name: "Manpower Costs (Technicians)", qty: 2, rate: 25000 },
    { name: "Materials & Consumables", qty: 1, rate: 45000 },
    { name: "Equipment Charges (Spares)", qty: 1, rate: 35000 },
    { name: "Overheads & Admin Fee", qty: 1, rate: 15000 }
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const updateRate = (idx: number, rate: number) => {
    const next = [...items];
    next[idx].rate = rate;
    setItems(next);
  };

  const updateQty = (idx: number, qty: number) => {
    const next = [...items];
    next[idx].qty = qty;
    setItems(next);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  const handleSubmit = () => {
    setToast("Quotation for RFQ-089 submitted to client review portal!");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Submit Quote: RFQ-089</h1>
          <p className="text-sm text-gray-500 mt-1">Vendor Portal &gt; Matched RFQs &gt; RFQ-089 &gt; Submit Quote</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          Open for Bidding
        </span>
      </div>

      {/* Main Quote Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        {/* RFQ Context Header */}
        <div className="grid grid-cols-[1fr_340px] gap-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">DG Set Annual Maintenance Contract</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>🏢 Apex Business Tower</span>
              <span>⚡ Electrical & DG</span>
              <span className="text-red-500 font-semibold flex items-center gap-1">
                <Clock size={13} /> Closes in 2 days
              </span>
            </div>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SCOPE OF WORK</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Annual comprehensive maintenance including filters, oil changes, and 24/7 breakdown support for 3x 1010kVA DG sets.
            </p>
          </div>
        </div>

        {/* Cost Breakdown Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Cost Breakdown</h3>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_160px_140px] bg-gray-50/60 p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
              <div>ITEM DESCRIPTION</div>
              <div className="text-center">QTY / MONTH</div>
              <div className="text-center">UNIT RATE</div>
              <div className="text-right pr-4">TOTAL AMOUNT</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.name} className="grid grid-cols-[1fr_120px_160px_140px] p-4 items-center text-xs">
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateQty(idx, Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 text-center border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateRate(idx, Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0F8B7D]"
                      />
                    </div>
                  </div>
                  <span className="text-right font-bold text-gray-900 pr-4">
                    ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50/60 border-t border-gray-200 flex justify-between items-center pr-4">
              <span className="text-xs font-bold text-gray-500 pl-2">Subtotal:</span>
              <span className="text-lg font-black text-gray-900">
                ₹{subtotal.toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-400">/mo</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 px-8 shadow-sm flex items-center justify-end gap-4">
        <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50">
          Save Draft
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <Send size={13} /> Submit Quotation
        </button>
      </div>
    </div>
  );
}
