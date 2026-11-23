"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  Minimize2,
  PenTool,
  Merge,
  Scissors,
  Scaling,
  Crop,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Search,
  ArrowRight,
  Bot,
  X,
  Smartphone,
  Layers,
  FileCheck,
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Stamp,
  RotateCw,
  Hash,
  Wrench,
  Contrast,
  Sliders,
  Archive,
} from "lucide-react";
import { ALL_TOOLS, CATEGORIES, ToolCategory } from "@/lib/registry/tools-registry";
import { formatBytes } from "@/lib/utils";

// Icon mapping for dynamic tool cards
const ICON_MAP: Record<string, React.ElementType> = {
  PenTool,
  Minimize2,
  Merge,
  Scissors,
  ArrowUpDown: Sliders,
  RotateCw,
  Hash,
  Stamp,
  Layers,
  Contrast,
  Wrench,
  ImageIcon,
  Scaling,
  Crop,
  RefreshCw,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Sliders,
  Lock,
  Unlock,
  Archive,
};

// ==============================================================
// Intuitive Background & Surface Styling System for Tool Cards
// ==============================================================
interface ToolCardStyle {
  cardBg: string;
  borderClass: string;
  shadowHover: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
}

function getToolCardStyle(toolId: string, category: string): ToolCardStyle {
  if (toolId.includes("edit")) {
    return {
      cardBg: "bg-gradient-to-br from-indigo-50/70 via-white to-white",
      borderClass: "border-indigo-100/90 hover:border-indigo-400",
      shadowHover: "hover:shadow-indigo-500/10",
      iconBg: "bg-indigo-100/70 border border-indigo-200",
      iconColor: "text-indigo-600",
      badgeBg: "bg-indigo-100/80",
      badgeText: "text-indigo-700",
    };
  }
  if (toolId.includes("compress")) {
    return {
      cardBg: "bg-gradient-to-br from-emerald-50/70 via-white to-white",
      borderClass: "border-emerald-100/90 hover:border-emerald-400",
      shadowHover: "hover:shadow-emerald-500/10",
      iconBg: "bg-emerald-100/70 border border-emerald-200",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-100/80",
      badgeText: "text-emerald-700",
    };
  }
  if (toolId.includes("merge")) {
    return {
      cardBg: "bg-gradient-to-br from-sky-50/70 via-white to-white",
      borderClass: "border-sky-100/90 hover:border-sky-400",
      shadowHover: "hover:shadow-sky-500/10",
      iconBg: "bg-sky-100/70 border border-sky-200",
      iconColor: "text-sky-600",
      badgeBg: "bg-sky-100/80",
      badgeText: "text-sky-700",
    };
  }
  if (toolId.includes("split")) {
    return {
      cardBg: "bg-gradient-to-br from-amber-50/70 via-white to-white",
      borderClass: "border-amber-100/90 hover:border-amber-400",
      shadowHover: "hover:shadow-amber-500/10",
      iconBg: "bg-amber-100/70 border border-amber-200",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-100/80",
      badgeText: "text-amber-700",
    };
  }
  if (toolId.includes("sign")) {
    return {
      cardBg: "bg-gradient-to-br from-violet-50/70 via-white to-white",
      borderClass: "border-violet-100/90 hover:border-violet-400",
      shadowHover: "hover:shadow-violet-500/10",
      iconBg: "bg-violet-100/70 border border-violet-200",
      iconColor: "text-violet-600",
      badgeBg: "bg-violet-100/80",
      badgeText: "text-violet-700",
    };
  }
  if (toolId.includes("protect") || toolId.includes("lock")) {
    return {
      cardBg: "bg-gradient-to-br from-emerald-50/70 via-white to-white",
      borderClass: "border-emerald-100/90 hover:border-emerald-400",
      shadowHover: "hover:shadow-emerald-500/10",
      iconBg: "bg-emerald-100/70 border border-emerald-200",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-100/80",
      badgeText: "text-emerald-700",
    };
  }
  if (toolId.includes("rotate")) {
    return {
      cardBg: "bg-gradient-to-br from-cyan-50/70 via-white to-white",
      borderClass: "border-cyan-100/90 hover:border-cyan-400",
      shadowHover: "hover:shadow-cyan-500/10",
      iconBg: "bg-cyan-100/70 border border-cyan-200",
      iconColor: "text-cyan-600",
      badgeBg: "bg-cyan-100/80",
      badgeText: "text-cyan-700",
    };
  }
  if (toolId.includes("page-number")) {
    return {
      cardBg: "bg-gradient-to-br from-blue-50/70 via-white to-white",
      borderClass: "border-blue-100/90 hover:border-blue-400",
      shadowHover: "hover:shadow-blue-500/10",
      iconBg: "bg-blue-100/70 border border-blue-200",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-100/80",
      badgeText: "text-blue-700",
    };
  }
  if (toolId.includes("watermark")) {
    return {
      cardBg: "bg-gradient-to-br from-rose-50/70 via-white to-white",
      borderClass: "border-rose-100/90 hover:border-rose-400",
      shadowHover: "hover:shadow-rose-500/10",
      iconBg: "bg-rose-100/70 border border-rose-200",
      iconColor: "text-rose-600",
      badgeBg: "bg-rose-100/80",
      badgeText: "text-rose-700",
    };
  }
  if (toolId.includes("crop")) {
    return {
      cardBg: "bg-gradient-to-br from-teal-50/70 via-white to-white",
      borderClass: "border-teal-100/90 hover:border-teal-400",
      shadowHover: "hover:shadow-teal-500/10",
      iconBg: "bg-teal-100/70 border border-teal-200",
      iconColor: "text-teal-600",
      badgeBg: "bg-teal-100/80",
      badgeText: "text-teal-700",
    };
  }
  if (toolId.includes("reorder")) {
    return {
      cardBg: "bg-gradient-to-br from-purple-50/70 via-white to-white",
      borderClass: "border-purple-100/90 hover:border-purple-400",
      shadowHover: "hover:shadow-purple-500/10",
      iconBg: "bg-purple-100/70 border border-purple-200",
      iconColor: "text-purple-600",
      badgeBg: "bg-purple-100/80",
      badgeText: "text-purple-700",
    };
  }
  if (toolId.includes("grayscale")) {
    return {
      cardBg: "bg-gradient-to-br from-slate-100/70 via-white to-white",
      borderClass: "border-slate-200 hover:border-slate-400",
      shadowHover: "hover:shadow-slate-400/10",
      iconBg: "bg-slate-100 border border-slate-200",
      iconColor: "text-slate-700",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-700",
    };
  }
  if (category === "image") {
    return {
      cardBg: "bg-gradient-to-br from-rose-50/60 via-white to-white",
      borderClass: "border-rose-100/90 hover:border-rose-400",
      shadowHover: "hover:shadow-rose-500/10",
      iconBg: "bg-rose-100/70 border border-rose-200",
      iconColor: "text-rose-600",
      badgeBg: "bg-rose-100/80",
      badgeText: "text-rose-700",
    };
  }
  if (category === "convert") {
    return {
      cardBg: "bg-gradient-to-br from-teal-50/60 via-white to-white",
      borderClass: "border-teal-100/90 hover:border-teal-400",
      shadowHover: "hover:shadow-teal-500/10",
      iconBg: "bg-teal-100/70 border border-teal-200",
      iconColor: "text-teal-600",
      badgeBg: "bg-teal-100/80",
      badgeText: "text-teal-700",
    };
  }
  return {
    cardBg: "bg-gradient-to-br from-slate-50/70 via-white to-white",
    borderClass: "border-slate-200 hover:border-indigo-400",
    shadowHover: "hover:shadow-indigo-500/10",
    iconBg: "bg-slate-100 border border-slate-200",
    iconColor: "text-slate-700",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  };
}

// ==============================================================
// Visual Background Illustrations: Helps Users Understand Tools
// ==============================================================
function ToolCardIllustration({ toolId, category }: { toolId: string; category: string }) {
  if (toolId.includes("edit")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-500 fill-none" strokeWidth="1.5">
        <path d="M46 22 H88 L104 38 V100 C104 104 101 107 97 107 H46 C42 107 39 104 39 100 V29 C39 25 42 22 46 22 Z" className="fill-indigo-50/70 stroke-indigo-200" strokeWidth="1.3" />
        <path d="M88 22 V38 H104" className="fill-indigo-100/80 stroke-indigo-300" strokeWidth="1.3" />
        <line x1="48" y1="46" x2="80" y2="46" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-300/80" />
        <line x1="48" y1="56" x2="72" y2="56" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-200" />
        <line x1="48" y1="66" x2="88" y2="66" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-200" />
        <path d="M38 92 C 54 80, 62 98, 82 84" strokeWidth="2.5" strokeLinecap="round" className="stroke-indigo-600" />
        <circle cx="54" cy="83" r="2.5" className="fill-indigo-600 stroke-none" />
        <circle cx="82" cy="84" r="2.5" className="fill-indigo-600 stroke-none" />
        <g transform="translate(82, 70) rotate(45)">
          <path d="M0 0 L5 12 L0 18 L-5 12 Z" className="fill-indigo-600 stroke-indigo-700" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="12" stroke="white" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  if (toolId.includes("compress")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-emerald-500 fill-none" strokeWidth="1.5">
        <rect x="36" y="24" width="70" height="74" rx="8" className="stroke-emerald-200 fill-emerald-50/40" strokeDasharray="3 3" />
        <rect x="52" y="38" width="38" height="46" rx="6" className="stroke-emerald-500 fill-emerald-100/60" strokeWidth="1.8" />
        <path d="M40 61 H50 M50 61 L46 57 M50 61 L46 65" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600" />
        <path d="M102 61 H92 M92 61 L96 57 M92 61 L96 65" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600" />
        <path d="M71 28 V36 M71 36 L67 32 M71 36 L75 32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600" />
        <path d="M71 94 V86 M71 86 L67 90 M71 86 L75 90" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600" />
        <rect x="59" y="54" width="24" height="14" rx="4" className="fill-emerald-600 stroke-none" />
        <text x="71" y="64" textAnchor="middle" className="text-[9px] font-bold fill-white stroke-none font-sans">KB</text>
      </svg>
    );
  }

  if (toolId.includes("merge")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-sky-500 fill-none" strokeWidth="1.5">
        <rect x="34" y="22" width="46" height="58" rx="6" className="fill-sky-50/70 stroke-sky-300" strokeWidth="1.3" />
        <line x1="42" y1="34" x2="68" y2="34" strokeWidth="1.8" strokeLinecap="round" className="stroke-sky-200" />
        <line x1="42" y1="44" x2="62" y2="44" strokeWidth="1.8" strokeLinecap="round" className="stroke-sky-200" />
        <g transform="translate(68, 52)">
          <circle cx="0" cy="0" r="8.5" className="fill-sky-500 stroke-white" strokeWidth="1.5" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <rect x="58" y="44" width="48" height="60" rx="6" className="fill-white stroke-sky-500" strokeWidth="2" />
        <line x1="68" y1="58" x2="94" y2="58" strokeWidth="2" strokeLinecap="round" className="stroke-sky-400" />
        <line x1="68" y1="68" x2="90" y2="68" strokeWidth="2" strokeLinecap="round" className="stroke-sky-300" />
        <line x1="68" y1="78" x2="84" y2="78" strokeWidth="2" strokeLinecap="round" className="stroke-sky-300" />
        <path d="M58 54 H62 V84 H58 Z" className="fill-sky-500 stroke-none" />
      </svg>
    );
  }

  if (toolId.includes("split")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-amber-500 fill-none" strokeWidth="1.5">
        <path d="M34 26 C34 23 37 20 40 20 H62 V100 H40 C37 100 34 97 34 94 Z" className="fill-amber-50/60 stroke-amber-300" strokeWidth="1.4" />
        <line x1="42" y1="36" x2="56" y2="36" strokeWidth="1.8" strokeLinecap="round" className="stroke-amber-200" />
        <line x1="42" y1="48" x2="54" y2="48" strokeWidth="1.8" strokeLinecap="round" className="stroke-amber-200" />
        <path d="M74 20 H98 C101 20 104 23 104 26 V94 C104 97 101 100 98 100 H74 Z" className="fill-white stroke-amber-500" strokeWidth="1.8" />
        <line x1="82" y1="36" x2="96" y2="36" strokeWidth="1.8" strokeLinecap="round" className="stroke-amber-300" />
        <line x1="82" y1="48" x2="94" y2="48" strokeWidth="1.8" strokeLinecap="round" className="stroke-amber-300" />
        <line x1="68" y1="16" x2="68" y2="104" strokeWidth="2" strokeDasharray="3 3" className="stroke-amber-400" />
        <g transform="translate(68, 58) scale(0.9)">
          <circle cx="-6" cy="-6" r="3.5" className="stroke-amber-600 fill-none" strokeWidth="1.5" />
          <circle cx="-6" cy="6" r="3.5" className="stroke-amber-600 fill-none" strokeWidth="1.5" />
          <path d="M-3 -4 L8 6 M-3 4 L8 -6" strokeWidth="1.8" strokeLinecap="round" className="stroke-amber-600" />
        </g>
      </svg>
    );
  }

  if (toolId.includes("reorder")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-violet-500 fill-none" strokeWidth="1.5">
        <rect x="42" y="18" width="46" height="56" rx="5" className="fill-violet-50/50 stroke-violet-200" strokeWidth="1.2" />
        <rect x="52" y="32" width="46" height="56" rx="5" className="fill-violet-100/50 stroke-violet-300" strokeWidth="1.4" />
        <rect x="62" y="46" width="46" height="56" rx="6" className="fill-white stroke-violet-500" strokeWidth="1.8" />
        <text x="85" y="79" textAnchor="middle" className="text-sm font-black fill-violet-600 stroke-none font-mono">1</text>
        <path d="M36 50 C28 64, 28 76, 40 88" strokeWidth="2.2" strokeLinecap="round" className="stroke-violet-600" />
        <path d="M40 88 L32 86 M40 88 L38 80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-violet-600" />
        <path d="M48 60 C54 48, 54 40, 44 30" strokeWidth="2.2" strokeLinecap="round" className="stroke-violet-400" />
        <path d="M44 30 L52 32 M44 30 L46 38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-violet-400" />
      </svg>
    );
  }

  if (toolId.includes("rotate")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-cyan-500 fill-none" strokeWidth="1.5">
        <rect x="54" y="34" width="42" height="52" rx="5" transform="rotate(22 75 60)" className="fill-cyan-50/50 stroke-cyan-200" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x="54" y="34" width="42" height="52" rx="5" className="fill-white stroke-cyan-500" strokeWidth="1.8" />
        <line x1="62" y1="46" x2="86" y2="46" strokeWidth="1.8" strokeLinecap="round" className="stroke-cyan-300" />
        <line x1="62" y1="54" x2="80" y2="54" strokeWidth="1.8" strokeLinecap="round" className="stroke-cyan-200" />
        <path d="M75 16 A 46 46 0 0 1 112 60" strokeWidth="2.4" strokeLinecap="round" className="stroke-cyan-500" />
        <path d="M112 60 L106 52 M112 60 L118 54" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-cyan-600" />
        <circle cx="75" cy="60" r="3" className="fill-cyan-500 stroke-none" />
        <text x="96" y="28" className="text-[10px] font-bold fill-cyan-600 stroke-none font-mono">90°</text>
      </svg>
    );
  }

  if (toolId.includes("page-number")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-blue-500 fill-none" strokeWidth="1.5">
        <rect x="42" y="20" width="62" height="82" rx="6" className="fill-white stroke-blue-500" strokeWidth="1.8" />
        <line x1="50" y1="32" x2="96" y2="32" strokeWidth="1.2" strokeDasharray="2 2" className="stroke-blue-200" />
        <line x1="50" y1="44" x2="96" y2="44" strokeWidth="1.8" strokeLinecap="round" className="stroke-blue-200" />
        <line x1="50" y1="54" x2="88" y2="54" strokeWidth="1.8" strokeLinecap="round" className="stroke-blue-200" />
        <line x1="50" y1="64" x2="92" y2="64" strokeWidth="1.8" strokeLinecap="round" className="stroke-blue-200" />
        <rect x="60" y="82" width="26" height="12" rx="3" className="fill-blue-500 stroke-none" />
        <text x="73" y="91" textAnchor="middle" className="text-[8.5px] font-bold fill-white stroke-none font-mono">1 / 12</text>
      </svg>
    );
  }

  if (toolId.includes("watermark")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-rose-500 fill-none" strokeWidth="1.5">
        <rect x="42" y="20" width="60" height="80" rx="6" className="fill-white stroke-rose-200" strokeWidth="1.4" />
        <line x1="50" y1="36" x2="92" y2="36" strokeWidth="1.8" strokeLinecap="round" className="stroke-rose-100" />
        <line x1="50" y1="48" x2="84" y2="48" strokeWidth="1.8" strokeLinecap="round" className="stroke-rose-100" />
        <line x1="50" y1="60" x2="90" y2="60" strokeWidth="1.8" strokeLinecap="round" className="stroke-rose-100" />
        <line x1="50" y1="72" x2="80" y2="72" strokeWidth="1.8" strokeLinecap="round" className="stroke-rose-100" />
        <g transform="translate(72, 60) rotate(-32)">
          <rect x="-44" y="-12" width="88" height="24" rx="4" className="fill-rose-50 stroke-rose-500" strokeWidth="1.8" strokeDasharray="4 2" />
          <text x="0" y="4" textAnchor="middle" className="text-[9px] font-black fill-rose-600 stroke-none font-sans uppercase tracking-widest">SAMPLE</text>
        </g>
      </svg>
    );
  }

  if (toolId.includes("crop")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-teal-500 fill-none" strokeWidth="1.5">
        <rect x="36" y="26" width="68" height="68" rx="6" className="fill-teal-50/40 stroke-teal-200" strokeDasharray="3 3" />
        <line x1="58" y1="26" x2="58" y2="94" strokeWidth="1" strokeDasharray="2 2" className="stroke-teal-200" />
        <line x1="82" y1="26" x2="82" y2="94" strokeWidth="1" strokeDasharray="2 2" className="stroke-teal-200" />
        <line x1="36" y1="48" x2="104" y2="48" strokeWidth="1" strokeDasharray="2 2" className="stroke-teal-200" />
        <line x1="36" y1="72" x2="104" y2="72" strokeWidth="1" strokeDasharray="2 2" className="stroke-teal-200" />
        <path d="M44 38 H34 V48" strokeWidth="2.5" strokeLinecap="round" className="stroke-teal-600" />
        <path d="M96 38 H106 V48" strokeWidth="2.5" strokeLinecap="round" className="stroke-teal-600" />
        <path d="M44 82 H34 V72" strokeWidth="2.5" strokeLinecap="round" className="stroke-teal-600" />
        <path d="M96 82 H106 V72" strokeWidth="2.5" strokeLinecap="round" className="stroke-teal-600" />
      </svg>
    );
  }

  if (toolId.includes("resize")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-500 fill-none" strokeWidth="1.5">
        <rect x="38" y="28" width="66" height="62" rx="6" className="fill-indigo-50/40 stroke-indigo-400" strokeWidth="1.8" />
        <rect x="34" y="24" width="7" height="7" rx="1.5" className="fill-indigo-600 stroke-white" strokeWidth="1" />
        <rect x="100" y="24" width="7" height="7" rx="1.5" className="fill-indigo-600 stroke-white" strokeWidth="1" />
        <rect x="34" y="86" width="7" height="7" rx="1.5" className="fill-indigo-600 stroke-white" strokeWidth="1" />
        <rect x="100" y="86" width="7" height="7" rx="1.5" className="fill-indigo-600 stroke-white" strokeWidth="1" />
        <path d="M50 59 H92 M50 59 L56 55 M50 59 L56 63 M92 59 L86 55 M92 59 L86 63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-indigo-600" />
        <text x="71" y="52" textAnchor="middle" className="text-[9px] font-bold fill-indigo-600 stroke-none font-mono">1920 × 1080</text>
      </svg>
    );
  }

  if (toolId.includes("sign")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-violet-500 fill-none" strokeWidth="1.5">
        <rect x="42" y="20" width="62" height="82" rx="6" className="fill-white stroke-violet-300" strokeWidth="1.5" />
        <line x1="50" y1="34" x2="86" y2="34" strokeWidth="1.8" strokeLinecap="round" className="stroke-violet-200" />
        <line x1="50" y1="46" x2="94" y2="46" strokeWidth="1.8" strokeLinecap="round" className="stroke-violet-200" />
        <line x1="50" y1="84" x2="96" y2="84" strokeWidth="1.5" strokeDasharray="3 2" className="stroke-violet-400" />
        <text x="52" y="82" className="text-[10px] font-bold fill-violet-400 stroke-none font-serif italic">X</text>
        <path d="M58 80 Q64 62, 70 76 T82 66 T94 78" strokeWidth="2.2" strokeLinecap="round" className="stroke-violet-600" />
        <g transform="translate(92, 62) rotate(35)">
          <path d="M0 0 L4 12 L0 18 L-4 12 Z" className="fill-violet-600 stroke-none" />
        </g>
      </svg>
    );
  }

  if (toolId.includes("protect") || toolId.includes("lock")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-emerald-500 fill-none" strokeWidth="1.5">
        <rect x="36" y="24" width="56" height="74" rx="5" className="fill-emerald-50/40 stroke-emerald-200" strokeWidth="1.4" />
        <rect x="58" y="52" width="46" height="38" rx="8" className="fill-white stroke-emerald-600" strokeWidth="2" />
        <path d="M68 52 V40 C68 33 74 28 81 28 C88 28 94 33 94 40 V52" strokeWidth="2.5" strokeLinecap="round" className="stroke-emerald-600 fill-none" />
        <circle cx="81" cy="68" r="3.5" className="fill-emerald-600 stroke-none" />
        <path d="M79.5 69 L82.5 69 L83.5 78 L78.5 78 Z" className="fill-emerald-600 stroke-none" />
      </svg>
    );
  }

  if (toolId.includes("flatten")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-500 fill-none" strokeWidth="1.5">
        <path d="M40 36 L76 22 L104 36 L68 50 Z" className="fill-indigo-100/60 stroke-indigo-300" strokeWidth="1.2" />
        <path d="M40 52 L76 38 L104 52 L68 66 Z" className="fill-indigo-200/50 stroke-indigo-400" strokeWidth="1.4" />
        <path d="M72 44 V68 M72 68 L68 62 M72 68 L76 62" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-indigo-600" />
        <path d="M40 76 L76 62 L104 76 L68 90 Z" className="fill-white stroke-indigo-600" strokeWidth="2.2" />
      </svg>
    );
  }

  if (toolId.includes("grayscale")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-slate-500 fill-none" strokeWidth="1.5">
        <rect x="40" y="22" width="60" height="78" rx="6" className="fill-white stroke-slate-300" strokeWidth="1.5" />
        <circle cx="70" cy="60" r="22" className="stroke-slate-500" strokeWidth="2" />
        <path d="M70 38 A 22 22 0 0 1 70 82 Z" className="fill-slate-600 stroke-none" />
        <line x1="70" y1="38" x2="70" y2="82" strokeWidth="2" className="stroke-slate-600" />
      </svg>
    );
  }

  if (toolId.includes("extract")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-teal-500 fill-none" strokeWidth="1.5">
        <rect x="36" y="22" width="56" height="76" rx="6" className="fill-teal-50/40 stroke-teal-300" strokeWidth="1.4" />
        <line x1="44" y1="36" x2="80" y2="36" strokeWidth="2" strokeLinecap="round" className="stroke-teal-200" />
        <line x1="44" y1="46" x2="72" y2="46" strokeWidth="2" strokeLinecap="round" className="stroke-teal-200" />
        <circle cx="76" cy="64" r="16" className="fill-white stroke-teal-600" strokeWidth="2" />
        <line x1="88" y1="76" x2="102" y2="90" strokeWidth="3" strokeLinecap="round" className="stroke-teal-700" />
        <text x="76" y="69" textAnchor="middle" className="text-xs font-black fill-teal-600 stroke-none font-mono">TXT</text>
      </svg>
    );
  }

  if (toolId.includes("metadata")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-emerald-500 fill-none" strokeWidth="1.5">
        <rect x="36" y="24" width="54" height="72" rx="5" className="fill-emerald-50/40 stroke-emerald-200" strokeWidth="1.3" />
        <path d="M66 42 L84 34 L102 42 C102 62 84 76 84 76 C84 76 66 62 66 42 Z" className="fill-white stroke-emerald-600" strokeWidth="2" />
        <path d="M76 54 L82 60 L92 48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600" />
        <text x="44" y="80" className="text-[9px] font-mono font-bold fill-emerald-600 stroke-none">EXIF</text>
      </svg>
    );
  }

  if (toolId.includes("to-images") || toolId.includes("images-to-pdf")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-teal-500 fill-none" strokeWidth="1.5">
        <rect x="32" y="24" width="42" height="54" rx="5" className="fill-teal-50/60 stroke-teal-300" strokeWidth="1.4" />
        <text x="53" y="52" textAnchor="middle" className="text-[9px] font-bold fill-teal-600 stroke-none font-mono">PDF</text>
        <rect x="58" y="44" width="48" height="52" rx="6" className="fill-white stroke-teal-500" strokeWidth="1.8" />
        <circle cx="70" cy="58" r="4" className="fill-amber-400 stroke-none" />
        <path d="M60 86 L74 68 L86 82 L92 76 L104 88 H60 Z" className="fill-teal-100 stroke-teal-400" strokeWidth="1" />
      </svg>
    );
  }

  if (category === "convert" || toolId.includes("convert")) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full text-teal-500 fill-none" strokeWidth="1.5">
        <rect x="30" y="28" width="38" height="48" rx="5" className="fill-teal-50 stroke-teal-400" strokeWidth="1.5" />
        <text x="49" y="56" textAnchor="middle" className="text-[10px] font-bold fill-teal-700 stroke-none font-mono">DOC</text>
        <rect x="68" y="46" width="38" height="48" rx="5" className="fill-white stroke-teal-600" strokeWidth="2" />
        <text x="87" y="74" textAnchor="middle" className="text-[10px] font-black fill-teal-600 stroke-none font-mono">PDF</text>
        <path d="M64 36 C74 36, 80 40, 80 44" strokeWidth="2" strokeLinecap="round" className="stroke-teal-600" />
        <path d="M80 44 L76 40 M80 44 L84 40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-teal-600" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-500 fill-none" strokeWidth="1.5">
      <rect x="42" y="22" width="58" height="76" rx="6" className="fill-indigo-50/50 stroke-indigo-300" strokeWidth="1.5" />
      <line x1="50" y1="36" x2="88" y2="36" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-200" />
      <line x1="50" y1="48" x2="78" y2="48" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-200" />
      <line x1="50" y1="60" x2="84" y2="60" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-200" />
      <circle cx="82" cy="74" r="10" className="fill-white stroke-indigo-500" strokeWidth="1.8" />
      <path d="M78 74 L86 74 M82 70 L82 78" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-600" />
    </svg>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [detectedFile, setDetectedFile] = useState<{ file: File; kind: string } | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File Drop / Selection handler
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const name = selected.name.toLowerCase();
      let kind = "unknown";
      if (name.endsWith(".pdf") || selected.type === "application/pdf") {
        kind = "pdf";
      } else if (
        selected.type.startsWith("image/") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".heic")
      ) {
        kind = "image";
      }
      setDetectedFile({ file: selected, kind });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      const name = selected.name.toLowerCase();
      let kind = "unknown";
      if (name.endsWith(".pdf") || selected.type === "application/pdf") {
        kind = "pdf";
      } else if (
        selected.type.startsWith("image/") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".heic")
      ) {
        kind = "image";
      }
      setDetectedFile({ file: selected, kind });
    }
  };

  // Instant Sample Fixture loader
  const handleLoadSample = async (url: string, filename: string, kind: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], filename, {
        type: kind === "pdf" ? "application/pdf" : "image/jpeg",
      });
      setDetectedFile({ file, kind });
    } catch {
      const fake = new File(["sample content"], filename, {
        type: kind === "pdf" ? "application/pdf" : "image/jpeg",
      });
      setDetectedFile({ file: fake, kind });
    }
  };

  // Filter tools based on query & category
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="relative w-full bg-[#F8FAFC] text-slate-900 min-h-screen overflow-hidden">
      {/* Ambient Radial Mesh Lights */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-indigo-50/70 via-purple-50/30 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-8 left-1/4 w-[500px] h-[250px] bg-indigo-200/25 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-16 right-1/4 w-[400px] h-[250px] bg-violet-200/20 blur-[120px] pointer-events-none -z-10" />

      {/* ============================================================== */}
      {/* 1. Compact 2-Column Hero Section                              */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-5 pb-5 sm:pt-7 sm:pb-7 border-b border-slate-200/80 bg-gradient-to-b from-white/90 via-white/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Column: 1-Line Headline, 1-Line Subtitle, 1-Line Tags & Search */}
            <div className="lg:col-span-7 space-y-3.5 text-left">
              {/* Privacy Guarantee Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-800 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>100% In-Browser &bull; Zero Server Uploads</span>
              </div>

              {/* Main Headline: Strictly 1 Line */}
              <div className="space-y-1">
                <h1 className="text-[19px] xs:text-xl sm:text-2xl lg:text-[28px] xl:text-[32px] font-black tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950 bg-clip-text text-transparent">
                    All-in-One Document & Photo Suite
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  100% On-Device &bull; Edit, compress, convert & sign files directly in your browser.
                </p>
              </div>

              {/* 3 Bullets strictly in 1 Single Line with refined pill badges */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap text-[11px] sm:text-xs font-semibold">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-indigo-700 shadow-2xs shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </span>
                  <span>PDF Editor & Form Fill</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-emerald-700 shadow-2xs shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </span>
                  <span>Target KB Compress</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50/80 border border-sky-200/70 text-sky-700 shadow-2xs shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </span>
                  <span>PDF, Office & Image Converter</span>
                </div>
              </div>

              {/* Unified Search & AI Prompt Bar (Compact) */}
              <div className="pt-1 max-w-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aiQuery.trim() && typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("open-ai-assistant", {
                          detail: { query: aiQuery.trim() },
                        })
                      );
                      setAiQuery("");
                    }
                  }}
                  className="relative flex items-center p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100/70 transition-all"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mr-1.5 ml-1">
                    <Search className="w-3.5 h-3.5" />
                  </div>

                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => {
                      setAiQuery(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search 30+ tools or ask AI..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1 px-1 font-normal min-w-0"
                  />

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm shadow-indigo-500/25"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </form>

                {/* Popular Tool Quick-Pills (Single line) */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5 text-xs text-slate-500">
                  <span className="text-slate-400 text-[11px] font-semibold shrink-0">Quick jump:</span>
                  {[
                    { label: "Compress PDF", query: "Compress PDF" },
                    { label: "Edit PDF", query: "Edit PDF" },
                    { label: "Merge PDF", query: "Merge PDF" },
                    { label: "Convert HEIC", query: "Convert HEIC" },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(p.query);
                        setAiQuery(p.query);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition-all shrink-0 cursor-pointer text-[11px] font-medium shadow-2xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Compact Dropzone Card */}
            <div className="lg:col-span-5">
              {!detectedFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/80 border-2 border-dashed border-indigo-200/90 hover:border-indigo-500 hover:bg-indigo-50/20 shadow-[0_12px_32px_-4px_rgba(99,102,241,0.08)] p-5 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 group cursor-pointer"
                >
                  {/* Floating 3D Upload Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Drop file here
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      PDF, Office, JPG, PNG & HEIC &bull; 100% private
                    </p>
                  </div>

                  {/* Hidden File Input & Primary CTA Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept=".pdf,image/*,.heic,.heif,.docx,.xlsx,.pptx"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  {/* Instant Sample Test Fixtures */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 text-xs w-full">
                    <span className="text-slate-400 text-[10.5px] font-semibold mr-1">Samples:</span>
                    {[
                      { name: "sample_id_card.pdf", url: "/test-files/sample_id_card.pdf", label: "💳 ID Card", kind: "pdf" },
                      { name: "sample_scanned_contract_large.pdf", url: "/test-files/sample_scanned_contract_large.pdf", label: "📄 Contract", kind: "pdf" },
                      { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "📸 Portrait", kind: "image" },
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                        className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-[10.5px] transition-colors cursor-pointer font-medium shadow-2xs"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Contextual Smart Action Card */
                <div className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-lg shadow-indigo-500/5 flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        {detectedFile.kind === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{detectedFile.file.name}</p>
                        <p className="text-slate-500 text-[10px]">
                          {formatBytes(detectedFile.file.size)} &bull; {detectedFile.kind.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetectedFile(null)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                    >
                      <X className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider">
                      Recommended Actions:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detectedFile.kind === "pdf" ? (
                        <>
                          <Link
                            href="/pdf/edit"
                            className="col-span-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:border-indigo-500 text-indigo-950 font-bold flex items-center justify-between transition-colors text-xs"
                          >
                            <span className="flex items-center gap-1.5">
                              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Edit PDF Studio (Text & Ink)</span>
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold uppercase">
                              Open &rarr;
                            </span>
                          </Link>
                          <Link href="/pdf/compress" className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Minimize2 className="w-3.5 h-3.5 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/pdf/split" className="p-2 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Scissors className="w-3.5 h-3.5 text-amber-700" /> Split Pages
                          </Link>
                          <Link href="/pdf/merge" className="p-2 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Merge className="w-3.5 h-3.5 text-sky-700" /> Merge PDFs
                          </Link>
                          <Link href="/security/sign" className="p-2 rounded-xl bg-violet-50 border border-violet-200 hover:border-violet-400 text-violet-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <PenTool className="w-3.5 h-3.5 text-violet-700" /> E-Sign PDF
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/image/compress" className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Minimize2 className="w-3.5 h-3.5 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/image/resize" className="p-2 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Scaling className="w-3.5 h-3.5 text-sky-700" /> Resize Photo
                          </Link>
                          <Link href="/image/convert" className="p-2 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <RefreshCw className="w-3.5 h-3.5 text-amber-700" /> Convert Format
                          </Link>
                          <Link href="/pdf/images-to-pdf" className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <FileText className="w-3.5 h-3.5 text-indigo-700" /> Turn to PDF
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. Slim 1-Line Trust Strip                                    */}
      {/* ============================================================== */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md py-2 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center sm:justify-around gap-2 overflow-x-auto sm:overflow-visible scrollbar-none py-0.5 text-[11px] text-slate-700 font-semibold whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-800 shrink-0">
            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>WebAssembly Native Speed</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Private (Zero Cloud Uploads)</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50/80 border border-sky-200/60 text-sky-800 shrink-0">
            <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>PDF, Word, Excel, HEIC & Images</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50/80 border border-violet-200/60 text-violet-800 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span>100% Free &bull; No File Limits</span>
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. The Tool Catalog (Directly Visible Above The Fold!)        */}
      {/* ============================================================== */}
      <section className="py-7 sm:py-10 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 sm:pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>All Document & Image</span>
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Tools</span>
              </h2>
              <p className="text-slate-500 text-xs">
                Select a tool below or drop a file to process immediately with zero server latency.
              </p>
            </div>

            {/* Category Filter Tabs (Segmented Capsule) */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/60 backdrop-blur-md border border-slate-200/90 overflow-x-auto scrollbar-none shadow-inner max-w-full">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                }`}
              >
                All ({ALL_TOOLS.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = ALL_TOOLS.filter((t) => t.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60" : "bg-slate-200/80 text-slate-500 font-mono"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Tool Grid (Refined Cards with Enhanced Illustrations) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.iconName] || FileText;
              const style = getToolCardStyle(tool.id, tool.category);

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group relative flex flex-col p-3.5 sm:p-5 rounded-2xl ${style.cardBg} border ${style.borderClass} ${style.shadowHover} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer overflow-hidden backdrop-blur-xs`}
                >
                  {/* Intuitive Thematic Background Illustration */}
                  <div className="absolute -top-1 -right-1 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none select-none overflow-hidden opacity-40 group-hover:opacity-95 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                    <ToolCardIllustration toolId={tool.id} category={tool.category} />
                  </div>

                  {/* Top: Icon + Badge */}
                  <div className="relative z-10 flex items-start justify-between gap-1.5 mb-2.5 sm:mb-3">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-2xs ${style.iconBg} ${style.iconColor}`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {tool.badge && (
                      <span
                        className={`text-[8.5px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs ${style.badgeBg} ${style.badgeText}`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 flex-1 space-y-0.5 sm:space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between leading-snug line-clamp-1">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600 shrink-0 hidden sm:block" />
                    </h3>
                    <p className="text-slate-500 text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Bottom: 100% On-Device Badge */}
                  <div className="relative z-10 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600 truncate text-[9.5px] sm:text-[10px] font-medium">
                        100% On-Device
                      </span>
                    </span>

                    <span className="hidden xs:inline-block text-[9px] text-slate-400 uppercase font-mono font-semibold tracking-wider shrink-0">
                      {tool.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. Architecture & Security Comparison (Executive Matrix)       */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 border-t border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Architectural Advantage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              IntekEdit vs Traditional Cloud PDF Converters
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              How our zero-upload client-side architecture compares to typical server-based conversion sites.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Mobile swipe hint */}
            <div className="sm:hidden py-2 px-4 bg-slate-50/90 border-b border-slate-200/80 text-[10.5px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <span>← Swipe table horizontally →</span>
            </div>

            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs min-w-[540px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-5 sm:px-6 font-semibold">Feature / Metric</th>
                    <th className="py-3.5 px-5 sm:px-6 font-bold text-indigo-700 bg-indigo-50/60 border-x border-indigo-100">
                      IntekEdit (Local-First Engine)
                    </th>
                    <th className="py-3.5 px-5 sm:px-6 font-semibold text-slate-400">Traditional Cloud Converters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span>Document Privacy</span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-indigo-900 font-bold bg-indigo-50/40 border-x border-indigo-100">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        100% In-Browser RAM (0 B Uploaded)
                      </span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-slate-500">
                      Uploaded & stored on remote cloud servers
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span>Daily Tasks & Limits</span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-indigo-900 font-bold bg-indigo-50/40 border-x border-indigo-100">
                      <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Unlimited & Forever Free
                      </span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-slate-500">
                      Capped at 1-2 free conversions per day
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                        <Minimize2 className="w-4 h-4" />
                      </div>
                      <span>File Size Limits</span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-indigo-900 font-bold bg-indigo-50/40 border-x border-indigo-100">
                      Gigabyte-Scale (Bounded by Device RAM)
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-slate-500">
                      Strict 50MB - 100MB cloud upload caps
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Watermarks & Ads</span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-indigo-900 font-bold bg-indigo-50/40 border-x border-indigo-100">
                      <span className="text-emerald-700 font-bold">Zero Watermarks • Zero Spam Ads</span>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-slate-500">
                      Forced watermarks or ad-heavy overlays
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
