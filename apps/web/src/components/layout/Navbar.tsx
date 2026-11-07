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
  ExternalLink,
  Bot,
} from "lucide-react";
import { CommandPalette } from "@/components/common/CommandPalette";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Global keyboard listeners (Ctrl+K for search, Escape for mobile menu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        {/* Soft top micro-accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F05138]/60 via-amber-400/60 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Desktop Mega-Menu Nav */}
          <div className="flex items-center gap-6 xl:gap-8 min-w-0">
            <Link href="/" className="shrink-0 flex items-center">
              <BrandLogo size={34} />
            </Link>

            {/* Desktop Mega-Menu Nav */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold text-slate-600 whitespace-nowrap shrink-0">
              {/* 1. PDF Tools Mega Dropdown */}
              <div className="relative group shrink-0">
                <Link
                  href="/pdf"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-slate-950 hover:bg-slate-100/70 transition-all whitespace-nowrap shrink-0"
                >
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="whitespace-nowrap">PDF Tools</span>
                </Link>
                <div className="absolute left-0 top-full pt-1.5 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                  <div className="p-2.5 rounded-2xl bg-white/98 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 space-y-1">
                    <Link
                      href="/pdf"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 text-xs font-semibold border border-indigo-200/60 transition-colors mb-1 shadow-2xs"
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
                    href="/security/sign"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Sign & Protect PDF</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ml-2">
                      Sign
                    </span>
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
                className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
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

            {/* 3. Converters Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/convert"
                className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all whitespace-nowrap shrink-0"
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

          </nav>
        </div>

        {/* Right Action Area: Search & IntekChat Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search Button (Command Palette Ctrl+K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-950 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            title="Search all 30+ tools (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-600 font-normal hidden sm:inline">Search</span>
            <kbd className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-500 shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* IntekChat External App Button */}
          <a
            href="https://intekchat.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            title="Open IntekChat — Free P2P File Sharing & Chat (intekchat.vercel.app)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="whitespace-nowrap">IntekChat</span>
            <ExternalLink className="w-3 h-3 text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>

          {/* 100% In-Browser Privacy Badge (shown on wider displays) */}
          <Link
            href="/privacy"
            className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            title="View 100% In-Browser Privacy Guarantee"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="whitespace-nowrap">100% In-Browser</span>
            <span className="text-[10px] text-emerald-700 font-mono px-1 rounded bg-emerald-50 border border-emerald-200">
              Private
            </span>
          </Link>
        </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 cursor-pointer transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-visibility duration-300 ${
          mobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {/* Dimmed Backdrop - lets page remain visible behind drawer */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-In Drawer Panel: compact width (w-[82vw] max-w-xs sm:max-w-sm) so it doesn't take whole space */}
        <aside
          aria-label="Mobile Navigation Sidebar"
          className={`fixed top-0 right-0 bottom-0 h-full w-[82vw] max-w-xs sm:max-w-sm bg-zinc-950/95 border-l border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.08)] backdrop-blur-2xl flex flex-col z-10 transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Top Header with Brand and Close Button */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <BrandLogo size={28} />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Smooth Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none text-xs">
            {/* Ask AI Assistant Mobile Action */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-ai-assistant"));
                }
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-zinc-900 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between text-xs transition-all shadow-[0_4px_20px_rgba(16,185,129,0.15)] cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>IntekEdit AI Copilot</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Private
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Ask questions & auto-launch tools
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* IntekChat Companion Link */}
            <div>
              <a
                href="https://intekchat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-sky-950/30 to-zinc-900 border border-cyan-500/30 hover:border-cyan-400/60 flex items-center justify-between text-xs transition-all group shadow-[0_4px_20px_rgba(6,182,212,0.1)] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <span>IntekChat</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        P2P Drop
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Peer-to-peer file sharing & live chat
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            </div>

            {/* Tool Categories Quick Cards */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
                Tool Categories
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>PDF Tools</span>
                </Link>
                <Link
                  href="/image"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-semibold flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Image Tools</span>
                </Link>
                <Link
                  href="/security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Security & Sign</span>
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 font-semibold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>Converters</span>
                </Link>
              </div>
            </div>

            {/* Popular Tools */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
                Popular Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/pdf/compress", label: "Compress PDF" },
                  { href: "/pdf/merge", label: "Merge PDF" },
                  { href: "/pdf/split", label: "Split PDF" },
                  { href: "/pdf/reorder", label: "Reorder Pages" },
                  { href: "/pdf/rotate", label: "Rotate PDF" },
                  { href: "/pdf/pdf-to-images", label: "PDF to Images" },
                  { href: "/pdf/images-to-pdf", label: "Images to PDF" },
                  { href: "/pdf/watermark", label: "Watermark" },
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all truncate"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Image Tools */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
                Image Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/image/compress", label: "Compress Image" },
                  { href: "/image/resize", label: "Resize Image" },
                  { href: "/image/crop", label: "Crop Image" },
                  { href: "/image/convert", label: "Convert Format" },
                  { href: "/image/metadata", label: "Strip Metadata" },
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all truncate"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Converters */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-violet-400 mb-2 flex items-center justify-between">
                <span>Converters</span>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  All-in-One Studio &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="truncate">Word to PDF</span>
                  <span className="text-[10px] text-blue-400 font-mono shrink-0 ml-1">DOCX</span>
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="truncate">Excel to PDF</span>
                  <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-1">XLSX</span>
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="truncate">PDF to Word</span>
                  <span className="text-[10px] text-violet-400 font-mono shrink-0 ml-1">Export</span>
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="truncate">PDF to Excel</span>
                  <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-1">CSV</span>
                </Link>
                <Link
                  href="/pdf/pdf-to-images"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 truncate"
                >
                  PDF to Images
                </Link>
                <Link
                  href="/pdf/images-to-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 truncate"
                >
                  Images to PDF
                </Link>
                <Link
                  href="/image/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 truncate"
                >
                  Universal Conv
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 truncate"
                >
                  HTML to PDF
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/40 shrink-0 flex items-center justify-between text-xs">
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Upload Guarantee</span>
            </Link>
            <Link
              href="/test-files"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Sample Files
            </Link>
          </div>
        </aside>
      </div>
    <CommandPalette
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
    />
  </>
  );
}
