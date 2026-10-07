"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Building,
  Layers,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  defaultTab?: "property" | "building" | "space" | "occupant";
}

export default function MasterDataModal({
  isOpen,
  onClose,
  onDataChanged,
  defaultTab = "property",
}: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<"property" | "building" | "space" | "occupant">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dropdown lists
  const [properties, setProperties] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);

  // Forms
  const [propForm, setPropForm] = useState({
    property_name: "Tech Park Oasis",
    property_code: `PR-${Date.now().toString().slice(-4)}`,
    total_leasable_area_sqft: "125000",
    property_type: "office",
    city: "Bengaluru",
    state: "Karnataka",
  });

  const [bldgForm, setBldgForm] = useState({
    property_id: "",
    building_name: "Wing B Tower",
    building_code: `BLDG-${Date.now().toString().slice(-4)}`,
    floors: 12,
    total_area_sqft: "60000",
    total_seats: 400,
  });

  const [spaceForm, setSpaceForm] = useState({
    building_id: "",
    space_name: "Executive Suite 402",
    space_code: `SP-${Date.now().toString().slice(-4)}`,
    floor_name: "4th Floor",
    space_type: "suite",
    chargeable_area_sqft: "3500",
    carpet_area_sqft: "3000",
    occupancy_status: "vacant",
  });

  const [occForm, setOccForm] = useState({
    occupant_name: "Vertex Cloud Innovations",
    occupant_code: `OCC-${Date.now().toString().slice(-4)}`,
    occupant_type: "company",
    pan_number: "AAACV9876Q",
    gst_number: "29AAACV9876Q1Z2",
    industry_sector: "Information Technology",
    email: "contact@vertexcloud.io",
    phone: "+91 9876543210",
    is_critical_occupant: false,
    occupant_status: "active",
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
    }
  }, [isOpen]);

  async function loadDropdowns() {
    try {
      const [pRes, bRes] = await Promise.all([
        fetch("/api/rent-roll/properties"),
        fetch("/api/buildings"),
      ]);
      const [pData, bData] = await Promise.all([pRes.json(), bRes.json()]);
      if (pData.success) {
        setProperties(pData.data || []);
        if (pData.data?.length > 0 && !bldgForm.property_id) {
          setBldgForm((prev) => ({ ...prev, property_id: pData.data[0].id }));
        }
      }
      if (bData.success) {
        setBuildings(bData.data || []);
        if (bData.data?.length > 0 && !spaceForm.building_id) {
          setSpaceForm((prev) => ({ ...prev, building_id: bData.data[0].id }));
        }
      }
    } catch (e) {
      console.warn("Dropdown load error", e);
    }
  }

  async function handleSubmitProperty(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propForm),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: `Property '${propForm.property_name}' created successfully!` });
        loadDropdowns();
        onDataChanged();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to create property" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitBuilding(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bldgForm),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: `Building '${bldgForm.building_name}' created successfully!` });
        loadDropdowns();
        onDataChanged();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to create building" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitSpace(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spaceForm),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: `Space '${spaceForm.space_name}' created successfully!` });
        onDataChanged();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to create space" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitOccupant(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch("/api/occupants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(occForm),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: `Occupant '${occForm.occupant_name}' created successfully!` });
        onDataChanged();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to create occupant" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Master Asset & Tenant Management</h3>
            <p className="text-xs text-slate-500">Configure Properties, Buildings, Demised Spaces & Occupants (§S-11–14)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2 text-xs font-semibold">
          {[
            { id: "property", label: "Properties (§S-11)", icon: Building2 },
            { id: "building", label: "Buildings (§S-12)", icon: Building },
            { id: "space", label: "Spaces (§S-13)", icon: Layers },
            { id: "occupant", label: "Occupants (§S-14)", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFeedback(null);
                }}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-teal-700 text-teal-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`px-6 py-2.5 border-b text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          {/* TAB 1: PROPERTY FORM (§S-11) */}
          {activeTab === "property" && (
            <form onSubmit={handleSubmitProperty} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={propForm.property_name}
                    onChange={(e) => setPropForm({ ...propForm, property_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Property Code *</label>
                  <input
                    type="text"
                    required
                    value={propForm.property_code}
                    onChange={(e) => setPropForm({ ...propForm, property_code: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Leasable Area (sqft) *</label>
                  <input
                    type="number"
                    required
                    value={propForm.total_leasable_area_sqft}
                    onChange={(e) => setPropForm({ ...propForm, total_leasable_area_sqft: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Property Type</label>
                  <select
                    value={propForm.property_type}
                    onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="office">Commercial Office</option>
                    <option value="flex_workspace">Flex Workspace</option>
                    <option value="retail">Retail Mall</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={propForm.city}
                    onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={propForm.state}
                    onChange={(e) => setPropForm({ ...propForm, state: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Save Property
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BUILDING FORM (§S-12) */}
          {activeTab === "building" && (
            <form onSubmit={handleSubmitBuilding} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parent Property *</label>
                <select
                  required
                  value={bldgForm.property_id}
                  onChange={(e) => setBldgForm({ ...bldgForm, property_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Select Property --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.property_name} ({p.property_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Building / Tower Name *</label>
                  <input
                    type="text"
                    required
                    value={bldgForm.building_name}
                    onChange={(e) => setBldgForm({ ...bldgForm, building_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Building Code *</label>
                  <input
                    type="text"
                    required
                    value={bldgForm.building_code}
                    onChange={(e) => setBldgForm({ ...bldgForm, building_code: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Floors</label>
                  <input
                    type="number"
                    value={bldgForm.floors}
                    onChange={(e) => setBldgForm({ ...bldgForm, floors: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Area (sqft)</label>
                  <input
                    type="number"
                    value={bldgForm.total_area_sqft}
                    onChange={(e) => setBldgForm({ ...bldgForm, total_area_sqft: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Seats (Flex)</label>
                  <input
                    type="number"
                    value={bldgForm.total_seats}
                    onChange={(e) => setBldgForm({ ...bldgForm, total_seats: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Save Building
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SPACE FORM (§S-13) */}
          {activeTab === "space" && (
            <form onSubmit={handleSubmitSpace} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parent Building *</label>
                <select
                  required
                  value={spaceForm.building_id}
                  onChange={(e) => setSpaceForm({ ...spaceForm, building_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Select Building --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.building_name} ({b.building_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Space Name *</label>
                  <input
                    type="text"
                    required
                    value={spaceForm.space_name}
                    onChange={(e) => setSpaceForm({ ...spaceForm, space_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Space Code *</label>
                  <input
                    type="text"
                    required
                    value={spaceForm.space_code}
                    onChange={(e) => setSpaceForm({ ...spaceForm, space_code: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Floor Label</label>
                  <input
                    type="text"
                    value={spaceForm.floor_name}
                    onChange={(e) => setSpaceForm({ ...spaceForm, floor_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Space Type</label>
                  <select
                    value={spaceForm.space_type}
                    onChange={(e) => setSpaceForm({ ...spaceForm, space_type: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="suite">Commercial Suite</option>
                    <option value="floor">Entire Floor</option>
                    <option value="wing">Wing</option>
                    <option value="cabin">Private Cabin</option>
                    <option value="desk">Dedicated Desk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chargeable Area (sqft) *</label>
                  <input
                    type="number"
                    required
                    value={spaceForm.chargeable_area_sqft}
                    onChange={(e) => setSpaceForm({ ...spaceForm, chargeable_area_sqft: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Occupancy Status</label>
                  <select
                    value={spaceForm.occupancy_status}
                    onChange={(e) => setSpaceForm({ ...spaceForm, occupancy_status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="under_maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Save Space
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: OCCUPANT FORM (§S-14) */}
          {activeTab === "occupant" && (
            <form onSubmit={handleSubmitOccupant} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Occupant / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={occForm.occupant_name}
                    onChange={(e) => setOccForm({ ...occForm, occupant_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Occupant Code *</label>
                  <input
                    type="text"
                    required
                    value={occForm.occupant_code}
                    onChange={(e) => setOccForm({ ...occForm, occupant_code: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={occForm.pan_number}
                    onChange={(e) => setOccForm({ ...occForm, pan_number: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={occForm.gst_number}
                    onChange={(e) => setOccForm({ ...occForm, gst_number: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={occForm.email}
                    onChange={(e) => setOccForm({ ...occForm, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={occForm.phone}
                    onChange={(e) => setOccForm({ ...occForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={occForm.industry_sector}
                    onChange={(e) => setOccForm({ ...occForm, industry_sector: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={occForm.occupant_status}
                    onChange={(e) => setOccForm({ ...occForm, occupant_status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="notice_served">Notice Served</option>
                    <option value="holding_over">Holding Over</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Save Occupant
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
