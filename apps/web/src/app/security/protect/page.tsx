"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { PdfEditingSidebar } from "@/components/layout/PdfEditingSidebar";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { protectPdfWithPassword } from "@/lib/pdf/pdf-security";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Download,
  Sparkles,
  KeyRound,
  Printer,
  Copy,
  Edit3,
} from "lucide-react";

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keyLength, setKeyLength] = useState<256 | 128>(256);

  // Permission restrictions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [protectedBytes, setProtectedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setProtectedBytes(null);
    setErrorMessage(null);

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);

      const info = await getPdfInfo(bytes);
      setPageCount(info.pageCount);
    } catch (err) {
      console.error(err);
      alert("Error loading PDF: " + (err as Error).message);
    }
  };

  const handleProtect = async () => {
    if (!fileBytes || !file) return;
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage("Please enter a password to protect your document.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsProcessing(true);
    setProgress({ percent: 35, stage: "Encrypting PDF with AES-256 WebAssembly cipher..." });

    try {
      const encrypted = await protectPdfWithPassword(fileBytes, {
        userPassword: password,
        keyLength,
        allowPrinting,
        allowCopying,
        allowModifying,
      });

      setProtectedBytes(encrypted);
      setProgress({ percent: 100, stage: "Encryption complete!" });
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!protectedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBuffer(protectedBytes, `${baseName}_protected.pdf`, "application/pdf");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950">
      <div className="px-4 py-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-900/40">
        <ToolWorkspaceHeader
          title="Password Protect PDF"
          description="Encrypt your PDF with standard AES-256 encryption. Prevent unauthorized viewing, copying, or printing. Processed 100% locally in browser memory."
          category="security"
          categoryLabel="Security & Privacy"
          icon={<Lock className="w-5 h-5 text-emerald-400" />}
          badge="AES-256 Bit"
          currentStep={!file ? 1 : !protectedBytes ? 2 : 3}
        />
      </div>

      {!file ? (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to encrypt with password"
            description="Protect sensitive contracts, financial records, or medical documents."
            sampleFiles={[
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 Sample Invoice (2 KB)",
                kind: "pdf",
              },
            ]}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <PdfEditingSidebar
            activeToolId="protect"
            fileName={file.name}
            fileSize={file.size}
            pageCount={pageCount}
            onChangeFile={() => setFile(null)}
          />

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto w-full">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    Set Document Password
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Users will be prompted for this password each time they open the PDF in Adobe Acrobat or browser viewers.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Document Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Cipher Strength Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Encryption Standard
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setKeyLength(256)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      keyLength === 256
                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white flex items-center justify-between">
                      <span>AES-256 Bit</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Military-grade standard. Compatible with Acrobat 9.0+ & modern browsers.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeyLength(128)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      keyLength === 128
                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">AES-128 Bit</div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Legacy standard. Compatible with older PDF readers (Acrobat 7.0+).
                    </p>
                  </button>
                </div>
              </div>

              {/* Security Permissions */}
              <div className="pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-semibold text-zinc-300 mb-3">
                  Permissions & Document Restrictions
                </label>
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={allowPrinting}
                      onChange={(e) => setAllowPrinting(e.target.checked)}
                      className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-zinc-400" />
                      <span>Allow High-Resolution Document Printing</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={allowCopying}
                      onChange={(e) => setAllowCopying(e.target.checked)}
                      className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Allow Content Copying (Extract text and images)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={allowModifying}
                      onChange={(e) => setAllowModifying(e.target.checked)}
                      className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-zinc-400" />
                      <span>Allow Page Modifications and Form Filling</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                {!protectedBytes ? (
                  <button
                    type="button"
                    onClick={handleProtect}
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Encrypt & Protect PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Encrypted PDF ({formatBytes(protectedBytes.byteLength)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Encrypting PDF..."
      />
    </div>
  );
}
