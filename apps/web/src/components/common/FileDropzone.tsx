"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, AlertCircle, Sparkles, FileText, Image as ImageIcon, ArrowUpRight } from "lucide-react";

export interface SampleFileShortcut {
  name: string;
  url: string;
  label: string;
  kind?: "pdf" | "image";
}

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  description?: string;
  sampleFiles?: SampleFileShortcut[];
  className?: string;
}

export function FileDropzone({
  accept = "*/*",
  multiple = false,
  maxFiles = 50,
  onFilesSelected,
  title = "Drop your files here",
  description = "PDFs, images (JPG, PNG, WebP, HEIC). Processed locally in your browser.",
  sampleFiles,
  className = "",
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;

    if (!multiple && droppedFiles.length > 1) {
      onFilesSelected([droppedFiles[0]]);
      return;
    }

    if (droppedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed at once.`);
      onFilesSelected(droppedFiles.slice(0, maxFiles));
      return;
    }

    onFilesSelected(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files?.length) return;
    const selected = Array.from(e.target.files);
    if (!multiple && selected.length > 1) {
      onFilesSelected([selected[0]]);
    } else {
      onFilesSelected(selected.slice(0, maxFiles));
    }
  };

  const handleLoadSample = async (e: React.MouseEvent, sample: SampleFileShortcut) => {
    e.stopPropagation();
    setLoadingSample(sample.name);
    setError(null);

    try {
      const response = await fetch(sample.url);
      if (!response.ok) throw new Error("Could not fetch sample file");
      const blob = await response.blob();
      const mime = sample.url.endsWith(".pdf") ? "application/pdf" : blob.type || "image/jpeg";
      const file = new window.File([blob], sample.name, { type: mime });
      onFilesSelected([file]);
    } catch (err) {
      setError("Failed to load sample: " + (err as Error).message);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-5 sm:p-11 text-center flex flex-col items-center justify-center overflow-hidden backdrop-blur-2xl w-full max-w-full ${
          isDragOver
            ? "border-emerald-400 bg-emerald-500/15 scale-[1.01] shadow-2xl shadow-emerald-500/30 ring-2 ring-emerald-500/50"
            : "border-white/10 bg-gradient-to-b from-white/[0.03] to-zinc-950/80 hover:border-emerald-500/40 hover:bg-zinc-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_0_50px_rgba(16,185,129,0.18)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-dropzone-input"
        />

        {/* Ambient background glow inside dropzone */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-cyan-500/5 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Floating animated icon */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] group-hover:scale-110 group-hover:border-emerald-400/70 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300">
          <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:-translate-y-0.5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </div>

        <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300/90 max-w-md mb-4 sm:mb-5 leading-relaxed">
          {description}
        </p>

        {/* Main CTA button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
          <span className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] transition-all flex items-center gap-2.5 group-hover:scale-105 active:scale-95 cursor-pointer">
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>Choose {multiple ? "Files" : "File"} from Device</span>
            <ArrowUpRight className="w-4 h-4 opacity-75" />
          </span>
        </div>

        {/* Supported format badges - guaranteed single line */}
        <div className="mt-5 sm:mt-6 flex flex-nowrap items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400 max-w-full overflow-x-auto scrollbar-none py-1 px-1">
          {["PDF", "PNG", "JPG", "WEBP", "HEIC", "AVIF", "DOCX"].map((ext) => (
            <span
              key={ext}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 group-hover:border-zinc-700/80 group-hover:text-zinc-200 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              .{ext}
            </span>
          ))}
        </div>

        {/* Sample Files Instant Shortcuts - guaranteed single line on mobile & desktop */}
        {sampleFiles && sampleFiles.length > 0 && (
          <div className="mt-6 sm:mt-7 pt-5 sm:pt-6 border-t border-white/[0.08] w-full max-w-lg flex flex-col items-center gap-2.5 relative z-10">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider text-center whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Or test instantly with sample files:</span>
            </span>
            <div className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto scrollbar-none py-1 px-1">
              {sampleFiles.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={loadingSample !== null}
                  onClick={(e) => handleLoadSample(e, s)}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-white/[0.04] hover:bg-emerald-500/15 text-zinc-200 hover:text-white border border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap shrink-0"
                >
                  {s.kind === "image" ? (
                    <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{loadingSample === s.name ? "Loading..." : s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trust Badges - single line with clean overflow handling */}
        <div className="mt-6 sm:mt-7 flex flex-nowrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] text-zinc-400 font-medium max-w-full overflow-x-auto scrollbar-none py-1 px-1">
          <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" /> Zero upload limits
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" /> 100% In-Browser RAM
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" /> Zero Watermarks
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
