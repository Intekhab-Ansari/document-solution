"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, Sparkles, Lock } from "lucide-react";

interface PrivacyBadgeProps {
  className?: string;
  variant?: "pill" | "banner";
}

export function PrivacyBadge({ className = "", variant = "pill" }: PrivacyBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (variant === "banner") {
    return (
      <div
        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs md:text-sm font-medium backdrop-blur-md shadow-lg shadow-emerald-500/5 ${className}`}
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-white">100% Client-Side Processing:</span> Files are processed directly in your browser memory. No documents are ever uploaded to any cloud server.
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center whitespace-nowrap shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-900/40 transition-all cursor-pointer shadow-lg shadow-emerald-500/5 backdrop-blur-md"
        aria-label="Privacy guarantee details"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-sm shadow-emerald-400"></span>
        </span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:scale-110 shrink-0" />
        <span className="tracking-wide whitespace-nowrap shrink-0 hidden sm:inline">
          100% On-Device · Zero Cloud Uploads
        </span>
        <span className="tracking-wide whitespace-nowrap shrink-0 sm:hidden">
          100% On-Device · Private
        </span>
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-mono opacity-80 group-hover:opacity-100 shrink-0">
          ?
        </span>
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-80 p-4 text-xs bg-zinc-900/95 border border-emerald-500/30 rounded-2xl shadow-2xl text-zinc-300 backdrop-blur-xl animate-in fade-in zoom-in-95 pointer-events-none ring-1 ring-white/10">
          <div className="flex items-center gap-2 font-bold text-white pb-2 border-b border-zinc-800">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>Air-Gapped Privacy Architecture</span>
          </div>
          <p className="leading-relaxed text-zinc-300 mt-2.5">
            This tool executes 100% inside your browser using WebAssembly and Web Workers. No file content, file names, or metadata ever leave your computer.
          </p>
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Zero Server Storage
            </span>
            <span className="text-zinc-500 font-mono">MIT Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
