"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { ChevronDown, HelpCircle, ArrowRight, MessageSquare } from "lucide-react";

export default function FAQDirectoryPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("cat1-0");

  const categories = [
    {
      id: "cat1",
      name: "Platform Core & Security",
      faqs: [
        {
          q: "How does OfficeX comply with the Digital Personal Data Protection (DPDP) Act 2023?",
          a: "OfficeX enforces strict tenant data isolation, AES-256 encryption at rest and TLS 1.3 in transit. Data principals retain full rights of correction and erasure. All primary databases are located in Tier-4 data centers within Indian borders."
        },
        {
          q: "Can we integrate OfficeX with our existing ERP (SAP, Oracle, Tally Prime)?",
          a: "Yes. OfficeX provides bidirectional REST APIs and pre-built connectors for major ERPs to sync rent rolls, vendor purchase orders, payment receipts, and tax ledgers automatically."
        },
        {
          q: "What role-based access control (RBAC) options are available?",
          a: "OfficeX supports granular permissions allowing different access levels for Asset Owners, Property Managers, Technicians, Security Guards, Corporate Tenants, and Auditors."
        }
      ]
    },
    {
      id: "cat2",
      name: "Marketplace & RFQs",
      faqs: [
        {
          q: "How does escrow payment protection protect both clients and vendors?",
          a: "Clients deposit project funds into an escrow account powered by Razorpay. Funds are locked and released strictly when both parties sign off on milestone completion. This protects clients from vendor abandonment and protects vendors from payment defaults."
        },
        {
          q: "How are FM vendors vetted before being listed?",
          a: "Vendors must submit valid GSTIN, PF/ESIC registrations, audited financials, past client references, and public liability insurance. They are also subject to ongoing performance audits based on actual job SLA scores."
        }
      ]
    },
    {
      id: "cat3",
      name: "Operate & CAFM",
      faqs: [
        {
          q: "How does the 52-week PPM calendar work?",
          a: "Our system auto-generates a weekly maintenance schedule for all MEP assets based on manufacturer specifications and statutory guidelines. Tasks are auto-assigned to shift technicians with digital checklists and photographic proof."
        },
        {
          q: "What happens when an SLA is breached?",
          a: "If a priority ticket is not resolved within the contracted SLA window, automatic notifications escalate to the Facility Lead and Operations Director, and SLA credit penalty deductions are calculated."
        }
      ]
    },
    {
      id: "cat4",
      name: "Manage & CAM Billing",
      faqs: [
        {
          q: "Can OfficeX handle complex commercial CAM billing formulas?",
          a: "Yes. The platform supports proportionate super built-up area calculations, utility sub-meter BTU consumption billing, fixed CAM rates, and year-end true-up audit reconciliations."
        },
        {
          q: "How does the statutory compliance alert system work?",
          a: "OfficeX tracks renewal dates for over 40 statutory licenses (Fire NOC, Lift licenses, PCB approvals, DG permissions) and triggers proactive automated alerts at 90, 60, and 30 days before expiration."
        }
      ]
    },
    {
      id: "cat5",
      name: "Intelligence & ESG",
      faqs: [
        {
          q: "What reporting standards does OfficeX Intelligence support?",
          a: "We provide automated report generation compliant with SEBI BRSR Core guidelines for Indian listed entities, as well as global GRESB and GRI sustainability frameworks."
        },
        {
          q: "When will the Natural Language AI assistant be released?",
          a: "The AI Assistant is currently in private preview and scheduled for general availability in H2 2026 once multi-quarter operational data patterns are established."
        }
      ]
    }
  ];

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX Logo"
            width={50}
            height={50}
            className="object-contain"
            style={{ width: "auto", height: "42px" }}
          />
          <Image
            src="/name-removebg-preview.png"
            alt="OfficeX"
            width={160}
            height={36}
            className="object-contain"
            style={{ width: "auto", height: "30px" }}
          />
        </Link>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/marketplace" className="text-gray-600 hover:text-[#0F8B7D]">
            Solutions
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-[#0F8B7D]">
            Contact
          </Link>
          <Link
            href="/demo"
            className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-extrabold hover:bg-[#0c7368] transition-all"
          >
            Book a Demo
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#0F8B7D] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
              KNOWLEDGE BASE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071324] tracking-tight mt-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              Detailed answers on security, contracts, pricing, and module capabilities.
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-6 pb-3 border-b border-gray-100">
                  {cat.name}
                </h2>

                <div className="space-y-3">
                  {cat.faqs.map((faq, idx) => {
                    const uniqueId = `${cat.id}-${idx}`;
                    const isOpen = openIndex === uniqueId;

                    return (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-2xl overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggle(uniqueId)}
                          className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {faq.q}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full bg-gray-200/80 flex items-center justify-center shrink-0 text-gray-600 transition-transform ${
                              isOpen ? "rotate-180 bg-[#0F8B7D] text-white" : ""
                            }`}
                          >
                            <ChevronDown size={14} />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-4 sm:p-5 text-xs text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Need More Help */}
          <div className="mt-16 bg-[#071324] text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl">
            <h3 className="text-xl font-black">Still Have Questions?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Our CRE solutions engineering team is available for deep-dive consultations.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-black text-xs hover:bg-[#0c7368] transition-all"
              >
                Contact Solutions Desk
              </Link>
              <Link
                href="/demo"
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-white font-black text-xs hover:bg-slate-800 transition-all"
              >
                Schedule Demo Call
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
