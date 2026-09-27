"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Maximize2 } from "lucide-react";

export interface PropertyLayoutSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  linkText?: string;
  imageUrl?: string;
  imageAlt?: string;
  onExploreClick?: () => void;
  className?: string;
}

export default function PropertyLayoutSection({
  eyebrow = "EXPLORE THE ESTATE",
  title = "Property Layout",
  description = "Azur Byron Bay features a main house and a separate rear house, offering a total of 11 bedrooms, 10 bathrooms and space for up to 6 cars. The layout includes spacious living areas, a pool and hot tub, tropical gardens and versatile accommodation options — perfect for families, couples and group getaways.",
  buttonText = "VIEW FULL FLOOR PLAN",
  linkText = "EXPLORE ARCHITECTURAL LAYOUT",
  imageUrl = "https://azurbay.rf.gd/wp-content/uploads/2026/09/Floor-plan-to-attach-scaled.jpeg",
  imageAlt = "Azur Byron Bay Property Layout Floor Plan",
  onExploreClick,
  className = "",
}: PropertyLayoutSectionProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isLightboxOpen, closeLightbox]);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExploreClick) {
      onExploreClick();
    } else {
      openLightbox();
    }
  };

  return (
    <>
      <section className={`azur-layout-section ${className}`}>
        <div className="azur-layout-card">
          {/* LEFT CONTENT */}
          <div className="azur-layout-content">
            <div className="azur-layout-eyebrow">{eyebrow}</div>

            <h2 className="azur-layout-title">{title}</h2>

            <p className="azur-layout-description">{description}</p>

            <button
              type="button"
              className="azur-floorplan-btn group"
              onClick={openLightbox}
            >
              <span>{buttonText}</span>
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>

            <a
              href="#"
              className="azur-layout-link"
              onClick={handleLinkClick}
            >
              {linkText}
            </a>
          </div>

          {/* FLOOR PLAN PREVIEW FRAME */}
          <div
            className="azur-floorplan-frame group"
            onClick={openLightbox}
            role="button"
            tabIndex={0}
            aria-label="Click to enlarge floor plan"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox();
              }
            }}
          >
            {/* Visual zoom indicator */}
            <div className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-xs text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs">
              <Maximize2 size={16} />
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="azur-floorplan-img"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX */}
      {isLightboxOpen && (
        <div
          id="azurFloorplanLightbox"
          className="azur-floorplan-lightbox active"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full size floor plan preview"
        >
          <button
            type="button"
            className="azur-floorplan-close"
            onClick={closeLightbox}
            aria-label="Close floor plan"
          >
            <X size={26} />
          </button>

          <div
            className="relative max-w-[94vw] max-h-[90vh] flex items-center justify-center p-2 bg-white rounded-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="max-w-[92vw] max-h-[86vh] object-contain select-none"
            />
          </div>
        </div>
      )}

      {/* PIXEL-MATCHED STYLES */}
      <style jsx>{`
        .azur-layout-section {
          width: 100vw !important;
          max-width: 100vw !important;
          margin-left: calc(50% - 50vw) !important;
          margin-right: 0 !important;
          padding: 33px 0 32px;
          background: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
        }

        .azur-layout-card {
          width: calc(100% - 100px);
          max-width: 1414px;
          min-height: 636px;
          margin: 0 auto;
          padding: 63px;
          background: #ffffff;
          border: 1px solid #e5ddd7;
          border-radius: 5px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 510px 1fr;
          column-gap: 57px;
          align-items: start;
        }

        .azur-layout-content {
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .azur-layout-eyebrow {
          margin: 0 0 19px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 4px;
          line-height: 1.2;
          color: #987967;
          text-transform: uppercase;
        }

        .azur-layout-title {
          margin: 0 0 31px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 52px;
          font-weight: 400;
          line-height: 1.02;
          color: #292724;
        }

        .azur-layout-description {
          width: 100%;
          max-width: 500px;
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 20px;
          font-weight: 400;
          line-height: 1.72;
          color: #48627b;
        }

        .azur-floorplan-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 310px;
          height: 55px;
          margin-top: 40px;
          box-sizing: border-box;
          border: 1px solid #292724;
          border-radius: 4px;
          background: #ffffff;
          color: #172d40 !important;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-decoration: none !important;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .azur-floorplan-btn:hover {
          background: #987967 !important;
          border-color: #987967 !important;
          color: #ffffff !important;
        }

        .azur-layout-link {
          display: inline-block;
          width: max-content;
          margin-top: 22px;
          padding-bottom: 7px;
          border-bottom: 1px solid #292724;
          color: #172d40 !important;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: 2px;
          text-decoration: none !important;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .azur-layout-link:hover {
          color: #987967 !important;
          border-color: #987967;
        }

        .azur-floorplan-frame {
          position: relative;
          width: 100%;
          height: 508px;
          box-sizing: border-box;
          padding: 48px 34px 27px;
          background: #ffffff;
          border: 1px solid #e5ddd7;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.25s ease;
        }

        .azur-floorplan-frame:hover {
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
        }

        .azur-floorplan-img {
          display: block;
          width: 100%;
          height: 430px;
          object-fit: contain;
          object-position: center;
          margin: 0;
        }

        .azur-floorplan-lightbox {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px;
          background: rgba(20, 20, 20, 0.93);
          box-sizing: border-box;
          animation: azurFadeIn 0.2s ease-out;
        }

        .azur-floorplan-close {
          position: absolute;
          top: 24px;
          right: 30px;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          background: transparent;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .azur-floorplan-close:hover {
          background: #ffffff;
          color: #222222;
        }

        @keyframes azurFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 1100px) {
          .azur-layout-section {
            padding: 30px 0 60px;
          }

          .azur-layout-card {
            width: calc(100% - 50px);
            height: auto;
            min-height: 0;
            padding: 50px;
            grid-template-columns: 1fr;
            row-gap: 45px;
          }

          .azur-layout-content {
            padding-top: 0;
          }

          .azur-layout-description {
            max-width: 700px;
          }

          .azur-floorplan-frame {
            height: auto;
            min-height: 450px;
            padding: 35px;
          }

          .azur-floorplan-img {
            height: auto;
            max-height: none;
          }
        }

        @media (max-width: 767px) {
          .azur-layout-section {
            padding: 20px 0 60px;
          }

          .azur-layout-card {
            width: calc(100% - 28px);
            height: auto;
            padding: 31px 21px 25px;
            grid-template-columns: 1fr;
            row-gap: 35px;
          }

          .azur-layout-eyebrow {
            margin-bottom: 15px;
            font-size: 12px;
            letter-spacing: 3.5px;
          }

          .azur-layout-title {
            margin-bottom: 22px;
            font-size: 42px;
            line-height: 1.02;
          }

          .azur-layout-description {
            font-size: 17px;
            line-height: 1.7;
          }

          .azur-floorplan-btn {
            width: 100%;
            height: 55px;
            margin-top: 30px;
            font-size: 12px;
            letter-spacing: 2px;
          }

          .azur-layout-link {
            margin-top: 21px;
            font-size: 12px;
            letter-spacing: 1.6px;
          }

          .azur-floorplan-frame {
            width: 100%;
            height: auto;
            min-height: 0;
            padding: 18px 10px 16px;
          }

          .azur-floorplan-img {
            width: 100%;
            height: auto;
            max-height: none;
          }

          .azur-floorplan-lightbox {
            padding: 15px;
          }

          .azur-floorplan-close {
            top: 14px;
            right: 14px;
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </>
  );
}
