"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Minimize2,
  PenTool,
  Merge,
  Scissors,
  Scaling,
  Crop,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Search,
  ArrowRight,
  Bot,
  X,
  Smartphone,
  Layers,
  FileCheck,
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Stamp,
  RotateCw,
  Hash,
  Wrench,
  Contrast,
  Sliders,
  Archive,
} from "lucide-react";
import { ALL_TOOLS, CATEGORIES, ToolCategory } from "@/lib/registry/tools-registry";
import { formatBytes } from "@/lib/utils";

// Icon mapping for dynamic tool cards
const ICON_MAP: Record<string, React.ElementType> = {
  PenTool,
  Minimize2,
  Merge,
  Scissors,
  ArrowUpDown: Sliders,
  RotateCw,
  Hash,
  Stamp,
  Layers,
  Contrast,
  Wrench,
  ImageIcon,
  Scaling,
  Crop,
  RefreshCw,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Sliders,
  Lock,
  Archive,
};

// Premium styling helper: Clean white card surface with subtle, refined category accents
interface ToolCardStyle {
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  hoverBorder: string;
}

function getToolCardStyle(toolId: string, category: string): ToolCardStyle {
  if (toolId.includes("edit")) {
    return {
      iconBg: "bg-indigo-50 border border-indigo-100",
      iconColor: "text-indigo-600",
      badgeBg: "bg-indigo-50",
      badgeText: "text-indigo-700",
      hoverBorder: "hover:border-indigo-400",
    };
  }
  if (toolId.includes("compress")) {
    return {
      iconBg: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      hoverBorder: "hover:border-emerald-400",
    };
  }
  if (toolId.includes("merge")) {
    return {
      iconBg: "bg-sky-50 border border-sky-100",
      iconColor: "text-sky-600",
      badgeBg: "bg-sky-50",
      badgeText: "text-sky-700",
      hoverBorder: "hover:border-sky-400",
    };
  }
  if (toolId.includes("split")) {
    return {
      iconBg: "bg-amber-50 border border-amber-100",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-700",
      hoverBorder: "hover:border-amber-400",
    };
  }
  if (toolId.includes("sign") || toolId.includes("lock") || toolId.includes("protect")) {
    return {
      iconBg: "bg-violet-50 border border-violet-100",
      iconColor: "text-violet-600",
      badgeBg: "bg-violet-50",
      badgeText: "text-violet-700",
      hoverBorder: "hover:border-violet-400",
    };
  }
  if (category === "image") {
    return {
      iconBg: "bg-rose-50 border border-rose-100",
      iconColor: "text-rose-600",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-700",
      hoverBorder: "hover:border-rose-400",
    };
  }
  if (category === "convert") {
    return {
      iconBg: "bg-teal-50 border border-teal-100",
      iconColor: "text-teal-600",
      badgeBg: "bg-teal-50",
      badgeText: "text-teal-700",
      hoverBorder: "hover:border-teal-400",
    };
  }
  return {
    iconBg: "bg-slate-50 border border-slate-200",
    iconColor: "text-slate-700",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    hoverBorder: "hover:border-slate-400",
  };
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [detectedFile, setDetectedFile] = useState<{ file: File; kind: string } | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File Drop / Selection handler
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const name = selected.name.toLowerCase();
      let kind = "unknown";
      if (name.endsWith(".pdf") || selected.type === "application/pdf") {
        kind = "pdf";
      } else if (
        selected.type.startsWith("image/") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".heic")
      ) {
        kind = "image";
      }
      setDetectedFile({ file: selected, kind });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      const name = selected.name.toLowerCase();
      let kind = "unknown";
      if (name.endsWith(".pdf") || selected.type === "application/pdf") {
        kind = "pdf";
      } else if (
        selected.type.startsWith("image/") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".heic")
      ) {
        kind = "image";
      }
      setDetectedFile({ file: selected, kind });
    }
  };

  // Instant Sample Fixture loader
  const handleLoadSample = async (url: string, filename: string, kind: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], filename, {
        type: kind === "pdf" ? "application/pdf" : "image/jpeg",
      });
      setDetectedFile({ file, kind });
    } catch {
      const fake = new File(["sample content"], filename, {
        type: kind === "pdf" ? "application/pdf" : "image/jpeg",
      });
      setDetectedFile({ file: fake, kind });
    }
  };

  // Filter tools based on query & category
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 min-h-screen">
      {/* ============================================================== */}
      {/* 1. Compact 2-Column Hero Section                              */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-4 pb-4 sm:pt-6 sm:pb-6 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Column: 1-Line Headline, 1-Line Subtitle, 1-Line Tags & Search */}
            <div className="lg:col-span-7 space-y-3 text-left">
              {/* Privacy Guarantee Pill */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% In-Browser &bull; Zero Server Uploads</span>
              </div>

              {/* Main Headline: Strictly 1 Line */}
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl lg:text-[28px] xl:text-[32px] font-black tracking-tight text-slate-900 leading-tight">
                  All-in-One Document & Photo Suite
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  100% On-Device &bull; Edit, compress, convert & sign files directly in your browser.
                </p>
              </div>

              {/* 3 Bullets strictly in 1 Single Line */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 font-medium pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>PDF Editor & Form Fill</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">&bull;</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Target KB Compress</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">&bull;</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>PDF, Office & Image Converter</span>
                </div>
              </div>

              {/* Unified Search & AI Prompt Bar (Compact) */}
              <div className="pt-0.5 max-w-xl">
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
                  className="relative flex items-center p-1 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 shadow-xs transition-all"
                >
                  <div className="pl-2.5 pr-1.5 text-slate-400 flex items-center shrink-0">
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                  </div>

                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => {
                      setAiQuery(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search 30+ tools or ask AI..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1 px-1 font-normal min-w-0"
                  />

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs shadow-indigo-500/20"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </form>

                {/* Popular Tool Quick-Pills (Single line) */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5 text-xs text-slate-500">
                  <span className="text-slate-400 text-[11px] font-medium shrink-0">Quick jump:</span>
                  {[
                    { label: "Compress PDF", query: "Compress PDF" },
                    { label: "Edit PDF", query: "Edit PDF" },
                    { label: "Merge PDF", query: "Merge PDF" },
                    { label: "Convert HEIC", query: "Convert HEIC" },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(p.query);
                        setAiQuery(p.query);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition-all shrink-0 cursor-pointer text-[11px] font-medium shadow-2xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Compact Dropzone Card */}
            <div className="lg:col-span-5">
              {!detectedFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-indigo-500 shadow-md p-4 sm:p-5 text-center flex flex-col items-center justify-center space-y-2.5 transition-all duration-200 group"
                >
                  {/* Refined Indigo Document Icon */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200">
                    <UploadCloud className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Drop file here
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      PDF, Office, JPG, PNG & HEIC &bull; 100% private
                    </p>
                  </div>

                  {/* Hidden File Input & Primary Indigo CTA Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept=".pdf,image/*,.heic,.heif,.docx,.xlsx,.pptx"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  {/* Instant Sample Test Fixtures */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 text-xs w-full">
                    <span className="text-slate-400 text-[10.5px] font-medium mr-1">Samples:</span>
                    {[
                      { name: "sample_id_card.pdf", url: "/test-files/sample_id_card.pdf", label: "💳 ID Card", kind: "pdf" },
                      { name: "sample_scanned_contract_large.pdf", url: "/test-files/sample_scanned_contract_large.pdf", label: "📄 Contract", kind: "pdf" },
                      { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "📸 Portrait", kind: "image" },
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                        className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-[10.5px] transition-colors cursor-pointer font-medium"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Contextual Smart Action Card */
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-indigo-200 shadow-md flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        {detectedFile.kind === "pdf" ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{detectedFile.file.name}</p>
                        <p className="text-slate-500 text-[10px]">
                          {formatBytes(detectedFile.file.size)} &bull; {detectedFile.kind.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetectedFile(null)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider">
                      Recommended Actions:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {detectedFile.kind === "pdf" ? (
                        <>
                          <Link
                            href="/pdf/edit"
                            className="col-span-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:border-indigo-500 text-indigo-950 font-bold flex items-center justify-between transition-colors text-xs"
                          >
                            <span className="flex items-center gap-1.5">
                              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Edit PDF Studio (Text & Ink)</span>
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold uppercase">
                              Open &rarr;
                            </span>
                          </Link>
                          <Link href="/pdf/compress" className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Minimize2 className="w-3.5 h-3.5 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/pdf/split" className="p-2 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Scissors className="w-3.5 h-3.5 text-amber-700" /> Split Pages
                          </Link>
                          <Link href="/pdf/merge" className="p-2 rounded-lg bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Merge className="w-3.5 h-3.5 text-sky-700" /> Merge PDFs
                          </Link>
                          <Link href="/security/sign" className="p-2 rounded-lg bg-violet-50 border border-violet-200 hover:border-violet-400 text-violet-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <PenTool className="w-3.5 h-3.5 text-violet-700" /> E-Sign PDF
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/image/compress" className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Minimize2 className="w-3.5 h-3.5 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/image/resize" className="p-2 rounded-lg bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <Scaling className="w-3.5 h-3.5 text-sky-700" /> Resize Photo
                          </Link>
                          <Link href="/image/convert" className="p-2 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <RefreshCw className="w-3.5 h-3.5 text-amber-700" /> Convert Format
                          </Link>
                          <Link href="/pdf/images-to-pdf" className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-950 font-semibold flex items-center gap-1.5 transition-colors text-xs">
                            <FileText className="w-3.5 h-3.5 text-indigo-700" /> Turn to PDF
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. Slim 1-Line Trust Strip (Takes only 32px height)           */}
      {/* ============================================================== */}
      <div className="border-b border-slate-200/80 bg-white py-2 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-2 text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>WebAssembly Native Speed</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Private (Zero Cloud Uploads)</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>PDF, Word, Excel, HEIC & Images</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span>100% Free &bull; No File Limits</span>
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. The Tool Catalog (Directly Visible Above The Fold!)        */}
      {/* ============================================================== */}
      <section className="py-6 sm:py-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Section Header (Compact) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                All Document & Image <span className="text-indigo-600">Tools</span>
              </h2>
              <p className="text-slate-500 text-xs">
                Select a tool below or drop a file to process immediately.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 shadow-2xs"
                }`}
              >
                All ({ALL_TOOLS.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = ALL_TOOLS.filter((t) => t.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        isSelected ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-500 font-mono"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Tool Grid (Crisp White Cards with Refined Hover) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.iconName] || FileText;
              const style = getToolCardStyle(tool.id, tool.category);

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group relative flex flex-col p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 ${style.hoverBorder} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 cursor-pointer`}
                >
                  {/* Top: Icon + Badge */}
                  <div className="flex items-start justify-between gap-1.5 mb-3">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${style.iconBg} ${style.iconColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {tool.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${style.badgeBg} ${style.badgeText}`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between leading-snug line-clamp-1">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600 shrink-0 hidden sm:block" />
                    </h3>
                    <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Bottom: 100% On-Device Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600 truncate text-[10px]">
                        100% On-Device
                      </span>
                    </span>

                    <span className="text-[9px] text-slate-400 uppercase font-mono font-semibold tracking-wider shrink-0">
                      {tool.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. Architecture & Security Comparison (Executive Matrix)       */}
      {/* ============================================================== */}
      <section className="py-16 border-t border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              IntekEdit vs Traditional Cloud PDF Converters
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              How our client-side architecture compares to typical server-based conversion sites.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50/70 border border-slate-200/90 p-6 sm:p-8 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-mono">
                  <th className="pb-3 pr-4 font-semibold">Feature / Metric</th>
                  <th className="pb-3 px-4 font-bold text-indigo-600">IntekEdit (Local-First Engine)</th>
                  <th className="pb-3 pl-4 font-semibold text-slate-400">Traditional Cloud Converters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Document Privacy
                  </td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">
                    100% In-Browser RAM (0 B Uploaded)
                  </td>
                  <td className="py-3.5 pl-4 text-slate-500">
                    Uploaded & stored on remote cloud servers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    Daily Tasks & Limits
                  </td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">
                    Unlimited & Forever Free
                  </td>
                  <td className="py-3.5 pl-4 text-slate-500">
                    Capped at 1-2 free conversions per day
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Minimize2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    File Size Limits
                  </td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">
                    Gigabyte-Scale (Bounded by Device RAM)
                  </td>
                  <td className="py-3.5 pl-4 text-slate-500">
                    Strict 50MB - 100MB cloud upload caps
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    Watermarks & Ads
                  </td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">
                    Zero Watermarks • Zero Spam Ads
                  </td>
                  <td className="py-3.5 pl-4 text-slate-500">
                    Forced watermarks or ad-heavy overlays
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
