"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, ArrowRight, UserPlus, Trash2 } from "lucide-react";

export default function UserManagement() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("tenant_admin");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users list.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role, password: "123456" })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("User provisioned successfully!");
        setEmail("");
        setFullName("");
        fetchUsers();
      } else {
        setError(data.error || "Failed to add user.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Provisioning & Roles</h1>
        <p className="text-sm text-gray-600 font-semibold mt-1">Manage active platform roles, access policies, and workspace accounts.</p>
      </div>

      {/* Two Column Layout: Add User Form & Users Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Provision Form */}
        <div className="premium-card p-6 border border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
            <UserPlus size={18} className="text-red-500" />
            Provision New User
          </h3>

          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            {error && <span className="text-red-500 text-[10px] font-bold">⚠ {error}</span>}
            {message && <span className="text-emerald-500 text-[10px] font-bold">✔ {message}</span>}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Anand Mahindra" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. anand@mahindra.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Platform Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
              >
                <option value="super_admin">Super Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="broker">Leasing Broker</option>
                <option value="vendor_admin">FM Vendor</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? "Provisioning..." : "Add User Account"}
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="md:col-span-2 premium-card p-6 border border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={18} className="text-red-500" />
            Active Platform Users ({usersList.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-4">Full Name</th>
                  <th className="py-4">Email</th>
                  <th className="py-4">Role</th>
                  <th className="py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr, idx) => (
                  <tr key={idx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{usr.fullName}</td>
                    <td className="py-4 text-gray-700">{usr.email}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-[10px] font-bold uppercase tracking-wider">
                        {usr.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
