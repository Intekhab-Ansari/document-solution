"use client";

import React from "react";
import Link from "next/link";
import { PrivacyBadge } from "./PrivacyBadge";
import { ALL_TOOLS, ToolCategory } from "@/lib/registry/tools-registry";
import {
  ChevronRight,
  Sparkles,
  ArrowRight,
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
  // Find other tools in the same category for quick switching
  const relatedTools = ALL_TOOLS.filter((t) => t.category === category).slice(0, 5);

  return (
    <div className="space-y-6 pb-6 border-b border-zinc-800/80">
      {/* Top Breadcrumb & Related Tools Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-300">{categoryLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-emerald-400 font-semibold">{title}</span>
        </div>

        {/* Quick jump to related tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
            Jump to:
          </span>
          {relatedTools.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] whitespace-nowrap transition-colors"
            >
              {t.name.split("(")[0].trim()}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              {badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-md">
              {icon}
            </div>
            <span>{title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <PrivacyBadge />
      </div>

      {/* 3-Step Guided Process Tracker */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
        <div
          className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl transition-all ${
            currentStep === 1
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold"
              : currentStep > 1
              ? "text-zinc-400 font-medium"
              : "text-zinc-600"
          }`}
        >
          {currentStep > 1 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Upload className="w-4 h-4 text-emerald-400" />
          )}
          <span className="truncate">1. Select Document</span>
        </div>

        <div
          className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl transition-all ${
            currentStep === 2
              ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold"
              : currentStep > 2
              ? "text-zinc-400 font-medium"
              : "text-zinc-600"
          }`}
        >
          {currentStep > 2 ? (
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sliders className="w-4 h-4 text-cyan-400" />
          )}
          <span className="truncate">2. Adjust & Preview</span>
        </div>

        <div
          className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-xl transition-all ${
            currentStep === 3
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold shadow-sm"
              : "text-zinc-600"
          }`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span className="truncate">3. Instant Download</span>
        </div>
      </div>
    </div>
  );
}
