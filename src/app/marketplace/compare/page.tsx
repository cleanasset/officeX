"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Award, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import type { RFQItem, RFQQuote, WorkOrderItem } from "@/lib/rfq-store";

function QuoteComparisonBoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rfqParam = searchParams.get("id") || searchParams.get("rfqId") || "RFQ-2026-8842";

  const [currentRfq, setCurrentRfq] = useState<RFQItem | null>(null);
  const [allRfqs, setAllRfqs] = useState<RFQItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [auditNotes, setAuditNotes] = useState(
    "Selected based on highest weighted composite score, lowest emergency response SLA, and fully verified statutory PF/ESIC compliance."
  );
  const [escrowHold, setEscrowHold] = useState(true);
  const [milestoneSplit, setMilestoneSplit] = useState("80% Monthly Base + 20% Outcome Milestone");
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardedWorkOrder, setAwardedWorkOrder] = useState<WorkOrderItem | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/rfqs");
        const data = await res.json();
        if (data.success && Array.isArray(data.rfqs)) {
          setAllRfqs(data.rfqs);
          const found = data.rfqs.find((r: RFQItem) => r.id === rfqParam) || data.rfqs[0];
          setCurrentRfq(found);
          if (found && found.quotes && found.quotes.length > 0) {
            setSelectedVendor(found.quotes[0].vendorName);
            setAuditNotes(
              `${found.quotes[0].vendorName} selected based on composite score (${found.quotes[0].score}/100), ${found.quotes[0].emergencySla} emergency SLA, and verified ${found.quotes[0].statutoryCompliance}.`
            );
          }
          if (found && found.status === "awarded" && found.awardedWorkOrderId) {
            // Check if already awarded
            setAwardedWorkOrder({
              id: found.awardedWorkOrderId,
              client: "Apex Commercial Estates Ltd",
              vendor: found.awardedTo || "TechServe Solutions",
              property: found.property,
              startDate: "01 Nov 2026",
              progress: "Month 1 of 12",
              pct: 8,
              status: "Active",
              statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
              contractValue: found.quotes[0]?.grossAmount || "₹2,18,300 / mo",
              escrowStatus: "Escrow Funded (Razorpay Live Mode)",
              milestoneRule: "80% Monthly Base + 20% Outcome Milestone"
            });
          }
        }
      } catch (err) {
        console.error("Error loading RFQ for comparison:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [rfqParam]);

  const handleSelectVendor = (vendorName: string) => {
    setSelectedVendor(vendorName);
    const quote = currentRfq?.quotes?.find((q) => q.vendorName === vendorName);
    if (quote) {
      setAuditNotes(
        `${quote.vendorName} selected based on composite score (${quote.score}/100), ${quote.emergencySla} emergency SLA, and verified ${quote.statutoryCompliance}.`
      );
    }
  };

  const handleAward = async () => {
    if (!currentRfq) return;
    const vendorToAward = selectedVendor || (currentRfq.quotes?.[0]?.vendorName);
    if (!vendorToAward) {
      showToast("No vendor quote selected to award.");
      return;
    }

    setIsAwarding(true);
    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "award",
          rfqId: currentRfq.id,
          vendorName: vendorToAward,
          auditNotes,
          milestoneSplit,
          escrowHold
        })
      });

      const data = await res.json();
      if (data.success && data.workOrder) {
        setAwardedWorkOrder(data.workOrder);
        setCurrentRfq(data.rfq);
        showToast(`🎉 Contract officially awarded to ${vendorToAward}! Work Order ${data.workOrder.id} generated with Escrow PO.`);
      } else {
        showToast(data.error || "Failed to award contract.");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while awarding contract.");
    } finally {
      setIsAwarding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#0F8B7D]" />
        <p className="text-xs font-bold text-gray-500">Loading RFQ quotes and weighted comparison matrix...</p>
      </div>
    );
  }

  const quotes = currentRfq?.quotes || [];
  const activeQuote = quotes.find((q) => q.vendorName === selectedVendor) || quotes[0];

  const criteriaList = [
    {
      label: "Vendor Performance Score",
      values: quotes.map((q) => `${q.score} / 100`),
      highlight: true
    },
    {
      label: "Base Monthly Quote",
      values: quotes.map((q) => q.monthlyAmount)
    },
    {
      label: "GST (18%)",
      values: quotes.map((q) => q.gstAmount)
    },
    {
      label: "Gross Monthly Quote",
      values: quotes.map((q) => q.grossAmount),
      highlight: true
    },
    {
      label: "Manpower Deployment",
      values: quotes.map((q) => q.manpower)
    },
    {
      label: "Materials & Spares",
      values: quotes.map((q) => q.materials)
    },
    {
      label: "Emergency Response SLA",
      values: quotes.map((q) => q.emergencySla),
      bestIndex: quotes.findIndex((q) => q.emergencySla.includes("2"))
    },
    {
      label: "Statutory Compliance (PF/ESIC)",
      values: quotes.map((q) => q.statutoryCompliance),
      bestIndex: quotes.findIndex((q) => q.statutoryCompliance.includes("100%"))
    },
    {
      label: "12-Month Total Cost of Ownership",
      values: quotes.map((q) => q.tco12Month),
      highlight: true
    }
  ];

  const scoreBreakdown = activeQuote?.scoreBreakdown ? [
    { label: "Price Competitiveness (25%)", val: activeQuote.scoreBreakdown.priceScore },
    { label: "SLA & Response Time (20%)", val: activeQuote.scoreBreakdown.slaScore },
    { label: "Technical Capability (15%)", val: activeQuote.scoreBreakdown.technicalScore },
    { label: "Work Quality & Cleanliness (15%)", val: activeQuote.scoreBreakdown.qualityScore },
    { label: "Compliance & Safety (10%)", val: activeQuote.scoreBreakdown.complianceScore },
    { label: "Experience & Track Record (10%)", val: activeQuote.scoreBreakdown.experienceScore },
    { label: "ESG & Sustainability (5%)", val: activeQuote.scoreBreakdown.esgScore }
  ] : [
    { label: "Price Competitiveness (25%)", val: "23 / 25" },
    { label: "SLA & Response Time (20%)", val: "18 / 20" },
    { label: "Technical Capability (15%)", val: "14 / 15" },
    { label: "Work Quality & Cleanliness (15%)", val: "14 / 15" },
    { label: "Compliance & Safety (10%)", val: "10 / 10" },
    { label: "Experience & Track Record (10%)", val: "8 / 10" },
    { label: "ESG & Sustainability (5%)", val: "4 / 5" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation Breadcrumb & Switcher */}
      <div className="flex items-center justify-between">
        <Link
          href="/marketplace/rfq"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to RFQ Directory
        </Link>

        {allRfqs.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Switch Tender:</span>
            <select
              value={currentRfq?.id}
              onChange={(e) => router.push(`/marketplace/compare?id=${e.target.value}`)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
            >
              {allRfqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
              {currentRfq?.category || "MEP"}
            </span>
            <span className="text-xs text-gray-400 font-mono">{currentRfq?.id}</span>
            {currentRfq?.status === "awarded" && (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                ✓ Contract Awarded
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900">{currentRfq?.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            📍 {currentRfq?.property} • {quotes.length} Verified Quotation{quotes.length !== 1 ? "s" : ""} Received
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-teal-50 text-[#0F8B7D] font-bold text-xs border border-teal-100 flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={14} /> Transparent Weighted Decision Intelligence
          </span>
        </div>
      </div>

      {/* Awarded Work Order Banner (if already awarded) */}
      {awardedWorkOrder && (
        <div className="bg-teal-900 text-white rounded-3xl p-6 shadow-xl border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-teal-200 text-[10px] font-bold uppercase tracking-wider">
              OFFICIAL CONTRACT AWARDED
            </span>
            <h3 className="text-lg font-black mt-1">
              Active Work Order: {awardedWorkOrder.id} ({awardedWorkOrder.vendor})
            </h3>
            <p className="text-xs text-teal-200 mt-0.5">
              Contract Value: {awardedWorkOrder.contractValue} • Escrow Status: {awardedWorkOrder.escrowStatus} • Term: 12 Months
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/vendor/work-orders"
              className="px-5 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <span>View in Work Orders Hub</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {quotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
          <AlertCircle size={36} className="text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Quotations Submitted Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            This RFQ has been dispatched to verified trade vendors in the marketplace network. Bids will appear here in real-time as submitted.
          </p>
          <Link
            href="/vendor/rfqs"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs"
          >
            Go to Vendor Hub to Submit a Bid <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 overflow-x-auto shadow-2xs w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-[260px]">
                  Evaluation Criteria
                </th>
                {quotes.map((q) => (
                  <th key={q.id} className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <label className="cursor-pointer flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="vendor"
                          value={q.vendorName}
                          checked={selectedVendor === q.vendorName}
                          onChange={() => handleSelectVendor(q.vendorName)}
                          className="accent-[#0F8B7D] w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-black text-gray-900">{q.vendorName}</span>
                      </label>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${q.tagColor || "bg-gray-100 text-gray-700"}`}>
                        {q.badge || `${q.score}/100 Match`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteriaList.map((row) => (
                <tr key={row.label} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className={`py-3.5 px-6 text-xs ${row.highlight ? "font-bold text-gray-900 bg-gray-50/30" : "text-gray-600"}`}>
                    {row.label}
                  </td>
                  {row.values.map((val, i) => {
                    const isSelectedCol = quotes[i]?.vendorName === selectedVendor;
                    return (
                      <td
                        key={i}
                        className={`py-3.5 px-6 text-center text-xs ${
                          row.highlight && i === 0
                            ? "font-black text-[#0F8B7D] text-sm"
                            : row.highlight
                            ? "font-bold text-gray-900"
                            : row.bestIndex === i
                            ? "font-bold text-[#0F8B7D]"
                            : "text-gray-700"
                        } ${isSelectedCol ? "bg-teal-50/20" : ""}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision Summary & Weighted Vendor Performance Breakdown */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left: Explainable Selection & Milestone Payout Rules */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Award size={18} className="text-[#0F8B7D]" />
              <h2 className="text-sm font-bold text-gray-900">
                Award Contract to {activeQuote?.vendorName || "Selected Vendor"}
              </h2>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-emerald-900">
              <p className="font-bold">
                Selected: {activeQuote?.vendorName} ({activeQuote?.grossAmount} / mo)
              </p>
              <p className="text-[11px] leading-relaxed">
                TCO for 12 months: {activeQuote?.tco12Month} • Emergency SLA: {activeQuote?.emergencySla} • {activeQuote?.notes}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                AUDIT &amp; JUSTIFICATION NOTES (RECORDED IN AUDIT TRAIL)
              </label>
              <textarea
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 resize-none h-20 focus:outline-none focus:border-[#0F8B7D]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  CONFIGURABLE MILESTONE PAYOUT RULE
                </label>
                <select
                  value={milestoneSplit}
                  onChange={(e) => setMilestoneSplit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>80% Monthly Base + 20% Outcome Milestone</option>
                  <option>90% Monthly Base + 10% SLA Retention</option>
                  <option>100% Monthly on Service Sign-off</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="escrow"
                  checked={escrowHold}
                  onChange={(e) => setEscrowHold(e.target.checked)}
                  className="w-4 h-4 accent-[#0F8B7D] cursor-pointer"
                />
                <label htmlFor="escrow" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Hold payout in Razorpay Escrow until monthly PPM sign-off
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                <ShieldCheck size={16} className="text-teal-600" />
                <span>Escrow PO protected under OfficeX SLA Guarantee</span>
              </div>

              <button
                onClick={handleAward}
                disabled={isAwarding || currentRfq?.status === "awarded"}
                className={`px-8 py-3 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 ${
                  currentRfq?.status === "awarded"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0F8B7D] hover:bg-[#0D7A6E]"
                }`}
              >
                {isAwarding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Generating PO...
                  </>
                ) : currentRfq?.status === "awarded" ? (
                  <>✓ Contract Awarded</>
                ) : (
                  <>
                    Award Contract &amp; Generate PO <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Score Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                {activeQuote?.vendorName} VENDOR SCORE
              </p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">
                {activeQuote?.score || 91} <span className="text-xs font-normal text-gray-400">/ 100</span>
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {scoreBreakdown.map((s) => (
                <div key={s.label} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-bold text-gray-900">{s.val}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500">
              <span className="font-bold block text-gray-700 mb-0.5">Commercial Evaluation Note:</span>
              Scores are dynamically compiled from platform vendor performance telemetry, SLA historical benchmarks, and verified trade licenses.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteComparisonBoard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#0F8B7D]" />
        </div>
      }
    >
      <QuoteComparisonBoardContent />
    </Suspense>
  );
}
