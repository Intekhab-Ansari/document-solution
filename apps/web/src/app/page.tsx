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
  CheckCircle2,
  Bot,
  X,
  Check,
  Star,
  Users,
  HardDrive,
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

// Pastel styling helper matching the exact Dribbble design
interface PastelStyle {
  cardBg: string;
  borderColor: string;
  hoverBorder: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

function getPastelStyle(toolId: string, category: string): PastelStyle {
  // 1. PDF Edit & Annotations (Cyan / Teal)
  if (toolId.includes("edit")) {
    return {
      cardBg: "bg-[#ECFEFF]",
      borderColor: "border-[#A5F3FC]",
      hoverBorder: "hover:border-cyan-400",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-cyan-100/90",
      badgeText: "text-cyan-800",
    };
  }
  // 2. Compress PDF / Images (Emerald / Green)
  if (toolId.includes("compress")) {
    return {
      cardBg: "bg-[#ECFDF5]",
      borderColor: "border-[#A7F3D0]",
      hoverBorder: "hover:border-emerald-400",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-emerald-100/90",
      badgeText: "text-emerald-800",
    };
  }
  // 3. Merge PDF (Warm Coral / Peach)
  if (toolId.includes("merge")) {
    return {
      cardBg: "bg-[#FFF5F2]",
      borderColor: "border-[#FED7CC]",
      hoverBorder: "hover:border-[#F05138]",
      iconBg: "bg-orange-100",
      iconColor: "text-[#F05138]",
      textColor: "text-zinc-950",
      badgeBg: "bg-orange-100/90",
      badgeText: "text-[#F05138]",
    };
  }
  // 4. Split PDF (Amber / Yellow)
  if (toolId.includes("split")) {
    return {
      cardBg: "bg-[#FFFBEB]",
      borderColor: "border-[#FDE68A]",
      hoverBorder: "hover:border-amber-400",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-amber-100/90",
      badgeText: "text-amber-800",
    };
  }
  // 5. Word / Office / DOCX (Royal Blue)
  if (toolId.includes("word") || toolId.includes("docx") || toolId.includes("office")) {
    return {
      cardBg: "bg-[#F0F7FF]",
      borderColor: "border-[#D0E6FF]",
      hoverBorder: "hover:border-blue-400",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-blue-100/90",
      badgeText: "text-blue-800",
    };
  }
  // 6. Excel / Spreadsheets (Mint Green)
  if (toolId.includes("excel") || toolId.includes("sheet") || toolId.includes("csv")) {
    return {
      cardBg: "bg-[#F0FDF4]",
      borderColor: "border-[#BBF7D0]",
      hoverBorder: "hover:border-emerald-400",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-emerald-100/90",
      badgeText: "text-emerald-800",
    };
  }
  // 7. Security / Sign / Protect (Purple / Violet)
  if (toolId.includes("sign") || toolId.includes("lock") || toolId.includes("protect") || toolId.includes("password")) {
    return {
      cardBg: "bg-[#FAF5FF]",
      borderColor: "border-[#E9D5FF]",
      hoverBorder: "hover:border-purple-400",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-purple-100/90",
      badgeText: "text-purple-800",
    };
  }
  // 8. Image & Photos (Rose / Pink)
  if (category === "image") {
    return {
      cardBg: "bg-[#FFF0F5]",
      borderColor: "border-[#FCD6E3]",
      hoverBorder: "hover:border-pink-400",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-pink-100/90",
      badgeText: "text-pink-800",
    };
  }
  // 9. Converters (Indigo)
  if (category === "convert") {
    return {
      cardBg: "bg-[#F5F3FF]",
      borderColor: "border-[#DDD6FE]",
      hoverBorder: "hover:border-indigo-400",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
      textColor: "text-zinc-950",
      badgeBg: "bg-indigo-100/90",
      badgeText: "text-indigo-800",
    };
  }
  // Default warm pastel
  return {
    cardBg: "bg-[#FEF9EE]",
    borderColor: "border-[#FDE6B9]",
    hoverBorder: "hover:border-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    textColor: "text-zinc-950",
    badgeBg: "bg-amber-100/90",
    badgeText: "text-amber-800",
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
      // Fallback virtual file
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

  // Grouped tools for display
  const groupedCategories = useMemo(() => {
    if (searchQuery.trim()) {
      const categoryMap = new Map<string, typeof filteredTools>();
      filteredTools.forEach((tool) => {
        const existing = categoryMap.get(tool.category) || [];
        existing.push(tool);
        categoryMap.set(tool.category, existing);
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
    <div className="w-full bg-[#FAF8F5] text-zinc-900 min-h-screen">
      {/* ============================================================== */}
      {/* 1. Dribbble-Style Split 2-Column Hero Section                 */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-zinc-200/80 bg-gradient-to-b from-[#FBF9F6] via-[#FAF8F5] to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Title, Bullets & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs text-orange-950 font-medium shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#F05138] shrink-0" />
                <span className="font-semibold text-[#F05138]">100% In-Browser Privacy</span>
                <span className="text-orange-300">•</span>
                <span>Zero Server Uploads</span>
                <span className="text-orange-300 hidden sm:inline">•</span>
                <span className="text-zinc-600 hidden sm:inline">Always Free</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black tracking-tight text-zinc-950 leading-[1.14]">
                  All-In-One Document & <span className="text-[#F05138]">Photo Suite</span>
                </h1>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
                  Easily edit, compress, convert, merge, split, sign, and organize documents directly in your browser memory—with <strong className="text-zinc-900 font-semibold">zero server egress</strong> and instant WebAssembly speed.
                </p>
              </div>

              {/* 3 Step Bullets with Coral Badges (Direct from Dribbble shot!) */}
              <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-zinc-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F05138] flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </span>
                  <span>Upload Your Document, Photo, or File</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F05138] flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </span>
                  <span>Select Tool or Target KB Compression Size</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F05138] flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </span>
                  <span>Convert, Save & Download Instantly (100% On-Device)</span>
                </div>
              </div>

              {/* Social Proof Strip (Direct from Dribbble shot!) */}
              <div className="flex items-center gap-3 pt-2 text-xs text-zinc-600 border-t border-zinc-200/80">
                <div className="flex -space-x-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#FED7CC] text-[#F05138] border-2 border-white flex items-center justify-center font-bold text-[10px]">
                    IA
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#BBF7D0] text-emerald-800 border-2 border-white flex items-center justify-center font-bold text-[10px]">
                    JD
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#D0E6FF] text-blue-800 border-2 border-white flex items-center justify-center font-bold text-[10px]">
                    SK
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900">12.5k+</span>
                  <span>Tasks Processed</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    ★★★★★
                  </span>
                  <span className="font-semibold text-zinc-800">1,640 reviews</span>
                </div>
              </div>

              {/* Search & AI Guide Bar */}
              <div className="pt-2 max-w-xl">
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
                  className="relative flex items-center p-1.5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 focus-within:border-[#F05138] shadow-sm transition-all"
                >
                  <div className="pl-3 pr-2 text-zinc-400 flex items-center shrink-0">
                    <Search className="w-4 h-4 text-[#F05138]" />
                  </div>

                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => {
                      setAiQuery(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search 30+ tools (e.g. 'Compress to 100KB', 'Edit PDF')..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none py-1.5 px-1 font-normal min-w-0"
                  />

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#F05138] hover:bg-[#D94129] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </form>

                {/* Popular Chips */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5 text-xs text-zinc-500">
                  <span className="text-zinc-400 text-[11px] font-medium shrink-0">Popular:</span>
                  {["Compress PDF", "Edit PDF", "Merge PDF", "Convert HEIC", "Sign PDF"].map((prompt, idx) => (
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
                      className="px-2.5 py-0.5 rounded-full bg-white hover:bg-orange-50 border border-zinc-200 hover:border-orange-200 text-zinc-600 hover:text-[#F05138] transition-all shrink-0 cursor-pointer text-[11px]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: The Pillowy Dropzone Card (Direct from Dribbble shot!) */}
            <div className="lg:col-span-5">
              {!detectedFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-3xl bg-white border-2 border-dashed border-orange-200/90 shadow-xl p-7 sm:p-9 text-center flex flex-col items-center justify-center space-y-4 hover:border-[#F05138] transition-colors"
                >
                  {/* Cute Coral Document Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#F05138] flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                      Drop your file here
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 max-w-xs leading-relaxed">
                      Supports PDF, Word, Excel, JPG, PNG, HEIC & more with zero file size limits.
                    </p>
                  </div>

                  {/* Hidden File Input & Prominent Coral CTA Button */}
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
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-[#F05138] hover:bg-[#D94129] text-white shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Upload The File To Process</span>
                  </button>

                  {/* Instant Sample Fixtures */}
                  <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-1.5 text-xs w-full">
                    <span className="text-zinc-400 text-[11px] font-medium mr-1">Sample files:</span>
                    {[
                      { name: "sample_id_card.pdf", url: "/test-files/sample_id_card.pdf", label: "💳 ID Card", kind: "pdf" },
                      { name: "sample_scanned_contract_large.pdf", url: "/test-files/sample_scanned_contract_large.pdf", label: "📄 Contract", kind: "pdf" },
                      { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "📸 Portrait", kind: "image" },
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleLoadSample(s.url, s.name, s.kind)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-50 hover:bg-orange-50 border border-zinc-200/80 text-zinc-600 hover:text-[#F05138] text-[11px] transition-colors cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Contextual Smart Action Card */
                <div className="p-6 rounded-3xl bg-white border border-emerald-300 shadow-xl flex flex-col gap-4 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#F05138] flex items-center justify-center shrink-0">
                        {detectedFile.kind === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{detectedFile.file.name}</p>
                        <p className="text-zinc-500 text-xs">
                          {formatBytes(detectedFile.file.size)} &bull; {detectedFile.kind.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetectedFile(null)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#F05138] uppercase tracking-wider">
                      Recommended Actions:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detectedFile.kind === "pdf" ? (
                        <>
                          <Link
                            href="/pdf/edit"
                            className="col-span-2 p-3 rounded-xl bg-orange-50 border border-orange-200 hover:border-[#F05138] text-orange-950 font-bold flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <PenTool className="w-4 h-4 text-[#F05138]" />
                              <span>Edit PDF Studio (Text & Annotations)</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#F05138] text-white font-bold uppercase">
                              Open &rarr;
                            </span>
                          </Link>
                          <Link href="/pdf/compress" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-2 transition-colors">
                            <Minimize2 className="w-4 h-4 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/pdf/split" className="p-3 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-2 transition-colors">
                            <Scissors className="w-4 h-4 text-amber-700" /> Split Pages
                          </Link>
                          <Link href="/pdf/merge" className="p-3 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-950 font-semibold flex items-center gap-2 transition-colors">
                            <Merge className="w-4 h-4 text-blue-700" /> Merge PDFs
                          </Link>
                          <Link href="/security/sign" className="p-3 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-950 font-semibold flex items-center gap-2 transition-colors">
                            <PenTool className="w-4 h-4 text-purple-700" /> E-Sign PDF
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/image/compress" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-semibold flex items-center gap-2 transition-colors">
                            <Minimize2 className="w-4 h-4 text-emerald-700" /> Compress KB
                          </Link>
                          <Link href="/image/resize" className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 hover:border-cyan-400 text-cyan-950 font-semibold flex items-center gap-2 transition-colors">
                            <Scaling className="w-4 h-4 text-cyan-700" /> Resize Photo
                          </Link>
                          <Link href="/image/convert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 font-semibold flex items-center gap-2 transition-colors">
                            <RefreshCw className="w-4 h-4 text-amber-700" /> Convert Format
                          </Link>
                          <Link href="/pdf/images-to-pdf" className="p-3 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-950 font-semibold flex items-center gap-2 transition-colors">
                            <FileText className="w-4 h-4 text-blue-700" /> Turn to PDF
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
      {/* 2. 4 Feature Cards (Directly Below Hero in Dribbble Shot!)     */}
      {/* ============================================================== */}
      <section className="py-10 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-zinc-200/80 space-y-2 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F05138] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">User-Friendly</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Seamlessly edit, convert, and save your documents in seconds with zero learning curve.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-zinc-200/80 space-y-2 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Works on Any Device</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Access from your phone, tablet, or computer with instant, client-side WebAssembly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-zinc-200/80 space-y-2 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Huge Range of Formats</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Convert between PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC, and WebP.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-zinc-200/80 space-y-2 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">100% Free & Private</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                All processing happens in browser memory. Zero cloud uploads, zero size limits.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. The Pastel Tool Catalog (From Dribbble media_1793970241...) */}
      {/* ============================================================== */}
      <section className="py-14 sm:py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              All Document & Photo <span className="text-[#F05138]">Tools</span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm">
              Fast, private, client-side WebAssembly tools for everyday document workflows.
            </p>
          </div>

          {/* Category Filter Tabs (Pillows from Dribbble shot) */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#F05138] text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 border border-zinc-200/80 shadow-xs"
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
                      ? "bg-[#F05138] text-white shadow-md shadow-orange-500/20"
                      : "bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 border border-zinc-200/80 shadow-xs"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? "bg-white/20 text-white font-bold" : "bg-zinc-100 text-zinc-500 font-mono"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* The Pastel Grid (Matching media_1793970241296_a1d0a9f6.jpg!) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.iconName] || FileText;
              const pastel = getPastelStyle(tool.id, tool.category);

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group relative flex flex-col p-4 sm:p-5 rounded-2xl ${pastel.cardBg} border ${pastel.borderColor} ${pastel.hoverBorder} transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                >
                  {/* Top: Icon + Badge */}
                  <div className="flex items-start justify-between gap-1.5 mb-3">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${pastel.iconBg} ${pastel.iconColor}`}
                    >
                      <IconComponent className="w-5 h-5 sm:w-5 sm:h-5" />
                    </div>

                    {tool.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${pastel.badgeBg} ${pastel.badgeText}`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-[#F05138] transition-colors flex items-center justify-between leading-snug line-clamp-1">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#F05138] shrink-0 hidden sm:block" />
                    </h3>
                    <p className="text-zinc-500 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Bottom: 100% On-Device badge */}
                  <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-zinc-600 truncate text-[10px]">
                        100% On-Device
                      </span>
                    </span>

                    <span className="text-[9px] text-zinc-400 uppercase font-mono font-semibold tracking-wider shrink-0">
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
      {/* 4. Architecture & Security Comparison (Clean White Card)       */}
      {/* ============================================================== */}
      <section className="py-16 border-t border-zinc-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              IntekEdit vs Traditional Cloud PDF Converters
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm">
              How our client-side architecture compares to standard online tools.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAF8F5] border border-zinc-200/90 p-6 sm:p-8 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-wider font-mono">
                  <th className="pb-3 pr-4 font-semibold">Feature / Metric</th>
                  <th className="pb-3 px-4 font-bold text-[#F05138]">IntekEdit (Local-First Engine)</th>
                  <th className="pb-3 pl-4 font-semibold text-zinc-500">Traditional Cloud Converters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 text-zinc-700">
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-zinc-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Document Privacy
                  </td>
                  <td className="py-3.5 px-4 text-[#F05138] font-bold">
                    100% In-Browser RAM (0 B Uploaded)
                  </td>
                  <td className="py-3.5 pl-4 text-zinc-500">
                    Uploaded & stored on remote cloud servers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-zinc-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    Daily Tasks & Limits
                  </td>
                  <td className="py-3.5 px-4 text-[#F05138] font-bold">
                    Unlimited & Forever Free
                  </td>
                  <td className="py-3.5 pl-4 text-zinc-500">
                    Capped at 1-2 free conversions per day
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-zinc-900 flex items-center gap-2">
                    <Minimize2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    File Size Limits
                  </td>
                  <td className="py-3.5 px-4 text-[#F05138] font-bold">
                    Gigabyte-Scale (Bounded by Device RAM)
                  </td>
                  <td className="py-3.5 pl-4 text-zinc-500">
                    Strict 50MB - 100MB cloud upload caps
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-semibold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    Watermarks & Ads
                  </td>
                  <td className="py-3.5 px-4 text-[#F05138] font-bold">
                    Zero Watermarks • Zero Spam Ads
                  </td>
                  <td className="py-3.5 pl-4 text-zinc-500">
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
