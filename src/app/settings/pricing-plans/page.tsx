"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  Check,
  Building2,
  Clock,
  ArrowLeft,
  Shield,
  Coffee,
  Wifi,
  Sparkles,
} from "lucide-react";

interface ChargeableExtra {
  item: string;
  rate: number;
  unit: string;
}

interface PricingPlan {
  id: string;
  org_id: string;
  property_id: string;
  property_name: string | null;
  plan_name: string;
  seat_type: string;
  rate_per_month: string;
  rate_period: string;
  inclusions: string[] | null;
  chargeable_extras: ChargeableExtra[] | null;
  property_ids: string[] | null;
  security_deposit_months: number;
  is_active: boolean;
  created_at: string;
}

export default function PricingPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [seatType, setSeatType] = useState("dedicated_desk");
  const [rate, setRate] = useState("");
  const [ratePeriod, setRatePeriod] = useState("month");
  const [depositMonths, setDepositMonths] = useState(2);
  const [inclusions, setInclusions] = useState<string[]>([
    "high_speed_wifi",
    "electricity",
    "housekeeping",
    "tea_coffee",
  ]);
  const [extras, setExtras] = useState<ChargeableExtra[]>([
    { item: "Meeting Room Credits", rate: 800, unit: "hour" },
    { item: "Reserved Parking Slot", rate: 4000, unit: "slot/month" },
  ]);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableInclusions = [
    { key: "high_speed_wifi", label: "High-Speed Internet" },
    { key: "electricity", label: "Utility Electricity" },
    { key: "dg_backup", label: "100% DG Power Backup" },
    { key: "cam", label: "Common Area Maintenance (CAM)" },
    { key: "housekeeping", label: "Daily Housekeeping" },
    { key: "tea_coffee", label: "Unlimited Tea & Gourmet Coffee" },
    { key: "meeting_room_credits", label: "Bundled Meeting Room Hours (5h/mo)" },
    { key: "reception_concierge", label: "Front Desk & Mail Handling" },
  ];

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/flex/pricing-plans");
      if (res.ok) {
        const json = await res.json();
        setPlans(json.plans || []);
        setProperties(json.properties || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan?: PricingPlan) => {
    if (plan) {
      setEditingId(plan.id);
      setPlanName(plan.plan_name);
      setSeatType(plan.seat_type);
      setRate(String(Number(plan.rate_per_month)));
      setRatePeriod(plan.rate_period || "month");
      setDepositMonths(plan.security_deposit_months || 2);
      setInclusions(Array.isArray(plan.inclusions) ? plan.inclusions : []);
      setExtras(Array.isArray(plan.chargeable_extras) ? plan.chargeable_extras : []);
      setIsActive(plan.is_active);
    } else {
      setEditingId(null);
      setPlanName("");
      setSeatType("dedicated_desk");
      setRate("");
      setRatePeriod("month");
      setDepositMonths(2);
      setInclusions(["high_speed_wifi", "electricity", "housekeeping", "tea_coffee"]);
      setExtras([
        { item: "Meeting Room Credits", rate: 800, unit: "hour" },
        { item: "Reserved Parking Slot", rate: 4000, unit: "slot/month" },
      ]);
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleToggleInclusion = (key: string) => {
    setInclusions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAddExtra = () => {
    setExtras([...extras, { item: "", rate: 500, unit: "hour" }]);
  };

  const handleRemoveExtra = (idx: number) => {
    setExtras(extras.filter((_, i) => i !== idx));
  };

  const handleExtraChange = (idx: number, field: keyof ChargeableExtra, val: any) => {
    setExtras(
      extras.map((ex, i) => (i === idx ? { ...ex, [field]: val } : ex))
    );
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !rate) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/flex/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          plan_name: planName,
          seat_type: seatType,
          rate_per_month: Number(rate),
          rate_period: ratePeriod,
          security_deposit_months: depositMonths,
          inclusions,
          chargeable_extras: extras.filter((ex) => ex.item.trim().length > 0),
          is_active: isActive,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotice(json.message);
        setModalOpen(false);
        fetchPlans();
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(json.error || "Failed to save pricing plan");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Link href="/operations/seat-counts" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Operations S-32
              </Link>
              <span>•</span>
              <span>Screen S-15</span>
              <span>•</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Flex & Seats Add-on
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Pricing Plans Master
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Reusable desk packages, bundled amenities, security deposit months, and chargeable overtime extras.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchPlans()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-lg text-xs shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Pricing Plan</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        {/* Pricing Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-2xl hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {p.seat_type.replace("_", " ")}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      p.is_active ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-slate-800"
                    }`}
                  >
                    {p.is_active ? "Active" : "Archived"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{p.plan_name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ₹{Number(p.rate_per_month).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400">/ seat / {p.rate_period || "month"}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Deposit: {p.security_deposit_months} months security deposit
                </div>

                {/* Inclusions */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Included Amenities:</div>
                  <div className="space-y-1.5">
                    {(p.inclusions || []).map((inc) => (
                      <div key={inc} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="capitalize">{inc.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chargeable Extras */}
                {p.chargeable_extras && p.chargeable_extras.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-300 mb-2">Chargeable Overages:</div>
                    <div className="space-y-1">
                      {p.chargeable_extras.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                          <span>{ex.item}</span>
                          <span className="font-mono text-slate-300 font-medium">
                            ₹{ex.rate}/{ex.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleOpenModal(p)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Plan Modal (Screen S-15) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingId ? "Edit Pricing Plan" : "Create Pricing Plan (S-15)"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define seat rates, inclusions, and extras</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePlan} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Dedicated Cabin Seat"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Seat Type *</label>
                  <select
                    value={seatType}
                    onChange={(e) => setSeatType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dedicated_desk">dedicated_desk</option>
                    <option value="hot_desk">hot_desk</option>
                    <option value="cabin_seat">cabin_seat</option>
                    <option value="team_room_seat">team_room_seat</option>
                    <option value="virtual_office">virtual_office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rate per Seat (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Billing Period</label>
                  <select
                    value={ratePeriod}
                    onChange={(e) => setRatePeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="month">month</option>
                    <option value="quarter">quarter</option>
                    <option value="day">day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Security Deposit Months</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={depositMonths}
                    onChange={(e) => setDepositMonths(parseInt(e.target.value, 10) || 2)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Included Services & Amenities (Multi-select)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {availableInclusions.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={inclusions.includes(item.key)}
                        onChange={() => handleToggleInclusion(item.key)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chargeable Extras */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">Chargeable Overages & Extras</label>
                  <button
                    type="button"
                    onClick={handleAddExtra}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Extra
                  </button>
                </div>

                <div className="space-y-2">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Meeting Room"
                        value={ex.item}
                        onChange={(e) => handleExtraChange(idx, "item", e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={ex.rate}
                        onChange={(e) => handleExtraChange(idx, "rate", Number(e.target.value))}
                        className="w-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Unit (hour/slot)"
                        value={ex.unit}
                        onChange={(e) => handleExtraChange(idx, "unit", e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExtra(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
                  />
                  <span>Active Pricing Plan</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    {submitting ? "Saving..." : "Save Pricing Plan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
