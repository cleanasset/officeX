"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Layers,
  ArrowRight
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface ImportRentRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties: Array<{ id: string; name: string; city: string }>;
  selectedPropertyId?: string;
}

export const ImportRentRollModal: React.FC<ImportRentRollModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  properties,
  selectedPropertyId
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTargetProp, setSelectedTargetProp] = useState<string>(
    selectedPropertyId && selectedPropertyId !== "ALL" ? selectedPropertyId : properties[0]?.id || ""
  );
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate Sample CSV Template for client download
  const handleDownloadSampleTemplate = () => {
    const headers = [
      "Tenant Trade Name",
      "Tenant Legal Name",
      "Building / Property Name",
      "Unit Number",
      "Floor Number",
      "Chargeable Area SqFt",
      "Carpet Area SqFt",
      "Monthly Base Rent INR",
      "CAM Rate PSF",
      "Utility Fixed Monthly",
      "Start Date (YYYY-MM-DD)",
      "End Date (YYYY-MM-DD)",
      "Escalation Pct",
      "Escalation Frequency Months",
      "Security Deposit Months",
      "Lock In Months"
    ];

    const sampleRow1 = [
      "Acme Cloud Technologies",
      "Acme Cloud Technologies India Pvt Ltd",
      properties[0]?.name || "Horizon Prime Tower",
      "Suite 401",
      "4",
      "12500",
      "9375",
      "1875000",
      "22",
      "25000",
      "2026-04-01",
      "2029-03-31",
      "5",
      "24",
      "6",
      "36"
    ];

    const sampleRow2 = [
      "Zenith Capital Partners",
      "Zenith Capital Advisory LLP",
      properties[0]?.name || "Horizon Prime Tower",
      "Suite 802",
      "8",
      "18000",
      "13500",
      "3240000",
      "24",
      "35000",
      "2026-05-15",
      "2031-05-14",
      "5",
      "12",
      "6",
      "36"
    ];

    const csvContent = [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "officex_rent_roll_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File
  const handleFileUpload = (file: File) => {
    setErrorMsg("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMsg("Selected file is empty.");
          return;
        }

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setErrorMsg("CSV file must have a header row and at least one data row.");
          return;
        }

        const rawHeaders = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cells.length < 3) continue;

          const rowData: Record<string, any> = {};
          rawHeaders.forEach((header, idx) => {
            rowData[header] = cells[idx] || "";
          });

          // Match flexible header variations
          const tenantName = rowData["tenanttradename"] || rowData["tenantname"] || rowData["tenant"] || cells[0] || "";
          const legalName = rowData["tenantlegalname"] || rowData["legalname"] || tenantName;
          const propertyName = rowData["buildingpropertyname"] || rowData["propertyname"] || rowData["building"] || cells[2] || "";
          const unitNumber = rowData["unitnumber"] || rowData["unit"] || rowData["spacenumber"] || cells[3] || `Unit ${100 + i}`;
          const floorNumber = Number(rowData["floornumber"] || rowData["floor"] || cells[4] || 1);
          const chargeableArea = Number(rowData["chargeableareasqft"] || rowData["chargeablearea"] || rowData["area"] || cells[5] || 5000);
          const carpetArea = Number(rowData["carpetareasqft"] || rowData["carpetarea"] || Math.round(chargeableArea * 0.75));
          const monthlyRent = Number(rowData["monthlybaserentinr"] || rowData["monthlyrent"] || rowData["baserent"] || cells[7] || chargeableArea * 150);
          const camRatePsf = Number(rowData["camratepsf"] || rowData["camrate"] || 20);
          const utilityFixedMonthly = Number(rowData["utilityfixedmonthly"] || rowData["utility"] || 0);
          const startDate = rowData["startdateyyyymmdd"] || rowData["startdate"] || cells[10] || new Date().toISOString().split("T")[0];
          const endDate = rowData["enddateyyyymmdd"] || rowData["enddate"] || cells[11] || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          const escalationPct = Number(rowData["escalationpct"] || 5);
          const escalationFrequencyMonths = Number(rowData["escalationfrequencymonths"] || 24);
          const securityDepositMonths = Number(rowData["securitydepositmonths"] || 6);
          const lockInMonths = Number(rowData["lockinmonths"] || 36);

          if (tenantName) {
            rows.push({
              tenantName,
              legalName,
              propertyName,
              unitNumber,
              floorNumber,
              chargeableArea,
              carpetArea,
              monthlyRent,
              camRatePsf,
              utilityFixedMonthly,
              startDate,
              endDate,
              escalationPct,
              escalationFrequencyMonths,
              securityDepositMonths,
              lockInMonths
            });
          }
        }

        if (rows.length === 0) {
          setErrorMsg("Could not parse any valid lease records from this CSV file.");
          return;
        }

        setParsedRows(rows);
      } catch (err: any) {
        setErrorMsg("Failed to parse file: " + (err?.message || "Unknown error"));
      }
    };
    reader.readAsText(file);
  };

  // Submit parsed rows to backend
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const email = typeof window !== "undefined"
        ? (localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email") || "")
        : "";

      const res = await fetch("/api/rent-roll/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: parsedRows,
          propertyId: selectedTargetProp,
          ownerEmail: email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to import leases.");
      setIsLoading(false);
    }
  };

  const totalSqft = parsedRows.reduce((sum, r) => sum + (Number(r.chargeableArea) || 0), 0);
  const totalBaseRent = parsedRows.reduce((sum, r) => sum + (Number(r.monthlyRent) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 border border-teal-200 text-[#0F8B7D] rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Import Commercial Rent Roll</h3>
              <p className="text-xs text-gray-500">
                Bulk upload institutional tenant leases, areas, rates &amp; escalation schedules via CSV / Excel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Download Sample Template */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center text-[10px] font-black">
                  1
                </span>
                Download Standard Institutional Template
              </div>
              <p className="text-[11px] text-teal-800/80 mt-1">
                Format your contracts using our 16-column standard template (Base Rent, CAM, GST, Escalation).
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-[#0F8B7D] border border-teal-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Target Property Selection */}
          {properties.length > 0 && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Target Property (Default for rows without building name)
              </label>
              <select
                value={selectedTargetProp}
                onChange={(e) => setSelectedTargetProp(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#0F8B7D]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Upload Dropzone */}
          <div>
            <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              Upload Completed CSV File
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-gray-300 hover:border-[#0F8B7D] rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {fileName ? fileName : "Click to select or drag & drop CSV file"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Supports .csv files exported from Excel, Google Sheets, or ERP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Feedback & Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{parsedRows.length} leases successfully imported! Updating rent roll...</span>
            </div>
          )}

          {/* Step 3: Parsed Data Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  <span>Parsed Lease Preview ({parsedRows.length} Records)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                  <span>Total Area: <strong className="text-gray-900">{totalSqft.toLocaleString()} sq.ft.</strong></span>
                  <span>•</span>
                  <span>Total Base Rent: <strong className="text-teal-700">{formatINR(totalBaseRent)}/mo</strong></span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Tenant</th>
                      <th className="p-2.5">Building</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5 text-right">Area (sq.ft.)</th>
                      <th className="p-2.5 text-right">Base Rent</th>
                      <th className="p-2.5 text-right">CAM PSF</th>
                      <th className="p-2.5 text-center">Tenure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80">
                        <td className="p-2.5 font-bold text-gray-900">{row.tenantName}</td>
                        <td className="p-2.5 text-gray-600">{row.propertyName || properties[0]?.name || "Building"}</td>
                        <td className="p-2.5 font-mono text-gray-700">{row.unitNumber}</td>
                        <td className="p-2.5 text-right font-mono">{Number(row.chargeableArea).toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-teal-700">{formatINR(row.monthlyRent)}</td>
                        <td className="p-2.5 text-right font-mono">₹{row.camRatePsf}</td>
                        <td className="p-2.5 text-center text-[11px] text-gray-500">
                          {row.startDate} → {row.endDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isLoading || isSuccess}
            className="px-5 py-2 bg-[#0F8B7D] hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <span>Importing {parsedRows.length} Leases...</span>
            ) : isSuccess ? (
              <span>✓ Import Completed</span>
            ) : (
              <>
                <span>Confirm &amp; Import ({parsedRows.length} Leases)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
