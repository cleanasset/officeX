"use client";

import React, { useState } from "react";
import {
  X,
  Users,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Plus
} from "lucide-react";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("Mumbai");
  const [billingState, setBillingState] = useState("Maharashtra");
  const [billingPincode, setBillingPincode] = useState("400051");
  const [creditLimit, setCreditLimit] = useState<number>(50000000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeName,
          legalName: legalName || tradeName,
          industry,
          gstin,
          pan,
          contactPerson,
          contactEmail,
          contactPhone,
          billingAddress,
          billingCity,
          billingState,
          billingPincode,
          creditLimit,
          paymentTermsDays,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tenant");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Add New Tenant Entity</h3>
              <p className="text-xs text-gray-500">Company registration, GSTIN, PAN & billing profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-medium text-gray-700">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Trade / Brand Name *</label>
              <input
                type="text"
                placeholder="e.g. Tata Digital Ltd"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Legal Entity Name</label>
              <input
                type="text"
                placeholder="e.g. Tata Digital Private Limited"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Industry / Sector</label>
              <input
                type="text"
                placeholder="e.g. BFSI / Cloud / FinTech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">GSTIN Number (15 digits)</label>
              <input
                type="text"
                placeholder="e.g. 27AABCT1234D1Z2"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full bg-white border border-gray-300 text-emerald-800 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 font-mono shadow-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contact Person *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email *</label>
              <input
                type="email"
                placeholder="rajesh@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 font-mono shadow-sm"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block text-gray-700 font-semibold mb-1">Billing Registered Address</label>
            <input
              type="text"
              placeholder="e.g. Army & Navy Building, 148 MG Road, Fort"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none placeholder-gray-400 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">City</label>
              <input
                type="text"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">State</label>
              <input
                type="text"
                value={billingState}
                onChange={(e) => setBillingState(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Pincode</label>
              <input
                type="text"
                value={billingPincode}
                onChange={(e) => setBillingPincode(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] focus:outline-none font-mono shadow-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0d786c] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-teal-700/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Save Tenant Entity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
