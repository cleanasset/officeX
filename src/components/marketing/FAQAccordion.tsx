"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQAccordionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  seeAllHref?: string;
}

export default function FAQAccordion({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about our modules, contracts, and implementation.",
  faqs,
  seeAllHref = "/faq"
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-3">
            <HelpCircle size={13} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#071324] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#0F8B7D] text-white" : ""
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed bg-white border-t border-gray-100 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {seeAllHref && (
          <div className="mt-10 text-center">
            <Link
              href={seeAllHref}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F8B7D] hover:underline"
            >
              <span>See all FAQs &amp; Knowledge Base</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
