"use client";

import React, { useEffect } from "react";

export default function BrandingSyncProvider() {
  useEffect(() => {
    function applyColor(color: string) {
      if (!color) return;
      document.documentElement.style.setProperty("--brand-color", color);
      document.documentElement.style.setProperty("--primary-teal", color);
      document.documentElement.style.setProperty("--color-primary-teal", color);
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("officex_brand_color");
      if (stored) {
        applyColor(stored);
      } else {
        // Fetch from settings if not locally cached
        fetch("/api/settings")
          .then((r) => r.json())
          .then((res) => {
            const col = res?.data?.branding?.primary_color;
            if (col) {
              localStorage.setItem("officex_brand_color", col);
              applyColor(col);
            }
          })
          .catch(() => {});
      }

      const handleColorChange = (e: any) => {
        const newCol = e.detail || localStorage.getItem("officex_brand_color");
        if (newCol) applyColor(newCol);
      };

      window.addEventListener("officex_brand_color_change", handleColorChange);
      return () => {
        window.removeEventListener("officex_brand_color_change", handleColorChange);
      };
    }
  }, []);

  return null;
}

