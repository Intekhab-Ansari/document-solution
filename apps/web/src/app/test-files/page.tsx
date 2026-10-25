"use client";

import React from "react";
import Link from "next/link";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { Download, FileText, Image as ImageIcon, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function TestFilesHubPage() {
  const SAMPLES = [
    {
      name: "sample_id_card.pdf",
      title: "Government Identity & Aadhaar Card (Vector)",
      desc: "Single-page vector ID card with names, dates of birth, ID numbers, photo box, and address fields (~1.5 KB). Ideal for testing the Edit PDF Studio with direct in-place text replacement, font sizing, and color palette.",
      type: "Vector PDF",
      size: "1.5 KB",
      href: "/test-files/sample_id_card.pdf",
      testToolHref: "/pdf/edit",
      testToolName: "Test in Edit PDF Studio",
      badge: "In-Place Text Editor",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "sample_scanned_contract_large.pdf",
      title: "Scanned Multi-Page Contract PDF",
      desc: "Heavy multi-page scanned document with high-resolution page imagery and embedded text operators (~875 KB). Ideal for testing target-size compression (e.g. shrinking to 200 KB or 100 KB).",
      type: "PDF Document",
      size: "875 KB",
      href: "/test-files/sample_scanned_contract_large.pdf",
      testToolHref: "/pdf/compress",
      testToolName: "Test in Compress PDF",
      badge: "Compression Benchmark",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "sample_invoice_small.pdf",
      title: "Clean Business Invoice (Vector)",
      desc: "2-page crisp vector invoice with table layout and clean typography (~2 KB). Great for testing Split, Page Numbers, Watermark, and Crop.",
      type: "PDF Document",
      size: "2.1 KB",
      href: "/test-files/sample_invoice_small.pdf",
      testToolHref: "/pdf/split",
      testToolName: "Test in Split & Extract",
      badge: "Vector PDF",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
    {
      name: "portrait_curly_hair.jpg",
      title: "High-Res Studio Portrait (Curly Hair)",
      desc: "Detailed 1024x1024 studio portrait with fine hair flyaways, facial texture, and vibrant backdrop (~870 KB). Ideal for testing Image Compress, Resize, Crop, and Background Matting.",
      type: "JPEG Photo",
      size: "870 KB",
      href: "/test-files/portrait_curly_hair.jpg",
      testToolHref: "/image/compress",
      testToolName: "Test in Image Compress",
      badge: "Hair Matting Test",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      name: "portrait_with_exif_gps.jpg",
      title: "Photo with Embedded EXIF & GPS Tags",
      desc: "Contains Sony Alpha 7 IV camera model, 2026 timestamp, and New Delhi GPS coordinates. Perfect for testing the EXIF Viewer and 1-Click Stripper.",
      type: "JPEG with EXIF",
      size: "871 KB",
      href: "/test-files/portrait_with_exif_gps.jpg",
      testToolHref: "/image/metadata",
      testToolName: "Test in EXIF Stripper",
      badge: "Privacy Audit",
      badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
    {
      name: "document_pages_to_merge_1.pdf",
      title: "Merge Document — Part 1 (3 Pages)",
      desc: "First segment for testing multi-file PDF merge (~1.3 KB).",
      type: "PDF Document",
      size: "1.3 KB",
      href: "/test-files/document_pages_to_merge_1.pdf",
      testToolHref: "/pdf/merge",
      testToolName: "Test in Merge PDF",
      badge: "Merge Test",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      name: "document_pages_to_merge_2.pdf",
      title: "Merge Document — Part 2 (2 Pages)",
      desc: "Second segment for testing multi-file PDF merge (~1.1 KB).",
      type: "PDF Document",
      size: "1.1 KB",
      href: "/test-files/document_pages_to_merge_2.pdf",
      testToolHref: "/pdf/merge",
      testToolName: "Test in Merge PDF",
      badge: "Merge Test",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      name: "sample_transparent_logo.png",
      title: "Transparent RGBA PNG",
      desc: "Alpha channel graphic to test converting transparent PNGs to JPEG with custom background color fill.",
      type: "PNG Image",
      size: "118 Bytes",
      href: "/test-files/sample_transparent_logo.png",
      testToolHref: "/image/convert",
      testToolName: "Test in Convert Format",
      badge: "Alpha Channel",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      name: "sample_iphone_photo.heic",
      title: "Apple iPhone HEIC Container",
      desc: "Authentic HEIC/HEIF container file with ftypheic/mif1 brand tags to test browser-side heic2any decoding.",
      type: "HEIC Container",
      size: "40 Bytes",
      href: "/test-files/sample_iphone_photo.heic",
      testToolHref: "/image/convert",
      testToolName: "Test in HEIC Decoder",
      badge: "HEIC Format",
      badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center space-y-4 mb-12">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Test Files & Benchmarking Hub
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Pre-generated test fixtures to verify every tool in IntekEdit: high-res scanned PDFs, curly hair portraits, EXIF GPS photos, vector invoices, and HEIC files.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLES.map((item) => (
          <div
            key={item.name}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex flex-col justify-between transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="font-mono text-xs text-zinc-500">{item.size}</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{item.title}</h3>
                <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{item.name}</p>
                <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/60 flex items-center justify-between gap-3 mt-4">
              <a
                href={item.href}
                download={item.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </a>

              <Link
                href={item.testToolHref}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/15"
              >
                <span>{item.testToolName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
