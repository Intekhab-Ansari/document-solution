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
  Bot,
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
  const [aiQuery, setAiQuery] = useState("");

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
      {/* 1. Hero & Smart Upload Section with Cyber Aurora & Blueprint Grid Background */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-zinc-800/80">
        {/* Top Radiant Horizon Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 via-cyan-400/60 to-transparent blur-[0.5px] z-20 pointer-events-none" />

        {/* Multi-layered celestial atmospheric glows & precision grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top Luminous Horizon Arc */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[380px] bg-gradient-to-b from-emerald-500/30 via-teal-500/15 to-transparent blur-[110px] rounded-full" />

          {/* Precision Cyber Blueprint Grid */}
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(52, 211, 153, 0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(52, 211, 153, 0.25) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, #000 35%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, #000 35%, transparent 85%)",
            }}
          />

          {/* High-tech radial dot matrix layer */}
          <div className="absolute inset-0 dot-grid opacity-35 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_50%,transparent_100%)]" />

          {/* Primary central pulsating emerald & cyan spotlight */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[520px] bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-cyan-500/25 blur-[140px] rounded-full animate-aurora-glow" />

          {/* Secondary atmospheric cyan beam (top-right) */}
          <div className="absolute top-6 right-1/4 w-[550px] h-[360px] bg-gradient-to-bl from-cyan-400/20 via-teal-400/10 to-transparent blur-[130px] rounded-full" />

          {/* Deep violet / indigo ambient anchor (bottom-left) */}
          <div className="absolute bottom-0 left-1/4 w-[650px] h-[320px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-[140px] rounded-full" />

          {/* Floating Subtle Ambient Stars / Micro-Glow Orbs */}
          <div className="absolute top-1/4 left-[15%] w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_#34d399] animate-pulse" />
          <div className="absolute top-1/3 right-[18%] w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_10px_#22d3ee] animate-pulse delay-700" />
          <div className="absolute bottom-1/3 left-[22%] w-1 h-1 rounded-full bg-teal-300/60 shadow-[0_0_8px_#5eead4] animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-[12%] w-1 h-1 rounded-full bg-indigo-400/60 shadow-[0_0_8px_#818cf8] animate-pulse delay-500" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-7 relative z-10">
          {/* Floating Beacon Announcement Badge - Guaranteed 1 Single Line */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.04] border border-emerald-500/35 text-xs text-zinc-300 shadow-[0_0_25px_rgba(16,185,129,0.18)] backdrop-blur-xl hover:border-emerald-500/50 hover:bg-white/[0.07] transition-all cursor-default group whitespace-nowrap">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              </span>
              <span className="font-bold text-emerald-400 whitespace-nowrap shrink-0">100% On-Device Engine</span>
              <span className="text-zinc-600 shrink-0">•</span>
              <span className="text-zinc-300 whitespace-nowrap shrink-0">Zero Cloud Uploads</span>
              <span className="text-zinc-600 hidden sm:inline shrink-0">•</span>
              <span className="text-emerald-300/90 hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Air-Gapped WebAssembly</span>
              </span>
            </div>
          </div>

          {/* Main Hero Headline - Guaranteed in exactly 2 lines, never crops */}
          <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto w-full px-3 sm:px-4">
            <h1 className="font-black tracking-tight text-center leading-[1.18] sm:leading-[1.12]">
              <span className="block whitespace-nowrap text-[clamp(14px,3.8vw,54px)] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm">
                All-in-One Document & Photo Suite.
              </span>
              <span className="block whitespace-nowrap text-[clamp(13px,3.65vw,52px)] mt-1 sm:mt-2.5">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(16,185,129,0.45)]">
                  100% On Your Device.
                </span>{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
                  Zero Uploads.
                </span>
              </span>
            </h1>

            <p className="text-zinc-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Professional PDF, document, and image engineering executed directly in your browser memory. Direct in-place vector editing, exact target KB compression, and format conversions with <span className="text-zinc-200 font-semibold underline decoration-emerald-500/40 decoration-2 underline-offset-4">zero server egress</span>.
            </p>
          </div>

          {/* Quick Tool Launchers Bar - 3 tags in one line */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 max-w-xl sm:max-w-2xl mx-auto text-xs">
            <Link
              href="/pdf/edit"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 text-[10.5px] sm:text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all truncate group"
            >
              <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">PDF Studio</span>
                <span className="hidden sm:inline">PDF Studio (Vector Edit)</span>
              </span>
            </Link>
            <Link
              href="/pdf/compress"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/50 text-zinc-300 hover:text-white text-[10.5px] sm:text-xs font-medium hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.18)] truncate group"
            >
              <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Target Compress</span>
                <span className="hidden sm:inline">Target KB Compress</span>
              </span>
            </Link>
            <Link
              href="/pdf/split"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-teal-500/50 text-zinc-300 hover:text-white text-[10.5px] sm:text-xs font-medium hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.18)] truncate group"
            >
              <Scissors className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Split PDF</span>
                <span className="hidden sm:inline">Split PDF Pages</span>
              </span>
            </Link>
            <Link
              href="/pdf/merge"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/50 text-zinc-300 hover:text-white text-[10.5px] sm:text-xs font-medium hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.18)] truncate group"
            >
              <Merge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Merge PDF</span>
                <span className="hidden sm:inline">Merge Documents</span>
              </span>
            </Link>
            <Link
              href="/image"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/50 text-zinc-300 hover:text-white text-[10.5px] sm:text-xs font-medium hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.18)] truncate group"
            >
              <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Photo Suite</span>
            </Link>
            <Link
              href="/image/metadata"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-rose-500/50 text-zinc-300 hover:text-white text-[10.5px] sm:text-xs font-medium hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.18)] truncate group"
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Strip EXIF</span>
                <span className="hidden sm:inline">Strip EXIF / GPS</span>
              </span>
            </Link>
          </div>

          {/* AI Assistance Direct Field & Customer Query Launcher */}
          <div className="max-w-xl sm:max-w-2xl mx-auto w-full px-2 pt-1">
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
              className="relative flex items-center p-1 sm:p-1.5 rounded-2xl bg-zinc-950/80 border border-emerald-500/35 hover:border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:shadow-[0_0_35px_rgba(16,185,129,0.22)] transition-all group backdrop-blur-xl"
            >
              <div className="pl-2.5 sm:pl-3 pr-2 text-emerald-400 flex items-center shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>

              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask AI Copilot: 'Compress PDF to 150KB', 'Edit text', 'Convert HEIC'..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none py-1.5 px-1 font-medium min-w-0"
              />

              <button
                type="submit"
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span className="hidden sm:inline">Ask AI & Launch</span>
                <span className="sm:hidden">Ask</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Query Recommendation Pills */}
            <div className="flex items-center justify-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5 text-[11px] text-zinc-400">
              <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0 hidden sm:inline">
                Try:
              </span>
              {[
                "Compress PDF to 200 KB",
                "Edit text in PDF",
                "Convert HEIC to JPG",
                "Strip EXIF / GPS",
                "Merge multiple PDFs",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("open-ai-assistant", {
                          detail: { query: prompt },
                        })
                      );
                    }
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/35 text-zinc-400 hover:text-emerald-300 transition-all shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Central Air-Gapped Sandbox Workbench */}
          <div className="max-w-3xl mx-auto pt-2 space-y-4">
            {!detectedFile ? (
              <>
                <div className="relative p-[1.5px] rounded-3xl bg-gradient-to-b from-emerald-500/50 via-cyan-500/30 to-violet-500/20 console-glow-frame">
                  <div className="rounded-[23px] bg-zinc-950/95 backdrop-blur-2xl overflow-hidden border border-white/10">
                    {/* Console Window Top Bar */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-900/70 border-b border-white/[0.08] text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                        </div>
                        <span className="text-zinc-600 font-mono text-[11px] mx-1">|</span>
                        <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-zinc-200 font-bold">IntekEdit Sandbox</span>
                          <span className="text-zinc-500 hidden sm:inline">(RAM: Isolated)</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>0 B Network Egress</span>
                        </span>
                      </div>
                    </div>

                    {/* Dropzone Container */}
                    <div className="p-3 sm:p-5">
                      <FileDropzone
                        accept=".pdf,image/*,.heic,.heif,.docx,.xlsx,.pptx"
                        onFilesSelected={handleFileDropped}
                        title="Drop any document or photo to begin"
                        description="Our client-side engine inspects your file magic bytes in-memory and unlocks the perfect tools."
                      />
                    </div>

                    {/* Instant Live Sample Demos Toolbar Inside Console */}
                    <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-900/40 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5 text-[11px] whitespace-nowrap shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Instant Sample Fixtures:</span>
                      </span>
                      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full py-0.5">
                        {[
                          {
                            name: "sample_id_card.pdf",
                            url: "/test-files/sample_id_card.pdf",
                            label: "💳 ID / Aadhaar",
                            kind: "pdf",
                          },
                          {
                            name: "sample_scanned_contract_large.pdf",
                            url: "/test-files/sample_scanned_contract_large.pdf",
                            label: "📄 Scanned Contract",
                            kind: "pdf",
                          },
                          {
                            name: "portrait_curly_hair.jpg",
                            url: "/test-files/portrait_curly_hair.jpg",
                            label: "📸 Portrait Photo",
                            kind: "image",
                          },
                          {
                            name: "portrait_with_exif_gps.jpg",
                            url: "/test-files/portrait_with_exif_gps.jpg",
                            label: "📍 GPS EXIF Image",
                            kind: "image",
                          },
                        ].map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-white text-[11px] font-medium transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <span>{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proof / Trust Metric Badges Dock directly below Console */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs text-left">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 backdrop-blur-md hover:border-emerald-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">Zero Egress</div>
                      <div className="text-[10px] text-zinc-500 font-mono">0 Bytes Sent</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 backdrop-blur-md hover:border-cyan-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">WebAssembly</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Fast On-Device</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 backdrop-blur-md hover:border-amber-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Minimize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">Target KB Limits</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Govt Portal Ready</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 backdrop-blur-md hover:border-indigo-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">Vector Fidelity</div>
                      <div className="text-[10px] text-zinc-500 font-mono">576 DPI Output</div>
                    </div>
                  </div>
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
                className="relative p-5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/[0.08] hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      Studio Engine
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                    <span>In-Place Text & Vector Edit</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Directly click and edit text in Aadhaar, ID cards & invoices with exact font sizes, colors, and paper background match.
                  </p>

                  {/* Simulated Micro UI Preview */}
                  <div className="my-3 p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-800/60 pb-1 text-[10px]">
                      <span>id_card_verified.pdf</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Edit Active
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <span className="text-zinc-500">Holder:</span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30 flex items-center">
                        Alex Rivera
                        <span className="inline-block w-0.5 h-3 bg-emerald-400 ml-0.5 animate-pulse" />
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                      <span>Latin & Devanagari</span>
                      <span>•</span>
                      <span>Zero Watermark</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Devanagari & Latin Unicode Support</span>
                </div>
              </Link>

              {/* Card 2: Target KB Limits */}
              <Link
                href="/pdf/compress"
                className="relative p-5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/[0.08] hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Minimize2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      Target-Size KB
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>Target-Size Compression</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400 shrink-0" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Shrink multi-page PDFs to exactly 50 KB, 100 KB, or 200 KB for passport & government portal uploads without quality loss.
                  </p>

                  {/* Simulated Micro UI Gauge */}
                  <div className="my-3 p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">4.8 MB file</span>
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-cyan-400" /> 195 KB
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 p-0.5 border border-zinc-800">
                      <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-full rounded-full w-[96%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="text-emerald-400 font-semibold">96% Reduction</span>
                      <span>Passport Portal Ready</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                  <Zap className="w-3 h-3 shrink-0" />
                  <span>Iterative Byte-Budget Binary Search</span>
                </div>
              </Link>

              {/* Card 3: Privacy & Security */}
              <Link
                href="/security"
                className="relative p-5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/[0.08] hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 group backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                      Air-Gapped Vault
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>Security & EXIF Scrubber</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-400 shrink-0" />
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    AES-256 PDF encryption, password removal, digital signature stamping, and 1-click photo EXIF/GPS scrubbing.
                  </p>

                  {/* Simulated Micro UI Badge */}
                  <div className="my-3 p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-[11px] font-mono space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Network Egress</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        0 B Uploaded
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate">
                      <span className="text-rose-400 line-through">GPS: 37.77, -122.41</span>
                      <span className="text-emerald-400 font-bold ml-auto">Cleaned</span>
                    </div>
                    <div className="text-[10px] text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/20 text-center font-bold">
                      AES-256 / SHA-256 Verified
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-indigo-400 font-medium">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
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

                {/* Tool Cards Grid - 2 columns on mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                  {cat.tools.map((tool) => {
                    const IconComponent = ICON_MAP[tool.iconName] || FileText;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="group relative flex flex-col p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/[0.08] hover:border-emerald-500/40 hover:from-zinc-900/90 hover:to-zinc-900/95 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.12)] backdrop-blur-md overflow-hidden"
                      >
                        {/* Top Micro-Accent Sheen */}
                        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:via-emerald-400/60 transition-colors" />

                        {/* Top: Icon + Badge */}
                        <div className="flex items-start justify-between gap-1.5 mb-2.5 sm:mb-4">
                          <div
                            className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg ${tool.accentColor}`}
                          >
                            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
                          </div>

                          <div className="flex items-center gap-1">
                            {tool.badge && (
                              <span
                                className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 truncate max-w-[76px] sm:max-w-none text-center shadow-sm ${
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
                        <div className="flex-1 space-y-1 sm:space-y-2">
                          <h3 className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center justify-between leading-snug line-clamp-2">
                            <span>{tool.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0 hidden sm:block" />
                          </h3>
                          <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Bottom: Device vs Server Indicator */}
                        <div className="mt-3 sm:mt-5 pt-2 sm:pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
                            {tool.execution === "client" ? (
                              <>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 shrink-0" />
                                <span className="text-zinc-300 truncate text-[10px] sm:text-[11px]">
                                  <span className="sm:hidden">On-Device</span>
                                  <span className="hidden sm:inline">Device RAM (WASM)</span>
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 shrink-0" />
                                <span className="text-zinc-300 truncate text-[10px] sm:text-[11px]">
                                  <span className="sm:hidden">Sandboxed</span>
                                  <span className="hidden sm:inline">Sandboxed Memory</span>
                                </span>
                              </>
                            )}
                          </span>

                          <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider shrink-0 hidden min-[380px]:inline">
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
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-900/40 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Engineered For Precision & Privacy
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why IntekEdit Sets the New Standard
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Engineered with strict client-side isolation, zero remote storage, and cryptographic precision for individuals and enterprises that demand true data sovereignty.
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-zinc-950/90 border border-white/[0.08] hover:border-emerald-500/40 space-y-4 transition-all shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">100% Air-Gapped Privacy</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Your sensitive files, tax forms, and contracts never touch a remote server. All parsing, rendering, and cryptographic signing execute 100% in your local browser RAM via WebAssembly.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-zinc-950/90 border border-white/[0.08] hover:border-cyan-500/40 space-y-4 transition-all shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Minimize2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">Exact Target KB Compression</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Need to hit strict government portal upload limits (under 100KB, 200KB, or 500KB)? Our iterative binary search algorithm calculates the optimal compression ratio while keeping text sharp.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-zinc-950/90 border border-white/[0.08] hover:border-indigo-500/40 space-y-4 transition-all shadow-xl hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">Full Image & Media Studio</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Universal image format conversion (including Apple HEIC, AVIF, WebP, Lossless PNG), EXIF GPS stripping, and multi-resolution page extraction with zero watermarks or file size restrictions.
              </p>
            </div>
          </div>

          {/* Architectural Comparison Matrix */}
          <div className="rounded-3xl bg-zinc-950/90 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>IntekEdit vs Traditional Cloud PDF Tools</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  How our client-side architecture compares to typical online converters
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold self-start sm:self-auto">
                No Cloud Egress Guarantee
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider font-mono">
                    <th className="pb-3 pr-4 font-semibold">Feature / Metric</th>
                    <th className="pb-3 px-4 font-semibold text-emerald-400">IntekEdit (Local-First Engine)</th>
                    <th className="pb-3 pl-4 font-semibold text-zinc-500">Traditional Cloud Converters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      Document Privacy
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      100% In-Browser RAM (0 B Uploaded)
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      Uploaded & stored on remote servers
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      Daily Tasks & Limits
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      Unlimited & Forever Free
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      Capped at 1-2 free tasks per day
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                      <Minimize2 className="w-4 h-4 text-amber-400 shrink-0" />
                      File Size Limits
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      Gigabyte-Scale (Bounded by Device RAM)
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      Strict 50MB - 100MB cloud upload caps
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      Watermarks & Ads
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      Zero Watermarks • Zero Spam Ads
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      Forced watermarks or ad-heavy overlays
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                      Offline Execution
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      Fully Functional Offline in Web Worker
                    </td>
                    <td className="py-3.5 pl-4 text-zinc-500">
                      Requires active internet upload
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
