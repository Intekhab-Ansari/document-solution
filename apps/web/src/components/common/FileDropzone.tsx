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
        className={`relative group cursor-pointer rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 p-6 sm:p-9 text-center flex flex-col items-center justify-center overflow-hidden backdrop-blur-xl ${
          isDragOver
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-2xl shadow-emerald-500/25 ring-2 ring-emerald-500/40"
            : "border-zinc-800/90 bg-zinc-900/40 hover:border-emerald-500/40 hover:bg-zinc-900/70 shadow-xl shadow-black/40"
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
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

        {/* Floating animated icon */}
        <div className="relative w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shadow-xl group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 transition-all duration-300">
          <UploadCloud className="w-7 h-7 transition-transform group-hover:-translate-y-0.5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-1.5 group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-4 leading-relaxed">
          {description}
        </p>

        {/* Main CTA button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <span className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 group-hover:shadow-emerald-500/40">
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>Choose {multiple ? "Files" : "File"} from Device</span>
            <ArrowUpRight className="w-4 h-4 opacity-70" />
          </span>
        </div>

        {/* Supported format badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-400">
          {["PDF", "PNG", "JPG", "WEBP", "HEIC", "AVIF", "DOCX"].map((ext) => (
            <span
              key={ext}
              className="px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 group-hover:border-zinc-600 transition-colors"
            >
              .{ext}
            </span>
          ))}
        </div>

        {/* Sample Files Instant Shortcuts */}
        {sampleFiles && sampleFiles.length > 0 && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 w-full max-w-md flex flex-col items-center gap-2 relative z-10">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Or test instantly with sample files:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sampleFiles.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={loadingSample !== null}
                  onClick={(e) => handleLoadSample(e, s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:border-emerald-500/40"
                >
                  {s.kind === "image" ? (
                    <ImageIcon className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <FileText className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{loadingSample === s.name ? "Loading..." : s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Zero upload limits
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 100% In-Browser RAM
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Zero Watermarks
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
