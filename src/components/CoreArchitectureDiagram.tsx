"use client";

import React, { useState, useEffect } from "react";

// 14 Orbit tick marks mathematically aligned with each node spoke
const ORBIT_TICKS = [
  { x1: 43.92, y1: 30.11, x2: 43.22, y2: 27.81 }, // properties
  { x1: 56.08, y1: 30.11, x2: 56.78, y2: 27.81 }, // spaces
  { x1: 63.92, y1: 34.54, x2: 65.52, y2: 32.76 }, // tenants
  { x1: 69.0, y1: 41.54, x2: 71.19, y2: 40.56 },  // contracts
  { x1: 70.8, y1: 50.0, x2: 73.2, y2: 50.0 },    // vendors
  { x1: 69.0, y1: 58.46, x2: 71.19, y2: 59.44 },  // assets
  { x1: 63.92, y1: 65.46, x2: 65.52, y2: 67.24 }, // tasks
  { x1: 56.08, y1: 69.89, x2: 56.78, y2: 72.19 }, // documents
  { x1: 43.92, y1: 69.89, x2: 43.22, y2: 72.19 }, // workflow
  { x1: 36.08, y1: 65.46, x2: 34.48, y2: 67.24 }, // notifications
  { x1: 31.0, y1: 58.46, x2: 28.81, y2: 59.44 },  // audit
  { x1: 29.2, y1: 50.0, x2: 26.8, y2: 50.0 },    // apis
  { x1: 31.0, y1: 41.54, x2: 28.81, y2: 40.56 },  // reporting
  { x1: 36.08, y1: 34.54, x2: 34.48, y2: 32.76 }  // users
];

// 14 Core Nodes with mathematically balanced spacing, generous clearances, and full bilateral symmetry
const ALL_NODES = [
  { id: "properties", name: "Properties", category: "Asset Master", x: 38.7, y: 14.6, jx: 43.57, jy: 28.96 },
  { id: "spaces", name: "Spaces", category: "Demising & CAD", x: 61.3, y: 14.6, jx: 56.43, jy: 28.96 },
  { id: "tenants", name: "Tenants", category: "Occupier CRM", x: 75.8, y: 22.5, jx: 64.72, jy: 33.65 },
  { id: "contracts", name: "Contracts", category: "Master SLAs", x: 85.2, y: 35.0, jx: 70.1, jy: 41.05 },
  { id: "vendors", name: "Vendors", category: "Vetted Partners", x: 88.5, y: 50.0, jx: 72.0, jy: 50.0 },
  { id: "assets", name: "Assets", category: "QR Passports", x: 85.2, y: 65.0, jx: 70.1, jy: 58.95 },
  { id: "tasks", name: "Tasks", category: "PPM Engine", x: 75.8, y: 77.5, jx: 64.72, jy: 66.35 },
  { id: "documents", name: "Documents", category: "Encrypted Locker", x: 61.3, y: 85.4, jx: 56.43, jy: 71.04 },
  { id: "workflow", name: "Workflow", category: "Auto Approvals", x: 38.7, y: 85.4, jx: 43.57, jy: 71.04 },
  { id: "notifications", name: "Notifications", category: "Live Triggers", x: 24.2, y: 77.5, jx: 35.28, jy: 66.35 },
  { id: "audit", name: "Audit", category: "Immutable Trail", x: 14.8, y: 65.0, jx: 29.9, jy: 58.95 },
  { id: "apis", name: "APIs & Webhooks", category: "ERP Connectors", x: 11.5, y: 50.0, jx: 28.0, jy: 50.0 },
  { id: "reporting", name: "Reporting", category: "C-Suite BI", x: 14.8, y: 35.0, jx: 29.9, jy: 41.05 },
  { id: "users", name: "Users", category: "IAM & Access", x: 24.2, y: 22.5, jx: 35.28, jy: 33.65 }
];

export default function CoreArchitectureDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  // Auto-Rotation Timer: Advances to next node every 2.4 seconds unless paused or hovered
  useEffect(() => {
    if (isPaused || hoveredNode !== null) return;

    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % ALL_NODES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [isPaused, hoveredNode]);

  const currentNode = ALL_NODES[activeNodeIndex];
  const effectiveActiveId = hoveredNode || currentNode.id;

  return (
    <div 
      className="relative w-full max-w-[530px] mx-auto flex flex-col items-center select-none py-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Radial Interactive Diagram */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        
        {/* SVG Canvas for Spoke Lines and Orbit Ring */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 100 100"
          suppressHydrationWarning
        >
          <defs>
            <radialGradient id="coreBeamGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#0F8B7D" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0F8B7D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Static Concentric Orbit Ring (Clean r=22 without outer ring clutter) */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />

          {/* 2. Soft expanding ambient ripple from central core */}
          <circle cx="50" cy="50" r="14" fill="none" stroke="#0F8B7D" strokeWidth="0.4" strokeOpacity="0.3">
            <animate attributeName="r" values="14;22" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* 3. Soft ambient glow behind core */}
          <circle 
            cx="50" 
            cy="50" 
            r="32" 
            fill="url(#coreBeamGradient)" 
            className="pointer-events-none"
          />

          {/* 4. Orbit Tick Marks aligned with each spoke junction */}
          {ORBIT_TICKS.map((tick, i) => (
            <line
              key={`tick-${i}`}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="#94A3B8"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
          ))}

          {/* 5. 14 Spokes connecting Nodes to Center Hub (All clean uniform subtle dashed lines) */}
          {ALL_NODES.map((node) => {
            return (
              <line
                key={`spoke-${node.id}`}
                x1={node.x}
                y1={node.y}
                x2={node.jx}
                y2={node.jy}
                stroke="#E2E8F0"
                strokeWidth="0.5"
                strokeDasharray="2 2.5"
              />
            );
          })}

          {/* 6. Junction Dots on the Orbit Ring */}
          {ALL_NODES.map((node) => {
            const isActive = effectiveActiveId === node.id;
            return (
              <circle
                key={`junction-${node.id}`}
                cx={node.jx}
                cy={node.jy}
                r={isActive ? "1.2" : "0.7"}
                fill={isActive ? "#0F8B7D" : "#94A3B8"}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* =========================================================================
            CENTRAL CORE: Dynamic Live Hub with Real-Time Sync Indicator
            ========================================================================= */}
        <div className="relative z-20 w-26 h-26 sm:w-32 sm:h-32 rounded-full flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-[#0F8B7D]/15 blur-md animate-pulse" />

          {/* Core Circle */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-teal-50/95 via-white to-teal-50/80 border-2 border-teal-300 shadow-[0_6px_20px_rgba(15,139,125,0.18)] flex flex-col items-center justify-center p-1.5 text-center transition-all duration-300">
            <span className="text-[8px] sm:text-[9.5px] font-extrabold tracking-widest text-[#0F8B7D] uppercase leading-none">
              OFFICEX
            </span>
            <span className="text-base sm:text-xl font-black text-slate-900 tracking-wider leading-none mt-0.5">
              CORE
            </span>

            {/* Dynamic Active Module Pill */}
            <div className="mt-1 px-2 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[8px] sm:text-[9px] font-extrabold tracking-tight flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span className="truncate max-w-[75px] sm:max-w-[95px]">
                {currentNode ? currentNode.name : "SYNCING"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CIRCULAR NODES AROUND THE CORE (Uniform, Beautifully Spaced Pill Badges)
            ========================================================================= */}
        {ALL_NODES.map((node, idx) => {
          const isActive = effectiveActiveId === node.id;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setActiveNodeIndex(idx)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
                isActive ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[8.5px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? "border-[#0F8B7D] bg-white text-[#0F8B7D] font-bold shadow-md ring-2 ring-[#0F8B7D]/25"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-teal-300 shadow-2xs"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse" />}
                <span>{node.name}</span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
