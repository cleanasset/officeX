"use client";

import React from "react";
import { X, Printer, Download, CheckCircle2, Building2, Calendar, FileText } from "lucide-react";
import { formatINR } from "./DashboardTab";
import { EscalationRecord } from "./EscalationsTab";

interface EscalationNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  escalation: EscalationRecord | null;
}

export const EscalationNoticeModal: React.FC<EscalationNoticeModalProps> = ({
  isOpen,
  onClose,
  escalation,
}) => {
  if (!isOpen || !escalation) return null;

  const noticeDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const noticeRefNumber = `OFX/ESC/${escalation.leaseCode}/${new Date(escalation.escalationDate).getFullYear()}-01`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Contractual Rent Escalation Notice</h2>
              <p className="text-xs text-blue-200/80">Ref: {noticeRefNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Notice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Body (Printable Letter) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-800 font-serif leading-relaxed text-sm bg-white space-y-6">
          {/* Landlord Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 font-sans">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                OFFICEX ASSET MANAGEMENT INDIA PVT LTD
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional Commercial Real Estate Division · Level 14, Tower 2, One International Center, Prabhadevi, Mumbai 400013
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                GSTIN: 27AAFCO1234F1Z5 · PAN: AAFCO1234F · CIN: U70100MH2024PTC123456
              </p>
            </div>
            <div className="text-right text-xs font-sans text-slate-500">
              <span className="font-bold text-slate-900 block">OFFICIAL NOTICE</span>
              <span>Date: {noticeDate}</span>
            </div>
          </div>

          {/* Reference Strip */}
          <div className="font-sans text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Notice Reference</span>
              <span className="font-mono font-bold text-slate-900">{noticeRefNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Lease Deed Reference</span>
              <span className="font-mono font-bold text-indigo-700">{escalation.leaseCode}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Effective Escalation Date</span>
              <span className="font-bold text-blue-700">{escalation.escalationDate}</span>
            </div>
          </div>

          {/* Addressee */}
          <div className="space-y-1">
            <p className="font-bold">To,</p>
            <p className="font-bold text-slate-900">{escalation.tenantName}</p>
            <p className="text-slate-600">Authorized Signatory / Corporate Real Estate &amp; Facilities</p>
            <p className="text-slate-600">{escalation.propertyName}</p>
          </div>

          {/* Subject */}
          <div className="font-sans font-bold text-slate-900 border-l-4 border-blue-600 pl-3 py-1 text-sm bg-blue-50/50">
            SUBJECT: FORMAL NOTICE OF CONTRACTUAL RENT ESCALATION IN RESPECT OF DEMISED PREMISES AT {escalation.propertyName.toUpperCase()}
          </div>

          {/* Body Paragraphs */}
          <p>Dear Sir / Madam,</p>

          <p>
            We draw your kind attention to the registered Commercial Lease Agreement entered into between <strong>OfficeX Asset Management India Pvt Ltd</strong> (&ldquo;Landlord&rdquo;) and <strong>{escalation.tenantName}</strong> (&ldquo;Tenant&rdquo;) in respect of the demised premises situated at <strong>{escalation.propertyName}</strong> bearing Lease Code <strong>{escalation.leaseCode}</strong>.
          </p>

          <p>
            In terms of the contractual covenants set forth in the Lease Agreement, the Monthly Base Rent payable in respect of the demised premises is subject to a periodic escalation of <strong>{escalation.escalationPct}%</strong> with effect from <strong>{escalation.escalationDate}</strong>.
          </p>

          <p>
            Accordingly, please find below the itemized schedule of revised commercial dues applicable for subsequent monthly billing cycles:
          </p>

          {/* Commercial Terms Table */}
          <div className="font-sans not-italic my-4">
            <table className="w-full border border-slate-300 text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="border border-slate-300 p-2.5">Commercial Component</th>
                  <th className="border border-slate-300 p-2.5 text-right">Previous Amount</th>
                  <th className="border border-slate-300 p-2.5 text-center">Escalation %</th>
                  <th className="border border-slate-300 p-2.5 text-right font-black text-slate-900">Revised Monthly Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2.5 font-bold">Base Monthly Rent</td>
                  <td className="border border-slate-300 p-2.5 text-right font-mono">{formatINR(escalation.previousRent)}</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-blue-700">+{escalation.escalationPct}%</td>
                  <td className="border border-slate-300 p-2.5 text-right font-mono font-black text-slate-900">{formatINR(escalation.newRent)}</td>
                </tr>
                <tr className="bg-teal-50/40">
                  <td className="border border-slate-300 p-2.5 font-bold text-teal-900">Net Monthly Increment</td>
                  <td className="border border-slate-300 p-2.5 text-right font-mono">—</td>
                  <td className="border border-slate-300 p-2.5 text-center">—</td>
                  <td className="border border-slate-300 p-2.5 text-right font-mono font-bold text-teal-800">+{formatINR(escalation.calculatedIncrease)} / month</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            All other contractual terms, including Common Area Maintenance (CAM) charges, utility recoveries, and applicable GST (18%) shall continue to apply as per the existing agreement.
          </p>

          <p>
            We request your finance and accounts payable department to kindly update your billing records to reflect the revised monthly base rent of <strong>{formatINR(escalation.newRent)}</strong> plus statutory GST for the billing cycle commencing <strong>{escalation.escalationDate}</strong> onwards.
          </p>

          <p>
            Should you require any clarifications or supplementary documentation, please contact your designated Portfolio Relationship Manager at <strong>leasing@officex.pro</strong>.
          </p>

          <p>Thanking you,</p>

          {/* Signatory Block */}
          <div className="font-sans pt-6 border-t border-slate-200 flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-500">For and on behalf of</p>
              <p className="font-black text-slate-900 text-sm mt-0.5">OfficeX Asset Management India Pvt Ltd</p>
              <div className="h-12 flex items-center text-xs font-mono text-slate-400 italic">
                [Authorized Corporate Signatory]
              </div>
              <p className="text-xs font-bold text-slate-700">Ravi Singhal</p>
              <p className="text-[11px] text-slate-500">Head of Asset Management &amp; Commercial Leasing</p>
            </div>

            <div className="text-right">
              <div className="w-24 h-24 rounded-full border-2 border-slate-300 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans text-center p-2 uppercase">
                Official Seal / Corporate Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
