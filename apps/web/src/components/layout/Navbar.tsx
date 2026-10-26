"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Zap,
  Sparkles,
  RefreshCw,
  Lock,
  Scissors,
  Merge,
  Minimize2,
  Maximize2,
  FileCheck,
  Search,
  PenTool,
  Binary,
  Layers,
  Wrench,
  FileCode,
  ArrowUpDown,
  RotateCw,
  Hash,
  Stamp,
  Contrast,
  Crop,
  FlipHorizontal,
  FileSpreadsheet,
  Archive,
} from "lucide-react";
import { CommandPalette } from "@/components/common/CommandPalette";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener to open CommandPalette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Radiant top micro-accent line */}
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-emerald-400/40 via-cyan-400/40 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="shrink-0 flex items-center">
            <BrandLogo size={36} />
          </Link>

          {/* Quick Search Bar Button (Opens Command Palette) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-white text-xs transition-all w-40 sm:w-52 lg:w-44 xl:w-60 shrink shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.18)] whitespace-nowrap group cursor-pointer"
            title="Search all 30+ tools (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Search 30+ tools...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700/60 font-mono text-[10px] text-zinc-400 group-hover:text-emerald-300 group-hover:border-emerald-500/40 shrink-0 transition-colors">
              Ctrl K
            </kbd>
          </button>

          {/* Desktop Mega-Menu Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-medium text-zinc-400 whitespace-nowrap shrink-0">
            {/* 1. PDF Tools Mega Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/pdf"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all py-2 whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">PDF Tools</span>
              </Link>
              <div className="absolute left-0 top-full pt-1.5 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                <div className="p-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.06)] ring-1 ring-white/5 space-y-1">
                  <Link
                    href="/pdf"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20 transition-colors mb-1 shadow-sm"
                  >
                    <span>Explore All PDF Tools (13+)</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                  <Link
                    href="/pdf/edit"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-100 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Edit PDF (Text & Colors)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold uppercase shrink-0 whitespace-nowrap ml-2">
                      Studio
                    </span>
                  </Link>
                  <Link
                    href="/pdf/compress"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Minimize2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Compress (Target KB)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Popular
                    </span>
                  </Link>
                  <Link
                    href="/pdf/merge"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Merge className="w-3.5 h-3.5 text-cyan-400" />
                    Merge PDF Documents
                  </Link>
                  <Link
                    href="/pdf/split"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-blue-400" />
                      <span>Split 1 PDF to Multiple PDFs</span>
                    </span>
                    <span className="text-[10px] text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Multi
                    </span>
                  </Link>
                  <Link
                    href="/pdf/reorder"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Reorder & Delete Pages</span>
                  </Link>
                  <Link
                    href="/pdf/rotate"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Rotate PDF Pages</span>
                  </Link>
                  <Link
                    href="/pdf/page-numbers"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Hash className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Add Page Numbers</span>
                  </Link>
                  <Link
                    href="/pdf/watermark"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Stamp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Watermark PDF</span>
                  </Link>
                  <Link
                    href="/pdf/flatten"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Flatten Forms & Annotations</span>
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      New
                    </span>
                  </Link>
                  <Link
                    href="/pdf/grayscale"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Contrast className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Convert to Grayscale (B&W)</span>
                  </Link>
                  <Link
                    href="/pdf/repair"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Repair Corrupted PDF</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Image Tools Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/image"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap">Image Tools</span>
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1.5 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                <div className="p-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.06)] ring-1 ring-white/5 space-y-1">
                  <Link
                    href="/image"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/20 transition-colors mb-1 shadow-sm"
                  >
                    <span>Explore All Image Tools (6+)</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                  <Link
                    href="/image/compress"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Minimize2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Compress Image (Target KB)</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Exact KB
                    </span>
                  </Link>
                  <Link
                    href="/image/resize"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Resize Pixels & Presets</span>
                  </Link>
                  <Link
                    href="/image/crop"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>Crop Image & Aspect Ratios</span>
                  </Link>
                  <Link
                    href="/image/rotate"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Rotate & Mirror Flip</span>
                  </Link>
                  <Link
                    href="/image/convert"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Universal Convert (incl. HEIC)</span>
                  </Link>
                  <Link
                    href="/image/metadata"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Strip EXIF & GPS</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Privacy
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Security & Sign Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/security"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Sign & Extract</span>
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1.5 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                <div className="p-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.06)] ring-1 ring-white/5 space-y-1">
                  <Link
                    href="/security"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20 transition-colors mb-1 shadow-sm"
                  >
                    <span>Security & Sign Suite</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                  <Link
                    href="/security/sign"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">E-Sign Document</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Popular
                    </span>
                  </Link>
                  <Link
                    href="/extract/text"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Extract Text & Markdown
                  </Link>
                  <Link
                    href="/extract/images"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Extract Embedded Images (ZIP)
                  </Link>
                  <Link
                    href="/image/metadata"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Strip GPS & EXIF Metadata
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. Converters Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/convert"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="whitespace-nowrap">Converters</span>
              </Link>
              <div className="absolute right-0 top-full pt-1.5 w-[480px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                <div className="p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(139,92,246,0.06)] ring-1 ring-white/5 space-y-2.5">
                  {/* Hero Link: Universal Converter Studio */}
                  <Link
                    href="/convert"
                    className="flex items-center justify-between p-2.5 rounded-xl text-white bg-gradient-to-r from-violet-950/90 via-purple-900/40 to-zinc-900 border border-violet-500/30 hover:border-violet-500/60 transition-all group/hero shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 group-hover/hero:scale-105 transition-transform shrink-0">
                        <RefreshCw className="w-4 h-4 text-violet-400 shrink-0" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-wide">
                            Universal Any-File Converter
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 whitespace-nowrap shrink-0">
                            All-in-One Engine
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Word, Excel, PDF, Images, Text & HTML converted 100% locally
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-violet-400 group-hover/hero:translate-x-0.5 transition-transform shrink-0" />
                  </Link>

                  {/* 2-Column Options Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* Column 1: Office & Documents */}
                    <div className="space-y-1">
                      <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>Office & Documents</span>
                      </div>

                      <Link
                        href="/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Word to PDF (.docx)</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">DOCX</span>
                      </Link>

                      <Link
                        href="/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Excel to PDF (.xlsx)</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Table</span>
                      </Link>

                      <Link
                        href="/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>PDF to Word (.docx)</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Export</span>
                      </Link>

                      <Link
                        href="/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>PDF to Excel / CSV</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Sheets</span>
                      </Link>

                      <Link
                        href="/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>HTML & Text to PDF</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Web</span>
                      </Link>
                    </div>

                    {/* Column 2: Images & Visual Media */}
                    <div className="space-y-1">
                      <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Images & Media</span>
                      </div>

                      <Link
                        href="/pdf/pdf-to-images"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>PDF to Images (PNG/JPG)</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Raster</span>
                      </Link>

                      <Link
                        href="/pdf/images-to-pdf"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span>Images to PDF</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Merge</span>
                      </Link>

                      <Link
                        href="/image/convert"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Image Format Converter</span>
                        </span>
                        <span className="text-[10px] text-cyan-400 font-medium">HEIC/WebP</span>
                      </Link>

                      <Link
                        href="/extract/images"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Extract Images (ZIP)</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">Raw</span>
                      </Link>

                      <Link
                        href="/extract/text"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors group/item"
                      >
                        <span className="flex items-center gap-2">
                          <FileCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Extract Text & OCR</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 font-mono">TXT/MD</span>
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Guarantee Bar */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      100% In-Browser & Private
                    </span>
                    <Link
                      href="/convert"
                      className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Open Converter Studio</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Privacy Link */}
            <Link
              href="/privacy"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Privacy</span>
            </Link>
          </nav>

          {/* Right Badge & Quick Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/privacy"
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/[0.08] hover:bg-emerald-500/[0.16] border border-emerald-500/25 hover:border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.12)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              title="View 100% In-Browser Privacy Guarantee"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-sm shadow-emerald-400" />
              </span>
              <span className="whitespace-nowrap">100% In-Browser</span>
              <span className="text-[10px] text-emerald-400/80 font-mono px-1 rounded bg-emerald-500/15 border border-emerald-500/25 hidden xl:inline">
                Private
              </span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 space-y-4">
          {/* Category Hub Quick Links */}
          <div className="font-semibold text-xs uppercase tracking-wider text-zinc-500">
            Tool Categories
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/pdf"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>All PDF Tools</span>
            </Link>
            <Link
              href="/image"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>All Image Tools</span>
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Security & Sign</span>
            </Link>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>All Converters</span>
            </Link>
          </div>

          <div className="font-semibold text-xs uppercase tracking-wider text-zinc-500 pt-1">
            Popular Tools
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/pdf/compress"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Compress PDF
            </Link>
            <Link
              href="/pdf/merge"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Merge PDF
            </Link>
            <Link
              href="/pdf/split"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Split PDF
            </Link>
            <Link
              href="/pdf/reorder"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Reorder Pages
            </Link>
            <Link
              href="/pdf/rotate"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Rotate PDF
            </Link>
            <Link
              href="/pdf/pdf-to-images"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              PDF to Images
            </Link>
            <Link
              href="/pdf/images-to-pdf"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Images to PDF
            </Link>
            <Link
              href="/pdf/watermark"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Watermark
            </Link>
          </div>

          <div className="font-semibold text-xs uppercase tracking-wider text-zinc-500 pt-2">
            Image Tools
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/image/compress"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Compress Image
            </Link>
            <Link
              href="/image/resize"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Resize Image
            </Link>
            <Link
              href="/image/crop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Crop Image
            </Link>
            <Link
              href="/image/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Convert Format
            </Link>
            <Link
              href="/image/metadata"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Strip Metadata
            </Link>
          </div>

          <div className="font-semibold text-xs uppercase tracking-wider text-violet-400 pt-2 flex items-center justify-between">
            <span>Converters</span>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[10px] text-zinc-400 hover:text-white"
            >
              All-in-One Studio →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-between"
            >
              <span>Word to PDF</span>
              <span className="text-[10px] text-blue-400 font-mono">DOCX</span>
            </Link>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-between"
            >
              <span>Excel to PDF</span>
              <span className="text-[10px] text-emerald-400 font-mono">XLSX</span>
            </Link>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-between"
            >
              <span>PDF to Word</span>
              <span className="text-[10px] text-violet-400 font-mono">Export</span>
            </Link>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 flex items-center justify-between"
            >
              <span>PDF to Excel</span>
              <span className="text-[10px] text-emerald-400 font-mono">CSV</span>
            </Link>
            <Link
              href="/pdf/pdf-to-images"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              PDF to Images
            </Link>
            <Link
              href="/pdf/images-to-pdf"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Images to PDF
            </Link>
            <Link
              href="/image/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              Universal Image Conv
            </Link>
            <Link
              href="/convert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300"
            >
              HTML & Text to PDF
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-emerald-400 font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Upload Guarantee</span>
            </Link>
            <Link
              href="/test-files"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Sample Files
            </Link>
          </div>
        </div>
      )}
    </header>
    <CommandPalette
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
    />
  </>
  );
}
