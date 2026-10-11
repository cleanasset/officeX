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
  Check,
  UploadCloud,
  Calculator,
  Percent,
  Car,
  FileCheck2,
  FileUp,
  Zap,
  Armchair,
  Clock,
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

  // ──── 1. PROPERTY FORM (Enhanced Commercial Master) ────
  const [propForm, setPropForm] = useState({
    existingPropId: "",
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
    fitoutCondition: "Fully Furnished", // "Fully Furnished" | "Warm Shell" | "Bare Shell" | "Semi-Furnished"
    workstationsCount: "",
    cabinsCount: "",
    meetingRoomsCount: "",
    defaultFitoutDays: "60",
  });

  // ──── 2. BUILDING FORM (3 Fields) ────
  const [bldgForm, setBldgForm] = useState({
    propertyId: "",
    buildingName: "",
    floorCount: "",
    buildingAddress: "",
  });

  // ──── 3. SPACE FORM (Enhanced Handover Specs) ────
  const [spaceForm, setSpaceForm] = useState({
    buildingId: "",
    spaceName: "",
    areaSqft: "",
    floorNumber: "",
    unitType: "Office",
    fitoutCondition: "Fully Furnished",
    workstationsCount: "",
  });

  // ──── 4. TENANT FORM (Corporate & Signatory Master) ────
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
    cinNumber: "",
    industryType: "IT & Software",
    signatoryName: "",
    signatoryDesignation: "",
  });

  // ──── 5. CONTRACT FORM (Comprehensive Commercial Terms) ────
  const [contractForm, setContractForm] = useState({
    occupantId: "",
    propertyId: "",
    buildingId: "",
    spaceId: "",
    startDate: "",
    endDate: "",
    areaSqft: "",
    // Pricing Model & Rates
    billingModel: "Area-based", // "Area-based" | "Seat-based" | "Fixed" | "Hybrid" | "Pure Rent"
    ratePerSqft: "",
    ratePerSeat: "",
    seatCount: "",
    bareShellRate: "",
    fitoutRate: "",
    monthlyRent: "",
    // CAM Charges
    camType: "Per Sq.Ft", // "Per Sq.Ft" | "Fixed Monthly" | "Included" | "Actuals"
    camRate: "",
    camMonthly: "",
    // Parking Allocations
    carParkingSlots: "0",
    carParkingRate: "0",
    twoWheelerSlots: "0",
    twoWheelerRate: "0",
    // Security Deposit & Period
    securityDeposit: "",
    depositMonths: "6",
    fitoutDays: "0",
    lockInMonths: "12",
    noticeDays: "90",
    // Escalation
    escalationPct: "5",
    escalationStartDate: "",
    escalationFrequency: "Annual", // "Annual" | "Biannual" | "Triennial" | "Quarterly"
    // Legal & Statutory
    billingEntity: "",
    paymentTerms: "Due on 5th of month",
    stampDutySharing: "50:50 Shared",
    notes: "",
  });

  // Agreement Document Upload & Auto-Fill State
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);
  const [parsedAgreementMeta, setParsedAgreementMeta] = useState<{
    fileName: string;
    confidence: number;
    extractedFieldsCount: number;
    summaryHighlights: string[];
  } | null>(null);

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
              ...prev,
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

            // Pre-populate Billing SPV & Tenant Billing Address
            const spv = ob.spvName || ob.companyName || localStorage.getItem("officex_company_name") || "";
            if (spv) {
              setBillingEntities((prev) => Array.from(new Set([...prev, spv])));
              setContractForm((prev) => ({
                ...prev,
                billingEntity: prev.billingEntity || spv,
              }));
            }
            const obAddr = [ob.address, ob.city, ob.state].filter(Boolean).join(", ");
            if (obAddr) {
              setTenantForm((prev) => ({
                ...prev,
                billingAddress: prev.billingAddress || obAddr,
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
          id: propForm.existingPropId || undefined,
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
        // Auto-fill tenant billing address with property address
        const propAddr = [propForm.address, propForm.city, propForm.state].filter(Boolean).join(", ");
        if (propAddr) {
          setTenantForm((prev) => ({
            ...prev,
            billingAddress: prev.billingAddress || propAddr,
          }));
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
          fitoutCondition: "Fully Furnished",
          workstationsCount: "",
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
          remarks: JSON.stringify({
            signatory_name: tenantForm.signatoryName.trim(),
            signatory_designation: tenantForm.signatoryDesignation.trim(),
            industry_type: tenantForm.industryType,
            cin_number: tenantForm.cinNumber.trim().toUpperCase(),
          }),
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
          cinNumber: "",
          industryType: "IT & Software",
          signatoryName: "",
          signatoryDesignation: "",
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

  // ──── LEASE AGREEMENT PARSING & AUTO-POPULATION ────
  const handleUploadRentAgreement = async (file: File) => {
    if (!file) return;
    setIsUploadingAgreement(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/contracts/parse-agreement", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const d = json.data;
        setParsedAgreementMeta({
          fileName: json.fileName,
          confidence: d.confidence || 90,
          extractedFieldsCount: d.extractedFieldsCount || 12,
          summaryHighlights: d.summaryHighlights || [],
        });

        // 1. Auto-match or detect occupant
        let targetOccupantId = contractForm.occupantId;
        if (d.occupantName) {
          const matchedTenant = tenantsList.find(
            (t) =>
              t.name.toLowerCase().includes(d.occupantName.toLowerCase()) ||
              d.occupantName.toLowerCase().includes(t.name.toLowerCase()) ||
              (t.company && d.companyName && t.company.toLowerCase().includes(d.companyName.toLowerCase()))
          );
          if (matchedTenant) {
            targetOccupantId = matchedTenant.id;
          }
        }

        // 2. Auto-match space if area is close
        let targetSpaceId = contractForm.spaceId;
        if (d.areaSqft > 0) {
          const matchedSpace = spacesList.find(
            (s) => Math.abs(s.area - d.areaSqft) < 100
          );
          if (matchedSpace) {
            targetSpaceId = matchedSpace.id;
          }
        }

        // 3. Billing SPV match or add
        if (d.billingEntity) {
          setBillingEntities((prev) => Array.from(new Set([...prev, d.billingEntity])));
        }

        setContractForm((prev) => ({
          ...prev,
          occupantId: targetOccupantId || prev.occupantId,
          spaceId: targetSpaceId || prev.spaceId,
          areaSqft: d.areaSqft ? String(d.areaSqft) : prev.areaSqft,
          billingModel: d.billingModel || prev.billingModel,
          ratePerSqft: d.ratePerSqft ? String(d.ratePerSqft) : prev.ratePerSqft,
          ratePerSeat: d.ratePerSeat ? String(d.ratePerSeat) : prev.ratePerSeat,
          seatCount: d.seatCount ? String(d.seatCount) : prev.seatCount,
          bareShellRate: d.bareShellRate ? String(d.bareShellRate) : prev.bareShellRate,
          fitoutRate: d.fitoutRate ? String(d.fitoutRate) : prev.fitoutRate,
          monthlyRent: d.monthlyRent ? String(d.monthlyRent) : prev.monthlyRent,
          camType: d.camType || prev.camType,
          camRate: d.camRate ? String(d.camRate) : prev.camRate,
          camMonthly: d.camMonthly ? String(d.camMonthly) : prev.camMonthly,
          carParkingSlots: d.carParkingSlots !== undefined ? String(d.carParkingSlots) : prev.carParkingSlots,
          carParkingRate: d.carParkingRate !== undefined ? String(d.carParkingRate) : prev.carParkingRate,
          twoWheelerSlots: d.twoWheelerSlots !== undefined ? String(d.twoWheelerSlots) : prev.twoWheelerSlots,
          twoWheelerRate: d.twoWheelerRate !== undefined ? String(d.twoWheelerRate) : prev.twoWheelerRate,
          securityDeposit: d.securityDeposit ? String(d.securityDeposit) : prev.securityDeposit,
          depositMonths: d.depositMonths ? String(d.depositMonths) : prev.depositMonths,
          fitoutDays: d.fitoutDays !== undefined ? String(d.fitoutDays) : prev.fitoutDays,
          lockInMonths: d.lockInMonths !== undefined ? String(d.lockInMonths) : prev.lockInMonths,
          noticeDays: d.noticeDays !== undefined ? String(d.noticeDays) : prev.noticeDays,
          startDate: d.startDate || prev.startDate,
          endDate: d.endDate || prev.endDate,
          escalationPct: d.escalationPct !== undefined ? String(d.escalationPct) : prev.escalationPct,
          escalationFrequency: d.escalationFrequency === "Triennial" ? "Biannual" : (d.escalationFrequency || prev.escalationFrequency),
          escalationStartDate: d.escalationStartDate || prev.escalationStartDate,
          billingEntity: d.billingEntity || prev.billingEntity,
          paymentTerms: d.paymentTerms || prev.paymentTerms,
          stampDutySharing: d.stampDutySharing || prev.stampDutySharing,
          notes: d.notes || prev.notes,
        }));

        showToast(
          `✓ Agreement "${json.fileName}" parsed! ${d.extractedFieldsCount || 14} terms pre-filled. You can review and adjust any field below.`
        );
      } else {
        showToast(json.error || "Failed to extract text from agreement file", "error");
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`, "error");
    } finally {
      setIsUploadingAgreement(false);
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
    const enteredRent = Number(contractForm.monthlyRent) || 0;
    if (enteredRent <= 0) {
      showToast("Please provide or calculate Monthly Rent Amount", "error");
      return;
    }

    setLoading(true);
    try {
      const dbBillingModel =
        contractForm.billingModel === "Seat-based"
          ? "seats"
          : contractForm.billingModel === "Fixed"
          ? "fixed"
          : contractForm.billingModel === "Hybrid"
          ? "hybrid"
          : "area";

      const camAmount =
        contractForm.camType === "Per Sq.Ft"
          ? Math.round((Number(contractForm.camRate) || 0) * (Number(contractForm.areaSqft) || 0))
          : Number(contractForm.camMonthly) || 0;
      const parkingAmount =
        (Number(contractForm.carParkingSlots) || 0) * (Number(contractForm.carParkingRate) || 0) +
        (Number(contractForm.twoWheelerSlots) || 0) * (Number(contractForm.twoWheelerRate) || 0);

      const notesSummary = [
        contractForm.notes,
        contractForm.billingModel ? `Model: ${contractForm.billingModel}` : null,
        contractForm.ratePerSqft ? `Rate PSF: ₹${contractForm.ratePerSqft}/sqft` : null,
        contractForm.ratePerSeat ? `Rate Seat: ₹${contractForm.ratePerSeat}/seat (${contractForm.seatCount} seats)` : null,
        camAmount > 0 ? `CAM: ₹${camAmount.toLocaleString()}/mo (${contractForm.camType})` : null,
        parkingAmount > 0 ? `Parking: ₹${parkingAmount.toLocaleString()}/mo` : null,
        contractForm.fitoutDays ? `Fit-out Period: ${contractForm.fitoutDays} days` : null,
        contractForm.stampDutySharing ? `Stamp Duty: ${contractForm.stampDutySharing}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

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
          base_rent_rate: enteredRent,
          billing_model: dbBillingModel,
          escalation_type: "percentage",
          escalation_value: Number(contractForm.escalationPct) || 0,
          has_escalation: Boolean(Number(contractForm.escalationPct) > 0),
          deposit_amount_inr: Number(contractForm.securityDeposit) || 0,
          lock_in_period_days: (Number(contractForm.lockInMonths) || 0) * 30,
          notice_period_days: Number(contractForm.noticeDays) || 90,
          billing_entity: contractForm.billingEntity.trim(),
          payment_terms: contractForm.paymentTerms.trim(),
          remarks: notesSummary,
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

                {/* 9. Number of Floors (0 allowed for ground-floor only warehouses) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Number of Floors</label>
                    <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-semibold">
                      0 for Ground Floor warehouse
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 14 (or 0 for Ground Floor only)"
                    value={propForm.floorsCount}
                    onChange={(e) => setPropForm({ ...propForm, floorsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* Handover & Fit-out Condition */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Handover / Fit-out Condition *
                  </label>
                  <select
                    value={propForm.fitoutCondition}
                    onChange={(e) => setPropForm({ ...propForm, fitoutCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Fully Furnished">Fully Furnished (Plug &amp; Play / Turnkey)</option>
                    <option value="Warm Shell">Warm Shell (HVAC, Ceilings, Lighting)</option>
                    <option value="Bare Shell">Bare Shell (Core &amp; Shell / Slab)</option>
                    <option value="Semi-Furnished">Semi-Furnished (Partially Fitted)</option>
                  </select>
                </div>

                {/* Workstations / Cabins if furnished */}
                {(propForm.fitoutCondition === "Fully Furnished" || propForm.fitoutCondition === "Semi-Furnished") && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Workstations Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 100 Seats"
                        value={propForm.workstationsCount}
                        onChange={(e) => setPropForm({ ...propForm, workstationsCount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Manager Cabins Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 4 Cabins"
                        value={propForm.cabinsCount}
                        onChange={(e) => setPropForm({ ...propForm, cabinsCount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Meeting Rooms Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 2 Rooms"
                        value={propForm.meetingRoomsCount}
                        onChange={(e) => setPropForm({ ...propForm, meetingRoomsCount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Default Fit-out Period Days */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Fit-out Period (Days)</label>
                  <input
                    type="number"
                    placeholder="e.g. 60 or 90 Days"
                    value={propForm.defaultFitoutDays}
                    onChange={(e) => setPropForm({ ...propForm, defaultFitoutDays: e.target.value })}
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
                <div>
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

                {/* Handover & Fit-out Condition */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Space Furnishing Condition *</label>
                  <select
                    value={spaceForm.fitoutCondition}
                    onChange={(e) => setSpaceForm({ ...spaceForm, fitoutCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Fully Furnished">Fully Furnished (Plug &amp; Play)</option>
                    <option value="Warm Shell">Warm Shell (HVAC, Ceilings)</option>
                    <option value="Bare Shell">Bare Shell (Raw Slab)</option>
                    <option value="Semi-Furnished">Semi-Furnished (Fitted)</option>
                  </select>
                </div>

                {(spaceForm.fitoutCondition === "Fully Furnished" || spaceForm.fitoutCondition === "Semi-Furnished") && (
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Workstations / Desks in Unit</label>
                    <input
                      type="number"
                      placeholder="e.g. 24 Desks"
                      value={spaceForm.workstationsCount}
                      onChange={(e) => setSpaceForm({ ...spaceForm, workstationsCount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Billing Address <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">Auto-filled from Property</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const propAddr = [propForm.address, propForm.city, propForm.state].filter(Boolean).join(", ");
                        if (propAddr) {
                          setTenantForm((prev) => ({ ...prev, billingAddress: propAddr }));
                          showToast("✓ Billing address restored to property address!");
                        }
                      }}
                      className="text-[11px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                    >
                      ↺ Reset to Property Address
                    </button>
                  </div>
                  <GoogleAddressAutocomplete
                    value={tenantForm.billingAddress}
                    onChange={(val) => setTenantForm((prev) => ({ ...prev, billingAddress: val }))}
                    onAddressSelect={(res: AddressAutofillResult) => {
                      setTenantForm((prev) => ({
                        ...prev,
                        billingAddress: res.fullAddress || res.streetAddress,
                      }));
                    }}
                    label=""
                    placeholder="Search registered corporate office or billing address..."
                    required={false}
                    hint="Auto-filled with the property address for monthly rent GST invoicing. Edit if the tenant's registered corporate headquarters differs."
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

                {/* 10. Corporate CIN / LLPIN Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Corporate Identity (CIN / LLPIN) <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U72200KA2021PTC145678"
                    value={tenantForm.cinNumber}
                    onChange={(e) => setTenantForm({ ...tenantForm, cinNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none uppercase"
                  />
                </div>

                {/* 11. Industry Vertical */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry / Sector</label>
                  <select
                    value={tenantForm.industryType}
                    onChange={(e) => setTenantForm({ ...tenantForm, industryType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="IT & Software">IT / SaaS / Tech</option>
                    <option value="BFSI">BFSI / FinTech / Investment</option>
                    <option value="Consulting & Legal">Consulting &amp; Legal</option>
                    <option value="Healthcare & Pharma">Healthcare &amp; Pharma</option>
                    <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                    <option value="Manufacturing & Logistics">Manufacturing &amp; Logistics</option>
                    <option value="Coworking & Managed Office">Coworking &amp; Managed Office</option>
                    <option value="Other">Other Commercial Enterprise</option>
                  </select>
                </div>

                {/* 12. Authorized Signatory Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Authorized Signatory Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={tenantForm.signatoryName}
                    onChange={(e) => setTenantForm({ ...tenantForm, signatoryName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* 13. Authorized Signatory Designation */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Signatory Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Director / VP Real Estate"
                    value={tenantForm.signatoryDesignation}
                    onChange={(e) => setTenantForm({ ...tenantForm, signatoryDesignation: e.target.value })}
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

          {/* ════════════════ TAB 5: LEASE CONTRACT (COMPULSORY LINKING) ════════════════ */}
          {activeTab === "contract" && (
            <form onSubmit={handleSaveContract} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Step 5: Commercial Lease Contract
                    </span>
                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider">
                      Compulsory *
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Link tenant to demised commercial space, configure rent calculation basis, CAM, parking, and legal covenants.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 self-start sm:self-auto">
                  Space &amp; Tenant Binding
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

              {/* ──── UPLOAD RENT AGREEMENT BOX (AUTO-EXTRACT TERMS) ──── */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-teal-300 hover:border-teal-500 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                      <FileUp size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900">
                          Upload Rent Agreement / Lease Deed
                        </h4>
                        <span className="text-[10px] font-black text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                          Auto-Extract
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Upload PDF, DOCX, or text agreement. Automatically detects tenant, rent rate/sqft, CAM, parking, escalation, deposit, and lock-in. You can review and edit all fields below.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.rtf"
                      disabled={isUploadingAgreement}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadRentAgreement(file);
                        e.target.value = "";
                      }}
                    />
                    <div
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-xs ${
                        isUploadingAgreement
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-teal-700 hover:bg-teal-800 text-white"
                      }`}
                    >
                      {isUploadingAgreement ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Extracting Terms...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} />
                          <span>Browse Lease Deed</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Parsed Highlights Banner */}
                {parsedAgreementMeta && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FileCheck2 size={15} className="text-emerald-700" />
                        <span>Parsed: {parsedAgreementMeta.fileName}</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        {parsedAgreementMeta.confidence}% Confidence • {parsedAgreementMeta.extractedFieldsCount} Terms Extracted
                      </span>
                    </div>

                    {parsedAgreementMeta.summaryHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parsedAgreementMeta.summaryHighlights.map((hl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-900"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-emerald-800 italic pt-0.5">
                      ✓ All detected parameters have been auto-populated into the contract form below. You can modify any value as needed.
                    </p>
                  </div>
                )}
              </div>

              {/* ──── SECTION 1: HIERARCHY MAPPING ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* 1. Occupant */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Occupant (Tenant) <span className="text-rose-500">*</span>
                  </label>
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

                {/* 2. Property */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Property <span className="text-rose-500">*</span>
                  </label>
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

                {/* 3. Building */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Building <span className="text-rose-500">*</span>
                  </label>
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

                {/* 4. Space / Unit */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Space / Unit <span className="text-rose-500">*</span>
                  </label>
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
              </div>

              {/* ──── SECTION 2: RENT CALCULATION BASIS & BILLING MODEL ──── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Calculator size={15} className="text-teal-700" />
                    <span className="font-bold text-slate-800">Rent Calculation Model &amp; Pricing Basis</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Select how base rent is calculated for invoices
                  </span>
                </div>

                {/* Model Tabs / Radio Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: "Area-based", label: "Per Sq.Ft (Area)", desc: "₹/sqft/mo" },
                      { id: "Seat-based", label: "Per Seat (Desk)", desc: "₹/seat/mo" },
                      { id: "Fixed", label: "Fixed Lump-sum", desc: "Flat monthly" },
                      { id: "Hybrid", label: "Hybrid / Turnkey", desc: "Area + Services" },
                      { id: "Pure Rent", label: "Pure Rent", desc: "Bare Shell" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        const newModel = m.id;
                        setContractForm((prev) => {
                          let nextRent = prev.monthlyRent;
                          if (newModel === "Area-based" && prev.ratePerSqft && prev.areaSqft) {
                            nextRent = String(Math.round(Number(prev.ratePerSqft) * Number(prev.areaSqft)));
                          } else if (newModel === "Seat-based" && prev.ratePerSeat && prev.seatCount) {
                            nextRent = String(Math.round(Number(prev.ratePerSeat) * Number(prev.seatCount)));
                          }
                          return { ...prev, billingModel: newModel, monthlyRent: nextRent };
                        });
                      }}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        contractForm.billingModel === m.id
                          ? "bg-white border-teal-600 shadow-xs ring-1 ring-teal-500"
                          : "bg-white/60 border-slate-200 hover:bg-white text-slate-600"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-[11px]">{m.label}</div>
                      <div className="text-[10px] text-slate-500">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Inputs Based on Selected Model */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {contractForm.billingModel === "Area-based" || contractForm.billingModel === "Pure Rent" || contractForm.billingModel === "Hybrid" ? (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Rate per Sq.Ft (₹ / sqft / month) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 80"
                          value={contractForm.ratePerSqft}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const area = Number(contractForm.areaSqft) || 0;
                            const calcRent = rate && area ? String(Math.round(Number(rate) * area)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              ratePerSqft: rate,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Chargeable Area (Sq.Ft) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={contractForm.areaSqft}
                          onChange={(e) => {
                            const area = e.target.value;
                            const rate = Number(contractForm.ratePerSqft) || 0;
                            const calcRent = area && rate ? String(Math.round(Number(area) * rate)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              areaSqft: area,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                    </>
                  ) : contractForm.billingModel === "Seat-based" ? (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Rate per Seat (₹ / seat / month) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 12000"
                          value={contractForm.ratePerSeat}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const seats = Number(contractForm.seatCount) || 0;
                            const calcRent = rate && seats ? String(Math.round(Number(rate) * seats)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              ratePerSeat: rate,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Allocated Seats / Desks <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={contractForm.seatCount}
                          onChange={(e) => {
                            const seats = e.target.value;
                            const rate = Number(contractForm.ratePerSeat) || 0;
                            const calcRent = seats && rate ? String(Math.round(Number(seats) * rate)) : contractForm.monthlyRent;
                            setContractForm({
                              ...contractForm,
                              seatCount: seats,
                              monthlyRent: calcRent,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Chargeable Area (Sq.Ft)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={contractForm.areaSqft}
                        onChange={(e) => setContractForm({ ...contractForm, areaSqft: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                  )}

                  {/* Monthly Base Rent (Calculated / Direct) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Monthly Base Rent (₹) <span className="text-rose-500">*</span>
                      </label>
                      {contractForm.billingModel === "Area-based" && contractForm.ratePerSqft && contractForm.areaSqft && (
                        <span className="text-[10px] font-bold text-teal-700">Auto-calculated</span>
                      )}
                      {contractForm.billingModel === "Seat-based" && contractForm.ratePerSeat && contractForm.seatCount && (
                        <span className="text-[10px] font-bold text-teal-700">Auto-calculated</span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 400000"
                      value={contractForm.monthlyRent}
                      onChange={(e) => setContractForm({ ...contractForm, monthlyRent: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-teal-500 bg-white font-mono font-black text-slate-900 focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Formula Badge */}
                {contractForm.billingModel === "Area-based" && contractForm.ratePerSqft && contractForm.areaSqft && (
                  <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] font-medium text-teal-900 flex items-center justify-between">
                    <span>
                      Formula: ₹{Number(contractForm.ratePerSqft).toLocaleString()} / sqft × {Number(contractForm.areaSqft).toLocaleString()} sqft =
                    </span>
                    <span className="font-mono font-bold">
                      ₹{Number(contractForm.monthlyRent).toLocaleString()} / month base rent
                    </span>
                  </div>
                )}
                {contractForm.billingModel === "Seat-based" && contractForm.ratePerSeat && contractForm.seatCount && (
                  <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] font-medium text-teal-900 flex items-center justify-between">
                    <span>
                      Formula: ₹{Number(contractForm.ratePerSeat).toLocaleString()} / seat × {Number(contractForm.seatCount)} seats =
                    </span>
                    <span className="font-mono font-bold">
                      ₹{Number(contractForm.monthlyRent).toLocaleString()} / month base rent
                    </span>
                  </div>
                )}
              </div>

              {/* ──── SECTION 3: COMMON AREA MAINTENANCE (CAM) & PARKING ──── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* CAM (Common Area Maintenance) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                    <span className="font-bold text-slate-800">Common Area Maintenance (CAM)</span>
                    <span className="text-[10px] text-slate-500">Operation &amp; Upkeep</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CAM Billing Basis</label>
                      <select
                        value={contractForm.camType}
                        onChange={(e) => {
                          const type = e.target.value;
                          let nextMonthly = contractForm.camMonthly;
                          if (type === "Per Sq.Ft" && contractForm.camRate && contractForm.areaSqft) {
                            nextMonthly = String(Math.round(Number(contractForm.camRate) * Number(contractForm.areaSqft)));
                          }
                          setContractForm({ ...contractForm, camType: type, camMonthly: nextMonthly });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-medium outline-none cursor-pointer"
                      >
                        <option value="Per Sq.Ft">Per Sq.Ft (₹/sqft/mo)</option>
                        <option value="Fixed Monthly">Fixed Monthly Amount</option>
                        <option value="Included">Included in Base Rent</option>
                        <option value="Actuals">Actuals / Reimbursement</option>
                      </select>
                    </div>

                    {contractForm.camType === "Per Sq.Ft" ? (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CAM Rate (₹ / sqft)</label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 15"
                          value={contractForm.camRate}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const area = Number(contractForm.areaSqft) || 0;
                            const monthly = rate && area ? String(Math.round(Number(rate) * area)) : "";
                            setContractForm({ ...contractForm, camRate: rate, camMonthly: monthly });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono font-medium outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CAM Monthly (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 75000"
                          value={contractForm.camMonthly}
                          onChange={(e) => setContractForm({ ...contractForm, camMonthly: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono font-medium outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {contractForm.camType === "Per Sq.Ft" && contractForm.camRate && contractForm.areaSqft && (
                    <div className="text-[11px] text-teal-800 font-medium">
                      CAM Total: ₹{Math.round(Number(contractForm.camRate) * Number(contractForm.areaSqft)).toLocaleString()} / month
                    </div>
                  )}
                </div>

                {/* Parking Allocations */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Car size={13} />
                      <span>Parking Allocations</span>
                    </div>
                    <span className="text-[10px] text-slate-500">4-Wheeler &amp; 2-Wheeler</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Car Slots (4W)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Slots (e.g. 4)"
                        value={contractForm.carParkingSlots}
                        onChange={(e) => setContractForm({ ...contractForm, carParkingSlots: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Rate / Car Slot (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="₹/slot (e.g. 4000)"
                        value={contractForm.carParkingRate}
                        onChange={(e) => setContractForm({ ...contractForm, carParkingRate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Bike Slots (2W)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Slots (e.g. 10)"
                        value={contractForm.twoWheelerSlots}
                        onChange={(e) => setContractForm({ ...contractForm, twoWheelerSlots: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Rate / Bike Slot (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="₹/slot (e.g. 500)"
                        value={contractForm.twoWheelerRate}
                        onChange={(e) => setContractForm({ ...contractForm, twoWheelerRate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ──── LIVE GROSS MONTHLY PAYOUT SUMMARY CARD ──── */}
              {Number(contractForm.monthlyRent) > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-md text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-800/80 pb-2">
                    <span className="font-bold tracking-wide uppercase text-[11px] text-teal-300">
                      Live Invoicing Breakdown &amp; Monthly Cashflow
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono">
                      SAC Code 997212 (Leasing)
                    </span>
                  </div>

                  {(() => {
                    const baseRent = Number(contractForm.monthlyRent) || 0;
                    const cam =
                      contractForm.camType === "Per Sq.Ft"
                        ? Math.round((Number(contractForm.camRate) || 0) * (Number(contractForm.areaSqft) || 0))
                        : Number(contractForm.camMonthly) || 0;
                    const parking =
                      (Number(contractForm.carParkingSlots) || 0) * (Number(contractForm.carParkingRate) || 0) +
                      (Number(contractForm.twoWheelerSlots) || 0) * (Number(contractForm.twoWheelerRate) || 0);
                    const grossExclGst = baseRent + cam + parking;
                    const gst = Math.round(grossExclGst * 0.18);
                    const totalGross = grossExclGst + gst;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Base Rent</div>
                          <div className="font-bold text-sm text-white">₹{baseRent.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">CAM + Parking</div>
                          <div className="font-bold text-sm text-teal-300">₹{(cam + parking).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Gross (Excl. GST)</div>
                          <div className="font-bold text-sm text-white">₹{grossExclGst.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-400 uppercase font-sans font-bold">Total Invoiced (GST 18%)</div>
                          <div className="font-black text-sm text-emerald-300">₹{totalGross.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ──── SECTION 4: SECURITY DEPOSIT (IFRSD) ──── */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/70 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-teal-700" />
                    <span>Interest-Free Refundable Security Deposit (IFRSD)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Quick multi-month rent multipliers
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 mr-1">Months multiplier:</span>
                  {["3", "6", "9", "10", "12"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const rent = Number(contractForm.monthlyRent) || 0;
                        setContractForm({
                          ...contractForm,
                          depositMonths: m,
                          securityDeposit: rent > 0 ? String(Math.round(Number(m) * rent)) : contractForm.securityDeposit,
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        contractForm.depositMonths === m
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Security Deposit Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2400000"
                      value={contractForm.securityDeposit}
                      onChange={(e) => setContractForm({ ...contractForm, securityDeposit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Rent-Free Fit-out Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 30 (Days)"
                      value={contractForm.fitoutDays}
                      onChange={(e) => setContractForm({ ...contractForm, fitoutDays: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ──── SECTION 5: DATES & LEGAL PERIODS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Contract Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contract Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* Contract End Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contract End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* Lock-in Period */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lock-in Period (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={contractForm.lockInMonths}
                    onChange={(e) => setContractForm({ ...contractForm, lockInMonths: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>

                {/* Notice Period */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 90 (Days)"
                    value={contractForm.noticeDays}
                    onChange={(e) => setContractForm({ ...contractForm, noticeDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              {/* ──── SECTION 6: ESCALATION TERMS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Escalation % */}
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

                {/* Escalation Frequency */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Frequency</label>
                  <select
                    value={contractForm.escalationFrequency}
                    onChange={(e) => setContractForm({ ...contractForm, escalationFrequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Annual">Annual (Every 12 Months)</option>
                    <option value="Biannual">Biannual (Every 24 Months)</option>
                    <option value="Triennial">Triennial (Every 36 Months)</option>
                    <option value="Quarterly">Quarterly (Every 3 Months)</option>
                  </select>
                </div>

                {/* Escalation Start Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escalation Start Date</label>
                  <input
                    type="date"
                    value={contractForm.escalationStartDate}
                    onChange={(e) => setContractForm({ ...contractForm, escalationStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none"
                  />
                </div>
              </div>

              {/* ──── SECTION 7: STATUTORY & INVOICING TERMS ──── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Billing Entity (SPV) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Billing Entity (Which SPV Bills This)
                  </label>
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

                {/* Payment Terms */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="Due on 1st of month">Due on 1st of month</option>
                    <option value="Due on 5th of month">Due on 5th of month</option>
                    <option value="Due on 7th of month">Due on 7th of month</option>
                    <option value="Net 0">Net 0 (Due upon receipt)</option>
                    <option value="Net 7">Net 7 (Within 7 days)</option>
                    <option value="Net 15">Net 15 (Within 15 days)</option>
                    <option value="Net 30">Net 30 (Within 30 days)</option>
                  </select>
                </div>

                {/* Stamp Duty & Registration Sharing */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stamp Duty Sharing</label>
                  <select
                    value={contractForm.stampDutySharing}
                    onChange={(e) => setContractForm({ ...contractForm, stampDutySharing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:border-[#0F8B7D] outline-none cursor-pointer"
                  >
                    <option value="50:50 Shared">50:50 Shared Equally</option>
                    <option value="100% Tenant">100% Borne by Tenant</option>
                    <option value="100% Landlord">100% Borne by Landlord</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Covenants &amp; Special Conditions <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific covenants, signage rights, power backup limits, fitout terms, or termination clauses..."
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:border-[#0F8B7D] outline-none resize-none text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("tenant")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Tenants
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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
