"use client";
import React, { useState } from "react";
import { Search, Plus, X, CheckCircle } from "lucide-react";

export default function UserManagementPortal() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "", passwordMode: "auto", properties: ["Apex Tower"] as string[] });

  const users = [
    { id: "USR-001", name: "Rajesh Kumar", email: "rajesh@officex.in", role: "Property Manager", portal: "Property Portal", properties: "6 Properties", lastLogin: "2h ago", status: "Active" },
    { id: "USR-002", name: "Ravi Menon", email: "ravi@officex.in", role: "Leasing Agent", portal: "Leasing Portal", properties: "4 Properties", lastLogin: "1d ago", status: "Active" },
    { id: "USR-003", name: "Priya Sharma", email: "priya@tcs.com", role: "Tenant Admin", portal: "Tenant Portal", properties: "Apex Tower", lastLogin: "3h ago", status: "Active" },
    { id: "USR-004", name: "Amit K.", email: "amit@officex.in", role: "Platform Auditor", portal: "Admin Portal", properties: "All Properties", lastLogin: "5d ago", status: "Suspended" },
    { id: "USR-005", name: "Neha Singh", email: "neha@cleanpro.com", role: "Vendor Admin", portal: "Vendor Portal", properties: "—", lastLogin: "2d ago", status: "Active" },
    { id: "USR-006", name: "Sanjay Gupta", email: "sanjay@officex.in", role: "Facility Manager", portal: "Property Portal", properties: "Orion Park", lastLogin: "1h ago", status: "Active" }
  ];

  const allProperties = ["All Properties", "Apex Tower", "Crystal Tower", "Orion Park", "Zenith Plaza"];

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /><span>{toast}</span></div>}

      <div>
        <h1 className="text-2xl font-black text-gray-900">User Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage portal access and permissions.</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <table className="w-full text-left border-collapse">
          <thead><tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider"><th className="py-3 pr-3">User ID</th><th className="py-3 pr-3">Full Name</th><th className="py-3 pr-3">Email Address</th><th className="py-3 pr-3">Role</th><th className="py-3 pr-3">Portal Access</th><th className="py-3 pr-3">Properties</th><th className="py-3 pr-3">Last Login</th><th className="py-3 pr-3">Status</th><th className="py-3">Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-3.5 pr-3 font-bold text-gray-500">{u.id}</td>
                <td className="py-3.5 pr-3 font-bold text-gray-900">{u.name}</td>
                <td className="py-3.5 pr-3 text-gray-600">{u.email}</td>
                <td className="py-3.5 pr-3 text-gray-600">{u.role}</td>
                <td className="py-3.5 pr-3 text-gray-600">{u.portal}</td>
                <td className="py-3.5 pr-3 text-gray-600">{u.properties}</td>
                <td className="py-3.5 pr-3 text-gray-500">{u.lastLogin}</td>
                <td className="py-3.5 pr-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{u.status}</span></td>
                <td className="py-3.5"><button className="text-xs text-gray-500 cursor-pointer">De...</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Showing 1-6 of 24 users</p>
          <div className="flex gap-2"><button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 cursor-pointer">Previous</button><button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 cursor-pointer">Next</button></div>
        </div>
      </div>

      {/* Add User Drawer */}
      {showDrawer && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
            <button onClick={() => setShowDrawer(false)} className="text-gray-400 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div><label className="text-xs font-semibold text-gray-700">Full Name</label><input placeholder="e.g. Jane Doe" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-xs font-semibold text-gray-700">Email Address</label><input placeholder="jane@example.com" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]" /></div>
            <div><label className="text-xs font-semibold text-gray-700">Role</label><select className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"><option value="">Select a role</option><option>Property Manager</option><option>Tenant Admin</option><option>Vendor Admin</option><option>Facility Manager</option><option>Platform Auditor</option></select></div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Password Setup</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="pw" defaultChecked className="accent-[#0F8B7D]" /> Auto-generate and email</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="pw" className="accent-[#0F8B7D]" /> Set manually</label>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Property Scope</label>
              <p className="text-[10px] text-gray-500 mb-2">Assign properties to enforce data boundaries.</p>
              {allProperties.map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs mb-1.5 cursor-pointer"><input type="checkbox" defaultChecked={p === "Apex Tower"} className="w-4 h-4 accent-[#0F8B7D]" /> {p}</label>
              ))}
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <button onClick={() => setShowDrawer(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">Cancel</button>
            <button onClick={() => { setShowDrawer(false); setToast("User provisioned!"); setTimeout(() => setToast(null), 3500); }} className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer">Provision User</button>
          </div>
        </div>
      )}
    </div>
  );
}
