"use client";

import React, { useState } from "react";
import { FileText, Database } from "lucide-react";

export default function CoreArchitectureDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Structured in clean orthogonal groups matching the master wireframe:
  // Top row (4), Right column (3), Bottom row (3), Left column (3)
  const topNodes = [
    { id: "users", name: "Users", x: 28, y: 14 },
    { id: "properties", name: "Properties", x: 42, y: 14 },
    { id: "spaces", name: "Spaces", x: 58, y: 14 },
    { id: "tenants", name: "Tenants", x: 72, y: 14 },
  ];

  const rightNodes = [
    { id: "assets", name: "Assets", x: 78, y: 34 },
    { id: "vendors", name: "Vendors", x: 80, y: 50 },
    { id: "contracts", name: "Contracts", x: 78, y: 66 },
  ];

  const bottomNodes = [
    { id: "workflow", name: "Workflow", x: 34, y: 86 },
    { id: "tasks", name: "Tasks", x: 50, y: 86 },
    { id: "documents", name: "Documents", x: 66, y: 86 },
  ];

  const leftNodes = [
    { id: "reporting", name: "Reporting", x: 22, y: 34 },
    { id: "audit", name: "Audit", x: 20, y: 50 },
    { id: "notifications", name: "Notifications", x: 22, y: 66 },
  ];

  const allNodes = [...topNodes, ...rightNodes, ...bottomNodes, ...leftNodes];

  return (
    <div className="relative w-full max-w-[620px] aspect-[1.15] mx-auto flex items-center justify-center select-none py-2">
      
      {/* SVG Canvas for clean lines and calm subtle data flow */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        
        {/* 1. Single Calm Concentric Dashed Ring around Core (r=22) */}
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {/* 2. Soft expanding ripple from central core */}
        <circle cx="50" cy="50" r="14" fill="none" stroke="#0F8B7D" strokeWidth="0.4" strokeOpacity="0.35">
          <animate attributeName="r" values="14;22" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0" dur="3.5s" repeatCount="indefinite" />
        </circle>

        {/* 3. Subtle tick marks on the orbit ring matching wireframe */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 50 + 20.5 * Math.cos(rad);
          const y1 = 50 + 20.5 * Math.sin(rad);
          const x2 = 50 + 23.5 * Math.cos(rad);
          const y2 = 50 + 23.5 * Math.sin(rad);
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94A3B8"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* 4. Clean Connector Lines from Nodes into Core with Gentle Data Particles */}
        {allNodes.map((node, idx) => {
          const isHovered = hoveredNode === node.id;
          return (
            <g key={`track-${node.id}`}>
              {/* Thin, clean dashed guide line */}
              <line
                x1={node.x}
                y1={node.y}
                x2="50"
                y2="50"
                stroke={isHovered ? "#0F8B7D" : "#E2E8F0"}
                strokeWidth={isHovered ? "0.9" : "0.5"}
                strokeDasharray={isHovered ? "none" : "2 2.5"}
                strokeOpacity={isHovered ? "1" : "0.85"}
                className="transition-colors duration-200"
              />

              {/* Dot on the orbit ring junction */}
              <circle
                cx={50 + 22 * ((node.x - 50) / Math.hypot(node.x - 50, node.y - 50))}
                cy={50 + 22 * ((node.y - 50) / Math.hypot(node.x - 50, node.y - 50))}
                r="0.75"
                fill="#0F8B7D"
                opacity="0.8"
              />

              {/* Gentle, calm data particle moving into the core */}
              <circle r={isHovered ? "1" : "0.75"} fill="#0F8B7D" opacity={isHovered ? "0.95" : "0.7"}>
                <animateMotion
                  path={`M ${node.x} ${node.y} L 50 50`}
                  dur={isHovered ? "2s" : "3.8s"}
                  repeatCount="indefinite"
                  begin={`${(idx * 0.3) % 3}s`}
                />
              </circle>
            </g>
          );
        })}

        {/* 5. Extension tracks for APIs & Integrations (far left at x:7 to Audit at x:20) */}
        <line x1="8" y1="50" x2="20" y2="50" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2.5" />
        <circle r="0.8" fill="#0F8B7D" opacity="0.75">
          <animateMotion path="M 8 50 L 20 50" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* =========================================================================
          CENTRAL CORE: Clean, Soft Teal Glass Hub (Matching Wireframe)
          ========================================================================= */}
      <div className="relative z-20 w-24 h-24 sm:w-36 sm:h-36 rounded-full flex items-center justify-center">
        {/* Soft calm ambient teal glow */}
        <div className="absolute inset-0 rounded-full bg-[#0F8B7D]/10 blur-md" />

        {/* Core Circle with subtle gradient and border */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-b from-teal-50/90 to-white border border-teal-200 shadow-[0_6px_20px_rgba(15,139,125,0.12)] flex flex-col items-center justify-center p-2 sm:p-3 text-center transition-transform hover:scale-102 duration-200">
          <span className="text-[8px] sm:text-[11px] font-bold tracking-widest text-[#0F8B7D] uppercase leading-none">
            OFFICEX
          </span>
          <span className="text-base sm:text-2xl font-black text-[#0F8B7D] tracking-wider leading-none mt-0.5 sm:mt-1">
            CORE
          </span>
        </div>
      </div>

      {/* =========================================================================
          TOP ROW (4 Cards): Users, Properties, Spaces, Tenants
          ========================================================================= */}
      {topNodes.map((node) => (
        <div
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
            hoveredNode === node.id ? "-translate-y-1" : ""
          }`}
        >
          <div
            className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-xs font-semibold whitespace-nowrap bg-white transition-colors duration-200 shadow-2xs ${
              hoveredNode === node.id
                ? "border-[#0F8B7D] text-[#0F8B7D] shadow-sm"
                : "border-slate-200/90 text-slate-700 hover:border-teal-300"
            }`}
          >
            {node.name}
          </div>
        </div>
      ))}

      {/* =========================================================================
          RIGHT COLUMN (3 Cards): Assets, Vendors, Contracts
          ========================================================================= */}
      {rightNodes.map((node) => (
        <div
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
            hoveredNode === node.id ? "-translate-y-1" : ""
          }`}
        >
          <div
            className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-xs font-semibold whitespace-nowrap bg-white transition-colors duration-200 shadow-2xs ${
              hoveredNode === node.id
                ? "border-[#0F8B7D] text-[#0F8B7D] shadow-sm"
                : "border-slate-200/90 text-slate-700 hover:border-teal-300"
            }`}
          >
            {node.name}
          </div>
        </div>
      ))}

      {/* =========================================================================
          BOTTOM ROW (3 Cards): Workflow, Tasks, Documents
          ========================================================================= */}
      {bottomNodes.map((node) => (
        <div
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
            hoveredNode === node.id ? "-translate-y-1" : ""
          }`}
        >
          <div
            className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-xs font-semibold whitespace-nowrap bg-white transition-colors duration-200 shadow-2xs ${
              hoveredNode === node.id
                ? "border-[#0F8B7D] text-[#0F8B7D] shadow-sm"
                : "border-slate-200/90 text-slate-700 hover:border-teal-300"
            }`}
          >
            {node.name}
          </div>
        </div>
      ))}

      {/* =========================================================================
          LEFT COLUMN (3 Cards): Reporting, Audit, Notifications
          ========================================================================= */}
      {leftNodes.map((node) => (
        <div
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 cursor-pointer ${
            hoveredNode === node.id ? "-translate-y-1" : ""
          }`}
        >
          <div
            className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-xs font-semibold whitespace-nowrap bg-white transition-colors duration-200 shadow-2xs ${
              hoveredNode === node.id
                ? "border-[#0F8B7D] text-[#0F8B7D] shadow-sm"
                : "border-slate-200/90 text-slate-700 hover:border-teal-300"
            }`}
          >
            {node.name}
          </div>
        </div>
      ))}

      {/* =========================================================================
          FAR LEFT (APIs & Integrations Circular Card)
          ========================================================================= */}
      <div
        style={{ left: "7%", top: "50%" }}
        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
        onMouseEnter={() => setHoveredNode("audit")}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:border-[#0F8B7D] group-hover:shadow-sm transition-all duration-200">
          <Database size={14} className="text-slate-600 group-hover:text-[#0F8B7D] transition-colors sm:w-4 sm:h-4" />
        </div>
        <span className="text-[8px] sm:text-[10px] font-bold text-slate-700 mt-1 text-center leading-tight whitespace-nowrap group-hover:text-[#0F8B7D] transition-colors">
          APIs &amp;<br />Integrations
        </span>
      </div>

    </div>
  );
}
