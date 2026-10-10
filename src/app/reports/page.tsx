"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Receipt, ChevronLeft, ChevronRight } from "lucide-react";

export default function FinancialAnalyticsDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/commissions");
      const json = await res.json();
      if (json.success && Array.isArray(json.transactions)) {
        setTransactions(
          json.transactions.map((t: any) => ({
            id: t.id || `TX-${t.timestamp}`,
            client: t.clientOrEntity || "Enterprise Client",
            property: t.property || "Commercial Property",
            rent: `₹${Number(t.dealValue || 0).toLocaleString("en-IN")}`,
            rate: `${t.commissionRate || 10}%`,
            fee: `₹${Number(t.officeXFee || 0).toLocaleString("en-IN")}`,
            feeNum: Number(t.officeXFee || 0),
            dealValueNum: Number(t.dealValue || 0),
            invoice: t.invoiceRef || "INV-GEN",
            status: t.status === "PAID" ? "Paid" : t.status === "ESCROW_HOLD" ? "In Escrow" : "Pending",
          }))
        );
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const totalTCV = transactions.reduce((acc, t) => acc + (t.dealValueNum || 0), 0);
  const totalFees = transactions.reduce((acc, t) => acc + (t.feeNum || 0), 0);

  const statusStyle = (s: string) =>
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : s === "Pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-700";

  const filtered = transactions.filter((t) =>
    search ? t.client.toLowerCase().includes(search.toLowerCase()) || t.property.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Contract Value (TCV)</p>
          <p className="text-3xl font-black text-gray-900">
            ₹{totalTCV > 0 ? (totalTCV / 10000000).toFixed(2) + " Cr" : "0"}
          </p>
          <span className="text-[10px] font-bold text-emerald-600">Verified executed value</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Commissions Realized</p>
          <p className="text-3xl font-black text-gray-900">
            ₹{totalFees > 0 ? totalFees.toLocaleString("en-IN") : "0"}
          </p>
          <span className="text-[10px] font-bold text-emerald-600">Platform retainers &amp; brokerage</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Active Transactions</p>
          <p className="text-3xl font-black text-gray-900">{transactions.length}</p>
          <span className="text-[10px] text-gray-500">Live ledger rows</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly SaaS / Desk MRR</p>
          <p className="text-3xl font-black text-gray-900">₹0</p>
          <span className="text-[10px] text-gray-500">Standard Tier</span>
        </div>
      </div>

      {/* Platform Commission Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Platform Commission Ledger</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-44"
              />
            </div>
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 cursor-pointer">
              <Filter size={14} />
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">Transaction ID</th>
              <th className="py-3 pr-3">Client</th>
              <th className="py-3 pr-3">Property</th>
              <th className="py-3 pr-3">Total Value</th>
              <th className="py-3 pr-3">Comm. Rate</th>
              <th className="py-3 pr-3">Fee Earned</th>
              <th className="py-3 pr-3">Invoice Ref</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 text-xs">
                  Loading commission transactions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Receipt className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-bold text-gray-700">No Commission Transactions Recorded</span>
                    <span className="text-[11px] text-gray-400">
                      Brokerage fees, marketplace escrow splits, and executed leases will appear here.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 text-xs">
                  <td className="py-3.5 pr-3 font-bold text-gray-500">{t.id}</td>
                  <td className="py-3.5 pr-3 font-semibold text-gray-900">{t.client}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.property}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.rent}</td>
                  <td className="py-3.5 pr-3 text-gray-600">{t.rate}</td>
                  <td className="py-3.5 pr-3 font-bold text-[#0F8B7D]">{t.fee}</td>
                  <td className="py-3.5 pr-3 text-gray-500">{t.invoice}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Showing {filtered.length} entries</p>
        </div>
      </div>
    </div>
  );
}
