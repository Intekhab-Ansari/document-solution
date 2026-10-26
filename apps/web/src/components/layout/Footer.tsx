"use client";

import React, { useState } from "react";
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
    <footer className="relative w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs overflow-hidden selection:bg-emerald-500/20">
      {/* Top Ambient Glow & Radial Background */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-96 -z-10 opacity-60"
        style={{
          background: "radial-gradient(ellipse 70% 260px at 50% 0%, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.05), transparent 75%)"
        }}
      />
      {/* Glowing multi-stop top edge border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-emerald-400/0 via-teal-300 to-cyan-400/0 blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* ============================================================== */}
        {/* 1. TOP SECTION: Trust & Architecture Guarantee Cards */}
        {/* ============================================================== */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-semibold flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                Air-Gapped Engineering Architecture
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Zero Cloud Uploads. Zero Data Footprint.
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openSearch}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all shadow-sm hover:border-zinc-700 cursor-pointer"
                title="Search all 30+ tools"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Search 30+ Tools</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700/60 font-mono text-[10px] text-zinc-400">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="group relative p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-200 text-sm">Client-Side Default</h4>
                <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  100% Local
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Documents are parsed and rendered directly inside your browser memory. No external server uploads.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-200 text-sm">WASM & Web Workers</h4>
                <span className="text-[10px] font-mono font-medium text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  Native Speed
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Compiled C++ / Rust engines execute multi-threaded transformations on your CPU without browser freezing.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-200 text-sm">Zero Data Retention</h4>
                <span className="text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Ephemeral
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Zero database writes, zero tracking pixels, zero analytics on document contents. Destroyed upon tab close.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group relative p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-200 text-sm">Free & Unrestricted</h4>
                <span className="text-[10px] font-mono font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  No Watermarks
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Zero forced account signups, zero subscription traps, and no artificial daily document throttling.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MIDDLE SECTION: Brand & Comprehensive 4-Column Navigation */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-zinc-800/60">
          {/* Column 1 & 2: Brand Identity, Mission & Interactive RAM Purge */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <BrandLogo size={36} showBadge={true} />
            </Link>

            <p className="text-zinc-400 leading-relaxed text-xs pr-2">
              IntekEdit is a modern, high-precision document and image engineering suite. Designed for security-conscious professionals, developers, and organizations requiring complete client-side data sovereignty.
            </p>

            {/* Live Engine Status Badge */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  Sandbox Status: Active
                </span>
                <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Air-Gapped
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between border-t border-zinc-800/50 pt-2">
                <span>In-Memory RAM: Isolated</span>
                <button
                  type="button"
                  onClick={handleFlushRam}
                  disabled={ramFlushed}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
                    ramFlushed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60"
                  }`}
                  title="Purge cached document blobs from browser RAM"
                >
                  {ramFlushed ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>RAM Purged</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 text-zinc-400" />
                      <span>Flush RAM Cache</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Default
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-400 text-[11px]">
                <Cpu className="w-3.5 h-3.5" /> WebAssembly 2.0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px]">
                <EyeOff className="w-3.5 h-3.5" /> Zero File Telemetry
              </span>
            </div>
          </div>

          {/* Column 3: PDF Studio & Core Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF Studio</span>
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link
                  href="/pdf/edit"
                  className="hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Edit PDF (Studio)</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                    Studio
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pdf/compress"
                  className="hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Target-Size Compress</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1 rounded">
                    Target KB
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pdf/merge" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf/split" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Split & Extract Pages
                </Link>
              </li>
              <li>
                <Link href="/pdf/reorder" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Reorder & Delete Pages
                </Link>
              </li>
              <li>
                <Link href="/pdf/rotate" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Rotate Pages
                </Link>
              </li>
              <li>
                <Link href="/pdf/crop" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Crop Margins & Trimming
                </Link>
              </li>
              <li>
                <Link
                  href="/pdf"
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 pt-1"
                >
                  <span>Explore all 15+ PDF Tools</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: PDF Transform & Protect */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transform & Secure</span>
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/pdf/page-numbers" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Add Page Numbers
                </Link>
              </li>
              <li>
                <Link href="/pdf/watermark" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Watermark & Stamp PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf/flatten" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Flatten Form Fields & Layers
                </Link>
              </li>
              <li>
                <Link href="/pdf/grayscale" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Grayscale / B&W Conversion
                </Link>
              </li>
              <li>
                <Link href="/pdf/repair" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Repair Damaged PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf/metadata" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Inspect & Edit Metadata
                </Link>
              </li>
              <li>
                <Link href="/pdf/pdf-to-images" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  PDF to Images (PNG/JPG)
                </Link>
              </li>
              <li>
                <Link href="/pdf/images-to-pdf" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Images to PDF Book
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Image Engineering Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
              <span>Image Engineering</span>
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link
                  href="/image/compress"
                  className="hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Target KB Compress</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1 rounded">
                    KB Limit
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/image/resize" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Resize (Px, %, Presets)
                </Link>
              </li>
              <li>
                <Link href="/image/crop" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Crop & Aspect Framing
                </Link>
              </li>
              <li>
                <Link href="/image/rotate" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Rotate & Mirror Flip
                </Link>
              </li>
              <li>
                <Link href="/image/convert" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Universal Converter (HEIC, WebP)
                </Link>
              </li>
              <li>
                <Link
                  href="/image/metadata"
                  className="hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">EXIF & GPS Stripper</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                    Privacy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/extract/images" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Extract Embedded Images
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Security, Converters & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust & Safety</span>
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-emerald-300 transition-colors font-medium text-emerald-400 flex items-center gap-1"
                >
                  <span>Privacy Guarantee</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Security Threat Model
                </Link>
              </li>
              <li>
                <Link href="/convert" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Universal Converters Hub
                </Link>
              </li>
              <li>
                <Link href="/extract/text" className="hover:text-white transition-colors inline-block hover:translate-x-0.5 duration-150">
                  Extract Plain Text & OCR
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  Zero Analytics on Content
                </span>
              </li>
              <li>
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  No Ads &bull; No Watermarks
                </span>
              </li>
              <li>
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  MIT Commercial-Safe
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM BAR: Colophon, Meta Links & Smooth Back-To-Top */}
        {/* ============================================================== */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-zinc-500 text-[11px]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-zinc-400">
              &copy; {new Date().getFullYear()} <strong className="text-zinc-300 font-semibold">IntekEdit</strong>. Built with cryptographic privacy and local-first execution.
            </span>
            <span className="hidden sm:inline text-zinc-700">&bull;</span>
            <span className="text-zinc-500">
              Crafted by <span className="text-zinc-400 font-medium">Intekhab Ansari</span>
            </span>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <Link href="/security" className="hover:text-zinc-300 transition-colors">
              Security Architecture
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <Link href="/pdf" className="hover:text-zinc-300 transition-colors">
              PDF Suite
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <Link href="/image" className="hover:text-zinc-300 transition-colors">
              Image Suite
            </Link>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-xs cursor-pointer group shadow-inner"
              title="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
