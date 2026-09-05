"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Database, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Layers,
  Activity
} from "lucide-react";

// 12 Orbit tick marks with exact precomputed coordinates to prevent SSR/client float rounding mismatch
const ORBIT_TICKS = [
  { x1: 70.5, y1: 50, x2: 73.5, y2: 50 },
  { x1: 67.75, y1: 60.25, x2: 70.35, y2: 61.75 },
  { x1: 60.25, y1: 67.75, x2: 61.75, y2: 70.35 },
  { x1: 50, y1: 70.5, x2: 50, y2: 73.5 },
  { x1: 39.75, y1: 67.75, x2: 38.25, y2: 70.35 },
  { x1: 32.25, y1: 60.25, x2: 29.65, y2: 61.75 },
  { x1: 29.5, y1: 50, x2: 26.5, y2: 50 },
  { x1: 32.25, y1: 39.75, x2: 29.65, y2: 38.25 },
  { x1: 39.75, y1: 32.25, x2: 38.25, y2: 29.65 },
  { x1: 50, y1: 29.5, x2: 50, y2: 26.5 },
  { x1: 60.25, y1: 32.25, x2: 61.75, y2: 29.65 },
  { x1: 67.75, y1: 39.75, x2: 70.35, y2: 38.25 },
];

// 14 Core Nodes with exact junction coordinates to ensure 100% deterministic SSR/client markup
const ALL_NODES = [
  { id: "users", name: "Users", category: "IAM & Access", x: 28, y: 14, jx: 38.53, jy: 31.23, animDelay: "0s" },
  { id: "properties", name: "Properties", category: "Asset Master", x: 42, y: 14, jx: 45.23, jy: 28.53, animDelay: "0.25s" },
  { id: "spaces", name: "Spaces", category: "Demising & CAD", x: 58, y: 14, jx: 54.77, jy: 28.53, animDelay: "0.5s" },
  { id: "tenants", name: "Tenants", category: "Occupier CRM", x: 72, y: 14, jx: 61.47, jy: 31.23, animDelay: "0.75s" },
  { id: "assets", name: "Assets", category: "QR Passports", x: 78, y: 34, jx: 69.1, jy: 39.09, animDelay: "1s" },
  { id: "vendors", name: "Vendors", category: "Vetted Partners", x: 80, y: 50, jx: 72, jy: 50, animDelay: "1.25s" },
  { id: "contracts", name: "Contracts", category: "Master SLAs", x: 78, y: 66, jx: 69.1, jy: 60.91, animDelay: "1.5s" },
  { id: "documents", name: "Documents", category: "Encrypted Locker", x: 66, y: 86, jx: 58.94, jy: 70.11, animDelay: "1.75s" },
  { id: "tasks", name: "Tasks", category: "PPM Engine", x: 50, y: 86, jx: 50, jy: 72, animDelay: "2s" },
  { id: "workflow", name: "Workflow", category: "Auto Approvals", x: 34, y: 86, jx: 41.06, jy: 70.11, animDelay: "2.25s" },
  { id: "notifications", name: "Notifications", category: "Live Triggers", x: 22, y: 66, jx: 30.9, jy: 60.91, animDelay: "0s" },
  { id: "audit", name: "Audit", category: "Immutable Trail", x: 20, y: 50, jx: 28, jy: 50, animDelay: "0.25s" },
  { id: "reporting", name: "Reporting", category: "C-Suite BI", x: 22, y: 34, jx: 30.9, jy: 39.09, animDelay: "0.5s" },
  { id: "apis", name: "APIs & Webhooks", category: "ERP Connectors", x: 8, y: 50, jx: 28, jy: 50, animDelay: "0.75s" }
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
      className="relative w-full max-w-[660px] mx-auto flex flex-col items-center select-none py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Radial Interactive Diagram */}
      <div className="relative w-full aspect-[1.12] sm:aspect-[1.15] flex items-center justify-center">
        
        {/* SVG Canvas with Continuous Rotation & Calm Particle Dataflows */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 100 100"
          suppressHydrationWarning
        >
          <defs>
            {/* Soft Rotating Radar Beam Gradient */}
            <radialGradient id="coreBeamGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F8B7D" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#0F8B7D" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0F8B7D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Continuously Rotating Orbital Ring with Tick Marks */}
          <g 
            className="origin-center"
            style={{ 
              transformOrigin: "50px 50px",
              animation: isPaused ? "none" : "spin 36s linear infinite"
            }}
          >
            {/* Concentric Dashed Ring around Core (r=22) */}
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />

            {/* Outer Orbit Ring (r=36) */}
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="0.4"
              strokeDasharray="1 4"
            />

            {/* Orbit tick marks */}
            {ORBIT_TICKS.map((tick, i) => (
              <line
                key={`tick-${i}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#94A3B8"
                strokeWidth="0.5"
                strokeOpacity="0.7"
              />
            ))}
          </g>

          {/* 2. Soft expanding ripple from central core */}
          <circle cx="50" cy="50" r="14" fill="none" stroke="#0F8B7D" strokeWidth="0.4" strokeOpacity="0.35">
            <animate attributeName="r" values="14;23" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* 3. Dynamic Rotating Sweeping Beam Highlight */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="url(#coreBeamGradient)" 
            className="pointer-events-none transition-all duration-500"
          />

          {/* 4. Active Node Indicator Pulse Ring */}
          {currentNode && (
            <circle
              cx={currentNode.x}
              cy={currentNode.y}
              r="3.5"
              fill="none"
              stroke="#0F8B7D"
              strokeWidth="0.6"
              strokeOpacity="0.6"
            >
              <animate attributeName="r" values="3.5;7" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* 5. Connector Lines from Nodes into Core with Active Highlight */}
          {ALL_NODES.map((node) => {
            const isActive = effectiveActiveId === node.id;
            return (
              <g key={`track-${node.id}`}>
                {/* Connector line */}
                <line
                  x1={node.x}
                  y1={node.y}
                  x2="50"
                  y2="50"
                  stroke={isActive ? "#0F8B7D" : "#E2E8F0"}
                  strokeWidth={isActive ? "1.1" : "0.5"}
                  strokeDasharray={isActive ? "none" : "2 2.5"}
                  strokeOpacity={isActive ? "1" : "0.8"}
                  className="transition-all duration-300"
                />

                {/* Dot on the orbit ring junction */}
                <circle
                  cx={node.jx}
                  cy={node.jy}
                  r={isActive ? "1.2" : "0.75"}
                  fill={isActive ? "#0F8B7D" : "#94A3B8"}
                  className="transition-all duration-300"
                />

                {/* Moving Data Particle */}
                <circle 
                  r={isActive ? "1.3" : "0.75"} 
                  fill={isActive ? "#0F8B7D" : "#0F8B7D"} 
                  opacity={isActive ? "1" : "0.6"}
                >
                  <animateMotion
                    path={`M ${node.x} ${node.y} L 50 50`}
                    dur={isActive ? "1.6s" : "3.5s"}
                    repeatCount="indefinite"
                    begin={node.animDelay}
                  />
                </circle>
              </g>
            );
          })}

          {/* Extension line for APIs & Integrations */}
          <line x1="8" y1="50" x2="20" y2="50" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2.5" />
        </svg>

        {/* =========================================================================
            CENTRAL CORE: Dynamic Live Hub with Real-Time Sync Indicator
            ========================================================================= */}
        <div className="relative z-20 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-[#0F8B7D]/15 blur-lg animate-pulse" />

          {/* Core Circle */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-teal-50/95 via-white to-teal-50/80 border-2 border-teal-300 shadow-[0_8px_25px_rgba(15,139,125,0.18)] flex flex-col items-center justify-center p-2 text-center transition-all duration-300">
            <span className="text-[8px] sm:text-[10px] font-extrabold tracking-widest text-[#0F8B7D] uppercase leading-none">
              OFFICEX
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-wider leading-none mt-0.5 sm:mt-1">
              CORE
            </span>

            {/* Dynamic Active Module Pill */}
            <div className="mt-1 sm:mt-1.5 px-2 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[8px] sm:text-[9px] font-extrabold tracking-tight flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span className="truncate max-w-[80px] sm:max-w-[100px]">
                {currentNode ? currentNode.name : "SYNCING"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CIRCULAR NODES AROUND THE CORE (Exact Positions with Active State)
            ========================================================================= */}
        {ALL_NODES.map((node, idx) => {
          const isActive = effectiveActiveId === node.id;
          const isApis = node.id === "apis";

          if (isApis) {
            return (
              <div
                key={node.id}
                style={{ left: "8%", top: "50%" }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setActiveNodeIndex(idx)}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}
              >
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isActive 
                    ? "bg-[#0F8B7D] text-white ring-4 ring-[#0F8B7D]/20 shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"
                }`}>
                  <Database size={15} />
                </div>
                <span className={`text-[8px] sm:text-[10px] font-bold mt-1 text-center leading-tight whitespace-nowrap transition-colors ${
                  isActive ? "text-[#0F8B7D] font-extrabold" : "text-slate-600"
                }`}>
                  APIs &amp;<br />Integrations
                </span>
              </div>
            );
          }

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setActiveNodeIndex(idx)}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
                isActive ? "-translate-y-1 scale-110" : "hover:-translate-y-0.5"
              }`}
            >
              <div
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1 ${
                  isActive
                    ? "border-[#0F8B7D] bg-teal-50/95 text-[#0F8B7D] font-bold shadow-md ring-2 ring-[#0F8B7D]/25"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-teal-300 shadow-2xs"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse" />}
                {node.name}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}
