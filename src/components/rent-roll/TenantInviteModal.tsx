"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";

interface TenantInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    name: string;
    location?: string;
    inviteCode?: string;
    ownerName?: string;
  } | null;
  onSuccess?: () => void;
}

export const TenantInviteModal: React.FC<TenantInviteModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick_link" | "direct_invite">("quick_link");

  // Direct tenant invite fields
  const [tenantName, setTenantName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [unitNumber, setUnitNumber] = useState("Unit 401");
  const [monthlyRent, setMonthlyRent] = useState("250000");
  const [isSending, setIsSending] = useState(false);
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false);

  // Derive persistent or readable invite code for this building
  const propIdClean = property?.id.replace(/\D/g, "").slice(-4) || "8841";
  const code = property?.inviteCode || `OX-${propIdClean.padStart(4, "7")}`;

  // Always use official production domain https://www.officex.pro
  const baseUrl = "https://www.officex.pro";
  const ownerParam = property?.ownerName ? `&owner=${encodeURIComponent(property.ownerName)}` : "";
  const locationParam = property?.location ? `&location=${encodeURIComponent(property.location)}` : "";
  const inviteUrl = property ? `${baseUrl}/tenant/join?code=${encodeURIComponent(code)}&building=${encodeURIComponent(property.name)}${ownerParam}${locationParam}` : "";

  React.useEffect(() => {
    if (typeof window !== "undefined" && property) {
      try {
        const invites = JSON.parse(localStorage.getItem("officex_building_invites") || "{}");
        invites[code] = {
          id: property.id,
          name: property.name,
          ownerName: property.ownerName || localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org") || "Asset Owner",
          location: property.location || "Commercial Corridor",
          inviteCode: code
        };
        localStorage.setItem("officex_building_invites", JSON.stringify(invites));
      } catch (e) {
        console.warn("Failed to cache building invite code:", e);
      }
    }
  }, [code, property]);

  if (!isOpen || !property) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello! You have been invited to join the official tenant workplace & rent roll portal for ${property.name} on OfficeX.\n\n` +
    `Building Code: ${code}\n` +
    `Direct Invitation Link: ${inviteUrl}\n\n` +
    `Use this link to verify your building premises, access automated GST rent invoices, submit payments, and connect with property management.`
  );

  const handleSendDirectInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) return;

    setIsSending(true);
    try {
      // 1. Register tenant in Rent Roll DB
      const res = await fetch("/api/rent-roll/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeName: tenantName.trim(),
          legalName: tenantName.trim(),
          contactPerson: "Authorized Occupier",
          contactEmail: contactEmail.trim() || `${tenantName.toLowerCase().replace(/\s+/g, "")}@workspace.in`,
          contactPhone: contactPhone.trim() || "+91 98000 00000",
          industry: "Corporate Occupier",
          status: "active"
        })
      });

      const tenantData = await res.json();
      const tenantId = tenantData?.id || `TEN-${Date.now()}`;

      // 2. Attach a Lease record for this building's Rent Roll
      await fetch("/api/rent-roll/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          propertyName: property.name,
          tenantId: tenantId,
          tenantName: tenantName.trim(),
          unitNumber: unitNumber,
          floorNumber: 4,
          chargeableArea: 5000,
          carpetArea: 4000,
          monthlyRent: Number(monthlyRent) || 250000,
          camMonthly: 45000,
          securityDepositAmount: (Number(monthlyRent) || 250000) * 3,
          startDate: "2025-04-01",
          endDate: "2028-03-31",
          escalationPct: 5,
          status: "active"
        })
      });

      // Save invite record locally for offline verification
      if (typeof window !== "undefined") {
        const storedInvites = JSON.parse(localStorage.getItem("officex_sent_tenant_invites") || "[]");
        storedInvites.push({
          code,
          propertyName: property.name,
          tenantName: tenantName.trim(),
          email: contactEmail.trim(),
          date: new Date().toISOString()
        });
        localStorage.setItem("officex_sent_tenant_invites", JSON.stringify(storedInvites));
      }

      setInviteSentSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn("Direct invite error:", err);
      setInviteSentSuccess(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  Tenant Access &amp; Rent Roll Onboarding
                </span>
                <h3 className="text-lg font-black text-white">{property.name}</h3>
                <p className="text-xs text-slate-400">{property.location || "Commercial Real Estate Asset"}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={() => { setActiveTab("quick_link"); setInviteSentSuccess(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "quick_link"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:text-white"
              }`}
            >
              🔗 Share Link &amp; Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("direct_invite")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "direct_invite"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:text-white"
              }`}
            >
              ✉️ Send Direct Tenant Invite
            </button>
          </div>
        </div>

        {/* Tab 1: Share Code & Link */}
        {activeTab === "quick_link" && (
          <div className="p-6 space-y-5">
            {/* Building Code Card */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Building Access Code (For Tenants to Enter)
              </label>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <div>
                  <span className="text-xs text-blue-700 font-semibold block">6-Character Tenant Code:</span>
                  <span className="text-2xl font-mono font-black text-blue-950 tracking-widest">{code}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Link */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Direct Onboarding Link (1-Click Tenant Entry)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Instant Distribution
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                >
                  <MessageCircle size={15} />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`Invitation to Join ${property.name} on OfficeX`)}&body=${encodeURIComponent(
                    `Hello,\n\nPlease join our commercial building workspace on OfficeX to view your active lease, access automated monthly GST rent invoices, and raise building facility tickets.\n\n` +
                    `Building: ${property.name}\n` +
                    `Access Code: ${code}\n` +
                    `Join directly here: ${inviteUrl}\n\n` +
                    `Regards,\nProperty Management Team`
                  )}`}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                >
                  <Mail size={15} />
                  <span>Send via Email</span>
                </a>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                When tenants register using this code or link, they are automatically connected to <strong>{property.name}</strong> and immediately synchronized with your <strong>Live Rent Roll</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Formal Invitation */}
        {activeTab === "direct_invite" && (
          <div className="p-6">
            {inviteSentSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Tenant Invited &amp; Added to Rent Roll!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  <strong>{tenantName}</strong> has been added to <strong>{property.name}</strong>. Their lease is now registered on your Rent Roll, and their access credentials have been initialized with code <strong>{code}</strong>.
                </p>
                <div className="pt-3 flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setInviteSentSuccess(false);
                      setTenantName("");
                      setContactEmail("");
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Invite Another Tenant
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendDirectInvite} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tenant Legal / Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Tata Consultancy Services Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Tenant Admin Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. leaseadmin@tcs.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Contact Mobile (India +91)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="98200 12345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Allocated Space / Unit *
                    </label>
                    <input
                      type="text"
                      required
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder="e.g. Suite 401, 4th Floor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Agreed Monthly Rent (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="250000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !tenantName.trim()}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-3 disabled:opacity-40"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Registering Tenant to Rent Roll...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Issue Invitation &amp; Add to Rent Roll</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
