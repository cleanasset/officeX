"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Layers,
  Users,
  FileText,
  CheckCircle2,
  X,
  Edit2,
  Save,
  Plus,
  ShieldCheck,
  UserCheck,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Landmark,
  Trash2,
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

interface PropertyDetailModalProps {
  property: any | null;
  isOpen: boolean;
  onClose: () => void;
  onPropertyUpdated?: () => void;
  initialMode?: "view" | "edit";
}

export default function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onPropertyUpdated,
  initialMode = "view",
}: PropertyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "spaces" | "tenants" | "management">("overview");
  const [isEditing, setIsEditing] = useState(initialMode === "edit");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Live associated data
  const [spaces, setSpaces] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [managerAssignment, setManagerAssignment] = useState<any>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    property_name: "",
    property_type: "commercial",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    total_leasable_area_sqft: "",
    price_per_sqft: "",
    // Manager assignment
    hasManager: false,
    managerName: "",
    managerEmail: "",
    managerType: "pm_company",
    managerScope: "whole_property",
  });

  // Floor De-Registration / Sold Floors state
  const [deRegModalOpen, setDeRegModalOpen] = useState(false);
  const [deRegFloor, setDeRegFloor] = useState("");
  const [deRegReason, setDeRegReason] = useState("");
  const [deRegLoading, setDeRegLoading] = useState(false);

  const distinctFloors = React.useMemo(() => {
    const list: string[] = [];
    spaces.forEach((s) => {
      const fl = s.floor_name || (s.floorNumber !== undefined ? (s.floorNumber === 0 ? "Ground Floor" : `Floor ${s.floorNumber}`) : "");
      if (fl && !list.includes(fl)) list.push(fl);
    });
    if (list.length === 0) {
      return ["Ground Floor", "Floor 1", "Floor 2", "Floor 3", "Floor 4"];
    }
    return list;
  }, [spaces]);

  useEffect(() => {
    if (initialMode === "edit") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen || !property) return;

    // Load initial edit form values
    const pName = property.property_name || property.name || "";
    let storedAssign: any = null;
    if (typeof window !== "undefined") {
      try {
        const assigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
        storedAssign = assigns[property.id] || assigns[pName];
      } catch {}
    }
    setManagerAssignment(storedAssign);

    setEditForm({
      property_name: pName,
      property_type: property.property_type || "commercial",
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      postal_code: property.postal_code || property.pincode || "",
      total_leasable_area_sqft: property.total_leasable_area_sqft ? String(property.total_leasable_area_sqft) : "",
      price_per_sqft: property.price_per_sqft ? String(property.price_per_sqft) : "",
      hasManager: Boolean(storedAssign?.name),
      managerName: storedAssign?.name || "",
      managerEmail: storedAssign?.email || "",
      managerType: storedAssign?.type || "pm_company",
      managerScope: storedAssign?.scope || "whole_property",
    });

    // Fetch live spaces and contracts tied to this property
    loadPropertyData(property.id, pName);
  }, [isOpen, property]);

  const loadPropertyData = async (propId: string, propName: string) => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();

      const [spacesRes, contractsRes] = await Promise.all([
        fetch("/api/spaces", { headers: authHeaders }).catch(() => null),
        fetch("/api/contracts", { headers: authHeaders }).catch(() => null),
      ]);

      if (spacesRes && spacesRes.ok) {
        const sJson = await spacesRes.json();
        const allSpaces = Array.isArray(sJson.data) ? sJson.data : [];
        const filteredSpaces = allSpaces.filter((s: any) => {
          if (s.property_id === propId) return true;
          if (s.property_name && s.property_name.toLowerCase() === propName.toLowerCase()) return true;
          if (s.building_name && s.building_name.toLowerCase().includes(propName.toLowerCase())) return true;
          return false;
        });
        setSpaces(filteredSpaces.length > 0 ? filteredSpaces : allSpaces.slice(0, 5));
      }

      if (contractsRes && contractsRes.ok) {
        const cJson = await contractsRes.json();
        const allContracts = Array.isArray(cJson.data) ? cJson.data : [];
        const filteredContracts = allContracts.filter((c: any) => {
          if (c.property_id === propId) return true;
          if (c.property_name && c.property_name.toLowerCase() === propName.toLowerCase()) return true;
          return false;
        });
        setContracts(filteredContracts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?.id) return;

    try {
      setSaving(true);
      const authHeaders = getClientAuthHeaders();

      const patchRes = await fetch(`/api/rent-roll/properties/${property.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          property_name: editForm.property_name.trim(),
          property_type: editForm.property_type,
          address: editForm.address.trim(),
          city: editForm.city.trim(),
          state: editForm.state.trim(),
          postal_code: editForm.postal_code.trim(),
          total_leasable_area_sqft: editForm.total_leasable_area_sqft,
        }),
      });

      if (!patchRes.ok) {
        const errJson = await patchRes.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to update property");
      }

      // Update manager assignment mapping in localStorage
      if (typeof window !== "undefined") {
        try {
          const assigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
          const pKey = property.id;
          const pNameKey = editForm.property_name.trim();

          if (editForm.hasManager && editForm.managerName.trim()) {
            const assignObj = {
              name: editForm.managerName.trim(),
              email: editForm.managerEmail.trim(),
              type: editForm.managerType,
              scope: editForm.managerScope,
            };
            assigns[pKey] = assignObj;
            assigns[pNameKey] = assignObj;
            setManagerAssignment(assignObj);
          } else {
            delete assigns[pKey];
            delete assigns[pNameKey];
            setManagerAssignment(null);
          }
          localStorage.setItem("officex_property_assignments", JSON.stringify(assigns));
        } catch {}
      }

      setToastMessage({ text: "✓ Property details updated successfully!", type: "success" });
      setIsEditing(false);
      onPropertyUpdated?.();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage({ text: err.message || "Error saving property", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteProperty = async () => {
    if (!property?.id) return;
    const pName = property.property_name || property.name || "this property";
    if (
      !confirm(
        `Are you sure you want to permanently delete "${pName}" and all its units from your portfolio?\n\nThis will remove the property and its leasable spaces.`
      )
    ) {
      return;
    }
    try {
      setDeleting(true);
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/rent-roll/properties/${property.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          const activeProp = localStorage.getItem("officex_active_property");
          if (activeProp === pName || activeProp === property.id) {
            localStorage.removeItem("officex_active_property");
          }
        }
        onPropertyUpdated?.();
        onClose();
      } else {
        const d = await res.json().catch(() => ({}));
        setToastMessage({ text: d.message || "Failed to delete property", type: "error" });
      }
    } catch {
      setToastMessage({ text: "Network error deleting property", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !property) return null;

  const propName = editForm.property_name || property.property_name || property.name || "Commercial Property";
  const propCity = editForm.city || property.city || "";
  const propState = editForm.state || property.state || "";
  const propArea = editForm.total_leasable_area_sqft || property.total_leasable_area_sqft || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F8B7D] flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 truncate">{propName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 uppercase tracking-wider">
                  {property.property_code || "ACTIVE PROPERTY"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Registered Asset
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-teal-600 shrink-0" />
                <span>
                  {propCity ? `${propCity}${propState ? `, ${propState}` : ""}` : "Location registered"} ·{" "}
                  {Number(propArea).toLocaleString("en-IN")} sqft total
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Property</span>
              </button>
            )}
            <button
              onClick={handleDeleteProperty}
              disabled={deleting}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200 disabled:opacity-60"
              title="Delete Property from Portfolio"
            >
              <Trash2 size={13} />
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-2 border-b border-slate-100 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("overview");
            }}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "overview"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building size={14} />
            <span>Overview &amp; Specs</span>
          </button>
          <button
            onClick={() => setActiveTab("spaces")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "spaces"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={14} />
            <span>Units &amp; Spaces ({spaces.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tenants")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "tenants"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText size={14} />
            <span>Leases &amp; Contracts ({contracts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("management")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "management"
                ? "border-[#0F8B7D] text-[#0F8B7D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck size={14} />
            <span>Managing Partner &amp; SPV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === "overview" && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Edit Property Specifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Property / Asset Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.property_name}
                        onChange={(e) => setEditForm({ ...editForm, property_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asset Class / Type</label>
                      <select
                        value={editForm.property_type}
                        onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none capitalize"
                      >
                        <option value="commercial">Commercial Office</option>
                        <option value="it_park">IT / SEZ Park</option>
                        <option value="industrial">Industrial / Warehouse</option>
                        <option value="retail">Retail Mall / High Street</option>
                        <option value="data_center">Data Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Total Leasable Area (sqft) *</label>
                      <input
                        type="number"
                        required
                        value={editForm.total_leasable_area_sqft}
                        onChange={(e) => setEditForm({ ...editForm, total_leasable_area_sqft: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asking Rate (₹/sqft/mo)</label>
                      <input
                        type="number"
                        value={editForm.price_per_sqft}
                        onChange={(e) => setEditForm({ ...editForm, price_per_sqft: e.target.value })}
                        placeholder="e.g. 95"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Plot / Road / Campus location"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State / UT</label>
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        value={editForm.postal_code}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Leasable Area
                      </span>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        {Number(propArea).toLocaleString("en-IN")} sqft
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                        Demarcated Spaces
                      </span>
                      <p className="text-base font-black text-teal-950 mt-0.5">{spaces.length} Units</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Active Contracts
                      </span>
                      <p className="text-base font-black text-emerald-950 mt-0.5">{contracts.length} Leases</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Managing Partner
                      </span>
                      <p className="text-xs font-black text-slate-900 mt-1 truncate">
                        {managerAssignment?.name || "Self-Managed (Owner)"}
                      </p>
                    </div>
                  </div>

                  {/* Specification Breakdown */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Property Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">Asset Type:</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {property.property_type || "Commercial Office"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">System Code:</span>
                        <span className="font-mono font-bold text-slate-900">{property.property_code || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">Full Address:</span>
                        <span className="font-bold text-slate-900 text-right">
                          {property.address || "Main Commercial Campus"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">Location / PIN:</span>
                        <span className="font-bold text-slate-900">
                          {propCity} {property.postal_code || property.pincode ? `(${property.postal_code || property.pincode})` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">Total Area (sqft):</span>
                        <span className="font-bold text-teal-800">
                          {Number(propArea).toLocaleString("en-IN")} sqft
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-slate-500 font-semibold">Base Price PSF:</span>
                        <span className="font-bold text-slate-900">
                          ₹{property.price_per_sqft || 90} / sqft / mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/properties/rent-roll?property=${encodeURIComponent(property.id)}`}
                      className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Layers size={14} />
                      <span>Open Rent Roll Register</span>
                    </Link>
                    <Link
                      href="/properties/tenants"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Users size={14} />
                      <span>View Tenant Directory</span>
                    </Link>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit Specifications</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEMARCATED UNITS & SPACES */}
          {activeTab === "spaces" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Demarcated Spaces</h3>
                  <p className="text-[11px] text-slate-500">Individual office suites, floors, and retail zones</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (distinctFloors.length > 0 && !deRegFloor) setDeRegFloor(distinctFloors[0]);
                      setDeRegModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs shrink-0 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    title="Sold or transferred floors? Request de-registration with Admin Approval"
                  >
                    <span>🏢 Sold Floors? Request Removal</span>
                  </button>
                  <Link
                    href="/properties/registry"
                    className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0c7064] transition flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Demarcate New Unit</span>
                  </Link>
                </div>
              </div>

              {spaces.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">No spaces explicitly demarcated</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Demarcate units to allocate to corporate tenants.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Unit / Space Code</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Floor</th>
                        <th className="py-2.5 px-3">Area (sqft)</th>
                        <th className="py-2.5 px-3">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {spaces.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.space_code || `SP-${idx + 1}`}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{s.space_name || `Unit ${idx + 1}`}</td>
                          <td className="py-2.5 px-3 text-slate-600">{s.floor_name || "Floor 1"}</td>
                          <td className="py-2.5 px-3 font-bold text-teal-800">
                            {Number(s.chargeable_area_sqft || s.area_sqft || 0).toLocaleString("en-IN")} sqft
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                s.occupancy_status === "occupied"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {s.occupancy_status || "Vacant"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEASES & CONTRACTS */}
          {activeTab === "tenants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Active Leases &amp; Occupants</h3>
                  <p className="text-[11px] text-slate-500">Commercial agreements and occupant allocations</p>
                </div>
                <Link
                  href="/properties/rent-roll"
                  className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0c7064] transition flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Create Contract</span>
                </Link>
              </div>

              {contracts.length === 0 ? (
                <div className="p-8 text-center bg-amber-50/60 border border-amber-200 rounded-2xl">
                  <p className="text-xs font-bold text-amber-900">0 Active Leases for this Property</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    No corporate tenants or contracts have been registered yet for this property.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Contract Code</th>
                        <th className="py-2.5 px-3">Corporate Tenant</th>
                        <th className="py-2.5 px-3">Demarcated Unit</th>
                        <th className="py-2.5 px-3">Monthly Rent</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contracts.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.contract_code || "LEAS-01"}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{c.occupant_name || c.tenant_name || "Corporate Occupant"}</td>
                          <td className="py-2.5 px-3 text-slate-600">{c.space_name || "Demised Unit"}</td>
                          <td className="py-2.5 px-3 font-bold text-teal-800">
                            ₹{Number(c.base_rent_rate || 0).toLocaleString("en-IN")}/mo
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                              {c.contract_status || "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANAGING PARTNER & SPV */}
          {activeTab === "management" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                    Delegated Property Governance
                  </h4>
                  <p className="text-xs text-teal-800 font-medium mt-0.5 leading-relaxed">
                    Under OfficeX multi-tier governance, Landlords retain absolute ownership while delegating operational day-to-day facilities, rent collections, and maintenance to certified management companies.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Managing Entity Details</h3>
                  <button
                    onClick={() => {
                      setActiveTab("overview");
                      setIsEditing(true);
                    }}
                    className="text-xs text-[#0F8B7D] font-bold hover:underline"
                  >
                    Edit Partner
                  </button>
                </div>

                {managerAssignment?.name ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Assigned Manager:</span>
                      <span className="font-black text-slate-900">{managerAssignment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Email:</span>
                      <span className="font-semibold text-slate-700">{managerAssignment.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Delegation Scope:</span>
                      <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">
                        {managerAssignment.scope === "specific_tenants" ? "Specific Tenants & Floors" : "Whole Property Asset"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Status:</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Operational Partner Assigned
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">No Third-Party Manager Assigned</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">This property is directly self-managed by the Landlord SPV.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Property ID: <span className="font-mono text-slate-700">{property.id}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteProperty}
              disabled={deleting}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Trash2 size={13} />
              <span>{deleting ? "Deleting Property..." : "Delete Property"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Sold Floors / De-Registration Modal */}
        {deRegModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Request Floor De-Registration</h3>
                    <p className="text-[11px] text-slate-500">Sell or remove floors from registered property</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeRegModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-700 shrink-0" />
                  <span>Institutional Maker-Checker Governance</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Because commercial leases and financial stacking plans depend on registered floor assets, removing or selling floors requires Administrative Verification. A notification will be dispatched to the Admin Portal for approval.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Floor to De-Register / Sell</label>
                  <select
                    value={deRegFloor}
                    onChange={(e) => setDeRegFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none bg-white cursor-pointer"
                  >
                    <option value="">-- Choose Floor --</option>
                    {distinctFloors.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Removal / Transaction Details</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sold Floor 3 to third-party investor / Title deed transferred / Change of commercial asset layout..."
                    value={deRegReason}
                    onChange={(e) => setDeRegReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!deRegFloor || !deRegReason.trim() || deRegLoading}
                  onClick={async () => {
                    setDeRegLoading(true);
                    try {
                      const res = await fetch("/api/admin/change-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
                        body: JSON.stringify({
                          property_id: property.id,
                          property_name: property.name,
                          request_type: "sell_floors",
                          floors_to_remove: [deRegFloor],
                          description: deRegReason.trim(),
                        }),
                      });
                      if (res.ok) {
                        alert("✓ Floor de-registration request submitted to Admin for approval!");
                        setDeRegModalOpen(false);
                        setDeRegReason("");
                        setDeRegFloor("");
                      } else {
                        alert("Failed to submit change request. Please try again.");
                      }
                    } catch (err) {
                      alert("Network error submitting change request.");
                    } finally {
                      setDeRegLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {deRegLoading ? "Submitting..." : "Submit Removal Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
