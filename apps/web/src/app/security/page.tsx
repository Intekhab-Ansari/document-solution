"use client";

import React, { useState } from "react";
import { CategoryHub } from "@/components/common/CategoryHub";
import { ShieldCheck, Lock, Terminal, CheckCircle2 } from "lucide-react";

export default function SecurityToolsPage() {
  const [activeTab, setActiveTab] = useState<"tools" | "architecture">("tools");

  return (
    <div>
      {/* Tab Switcher at the top of Security Page */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "tools"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Security Tools & Sign
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "architecture"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Security Architecture & STRIDE Model
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero Egress Enforced
          </span>
        </div>
      </div>

      {activeTab === "tools" ? (
        <CategoryHub
          category="security"
          title="Security, Sign & Redaction"
          subtitle="Legally binding digital e-signatures, TRUE irreversible redaction, password encryption, unlocking, and EXIF/GPS metadata stripping without any remote file upload."
          badge="100% Air-Gapped Privacy"
          icon={<ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />}
          acceptMimeTypes="application/pdf,image/*"
          dropzoneTitle="Drop document to secure or sign"
          dropzoneDescription="Processed entirely inside local device RAM."
          sampleFiles={[
            {
              name: "sample_invoice_small.pdf",
              url: "/test-files/sample_invoice_small.pdf",
              label: "📄 Invoice for E-Signing (2 KB)",
              kind: "pdf",
            },
            {
              name: "portrait_with_exif_gps.jpg",
              url: "/test-files/portrait_with_exif_gps.jpg",
              label: "📍 Photo with GPS EXIF (871 KB)",
              kind: "image",
            },
          ]}
        />
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Security Architecture & Threat Model
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Engineered from the ground up to prevent data leakage, untrusted code execution, and unauthorized retention.
            </p>
          </div>

          {/* STRIDE Security Architecture */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> Technical Security Controls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Isolated Web Worker Threads
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Heavy document rendering and binary search iterations run inside separate Web Workers and OffscreenCanvas contexts. Main thread UI execution remains at 60 FPS while keeping memory allocations sandbox-confined.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Memory Hygiene & Zero Local Persistence
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  No document contents or extracted texts are written to localStorage, IndexedDB, or cookies. All object URLs created for instant downloads are explicitly revoked via <code className="text-emerald-400 font-mono">URL.revokeObjectURL()</code>.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strict Content Security Policy (CSP)
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Strict CSP headers prevent third-party tracking scripts, ad networks, and untrusted frames:
                  <code className="block mt-2 p-2 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                    default-src &apos;self&apos;; script-src &apos;self&apos; &apos;wasm-unsafe-eval&apos;; worker-src &apos;self&apos; blob:; frame-ancestors &apos;none&apos;;
                  </code>
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ephemeral RAM File Shredding
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Any complex office conversions run in RAM tmpfs (<code className="text-emerald-400 font-mono">/dev/shm</code>) and are overwritten with multi-pass random data via <code className="text-emerald-400 font-mono">os.urandom</code> before unlinking.
                </p>
              </div>
            </div>
          </div>

          {/* Responsible Disclosure */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Responsible Disclosure Policy (security.txt)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If you discover a security vulnerability or network leakage issue in any of our client-side tools, please report it immediately:
            </p>
            <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`Contact: mailto:security@editanything.dev
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, hi
Canonical: https://editanything.dev/.well-known/security.txt
Policy: https://editanything.dev/security`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
