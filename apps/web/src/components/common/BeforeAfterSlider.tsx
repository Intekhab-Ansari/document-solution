"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeftRight, Columns, Eye } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Original",
  afterLabel = "Compressed",
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isSplitMode, setIsSplitMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Mode switch header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span className="font-medium flex items-center gap-1.5 text-zinc-300">
          <Eye className="w-3.5 h-3.5 text-emerald-400" /> Interactive Quality Comparison
        </span>
        <button
          type="button"
          onClick={() => setIsSplitMode(!isSplitMode)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:text-white transition-colors"
        >
          {isSplitMode ? (
            <>
              <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
              <span>Slider View</span>
            </>
          ) : (
            <>
              <Columns className="w-3 h-3 text-emerald-400" />
              <span>Side-by-Side</span>
            </>
          )}
        </button>
      </div>

      {isSplitMode ? (
        /* Side by Side view */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{beforeLabel}</span>
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeUrl} alt={beforeLabel} className="max-h-[420px] object-contain rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">{afterLabel}</span>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-zinc-950 flex items-center justify-center p-2 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={afterUrl} alt={afterLabel} className="max-h-[420px] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        /* Slider Overlay View */
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className="relative select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 max-h-[500px] flex items-center justify-center cursor-ew-resize group"
          style={{ minHeight: "340px" }}
        >
          {/* After image (background) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt={afterLabel}
            className="w-full h-full object-contain pointer-events-none p-2"
          />

          {/* Before image (clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none p-2"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeUrl}
              alt={beforeLabel}
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 text-[10px] font-semibold text-zinc-300 pointer-events-none">
            {beforeLabel}
          </div>
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 pointer-events-none">
            {afterLabel}
          </div>
        </div>
      )}
    </div>
  );
}
