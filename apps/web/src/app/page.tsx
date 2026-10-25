"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { detectFileKind, formatBytes } from "@/lib/utils";
import {
  CATEGORIES,
  ALL_TOOLS,
  ToolCategory,
  ToolDefinition,
} from "@/lib/registry/tools-registry";
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Minimize2,
  Merge,
  Scissors,
  RotateCw,
  PenTool,
  Layers,
  Hash,
  Stamp,
  Crop,
  Scaling,
  RefreshCw,
  Lock,
  Unlock,
  FileCheck,
  FileCode,
  Sliders,
  Search,
  CheckCircle2,
  X,
  Cpu,
  ShieldAlert,
  ArrowUpRight,
  Check,
  Contrast,
  Wrench,
} from "lucide-react";

// Icon resolution map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Minimize2,
  Merge,
  Scissors,
  Layers,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  Scaling,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ImageIcon,
  FileText,
  FileCode,
  Lock,
  Unlock,
  FileCheck,
  Zap,
  Sliders,
  Contrast,
  Wrench,
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [detectedFile, setDetectedFile] = useState<{ file: File; kind: string } | null>(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("tool-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFileDropped = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const kind = await detectFileKind(file);
    setDetectedFile({ file, kind });
  };

  const handleLoadSample = async (url: string, name: string, kind: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], name, {
        type: blob.type || (kind === "pdf" ? "application/pdf" : "image/jpeg"),
      });
      setDetectedFile({ file, kind });
    } catch {
      // fallback
    }
  };

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let tools = ALL_TOOLS;

    if (selectedCategory !== "all") {
      tools = tools.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.categoryLabel.toLowerCase().includes(q)
      );
    }

    return tools;
  }, [searchQuery, selectedCategory]);

  // Group filtered tools by category
  const groupedCategories = useMemo(() => {
    if (searchQuery.trim()) {
      const categoryMap = new Map<ToolCategory, ToolDefinition[]>();
      filteredTools.forEach((tool) => {
        const list = categoryMap.get(tool.category) || [];
        list.push(tool);
        categoryMap.set(tool.category, list);
      });

      return CATEGORIES.filter((cat) => categoryMap.has(cat.id)).map((cat) => ({
        ...cat,
        tools: categoryMap.get(cat.id)!,
      }));
    }

    if (selectedCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (!cat) return [];
      return [{ ...cat, tools: filteredTools }];
    }

    return CATEGORIES.map((cat) => ({
      ...cat,
      tools: ALL_TOOLS.filter((t) => t.category === cat.id),
    })).filter((cat) => cat.tools.length > 0);
  }, [filteredTools, searchQuery, selectedCategory]);

  return (
    <div className="w-full">
      {/* 1. Hero & Smart Upload Section with Aurora Glow */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-zinc-800/80">
        {/* Multi-layered atmospheric glows & perspective dot grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle high-tech radial dot grid */}
          <div className="absolute inset-0 dot-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_60%,transparent_100%)]" />

          {/* Primary central emerald spotlight */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/15 blur-[140px] rounded-full" />

          {/* Secondary atmospheric cyan beam */}
          <div className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full" />

          {/* Deep violet accent anchor */}
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[250px] bg-indigo-500/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          {/* Floating Beacon Announcement Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-xs text-zinc-300 shadow-[0_0_30px_rgba(16,185,129,0.18)] backdrop-blur-xl hover:border-emerald-500/50 transition-all">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-emerald-400">100% On-Device Engine</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 hidden sm:inline">Zero Cloud Uploads • Air-Gapped WebAssembly</span>
              <span className="text-zinc-300 sm:hidden">Air-Gapped Privacy</span>
            </div>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.06]">
              All-in-One Document & Photo Suite. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                100% On Your Device.
              </span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Zero Uploads.
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Professional PDF and image engineering executed directly in your browser memory. Direct in-place vector editing, exact target KB compression, merging, splitting, signing, and EXIF stripping with <span className="text-zinc-200 font-medium">zero server egress</span>.
            </p>
          </div>

          {/* Proof / Trust Metric Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-md hover:border-emerald-500/30 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">Zero Network Egress</span>
              <span className="text-[10px] text-zinc-500 font-mono">(0 Bytes Sent)</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-md hover:border-cyan-500/30 transition-colors">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-white">Instant WebAssembly</span>
              <span className="text-[10px] text-zinc-500 font-mono">(QPDF & Canvas)</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-md hover:border-amber-500/30 transition-colors">
              <Minimize2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-white">Target KB Limits</span>
              <span className="text-[10px] text-zinc-500 font-mono">(Govt & Portal Ready)</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-md hover:border-indigo-500/30 transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-semibold text-white">Vector Fidelity</span>
              <span className="text-[10px] text-zinc-500 font-mono">(576 DPI Output)</span>
            </div>
          </div>

          {/* Smart File Dropzone with Glowing Neon Frame */}
          <div className="max-w-2xl mx-auto pt-4 space-y-4">
            {!detectedFile ? (
              <>
                <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/40 via-cyan-500/20 to-zinc-800/40 shadow-[0_0_60px_-15px_rgba(16,185,129,0.25)]">
                  <div className="rounded-[23px] bg-zinc-950/90 backdrop-blur-2xl">
                    <FileDropzone
                      accept=".pdf,image/*,.heic,.heif,.docx,.xlsx,.pptx"
                      onFilesSelected={handleFileDropped}
                      title="Drop any document or photo to begin"
                      description="Our local engine inspects your file magic bytes in-memory and unlocks the perfect tools."
                    />
                  </div>
                </div>

                {/* Instant Demos / Benchmark Samples */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-500 font-medium flex items-center gap-1 text-[11px] mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Demos:</span>
                  </span>
                  {[
                    {
                      name: "sample_id_card.pdf",
                      url: "/test-files/sample_id_card.pdf",
                      label: "💳 ID / Aadhaar Card",
                      kind: "pdf",
                    },
                    {
                      name: "sample_scanned_contract_large.pdf",
                      url: "/test-files/sample_scanned_contract_large.pdf",
                      label: "📄 Scanned Contract (875 KB)",
                      kind: "pdf",
                    },
                    {
                      name: "portrait_curly_hair.jpg",
                      url: "/test-files/portrait_curly_hair.jpg",
                      label: "📸 Portrait Photo (Hair Matting)",
                      kind: "image",
                    },
                    {
                      name: "portrait_with_exif_gps.jpg",
                      url: "/test-files/portrait_with_exif_gps.jpg",
                      label: "📍 Photo with EXIF GPS",
                      kind: "image",
                    },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5 font-medium"
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Contextual Smart Action Card */
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-emerald-500/40 shadow-2xl flex flex-col gap-4 text-left animate-in fade-in zoom-in-95 ring-1 ring-emerald-500/20 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
                      {detectedFile.kind === "pdf" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{detectedFile.file.name}</p>
                      <p className="text-zinc-400 text-xs">
                        {formatBytes(detectedFile.file.size)} &bull; Detected as {detectedFile.kind.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetectedFile(null)}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change File</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Recommended Instant Actions:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {detectedFile.kind === "pdf" ? (
                      <>
                        <Link
                          href="/pdf/edit"
                          className="col-span-2 sm:col-span-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 hover:border-emerald-400 text-white font-bold flex items-center justify-between gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5 shadow-lg"
                        >
                          <span className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-emerald-400" />
                            <span>Edit PDF Studio (Text, Colors, Whiteout & Annotations)</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 font-bold uppercase">
                            Open Editor &rarr;
                          </span>
                        </Link>
                        <Link
                          href="/pdf/compress"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Minimize2 className="w-4 h-4 text-emerald-400" /> Target KB Compress
                        </Link>
                        <Link
                          href="/pdf/split"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Scissors className="w-4 h-4 text-cyan-400" /> Split / Extract
                        </Link>
                        <Link
                          href="/pdf/pdf-to-images"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-teal-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <ImageIcon className="w-4 h-4 text-teal-400" /> PDF to Images
                        </Link>
                        <Link
                          href="/pdf/rotate"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <RotateCw className="w-4 h-4 text-amber-400" /> Rotate Pages
                        </Link>
                        <Link
                          href="/pdf/reorder"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Layers className="w-4 h-4 text-purple-400" /> Reorder Pages
                        </Link>
                        <Link
                          href="/pdf/merge"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Merge className="w-4 h-4 text-blue-400" /> Merge with Others
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/image/compress"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Minimize2 className="w-4 h-4 text-emerald-400" /> Target KB Compress
                        </Link>
                        <Link
                          href="/image/resize"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Scaling className="w-4 h-4 text-cyan-400" /> Resize Pixels
                        </Link>
                        <Link
                          href="/image/crop"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <Crop className="w-4 h-4 text-blue-400" /> Crop Aspect Ratios
                        </Link>
                        <Link
                          href="/image/convert"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <RefreshCw className="w-4 h-4 text-amber-400" /> Convert Format
                        </Link>
                        <Link
                          href="/pdf/images-to-pdf"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <FileText className="w-4 h-4 text-indigo-400" /> Turn into PDF
                        </Link>
                        <Link
                          href="/image/metadata"
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white font-medium flex items-center gap-2.5 transition-all hover:bg-zinc-900 hover:-translate-y-0.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Strip EXIF / GPS
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3 Core Capability Showcase Pillars */}
          {!detectedFile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-left">
              {/* Card 1: In-Place Vector Editor */}
              <Link
                href="/pdf/edit"
                className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      Studio
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>In-Place Text Editor</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Directly click and edit text in Aadhaar, IDs & invoices with exact font sizes, colors, and seamless paper background match.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>Devanagari & Latin Unicode Support</span>
                </div>
              </Link>

              {/* Card 2: Target KB Limits */}
              <Link
                href="/pdf/compress"
                className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                      <Minimize2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                      Target KB
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>Target-Size Compression</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Shrink multi-page PDFs to exactly 50 KB, 100 KB, or 200 KB for passport & government portal uploads without quality loss.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Iterative Byte-Budget Engine</span>
                </div>
              </Link>

              {/* Card 3: Privacy & Security */}
              <Link
                href="/security"
                className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                      Air-Gapped
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    <span>Security & EXIF Vault</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    AES-256 PDF encryption, password removal, digital signature stamping, and 1-click photo EXIF/GPS scrubbing.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-indigo-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Client-Side WebAssembly</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. Category & Instant Search Navigation Bar */}
      <section className="sticky top-16 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl py-3.5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800"
              }`}
            >
              All Tools ({ALL_TOOLS.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = ALL_TOOLS.filter((t) => t.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-950 shadow-md"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? "bg-zinc-950/20 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400 font-mono"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Search Bar with Ctrl+K shortcut indicator */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="tool-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ tools (e.g. compress, ocr, split)..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. Categorized Tool Grids */}
      <section className="py-14 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {groupedCategories.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Search className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-200 font-bold text-xl">No matching tools found for "{searchQuery}"</p>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                Try searching for keywords like "pdf", "compress", "target kb", "image", "rotate", or "split"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            groupedCategories.map((cat) => (
              <div key={cat.id} className="space-y-6">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800/80 pb-4 gap-2">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                      <span>{cat.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {cat.tools.length} {cat.tools.length === 1 ? "tool" : "tools"}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">{cat.description}</p>
                  </div>
                </div>

                {/* Tool Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {cat.tools.map((tool) => {
                    const IconComponent = ICON_MAP[tool.iconName] || FileText;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="group relative flex flex-col p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/90 hover:border-emerald-500/40 hover:bg-zinc-900/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 backdrop-blur-sm"
                      >
                        {/* Top: Icon + Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg ${tool.accentColor}`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex items-center gap-1">
                            {tool.badge && (
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  tool.badge === "TARGET KB"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : tool.badge === "POPULAR"
                                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                    : tool.badge === "PRIVACY"
                                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                    : tool.badge === "AI"
                                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                                    : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                }`}
                              >
                                {tool.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                            <span>{tool.name}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400" />
                          </h3>
                          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Bottom: Device vs Server Indicator */}
                        <div className="mt-5 pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            {tool.execution === "client" ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                                <span className="text-zinc-300">Device RAM (WASM)</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                                <span className="text-zinc-300">Sandboxed Memory</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                            {tool.category}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. Core Architectural Pillars & Engineering Advantages */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Engineered For Perfection
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why IntekEdit Sets the New Standard
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Engineered with strict client-side isolation, zero remote storage, and cryptographic precision for individuals and enterprises that demand true privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-zinc-950 border border-zinc-800/90 space-y-4 hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">100% Air-Gapped Privacy</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Your sensitive files, tax forms, and contracts never touch a remote server. All parsing, rendering, and cryptographic signing execute 100% in your local browser RAM via WebAssembly.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-zinc-950 border border-zinc-800/90 space-y-4 hover:border-cyan-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Minimize2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">Exact Target KB Compression</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Need to hit strict government portal upload limits (under 100KB, 200KB, or 500KB)? Our iterative binary search algorithm calculates the optimal compression ratio while keeping text sharp.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-zinc-950 border border-zinc-800/90 space-y-4 hover:border-indigo-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">Full Image & Media Studio</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Universal image format conversion (including Apple HEIC, AVIF, WebP, Lossless PNG), EXIF GPS stripping, and multi-resolution page extraction with zero watermarks or file size restrictions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
