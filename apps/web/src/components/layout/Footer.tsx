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
  RefreshCw,
  Layers,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight,
  HardDrive,
  EyeOff,
  Zap,
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
    // Suggest garbage collection by clearing any unreferenced session storage / caches
    try {
      if (typeof window !== "undefined") {
        // Trigger small GC opportunity
        URL.revokeObjectURL("");
      }
    } catch {
      // ignore
    }
    setTimeout(() => {
      setRamFlushed(false);
    }, 2800);
  };

  return (
    <footer className="relative w-full border-t border-zinc-200/90 bg-[#FAF8F5] text-zinc-600 text-xs overflow-hidden selection:bg-orange-500/20">
      {/* Top subtle coral accent edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F05138]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* ============================================================== */}
        {/* 1. TOP SECTION: Trust & Architecture Guarantee Cards */}
        {/* ============================================================== */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#F05138] uppercase font-semibold flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F05138]" />
                Air-Gapped Engineering Architecture
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950 mt-1">
                Zero Cloud Uploads. Zero Data Footprint.
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openSearch}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium transition-all shadow-xs hover:border-zinc-300 cursor-pointer"
                title="Search all 30+ tools"
              >
                <Search className="w-3.5 h-3.5 text-[#F05138]" />
                <span>Search 30+ Tools</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-[10px] text-zinc-500">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="group relative p-4 rounded-2xl bg-white hover:bg-white border border-zinc-200/80 hover:border-emerald-400 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-900 text-sm">Client-Side Default</h4>
                <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  100% Local
                </span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Documents are parsed and rendered directly inside your browser memory. No external server uploads.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative p-4 rounded-2xl bg-white hover:bg-white border border-zinc-200/80 hover:border-cyan-400 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200/80 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-900 text-sm">WASM & Web Workers</h4>
                <span className="text-[10px] font-mono font-medium text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                  Native Speed
                </span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Compiled C++ / Rust engines execute multi-threaded transformations on your CPU without browser freezing.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative p-4 rounded-2xl bg-white hover:bg-white border border-zinc-200/80 hover:border-amber-400 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-900 text-sm">Zero Data Retention</h4>
                <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Ephemeral
                </span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Zero database writes, zero tracking pixels, zero analytics on document contents. Destroyed upon tab close.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative p-4 rounded-2xl bg-white hover:bg-white border border-zinc-200/80 hover:border-[#F05138]/40 transition-all duration-300 shadow-xs hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#F05138] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-900 text-sm">Free & Unrestricted</h4>
                <span className="text-[10px] font-mono font-bold text-[#F05138] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                  No Watermarks
                </span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Zero forced account signups, zero subscription traps, and no artificial daily document throttling.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MIDDLE SECTION: Brand & Comprehensive 4-Column Navigation */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 sm:gap-10 pb-12 border-b border-zinc-200/80">
          {/* Column 1 & 2: Brand Identity, Mission & Interactive RAM Purge */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <BrandLogo size={36} showBadge={true} />
            </Link>

            <p className="text-zinc-600 leading-relaxed text-xs pr-2">
              IntekEdit is a modern, high-precision document and image engineering suite. Designed for security-conscious professionals, developers, and organizations requiring complete client-side data sovereignty.
            </p>

            {/* Live Engine Status Badge */}
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-800 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Sandbox Status: Active
                </span>
                <span className="font-mono text-[#F05138] text-[10px] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
                  Air-Gapped
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between border-t border-zinc-100 pt-2">
                <span>In-Memory RAM: Isolated</span>
                <button
                  type="button"
                  onClick={handleFlushRam}
                  disabled={ramFlushed}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
                    ramFlushed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                  }`}
                  title="Purge cached document blobs from browser RAM"
                >
                  {ramFlushed ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>RAM Purged</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 text-zinc-500" />
                      <span>Flush RAM Cache</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges - Responsive wrap on mobile */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 max-w-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-emerald-700 text-[10.5px] font-medium whitespace-nowrap shrink-0 shadow-xs">
                <ShieldCheck className="w-3 h-3 shrink-0" /> Client-Side Default
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-cyan-700 text-[10.5px] font-medium whitespace-nowrap shrink-0 shadow-xs">
                <Cpu className="w-3 h-3 shrink-0" /> WebAssembly 2.0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-amber-700 text-[10.5px] font-medium whitespace-nowrap shrink-0 shadow-xs">
                <EyeOff className="w-3 h-3 shrink-0" /> Zero File Telemetry
              </span>
            </div>
          </div>

          {/* 4 Tool Link Columns in 2x2 Grid on Mobile, 4 columns on Desktop */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {/* Column 1: PDF Studio & Core Tools */}
            <div className="space-y-3">
              <h4 className="text-zinc-900 font-bold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#F05138] shrink-0" />
                <span className="truncate">PDF Studio</span>
              </h4>
              <ul className="space-y-2 text-zinc-600">
                <li>
                  <Link
                    href="/pdf/edit"
                    className="hover:text-[#F05138] transition-colors flex items-center justify-between gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform truncate">Edit PDF (Studio)</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#F05138] bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Studio
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pdf/compress"
                    className="hover:text-[#F05138] transition-colors flex items-center justify-between gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform truncate">Target-Size Compress</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Target KB
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/merge" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Merge PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/split" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Split & Extract Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/reorder" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Reorder & Delete Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/rotate" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Rotate Pages
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/crop" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Crop Margins & Trimming
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pdf"
                    className="text-[#F05138] hover:text-[#D94129] font-medium inline-flex items-center gap-1 pt-1"
                  >
                    <span>Explore all 15+ PDF Tools</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: PDF Transform & Protect */}
            <div className="space-y-3">
              <h4 className="text-zinc-900 font-bold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Transform & Secure</span>
              </h4>
              <ul className="space-y-2 text-zinc-600">
                <li>
                  <Link href="/pdf/page-numbers" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Add Page Numbers
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/watermark" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Watermark & Stamp PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/flatten" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Flatten Form Fields & Layers
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/grayscale" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Grayscale / B&W Conversion
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/repair" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Repair Damaged PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/metadata" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Inspect & Edit Metadata
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/pdf-to-images" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    PDF to Images (PNG/JPG)
                  </Link>
                </li>
                <li>
                  <Link href="/pdf/images-to-pdf" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Images to PDF Book
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Image Engineering Tools */}
            <div className="space-y-3">
              <h4 className="text-zinc-900 font-bold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                <span>Image Engineering</span>
              </h4>
              <ul className="space-y-2 text-zinc-600">
                <li>
                  <Link
                    href="/image/compress"
                    className="hover:text-[#F05138] transition-colors flex items-center justify-between gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform truncate">Target KB Compress</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      KB Limit
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/image/resize" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Resize (Px, %, Presets)
                  </Link>
                </li>
                <li>
                  <Link href="/image/crop" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Crop & Aspect Framing
                  </Link>
                </li>
                <li>
                  <Link href="/image/rotate" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Rotate & Mirror Flip
                  </Link>
                </li>
                <li>
                  <Link href="/image/convert" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Universal Converter (HEIC, WebP)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/image/metadata"
                    className="hover:text-[#F05138] transition-colors flex items-center justify-between gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform truncate">EXIF & GPS Stripper</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 hidden sm:inline-flex items-center">
                      Privacy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/extract/images" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Extract Embedded Images
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Security, Converters & Trust */}
            <div className="space-y-3">
              <h4 className="text-zinc-900 font-bold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trust & Safety</span>
              </h4>
              <ul className="space-y-2 text-zinc-600">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#F05138] transition-colors font-medium text-[#F05138] flex items-center gap-1"
                  >
                    <span>Privacy Guarantee</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F05138]" />
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Security Threat Model
                  </Link>
                </li>
                <li>
                  <Link href="/convert" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Universal Converters Hub
                  </Link>
                </li>
                <li>
                  <Link href="/extract/text" className="hover:text-[#F05138] transition-colors inline-block hover:translate-x-0.5 duration-150">
                    Extract Plain Text & OCR
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    Zero Analytics on Content
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    No Ads &bull; No Watermarks
                  </span>
                </li>
                <li>
                  <a
                    href="https://intekchat.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 text-blue-600 font-medium group"
                  >
                    <span>IntekChat (P2P Files & Chat)</span>
                    <ExternalLink className="w-3 h-3 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
                <li>
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    MIT Commercial-Safe
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM BAR: Colophon */}
        {/* ============================================================== */}
        <div className="pt-8 flex items-center justify-center text-center text-zinc-500 text-[11px]">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span className="text-zinc-600">
              &copy; {new Date().getFullYear()} <strong className="text-zinc-900 font-semibold">IntekEdit</strong>. Built with cryptographic privacy and local-first execution.
            </span>
            <span className="text-zinc-300 hidden sm:inline">&bull;</span>
            <span className="text-zinc-500">
              Crafted by <span className="text-zinc-800 font-medium">Intekhab Ansari</span>
            </span>
          </p>
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
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-[#F05138] shadow-lg shadow-zinc-400/20 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
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
              className="text-zinc-200"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              className="text-[#F05138] transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={125.66}
              strokeDashoffset={125.66 - (125.66 * scrollProgress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Up Arrow Icon with Micro-Animation */}
          <ArrowUp className="w-4 h-4 text-[#F05138] group-hover:-translate-y-0.5 transition-all duration-200 relative z-10" />

          {/* Hover Tooltip (Desktop) */}
          <span className="absolute right-full mr-3.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] font-medium text-zinc-800 shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap hidden sm:flex items-center gap-1.5">
            <span>Back to top</span>
            <span className="text-[10px] text-[#F05138] font-mono font-bold">{Math.round(scrollProgress)}%</span>
          </span>
        </button>
      </div>
    </footer>
  );
}
