"use client";
import React, { useState } from "react";
import { 
  Building, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  Calendar, 
  ClipboardList, 
  Users, 
  Plus, 
  X, 
  CheckCircle, 
  TrendingUp, 
  Handshake, 
  DollarSign,
  ArrowRight,
  Send,
  Trash2,
  Activity,
  Receipt,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  UserPlus,
  Sparkles,
  Share2
} from "lucide-react";
import Link from "next/link";
import ProfileCompletionMeter from "@/components/ProfileCompletionMeter";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";
import { AddTenantModal } from "@/components/rent-roll/AddTenantModal";

interface PropertyDashboardClientProps {
  initialProperties: any[];
  initialTickets: any[];
  initialCerts: any[];
  initialLogs: any[];
}

export default function PropertyDashboardClient({
  initialProperties,
  initialTickets,
  initialCerts,
  initialLogs
}: PropertyDashboardClientProps) {
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [customProperties, setCustomProperties] = useState<any[]>([]);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [inviteModalProp, setInviteModalProp] = useState<any | null>(null);

  // Detect Clean Mode on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("officex_mode");
      const email = localStorage.getItem("officex_user_email") || "";
      const uid = localStorage.getItem("officex_user_id") || "";
      // Any authenticated user who is not explicitly a demo seed account gets clean mode
      const isTest = Boolean(mode === "clean_test" || (email && !email.includes("demo.seed")));
      setIsCleanMode(isTest);
      setUserEmail(email);
      setUserId(uid);

      const isCompleted = Boolean(
        localStorage.getItem("officex_onboarding_completed") === "1" ||
        sessionStorage.getItem("officex_onboarding_completed") === "1" ||
        Boolean(localStorage.getItem("officex_active_org"))
      );
      setIsOnboardingCompleted(isCompleted);

      // Mark onboarding as completed so user is not blocked
      if (!isCompleted && typeof window !== "undefined") {
        localStorage.setItem("officex_onboarding_completed", "1");
        setIsOnboardingCompleted(true);
      }

      const SEED_PROP_IDS = new Set([
        "357554cc-221d-4c7f-9465-32afcec7a8e7",
        "72b18ad7-0ee0-4ac5-bfc9-156c6dc10625",
        "8b1b9613-b890-4540-9139-6c2a6bb6cf60",
        "401f394a-6d27-4c23-9a21-411baa7eef3b",
        "cfa13505-71a5-4a43-be33-37497f416fdc",
        "cf5a0b49-c4fd-4762-ae22-40c42ac6332d",
        "PROP-8841"
      ]);
      const SEED_PROP_NAMES = new Set([
        "eka club",
        "business hub",
        "shivalik shilp",
        "apex business tower",
        "apex commercial tower",
        "meridian tech park",
        "nexus hub",
        "maker maxity",
        "godrej bkc horizon"
      ]);

      let rawSavedProps: any[] = [];
      try {
        rawSavedProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
      } catch {
        rawSavedProps = [];
      }

      // Purge demo seed properties for standard accounts
      let savedProps = isTest
        ? rawSavedProps.filter((p: any) => !SEED_PROP_IDS.has(p?.id) && !SEED_PROP_NAMES.has((p?.name || p?.propertyName || "").toLowerCase().trim()))
        : rawSavedProps;

      // Recover property from user signup if local list was empty
      const registeredPropName = (localStorage.getItem("officex_property_name") || localStorage.getItem("officex_active_org") || "").trim();
      const city = localStorage.getItem("officex_property_city") || localStorage.getItem("officex_org_city") || "Delhi NCR";
      const state = city.toLowerCase().includes("delhi") ? "Delhi" : city.toLowerCase().includes("mumbai") ? "Maharashtra" : "India";
      const regArea = localStorage.getItem("officex_leasable_area") || "15000";

      if ((savedProps.length === 0 || savedProps.some(p => SEED_PROP_NAMES.has((p?.name || "").toLowerCase().trim()))) && registeredPropName && !SEED_PROP_NAMES.has(registeredPropName.toLowerCase().trim())) {
        const code = `OX-${Math.floor(1000 + Math.random() * 9000)}`;
        const userProp = {
          id: `prop-${Date.now()}`,
          name: registeredPropName,
          type: "Commercial Office",
          city: city,
          state: state,
          totalArea: Number(regArea).toLocaleString(),
          grade: "Grade A",
          inviteCode: code,
          ownerName: localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org") || "Commercial Asset Owner",
          createdAt: new Date().toISOString()
        };
        savedProps = [userProp];
      }

      localStorage.setItem("officex_user_properties", JSON.stringify(savedProps));

      // Fetch user's organization from database only if user ID exists
      if (savedProps.length === 0 && uid) {
        fetch(`/api/me/organization?userId=${uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.organizations && data.organizations.length > 0) {
              const org = data.organizations[0];
              let newProps: any[] = [];
              if (org.properties && org.properties.length > 0) {
                newProps = org.properties.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  city: p.city || "",
                  state: p.state || "",
                  address: p.address || "",
                  microMarket: p.micro_market || p.city || "",
                  grade: p.grade || "Grade A",
                  totalArea: p.total_area || "",
                  baseRent: "",
                  ownerName: p.owner_name || localStorage.getItem("officex_user_name") || "",
                  ownerEmail: email,
                  imageUrl: p.image_url || null,
                  createdAt: p.created_at || new Date().toISOString()
                }));
              }
              if (newProps.length > 0) {
                // Deduplicate: merge with any existing savedProps by ID
                const propMap = new Map<string, any>();
                savedProps.forEach((p: any) => propMap.set(p.id, p));
                newProps.forEach((p: any) => propMap.set(p.id, p));
                const deduped = Array.from(propMap.values());
                localStorage.setItem("officex_user_properties", JSON.stringify(deduped));
                setCustomProperties(deduped);
                return; // Don't re-set from savedProps below
              }
            }
          })
          .catch(() => { /* silently fail if API unreachable */ });
      }

      // Only set from localStorage if API fetch was not triggered
      setCustomProperties(savedProps);
      const savedPartnerships = JSON.parse(localStorage.getItem("officex_user_partnerships") || "[]");
      setPartnerships(savedPartnerships);
    }
  }, []);

  // Live Rent Roll Dashboard KPIs & Active Leases
  const [rentRollData, setRentRollData] = useState<any>(null);
  const [activeLeases, setActiveLeases] = useState<any[]>([]);

  const loadLeasesAndDashboard = async () => {
    try {
      const [leasesRes, dashRes] = await Promise.all([
        fetch("/api/rent-roll/leases"),
        fetch("/api/rent-roll/dashboard")
      ]);
      if (leasesRes.ok) {
        const data = await leasesRes.json();
        if (Array.isArray(data)) {
          let localLeases: any[] = [];
          try {
            localLeases = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
          } catch {}
          const mergedMap = new Map<string, any>();
          data.forEach((l: any) => mergedMap.set(l.id || l.tenantName, l));
          localLeases.forEach((l: any) => mergedMap.set(l.id || l.tenantName, l));
          setActiveLeases(Array.from(mergedMap.values()));
        }
      }
      if (dashRes.ok) {
        const data = await dashRes.json();
        if (data) setRentRollData(data);
      }
    } catch (e) {
      console.warn("Rent roll load error:", e);
    }
  };

  React.useEffect(() => {
    loadLeasesAndDashboard();
  }, []);

  // Add Tenant Modal Form State
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    propertyId: "",
    tradeName: "",
    legalName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    unitNumber: "Suite 101",
    floorNumber: 1,
    chargeableArea: "5000",
    monthlyRent: "250000",
    securityDeposit: "750000",
    leaseStartDate: "2025-04-01",
    leaseEndDate: "2028-03-31",
    escalationPct: "5%"
  });

  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.tradeName.trim()) {
      showToast("Please enter tenant business / trade name.");
      return;
    }
    setIsSubmittingTenant(true);

    try {
      const selectedProp = displayedProperties.find(p => p.id === newTenantData.propertyId) || displayedProperties[0];
      const propId = selectedProp ? selectedProp.id : "PROP-FORTUNE-SKY";
      const propName = selectedProp ? selectedProp.name : "fortune sky";
      const inviteCode = selectedProp?.inviteCode || `OX-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLeaseRecord = {
        id: `LEASE-${Date.now().toString().slice(-4)}`,
        propertyId: propId,
        propertyName: propName,
        tenantName: newTenantData.tradeName.trim(),
        tradeName: newTenantData.tradeName.trim(),
        legalName: (newTenantData.legalName || newTenantData.tradeName).trim(),
        contactPerson: newTenantData.contactPerson || "Authorized Manager",
        contactEmail: newTenantData.contactEmail || "billing@tenant.in",
        contactPhone: newTenantData.contactPhone || "+91 98000 00000",
        unitNumber: newTenantData.unitNumber || "Suite 101",
        floorNumber: Number(newTenantData.floorNumber) || 1,
        chargeableArea: Number(newTenantData.chargeableArea) || 5000,
        carpetArea: Math.round((Number(newTenantData.chargeableArea) || 5000) * 0.8),
        monthlyRent: Number(newTenantData.monthlyRent) || 250000,
        camMonthly: Math.round((Number(newTenantData.chargeableArea) || 5000) * 15),
        totalMonthlyGross: Number(newTenantData.monthlyRent) || 250000,
        securityDepositAmount: Number(newTenantData.securityDeposit) || 750000,
        startDate: newTenantData.leaseStartDate || "2025-04-01",
        endDate: newTenantData.leaseEndDate || "2028-03-31",
        escalationPct: parseFloat(newTenantData.escalationPct) || 5,
        status: "active",
        inviteCode: inviteCode
      };

      // 1. Instantly update UI state so tenant appears in dashboard table immediately
      setActiveLeases(prev => [newLeaseRecord, ...prev.filter(l => (l.tenantName || "").toLowerCase() !== newLeaseRecord.tenantName.toLowerCase())]);

      // 2. Persist to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("officex_active_leases") || "[]");
        const clean = stored.filter((l: any) => (l.tenantName || "").toLowerCase() !== newLeaseRecord.tenantName.toLowerCase());
        localStorage.setItem("officex_active_leases", JSON.stringify([newLeaseRecord, ...clean]));
      } catch {}

      // 3. Post to Tenants API
      await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeName: newTenantData.tradeName.trim(),
          legalName: (newTenantData.legalName || newTenantData.tradeName).trim(),
          contactPerson: newTenantData.contactPerson || "Authorized Manager",
          contactEmail: newTenantData.contactEmail || "billing@tenant.in",
          contactPhone: newTenantData.contactPhone || "+91 98000 00000",
          industry: "Corporate / Commercial",
          billingAddress: `${propName}, Unit ${newTenantData.unitNumber}`,
          billingCity: selectedProp?.city || "Delhi NCR",
          billingState: selectedProp?.state || "Delhi",
          billingPincode: selectedProp?.pincode || "110001"
        })
      });

      // 4. Post to Leases API
      await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propId,
          propertyName: propName,
          tenantName: newTenantData.tradeName.trim(),
          unitNumber: newTenantData.unitNumber || "Suite 101",
          floorNumber: Number(newTenantData.floorNumber) || 1,
          chargeableArea: Number(newTenantData.chargeableArea) || 5000,
          carpetArea: Math.round((Number(newTenantData.chargeableArea) || 5000) * 0.8),
          monthlyRent: Number(newTenantData.monthlyRent) || 250000,
          camMonthly: Math.round((Number(newTenantData.chargeableArea) || 5000) * 15),
          securityDepositAmount: Number(newTenantData.securityDeposit) || 750000,
          startDate: newTenantData.leaseStartDate || "2025-04-01",
          endDate: newTenantData.leaseEndDate || "2028-03-31",
          escalationPct: parseFloat(newTenantData.escalationPct) || 5
        })
      });

      showToast(`🎉 Tenant "${newTenantData.tradeName}" registered and added to your active dashboard!`);
      setShowAddTenantModal(false);
      setNewTenantData({
        propertyId: "",
        tradeName: "",
        legalName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        unitNumber: "Suite 101",
        floorNumber: 1,
        chargeableArea: "5000",
        monthlyRent: "250000",
        securityDeposit: "750000",
        leaseStartDate: "2025-04-01",
        leaseEndDate: "2028-03-31",
        escalationPct: "5%"
      });

      // Refresh dashboard data
      loadLeasesAndDashboard();
    } catch (err) {
      console.error("Error creating tenant:", err);
      showToast("Registered tenant saved to your local portfolio session.");
      setShowAddTenantModal(false);
    } finally {
      setIsSubmittingTenant(false);
    }
  };

  // Form state
  const [assignPropertyId, setAssignPropertyId] = useState(initialProperties[0]?.id || "");
  const [assignBroker, setAssignBroker] = useState("Ravi Menon (Leasing Director)");
  const [commissionType, setCommissionType] = useState("1 Month Rent");
  const [commissionRate, setCommissionRate] = useState("8.33%");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mock list of registered brokers in the directory
  const brokerDirectory = [
    { name: "Ravi Menon", role: "Leasing Director", experience: "12 Yrs", activeDeals: 15, rating: "4.8/5" },
    { name: "Amit Kumar", role: "Commercial Partner", experience: "8 Yrs", activeDeals: 8, rating: "4.6/5" },
    { name: "Priya Sharma", role: "Co-working Specialist", experience: "6 Yrs", activeDeals: 12, rating: "4.7/5" }
  ];

  // Active & Pending partnerships
  const [partnerships, setPartnerships] = useState<any[]>([]);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const activeList = isCleanMode ? customProperties : initialProperties;
    const selectedProp = activeList.find(p => p.id === assignPropertyId) || { name: "Commercial Tower" };
    
    const newP = {
      id: "BP-" + Math.floor(Math.random() * 900 + 100),
      propertyName: selectedProp.name,
      brokerName: assignBroker.split(" (")[0],
      commission: commissionType,
      status: "Awaiting Acceptance",
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    };

    const updated = [newP, ...partnerships];
    setPartnerships(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_partnerships", JSON.stringify(updated));
    }
    setShowAssignModal(false);
    showToast(`Brokerage invite sent to ${newP.brokerName} for ${newP.propertyName}! Commission set to ${newP.commission}.`);
  };

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.id) {
        // Remove from custom local properties
        const updated = customProperties.filter(p => p.id !== deleteTarget.id);
        setCustomProperties(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("officex_user_properties", JSON.stringify(updated));
        }
      }
      showToast(`Property "${deleteTarget.name}" deleted from your portfolio.`);
      setDeleteTarget(null);
    } catch (e) {
      showToast("Error deleting property.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate displayed properties: Merge real DB properties for this user + any local additions
  const displayedProperties = React.useMemo(() => {
    // 1. If user has custom properties in state, show them
    if (customProperties.length > 0) {
      return customProperties;
    }

    // 2. If user is matched by ownerUserId or email
    const userDbProps = initialProperties.filter(p => 
      (userId && p.ownerUserId === userId) ||
      (userEmail && p.ownerEmail === userEmail)
    );
    if (userDbProps.length > 0) return userDbProps;

    // 3. Match by active organization if set in localStorage
    const activeOrg = typeof window !== "undefined" ? (localStorage.getItem("officex_active_org") || localStorage.getItem("officex_org_name") || "") : "";
    if (activeOrg) {
      const orgProps = initialProperties.filter(p => 
        (p.ownerCompany && p.ownerCompany.toLowerCase().includes(activeOrg.toLowerCase())) ||
        (p.name && p.name.toLowerCase().includes(activeOrg.toLowerCase()))
      );
      if (orgProps.length > 0) return orgProps;
    }

    return [];
  }, [initialProperties, customProperties, userId, userEmail]);

  const propertiesCount = displayedProperties.length;
  const openTicketsCount = propertiesCount === 0 ? 0 : initialTickets.filter(t => t.status === "open").length;
  const expiredCertsCount = propertiesCount === 0 ? 0 : initialCerts.filter(c => c.status === "expired").length;
  const occupancyDisplay = propertiesCount > 0 ? "100%" : "0.0%";


  return (
    <div className="flex flex-col gap-8 font-sans relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Commercial Portfolio &amp; Assets
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage your commercial real estate portfolio, vacant spaces, and leasing partnerships.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (displayedProperties.length > 0) {
                setNewTenantData(prev => ({ ...prev, propertyId: displayedProperties[0].id }));
              }
              setShowAddTenantModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} className="text-[#0F8B7D]" />
            <span>Add Tenant</span>
          </button>
          <Link
            href="/properties/rent-roll?tab=tenants"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Users size={14} className="text-slate-500" />
            <span>Tenant Directory</span>
          </Link>
          <button 
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Handshake size={14} className="text-purple-600" />
            <span>Assign Broker</span>
          </button>
          <Link 
            href="/properties/add" 
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Incomplete Action Banner */}
      {!isOnboardingCompleted && (
        <div className="bg-gradient-to-r from-teal-900 via-[#0F8B7D] to-teal-800 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-600/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Action Required
                </span>
                <span className="text-xs font-bold text-teal-100">Setup Business Master</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Complete Your 7-Step Business Onboarding
              </h3>
              <p className="text-xs text-teal-100/90 mt-0.5 max-w-xl">
                Register your legal organization, GST master, statutory KYC documents, and commercial property details to launch your institutional dashboard.
              </p>
            </div>
          </div>
          <Link
            href="/signup?context=rent-roll&role=owner&module=rent-roll&redirect=/properties"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-teal-950 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:scale-[1.02]"
          >
            <span>Launch Onboarding Form</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* S12 Profile Completion & Progressive KYC Meter (v1.0 Spec Section 15) */}
      <ProfileCompletionMeter role="owner" />

      {/* Broker Partnership Alert Banner — only show when user has real partnerships */}
      {partnerships.length > 0 && (
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Handshake size={16} />
            </div>
            <div>
              <span className="font-black text-purple-950 block">{partnerships[0].id} {partnerships[0].propertyName} — Broker contract {partnerships[0].status?.toLowerCase()}</span>
              <span className="text-[11px] text-purple-700">Commercial Partner: {partnerships[0].brokerName} ({partnerships[0].commission}) · {partnerships[0].date}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer text-center"
          >
            Manage Contract
          </button>
        </div>
      )}

      {/* Time-Sensitive Statutory Renewal Alert Strip (Only when real expired certs exist) */}
      {expiredCertsCount > 0 && propertiesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="font-black text-amber-950 text-xs uppercase tracking-wider">Urgent Statutory Compliance Action</span>
              </div>
              <p className="text-amber-800 text-xs font-medium mt-0.5">
                Fire Safety NOC &amp; Lift Inspector Renewal due in <strong className="text-amber-950 font-black">3 days</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/properties/compliance"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs text-center"
          >
            Review &amp; Renew NOC →
          </Link>
        </div>
      )}

      {/* ═══ LIVE RENT ROLL & LEASE PERFORMANCE COMMAND HUB ═══ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F8B7D] border border-teal-200/70">
                SaaS Module S04-03
              </span>
              <span className="text-xs text-slate-500 font-medium">Live Institutional Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Rent Roll &amp; Commercial Lease Performance</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {propertiesCount > 0 && rentRollData?.propertyCount
                ? `Automated lease-to-cash operating system across ${propertiesCount} institutional Grade-A assets.`
                : "Automated commercial lease-to-cash operating system. Onboard your assets to track lease billing."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/properties/rent-roll?tab=master"
              className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>Full Rent Roll</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/properties/rent-roll?tab=invoices"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all border border-slate-200/90 flex items-center gap-1.5 shadow-2xs"
            >
              <Receipt size={14} />
              <span>Invoices</span>
            </Link>
            <Link
              href="/properties/rent-roll?tab=escalations"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all border border-slate-200/90 flex items-center gap-1.5 shadow-2xs"
            >
              <TrendingUp size={14} />
              <span>Escalations</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Monthly Gross Rent</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{propertiesCount > 0 && rentRollData?.summary?.totalMonthlyRent ? (rentRollData.summary.totalMonthlyRent / 10000000).toFixed(2) : (activeLeases.length > 0 ? (activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent || l.totalMonthlyGross || 0), 0) / 10000000).toFixed(2) : "0.00")} Cr
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.activeLeasesCount || activeLeases.length || 0) : 0} Active Commercial Leases
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Portfolio Occupancy</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {propertiesCount > 0 ? (rentRollData?.occupancy?.occupancyPct || (activeLeases.length > 0 ? "33.3" : 0)) : 0}%
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              {propertiesCount > 0 && (rentRollData?.occupancy?.totalArea || activeLeases.length > 0) ? `${((rentRollData?.occupancy?.totalArea || 15000) / 1000).toFixed(0)}k sq.ft Total Area` : "0 sq.ft Total Area"}
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Outstanding</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{propertiesCount > 0 && rentRollData?.summary?.totalOutstanding ? (rentRollData.summary.totalOutstanding / 10000000).toFixed(2) : "0.00"} Cr
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {propertiesCount > 0 ? (rentRollData?.summary?.overdueLeasesCount || 0) : 0} Leases Overdue
            </span>
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">WALT (Lease Horizon)</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {propertiesCount > 0 && rentRollData?.walt?.waltByRentMonths ? `${(rentRollData.walt.waltByRentMonths / 12).toFixed(1)} Yrs` : "0.0 Yrs"}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.escalationsDueCount || 0) : 0} Escalations Due Soon
            </span>
          </div>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO GRID (5 Columns with Portfolio Health Score from /ops) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Properties */}
        <Link 
          href="/properties/add" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-[#8B5CF6]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Properties</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-[#8B5CF6] transition-colors">{propertiesCount}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              {propertiesCount === 0 ? "0 Listed (Ready to Add)" : "🟢 Active Portfolio"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform shrink-0">
            <Building size={22} />
          </div>
        </Link>

        {/* Portfolio Health Score */}
        <Link 
          href="/properties/rent-roll?tab=dashboard" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-[#0F8B7D]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Portfolio Health</span>
            <div className="text-2xl sm:text-3xl font-black text-[#0F8B7D] mt-1.5 group-hover:text-teal-800 transition-colors">
              {propertiesCount === 0 ? "100%" : "100/100"}
            </div>
            <span className="text-[10px] text-teal-700 font-semibold mt-1 block">
              {propertiesCount === 0 ? "● Systems Ready" : "● Optimal (FM Ops Live)"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F8B7D] group-hover:scale-105 transition-transform shrink-0">
            <Activity size={22} />
          </div>
        </Link>

        {/* Occupancy Rate */}
        <Link 
          href="/properties/rent-roll" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Occupancy</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">{occupancyDisplay}</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              {isCleanMode ? "Clean Sandbox Metrics" : "↑ 1.8% vs last month"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp size={22} />
          </div>
        </Link>

        {/* Tenant Requests & Service Issues */}
        <Link 
          href="/properties/tenants" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tenant Requests</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 group-hover:text-amber-700 transition-colors">{openTicketsCount}</div>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {openTicketsCount === 0 ? "No open requests" : `⚠ ${openTicketsCount} open tenant requests`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shrink-0">
            <AlertTriangle size={22} />
          </div>
        </Link>

        {/* Expired Compliance NOCs */}
        <Link 
          href="/properties/compliance" 
          className="p-5 rounded-2xl border border-slate-200/90 flex items-center justify-between bg-white shadow-2xs hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Expired NOCs</span>
            <div className={`text-2xl sm:text-3xl font-black mt-1.5 transition-colors ${expiredCertsCount === 0 ? "text-slate-900 group-hover:text-slate-700" : "text-red-600 group-hover:text-red-700"}`}>
              {expiredCertsCount}
            </div>
            <span className={`text-[10px] font-semibold mt-1 block ${expiredCertsCount === 0 ? "text-emerald-600" : "text-red-600"}`}>
              {expiredCertsCount === 0 ? "✓ All NOCs Compliant" : "✗ Renewal Required"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            expiredCertsCount === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
          }`}>
            <ShieldCheck size={22} />
          </div>
        </Link>

      </div>

      {/* RECEIVABLES AGEING & RECOVERY LEDGER (per UI/UX Review Finding 2.3) */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-gray-50 pb-3">
          <div>
            <span className="text-[10px] text-[#0F8B7D] font-bold uppercase tracking-wider block">Collections &amp; Liquidity</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">Receivables Ageing Analysis (Last 90 Days)</h3>
          </div>
          <Link
            href="/properties/collections"
            className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
          >
            Full Invoice Ledger <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 0-30 Days Current */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-900">0–30 Days (Current / On-Time)</span>
              <span className="font-black text-emerald-700">
                {propertiesCount > 0 && rentRollData?.aging?.current && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.current / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-emerald-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.current ? Number(rentRollData.aging.current).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.current && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.current / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.activeLeasesCount || 0) : 0} Corporate Leases Cleared
            </span>
          </div>

          {/* 31-60 Days Follow-up */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-900">31–60 Days (Grace Period)</span>
              <span className="font-black text-amber-700">
                {propertiesCount > 0 && rentRollData?.aging?.bucket31to60 && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.bucket31to60 / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-amber-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.bucket31to60 ? Number(rentRollData.aging.bucket31to60).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-amber-500 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.bucket31to60 && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.bucket31to60 / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 ? (rentRollData?.summary?.overdueLeasesCount || 0) : 0} Leases Pending Reconciliation
            </span>
          </div>

          {/* 61-90+ Days Overdue */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-rose-900">61–90+ Days (Overdue Notice)</span>
              <span className="font-black text-rose-700">
                {propertiesCount > 0 && rentRollData?.aging?.bucket61to90 && rentRollData?.summary?.totalMonthlyBilling ? ((rentRollData.aging.bucket61to90 / rentRollData.summary.totalMonthlyBilling) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-xl font-black text-rose-950">
              ₹{propertiesCount > 0 && rentRollData?.aging?.bucket61to90 ? Number(rentRollData.aging.bucket61to90 + (rentRollData.aging.bucket90Plus || 0)).toLocaleString("en-IN") : "0"}
            </div>
            <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${propertiesCount > 0 && rentRollData?.aging?.bucket61to90 && rentRollData?.summary?.totalMonthlyBilling ? Math.min(100, (rentRollData.aging.bucket61to90 / rentRollData.summary.totalMonthlyBilling) * 100) : 0}%` }} 
              />
            </div>
            <span className="text-[10px] text-rose-700 font-semibold mt-1.5 block">
              {propertiesCount > 0 && rentRollData?.aging?.bucket90Plus ? "Statutory Reminder Dispatched" : "No overdue notices"}
            </span>
          </div>
        </div>
      </div>

      {/* PORTFOLIO PROPERTY BUILDINGS LIST / EMPTY STATE */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-[#0F8B7D]" />
            <h3 className="text-base font-bold text-gray-900">Commercial Property Portfolio</h3>
          </div>
          <Link
            href="/properties/add"
            className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-800 transition-colors shadow-2xs flex items-center gap-1"
          >
            <Plus size={13} /> Add Property Listing
          </Link>
        </div>

        {propertiesCount === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
              <Building size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No Properties in Portfolio Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                You haven&apos;t added any commercial properties yet. Click below to create your first commercial building and start managing your portfolio!
              </p>
            </div>
            <Link
              href="/properties/add"
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} /> Create First Property Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProperties.map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0F8B7D] hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-bold border border-teal-100">
                      {p.grade ? (p.grade.startsWith("Grade") ? p.grade : `Grade ${p.grade}`) : "Grade A"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Listing
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(p);
                        }}
                        title="Remove / Delete Listing"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0F8B7D] transition-colors capitalize">{p.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.microMarket || p.city}, {p.state || p.city}</p>
                  {p.address && <p className="text-[10px] text-gray-400 mt-1 truncate">{p.address}</p>}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Base Rent</span>
                    <span className="font-extrabold text-gray-900">
                      {p.baseRent ? `₹${p.baseRent}/sq.ft.` : p.rentalRate ? `₹${p.rentalRate}/sq.ft.` : "Quote on Request"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Total Area</span>
                    <span className="font-extrabold text-gray-900">
                      {p.totalArea ? (typeof p.totalArea === "number" || !isNaN(Number(p.totalArea)) ? `${Number(p.totalArea).toLocaleString()} sq.ft.` : p.totalArea) : "Area on Request"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const codeNum = (p.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                        setInviteModalProp({
                          id: p.id,
                          name: p.name,
                          location: `${p.city || ''}, ${p.state || ''}`,
                          inviteCode: p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                          ownerName: p.ownerName || p.ownerCompany || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] hover:text-white text-[#0F8B7D] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Generate Tenant Invitation Link & Building Code"
                    >
                      <Share2 size={11} /> Invite Tenants
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTenantData(prev => ({ ...prev, propertyId: p.id }));
                        setShowAddTenantModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Add Existing Tenant to this property"
                    >
                      <UserPlus size={11} /> + Tenant
                    </button>
                    <Link
                      href={`/properties/rent-roll?propertyId=${p.id || ""}`}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-[#0F8B7D] hover:text-white text-gray-700 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Rent Roll →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE TENANTS & COMMERCIAL LEASES SCHEDULE */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              Active Tenants & Commercial Leases Schedule
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified corporate occupiers, monthly lease revenues, and tenant invitation links.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
              {activeLeases.length} Active {activeLeases.length === 1 ? "Lease" : "Leases"}
            </span>
            <button
              type="button"
              onClick={() => {
                setNewTenantData(prev => ({ ...prev, propertyId: displayedProperties[0]?.id || "" }));
                setShowAddTenantModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={13} /> Add Tenant
            </button>
            <Link
              href="/properties/rent-roll?tab=rentroll"
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              Rent Roll Master →
            </Link>
          </div>
        </div>

        {activeLeases.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No Tenants Added Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                You haven&apos;t added any commercial tenants yet. Click &apos;Add Tenant&apos; to onboard your occupants and start automated monthly billing!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewTenantData(prev => ({ ...prev, propertyId: displayedProperties[0]?.id || "" }));
                setShowAddTenantModal(true);
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={14} /> Add First Tenant & Lease
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Tenant / Trade Name</th>
                  <th className="py-3 px-3">Property & Space</th>
                  <th className="py-3 px-3">Leased Area</th>
                  <th className="py-3 px-3">Monthly Rent</th>
                  <th className="py-3 px-3">Lease Period</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {activeLeases.map((l: any, idx: number) => {
                  const prop = displayedProperties.find(p => p.id === l.propertyId || p.name?.toLowerCase() === l.propertyName?.toLowerCase()) || displayedProperties[0];
                  const codeNum = (l.propertyId || prop?.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                  const inviteCode = l.inviteCode || prop?.inviteCode || `OX-${codeNum.padStart(4, "7")}`;
                  const rentAmt = Number(l.monthlyRent || l.totalMonthlyGross || 250000);
                  const areaAmt = Number(l.chargeableArea || 5000);

                  return (
                    <tr key={l.id || idx} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-gray-900">{l.tenantName || l.tradeName || "Commercial Occupier"}</div>
                        {(l.contactPerson || l.contactEmail) && (
                          <div className="text-[10px] text-gray-400 font-medium">
                            {l.contactPerson} {l.contactEmail ? `· ${l.contactEmail}` : ""}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">{l.propertyName || prop?.name || "fortune sky"}</div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {l.unitNumber || "Suite 401"}{l.floorNumber ? ` (Floor ${l.floorNumber})` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">{areaAmt.toLocaleString()} sq.ft.</span>
                        <div className="text-[9px] text-gray-400">Chargeable Area</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-emerald-700">₹{rentAmt.toLocaleString("en-IN")}/mo</div>
                        <div className="text-[9px] text-gray-400">₹{(rentAmt / (areaAmt || 1)).toFixed(0)}/sq.ft./mo</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-700">{l.startDate || "2025-04-01"} → {l.endDate || "2028-03-31"}</div>
                        <div className="text-[9px] text-gray-400">Escalation: {l.escalationPct || 5}% / yr</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Lease
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInviteModalProp({
                                id: l.propertyId || prop?.id || "prop-fs",
                                name: l.propertyName || prop?.name || "fortune sky",
                                location: prop?.location || "Delhi NCR",
                                inviteCode: inviteCode,
                                ownerName: prop?.ownerName || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Asset Owner"
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] hover:text-white text-[#0F8B7D] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Send or copy tenant invitation code"
                          >
                            <Share2 size={11} /> Invite ({inviteCode})
                          </button>
                          <Link
                            href={`/properties/rent-roll?tab=invoices`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Invoices →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LEASING BROKER PARTNERSHIPS & COMMISSION AGREEMENTS LIST */}
      <div className="premium-card p-5 sm:p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Handshake size={18} className="text-purple-600" />
            Leasing Broker Partnerships & Commission Agreements
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">
            {partnerships.length} Active Listings Contracts
          </span>
        </div>

        {partnerships.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 text-center flex flex-col items-center justify-center gap-2">
            <Handshake size={20} className="text-purple-400" />
            <p className="text-xs font-semibold text-gray-600">No Broker Partnerships Yet</p>
            <p className="text-[11px] text-gray-400 max-w-sm">
              Assign a licensed commercial broker to market your vacant floors and earn standardized leasing commissions.
            </p>
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              + Assign Broker Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4">Contract ID</th>
                  <th className="py-4">Property Address</th>
                  <th className="py-4">Assigned Broker</th>
                  <th className="py-4">Brokerage Commission Terms</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Agreement Date</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 text-xs hover:bg-purple-50/20 transition-colors">
                    <td className="py-4 font-mono font-bold text-purple-600">{p.id}</td>
                    <td className="py-4 font-bold text-gray-900">{p.propertyName}</td>
                    <td className="py-4 font-bold text-gray-800">{p.brokerName}</td>
                    <td className="py-4 text-emerald-600 font-extrabold">{p.commission}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        p.status.includes("Active")
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border border-amber-200 text-amber-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400 font-semibold">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BLOCK 2: TWO-COLUMN ALERTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Critical Alerts */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-red-500" />
            Critical Compliance & Collections Alerts
          </h3>
          <div className="flex flex-col gap-4">
            {initialCerts.filter(c => c.status === "expired").map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expired</div>
                  <div className="text-gray-500 font-semibold mt-1">Property: {initialProperties.find(p => p.id === cert.propertyId)?.name || "Apex Tower"}</div>
                </div>
                <Link href="/properties/compliance" className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[10px] uppercase shadow-sm hover:bg-red-700 transition-colors">
                  Renew Certificate
                </Link>
              </div>
            ))}
            
            {initialCerts.filter(c => c.status === "valid" && c.name.includes("Electrical")).map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expiring Soon</div>
                  <div className="text-gray-500 font-semibold mt-1">Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</div>
                </div>
                <span className="text-amber-600 font-extrabold">38 Days Left</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Timeline */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ClipboardList size={18} className="text-purple-600" />
            Security & Audit Activity Logs
          </h3>
          <div className="flex flex-col gap-5 relative border-l border-gray-100 pl-6 ml-3">
            {initialLogs.slice(0, 4).map((log, idx) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white"></span>
                <div className="flex justify-between items-center text-gray-400 font-semibold">
                  <span>{new Date(log.createdAt || "").toLocaleDateString()}</span>
                  <span>{log.traceId}</span>
                </div>
                <p className="font-bold text-gray-800 mt-1">{log.action}</p>
                <div className="text-[10px] text-gray-500 font-bold mt-0.5">IP: {log.ipAddress} | Module: {log.module}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ===== ASSIGN LEASING BROKER MODAL ===== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateAssignment}
            className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Lease Commissions Brokerage</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Assign Leasing Broker</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Listed Property</label>
                <select 
                  value={assignPropertyId}
                  onChange={(e) => setAssignPropertyId(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                >
                  {initialProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Verified Broker partner</label>
                <select 
                  value={assignBroker}
                  onChange={(e) => setAssignBroker(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                >
                  {brokerDirectory.map((b, i) => (
                    <option key={i} value={`${b.name} (${b.role})`}>
                      {b.name} - {b.role} (Rating: {b.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Commission Model</label>
                  <select 
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="1 Month Rent">1 Month Rent Value</option>
                    <option value="2.0% Sale Value">2.0% Total Contract</option>
                    <option value="5.0% Lease Value">5.0% Annual Value</option>
                    <option value="Flat Fee ₹1L">Flat Fee ₹1,00,000</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Commission Rate</label>
                  <input 
                    type="text" 
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                Assigning a broker binds this specific listing to the broker directory, attaching their contact cards to public search views.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send size={13} /> Send Assignment Proposal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Property Listing?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.name}"</span>? This will permanently remove this commercial building from your portfolio and public marketplace maps.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Add Tenant & Active Lease Modal */}
      <AddTenantModal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        onSuccess={() => {
          showToast("🎉 Tenant & active lease registered successfully!");
          loadLeasesAndDashboard();
        }}
        properties={displayedProperties}
      />
      {/* Tenant Invitation Modal */}
      {inviteModalProp && (
        <TenantInviteModal
          isOpen={Boolean(inviteModalProp)}
          onClose={() => setInviteModalProp(null)}
          property={inviteModalProp}
        />
      )}

    </div>
  );
}
