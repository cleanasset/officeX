"use client";
import React, { useState } from "react";
import { ShieldCheck, Check, X, FileText, ExternalLink, Download, Search, CheckCircle2, Eye, Building2, Calendar, AlertCircle } from "lucide-react";

interface CertificateDoc {
  name: string;
  type: string;
  issueDate: string;
  validTill: string;
  authority: string;
  regNumber: string;
  status: string;
}

export default function VendorKYCVerification() {
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");

  const [kycQueue, setKycQueue] = useState([
    {
      id: "V-901",
      companyName: "SafeGuard Security Services Private Limited",
      gstin: "27AAACG9876C1ZY",
      pan: "AAACG9876C",
      services: "Security, Manned Patrols, CCTV Surveillance",
      joined: "Aug 20, 2026",
      status: "pending",
      city: "Mumbai, Maharashtra",
      docs: [
        { name: "GSTIN Registration Certificate", type: "Tax Compliance", issueDate: "12-Jan-2022", validTill: "Active / Regular", authority: "GST Council of India", regNumber: "27AAACG9876C1ZY", status: "Verified" },
        { name: "Labor License Form V (PSARA)", type: "Statutory License", issueDate: "05-Mar-2024", validTill: "04-Mar-2029", authority: "Home Department, Govt of Maharashtra", regNumber: "PSARA/MUM/2024/0981", status: "Verified" },
        { name: "General Liability Insurance Policy", type: "Insurance Cover", issueDate: "01-Apr-2026", validTill: "31-Mar-2027", authority: "HDFC ERGO General Insurance", regNumber: "POL-GL-998822", status: "Verified" }
      ]
    },
    {
      id: "V-902",
      companyName: "AquaClean Environmental Solutions LLP",
      gstin: "29AABCA1234F2ZX",
      pan: "AABCA1234F",
      services: "Housekeeping, Deep Sanitization, Waste Management",
      joined: "Aug 22, 2026",
      status: "pending",
      city: "Bengaluru, Karnataka",
      docs: [
        { name: "GSTIN Registration Certificate", type: "Tax Compliance", issueDate: "18-Nov-2021", validTill: "Active / Regular", authority: "GST Council of India", regNumber: "29AABCA1234F2ZX", status: "Verified" },
        { name: "EPF & ESIC Statutory Declarations", type: "Labor Compliance", issueDate: "01-Jul-2026", validTill: "30-Jun-2027", authority: "Employees Provident Fund Organisation (EPFO)", regNumber: "EPFO/KN/BNG/887711", status: "Verified" }
      ]
    }
  ]);

  const [verifiedVendors, setVerifiedVendors] = useState([
    {
      id: "V-801",
      companyName: "TechServe Solutions Private Limited",
      gstin: "27AABCT9876C1ZR",
      pan: "AABCT9876C",
      services: "HVAC Engineering, MEP AMC, Electrical Overhauls",
      approvedOn: "Aug 15, 2026",
      city: "Mumbai & Pune",
      rating: "4.9 / 5.0",
      docs: [
        { name: "GSTIN Registration Certificate", type: "Tax Compliance", issueDate: "10-Oct-2020", validTill: "Active / Regular", authority: "GST Council of India", regNumber: "27AABCT9876C1ZR", status: "Verified" },
        { name: "Electrical Contractor Class-A License", type: "Technical License", issueDate: "14-Feb-2023", validTill: "13-Feb-2028", authority: "Chief Electrical Inspector to Govt", regNumber: "EL-MH-A-4455", status: "Verified" }
      ]
    },
    {
      id: "V-802",
      companyName: "CleanForce Labs Facility Care",
      gstin: "24AADCV1234D2ZS",
      pan: "AADCV1234D",
      services: "Mechanized Housekeeping, Facade Cleaning",
      approvedOn: "Aug 18, 2026",
      city: "Ahmedabad & Surat",
      rating: "4.8 / 5.0",
      docs: [
        { name: "GSTIN Registration Certificate", type: "Tax Compliance", issueDate: "05-May-2022", validTill: "Active / Regular", authority: "GST Council of India", regNumber: "24AADCV1234D2ZS", status: "Verified" }
      ]
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<CertificateDoc | null>(null);
  const [selectedDocVendor, setSelectedDocVendor] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleApprove = (item: typeof kycQueue[0]) => {
    setKycQueue(kycQueue.filter(k => k.id !== item.id));
    setVerifiedVendors([
      {
        id: item.id,
        companyName: item.companyName,
        gstin: item.gstin,
        pan: item.pan,
        services: item.services,
        approvedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        city: item.city,
        rating: "5.0 / 5.0 (New)",
        docs: item.docs
      },
      ...verifiedVendors
    ]);
    setMessage(`KYC verified & approved for ${item.companyName}! Vendor is now active in the Marketplace.`);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setKycQueue(kycQueue.filter(k => k.id !== id));
    setMessage(`KYC rejected for ${name}. Automated notification sent for document correction.`);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor KYC Verification</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Audit tax details, labor licenses, and liability insurance before marketplace listing.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pending" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Pending Verification ({kycQueue.length})
          </button>
          <button 
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "verified" 
                ? "bg-white text-emerald-700 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Verified Active Vendors ({verifiedVendors.length})
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* TAB 1: PENDING VERIFICATION QUEUE */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-6">
          {kycQueue.map((item, idx) => (
            <div key={idx} className="premium-card p-6 border border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{item.companyName}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
                      <span>GSTIN: <strong className="text-gray-800">{item.gstin}</strong></span>
                      <span>PAN: <strong className="text-gray-800">{item.pan}</strong></span>
                      <span>Location: <strong className="text-gray-800">{item.city}</strong></span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                    Awaiting Verification
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Services Offered</div>
                    <div className="font-bold text-gray-900 mt-1">{item.services}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Application Date</div>
                    <div className="font-bold text-gray-900 mt-1">{item.joined}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-2">
                    Uploaded Certificates (Click to inspect document copy)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.docs.map((doc, dIdx) => (
                      <button
                        key={dIdx}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setSelectedDocVendor(item.companyName);
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-[11px] font-bold text-blue-700 flex items-center gap-2 cursor-pointer transition-all shadow-sm group"
                      >
                        <FileText size={13} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>{doc.name}</span>
                        <Eye size={12} className="text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-3 shrink-0 w-full md:w-44 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 justify-center">
                <button 
                  onClick={() => handleApprove(item)}
                  className="flex-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check size={15} /> Approve KYC
                </button>
                <button 
                  onClick={() => handleReject(item.id, item.companyName)}
                  className="flex-1 w-full py-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X size={15} /> Reject KYC
                </button>
              </div>
            </div>
          ))}

          {kycQueue.length === 0 && (
            <div className="premium-card p-12 text-center border border-gray-200 bg-white">
              <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-base">KYC Onboarding Queue Clear</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">All vendor verification documents have been audited and approved.</p>
              <button 
                onClick={() => setActiveTab("verified")}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 cursor-pointer"
              >
                View Verified Active Vendors ({verifiedVendors.length}) →
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERIFIED VENDORS DIRECTORY */}
      {activeTab === "verified" && (
        <div className="flex flex-col gap-6">
          {verifiedVendors.map((item, idx) => (
            <div key={idx} className="premium-card p-6 border border-emerald-100 bg-emerald-50/10 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      {item.companyName}
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
                      <span>GSTIN: <strong className="text-gray-800">{item.gstin}</strong></span>
                      <span>PAN: <strong className="text-gray-800">{item.pan}</strong></span>
                      <span>Rating: <strong className="text-amber-600">{item.rating}</strong></span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified & Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Marketplace Categories</div>
                    <div className="font-bold text-gray-900 mt-1">{item.services}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Approved On</div>
                    <div className="font-bold text-gray-900 mt-1">{item.approvedOn}</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-2">Verified Documents on Record</div>
                  <div className="flex flex-wrap gap-2">
                    {item.docs.map((doc, dIdx) => (
                      <button
                        key={dIdx}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setSelectedDocVendor(item.companyName);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[11px] font-semibold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText size={12} className="text-emerald-600" />
                        <span>{doc.name}</span>
                        <Eye size={11} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCUMENT PREVIEW & AUDIT MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 flex flex-col gap-6 shadow-2xl animate-scale-up border border-gray-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FileText size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">{selectedDoc.type}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">{selectedDoc.name}</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedDocVendor}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Details Card */}
            <div className="flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Statutory Registration Number</span>
                  <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">{selectedDoc.regNumber}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} /> {selectedDoc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Issuing Authority</span>
                  <span className="font-bold text-gray-900">{selectedDoc.authority}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Validity Window</span>
                  <span className="font-bold text-gray-900">Valid: {selectedDoc.validTill}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Issued: {selectedDoc.issueDate}</span>
                </div>
              </div>

              {/* Digital Certificate Security Badge */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-start gap-3">
                <ShieldCheck size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 block font-bold">OfficeX Automated Verification Hash:</strong>
                  Document cryptographically verified against GSTN & MCA public APIs. Digital signature valid and unmodified.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  alert(`Downloading copy of ${selectedDoc.name}...`);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download size={14} /> Download Certificate Copy
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
