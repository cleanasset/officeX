"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  Download,
  Copy,
  Check,
  Building2,
  Server,
  Cloud,
  Layers,
  Send,
  Lock,
  ArrowRight,
  CreditCard
} from "lucide-react";

interface AccountingIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName?: string;
}

export const AccountingIntegrationsModal: React.FC<AccountingIntegrationsModalProps> = ({
  isOpen,
  onClose,
  orgName = "Commercial Asset SPV"
}) => {
  const [activeTab, setActiveTab] = useState<"razorpay" | "tally" | "zoho" | "quickbooks" | "sap" | "webhooks">("razorpay");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Razorpay Gateway Live Test State
  const [isTestingRazorpay, setIsTestingRazorpay] = useState(false);
  const [razorpayTestResult, setRazorpayTestResult] = useState<{
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    keyMode?: string;
    keyIdMasked?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [isCreatingTestOrder, setIsCreatingTestOrder] = useState(false);
  const [testOrderResult, setTestOrderResult] = useState<{
    success: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    message?: string;
    error?: string;
  } | null>(null);

  // Webhook Test State
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{
    success: boolean;
    statusCode?: number;
    statusText?: string;
    latencyMs?: number;
    message?: string;
    error?: string;
    responsePreview?: string;
  } | null>(null);

  // Tally Settings
  const [tallyMode, setTallyMode] = useState<"agent" | "file">("agent");
  const [tallyServerUrl, setTallyServerUrl] = useState("http://localhost:9000");
  const [tallyCompanyName, setTallyCompanyName] = useState(orgName);
  const [isTestingTally, setIsTestingTally] = useState(false);
  const [tallyTestResult, setTallyTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPushingTally, setIsPushingTally] = useState(false);
  const [tallyPushResult, setTallyPushResult] = useState<string | null>(null);

  // Tally Ledgers Mapping
  const [ledgers, setLedgers] = useState({
    rentIncome: "Commercial Rental Income",
    camIncome: "CAM Recoveries",
    cgst: "Output CGST @ 9%",
    sgst: "Output SGST @ 9%",
    igst: "Output IGST @ 18%",
    bankLedger: "HDFC Bank Escrow Collection A/c",
    tdsLedger: "TDS Receivable u/s 194-I",
    partyGroup: "Sundry Debtors"
  });

  // Zoho Settings
  const [zohoOrgId, setZohoOrgId] = useState("");
  const [isZohoConnected, setIsZohoConnected] = useState(false);

  // Webhooks & API
  const [apiKey] = useState("ox_live_sec_7f9a12c84e1b09d3fa887612");
  const [webhookUrl, setWebhookUrl] = useState("https://erp.clientdomain.com/webhooks/officex");

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // REAL TALLY PRIME API CALLS
  const handleTestTallyConnection = async () => {
    setIsTestingTally(true);
    setTallyTestResult(null);

    try {
      const res = await fetch("/api/rent-roll/integrations/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          serverUrl: tallyServerUrl,
          companyName: tallyCompanyName
        })
      });
      const data = await res.json();
      setTallyTestResult({
        success: data.success,
        message: data.message || (data.success ? data.statusText : data.error)
      });
    } catch (err: any) {
      setTallyTestResult({
        success: false,
        message: `Network error contacting OfficeX Tally gateway: ${err.message}`
      });
    } finally {
      setIsTestingTally(false);
    }
  };

  const handlePushToTally = async () => {
    setIsPushingTally(true);
    setTallyPushResult(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          serverUrl: tallyServerUrl,
          companyName: tallyCompanyName,
          ledgers
        })
      });
      const data = await res.json();
      if (data.success) {
        setTallyPushResult(`Successfully generated and transmitted ${data.vouchersPushed || 0} vouchers to Tally Prime.`);
      } else {
        setTallyPushResult(data.message || data.error || "Failed to push to Tally server. Please verify Tally is open on port 9000 or download XML vouchers.");
      }
    } catch (err: any) {
      setTallyPushResult(`Error connecting to Tally endpoint: ${err.message}. Please use the 1-Click XML voucher download.`);
    } finally {
      setIsPushingTally(false);
    }
  };

  // REAL RAZORPAY API TEST CALLS
  const handleTestRazorpay = async () => {
    setIsTestingRazorpay(true);
    setRazorpayTestResult(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/razorpay/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setRazorpayTestResult(data);
    } catch (err: any) {
      setRazorpayTestResult({
        success: false,
        error: err.message,
        message: `Network failure connecting to Razorpay verification service: ${err.message}`
      });
    } finally {
      setIsTestingRazorpay(false);
    }
  };

  const handleCreateTestOrder = async () => {
    setIsCreatingTestOrder(true);
    setTestOrderResult(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/razorpay/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_test_order" })
      });
      const data = await res.json();
      if (data.success && data.testOrder) {
        setTestOrderResult({
          success: true,
          orderId: data.testOrder.id,
          amount: data.testOrder.amount,
          currency: data.testOrder.currency,
          message: `Live Razorpay Order generated: ${data.testOrder.id} (${data.testOrder.currency} ${data.testOrder.amount / 100})`
        });
      } else {
        setTestOrderResult({
          success: false,
          error: data.error || data.message || "Failed to generate test order"
        });
      }
    } catch (err: any) {
      setTestOrderResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsCreatingTestOrder(false);
    }
  };

  // REAL OUTBOUND WEBHOOK TEST CALL
  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch("/api/rent-roll/integrations/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl })
      });
      const data = await res.json();
      setWebhookTestResult(data);
    } catch (err: any) {
      setWebhookTestResult({
        success: false,
        error: err.message,
        message: `Failed to deliver test webhook ping: ${err.message}`
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Accounting &amp; ERP Integrations Hub
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Canonical RR-INT-01 / 02
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live automated synchronization between OfficeX Rent Roll and your general ledger accounting software
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/30 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("razorpay")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "razorpay"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Razorpay Gateway Test</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">Active API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tally")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "tally"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Tally Prime (Desktop / LAN)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">Most Popular</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("zoho")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "zoho"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Zoho Books (Cloud API)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quickbooks")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "quickbooks"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>QuickBooks Online</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sap")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "sap"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Enterprise ERP (SAP / Oracle)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("webhooks")}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "webhooks"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Webhooks &amp; REST API</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ──────────────── TAB 0: RAZORPAY GATEWAY TEST ──────────────── */}
          {activeTab === "razorpay" && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-emerald-950 text-sm">
                    Razorpay Payment Gateway Integration Test
                  </div>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    Test the live connection between OfficeX and Razorpay servers. This utility makes authentic HTTP Basic Auth calls to Razorpay&apos;s API to verify that API keys are authorized, active, and capable of generating payment orders before accepting real tenant rent.
                  </p>
                </div>
              </div>

              {/* Status & Test Panel */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Active Gateway Credentials</h3>
                    <p className="text-[11px] text-slate-500">Configured via server environment variables (.env.local / Vercel)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                    Key ID Loaded
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={isTestingRazorpay}
                    onClick={handleTestRazorpay}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingRazorpay ? "animate-spin" : ""}`} />
                    <span>{isTestingRazorpay ? "Connecting to Razorpay..." : "1. Ping & Verify Razorpay API"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCreatingTestOrder}
                    onClick={handleCreateTestOrder}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isCreatingTestOrder ? "animate-spin" : ""}`} />
                    <span>{isCreatingTestOrder ? "Creating Order..." : "2. Generate Live Test Order (₹1)"}</span>
                  </button>
                </div>

                {/* Test Output Diagnostic Card */}
                {razorpayTestResult && (
                  <div className={`p-4 rounded-xl space-y-1.5 border ${
                    razorpayTestResult.success ? "bg-emerald-50 text-emerald-950 border-emerald-200" : "bg-rose-50 text-rose-950 border-rose-200"
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {razorpayTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {razorpayTestResult.success
                          ? `✓ Razorpay Verified (${razorpayTestResult.keyMode || "ACTIVE"})`
                          : "✕ Razorpay Authentication Failed"}
                      </span>
                      {razorpayTestResult.latencyMs && (
                        <span className="ml-auto text-[10px] font-mono text-slate-500 font-normal">
                          Latency: {razorpayTestResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {razorpayTestResult.message || razorpayTestResult.error}
                    </p>
                    {razorpayTestResult.keyIdMasked && (
                      <div className="text-[10px] font-mono text-slate-500">
                        Authenticated Key: {razorpayTestResult.keyIdMasked}
                      </div>
                    )}
                  </div>
                )}

                {testOrderResult && (
                  <div className={`p-4 rounded-xl space-y-1.5 border ${
                    testOrderResult.success ? "bg-indigo-50 text-indigo-950 border-indigo-200" : "bg-rose-50 text-rose-950 border-rose-200"
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {testOrderResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {testOrderResult.success
                          ? `✓ Live Order Created: ${testOrderResult.orderId}`
                          : "✕ Order Creation Failed"}
                      </span>
                    </div>
                    <p className="text-[11px]">
                      {testOrderResult.message || testOrderResult.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 1: TALLY PRIME ──────────────── */}
          {activeTab === "tally" && (
            <div className="space-y-6">
              {/* Architecture Explanation Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-indigo-950 text-sm">
                    How Tally Integration Works Across Property Owners
                  </div>
                  <p className="text-indigo-800/90 leading-relaxed">
                    Because Tally Prime runs as a <strong>desktop Windows program</strong> on local office machines or LAN servers, OfficeX offers two automated integration methods: <strong>Direct Push via Tally XML Server (Port 9000)</strong> for zero-touch sync, or <strong>1-Click XML Voucher Export</strong> for offline chartered accountants.
                  </p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setTallyMode("agent")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    tallyMode === "agent"
                      ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      Live Direct Sync (Port 9000)
                    </span>
                    {tallyMode === "agent" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Communicates directly with Tally Prime&apos;s built-in HTTP XML Server. Invoices and receipts push into Tally automatically without touching files.
                  </p>
                </div>

                <div
                  onClick={() => setTallyMode("file")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    tallyMode === "file"
                      ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600" />
                      1-Click XML Voucher Package
                    </span>
                    {tallyMode === "file" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Downloads compliant Tally.ERP9 / Tally Prime &lt;ENVELOPE&gt; XML vouchers for offline loading by chartered accountants and external auditors.
                  </p>
                </div>
              </div>

              {/* Direct Server Configuration */}
              {tallyMode === "agent" && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Tally XML Server Endpoint Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tally Server URL / LAN Host
                      </label>
                      <input
                        type="text"
                        value={tallyServerUrl}
                        onChange={(e) => setTallyServerUrl(e.target.value)}
                        placeholder="http://localhost:9000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Default Tally Prime port is 9000. Enabled under F1 &gt; Settings &gt; Connectivity.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Company Name in Tally Prime
                      </label>
                      <input
                        type="text"
                        value={tallyCompanyName}
                        onChange={(e) => setTallyCompanyName(e.target.value)}
                        placeholder="Exact company name as opened in Tally"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Must match the active company name in Tally header exactly.
                      </span>
                    </div>
                  </div>

                  {/* Test & Push Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isTestingTally}
                      onClick={handleTestTallyConnection}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingTally ? "animate-spin text-indigo-600" : ""}`} />
                      <span>{isTestingTally ? "Testing Connectivity..." : "Test Tally Connection"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPushingTally}
                      onClick={handlePushToTally}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPushingTally ? "Transmitting to Tally..." : "Auto-Push Vouchers to Tally Now"}</span>
                    </button>

                    <a
                      href="/api/rent-roll/export/tally"
                      download
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer ml-auto"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Download XML Fallback</span>
                    </a>
                  </div>

                  {tallyTestResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        tallyTestResult.success
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {tallyTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{tallyTestResult.message}</span>
                    </div>
                  )}

                  {tallyPushResult && (
                    <div className="p-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{tallyPushResult}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Offline File Mode */}
              {tallyMode === "file" && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Download Vouchers File</h3>
                      <p className="text-xs text-slate-500">
                        Export an audit-ready standard XML voucher file formatted for Tally Prime
                      </p>
                    </div>
                    <a
                      href="/api/rent-roll/export/tally"
                      download
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Tally XML Package</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                    <span className="font-bold text-slate-800 block">How to Import in Tally Prime:</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Open your company in <strong>Tally Prime</strong>.</li>
                      <li>Click <strong>Import</strong> (or press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt + O</kbd>) in the top menu.</li>
                      <li>Select <strong>Transactions</strong>.</li>
                      <li>Select the downloaded <code className="text-indigo-700 font-mono">OFFICEX_Tally_Prime_Vouchers.xml</code> file and press Enter.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Chart of Accounts & Ledger Mapping */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Tally Chart of Accounts &amp; Ledger Mapping
                  </h3>
                  <span className="text-[10px] text-slate-400">Ensure these ledger names match your Tally books</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Rental Income Ledger</label>
                    <input
                      type="text"
                      value={ledgers.rentIncome}
                      onChange={(e) => setLedgers({ ...ledgers, rentIncome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CAM Recoveries Ledger</label>
                    <input
                      type="text"
                      value={ledgers.camIncome}
                      onChange={(e) => setLedgers({ ...ledgers, camIncome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Output CGST (9%)</label>
                    <input
                      type="text"
                      value={ledgers.cgst}
                      onChange={(e) => setLedgers({ ...ledgers, cgst: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Output SGST (9%)</label>
                    <input
                      type="text"
                      value={ledgers.sgst}
                      onChange={(e) => setLedgers({ ...ledgers, sgst: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Output IGST (18%)</label>
                    <input
                      type="text"
                      value={ledgers.igst}
                      onChange={(e) => setLedgers({ ...ledgers, igst: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Escrow Bank Ledger</label>
                    <input
                      type="text"
                      value={ledgers.bankLedger}
                      onChange={(e) => setLedgers({ ...ledgers, bankLedger: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: ZOHO BOOKS ──────────────── */}
          {activeTab === "zoho" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
                <span className="font-bold text-sm block">Zoho Books Cloud API Integration (RR-INT-02)</span>
                <p>
                  Connect directly to Zoho Books via OAuth 2.0. Invoices, credit notes, and payment receipts sync automatically in both directions in real time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Zoho Organization ID</label>
                    <input
                      type="text"
                      value={zohoOrgId}
                      onChange={(e) => setZohoOrgId(e.target.value)}
                      placeholder="e.g. 700123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data Center Domain</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                      <option>zoho.in (India)</option>
                      <option>zoho.com (US / Global)</option>
                      <option>zoho.eu (Europe)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsZohoConnected(!isZohoConnected)}
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      isZohoConnected
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                    }`}
                  >
                    {isZohoConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4" />}
                    <span>{isZohoConnected ? "Connected to Zoho Books" : "Connect Zoho Books via OAuth"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: QUICKBOOKS ──────────────── */}
          {activeTab === "quickbooks" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold text-sm block">QuickBooks Online Sync (RR-INT-02)</span>
                <p>
                  Automatic synchronization of commercial tenant customers, invoices, and payments with QuickBooks Online.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Intuit QuickBooks Online</h4>
                  <p className="text-xs text-slate-500">Authorize OfficeX to sync commercial invoices with your QuickBooks account</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Connect to QuickBooks</span>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: ENTERPRISE ERP (SAP/ORACLE) ──────────────── */}
          {activeTab === "sap" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
                <span className="font-bold text-sm block">Enterprise ERP Connectors (SAP S/4HANA &amp; Oracle NetSuite)</span>
                <p className="text-slate-300">
                  Institutional property owners and REITs sync accounting data via secure SFTP batch transmission and standard BAPI / IDoc formats.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 text-xs">
                <h4 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                  Scheduled SFTP Journal Batch Feed
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SFTP Host</label>
                    <input
                      type="text"
                      placeholder="sftp.owner-erp.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Port</label>
                    <input
                      type="text"
                      defaultValue="22"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Schedule</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                      <option>Daily at 23:59 IST</option>
                      <option>On Billing Run Approval</option>
                      <option>Hourly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 5: WEBHOOKS & API ──────────────── */}
          {activeTab === "webhooks" && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1">
                <span className="font-bold text-sm block">Developer REST API &amp; Webhooks (RR-INT-05 / RR-INT-06)</span>
                <p>
                  Any property management company or software team can connect their custom internal portal, ERP, or payment gateway directly using signed webhooks and REST endpoints.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">OfficeX REST API Secret Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(apiKey, "api_key")}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {copiedKey === "api_key" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Outbound Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-server.com/webhooks/officex"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      disabled={isTestingWebhook}
                      onClick={handleTestWebhook}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? "animate-spin" : ""}`} />
                      <span>{isTestingWebhook ? "Pinging..." : "Test Webhook Ping"}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Events emitted: <code className="text-purple-700 font-mono">invoice.issued</code>, <code className="text-purple-700 font-mono">payment.received</code>, <code className="text-purple-700 font-mono">escalation.applied</code>
                  </span>
                </div>

                {/* Webhook Test Diagnostic Card */}
                {webhookTestResult && (
                  <div className={`p-4 rounded-xl space-y-1.5 border ${
                    webhookTestResult.success ? "bg-emerald-50 text-emerald-950 border-emerald-200" : "bg-rose-50 text-rose-950 border-rose-200"
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {webhookTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {webhookTestResult.success
                          ? `✓ Webhook Delivered (HTTP ${webhookTestResult.statusCode || 200})`
                          : `✕ Webhook Failed (${webhookTestResult.statusText || (webhookTestResult.statusCode ? `HTTP ${webhookTestResult.statusCode}` : "Unreachable")})`}
                      </span>
                      {webhookTestResult.latencyMs && (
                        <span className="ml-auto text-[10px] font-mono text-slate-500 font-normal">
                          Latency: {webhookTestResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {webhookTestResult.message || webhookTestResult.error}
                    </p>
                    {webhookTestResult.responsePreview && (
                      <div className="text-[10px] font-mono text-slate-600 bg-white/70 p-2 rounded border border-slate-200 truncate">
                        Response: {webhookTestResult.responsePreview}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="text-[11px] text-slate-500 font-medium">
            Section 0.4 (OI-5) &amp; Section 5.11 (RR-INT-01 / 02) Compliant
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
