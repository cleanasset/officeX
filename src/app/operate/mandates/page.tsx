"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Landmark,
  User,
  Mail,
  Phone,
  Percent,
  X,
  FileText
} from "lucide-react";

interface MandateItem {
  id: string;
  account_code: string;
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  portal_access_enabled: boolean;
  status: string;
  mandate: {
    mandate_name: string;
    fee_model: string;
    fee_rate_pct: number;
    gst_rate_pct: number;
    settlement_type: string;
    statement_day: number;
    remittance_day: number;
    start_date: string;
    end_date: string;
    is_expiring_soon: boolean;
    services_mandated: string[];
    collection_bank: {
      bank_name: string;
      account_number: string;
      ifsc_code: string;
    };
  };
}

export default function MandatesPage() {
  const [clients, setClients] = useState<MandateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<MandateItem | null>(null);

  // Form states
  const [clientName, setClientName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [feeRate, setFeeRate] = useState("4.0");
  const [settlementType, setSettlementType] = useState("direct_to_owner");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2027-09-30");

  useEffect(() => {
    fetchMandates();
  }, []);

  const fetchMandates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mandates");
      const json = await res.json();
      if (json.success && json.data) {
        setClients(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          account_code: accountCode,
          contact_person: contactPerson,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          fee_rate_pct: parseFloat(feeRate),
          settlement_type: settlementType,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        fetchMandates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-28 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Screen S-56
              </span>
              <span className="text-xs text-slate-500 font-mono">Third-Party Operator Mandates</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Briefcase className="text-[#0D7B6C] shrink-0" size={24} />
              Client Accounts &amp; Mandates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage landlord client portfolios, operator management fee % rules, collection bank accounts, and statement schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus size={16} /> New Client Mandate
            </button>
          </div>
        </div>

        {/* AL-17 Alert Banner if any mandate is expiring within 60 days */}
        {clients.some((c) => c.mandate.is_expiring_soon) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Alert AL-17: Mandate Expiry Cadence (60-Day Window)</div>
              <p className="text-xs text-amber-700 mt-0.5">
                Management mandate for <strong>{clients.find((c) => c.mandate.is_expiring_soon)?.name}</strong> expires on <strong>{clients.find((c) => c.mandate.is_expiring_soon)?.mandate.end_date}</strong> (less than 60 days). Initiate contract renewal or data handover protocol per RR-OPR-09.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading client accounts & operator mandates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {client.account_code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{client.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 uppercase">
                      {client.status}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User size={14} className="text-slate-400" />
                      <span>{client.contact_person}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{client.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{client.contact_phone}</span>
                    </div>
                  </div>

                  {/* Mandate Terms */}
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Operator Mgmt Fee:</span>
                      <span className="font-bold text-[#0D7B6C] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {client.mandate.fee_rate_pct}% + {client.mandate.gst_rate_pct}% GST
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Settlement Model:</span>
                      <span className="font-semibold text-slate-800">
                        {client.mandate.settlement_type === "direct_to_owner" ? "Direct to Owner (OI-6)" : "Operator Escrow"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Cadence Schedule:</span>
                      <span className="font-semibold text-slate-800">
                        Stmt {client.mandate.statement_day}th • Remit {client.mandate.remittance_day}th
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Mandate Expiry:</span>
                      <span className={`font-semibold ${client.mandate.is_expiring_soon ? "text-amber-600 font-bold" : "text-slate-800"}`}>
                        {client.mandate.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Mandated Services */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Mandated Scope</div>
                    <div className="flex flex-wrap gap-1">
                      {client.mandate.services_mandated.slice(0, 3).map((srv, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded font-medium">
                          {srv}
                        </span>
                      ))}
                      {client.mandate.services_mandated.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{client.mandate.services_mandated.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a
                    href={`/operate/owner-statements?client_account_id=${client.id}`}
                    className="text-xs font-bold text-[#0D7B6C] hover:underline flex items-center gap-1"
                  >
                    View Statements <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Edit Mandate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Client Mandate Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Add Managed Client & Mandate (S-56)</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMandate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Client Entity Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Prestige Commercial Trust"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D7B6C] text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Account Code *</label>
                    <input
                      type="text"
                      required
                      value={accountCode}
                      onChange={(e) => setAccountCode(e.target.value)}
                      placeholder="e.g. PRESTIGE-01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D7B6C] text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Trustee / Director"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@entity.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Management Fee % on Collections (F-20)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={feeRate}
                      onChange={(e) => setFeeRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Settlement Model</label>
                    <select
                      value={settlementType}
                      onChange={(e) => setSettlementType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="direct_to_owner">Direct to Owner Bank Account (OI-6)</option>
                      <option value="operator_escrow">Operator Escrow Settlement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mandate Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mandate Expiry Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm"
                  >
                    Save Client & Activate Mandate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
