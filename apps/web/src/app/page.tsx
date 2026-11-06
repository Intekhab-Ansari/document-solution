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
      {/* 1. Clean & Structured Hero Section (Theme & Architecture like iLovePDF) */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-7 relative z-10">
          {/* Trust Tag */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-xs text-zinc-300 shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-400">100% In-Browser Privacy</span>
              <span className="text-zinc-600">•</span>
              <span>Zero Server Uploads</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 hidden sm:inline">Free & Open Architecture</span>
            </div>
          </div>

          {/* Main Hero Headline - Guaranteed in exactly 2 lines, never crops */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto w-full px-2">
            <h1 className="font-extrabold tracking-tight text-center leading-[1.16] sm:leading-[1.12]">
              <span className="block whitespace-nowrap text-[clamp(15px,3.8vw,52px)] text-white">
                All-in-One Document & Photo Suite.
              </span>
              <span className="block whitespace-nowrap text-[clamp(14px,3.65vw,50px)] mt-1.5 sm:mt-2.5">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  100% On Your Device.
                </span>{" "}
                <span className="text-zinc-300">Zero Uploads.</span>
              </span>
            </h1>

            <p className="text-zinc-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Every tool you need to edit, compress, convert, merge, split, sign, and secure documents and photos — processed entirely in your browser memory with <span className="text-zinc-200 font-semibold underline decoration-emerald-500/40 decoration-2 underline-offset-4">zero server egress</span>.
            </p>
          </div>

          {/* Unified Smart Search & AI Assistant Field */}
          <div className="max-w-2xl mx-auto w-full pt-1">
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
              className="relative flex items-center p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus-within:border-emerald-500/60 shadow-xl shadow-black/40 transition-all backdrop-blur-md"
            >
              <div className="pl-3 pr-2 text-zinc-400 flex items-center shrink-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>

              <input
                type="text"
                value={aiQuery}
                onChange={(e) => {
                  setAiQuery(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search 30+ tools or ask (e.g. 'Compress PDF to 100KB', 'Edit text in PDF')..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none py-1.5 px-1 font-normal min-w-0"
              />

              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI Guide</span>
                <span className="sm:hidden">Ask</span>
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center justify-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none py-0.5 text-xs text-zinc-400">
              <span className="text-zinc-500 text-[11px] font-medium shrink-0">Popular:</span>
              {[
                "Compress PDF",
                "Edit PDF",
                "Merge PDF",
                "Convert HEIC",
                "Sign PDF",
                "Strip EXIF",
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
                  className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer text-[11px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Dropzone Section (Integrated like iLovePDF) */}
          <div className="max-w-2xl mx-auto pt-3 space-y-3">
            {!detectedFile ? (
              <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors">
                <FileDropzone
                  accept=".pdf,image/*,.heic,.heif,.docx,.xlsx,.pptx"
                  onFilesSelected={handleFileDropped}
                  title="Or drop a document/photo here to auto-detect tools"
                  description="Client-side engine inspects your file in memory and recommends instant actions."
                />
                {/* Instant Sample Fixtures */}
                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                  <span className="text-zinc-500 text-[11px] font-medium mr-1">Sample files:</span>
                  {[
                    { name: "sample_id_card.pdf", url: "/test-files/sample_id_card.pdf", label: "💳 ID Card", kind: "pdf" },
                    { name: "sample_scanned_contract_large.pdf", url: "/test-files/sample_scanned_contract_large.pdf", label: "📄 Contract", kind: "pdf" },
                    { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "📸 Portrait Photo", kind: "image" },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                      className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Contextual Smart Action Card */
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-emerald-500/40 shadow-xl flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      {detectedFile.kind === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{detectedFile.file.name}</p>
                      <p className="text-zinc-400 text-xs">
                        {formatBytes(detectedFile.file.size)} &bull; {detectedFile.kind.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetectedFile(null)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Recommended Actions:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {detectedFile.kind === "pdf" ? (
                      <>
                        <Link
                          href="/pdf/edit"
                          className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-400 text-white font-bold flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-emerald-400" />
                            <span>Edit PDF Studio (Text & Annotations)</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400 text-zinc-950 font-bold uppercase">
                            Open &rarr;
                          </span>
                        </Link>
                        <Link href="/pdf/compress" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white flex items-center gap-2 transition-colors">
                          <Minimize2 className="w-4 h-4 text-emerald-400" /> Compress
                        </Link>
                        <Link href="/pdf/split" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-white flex items-center gap-2 transition-colors">
                          <Scissors className="w-4 h-4 text-cyan-400" /> Split Pages
                        </Link>
                        <Link href="/pdf/merge" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 text-white flex items-center gap-2 transition-colors">
                          <Merge className="w-4 h-4 text-blue-400" /> Merge
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/image/compress" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white flex items-center gap-2 transition-colors">
                          <Minimize2 className="w-4 h-4 text-emerald-400" /> Compress KB
                        </Link>
                        <Link href="/image/resize" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-white flex items-center gap-2 transition-colors">
                          <Scaling className="w-4 h-4 text-cyan-400" /> Resize
                        </Link>
                        <Link href="/image/crop" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-blue-500 text-white flex items-center gap-2 transition-colors">
                          <Crop className="w-4 h-4 text-blue-400" /> Crop
                        </Link>
                        <Link href="/image/convert" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-white flex items-center gap-2 transition-colors">
                          <RefreshCw className="w-4 h-4 text-amber-400" /> Convert Format
                        </Link>
                        <Link href="/pdf/images-to-pdf" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-white flex items-center gap-2 transition-colors">
                          <FileText className="w-4 h-4 text-indigo-400" /> Turn to PDF
                        </Link>
                        <Link href="/image/metadata" className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white flex items-center gap-2 transition-colors">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Strip EXIF
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Highlights Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs text-zinc-400 border-t border-zinc-900">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Client-Side Engine</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>WebAssembly Speed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>No File Size Limits</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Air-Gapped Privacy</span>
            </span>
          </div>
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
