"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Star, CheckCircle, Clock, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { RFQItem, RFQQuote } from "@/lib/rfq-store";

function VendorQuotationsContent() {
  const searchParams = useSearchParams();
  const rfqParam = searchParams.get("id") || searchParams.get("rfqId") || "RFQ-2026-8842";

  const [currentRfq, setCurrentRfq] = useState<RFQItem | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadQuotes() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/rfqs?id=${rfqParam}`);
        const data = await res.json();
        if (data.success && data.rfq) {
          setCurrentRfq(data.rfq);
          if (data.rfq.quotes && data.rfq.quotes.length > 0) {
            setSelected([data.rfq.quotes[0].vendorName]);
          }
        }
      } catch (err) {
        console.error("Failed to load RFQ quotes:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuotes();
  }, [rfqParam]);

  const toggleSelect = (vendor: string) => {
    setSelected((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]
    );
  };

  const handleExportAll = () => {
    if (!currentRfq || !currentRfq.quotes || currentRfq.quotes.length === 0) return;
    const csvContent = [
      "Quote ID,Vendor Name,Score,Bid Amount,Monthly Gross,Emergency SLA,Statutory Compliance,Timeline",
      ...currentRfq.quotes.map(
        (q) =>
          `"${q.id}","${q.vendorName}","${q.score}","${q.bidAmount}","${q.grossAmount}","${q.emergencySla}","${q.statutoryCompliance}","${q.timeline}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OfficeX_Quotes_${currentRfq.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded official tender quotations package (.CSV)");
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#0F8B7D]" />
        <p className="text-xs font-bold text-gray-500">Loading vendor quotations...</p>
      </div>
    );
  }

  const quotes = currentRfq?.quotes || [];

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/marketplace/rfq"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to RFQ Directory
        </Link>
      </div>

      {/* RFQ Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200 font-mono">
              {currentRfq?.id}
            </span>
            <h1 className="text-xl font-black text-gray-900">{currentRfq?.title}</h1>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>📍 {currentRfq?.property}</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {quotes.length} quote{quotes.length !== 1 ? "s" : ""} received
            </span>
            <span className="flex items-center gap-1 text-red-500 font-semibold">
              <Clock size={13} /> Deadline: {currentRfq?.deadline}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#0F8B7D] hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={14} /> Download All (.CSV)
          </button>
          <Link
            href={`/marketplace/compare?id=${currentRfq?.id}`}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md"
          >
            Decision Matrix ⇄
          </Link>
        </div>
      </div>

      {/* Vendor Quote Cards */}
      <div className="flex flex-col gap-4">
        {quotes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-xs text-gray-500">
            No quotations registered yet for this tender. Matching trade vendors will bid shortly.
          </div>
        ) : (
          quotes.map((q) => (
            <div key={q.id} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 shadow-2xs hover:shadow-md transition-shadow">
              {/* Vendor Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-black text-gray-900">{q.vendorName}</h2>
                  {q.verified && <CheckCircle size={18} className="text-[#0F8B7D]" />}
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${q.tagColor}`}>
                    {q.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                    <Star size={13} className="text-amber-500 fill-amber-500" /> Score: {q.score} / 100
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">SLA: {q.emergencySla}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-emerald-700 font-semibold">{q.statutoryCompliance}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manpower</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.manpower}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Materials</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.materials}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timeline</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.timeline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warranty</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{q.warranty}</p>
                  </div>
                </div>
                {q.notes && (
                  <p className="text-xs text-gray-500 mt-3 italic">
                    &ldquo;{q.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Price Panel */}
              <div className="w-full md:w-[240px] bg-gray-50 rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shrink-0">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Base Monthly</span>
                    <span className="font-semibold text-gray-700">{q.monthlyAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-gray-700">{q.gstAmount}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Monthly</p>
                    <p className="text-2xl font-black text-[#0F8B7D] mt-0.5">{q.grossAmount}</p>
                    <p className="text-[10px] text-gray-400">12M TCO: {q.tco12Month}</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer pt-3 border-t border-gray-200">
                  <input
                    type="checkbox"
                    checked={selected.includes(q.vendorName)}
                    onChange={() => toggleSelect(q.vendorName)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0F8B7D] focus:ring-[#0F8B7D] accent-[#0F8B7D] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">Select for Decision Matrix</span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Floating Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-[280px] md:right-8 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-6 py-3.5 flex items-center justify-between z-40 shadow-2xl border border-gray-800">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#0F8B7D] text-white font-bold text-xs flex items-center justify-center">
              {selected.length}
            </span>
            <div>
              <p className="text-xs font-bold">Vendor{selected.length !== 1 ? "s" : ""} Selected</p>
              <p className="text-[10px] text-gray-400">Ready for transparent side-by-side evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected([])}
              className="text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
            <Link
              href={`/marketplace/compare?id=${currentRfq?.id}`}
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              Open Comparison Matrix ⇄
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorQuotationsViewer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#0F8B7D]" />
        </div>
      }
    >
      <VendorQuotationsContent />
    </Suspense>
  );
}
