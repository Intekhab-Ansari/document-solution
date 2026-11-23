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
  Unlock,
  Scissors,
  Merge,
  Minimize2,
  Maximize2,
  FileCheck,
  Search,
  PenTool,
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
  ChevronDown,
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

  const handleOpenAiAssistant = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-assistant"));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        {/* Luminous top micro-accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/70 via-sky-400/70 via-emerald-400/70 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 lg:gap-4">
          {/* Left: Brand + Desktop Mega-Menu Nav */}
          <div className="flex items-center gap-5 xl:gap-7 min-w-0">
            <Link
              href="/"
              className="shrink-0 flex items-center group transition-transform active:scale-95"
              aria-label="IntekEdit Home"
            >
              <BrandLogo size={34} />
            </Link>

            {/* Desktop Mega-Menu Nav */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0">
              {/* 1. PDF Tools Mega Dropdown */}
              <div className="relative group shrink-0">
                <Link
                  href="/pdf"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-indigo-600 hover:bg-indigo-50/80 transition-all whitespace-nowrap shrink-0"
                >
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>PDF Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute left-0 top-full pt-2 w-[340px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0">
                  <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 space-y-1">
                    <Link
                      href="/pdf"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-indigo-700 bg-gradient-to-r from-indigo-50 via-sky-50/80 to-indigo-50 border border-indigo-200/60 hover:border-indigo-300 text-xs font-bold transition-all mb-1 shadow-2xs group/banner"
                    >
                      <span>Explore All PDF Tools (15+)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/banner:translate-x-0.5 transition-transform shrink-0" />
                    </Link>

                    <Link
                      href="/pdf/edit"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <PenTool className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Edit PDF (Text & Annotations)</span>
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">
                        Studio
                      </span>
                    </Link>

                    <Link
                      href="/pdf/compress"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Minimize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Compress (Target KB)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Exact KB
                      </span>
                    </Link>

                    <Link
                      href="/pdf/merge"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <Merge className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Merge PDF Documents</span>
                    </Link>

                    <Link
                      href="/pdf/split"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Split & Extract Pages</span>
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Multi
                      </span>
                    </Link>

                    <Link
                      href="/pdf/reorder"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Reorder & Delete Pages</span>
                    </Link>

                    <Link
                      href="/pdf/rotate"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Rotate PDF Pages</span>
                    </Link>

                    <Link
                      href="/pdf/page-numbers"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <Hash className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Add Page Numbers</span>
                    </Link>

                    <Link
                      href="/pdf/watermark"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <Stamp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Watermark PDF</span>
                    </Link>

                    <Link
                      href="/pdf/flatten"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Flatten Forms & Layers</span>
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Lock
                      </span>
                    </Link>

                    <Link
                      href="/pdf/grayscale"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <Contrast className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Convert to Grayscale (B&W)</span>
                    </Link>

                    <Link
                      href="/pdf/repair"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Repair Corrupted PDF</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2. Image Tools Dropdown */}
              <div className="relative group shrink-0">
                <Link
                  href="/image"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-cyan-600 hover:bg-cyan-50/80 transition-all whitespace-nowrap shrink-0"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Image Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute left-0 top-full pt-2 w-[340px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0">
                  <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 space-y-1">
                    <Link
                      href="/image"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-cyan-800 bg-gradient-to-r from-cyan-50 via-sky-50 to-cyan-50/80 border border-cyan-200/60 hover:border-cyan-300 text-xs font-bold transition-all mb-1 shadow-2xs group/banner"
                    >
                      <span>Explore All Image Tools (7+)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/banner:translate-x-0.5 transition-transform shrink-0" />
                    </Link>

                    <Link
                      href="/image/compress"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Minimize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Compress Image (Target KB)</span>
                      </span>
                      <span className="text-[10px] text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Exact KB
                      </span>
                    </Link>

                    <Link
                      href="/image/resize"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Resize Pixels & Social Presets</span>
                    </Link>

                    <Link
                      href="/image/crop"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <Crop className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>Crop Image & Framing</span>
                    </Link>

                    <Link
                      href="/image/rotate"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Rotate & Mirror Flip</span>
                    </Link>

                    <Link
                      href="/image/convert"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span>Universal Image Convert</span>
                      </span>
                      <span className="text-[10px] text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-md font-semibold">
                        HEIC/WebP
                      </span>
                    </Link>

                    <Link
                      href="/image/metadata"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Strip EXIF & GPS Metadata</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Privacy
                      </span>
                    </Link>

                    <Link
                      href="/pdf/pdf-to-images"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 text-xs font-medium transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>PDF to Images (PNG/JPG)</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Security & Sign Dropdown */}
              <div className="relative group shrink-0">
                <Link
                  href="/security"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-emerald-700 hover:bg-emerald-50/80 transition-all whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Security & Sign</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute left-0 top-full pt-2 w-[340px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0">
                  <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 space-y-1">
                    <Link
                      href="/security"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 border border-emerald-200/60 hover:border-emerald-300 text-xs font-bold transition-all mb-1 shadow-2xs group/banner"
                    >
                      <span>Security & Digital Trust Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/banner:translate-x-0.5 transition-transform shrink-0" />
                    </Link>

                    <Link
                      href="/security/sign"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <PenTool className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Sign & Protect PDF</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Digital Sign
                      </span>
                    </Link>

                    <Link
                      href="/security/protect"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Protect PDF (AES-256)</span>
                      </span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        Password
                      </span>
                    </Link>

                    <Link
                      href="/security/unlock"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Unlock Password PDF</span>
                    </Link>

                    <Link
                      href="/image/metadata"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Strip EXIF & Location Tags</span>
                    </Link>

                    <Link
                      href="/pdf/flatten"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Flatten Form Fields (Tamper-Proof)</span>
                    </Link>

                    <Link
                      href="/privacy"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 text-xs font-medium transition-colors pt-2 border-t border-slate-100"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Air-Gapped Privacy Architecture</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Converters Dropdown */}
              <div className="relative group shrink-0">
                <Link
                  href="/convert"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-violet-600 hover:bg-violet-50/80 transition-all whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>Converters</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute right-0 top-full pt-2 w-[480px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0">
                  <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 space-y-2.5">
                    {/* Hero Link: Universal Converter Studio */}
                    <Link
                      href="/convert"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/70 hover:border-violet-300 transition-all group/hero shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-300 flex items-center justify-center text-violet-700 group-hover/hero:scale-105 transition-transform shrink-0">
                          <RefreshCw className="w-4 h-4 text-violet-600 shrink-0" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 tracking-wide">
                              Universal Any-File Converter
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 shrink-0">
                              All-in-One Engine
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Word, Excel, PDF, Images, Text & HTML converted 100% locally
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-violet-600 group-hover/hero:translate-x-0.5 transition-transform shrink-0" />
                    </Link>

                    {/* 2-Column Options Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {/* Column 1: Office & Documents */}
                      <div className="space-y-1">
                        <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>Office & Documents</span>
                        </div>

                        <Link
                          href="/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Word to PDF (.docx)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">DOCX</span>
                        </Link>

                        <Link
                          href="/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Excel to PDF (.xlsx)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Table</span>
                        </Link>

                        <Link
                          href="/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                            <span>PDF to Word (.docx)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Export</span>
                        </Link>

                        <Link
                          href="/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>PDF to Excel / CSV</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Sheets</span>
                        </Link>

                        <Link
                          href="/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>HTML & Text to PDF</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Web</span>
                        </Link>
                      </div>

                      {/* Column 2: Images & Visual Media */}
                      <div className="space-y-1">
                        <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3 text-cyan-600 shrink-0" />
                          <span>Images & Media</span>
                        </div>

                        <Link
                          href="/pdf/pdf-to-images"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>PDF to Images (PNG/JPG)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Raster</span>
                        </Link>

                        <Link
                          href="/pdf/images-to-pdf"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                            <span>Images to PDF Book</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Merge</span>
                        </Link>

                        <Link
                          href="/image/convert"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span>Image Converter</span>
                          </span>
                          <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1 rounded font-medium">HEIC</span>
                        </Link>

                        <Link
                          href="/extract/images"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <Archive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Extract Images (ZIP)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">Raw</span>
                        </Link>

                        <Link
                          href="/extract/text"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 text-xs font-medium transition-colors group/item"
                        >
                          <span className="flex items-center gap-2">
                            <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>Extract Text & OCR</span>
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/item:text-indigo-600 font-mono">TXT</span>
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Guarantee Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        100% In-Browser & Private
                      </span>
                      <Link
                        href="/convert"
                        className="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Quick Search Button (Command Palette Ctrl+K) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100/80 hover:bg-slate-100 hover:border-slate-300 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs hover:shadow-xs group"
              title="Search all 30+ tools (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden sm:inline font-medium text-slate-600 group-hover:text-slate-900">Search tools...</span>
              <kbd className="inline-flex items-center gap-0.5 text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 shadow-2xs">
                <span>Ctrl</span>
                <span>K</span>
              </kbd>
            </button>

            {/* AI Copilot Button */}
            <button
              type="button"
              onClick={handleOpenAiAssistant}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              title="Ask IntekEdit AI Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform shrink-0" />
              <span>Ask AI</span>
            </button>

            {/* 100% In-Browser Privacy Live Beacon */}
            <Link
              href="/privacy"
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-800 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              title="Air-Gapped Client-Side Processing Guarantee"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-tight text-[11px]">100% On-Device</span>
            </Link>

            {/* IntekChat Companion External Link */}
            <a
              href="https://intekchat.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              title="IntekChat — Free P2P File Sharing & Chat (intekchat.vercel.app)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="whitespace-nowrap">IntekChat</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </a>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-visibility duration-300 ${
          mobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {/* Dimmed Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-In Drawer Panel */}
        <aside
          aria-label="Mobile Navigation Sidebar"
          className={`fixed top-0 right-0 bottom-0 h-full w-[85vw] max-w-sm bg-white border-l border-slate-200 shadow-2xl backdrop-blur-2xl flex flex-col z-10 transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Top Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/70 shrink-0">
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
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none text-xs">
            {/* Ask AI Assistant Mobile Action */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenAiAssistant();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50/60 border border-indigo-200/80 hover:border-indigo-300 flex items-center justify-between text-xs transition-all shadow-xs cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-300 flex items-center justify-center text-indigo-700 shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>IntekEdit AI Copilot</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Private
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ask questions & auto-launch tools
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Quick Search Mobile Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Quick Search (Ctrl + K)</span>
              </div>
              <kbd className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                Search
              </kbd>
            </button>

            {/* IntekChat Companion Link */}
            <div>
              <a
                href="https://intekchat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50/60 border border-sky-200/80 hover:border-sky-300 flex items-center justify-between text-xs transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600/10 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0">
                    <Zap className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>IntekChat</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        P2P Drop
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Direct browser file sharing & live chat
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            </div>

            {/* Tool Categories Quick Cards */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Core Categories
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>PDF Tools</span>
                </Link>
                <Link
                  href="/image"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-cyan-50/80 hover:bg-cyan-100/80 border border-cyan-200/80 text-cyan-800 font-semibold flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Image Tools</span>
                </Link>
                <Link
                  href="/security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 font-semibold flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Security & Sign</span>
                </Link>
                <Link
                  href="/convert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-violet-50/80 hover:bg-violet-100/80 border border-violet-200/80 text-violet-800 font-semibold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>Converters</span>
                </Link>
              </div>
            </div>

            {/* Popular Tools */}
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Popular Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/pdf/compress", label: "Compress PDF" },
                  { href: "/pdf/edit", label: "Edit PDF" },
                  { href: "/pdf/merge", label: "Merge PDF" },
                  { href: "/security/sign", label: "Sign PDF" },
                  { href: "/pdf/split", label: "Split PDF" },
                  { href: "/image/compress", label: "Compress Image" },
                  { href: "/pdf/pdf-to-images", label: "PDF to Images" },
                  { href: "/image/convert", label: "HEIC to JPG" },
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-all truncate font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between text-xs">
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Zero-Upload Guarantee</span>
            </Link>
            <Link
              href="/test-files"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
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
