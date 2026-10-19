"use client";

import React from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";

interface ProgressModalProps {
  isOpen: boolean;
  percent?: number;
  progress?: number;
  stage?: string;
  statusMessage?: string;
  onCancel?: () => void;
  title?: string;
}

export function ProgressModal({
  isOpen,
  percent,
  progress,
  stage,
  statusMessage,
  onCancel,
  title = "Processing on your device...",
}: ProgressModalProps) {
  if (!isOpen) return null;

  const currentPercent = percent ?? progress ?? 0;
  const currentStage = stage ?? statusMessage ?? "Crunching numbers locally...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col gap-5 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Engine Active</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Cancel processing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-zinc-400 max-w-xs">{currentStage}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, Math.min(100, currentPercent))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>Progress</span>
            <span>{Math.round(currentPercent)}%</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>RAM Execution &bull; Zero Network Egress</span>
        </div>
      </div>
    </div>
  );
}
