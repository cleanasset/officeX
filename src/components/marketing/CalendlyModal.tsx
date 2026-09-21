"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Sparkles, Loader2, ExternalLink } from "lucide-react";

export const DEFAULT_CALENDLY_URL = "https://calendly.com/admin-cleanasset/30min";

/**
 * Trigger the global Calendly popup modal from anywhere in the application.
 * @param url Optional custom Calendly event URL (defaults to admin-cleanasset/30min)
 */
export function openCalendly(url: string = DEFAULT_CALENDLY_URL) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("officex:open-calendly", { detail: { url } })
    );
  }
}

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
}

export function CalendlyModal({
  isOpen,
  onClose,
  url = DEFAULT_CALENDLY_URL,
}: CalendlyModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIframeLoading(true);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Build embedded URL with theme & branding parameters
  let embedUrl = url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("embed_type", "Inline");
    parsed.searchParams.set("hide_gdpr_banner", "1");
    parsed.searchParams.set("primary_color", "2563eb"); // OfficeX Blue
    parsed.searchParams.set("text_color", "0f172a");

    // Optional prefill from active cookies if present in browser
    if (typeof document !== "undefined") {
      const matchEmail = document.cookie.match(/officex_user_email=([^;]+)/);
      if (matchEmail && matchEmail[1]) {
        parsed.searchParams.set("email", decodeURIComponent(matchEmail[1]));
      }
    }
    embedUrl = parsed.toString();
  } catch {
    embedUrl = `${url}?hide_gdpr_banner=1&primary_color=2563eb`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendly-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[90vh] max-h-[760px] z-10 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="calendly-modal-title"
                  className="text-sm sm:text-base font-bold text-white tracking-tight"
                >
                  Schedule OfficeX Demo &amp; Consultation
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-semibold text-blue-300">
                  <Sparkles size={10} /> 30 Mins
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Direct session with our senior CRE &amp; FM solutions engineering team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
              title="Open in a new tab"
            >
              <span>New Tab</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/80"
              aria-label="Close scheduling modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Calendly iFrame Container */}
        <div className="relative flex-1 w-full bg-slate-50 overflow-hidden">
          {/* Loading Spinner */}
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">
                Loading available calendar slots...
              </p>
            </div>
          )}

          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule an OfficeX Demo"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
          />
        </div>

        {/* Modal Trust Footer */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 text-slate-500 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">Instant Calendar Sync:</span>
            <span>Google Meet &amp; Zoom calendar invitation delivered immediately</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            No commitment required · Confidential CRE assessment
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Global provider mounted at the application root (layout.tsx)
 * that listens to custom events and clicks on any `[data-calendly]` element.
 */
export default function CalendlyGlobalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState(DEFAULT_CALENDLY_URL);

  useEffect(() => {
    // 1. Custom event listener
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ url?: string }>;
      if (customEvent.detail?.url) {
        setUrl(customEvent.detail.url);
      } else {
        setUrl(DEFAULT_CALENDLY_URL);
      }
      setIsOpen(true);
    };
    window.addEventListener("officex:open-calendly", handleOpenEvent);

    // 2. Click delegation for any element with data-calendly="true"
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const trigger = target?.closest("[data-calendly]");
      if (trigger) {
        e.preventDefault();
        const customUrl = trigger.getAttribute("data-calendly-url");
        if (customUrl) {
          setUrl(customUrl);
        } else {
          setUrl(DEFAULT_CALENDLY_URL);
        }
        setIsOpen(true);
      }
    };
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("officex:open-calendly", handleOpenEvent);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <CalendlyModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      url={url}
    />
  );
}
