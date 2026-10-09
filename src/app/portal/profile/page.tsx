"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Save,
  Plus,
  Send,
  Bell,
  Lock
} from "lucide-react";

export default function TenantProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestedGstin, setRequestedGstin] = useState("");
  const [gstinChangeRequested, setGstinChangeRequested] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Notification channels (§T-08)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  useEffect(() => {
    loadProfile();

    const handleOccChange = () => {
      loadProfile();
    };
    window.addEventListener("occupantChanged", handleOccChange);
    return () => window.removeEventListener("occupantChanged", handleOccChange);
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/profile");
      const json = await res.json();
      if (json.success && json.profile) {
        setProfileData(json.profile);
        setEmail(json.profile.email || "");
        setPhone(json.profile.phone || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: profileData.id,
          email,
          phone,
          requested_gstin_change: requestedGstin || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveToast(json.message);
        if (requestedGstin) setGstinChangeRequested(true);
        setTimeout(() => setSaveToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save profile");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Occupant Profile...</p>
      </div>
    );
  }

  const p = profileData || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Profile & Contacts</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Maintain billing signatories, dispatch contacts, and communication preferences.
        </p>
      </div>

      {/* Statutory Legal Details Card (§T-08) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">Registered Entity Information</h2>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold">
            {p.occupant_code || "OCC-0001"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Legal Trade Name</span>
            <span className="text-sm font-black text-slate-900 block mt-1">{p.occupant_name}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAN Number</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-1">
              {p.pan_number || "AAACT1234K"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered GSTIN</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-1">
              {p.gst_number || "29AAACT1234K1Z5"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Industry Sector</span>
            <span className="text-sm font-black text-slate-900 block mt-1">
              {p.industry_sector || "Enterprise Technology"}
            </span>
          </div>
        </div>

        {/* Change Request Notice per Spec (§T-08) */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <Lock size={14} className="text-amber-700" />
            <span>Statutory Field Lock (§T-08 Covenants)</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Changes to your legal GSTIN, PAN, or billing state require verification against TRACES before updating your monthly tax invoice series.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Enter new 15-digit GSTIN..."
              value={requestedGstin}
              onChange={(e) => setRequestedGstin(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send size={12} /> Request GSTIN Update
            </button>
          </div>
          {gstinChangeRequested && (
            <p className="text-[11px] font-bold text-emerald-700">✓ Request submitted to Finance team.</p>
          )}
        </div>
      </div>

      {/* Authorized Contacts (§T-08 Repeating Group) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">Designated Contact Persons</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Invoice Recipients
          </span>
        </div>

        <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
          {(p.contacts || []).map((contact: any) => (
            <div key={contact.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-sm block">{contact.name}</span>
                <span className="text-[11px] text-slate-400 block">{contact.designation}</span>
                <div className="flex items-center gap-4 text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {contact.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {contact.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Receives Invoices & Notices
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences (§T-08) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" />
          <h2 className="text-base font-black text-slate-900">Notification Delivery Channels</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-bold text-slate-900 block">Email Delivery (Mandatory)</span>
              <span className="text-[11px] text-slate-400">
                Statutory GST invoices and official receipts are dispatched via signed PDF.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold">
              Mandatory (§T-08)
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-bold text-slate-900 block">WhatsApp Instant Payment Notices</span>
              <span className="text-[11px] text-slate-400">
                Receive Razorpay checkout links and receipts on authorized WhatsApp numbers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                whatsappEnabled ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  whatsappEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
