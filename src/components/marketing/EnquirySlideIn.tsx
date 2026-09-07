"use client";

import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import EnquiryForm from "./EnquiryForm";

interface EnquirySlideInProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: {
    audience?: string;
    modules?: string[];
  };
}

export default function EnquirySlideIn({ isOpen, onClose, prefill }: EnquirySlideInProps) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="p-6 bg-[#071324] text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-[#0F8B7D] text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>OfficeX Enterprise</span>
              </div>
              <h2 className="text-xl font-black mt-1">Talk to Commercial Sales</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                We respond within 24 business hours.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <EnquiryForm
              variant="modal"
              prefill={prefill}
              onSuccess={() => {
                // Keep open or auto close handled in success message
              }}
            />
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 border-t border-gray-100 text-center text-[11px] text-gray-500 font-medium">
            Need urgent assistance? Reach us directly at <span className="font-bold text-gray-800">+91 1800 200 4589</span>
          </div>

        </div>
      </div>
    </div>
  );
}
