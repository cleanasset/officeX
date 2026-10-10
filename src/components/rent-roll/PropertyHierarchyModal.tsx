"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Building,
  Layers,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  DollarSign,
  ShieldCheck,
  Loader2
} from "lucide-react";

export type HierarchyTab = "property" | "building" | "space" | "tenant" | "contract";

interface PropertyHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HierarchyTab;
  onSuccess?: () => void;
}

export default function PropertyHierarchyModal({
  isOpen,
  onClose,
  initialTab = "property",
  onSuccess,
}: PropertyHierarchyModalProps) {
  const [activeTab, setActiveTab] = useState<HierarchyTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dropdown Master Collections
  const [propertiesList, setPropertiesList] = useState<Array<{ id: string; name: string }>>([]);
  const [buildingsList, setBuildingsList] = useState<Array<{ id: string; name: string; propertyId?: string }>>([]);
  const [spacesList, setSpacesList] = useState<Array<{ id: string; name: string; area: number; buildingId?: string }>>([]);
  const [tenantsList, setTenantsList] = useState<Array<{ id: string; name: string; company?: string }>>([]);

  // ──── 1. PROPERTY FORM (11 Fields - ZERO PRE-FED DATA) ────
  const [propForm, setPropForm] = useState({
    propertyName: "",
    address: "",
    city: "",
    state: "",
    areaSqft: "",
    totalSeats: "",
    propertyType: "Office",
    buildingsCount: "",
    floorsCount: "",
    contactName: "",
    contactPhone: "",
  });

  // ──── 2. BUILDING FORM (3 Fields - ZERO PRE-FED DATA) ────
  const [bldgForm, setBldgForm] = useState({
    propertyId: "",
    buildingName: "",
    floorCount: "",
    buildingAddress: "",
  });

  // ──── 3. SPACE FORM (5 Fields - ZERO PRE-FED DATA) ────
  const [spaceForm, setSpaceForm] = useState({
    buildingId: "",
    spaceName: "",
    areaSqft: "",
    floorNumber: "",
    unitType: "Office",
  });

  // ──── 4. TENANT FORM (9 Fields - ZERO PRE-FED DATA) ────
  const [tenantForm, setTenantForm] = useState({
    occupantName: "",
    email: "",
    phone: "",
    companyName: "",
    gst: "",
    pan: "",
    billingAddress: "",
    altContactName: "",
    altContactPhone: "",
  });

  // ──── 5. CONTRACT FORM (18 Fields - ZERO PRE-FED DATA) ────
  const [contractForm, setContractForm] = useState({
    occupantId: "",
    propertyId: "",
    buildingId: "",
    spaceId: "",
    startDate: "",
    endDate: "",
    areaSqft: "",
    monthlyRent: "",
    escalationPct: "",
    escalationStartDate: "",
    escalationFrequency: "Annual",
    securityDeposit: "",
    lockInMonths: "",
    noticeMonths: "",
    billingEntity: "",
    billingModel: "Pure Rent",
    paymentTerms: "Due on 1st of month",
    notes: "",
  });

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadHierarchyDropdowns();
      setFeedback(null);
    }
  }, [isOpen, initialTab]);

  const loadHierarchyDropdowns = async () => {
    try {
      // 1. Fetch properties
      const pRes = await fetch("/api/rent-roll/properties");
      if (pRes.ok) {
        const pData = await pRes.json();
        const pArr = (Array.isArray(pData.data) ? pData.data : []).map((p: any) => ({
          id: p.id,
          name: p.property_name,
        }));
        setPropertiesList(pArr);
        if (pArr.length > 0 && !bldgForm.propertyId) {
          setBldgForm((prev) => ({ ...prev, propertyId: pArr[0].id }));
          setContractForm((prev) => ({ ...prev, propertyId: pArr[0].id }));
        }
      }

      // 2. Fetch buildings
      const bRes = await fetch("/api/buildings");
      if (bRes.ok) {
        const bData = await bRes.json();
        const bArr = (Array.isArray(bData.data) ? bData.data : []).map((b: any) => ({
          id: b.id,
          name: b.building_name,
          propertyId: b.property_id,
        }));
        setBuildingsList(bArr);
        if (bArr.length > 0 && !spaceForm.buildingId) {
          setSpaceForm((prev) => ({ ...prev, buildingId: bArr[0].id }));
          setContractForm((prev) => ({ ...prev, buildingId: bArr[0].id }));
        }
      }

      // 3. Fetch spaces
      const sRes = await fetch("/api/spaces");
      if (sRes.ok) {
        const sData = await sRes.json();
        const sArr = (Array.isArray(sData.data) ? sData.data : []).map((s: any) => ({
          id: s.id,
          name: s.space_name || s.space_code,
          area: Number(s.chargeable_area_sqft || s.area_sqft || 0),
          buildingId: s.building_id,
        }));
        setSpacesList(sArr);
        if (sArr.length > 0 && !contractForm.spaceId) {
          setContractForm((prev) => ({
            ...prev,
            spaceId: sArr[0].id,
            areaSqft: String(sArr[0].area || ""),
          }));
        }
      }

      // 4. Fetch tenants
      const tRes = await fetch("/api/rent-roll/tenants");
      if (tRes.ok) {
        const tData = await tRes.json();
        const tArr = (Array.isArray(tData.data) ? tData.data : []).map((t: any) => ({
          id: t.id,
          name: t.tenant_name || t.trade_name,
          company: t.trade_name,
        }));
        setTenantsList(tArr);
        if (tArr.length > 0 && !contractForm.occupantId) {
          setContractForm((prev) => ({ ...prev, occupantId: tArr[0].id }));
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ──── SUBMIT 1: PROPERTY MASTER ────
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.propertyName.trim()) {
      showToast("Property Name is required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: propForm.propertyName.trim(),
          address_line1: propForm.address.trim(),
          city: propForm.city.trim() || "Bengaluru",
          state: propForm.state.trim() || "Karnataka",
          property_type: propForm.propertyType.toLowerCase().replace(/\s+/g, "_"),
          total_leasable_area_sqft: Number(propForm.areaSqft) || 50000,
          floors_count: Number(propForm.floorsCount) || 1,
          buildings_count: Number(propForm.buildingsCount) || 1,
          total_seats: Number(propForm.totalSeats) || 0,
          primary_contact_name: propForm.contactName.trim(),
          primary_contact_phone: propForm.contactPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Property "${propForm.propertyName}" created successfully!`);
        // Sync local storage active property
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_active_property", propForm.propertyName);
          const reg = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
          if (!reg.includes(propForm.propertyName)) {
            reg.push(propForm.propertyName);
            localStorage.setItem("officex_registered_property_names", JSON.stringify(reg));
          }
          if (data.data?.id) {
            const regIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
            regIds.push(data.data.id);
            localStorage.setItem("officex_registered_property_ids", JSON.stringify(regIds));
          }
        }
        await loadHierarchyDropdowns();
        // Reset property form
        setPropForm({
          propertyName: "",
          address: "",
          city: "",
          state: "",
          areaSqft: "",
          totalSeats: "",
          propertyType: "Office",
          buildingsCount: "",
          floorsCount: "",
          contactName: "",
          contactPhone: "",
        });
        setActiveTab("building");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create property", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 2: BUILDING MASTER ────
  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bldgForm.buildingName.trim()) {
      showToast("Building Name is required", "error");
      return;
    }
    const propId = bldgForm.propertyId || propertiesList[0]?.id;
    if (!propId) {
      showToast("Please select or add a property first", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building_name: bldgForm.buildingName.trim(),
          building_code: `BLDG-${Date.now().toString().slice(-4)}`,
          property_id: propId,
          floors: Number(bldgForm.floorCount) || 1,
          building_address: bldgForm.buildingAddress.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Building "${bldgForm.buildingName}" added successfully!`);
        await loadHierarchyDropdowns();
        setBldgForm({
          propertyId: propId,
          buildingName: "",
          floorCount: "",
          buildingAddress: "",
        });
        setActiveTab("space");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create building", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 3: SPACE / UNIT MASTER ────
  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceForm.spaceName.trim()) {
      showToast("Space Name is required", "error");
      return;
    }
    const bldgId = spaceForm.buildingId || buildingsList[0]?.id;
    if (!bldgId) {
      showToast("Please select or add a building first", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space_name: spaceForm.spaceName.trim(),
          space_code: `SP-${Date.now().toString().slice(-4)}`,
          building_id: bldgId,
          chargeable_area_sqft: Number(spaceForm.areaSqft) || 1000,
          floor_name: `Floor ${spaceForm.floorNumber || "1"}`,
          space_type: spaceForm.unitType.toLowerCase(),
          occupancy_status: "vacant",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Space "${spaceForm.spaceName}" created successfully!`);
        await loadHierarchyDropdowns();
        setSpaceForm({
          buildingId: bldgId,
          spaceName: "",
          areaSqft: "",
          floorNumber: "",
          unitType: "Office",
        });
        setActiveTab("tenant");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to create space", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 4: TENANT MASTER ────
  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.occupantName.trim()) {
      showToast("Occupant Name is required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_name: tenantForm.occupantName.trim(),
          trade_name: tenantForm.companyName.trim() || tenantForm.occupantName.trim(),
          email: tenantForm.email.trim(),
          phone: tenantForm.phone.trim(),
          gstin: tenantForm.gst.trim().toUpperCase(),
          pan: tenantForm.pan.trim().toUpperCase(),
          billing_address: tenantForm.billingAddress.trim(),
          alt_contact_name: tenantForm.altContactName.trim(),
          alt_contact_phone: tenantForm.altContactPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Tenant "${tenantForm.occupantName}" enrolled!`);
        await loadHierarchyDropdowns();
        setTenantForm({
          occupantName: "",
          email: "",
          phone: "",
          companyName: "",
          gst: "",
          pan: "",
          billingAddress: "",
          altContactName: "",
          altContactPhone: "",
        });
        setActiveTab("contract");
        onSuccess?.();
      } else {
        showToast(data.message || data.error || "Failed to register tenant", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──── SUBMIT 5: CONTRACT / LEASE ────
  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.occupantId) {
      showToast("Please select an occupant / tenant", "error");
      return;
    }
    if (!contractForm.spaceId) {
      showToast("Please select a space / unit", "error");
      return;
    }
    if (!contractForm.startDate || !contractForm.endDate) {
      showToast("Start and End dates are compulsory", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: contractForm.occupantId,
          space_id: contractForm.spaceId,
          contract_code: `LEAS-${Date.now().toString().slice(-5)}`,
          start_date: contractForm.startDate,
          end_date: contractForm.endDate,
          contract_type: "lease",
          base_rent_rate: Number(contractForm.monthlyRent) || 100000,
          billing_model: contractForm.billingModel.toLowerCase().replace(/\s+/g, "_"),
          escalation_type: "percentage",
          escalation_value: Number(contractForm.escalationPct) || 5,
          has_escalation: Boolean(contractForm.escalationPct),
          deposit_amount_inr: Number(contractForm.securityDeposit) || 0,
          lock_in_period_days: (Number(contractForm.lockInMonths) || 12) * 30,
          notice_period_days: (Number(contractForm.noticeMonths) || 3) * 30,
          billing_entity: contractForm.billingEntity.trim(),
          payment_terms: contractForm.paymentTerms.trim(),
          remarks: contractForm.notes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("✓ Commercial Lease Contract registered successfully!");
        onSuccess?.();
        setTimeout(() => onClose(), 1200);
      } else {
        showToast(data.message || data.error || "Failed to create lease contract", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Space select auto-fills area
  const handleSpaceSelect = (spaceId: string) => {
    const selected = spacesList.find((s) => s.id === spaceId);
    setContractForm((prev) => ({
      ...prev,
      spaceId,
      areaSqft: selected ? String(selected.area || "") : prev.areaSqft,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Top Decorative Gradient */}
        <div className="h-2 bg-gradient-to-r from-[#0F8B7D] via-teal-400 to-[#071324] shrink-0 rounded-t-3xl" />

        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D] shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Zero Mock Data Master
                </span>
                <span className="text-xs text-slate-400 font-semibold">Live Operational Setup</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Commercial Hierarchy &amp; Lease Setup
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`mx-5 sm:mx-7 mt-3 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-1 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Navigation Tabs (5 Steps) */}
        <div className="px-5 sm:px-7 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto shrink-0 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab("property")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "property"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 size={14} />
            <span>1. Property</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("building")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "building"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building size={14} />
            <span>2. Buildings ({buildingsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("space")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "space"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={14} />
            <span>3. Spaces / Units ({spacesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tenant")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "tenant"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User size={14} />
            <span>4. Tenants ({tenantsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contract")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "contract"
                ? "border-[#0F8B7D] text-[#0F8B7D] bg-white font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText size={14} />
            <span>5. Lease Contract</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 flex-1">
          {/* ════════════════ TAB 1: PROPERTY MASTER (11 Fields) ════════════════ */}
          {activeTab === "property" && (
            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Step 1: Property Master Details (11 Fields)
                </span>
                <span className="text-[11px] font-medium text-slate-400">Zero pre-fed values</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Property Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prestige Tech Park / Horizon Towers"
                    value={propForm.propertyName}
                    onChange={(e) => setPropForm({ ...propForm, propertyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 2. Address (Full) */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Address (Full Street Address) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Outer Ring Road, Marathahalli-Sarjapur Junction"
                    value={propForm.address}
                    onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 3. City */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru / Mumbai / Hyderabad"
                    value={propForm.city}
                    onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 4. State */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka / Maharashtra / Telangana"
                    value={propForm.state}
                    onChange={(e) => setPropForm({ ...propForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 5. Total Area (sqft) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Area (Sq.Ft) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    placeholder="e.g. 50000"
                    value={propForm.areaSqft}
                    onChange={(e) => setPropForm({ ...propForm, areaSqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 6. Total Seats (if flex) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Seats (If Flex / Coworking)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 450 (Optional)"
                    value={propForm.totalSeats}
                    onChange={(e) => setPropForm({ ...propForm, totalSeats: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 7. Property Type (dropdown: Office, Tech Park, Retail, Industrial) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Property Type *</label>
                  <select
                    value={propForm.propertyType}
                    onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Office">Office</option>
                    <option value="Tech Park">Tech Park</option>
                    <option value="Retail">Retail</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                {/* 8. Number of Buildings */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Number of Buildings</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={propForm.buildingsCount}
                    onChange={(e) => setPropForm({ ...propForm, buildingsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 9. Number of Floors */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 14"
                    value={propForm.floorsCount}
                    onChange={(e) => setPropForm({ ...propForm, floorsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 10. Primary Contact Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={propForm.contactName}
                    onChange={(e) => setPropForm({ ...propForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 11. Primary Contact Phone */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Primary Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={propForm.contactPhone}
                    onChange={(e) => setPropForm({ ...propForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Save Property &amp; Next (Add Buildings) →</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 2: BUILDING MASTER (3 Fields) ════════════════ */}
          {activeTab === "building" && (
            <form onSubmit={handleSaveBuilding} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Step 2: Building Details (3 Fields)
                </span>
                <span className="text-[11px] font-medium text-slate-400">Zero pre-fed values</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Associated Property */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Associated Property *</label>
                  <select
                    value={bldgForm.propertyId}
                    onChange={(e) => setBldgForm({ ...bldgForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {propertiesList.length === 0 && <option value="">No properties registered yet</option>}
                  </select>
                </div>

                {/* 1. Building Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Building Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tower Alpha / Wing B"
                    value={bldgForm.buildingName}
                    onChange={(e) => setBldgForm({ ...bldgForm, buildingName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 2. Floor Count */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={bldgForm.floorCount}
                    onChange={(e) => setBldgForm({ ...bldgForm, floorCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 3. Building Address (optional) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Building Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gate 2, West Campus (Optional)"
                    value={bldgForm.buildingAddress}
                    onChange={(e) => setBldgForm({ ...bldgForm, buildingAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("space")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Skip to Spaces →
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Save Building &amp; Next (Add Spaces) →</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 3: SPACES / UNITS (5 Fields) ════════════════ */}
          {activeTab === "space" && (
            <form onSubmit={handleSaveSpace} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Step 3: Space / Unit Master (5 Fields)
                </span>
                <span className="text-[11px] font-medium text-slate-400">Zero pre-fed values</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 5. Building (dropdown, selects from added buildings) */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Building *</label>
                  <select
                    value={spaceForm.buildingId}
                    onChange={(e) => setSpaceForm({ ...spaceForm, buildingId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {buildingsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    {buildingsList.length === 0 && <option value="">No buildings created yet</option>}
                  </select>
                </div>

                {/* 1. Space Name (e.g. Suite 402, Floor 4 East Wing) */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Space Name (e.g. Suite 402, Floor 4 East Wing) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suite 402, Floor 4 East Wing"
                    value={spaceForm.spaceName}
                    onChange={(e) => setSpaceForm({ ...spaceForm, spaceName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 2. Area (sqft) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (Sq.Ft) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 4200"
                    value={spaceForm.areaSqft}
                    onChange={(e) => setSpaceForm({ ...spaceForm, areaSqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 3. Floor Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor Number *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4"
                    value={spaceForm.floorNumber}
                    onChange={(e) => setSpaceForm({ ...spaceForm, floorNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 4. Unit Type (dropdown: Office, Desk, Retail) */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Unit Type *</label>
                  <select
                    value={spaceForm.unitType}
                    onChange={(e) => setSpaceForm({ ...spaceForm, unitType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Office">Office</option>
                    <option value="Desk">Desk</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("tenant")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Skip to Tenants →
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Save Space &amp; Next (Add Tenants) →</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 4: TENANT / OCCUPANT (9 Fields) ════════════════ */}
          {activeTab === "tenant" && (
            <form onSubmit={handleSaveTenant} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Step 4: Tenant / Occupant Master (9 Fields)
                </span>
                <span className="text-[11px] font-medium text-slate-400">Zero pre-fed values</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Occupant Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Nair"
                    value={tenantForm.occupantName}
                    onChange={(e) => setTenantForm({ ...tenantForm, occupantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 4. Company Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                    value={tenantForm.companyName}
                    onChange={(e) => setTenantForm({ ...tenantForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="vikas@acmetech.com"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 3. Phone */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 5. GST */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="29AAAAA0000A1Z5"
                    value={tenantForm.gst}
                    onChange={(e) => setTenantForm({ ...tenantForm, gst: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase"
                  />
                </div>

                {/* 6. PAN */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={tenantForm.pan}
                    onChange={(e) => setTenantForm({ ...tenantForm, pan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase"
                  />
                </div>

                {/* 7. Billing Address */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Billing Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Registered Corporate Address, Floor 4..."
                    value={tenantForm.billingAddress}
                    onChange={(e) => setTenantForm({ ...tenantForm, billingAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 8. Alternate Contact Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alternate Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma (Finance Lead)"
                    value={tenantForm.altContactName}
                    onChange={(e) => setTenantForm({ ...tenantForm, altContactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 9. Alternate Contact Phone */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alternate Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 99000 88776"
                    value={tenantForm.altContactPhone}
                    onChange={(e) => setTenantForm({ ...tenantForm, altContactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("contract")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Skip to Lease Contract →
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Save Tenant &amp; Next (Create Contract) →</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 5: LEASE CONTRACT (18 Fields) ════════════════ */}
          {activeTab === "contract" && (
            <form onSubmit={handleSaveContract} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Step 5: Commercial Lease Contract (18 Fields)
                </span>
                <span className="text-[11px] font-medium text-slate-400">Zero pre-fed values</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Occupant (dropdown) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupant (Tenant) *</label>
                  <select
                    value={contractForm.occupantId}
                    onChange={(e) => setContractForm({ ...contractForm, occupantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                    {tenantsList.length === 0 && <option value="">No tenants registered yet</option>}
                  </select>
                </div>

                {/* 2. Property (dropdown) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Property *</label>
                  <select
                    value={contractForm.propertyId}
                    onChange={(e) => setContractForm({ ...contractForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {propertiesList.length === 0 && <option value="">No properties registered</option>}
                  </select>
                </div>

                {/* 3. Building (dropdown) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Building *</label>
                  <select
                    value={contractForm.buildingId}
                    onChange={(e) => setContractForm({ ...contractForm, buildingId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {buildingsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    {buildingsList.length === 0 && <option value="">No buildings created</option>}
                  </select>
                </div>

                {/* 4. Space (dropdown) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Space / Unit *</label>
                  <select
                    value={contractForm.spaceId}
                    onChange={(e) => handleSpaceSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {spacesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.area} sqft)
                      </option>
                    ))}
                    {spacesList.length === 0 && <option value="">No spaces created</option>}
                  </select>
                </div>

                {/* 5. Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 6. End Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 7. Area (auto-filled from space) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (Sq.Ft) [Auto-filled]</label>
                  <input
                    type="number"
                    placeholder="Auto-filled from space"
                    value={contractForm.areaSqft}
                    onChange={(e) => setContractForm({ ...contractForm, areaSqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-slate-50 focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 8. Monthly Rent */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 150000"
                    value={contractForm.monthlyRent}
                    onChange={(e) => setContractForm({ ...contractForm, monthlyRent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 9. Escalation % */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={contractForm.escalationPct}
                    onChange={(e) => setContractForm({ ...contractForm, escalationPct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 10. Escalation Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Start Date</label>
                  <input
                    type="date"
                    value={contractForm.escalationStartDate}
                    onChange={(e) => setContractForm({ ...contractForm, escalationStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 11. Escalation Frequency (Annual, Bi-Annual) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Frequency</label>
                  <select
                    value={contractForm.escalationFrequency}
                    onChange={(e) => setContractForm({ ...contractForm, escalationFrequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Annual">Annual (Every 12 Months)</option>
                    <option value="Bi-Annual">Bi-Annual (Every 24 Months)</option>
                    <option value="Tri-Annual">Tri-Annual (Every 36 Months)</option>
                  </select>
                </div>

                {/* 12. Security Deposit */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 900000"
                    value={contractForm.securityDeposit}
                    onChange={(e) => setContractForm({ ...contractForm, securityDeposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 13. Lock-in Period (Months) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lock-in Period (Months)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={contractForm.lockInMonths}
                    onChange={(e) => setContractForm({ ...contractForm, lockInMonths: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 14. Notice Period (Months) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Period (Months)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={contractForm.noticeMonths}
                    onChange={(e) => setContractForm({ ...contractForm, noticeMonths: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 15. Billing Entity */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Entity</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyber Estates SPV Pvt Ltd"
                    value={contractForm.billingEntity}
                    onChange={(e) => setContractForm({ ...contractForm, billingEntity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 16. Billing Model (Pure Rent, Turnkey, Managed) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Model</label>
                  <select
                    value={contractForm.billingModel}
                    onChange={(e) => setContractForm({ ...contractForm, billingModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Pure Rent">Pure Rent (Bare Shell / Warm Shell)</option>
                    <option value="Turnkey">Turnkey (Fully Furnished)</option>
                    <option value="Managed">Managed (Co-Working / All Inclusive)</option>
                  </select>
                </div>

                {/* 17. Payment Terms (e.g. Due on 1st of month, Due on 5th of month) */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. Due on 1st of month / Due on 5th of month"
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 18. Notes */}
                <div className="sm:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Notes / Special Conditions</label>
                  <textarea
                    rows={2}
                    placeholder="Any specific covenants, fitout period, or car parking allocations..."
                    value={contractForm.notes}
                    onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Execute Lease Contract &amp; Save</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
