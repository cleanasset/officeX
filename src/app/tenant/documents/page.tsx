"use client";
import React, { useState } from "react";
import { Upload, Search, FolderOpen, FileText, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";

export default function DocumentLockerDashboard() {
  const [search, setSearch] = useState("");

  const folders = [
    { name: "Lease Agreements", files: null },
    { name: "Tenant KYC", files: "3 files" },
    { name: "Insurance Certificates", files: null },
    { name: "Staff Directory", files: "1 files" },
    { name: "Billing Invoices", files: "12 files" },
    { name: "Correspondence", files: "5 files" }
  ];

  const documents = [
    { name: "Lease_Agreement_v3_Signed.pdf", category: "Lease Agreements", type: "PDF", size: "2.4 MB", date: "Oct 24, 2024", status: "Verified" },
    { name: "KYC_GSTIN.pdf", category: "Tenant KYC", type: "PDF", size: "850 KB", date: "Oct 22, 2024", status: "Pending" },
    { name: "KYC_PAN.pdf", category: "Tenant KYC", type: "PDF", size: "1.1 MB", date: "Oct 22, 2024", status: "Verified" },
    { name: "Staff_List_2025.xlsx", category: "Staff Directory", type: "XLSX", size: "320 KB", date: "Oct 20, 2024", status: "N/A" }
  ];

  const statusStyle = (s: string) => {
    if (s === "Verified") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "Pending") return "bg-gray-100 text-gray-600 border border-gray-200";
    return "bg-gray-100 text-gray-500 border border-gray-200";
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Folders */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Folders</h2>
        <div className="grid grid-cols-3 gap-3">
          {folders.map((f) => (
            <div key={f.name} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FolderOpen size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{f.name}</p>
                {f.files && <p className="text-[10px] text-gray-500">{f.files}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D] w-52"
            />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 pr-3">Document Name</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">File Type</th>
                <th className="py-3 pr-3">Size</th>
                <th className="py-3 pr-3">Upload Date</th>
                <th className="py-3">Verified Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.name} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-4 pr-3 font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={14} className="text-red-400" />
                    {d.name}
                  </td>
                  <td className="py-4 pr-3 text-gray-600">{d.category}</td>
                  <td className="py-4 pr-3 text-gray-600">{d.type}</td>
                  <td className="py-4 pr-3 text-gray-600">{d.size}</td>
                  <td className="py-4 pr-3 text-gray-600">{d.date}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(d.status)}`}>
                      {d.status === "Verified" && "✓ "}{d.status === "Pending" && "⏳ "}{d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Showing 4 of 25 documents</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronLeft size={14} /></button>
            <span className="text-xs font-bold text-gray-900 px-2">1</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
