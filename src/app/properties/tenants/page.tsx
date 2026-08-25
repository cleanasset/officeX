"use client";
import React, { useState } from "react";
import { Users, Building, Mail, Phone } from "lucide-react";

export default function TenantsDirectory() {
  const [tenants] = useState([
    { id: 1, name: "Priya Sharma", company: "TCS India", space: "Meridian Wing B", email: "priya.sharma@tcs.com", phone: "+91 99001 22334" },
    { id: 2, name: "Vikram Malhotra", company: "Razorpay Software", space: "Apex Floor 4", email: "vikram@razorpay.com", phone: "+91 88992 33445" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tenant Directory</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Directory of occupied business suites, company representatives, and contact registers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map((t) => (
          <div key={t.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Users size={16} className="text-purple-600" />
                    {t.company}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Contact: {t.name}</span>
                </div>
                <span className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                  <Building size={12} className="text-purple-600" /> {t.space}
                </span>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex flex-col gap-1">
                <span>Email: {t.email}</span>
                <span>Phone: {t.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
