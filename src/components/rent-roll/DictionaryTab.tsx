"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  TrendingUp,
  Building2,
  DollarSign,
  ShieldCheck,
  Percent,
  Clock,
  Layers,
  Receipt
} from "lucide-react";

interface TermDef {
  term: string;
  category: "Valuation & NOI" | "Lease Mechanics" | "Billing & Tax" | "Portfolio Risk";
  shortDef: string;
  formula?: string;
  example?: string;
  institutionalRule: string;
}

const CRE_TERMS: TermDef[] = [
  {
    term: "WALT (Weighted Average Lease Expiry)",
    category: "Portfolio Risk",
    shortDef: "A key institutional metric measuring the average remaining lease duration of a commercial property, weighted by occupied area or gross rental income.",
    formula: "WALT (Years) = ∑ (Remaining Lease Term_i × Area_i) / Total Occupied Area",
    example: "A 100,000 sq ft building with Tenant A (60,000 sq ft, 5 yrs remaining) and Tenant B (40,000 sq ft, 2 yrs remaining) has a WALT of 3.8 years.",
    institutionalRule: "Higher WALT (>4.5 years) indicates strong cash flow stability, making assets prime for REIT inclusion or low-cost debt financing."
  },
  {
    term: "NOI (Net Operating Income)",
    category: "Valuation & NOI",
    shortDef: "Total commercial revenue generated from rentals, parking, and CAM minus all mandatory operating expenses (OpEx), before debt service, taxes, and capital expenditures.",
    formula: "NOI = Gross Operating Income (Rent + CAM + Utilities) - Operating Expenses (O&M + Security + Taxes)",
    example: "₹10 Cr Annual Invoiced Revenue - ₹2.5 Cr Annual Maintenance & Property Tax = ₹7.5 Cr Annual NOI.",
    institutionalRule: "NOI is the single most critical input for DCF property valuation and Cap Rate estimation."
  },
  {
    term: "Cap Rate (Capitalization Rate)",
    category: "Valuation & NOI",
    shortDef: "The unleveraged rate of return on a commercial real estate property based on the annual NOI expected to be generated.",
    formula: "Cap Rate (%) = (Annual NOI / Property Market Valuation) × 100",
    example: "A Grade-A office tower valued at ₹100 Cr generating ₹8.25 Cr annual NOI operates at an 8.25% Cap Rate.",
    institutionalRule: "Grade-A institutional assets in Tier-1 Indian CBDs (BKC Mumbai, CyberCity Gurgaon) trade at 7.5% - 8.5% Cap Rates."
  },
  {
    term: "CAM (Common Area Maintenance) Recovery",
    category: "Lease Mechanics",
    shortDef: "Contractual operational charges billed to tenants per sq ft to recover shared services: central HVAC, DG fuel, 24/7 security, cleaning, BMS, and common area power.",
    formula: "Monthly CAM = Chargeable Super Built-up Area (sq ft) × CAM PSF Rate (₹/sq ft/mo)",
    example: "45,000 sq ft at ₹18 PSF/mo CAM yields ₹8,10,000/mo in maintenance recoveries.",
    institutionalRule: "Leases specify whether CAM is 'Fixed Rate + Annual Escalation' or 'Actual Pass-Through with Open-Book Audit'."
  },
  {
    term: "Compounding Rent Escalation",
    category: "Lease Mechanics",
    shortDef: "Contractual rental rate increment (typically 15% every 3 years, or 5% annually in India) applied cumulatively over the base rent.",
    formula: "Year_(N) Rent = Initial Base Rent × (1 + Escalation %)^((N - 1) / Escalation Interval)",
    example: "Starting at ₹100 PSF with 15% escalation every 3 years: Years 1-3 = ₹100, Years 4-6 = ₹115, Years 7-9 = ₹132.25 PSF.",
    institutionalRule: "OfficeX automated escalation engine flags leases 60 days prior to trigger dates and applies compounding schedules in 1 click."
  },
  {
    term: "Lock-in Period vs. Lease Tenure",
    category: "Lease Mechanics",
    shortDef: "The non-cancellable duration during which neither the landlord nor the tenant can terminate the agreement without paying damages for the remainder of the lock-in.",
    formula: "Typically 36 months to 60 months within a 9-year (3+3+3) registered indenture.",
    example: "If a tenant vacates during year 2 of a 3-year lock-in, the remaining 12 months rent is forfeited from the Security Deposit or legally recoverable.",
    institutionalRule: "Standard corporate Indian lease indenture format: 9-year registered lease, 3-year hard lock-in with 6-month notice period."
  },
  {
    term: "OER (Operating Expense Ratio)",
    category: "Valuation & NOI",
    shortDef: "The percentage of gross revenue consumed by day-to-day property operational expenses.",
    formula: "OER (%) = (Total Operating Expenses / Gross Operating Revenue) × 100",
    example: "Operating expenses of ₹30 Lakh on ₹1.2 Cr gross monthly revenue gives an OER of 25.0%.",
    institutionalRule: "High-efficiency Grade-A institutional business parks maintain OER between 18% and 26%."
  },
  {
    term: "AR Aging Buckets (Accounts Receivable)",
    category: "Billing & Tax",
    shortDef: "Classification of unpaid commercial invoices based on the number of days past due: Current (0-30d), 31-60d, 61-90d, and 90+ days delinquent.",
    formula: "Bucket = Current Date - Invoice Due Date (Grace period: 15 days)",
    example: "An invoice issued Aug 01 with Net-15 terms becomes overdue on Aug 16, entering 31-60d bucket on Sept 16.",
    institutionalRule: "Debts exceeding 90 days trigger automatic legal default notices and statutory interest charges at 18% p.a."
  },
  {
    term: "Fitout Rent-Free Period",
    category: "Lease Mechanics",
    shortDef: "A designated initial lease window (typically 30 to 120 days) where base rent is waived while the tenant completes interior architectural fitouts.",
    formula: "Rent Commencement Date = Lease Execution Date + Fitout Period (Days)",
    example: "Lease signed on Jan 1 with 60-day fitout: Tenant occupies immediately, but Rent & Invoicing begins on March 1.",
    institutionalRule: "During fitout periods, CAM and actual electricity consumption are usually payable by the tenant."
  },
  {
    term: "GST Reverse Charge & TDS on Rent (Sec 194-I)",
    category: "Billing & Tax",
    shortDef: "Statutory tax deductions applied to commercial property rent in India: 10% TDS on Rent, 2% TDS on CAM/Plant & Machinery, and 18% GST (SAC 997212).",
    formula: "Net Payable to Landlord = (Base Rent + CAM) - 10% TDS + 18% GST (on gross)",
    example: "₹1,00,000 Base Rent + ₹18,000 GST (18%) - ₹10,000 TDS (10%) = ₹1,08,000 Net Cash Transfer from Corporate Tenant.",
    institutionalRule: "Tax invoices generated by OfficeX contain complete SAC codes, PAN, GSTIN, and breakdown for automated ERP filing."
  }
];

export const DictionaryTab: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Valuation & NOI", "Lease Mechanics", "Billing & Tax", "Portfolio Risk"];

  const filtered = CRE_TERMS.filter((t) => {
    const matchCat = selectedCategory === "ALL" || t.category === selectedCategory;
    const matchQuery =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.shortDef.toLowerCase().includes(search.toLowerCase()) ||
      (t.formula && t.formula.toLowerCase().includes(search.toLowerCase())) ||
      t.institutionalRule.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-black tracking-tight">Institutional Financial Terms Dictionary</h2>
          </div>
          <p className="text-xs text-teal-100/80 max-w-2xl">
            Commercial real estate financial glossary, mathematical formulas, and statutory benchmark rules used across OfficeX Rent Roll engines.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search financial terms, formulas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0F8B7D] text-white shadow-xs font-bold"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 hover:border-[#0F8B7D]/50 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-black text-gray-900">{item.term}</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold rounded-lg shrink-0">
                  {item.category}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {item.shortDef}
              </p>

              {item.formula && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 font-mono text-[11px] text-teal-900 font-semibold">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Formula:</span>
                  {item.formula}
                </div>
              )}

              {item.example && (
                <div className="text-[11px] text-gray-500 bg-gray-50/70 p-2.5 rounded-xl mb-3 border border-gray-100">
                  <strong className="text-gray-700">Example: </strong> {item.example}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-start gap-2 text-[11px] text-teal-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0F8B7D] shrink-0 mt-0.5" />
              <span>{item.institutionalRule}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
