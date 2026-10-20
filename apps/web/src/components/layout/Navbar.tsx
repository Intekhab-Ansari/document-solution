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
  FileCheck,
  Search,
  PenTool,
  Binary,
  Layers,
  Wrench,
  FileCode,
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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="shrink-0 flex items-center">
            <BrandLogo size={36} />
          </Link>

          {/* Quick Search Bar Button (Opens Command Palette) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-all w-40 sm:w-52 lg:w-44 xl:w-60 shrink shadow-inner whitespace-nowrap"
            title="Search all 30+ tools (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Search 30+ tools...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-zinc-950 border border-zinc-700/60 font-mono text-[10px] text-zinc-400 shrink-0">
              Ctrl K
            </kbd>
          </button>

          {/* Desktop Mega-Menu Nav */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-zinc-400 whitespace-nowrap shrink-0">
            {/* 1. PDF Tools Mega Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/pdf"
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">PDF Tools</span>
              </Link>
              <div className="absolute left-0 top-full pt-2 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-1">
                  <Link
                    href="/pdf"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20 transition-colors mb-1"
                  >
                    <span>Explore All PDF Tools (13+)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/pdf/edit"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-100 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                      Edit PDF (Text & Colors)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold uppercase">
                      Studio
                    </span>
                  </Link>
                  <Link
                    href="/pdf/compress"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                      Compress (Target KB)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <Scissors className="w-3.5 h-3.5 text-blue-400" />
                    Split & Extract Pages
                  </Link>
                  <Link
                    href="/pdf/reorder"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Reorder & Delete Pages
                  </Link>
                  <Link
                    href="/pdf/rotate"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Rotate PDF Pages
                  </Link>
                  <Link
                    href="/pdf/page-numbers"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Add Page Numbers
                  </Link>
                  <Link
                    href="/pdf/watermark"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Watermark PDF
                  </Link>
                  <Link
                    href="/pdf/flatten"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Flatten Forms & Annotations
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded font-bold">
                      New
                    </span>
                  </Link>
                  <Link
                    href="/pdf/grayscale"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Convert to Grayscale (B&W)
                  </Link>
                  <Link
                    href="/pdf/repair"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Repair Corrupted PDF
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Image Tools Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/image"
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap">Image Tools</span>
              </Link>
              <div className="absolute left-0 top-full pt-2 w-72 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-1">
                  <Link
                    href="/image"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold border border-cyan-500/20 transition-colors mb-1"
                  >
                    <span>Explore All Image Tools (6+)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/image/compress"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                      Compress Image (Target KB)
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded font-bold">
                      Exact KB
                    </span>
                  </Link>
                  <Link
                    href="/image/resize"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Resize Pixels & Presets
                  </Link>
                  <Link
                    href="/image/crop"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Crop Image & Aspect Ratios
                  </Link>
                  <Link
                    href="/image/rotate"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Rotate & Mirror Flip
                  </Link>
                  <Link
                    href="/image/convert"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Universal Convert (incl. HEIC)
                  </Link>
                  <Link
                    href="/image/metadata"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Strip EXIF & GPS
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
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
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Sign & Extract</span>
              </Link>
              <div className="absolute left-0 top-full pt-2 w-72 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-1">
                  <Link
                    href="/security"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20 transition-colors mb-1"
                  >
                    <span>Security & Sign Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/security/sign"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                      E-Sign Document (Digital Signature)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
                      Popular
                    </span>
                  </Link>
                  <Link
                    href="/extract/text"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    Extract Text & Markdown
                  </Link>
                  <Link
                    href="/extract/images"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Extract Embedded Images (ZIP)
                  </Link>
                  <Link
                    href="/image/metadata"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Strip GPS & EXIF Metadata
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. Converters Dropdown */}
            <div className="relative group shrink-0">
              <Link
                href="/convert"
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="whitespace-nowrap">Converters</span>
              </Link>
              <div className="absolute left-0 top-full pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-1">
                  <Link
                    href="/convert"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 text-xs font-semibold border border-violet-500/20 transition-colors mb-1"
                  >
                    <span>View All Converters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/pdf/pdf-to-images"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    PDF to Images (PNG/JPG)
                  </Link>
                  <Link
                    href="/pdf/images-to-pdf"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Images to PDF
                  </Link>
                  <Link
                    href="/image/convert"
                    className="block px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 text-xs transition-colors"
                  >
                    Image Format Converter
                  </Link>
                </div>
              </div>
            </div>

            {/* 5. Privacy Link */}
            <Link
              href="/privacy"
              className="flex items-center gap-1.5 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Privacy</span>
            </Link>
          </nav>

          {/* Right Badge & Quick Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">100% In-Browser</span>
            </div>
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
