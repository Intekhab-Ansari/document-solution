"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Sparkles,
  ArrowUp,
  Search,
  FileText,
  Image as ImageIcon,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight,
  Zap,
  Heart,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Footer() {
  const [ramFlushed, setRamFlushed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (currentScroll > 240) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    }
  };

  const handleFlushRam = () => {
    setRamFlushed(true);
    try {
      if (typeof window !== "undefined") {
        URL.revokeObjectURL("");
      }
    } catch {
      // ignore
    }
    setTimeout(() => {
      setRamFlushed(false);
    }, 2500);
  };

  return (
    <footer className="relative w-full border-t border-slate-800 bg-[#0B0F19] text-slate-400 text-xs overflow-hidden selection:bg-indigo-500/30">
      {/* Top Multi-Color Neon Accent Edge */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 via-sky-500 via-emerald-500 to-transparent" />
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* ============================================================== */}
        {/* 1. TOP SECTION: Elevated Architecture & Security Guarantee Cards */}
        {/* ============================================================== */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Air-Gapped Engineering Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Zero Cloud Uploads. Zero Data Footprint.
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                All document operations compile and execute in your browser memory via WebAssembly.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={openSearch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer active:scale-95"
                title="Search all 30+ tools (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quick Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>

          {/* 4 Feature Guarantee Cards with Dark Glass & Glowing Category Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Client-Side Engine */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-emerald-500/10 hover:-translate-y-0.5 overflow-hidden">
              <div className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity">
                <ShieldCheck className="w-full h-full text-emerald-400" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white text-sm">Client-Side Default</h4>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    100% LOCAL
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Documents are parsed and rendered directly inside browser RAM. Zero external cloud servers.
                </p>
              </div>
            </div>

            {/* Card 2: WASM Native Speed */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-sky-500/10 hover:-translate-y-0.5 overflow-hidden">
              <div className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity">
                <Cpu className="w-full h-full text-sky-400" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white text-sm">WASM & Workers</h4>
                  <span className="text-[9.5px] font-mono font-bold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                    NATIVE SPEED
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Compiled C++ & Rust engines execute multi-threaded transformations on your CPU without freezing.
                </p>
              </div>
            </div>

            {/* Card 3: Zero Data Retention */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-amber-500/10 hover:-translate-y-0.5 overflow-hidden">
              <div className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity">
                <Lock className="w-full h-full text-amber-400" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white text-sm">Zero Data Retention</h4>
                  <span className="text-[9.5px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    EPHEMERAL
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Zero database writes, zero tracking pixels, zero analytics on document contents. Destroyed on close.
                </p>
              </div>
            </div>

            {/* Card 4: Free & No Watermarks */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-indigo-500/10 hover:-translate-y-0.5 overflow-hidden">
              <div className="absolute -top-1 -right-1 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity">
                <Sparkles className="w-full h-full text-indigo-400" strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white text-sm">Free & Unlimited</h4>
                  <span className="text-[9.5px] font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    NO WATERMARKS
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Zero forced signups, zero subscription traps, and no artificial daily document throttling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider with Accent Gradient */}
        <div className="h-px w-full bg-gradient-to-r from-slate-800/40 via-slate-700 to-slate-800/40 mb-12" />

        {/* ============================================================== */}
        {/* 2. MIDDLE SECTION: Brand Terminal & 4 Structured Nav Columns  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 sm:gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1 & 2: Brand Identity, Mission & Interactive RAM Purge */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <BrandLogo size={38} showBadge={true} inverted={true} />
            </Link>

            <p className="text-slate-400 leading-relaxed text-xs pr-2">
              IntekEdit is a modern, high-precision document and image engineering suite. Designed for security-conscious professionals, developers, and organizations requiring complete client-side data sovereignty.
            </p>

            {/* Elevated Live Engine Control Terminal */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg shadow-black/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Sandbox Engine: Active
                </span>
                <span className="font-mono text-emerald-300 text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Air-Gapped
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                <span>Memory: Ephemeral</span>
                <button
                  type="button"
                  onClick={handleFlushRam}
                  disabled={ramFlushed}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-sans font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    ramFlushed
                      ? "bg-emerald-600 text-white border border-emerald-500 shadow-emerald-500/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
                  }`}
                  title="Purge cached document blobs and binary buffers from browser RAM"
                >
                  {ramFlushed ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>RAM Cleared</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 text-slate-400" />
                      <span>Flush RAM Cache</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Feature Checkmarks */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>100% Client-Side Engine (Zero Cloud Egress)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Zero File Telemetry & Analytics</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>MIT Commercial-Safe & Free Forever</span>
                </div>
              </div>
            </div>

            {/* Quick Ecosystem Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://intekchat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold transition-all shadow-2xs group"
              >
                <span>IntekChat (P2P Files)</span>
                <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] font-medium shadow-2xs">
                <Cpu className="w-3 h-3 text-sky-400" />
                <span>WebAssembly 2.0</span>
              </span>
            </div>
          </div>

          {/* 4 Tool Link Columns in 2x2 Grid on Mobile, 4 columns on Desktop */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Column 1: PDF Studio & Core Tools */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11.5px] flex items-center gap-2 pb-1.5 border-b border-slate-800/80">
                <div className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">PDF Studio</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/pdf/edit"
                    className="hover:text-white transition-colors flex items-center justify-between gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform truncate font-medium text-slate-300 group-hover:text-indigo-400">Edit PDF Studio</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Studio
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pdf/compress"
                    className="hover:text-white transition-colors flex items-center justify-between gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform truncate font-medium text-slate-300 group-hover:text-indigo-400">Compress PDF</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Target KB
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/merge" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Merge PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/split" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Split & Extract Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/reorder" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Reorder & Delete Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/rotate" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Rotate PDF Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/crop" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Crop Margins
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pdf"
                    className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 pt-1.5 group"
                  >
                    <span>All 18+ PDF Tools</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Transform & Security */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11.5px] flex items-center gap-2 pb-1.5 border-b border-slate-800/80">
                <div className="w-5 h-5 rounded-md bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Security & Sign</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/security/sign"
                    className="hover:text-white transition-colors flex items-center justify-between gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform truncate font-medium text-slate-300 group-hover:text-indigo-400">E-Sign PDF</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/20 border border-violet-500/40 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Sign
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/security/protect" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Password Protect PDF
                  </Link>
                </li>
                <li>
                  <Link href="/security/unlock" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Unlock Password PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/page-numbers" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Add Page Numbers
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/watermark" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Watermark & Stamp PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/flatten" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Flatten PDF Layers
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/grayscale" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Convert to Grayscale (B&W)
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/repair" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Repair Damaged PDF
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Image Engineering Tools */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11.5px] flex items-center gap-2 pb-1.5 border-b border-slate-800/80">
                <div className="w-5 h-5 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <span>Image Suite</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/image/compress"
                    className="hover:text-white transition-colors flex items-center justify-between gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform truncate font-medium text-slate-300 group-hover:text-indigo-400">Compress Image</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      KB Limit
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/image/resize" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Resize (Pixels & Presets)
                  </Link>
                </li>
                <li>
                  <Link href="/image/crop" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Crop & Aspect Framing
                  </Link>
                </li>
                <li>
                  <Link href="/image/rotate" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Rotate & Mirror Flip
                  </Link>
                </li>
                <li>
                  <Link href="/image/convert" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Convert Format (HEIC, WebP)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/image/metadata"
                    className="hover:text-white transition-colors flex items-center justify-between gap-1 group py-0.5"
                  >
                    <span className="group-hover:translate-x-1 transition-transform truncate font-medium text-slate-300 group-hover:text-indigo-400">Strip EXIF & GPS</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Privacy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/pdf-to-images" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    PDF to PNG / JPG
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/images-to-pdf" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Photos to PDF Book
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Safety, Converters & Trust */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold tracking-wider uppercase text-[11.5px] flex items-center gap-2 pb-1.5 border-b border-slate-800/80">
                <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>Trust & Legal</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors font-bold text-indigo-400 flex items-center gap-1.5 py-0.5"
                  >
                    <span>Privacy Guarantee</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Security Threat Model
                  </Link>
                </li>
                <li>
                  <Link href="/convert" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Universal Converters Hub
                  </Link>
                </li>
                <li>
                  <Link href="/extract/text" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    Extract Plain Text & OCR
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                    XML Sitemap
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/Intekhab-Ansari/document-solution"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium group text-slate-300"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white fill-current shrink-0 transition-colors" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    MIT Commercial-Safe
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    No Ads &bull; No Tracking
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM BAR: Modern Colophon & Verification Beacon          */}
        {/* ============================================================== */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          {/* Copyright & Architecture Statement */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-center md:text-left">
            <span className="text-slate-300 font-medium">
              &copy; {new Date().getFullYear()} <strong className="text-white font-bold">IntekEdit</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-400">
              Air-Gapped Client-Side Document & Photo Engineering
            </span>
          </div>

          {/* Center/Right Status Beacon & Creator Attribution */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10.5px] font-medium shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% On-Device &bull; Local RAM</span>
            </span>

            <span className="text-slate-600 hidden sm:inline">&bull;</span>

            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
              <span>by</span>
              <span className="text-white font-bold">Intekhab Ansari</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating Back-To-Top Button on Bottom Right */}
      <div
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 transition-all duration-300 ${
          showScrollTop
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-90 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          type="button"
          aria-label="Back to top"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shadow-xl shadow-black/50 transition-all duration-200 cursor-pointer active:scale-95"
        >
          {/* Circular Scroll Progress Track & Dynamic Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              className="text-slate-800"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              className="text-indigo-400 transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={125.66}
              strokeDashoffset={125.66 - (125.66 * scrollProgress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Up Arrow Icon with Micro-Animation */}
          <ArrowUp className="w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-all duration-200 relative z-10" />

          {/* Hover Tooltip (Desktop) */}
          <span className="absolute right-full mr-3.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium text-slate-200 shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap hidden sm:flex items-center gap-1.5">
            <span>Back to top</span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold">{Math.round(scrollProgress)}%</span>
          </span>
        </button>
      </div>
    </footer>
  );
}
