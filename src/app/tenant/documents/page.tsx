"use client";
import React, { useState } from "react";
import { FolderOpen, Download, FileText } from "lucide-react";

export default function DocumentLocker() {
  const [docs] = useState([
    { id: 1, name: "TCS Floor 4 Lease Agreement", size: "4.8 MB", uploaded: "Jan 05, 2024" },
    { id: 2, name: "Rental Deposit Receipt - TCS Wing B", size: "1.2 MB", uploaded: "Jan 10, 2024" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Document Locker</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Persistent repository of lease agreements, tax receipts, and NOC records.</p>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Document Name</th>
              <th className="py-4">File Size</th>
              <th className="py-4">Uploaded Date</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={14} className="text-purple-600" />
                  {doc.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{doc.size}</td>
                <td className="py-4 text-gray-700 font-semibold">{doc.uploaded}</td>
                <td className="py-4">
                  <button className="px-2.5 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 text-purple-600 font-bold text-[10px] transition-colors flex items-center gap-1">
                    Download <Download size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
