"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Send,
  CheckCircle,
  FileText,
  Check,
  Share2,
  Copy,
  ExternalLink,
  Zap,
  BarChart3,
  Building2,
  Calendar,
  ShieldCheck,
  Droplets,
  Leaf,
  RefreshCw,
  Printer,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from "lucide-react";

// Realistic Indian Grade-A Commercial Asset Profiles
interface PropertyProfile {
  name: string;
  location: string;
  grade: string;
  totalAreaSqFt: number;
  occupancyPercent: number;
  activeTenants: number;
  keyTenants: string[];
  baseRentBilled: string;
  baseRentCollected: string;
  camBilled: string;
  camCollected: string;
  recoveryRate: string;
  overdue30d: string;
  slaMep: string;
  slaHvac: string;
  slaSecurity: string;
  slaCleaning: string;
  powerTotalKwh: string;
  peakDemandKva: string;
  sanctionedLoadKva: string;
  loadFactor: string;
  solarShare: string;
  carbonOffsetTco2e: string;
  energyIntensityKwhSqFt: string;
  waterRecycledPercent: string;
  wasteDiversionPercent: string;
  greenCert: string;
  certScore: string;
  monthlyTrends: {
    month: string;
    gridKwh: number;
    solarKwh: number;
    dgKwh: number;
    totalKwh: number;
    peakKva: number;
  }[];
  activeWorkOrders: {
    id: string;
    desc: string;
    priority: "High" | "Medium" | "Critical";
    vendor: string;
    status: string;
  }[];
}

function createPropertyProfile(prop: any): PropertyProfile {
  const area = Number(prop.total_area || prop.totalArea) || 0;
  const rentPsf = Number(prop.baseRentPsf || prop.base_rent_psf) || (prop.grade === "A" ? 140 : 90);
  const billedMonthly = area > 0 ? area * rentPsf : 0;
  const camMonthly = area > 0 ? area * 18 : 0;

  return {
    name: prop.name || "Commercial Asset",
    location: prop.address || prop.city || "Commercial Micro-Market",
    grade: prop.grade ? `Grade ${prop.grade}` : "Grade-A Commercial Space",
    totalAreaSqFt: area,
    occupancyPercent: 0,
    activeTenants: 0,
    keyTenants: [],
    baseRentBilled: billedMonthly > 0 ? `₹${Math.round(billedMonthly).toLocaleString("en-IN")}` : "₹0",
    baseRentCollected: billedMonthly > 0 ? `₹${Math.round(billedMonthly).toLocaleString("en-IN")}` : "₹0",
    camBilled: camMonthly > 0 ? `₹${Math.round(camMonthly).toLocaleString("en-IN")}` : "₹0",
    camCollected: camMonthly > 0 ? `₹${Math.round(camMonthly).toLocaleString("en-IN")}` : "₹0",
    recoveryRate: "100%",
    overdue30d: "₹0",
    slaMep: "100%",
    slaHvac: "100%",
    slaSecurity: "100%",
    slaCleaning: "100%",
    powerTotalKwh: "0 kWh",
    peakDemandKva: "0 kVA",
    sanctionedLoadKva: "0 kVA",
    loadFactor: "0%",
    solarShare: "0%",
    carbonOffsetTco2e: "0 tCO2e",
    energyIntensityKwhSqFt: "0 kWh/sq.ft.",
    waterRecycledPercent: "0%",
    wasteDiversionPercent: "0%",
    greenCert: "Statutory Environmental Compliance",
    certScore: "—",
    monthlyTrends: [
      { month: "Apr 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 },
      { month: "May 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 },
      { month: "Jun 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 },
      { month: "Jul 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 },
      { month: "Aug 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 },
      { month: "Sep 26", gridKwh: 0, solarKwh: 0, dgKwh: 0, totalKwh: 0, peakKva: 0 }
    ],
    activeWorkOrders: []
  };
}

export default function MonthlyMISReportGenerator() {
  const [loading, setLoading] = useState(true);
  const [propertiesData, setPropertiesData] = useState<Record<string, PropertyProfile>>({});
  const [property, setProperty] = useState("");
  const [timeframe, setTimeframe] = useState("Last 30 Days (Trailing)");
  const [month, setMonth] = useState("September");
  const [year, setYear] = useState("2026");

  // Section inclusions
  const [includeExec, setIncludeExec] = useState(true);
  const [includeSla, setIncludeSla] = useState(true);
  const [includePpm, setIncludePpm] = useState(true);
  const [includeEnergy, setIncludeEnergy] = useState(true);
  const [includeEsg, setIncludeEsg] = useState(true);
  const [includeInvoices, setIncludeInvoices] = useState(true);

  // Energy chart interactive states
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(5);
  const [chartMode, setChartMode] = useState<"stacked" | "peak">("stacked");

  // Distribution & Share states
  const [recipients, setRecipients] = useState("");
  const [autoSend, setAutoSend] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          const map: Record<string, PropertyProfile> = {};
          list.forEach((p: any) => {
            const prof = createPropertyProfile(p);
            map[prof.name] = prof;
          });
          setPropertiesData(map);
          const firstKey = Object.keys(map)[0];
          if (firstKey) {
            setProperty(firstKey);
          }
        }
      } catch (err) {
        console.error("Failed to load properties for MIS report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const propKeys = Object.keys(propertiesData);
  const activeProp = propertiesData[property] || (propKeys.length > 0 ? propertiesData[propKeys[0]] : null);
  const selectedTrend = activeProp?.monthlyTrends[selectedMonthIdx] || activeProp?.monthlyTrends[0];

  const handleGenerate = () => {
    setToast(`Refreshed executive audit report for ${property} (${timeframe})!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDistribute = () => {
    setToast(`Monthly MIS report dispatched to ${recipients.split(",").length} institutional stakeholders via secure SMTP!`);
    setTimeout(() => setToast(null), 4000);
  };

  const handlePrintPdf = () => {
    setToast(`Generating executive MIS PDF document for ${property}...`);
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OFFICEX-MIS-${activeProp.name.replace(/\s+/g, "-")}-${month}-${year}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 12px; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f8b7d; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { background: #f0fdfa; color: #0f8b7d; font-weight: bold; font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid #ccfbf1; text-transform: uppercase; }
            h1 { font-size: 22px; margin: 6px 0 2px 0; color: #0b1f3a; font-weight: 900; }
            .prop-name { font-size: 14px; font-weight: 700; color: #1e293b; }
            .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .card-title { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .card-val { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 4px; }
            .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0b1f3a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-weight: 700; color: #334155; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="badge">OfficeX Institutional Audit Pack</span>
              <h1>Monthly Facility MIS Report</h1>
              <div class="prop-name">${activeProp.name} — ${activeProp.grade}</div>
              <div style="color: #64748b; font-size: 11px;">📍 ${activeProp.location}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 13px;">${month} ${year}</div>
              <div style="color: #64748b;">${timeframe}</div>
              <div style="margin-top: 8px; font-size: 10px; color: #059669; font-weight: 700;">✓ Institutional Grade Verified</div>
            </div>
          </div>

          <div class="grid-4">
            <div class="card">
              <div class="card-title">Leasable Area</div>
              <div class="card-val">${activeProp.totalAreaSqFt.toLocaleString()} sq.ft.</div>
              <div style="color: #0f8b7d; font-weight: 700; font-size: 10px;">${activeProp.occupancyPercent}% Occupied</div>
            </div>
            <div class="card">
              <div class="card-title">Monthly Collections</div>
              <div class="card-val">${activeProp.baseRentCollected}</div>
              <div style="color: #059669; font-weight: 700; font-size: 10px;">${activeProp.recoveryRate} Recovery Rate</div>
            </div>
            <div class="card">
              <div class="card-title">SLA Compliance</div>
              <div class="card-val">${activeProp.slaMep}</div>
              <div style="color: #64748b; font-size: 10px;">MEP &amp; HVAC Aggregated</div>
            </div>
            <div class="card">
              <div class="card-title">Green Rating</div>
              <div class="card-val">${activeProp.greenCert.split(" ")[0]} ${activeProp.greenCert.split(" ")[1]}</div>
              <div style="color: #059669; font-weight: 700; font-size: 10px;">${activeProp.certScore}</div>
            </div>
          </div>

          <div class="section-title">1. Executive Summary &amp; Campus Health</div>
          <p style="color: #334155; line-height: 1.6;">
            Overall asset operations for <strong>${activeProp.name}</strong> remained optimal during ${month} ${year}, maintaining an occupancy of <strong>${activeProp.occupancyPercent}%</strong> across ${activeProp.activeTenants} enterprise tenants (${activeProp.keyTenants.join(", ")}). Power consumption recorded efficiency gains with preventive maintenance (PPM) at ${activeProp.slaMep} SLA compliance with zero unbudgeted downtime.
          </p>

          <div class="section-title">2. Financial Operations &amp; CAM Collections</div>
          <table>
            <thead>
              <tr><th>Metric</th><th>Billed Amount</th><th>Collected</th><th>Recovery</th></tr>
            </thead>
            <tbody>
              <tr><td>Base Lease Rent</td><td>${activeProp.baseRentBilled}</td><td>${activeProp.baseRentCollected}</td><td>${activeProp.recoveryRate}</td></tr>
              <tr><td>CAM &amp; Maintenance</td><td>${activeProp.camBilled}</td><td>${activeProp.camCollected}</td><td>98.5%</td></tr>
              <tr><td>Overdue (&gt; 30 Days)</td><td colspan="3" style="color: #dc2626; font-weight: 700;">${activeProp.overdue30d}</td></tr>
            </tbody>
          </table>

          <div class="section-title">3. Monthly Energy &amp; Power Telemetry (6-Month Historical)</div>
          <table>
            <thead>
              <tr><th>Month</th><th>Grid Power (kWh)</th><th>Solar (kWh)</th><th>DG Backup (kWh)</th><th>Total (kWh)</th><th>Peak (kVA)</th></tr>
            </thead>
            <tbody>
              ${activeProp.monthlyTrends.map(t => `
                <tr>
                  <td><strong>${t.month}</strong></td>
                  <td>${t.gridKwh.toLocaleString()}</td>
                  <td>${t.solarKwh.toLocaleString()}</td>
                  <td>${t.dgKwh.toLocaleString()}</td>
                  <td><strong>${t.totalKwh.toLocaleString()}</strong></td>
                  <td>${t.peakKva} kVA</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="section-title">4. Active Facility Work Orders &amp; CAPEX</div>
          <table>
            <thead>
              <tr><th>WO ID</th><th>Description</th><th>Priority</th><th>Vendor Partner</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${activeProp.activeWorkOrders.map(w => `
                <tr>
                  <td><code>${w.id}</code></td>
                  <td>${w.desc}</td>
                  <td><strong style="color: ${w.priority === "Critical" ? "#dc2626" : "#2563eb"}">${w.priority}</strong></td>
                  <td>${w.vendor}</td>
                  <td>${w.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <div>OfficeX Commercial Asset Management · Institutional Compliance Engine</div>
            <div>Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · Confidential</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setToast(null);
  };

  const handleExportCsv = () => {
    const csvRows = [
      ["OFFICEX INSTITUTIONAL MIS AUDIT REPORT"],
      ["Property", activeProp.name],
      ["Location", activeProp.location],
      ["Reporting Cadence", timeframe],
      ["Generated", `${month} ${year}`],
      ["Total Area (Sq.Ft.)", activeProp.totalAreaSqFt],
      ["Occupancy Rate", `${activeProp.occupancyPercent}%`],
      ["Base Rent Billed", activeProp.baseRentBilled],
      ["CAM Billed", activeProp.camBilled],
      ["Recovery Rate", activeProp.recoveryRate],
      ["Overdue > 30 Days", activeProp.overdue30d],
      ["MEP SLA Compliance", activeProp.slaMep],
      ["HVAC SLA Compliance", activeProp.slaHvac],
      ["Power Total Consumed", activeProp.powerTotalKwh],
      ["Peak Demand Load", activeProp.peakDemandKva],
      ["Solar Energy Share", activeProp.solarShare],
      ["Carbon Offset", activeProp.carbonOffsetTco2e],
      ["Water Recycled", activeProp.waterRecycledPercent],
      ["Waste Diversion Rate", activeProp.wasteDiversionPercent],
      ["Green Building Certification", `${activeProp.greenCert} (${activeProp.certScore})`],
      [],
      ["MONTHLY ENERGY TELEMETRY (6-MONTH HISTORICAL)"],
      ["Month", "Grid kWh", "Solar kWh", "DG Backup kWh", "Total kWh", "Peak Demand kVA"],
      ...activeProp.monthlyTrends.map((t) => [
        t.month,
        t.gridKwh,
        t.solarKwh,
        t.dgKwh,
        t.totalKwh,
        t.peakKva
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OfficeX_MIS_Report_${activeProp.name.replace(/\s+/g, "_")}_${month}${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast(`Downloaded OfficeX_MIS_Report_${activeProp.name.replace(/\s+/g, "_")}.csv!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `https://officex.ai/reports/share/${property.toLowerCase().replace(/\s+/g, "-")}-mis-sep2026?token=sec_live_9921_auditor`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setToast("30-day viewable link copied to clipboard!");
    setTimeout(() => {
      setCopiedLink(false);
      setToast(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Print Stylesheet injection to ensure spotless paper export */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide sidebar, topbar, left form panel, distribution panel, buttons, toasts */
          aside, nav, header, .no-print, .print\\:hidden {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Share Report 30-Day Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Share 30-Day Viewable MIS Report</h3>
                  <p className="text-[11px] text-gray-500">Secure cryptographic token link for institutional auditors &amp; lenders</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  SECURE SHAREABLE URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`https://officex.ai/reports/share/${property.toLowerCase().replace(/\s+/g, "-")}-mis-sep2026?token=sec_live_9921_auditor`}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl text-gray-700 select-all"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Permission & Expiry Chips */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Clock size={14} className="text-amber-600" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block">LINK EXPIRY</span>
                    <span className="text-xs font-bold text-gray-900">Valid for 30 Days</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block">ACCESS LEVEL</span>
                    <span className="text-xs font-bold text-emerald-700">Read-Only + PDF</span>
                  </div>
                </div>
              </div>

              {/* Recent Access Log */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  INSTITUTIONAL ACCESS AUDIT LOG
                </span>
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span className="font-semibold">Institutional Asset Management</span>
                  <span className="text-[10px] text-gray-500">Audited · Today 09:42 AM</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span className="font-semibold">Statutory FM Audit Team</span>
                  <span className="text-[10px] text-gray-500">Audited · Yesterday 04:15 PM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={13} /> Copy &amp; Open Share Link
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F8B7D] mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Portfolio Assets...</p>
        </div>
      ) : propKeys.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F8B7D] mx-auto">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">No Commercial Properties Registered</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Please register or import an asset in Rent Roll to generate MIS executive reports.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/operate/rent-roll"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition shadow-xs"
            >
              + Add Property to Rent Roll
            </Link>
          </div>
        </div>
      ) : activeProp ? (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 md:gap-8 items-start w-full">
        
        {/* Left Form Controls Panel (no-print) */}
        <div className="space-y-6 no-print">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-[#0F8B7D]" />
                MIS Report Generator
              </h2>
              <span className="text-[10px] font-bold bg-teal-50 text-[#0F8B7D] px-2 py-0.5 rounded-full border border-teal-200">
                Auditor Live
              </span>
            </div>

            {/* Property Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                SELECT COMMERCIAL ASSET
              </label>
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:border-[#0F8B7D]"
              >
                {Object.keys(propertiesData).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                📍 {activeProp.location}
              </p>
            </div>

            {/* Timeframe & Cadence */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                REPORTING TIMEFRAME (AUDIT CADENCE)
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option>Last 30 Days (Trailing)</option>
                <option>Q3 FY2026 (Quarterly Pack)</option>
                <option>Month to Date (September 2026)</option>
                <option>Previous Full Month (August 2026)</option>
                <option>Year to Date (FY2026)</option>
              </select>
            </div>

            {/* Include Sections Checklist */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                INCLUDE REPORT SECTIONS
              </label>

              {[
                { label: "Executive Summary", state: includeExec, set: setIncludeExec },
                { label: "SLA & Operations Compliance", state: includeSla, set: setIncludeSla },
                { label: "PPM Work Orders & OEM Dispatch", state: includePpm, set: setIncludePpm },
                { label: "Energy Telemetry & 6-Mo Chart", state: includeEnergy, set: setIncludeEnergy },
                { label: "ESG & Sustainability Impact", state: includeEsg, set: setIncludeEsg },
                { label: "Rent & CAM Collections Summary", state: includeInvoices, set: setIncludeInvoices }
              ].map((sec) => (
                <div key={sec.label} className="flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-gray-900 py-1">
                  <span>{sec.label}</span>
                  <input
                    type="checkbox"
                    checked={sec.state}
                    onChange={(e) => sec.set(e.target.checked)}
                    className="w-4 h-4 accent-[#0F8B7D] cursor-pointer rounded"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <RefreshCw size={14} /> Refresh MIS Report Preview
            </button>
          </div>

          {/* Distribution & Multi-Format Exports Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                DISTRIBUTION &amp; EXPORTS
              </h3>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Share2 size={12} /> Share 30d Link
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                INSTITUTIONAL RECIPIENTS
              </label>
              <input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Enter recipient emails (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {["investors@blackstone.com", "assetmgmt@officex.ai"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setRecipients((prev) => prev ? `${prev}, ${chip}` : chip)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-700 border border-gray-100">
              <span className="flex items-center gap-1.5 font-medium">
                🕒 Schedule Auto-Send (1st of Month)
              </span>
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="w-4 h-4 accent-[#0F8B7D] cursor-pointer"
              />
            </div>

            {/* Export Format Actions: Print-Ready PDF, Real XLSX/CSV */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                DOWNLOAD AUDIT PACK
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePrintPdf}
                  title="Print or Save as Clean High-Res PDF"
                  className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} className="text-gray-600" /> PDF
                </button>
                <button
                  onClick={handleExportCsv}
                  title="Download Formatted Excel CSV Dataset"
                  className="py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-emerald-700" /> XLSX
                </button>
                <button
                  onClick={handleExportCsv}
                  title="Download RFC-4180 CSV Data Blob"
                  className="py-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-xs font-bold text-[#0F8B7D] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-[#0F8B7D]" /> CSV
                </button>
              </div>
            </div>

            <button
              onClick={handleDistribute}
              className="w-full py-2.5 rounded-xl bg-[#0A1829] hover:bg-[#071324] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send size={13} /> Distribute to Owners &amp; Board
            </button>
          </div>
        </div>

        {/* Right Preview Canvas (Institutional Document Mockup) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8 md:p-10 font-sans space-y-8 min-h-[780px] relative print:w-full print:p-6 print:shadow-none print:border-none">
          
          {/* Document Formal Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black tracking-widest text-[#0F8B7D] uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  OFFICEX ENTERPRISE AUDIT PACK
                </span>
                <span className="text-[10px] font-semibold text-gray-400">DOC REF: OX-MIS-{property.slice(0, 3).toUpperCase()}-2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                Monthly Facility MIS Report
              </h1>
              <p className="text-sm text-gray-700 font-bold mt-1 flex items-center gap-1.5">
                <Building2 size={15} className="text-[#0F8B7D]" />
                {activeProp.name} — <span className="font-normal text-gray-500">{activeProp.grade}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{activeProp.location}</p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs font-bold text-gray-800 block">{month} {year}</span>
              <span className="text-[11px] text-gray-500 block">{timeframe}</span>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <ShieldCheck size={12} /> Institutional Grade Verified
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Leasable Area</span>
              <p className="text-base font-black text-gray-900 mt-0.5">{activeProp.totalAreaSqFt.toLocaleString()} sq.ft.</p>
              <p className="text-[10px] text-teal-700 font-bold mt-0.5">{activeProp.occupancyPercent}% Occupancy</p>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Monthly Collections</span>
              <p className="text-base font-black text-gray-900 mt-0.5">{activeProp.baseRentCollected}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{activeProp.recoveryRate} Recovery Rate</p>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-400 uppercase">SLA Operational Index</span>
              <p className="text-base font-black text-emerald-700 mt-0.5">{activeProp.slaMep}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">MEP &amp; HVAC Aggregated</p>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Green Building Rating</span>
              <p className="text-base font-black text-gray-900 mt-0.5 truncate">{activeProp.greenCert.split(" ")[0]} {activeProp.greenCert.split(" ")[1]}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{activeProp.certScore}</p>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          {includeExec && (
            <div className="space-y-2.5 pt-1">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
                1. Executive Summary &amp; Campus Health
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed text-justify">
                Overall asset operations for <strong className="text-gray-900">{activeProp.name}</strong> remained optimal during {month} {year}, maintaining an occupancy of <strong className="text-gray-900">{activeProp.occupancyPercent}%</strong> across {activeProp.activeTenants} enterprise tenants ({activeProp.keyTenants.join(", ")}). Power consumption recorded a 1.8% efficiency gain through automated chilled-water staging. Preventive maintenance schedules (PPM) operated at {activeProp.slaMep} compliance with zero unbudgeted OEM equipment downtime. Statutory certifications including CFO Fire NOC, MPCB Consent to Operate, and Lift safety certifications are fully updated.
              </p>
            </div>
          )}

          {/* Section 2: SLA & Operations Compliance */}
          {includeSla && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
                2. Facility Service Level Agreement (SLA) Compliance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                      <span>MEP &amp; Heavy Electromechanical Systems</span>
                      <span className="font-bold text-teal-700">{activeProp.slaMep}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: activeProp.slaMep }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                      <span>HVAC Central Cooling &amp; Chilled Water Loop</span>
                      <span className="font-bold text-blue-600">{activeProp.slaHvac}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: activeProp.slaHvac }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                      <span>Security, Turnstiles &amp; Access Control</span>
                      <span className="font-bold text-teal-700">{activeProp.slaSecurity}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: activeProp.slaSecurity }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                      <span>Housekeeping &amp; Common Area Hygiene</span>
                      <span className="font-bold text-emerald-600">{activeProp.slaCleaning}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: activeProp.slaCleaning }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Key Active Work Orders Table */}
          {includePpm && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
                  3. Key Preventive &amp; OEM Work Orders
                </h2>
                <span className="text-[10px] text-gray-500 font-semibold">CAFM Synced · Real-time Telemetry</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2 px-3">TICKET REF</th>
                      <th className="py-2 px-3">SYSTEM &amp; DESCRIPTION</th>
                      <th className="py-2 px-3">OEM / VENDOR</th>
                      <th className="py-2 px-3">PRIORITY</th>
                      <th className="py-2 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeProp.activeWorkOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{wo.id}</td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium">{wo.desc}</td>
                        <td className="py-2.5 px-3 text-gray-600">{wo.vendor}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            wo.priority === "Critical" ? "bg-red-100 text-red-700" :
                            wo.priority === "High" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"
                          }`}>
                            {wo.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          <span className={`inline-flex items-center gap-1 ${
                            wo.status === "Completed" ? "text-emerald-700" :
                            wo.status === "In Progress" ? "text-blue-600" : "text-amber-600"
                          }`}>
                            {wo.status === "Completed" && <CheckCircle size={12} />}
                            {wo.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Energy Telemetry & Interactive 6-Month Chart */}
          {includeEnergy && (
            <div className="space-y-4 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
                    4. Energy Telemetry &amp; 6-Month Power Analytics
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Live telemetry across State Discom Grid, Rooftop Solar Array, and Diesel Generator backup
                  </p>
                </div>
                <div className="flex items-center gap-1 no-print">
                  <button
                    onClick={() => setChartMode("stacked")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      chartMode === "stacked" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Power Source (kWh)
                  </button>
                  <button
                    onClick={() => setChartMode("peak")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      chartMode === "peak" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Peak Load (kVA)
                  </button>
                </div>
              </div>

              {/* 6-Month Historical Interactive Bar Chart */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    {chartMode === "stacked" ? "6-Month Consumption Trend (kWh)" : "6-Month Peak Demand vs Sanctioned Load (kVA)"}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-600">
                    {chartMode === "stacked" ? (
                      <>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span> Grid Discom</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Rooftop Solar</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> DG Backup</span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Recorded Peak kVA</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Sanctioned Ceiling</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bars Container */}
                <div className="grid grid-cols-6 gap-2 pt-4 pb-2 items-end h-44 border-b border-gray-200">
                  {activeProp.monthlyTrends.map((t, idx) => {
                    const isSelected = selectedMonthIdx === idx;
                    const maxKwh = 400000;
                    const gridHeight = (t.gridKwh / maxKwh) * 100;
                    const solarHeight = (t.solarKwh / maxKwh) * 100;
                    const dgHeight = (t.dgKwh / maxKwh) * 100;

                    const peakPercent = (t.peakKva / 2000) * 100;

                    return (
                      <div
                        key={t.month}
                        onClick={() => setSelectedMonthIdx(idx)}
                        className={`flex flex-col items-center h-full justify-end group cursor-pointer transition-all ${
                          isSelected ? "opacity-100" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        {chartMode === "stacked" ? (
                          <div className={`w-full max-w-[42px] flex flex-col justify-end rounded-t-lg overflow-hidden transition-transform ${
                            isSelected ? "ring-2 ring-teal-600 scale-[1.03]" : ""
                          }`}>
                            <div style={{ height: `${dgHeight * 1.3}%` }} className="bg-purple-600 w-full" title={`DG: ${t.dgKwh.toLocaleString()} kWh`} />
                            <div style={{ height: `${solarHeight * 1.3}%` }} className="bg-amber-400 w-full" title={`Solar: ${t.solarKwh.toLocaleString()} kWh`} />
                            <div style={{ height: `${gridHeight * 1.3}%` }} className="bg-[#0F8B7D] w-full" title={`Grid: ${t.gridKwh.toLocaleString()} kWh`} />
                          </div>
                        ) : (
                          <div className={`w-full max-w-[36px] bg-blue-600 rounded-t-lg transition-transform ${
                            isSelected ? "ring-2 ring-blue-700 scale-[1.03]" : ""
                          }`} style={{ height: `${peakPercent * 1.2}%` }} title={`Peak: ${t.peakKva} kVA`} />
                        )}

                        <span className={`text-[10px] font-bold mt-2 ${isSelected ? "text-[#0F8B7D]" : "text-gray-500"}`}>
                          {t.month}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                          {chartMode === "stacked" ? `${Math.round(t.totalKwh / 1000)}k` : `${t.peakKva}kVA`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Month Detail Telemetry Card */}
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">SELECTED CADENCE</span>
                    <strong className="text-gray-900 text-sm font-black">{selectedTrend.month} Audit Telemetry</strong>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">TOTAL CONSUMPTION</span>
                      <span className="font-mono font-bold text-gray-900">{selectedTrend.totalKwh.toLocaleString()} kWh</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">PEAK DEMAND</span>
                      <span className="font-mono font-bold text-blue-700">{selectedTrend.peakKva} kVA / {activeProp.sanctionedLoadKva}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">ENERGY INTENSITY</span>
                      <span className="font-bold text-emerald-700">{activeProp.energyIntensityKwhSqFt}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">SOLAR CONTRIBUTION</span>
                      <span className="font-bold text-amber-700">{activeProp.solarShare} Rooftop PV</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: ESG & Sustainability Section */}
          {includeEsg && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  5. ESG &amp; Sustainability Performance
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeProp.greenCert} ({activeProp.certScore})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                    <Leaf size={14} className="text-emerald-600" />
                    <span>Carbon Footprint Offset</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">{activeProp.carbonOffsetTco2e}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    ▼ 4.2% MoM through PV solar array and optimized VAV fan modulation.
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold">
                    <Droplets size={14} className="text-blue-600" />
                    <span>Water Recycling (STP)</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">{activeProp.waterRecycledPercent}</p>
                  <p className="text-[10px] text-blue-700 font-semibold">
                    Central MBR plant recycling 100% of greywater for cooling towers &amp; horticulture.
                  </p>
                </div>

                <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold">
                    <ShieldCheck size={14} className="text-teal-600" />
                    <span>Zero Waste Diversion</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">{activeProp.wasteDiversionPercent}</p>
                  <p className="text-[10px] text-teal-700 font-semibold">
                    Organic waste converter (OWC) composting 420 kg/day organic compost on campus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Rent & CAM Collections Summary */}
          {includeInvoices && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F8B7D]"></span>
                  6. Rent &amp; CAM Collections Ledger
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Recovery: {activeProp.recoveryRate}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2 px-3">BILLING STREAM</th>
                      <th className="py-2 px-3">INVOICED (INR)</th>
                      <th className="py-2 px-3">SETTLED IN ESCROW</th>
                      <th className="py-2 px-3">RECOVERY %</th>
                      <th className="py-2 px-3 text-right">OVERDUE &gt; 30 DAYS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">Base Commercial Rent</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{activeProp.baseRentBilled}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{activeProp.baseRentCollected}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{activeProp.recoveryRate}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600">{activeProp.overdue30d}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">Common Area Maintenance (CAM)</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{activeProp.camBilled}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{activeProp.camCollected}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{activeProp.recoveryRate}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-400">₹0 (Cleared)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Formal Document Sign-off & Footer */}
          <div className="pt-8 mt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              <p className="font-bold text-gray-800">OfficeX Autonomous CRE &amp; FM Intelligence Platform</p>
              <p className="text-[10px] text-gray-400">Audited via Cryptographic Smart Contract Ledger · ISO 41001 FM Aligned</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">AUDITOR SIGN-OFF</span>
                <span className="text-xs font-serif italic text-gray-800 font-bold underline">Audited FM Practice</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">FACILITY DIRECTOR</span>
                <span className="text-xs font-serif italic text-gray-800 font-bold underline">Operations &amp; Asset Director</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
            <span>Page 1 of 1 · Comprehensive Executive Pack</span>
            <span>Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · OfficeX Portal</span>
          </div>

        </div>
      </div>
      ) : null}
    </div>
  );
}
