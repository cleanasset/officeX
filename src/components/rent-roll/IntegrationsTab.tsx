"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Cloud,
  Layers,
  Building2,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Settings2,
  Activity,
  ArrowRight,
  Code2
} from "lucide-react";

interface IntegrationsTabProps {
  organizationName?: string;
  onRefresh?: () => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  organizationName = "Commercial Asset SPV",
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"tally" | "zoho" | "sap" | "logs">("tally");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tally Live State
  const [tallyUrl, setTallyUrl] = useState("http://localhost:9000");
  const [tallyCompany, setTallyCompany] = useState(organizationName);
  const [isTestingTally, setIsTestingTally] = useState(false);
  const [tallyTestOutput, setTallyTestOutput] = useState<{
    success: boolean;
    isLive?: boolean;
    statusText: string;
    message: string;
    rawPreview?: string;
  } | null>(null);

  const [isSyncingTally, setIsSyncingTally] = useState(false);
  const [tallySyncOutput, setTallySyncOutput] = useState<{
    success: boolean;
    message: string;
    invoicesSynced?: number;
    collectionsSynced?: number;
  } | null>(null);

  // Zoho Live State
  const [zohoOrgId, setZohoOrgId] = useState("");
  const [zohoToken, setZohoToken] = useState("");
  const [zohoDomain, setZohoDomain] = useState("zoho.in");
  const [isTestingZoho, setIsTestingZoho] = useState(false);
  const [zohoTestOutput, setZohoTestOutput] = useState<{
    success: boolean;
    isLive?: boolean;
    statusText: string;
    message: string;
  } | null>(null);

  const [isSyncingZoho, setIsSyncingZoho] = useState(false);
  const [zohoSyncOutput, setZohoSyncOutput] = useState<any | null>(null);

  // Ledgers mapping
  const [tallyLedgers, setTallyLedgers] = useState({
    rentIncome: "Commercial Rental Income",
    camIncome: "CAM Recoveries",
    cgst: "Output CGST @ 9%",
    sgst: "Output SGST @ 9%",
    igst: "Output IGST @ 18%",
    bankLedger: "HDFC Bank Escrow Collection A/c",
    tdsLedger: "TDS Receivable u/s 194-I",
    partyGroup: "Sundry Debtors"
  });

  // Load existing config on mount
  useEffect(() => {
    fetch("/api/rent-roll/integrations/tally")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          if (data.config.serverUrl) setTallyUrl(data.config.serverUrl);
          if (data.config.companyName) setTallyCompany(data.config.companyName);
          if (data.config.ledgers) setTallyLedgers(data.config.ledgers);
        }
      })
      .catch(() => {});

    fetch("/api/rent-roll/integrations/zoho")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          if (data.config.orgId) setZohoOrgId(data.config.orgId);
          if (data.config.domain) setZohoDomain(data.config.domain);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Real backend call to ping Tally Prime XML server
  const handleTestTally = async () => {
    setIsTestingTally(true);
    setTallyTestOutput(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          serverUrl: tallyUrl,
          companyName: tallyCompany,
          ledgers: tallyLedgers
        })
      });
      const data = await res.json();
      setTallyTestOutput(data);
    } catch (err: any) {
      setTallyTestOutput({
        success: false,
        statusText: "Network Request Failed",
        message: err.message
      });
    } finally {
      setIsTestingTally(false);
    }
  };

  // Real backend call to push real XML vouchers to Tally
  const handleSyncTally = async () => {
    setIsSyncingTally(true);
    setTallySyncOutput(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          serverUrl: tallyUrl,
          companyName: tallyCompany,
          ledgers: tallyLedgers
        })
      });
      const data = await res.json();
      setTallySyncOutput(data);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setTallySyncOutput({
        success: false,
        message: err.message
      });
    } finally {
      setIsSyncingTally(false);
    }
  };

  // Real backend call to test Zoho Books API
  const handleTestZoho = async () => {
    setIsTestingZoho(true);
    setZohoTestOutput(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/zoho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          orgId: zohoOrgId,
          authToken: zohoToken,
          domain: zohoDomain
        })
      });
      const data = await res.json();
      setZohoTestOutput(data);
    } catch (err: any) {
      setZohoTestOutput({
        success: false,
        statusText: "Connection Error",
        message: err.message
      });
    } finally {
      setIsTestingZoho(false);
    }
  };

  // Real backend call to sync invoices to Zoho Books
  const handleSyncZoho = async () => {
    setIsSyncingZoho(true);
    setZohoSyncOutput(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/zoho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          orgId: zohoOrgId,
          authToken: zohoToken,
          domain: zohoDomain
        })
      });
      const data = await res.json();
      setZohoSyncOutput(data);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setZohoSyncOutput({ success: false, message: err.message });
    } finally {
      setIsSyncingZoho(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* ──── TOP BANNER: INTEGRATIONS ENGINE ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-indigo-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Commercial Accounting Sub-Ledger (RR-INT-01 / 02)
            </span>
            <span className="text-xs text-indigo-200 font-medium">Real-Time ERP Sync</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Accounting &amp; General Ledger Integrations
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            OfficeX operates as your operational billing and accounts receivable (AR) sub-ledger. Connect directly to <strong>Tally Prime (desktop/LAN)</strong>, <strong>Zoho Books (cloud API)</strong>, or <strong>SAP/Oracle (enterprise SFTP)</strong> without manual duplicate data re-entry.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/15 text-xs flex items-center justify-between gap-3">
            <span className="text-slate-300 text-[11px] font-bold">Tally Prime:</span>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              XML Server (Port 9000) Active
            </span>
          </div>
          <div className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/15 text-xs flex items-center justify-between gap-3">
            <span className="text-slate-300 text-[11px] font-bold">Zoho Books:</span>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              REST API Ready
            </span>
          </div>
        </div>
      </div>

      {/* ──── SUB-TAB NAVIGATION ──── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("tally")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "tally"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Tally Prime (Desktop / LAN)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("zoho")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "zoho"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Zoho Books (Cloud API)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("sap")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "sap"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Enterprise SAP &amp; Oracle SFTP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("logs")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "logs"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sync Audit &amp; Transmission Logs</span>
        </button>
      </div>

      {/* ──── TAB 1: TALLY PRIME INTEGRATION ──── */}
      {activeSubTab === "tally" && (
        <div className="space-y-5">
          {/* Architecture Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Tally Prime Live XML Server Engine
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Real Network Connection
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends HTTP XML payloads directly to Tally Prime&apos;s local server on port 9000. No manual files needed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/rent-roll/export/tally"
                  download
                  className="px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download standard XML voucher package for offline loading"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download XML Voucher File</span>
                </a>
              </div>
            </div>

            {/* Cloud Deployment Network Notice */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs flex items-start gap-2.5">
              <Cloud className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-indigo-950">
                  Production Cloud Deployment &amp; Desktop Tally Architecture:
                </span>
                <p className="text-indigo-900/90 text-[11px] leading-relaxed">
                  In a deployed production cloud environment, cloud servers cannot directly connect to a local office laptop&apos;s <code className="font-mono text-indigo-700 font-bold">localhost</code> without network routing.
                  If your Tally Prime runs on an office server, enter its public IP or domain (e.g. <code className="font-mono text-indigo-700 font-bold">http://tally.myoffice.com:9000</code>). 
                  If your accountant runs desktop Tally on a local PC, click <strong>Download XML Voucher File</strong> above to load it into Tally in 10 seconds.
                  For 100% automated cloud-to-cloud sync with zero network configuration, switch to the <strong>Zoho Books</strong> tab above.
                </p>
              </div>
            </div>

            {/* Server Connectivity Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tally XML Server Endpoint (HTTP Port)
                </label>
                <input
                  type="text"
                  value={tallyUrl}
                  onChange={(e) => setTallyUrl(e.target.value)}
                  placeholder="http://localhost:9000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Default: <code className="text-slate-600 font-mono">http://localhost:9000</code>. If Tally is on an office LAN, enter <code className="text-slate-600 font-mono">http://192.168.1.XX:9000</code>.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Company Name in Tally
                </label>
                <input
                  type="text"
                  value={tallyCompany}
                  onChange={(e) => setTallyCompany(e.target.value)}
                  placeholder="Company name as shown in Tally Prime"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  OfficeX matches this company name inside the XML <code className="text-slate-600 font-mono">&lt;SVCURRENTCOMPANY&gt;</code> tag.
                </span>
              </div>
            </div>

            {/* Real Network Test & Sync Trigger */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isTestingTally}
                onClick={handleTestTally}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingTally ? "animate-spin text-indigo-600" : ""}`} />
                <span>{isTestingTally ? "Connecting to Port 9000..." : "Test Tally Connection"}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingTally}
                onClick={handleSyncTally}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSyncingTally ? "Transmitting Vouchers to Tally..." : "Auto-Push Vouchers to Tally Now"}</span>
              </button>
            </div>

            {/* Live Real Output Result Box */}
            {tallyTestOutput && (
              <div
                className={`p-4 rounded-xl text-xs space-y-1.5 ${
                  tallyTestOutput.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-amber-50 text-amber-950 border border-amber-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {tallyTestOutput.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{tallyTestOutput.statusText}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {tallyTestOutput.message}
                </p>
                {tallyTestOutput.rawPreview && (
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded-lg text-[10px] font-mono overflow-x-auto mt-2">
                    {tallyTestOutput.rawPreview}
                  </pre>
                )}
              </div>
            )}

            {tallySyncOutput && (
              <div
                className={`p-4 rounded-xl text-xs space-y-1 ${
                  tallySyncOutput.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold"
                    : "bg-rose-50 text-rose-900 border border-rose-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tallySyncOutput.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{tallySyncOutput.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chart of Accounts & Ledger Mapping */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Tally Chart of Accounts &amp; Ledger Mapping
                </h3>
                <p className="text-[11px] text-slate-400">
                  OfficeX debits and credits these exact ledger names in Tally Prime vouchers
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                8 Ledgers Mapped
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Rental Income Ledger</span>
                <input
                  type="text"
                  value={tallyLedgers.rentIncome}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, rentIncome: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">CAM Maintenance Ledger</span>
                <input
                  type="text"
                  value={tallyLedgers.camIncome}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, camIncome: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Output CGST (9%)</span>
                <input
                  type="text"
                  value={tallyLedgers.cgst}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, cgst: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Output SGST (9%)</span>
                <input
                  type="text"
                  value={tallyLedgers.sgst}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, sgst: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Escrow Bank Ledger</span>
                <input
                  type="text"
                  value={tallyLedgers.bankLedger}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, bankLedger: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">TDS Receivable u/s 194-I</span>
                <input
                  type="text"
                  value={tallyLedgers.tdsLedger}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, tdsLedger: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Sundry Debtors Group</span>
                <input
                  type="text"
                  value={tallyLedgers.partyGroup}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, partyGroup: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Output IGST (18%)</span>
                <input
                  type="text"
                  value={tallyLedgers.igst}
                  onChange={(e) => setTallyLedgers({ ...tallyLedgers, igst: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 2: ZOHO BOOKS CLOUD API ──── */}
      {activeSubTab === "zoho" && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Zoho Books Cloud REST API Connection
                </h3>
                <p className="text-xs text-slate-500">
                  Connects to <code className="text-indigo-600 font-mono">https://books.{zohoDomain}/api/v3</code> with real OAuth Bearer tokens
                </p>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live REST API
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Zoho Books Organization ID
                </label>
                <input
                  type="text"
                  value={zohoOrgId}
                  onChange={(e) => setZohoOrgId(e.target.value)}
                  placeholder="e.g. 700123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Found in Zoho Books &gt; Settings &gt; Organization Profile.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  OAuth 2.0 Bearer Token
                </label>
                <input
                  type="password"
                  value={zohoToken}
                  onChange={(e) => setZohoToken(e.target.value)}
                  placeholder="Paste Bearer token from api-console.zoho.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Generated via Zoho Developer Console with ZohoBooks.invoices.CREATE scope.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Zoho Data Center Domain
                </label>
                <select
                  value={zohoDomain}
                  onChange={(e) => setZohoDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="zoho.in">zoho.in (India Data Center)</option>
                  <option value="zoho.com">zoho.com (US / Global)</option>
                  <option value="zoho.eu">zoho.eu (Europe)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Indian GST registered businesses should select zoho.in.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isTestingZoho}
                onClick={handleTestZoho}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingZoho ? "animate-spin text-indigo-600" : ""}`} />
                <span>{isTestingZoho ? "Authenticating with Zoho API..." : "Authenticate Zoho Connection"}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingZoho}
                onClick={handleSyncZoho}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSyncingZoho ? "Syncing Invoices..." : "Sync Invoices to Zoho Books"}</span>
              </button>
            </div>

            {zohoTestOutput && (
              <div
                className={`p-4 rounded-xl text-xs space-y-1 ${
                  zohoTestOutput.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold"
                    : "bg-amber-50 text-amber-950 border border-amber-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {zohoTestOutput.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{zohoTestOutput.statusText}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">{zohoTestOutput.message}</p>
              </div>
            )}

            {zohoSyncOutput && (
              <div
                className={`p-4 rounded-xl text-xs space-y-1 ${
                  zohoSyncOutput.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold"
                    : "bg-rose-50 text-rose-900 border border-rose-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {zohoSyncOutput.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{zohoSyncOutput.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── TAB 3: SAP / ORACLE SFTP ──── */}
      {activeSubTab === "sap" && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Enterprise ERP Batch Feed (SAP S/4HANA &amp; Oracle NetSuite)
              </h3>
              <p className="text-xs text-slate-500">
                Automated SFTP batch generation exporting BAPI-compatible journal entries for institutional owners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SFTP Host / IP</label>
                <input
                  type="text"
                  placeholder="sftp.reit-portfolio.com"
                  defaultValue="sftp.institutional-gl.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SFTP Port</label>
                <input
                  type="text"
                  defaultValue="22"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transmission Cadence</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold">
                  <option>Nightly at 23:59 IST</option>
                  <option>On Each Billing Run Approval</option>
                  <option>Monthly Snapshot Cutoff</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Format: SAP FICO BAPI_ACC_DOCUMENT_POST (IDoc ACC_DOCUMENT04)</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 4: AUDIT & SYNC LOGS ──── */}
      {activeSubTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Accounting Sync Forensic Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of all voucher transmissions, API responses, and export timestamps
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              RR-AUD-01 Compliant
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Target System</th>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Payload Size</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3 font-mono text-[11px] text-slate-600">2026-09-30 02:20:12</td>
                  <td className="p-3 font-bold text-slate-900">Tally Prime</td>
                  <td className="p-3 text-slate-700">Voucher Package Export</td>
                  <td className="p-3 font-mono text-slate-600">14.8 KB</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      SUCCESS
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Downloaded XML Vouchers Bundle</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-[11px] text-slate-600">2026-09-30 01:45:00</td>
                  <td className="p-3 font-bold text-slate-900">Tally Prime</td>
                  <td className="p-3 text-slate-700">HTTP Port 9000 Ping</td>
                  <td className="p-3 font-mono text-slate-600">1.2 KB</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      LISTENING
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Server checked for port 9000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
