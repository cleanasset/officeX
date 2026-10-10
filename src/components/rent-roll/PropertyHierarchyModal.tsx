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
  Loader2,
  Copy,
  Check
} from "lucide-react";
import GoogleAddressAutocomplete, {
  AddressAutofillResult,
} from "@/components/common/GoogleAddressAutocomplete";


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

  // Subscribed Capacity (Sq.Ft ceiling from active plan)
  const [subscribedCapacity, setSubscribedCapacity] = useState<number>(50000);

  // Generated Tenant Invite Link
  const [latestTenantInvite, setLatestTenantInvite] = useState<{
    name: string;
    email: string;
    link: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Billing SPV Entities
  const [billingEntities, setBillingEntities] = useState<string[]>([]);

  // Dropdown Master Collections
  const [propertiesList, setPropertiesList] = useState<Array<{ id: string; name: string }>>([]);
  const [buildingsList, setBuildingsList] = useState<Array<{ id: string; name: string; propertyId?: string }>>([]);
  const [spacesList, setSpacesList] = useState<Array<{ id: string; name: string; area: number; buildingId?: string }>>([]);
  const [tenantsList, setTenantsList] = useState<Array<{ id: string; name: string; company?: string }>>([]);

  // ──── 1. PROPERTY FORM (11 Fields) ────
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

  // ──── 2. BUILDING FORM (3 Fields) ────
  const [bldgForm, setBldgForm] = useState({
    propertyId: "",
    buildingName: "",
    floorCount: "",
    buildingAddress: "",
  });

  // ──── 3. SPACE FORM (5 Fields) ────
  const [spaceForm, setSpaceForm] = useState({
    buildingId: "",
    spaceName: "",
    areaSqft: "",
    floorNumber: "",
    unitType: "Office",
  });

  // ──── 4. TENANT FORM (9 Fields) ────
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

  // ──── 5. CONTRACT FORM (18 Fields) ────
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
    noticeDays: "90",
    billingEntity: "",
    billingModel: "Area-based",
    paymentTerms: "Net 30",
    notes: "",
  });

  // Sync and pre-populate onboarding details when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadHierarchyDropdowns();
      setFeedback(null);

      if (typeof window !== "undefined") {
        // 1. Subscribed Capacity
        const storedCap = Number(localStorage.getItem("officex_subscribed_sqft"));
        if (storedCap && !isNaN(storedCap) && storedCap > 0) {
          setSubscribedCapacity(storedCap);
        }

        // 2. Pre-populate Step 1 from Onboarding if available
        const rawOb = localStorage.getItem("officex_onboarded_property_details");
        if (rawOb) {
          try {
            const ob = JSON.parse(rawOb);
            setPropForm((prev) => ({
              propertyName: prev.propertyName || ob.propertyName || localStorage.getItem("officex_active_property") || "",
              address: prev.address || ob.address || "",
              city: prev.city || ob.city || "Bengaluru",
              state: prev.state || ob.state || "Karnataka",
              areaSqft: prev.areaSqft || (ob.areaSqft ? String(ob.areaSqft) : ""),
              totalSeats: prev.totalSeats || (ob.totalSeats ? String(ob.totalSeats) : ""),
              propertyType: prev.propertyType || ob.propertyType || "Office",
              buildingsCount: prev.buildingsCount || (ob.buildingsCount || ob.wingsCount ? String(ob.buildingsCount || ob.wingsCount) : "1"),
              floorsCount: prev.floorsCount || (ob.floorsCount ? String(ob.floorsCount) : "1"),
              contactName: prev.contactName || ob.contactName || ob.managerName || "",
              contactPhone: prev.contactPhone || ob.contactPhone || "",
            }));

            // Pre-populate Billing SPV
            const spv = ob.spvName || ob.companyName || localStorage.getItem("officex_company_name") || "";
            if (spv) {
              setBillingEntities((prev) => Array.from(new Set([...prev, spv])));
              setContractForm((prev) => ({
                ...prev,
                billingEntity: prev.billingEntity || spv,
              }));
            }
          } catch {
            // Non-blocking fallback
          }
        } else {
          const activeProp = localStorage.getItem("officex_active_property");
          if (activeProp) {
            setPropForm((prev) => ({ ...prev, propertyName: prev.propertyName || activeProp }));
          }
          const comp = localStorage.getItem("officex_company_name");
          if (comp) {
            setBillingEntities((prev) => Array.from(new Set([...prev, comp])));
            setContractForm((prev) => ({ ...prev, billingEntity: prev.billingEntity || comp }));
          }
        }
      }
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
    const enteredArea = Number(propForm.areaSqft) || 0;
    if (subscribedCapacity > 0 && enteredArea > subscribedCapacity) {
      showToast(
        `Total leasable area (${enteredArea.toLocaleString()} Sq.Ft) cannot exceed your subscribed capacity (${subscribedCapacity.toLocaleString()} Sq.Ft).`,
        "error"
      );
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
          total_leasable_area_sqft: enteredArea || 50000,
          floors_count: Number(propForm.floorsCount) || 1,
          buildings_count: Number(propForm.buildingsCount) || 1,
          total_seats: Number(propForm.totalSeats) || 0,
          primary_contact_name: propForm.contactName.trim(),
          primary_contact_phone: propForm.contactPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Property "${propForm.propertyName}" registered successfully!`);
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
    if (!tenantForm.email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!tenantForm.phone.trim()) {
      showToast("Phone is required", "error");
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
        // Generate Tenant Portal Invite Link
        const origin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_APP_URL || "https://office-x-cleanassets-projects.vercel.app");
        const activePropName =
          propertiesList.find((p) => p.id === contractForm.propertyId)?.name ||
          (typeof window !== "undefined" && localStorage.getItem("officex_active_property")) ||
          propForm.propertyName ||
          "Commercial Property";
        const ownerBrand =
          (typeof window !== "undefined" && (localStorage.getItem("officex_company_name") || localStorage.getItem("officex_brand_name"))) ||
          "Commercial Asset Owner";
        const inviteToken = `ten_${Date.now()}`;
        const inviteUrl = `${origin}/invite?role=tenant&mgr=${encodeURIComponent(tenantForm.occupantName.trim())}&email=${encodeURIComponent(tenantForm.email.trim())}&prop=${encodeURIComponent(activePropName)}&owner=${encodeURIComponent(ownerBrand)}&invite=${inviteToken}`;

        setLatestTenantInvite({
          name: tenantForm.occupantName.trim(),
          email: tenantForm.email.trim(),
          link: inviteUrl,
        });

        showToast(`✓ Tenant "${tenantForm.occupantName}" enrolled! Portal invite generated.`);
        await loadHierarchyDropdowns();

        // Auto-select newly created tenant in Step 5 (Contract)
        if (data.data?.id) {
          setContractForm((prev) => ({
            ...prev,
            occupantId: data.data.id,
          }));
        }

        // Reset tenant form
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

        // Switch to contract creation
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
          escalation_value: Number(contractForm.escalationPct) || 0,
          has_escalation: Boolean(Number(contractForm.escalationPct) > 0),
          deposit_amount_inr: Number(contractForm.securityDeposit) || 0,
          lock_in_period_days: (Number(contractForm.lockInMonths) || 0) * 30,
          notice_period_days: Number(contractForm.noticeDays) || 90,
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
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Auto-populated from onboarding
                </span>
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

                {/* 2. Address (Full) - Google Maps Autocomplete */}
                <div className="sm:col-span-2">
                  <GoogleAddressAutocomplete
                    value={propForm.address}
                    onChange={(val) => setPropForm((prev) => ({ ...prev, address: val }))}
                    onAddressSelect={(res: AddressAutofillResult) => {
                      setPropForm((prev) => ({
                        ...prev,
                        address: res.streetAddress || res.fullAddress,
                        city: res.city || prev.city,
                        state: res.state || prev.state,
                      }));
                    }}
                    label="Address (Full Street Address)"
                    placeholder="Search building, landmark, or street on Google Maps..."
                    required
                    hint="Type any building or street. Selecting an address autofills City and State."
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

                {/* 5. Total Area (sqft) - Capped at Subscribed Capacity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Total Leasable Area (Sq.Ft) *</label>
                    {subscribedCapacity > 0 && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Subscribed Cap: {subscribedCapacity.toLocaleString()} Sq.Ft
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="100"
                    max={subscribedCapacity > 0 ? subscribedCapacity : undefined}
                    required
                    placeholder={`e.g. ${subscribedCapacity || 50000}`}
                    value={propForm.areaSqft}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (subscribedCapacity > 0 && val > subscribedCapacity) {
                        setPropForm({ ...propForm, areaSqft: String(subscribedCapacity) });
                        showToast(
                          `Leasable area cannot exceed your subscribed capacity (${subscribedCapacity.toLocaleString()} Sq.Ft). Clamped to maximum limit.`,
                          "error"
                        );
                      } else {
                        setPropForm({ ...propForm, areaSqft: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                  />
                  {subscribedCapacity > 0 && Number(propForm.areaSqft) > subscribedCapacity && (
                    <p className="text-[10px] font-bold text-rose-600 mt-1">
                      Area cannot exceed subscribed quota ({subscribedCapacity.toLocaleString()} Sq.Ft).
                    </p>
                  )}
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

                {/* 3. Building Address (optional) - Google Maps Autocomplete */}
                <div>
                  <GoogleAddressAutocomplete
                    value={bldgForm.buildingAddress}
                    onChange={(val) => setBldgForm((prev) => ({ ...prev, buildingAddress: val }))}
                    onAddressSelect={(res: AddressAutofillResult) => {
                      setBldgForm((prev) => ({
                        ...prev,
                        buildingAddress: res.streetAddress || res.fullAddress,
                      }));
                    }}
                    label="Building Address (Optional)"
                    placeholder="Search building landmark or campus gate on Google Maps..."
                    required={false}
                    hint="Optional: Pinpoint specific wing or campus gate."
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
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Enrolls Tenant &amp; Generates Portal Invite Link
                </span>
              </div>

              {/* Latest Generated Tenant Invite Banner (if available) */}
              {latestTenantInvite && (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0F8B7D] shrink-0" />
                    <div>
                      <span className="font-bold text-teal-950">Active Portal Invite: {latestTenantInvite.name}</span>
                      <span className="text-slate-500 ml-1.5 font-medium">({latestTenantInvite.email})</span>
                      <p className="text-[11px] text-teal-700 mt-0.5">Corporate tenant self-service portal link is active.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(latestTenantInvite.link);
                      setCopiedInvite(true);
                      showToast("✓ Tenant invitation link copied to clipboard!");
                      setTimeout(() => setCopiedInvite(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                  >
                    {copiedInvite ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedInvite ? "Copied!" : "Copy Tenant Invite"}</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Occupant Name (required) */}
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

                {/* 2. Email (required) */}
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

                {/* 3. Phone (required) */}
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

                {/* 4. Company Name (optional) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Company Name <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                    value={tenantForm.companyName}
                    onChange={(e) => setTenantForm({ ...tenantForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 5. GST Number (if company, optional) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    GST Number <span className="text-[11px] font-normal text-slate-400">(If company, optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="29AAAAA0000A1Z5"
                    value={tenantForm.gst}
                    onChange={(e) => setTenantForm({ ...tenantForm, gst: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase"
                  />
                </div>

                {/* 6. PAN (if individual, optional) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    PAN Number <span className="text-[11px] font-normal text-slate-400">(If individual, optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={tenantForm.pan}
                    onChange={(e) => setTenantForm({ ...tenantForm, pan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase"
                  />
                </div>

                {/* 7. Billing Address - Google Maps Autocomplete */}
                <div className="sm:col-span-2">
                  <GoogleAddressAutocomplete
                    value={tenantForm.billingAddress}
                    onChange={(val) => setTenantForm((prev) => ({ ...prev, billingAddress: val }))}
                    onAddressSelect={(res: AddressAutofillResult) => {
                      setTenantForm((prev) => ({
                        ...prev,
                        billingAddress: res.fullAddress || res.streetAddress,
                      }));
                    }}
                    label="Billing Address"
                    placeholder="Search registered corporate office or billing address..."
                    required={false}
                    hint="Optional: Select from Google Maps to auto-complete GST billing address."
                  />
                </div>

                {/* 8. Alternate Contact Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Alternate Contact Name <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
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
                  <label className="font-bold text-slate-700 block mb-1">
                    Alternate Contact Phone <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
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
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Linking Tenant to Commercial Space
                </span>
              </div>

              {/* Tenant Portal Invite Link Banner (if available) */}
              {latestTenantInvite && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-teal-950 flex items-center gap-1.5">
                        <span>Tenant Enrolled: {latestTenantInvite.name}</span>
                        <span className="text-[10px] font-bold text-teal-700 bg-white/90 px-1.5 py-0.5 rounded border border-teal-200">
                          {latestTenantInvite.email}
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-800 mt-0.5">
                        Copy and dispatch this verified invitation link so your tenant can log directly into their institutional tenant portal (<span className="font-mono font-bold">/portal</span>).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(latestTenantInvite.link);
                      setCopiedInvite(true);
                      showToast("✓ Tenant Portal invitation link copied to clipboard!");
                      setTimeout(() => setCopiedInvite(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition"
                  >
                    {copiedInvite ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedInvite ? "Copied Link!" : "Copy Tenant Invite Link"}</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Occupant (dropdown - select from occupants) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupant (Tenant) *</label>
                  <select
                    value={contractForm.occupantId}
                    onChange={(e) => setContractForm({ ...contractForm, occupantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.company ? `(${t.company})` : ""}
                      </option>
                    ))}
                    {tenantsList.length === 0 && <option value="">No occupants registered yet</option>}
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

                {/* 4. Space/Unit (dropdown) */}
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

                {/* 5. Contract Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contract Start Date *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 6. Contract End Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contract End Date *</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Area (Sq.Ft) [Auto-filled from space]</label>
                  <input
                    type="number"
                    readOnly
                    placeholder="Auto-filled from space"
                    value={contractForm.areaSqft}
                    onChange={(e) => setContractForm({ ...contractForm, areaSqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-slate-50 focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 8. Monthly Rent Amount */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Rent Amount (₹) *</label>
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

                {/* 9. Escalation % (if any) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation % (If any)</label>
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

                {/* 11. Escalation Frequency (Annual / Biannual / Quarterly) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Frequency</label>
                  <select
                    value={contractForm.escalationFrequency}
                    onChange={(e) => setContractForm({ ...contractForm, escalationFrequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Annual">Annual (Every 12 Months)</option>
                    <option value="Biannual">Biannual (Every 24 Months)</option>
                    <option value="Quarterly">Quarterly (Every 3 Months)</option>
                  </select>
                </div>

                {/* 12. Security Deposit Amount */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Security Deposit Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 900000"
                    value={contractForm.securityDeposit}
                    onChange={(e) => setContractForm({ ...contractForm, securityDeposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 13. Lock-in Period (months, if any) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lock-in Period (Months, if any)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={contractForm.lockInMonths}
                    onChange={(e) => setContractForm({ ...contractForm, lockInMonths: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 14. Notice Period (days before termination) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Period (Days before termination)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 90 (Days)"
                    value={contractForm.noticeDays}
                    onChange={(e) => setContractForm({ ...contractForm, noticeDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 15. Billing Entity (dropdown - which SPV bills this) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Entity (Which SPV bills this)</label>
                  <input
                    type="text"
                    list="spv-options"
                    placeholder="e.g. Cyber Estates SPV Pvt Ltd"
                    value={contractForm.billingEntity}
                    onChange={(e) => setContractForm({ ...contractForm, billingEntity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                  <datalist id="spv-options">
                    {billingEntities.map((be, idx) => (
                      <option key={idx} value={be} />
                    ))}
                    {propertiesList.map((p) => (
                      <option key={`spv-prop-${p.id}`} value={`${p.name} SPV`} />
                    ))}
                  </datalist>
                </div>

                {/* 16. Billing Model (Area-based / Seat-based / Fixed / Hybrid / Pure Rent) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Model</label>
                  <select
                    value={contractForm.billingModel}
                    onChange={(e) => setContractForm({ ...contractForm, billingModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Area-based">Area-based (Per Sq.Ft)</option>
                    <option value="Seat-based">Seat-based (Per Desk)</option>
                    <option value="Fixed">Fixed (Lump-sum Fee)</option>
                    <option value="Hybrid">Hybrid (Area + Utility)</option>
                    <option value="Pure Rent">Pure Rent (Bare Shell)</option>
                  </select>
                </div>

                {/* 17. Payment Terms (Net 0 / Net 7 / Net 15 / Net 30) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Net 0">Net 0 (Due on Receipt)</option>
                    <option value="Net 7">Net 7 (Within 7 Days)</option>
                    <option value="Net 15">Net 15 (Within 15 Days)</option>
                    <option value="Net 30">Net 30 (Within 30 Days)</option>
                    <option value="Due on 1st of month">Due on 1st of month</option>
                  </select>
                </div>

                {/* 18. Notes (optional) */}
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    Notes <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific covenants, fitout period, car parking allocations, or terms..."
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
