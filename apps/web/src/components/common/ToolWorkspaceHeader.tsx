"use client";

import React from "react";
import Link from "next/link";
import { PrivacyBadge } from "./PrivacyBadge";
import { ALL_TOOLS, ToolCategory } from "@/lib/registry/tools-registry";
import {
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  Download,
  Upload,
} from "lucide-react";

interface ToolWorkspaceHeaderProps {
  title: string;
  description: string;
  category: ToolCategory;
  categoryLabel: string;
  icon: React.ReactNode;
  badge?: string;
  currentStep?: 1 | 2 | 3;
}

export function ToolWorkspaceHeader({
  title,
  description,
  category,
  categoryLabel,
  icon,
  badge = "100% Client-Side",
  currentStep = 1,
}: ToolWorkspaceHeaderProps) {
  // Find other tools in the same category for quick switching - EXCLUDE current tool
  const currentFirstWord = title.toLowerCase().split(" ")[0] || "";
  const relatedTools = ALL_TOOLS.filter(
    (t) =>
      t.category === category &&
      t.name.toLowerCase() !== title.toLowerCase() &&
      !t.name.toLowerCase().startsWith(currentFirstWord + " to")
  ).slice(0, 5);

  return (
    <div className="relative space-y-4 sm:space-y-6 pb-6 border-b border-white/[0.08] overflow-hidden">
      {/* Subtle atmospheric ambient glow behind hero */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* Top Breadcrumb & Related Tools Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full max-w-full">
        {/* Clean, open breadcrumbs with NO nested pill border clipping */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium flex-wrap max-w-full">
          <Link href="/" className="hover:text-emerald-300 transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link href={`/${category}`} className="hover:text-emerald-300 transition-colors text-zinc-300 shrink-0">
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-emerald-400 font-semibold truncate max-w-[170px] sm:max-w-none">
            {title}
          </span>
        </nav>

        {/* Quick jump to related tools */}
        {relatedTools.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto max-w-full shrink-0">
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400/80 shrink-0" />
              Jump to:
            </span>
            {relatedTools.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.04] hover:bg-emerald-500/15 text-zinc-300 hover:text-emerald-200 border border-white/[0.08] hover:border-emerald-500/30 text-[11px] font-medium whitespace-nowrap transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:scale-[1.02] shrink-0"
              >
                {t.name.split("(")[0].trim()}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-full">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{badge}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3 sm:gap-3.5 flex-wrap sm:flex-nowrap">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-white/10 shrink-0">
              {icon}
            </div>
            <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent break-words leading-tight">
              {title}
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-[15px] text-zinc-300/90 max-w-2xl leading-relaxed font-normal">
            {description}
          </p>
        </div>

        <div className="self-start md:self-auto shrink-0 max-w-full">
          <PrivacyBadge />
        </div>
      </div>

      {/* 3-Step Guided Process Tracker */}
      <div className="p-1 sm:p-2 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl shadow-xl grid grid-cols-3 gap-1 sm:gap-2 text-center text-xs w-full max-w-full">
        {/* Step 1 */}
        <div
          className={`relative flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl transition-all duration-300 text-[10.5px] sm:text-xs ${
            currentStep === 1
              ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-teal-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              : currentStep > 1
              ? "bg-white/[0.02] text-zinc-300 font-medium border border-transparent"
              : "text-zinc-600 font-normal"
          }`}
        >
          {currentStep > 1 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Upload className={`w-3.5 h-3.5 shrink-0 ${currentStep === 1 ? "text-emerald-400" : "text-zinc-600"}`} />
          )}
          <span className="truncate sm:hidden">1. File</span>
          <span className="truncate hidden sm:inline">1. Select Document</span>
          {currentStep === 1 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block ml-1" />
          )}
        </div>

        {/* Step 2 */}
        <div
          className={`relative flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl transition-all duration-300 text-[10.5px] sm:text-xs ${
            currentStep === 2
              ? "bg-gradient-to-r from-cyan-500/20 via-cyan-500/15 to-teal-500/15 border border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              : currentStep > 2
              ? "bg-white/[0.02] text-zinc-300 font-medium border border-transparent"
              : "text-zinc-600 font-normal"
          }`}
        >
          {currentStep > 2 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          ) : (
            <Sliders className={`w-3.5 h-3.5 shrink-0 ${currentStep === 2 ? "text-cyan-400" : "text-zinc-600"}`} />
          )}
          <span className="truncate sm:hidden">2. Adjust</span>
          <span className="truncate hidden sm:inline">2. Adjust & Preview</span>
          {currentStep === 2 && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block ml-1" />
          )}
        </div>

        {/* Step 3 */}
        <div
          className={`relative flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl transition-all duration-300 text-[10.5px] sm:text-xs ${
            currentStep === 3
              ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/20 border border-emerald-400/50 text-emerald-200 font-bold shadow-[0_0_25px_rgba(16,185,129,0.22)]"
              : "text-zinc-600 font-normal"
          }`}
        >
          <Download className={`w-3.5 h-3.5 shrink-0 ${currentStep === 3 ? "text-emerald-400" : "text-zinc-600"}`} />
          <span className="truncate sm:hidden">3. Save</span>
          <span className="truncate hidden sm:inline">3. Instant Download</span>
          {currentStep === 3 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping hidden sm:inline-block ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
