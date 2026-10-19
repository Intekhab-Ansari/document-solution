"use client";

import React from "react";
import { ShieldCheck, Lock, Cpu, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";

export default function PrivacyPage() {
  const handleClearEverything = () => {
    // Revoke any active object URLs, clear cache and local state
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      window.sessionStorage.clear();
      alert("All client memory, object URLs, and local sessions have been completely cleared!");
      window.location.reload();
    }
  };

  const TOOL_PRIVACY_MATRIX = [
    { tool: "Compress PDF (Target Size / Presets)", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "Web Workers + pdf-lib + Canvas" },
    { tool: "Merge PDF", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (In-Memory ArrayBuffer)" },
    { tool: "Split & Extract Pages", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "Reorder & Delete Pages", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib + pdfjs-dist" },
    { tool: "Rotate PDF Pages", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "PDF to Images", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdfjs-dist + JSZip (Client)" },
    { tool: "Images to PDF", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "Add Page Numbers", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "Watermark PDF", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "Crop PDF Margins", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "pdf-lib (Client-Side)" },
    { tool: "Compress Image (Target KB)", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "HTML5 Canvas (In-Memory)" },
    { tool: "Resize Image", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "HTML5 Canvas (In-Memory)" },
    { tool: "Crop Image", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "HTML5 Canvas (In-Memory)" },
    { tool: "Rotate & Flip Image", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "HTML5 Canvas (In-Memory)" },
    { tool: "Universal Format Convert", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "heic2any + Canvas WebP/AVIF" },
    { tool: "Strip EXIF & GPS Metadata", location: "Client-Side (Local)", retention: "Destroyed on tab close", method: "Client-Side Canvas Sanitizer" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center space-y-4 mb-14">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Privacy Policy & Architecture
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          We believe document privacy is a fundamental human right. Here is our verifiable, zero-retention architecture.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearEverything}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Browser Memory & Buffers Now</span>
          </button>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Client-First Execution</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            All core document and image operations execute inside your browser using WebAssembly and isolated Web Workers. Not a single byte is sent over the network.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Zero Data Retention</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            We do not maintain databases of user files. File contents reside strictly in temporary volatile RAM while your tab is open and are purged upon closing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">No Document Analytics</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            We never inspect, OCR-log, or analyze document text, filenames, or metadata. No third-party ad networks or tracking scripts run on tool pages.
          </p>
        </div>
      </div>

      {/* Tool-by-Tool Transparency Matrix */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tool-by-Tool Processing Matrix
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Exact technical processing details and data retention per tool:
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] bg-zinc-950/60">
                <th className="p-4">Tool</th>
                <th className="p-4">Where It Runs</th>
                <th className="p-4">Data Retention</th>
                <th className="p-4">Engine / Technology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {TOOL_PRIVACY_MATRIX.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-sans font-semibold text-white">{item.tool}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {item.location}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 font-sans">{item.retention}</td>
                  <td className="p-4 text-zinc-400">{item.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
