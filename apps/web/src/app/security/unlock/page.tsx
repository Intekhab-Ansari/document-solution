"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { PdfEditingSidebar } from "@/components/layout/PdfEditingSidebar";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { unlockPdf, checkIfPdfIsEncrypted } from "@/lib/pdf/pdf-security";
import {
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Download,
  Sparkles,
  KeyRound,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);

  // Password state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [unlockedBytes, setUnlockedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setUnlockedBytes(null);
    setErrorMessage(null);
    setPassword("");

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);

      const encrypted = await checkIfPdfIsEncrypted(bytes);
      setIsEncrypted(encrypted);
    } catch (err) {
      console.error(err);
      alert("Error inspecting PDF: " + (err as Error).message);
    }
  };

  const handleUnlock = async () => {
    if (!fileBytes || !file) return;
    setErrorMessage(null);

    setIsProcessing(true);
    setProgress({ percent: 40, stage: "Decrypting security streams and stripping restrictions..." });

    try {
      const decrypted = await unlockPdf(fileBytes, password);
      setUnlockedBytes(decrypted);
      setProgress({ percent: 100, stage: "Document successfully unlocked!" });
    } catch (err) {
      console.error(err);
      setErrorMessage((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBuffer(unlockedBytes, `${baseName}_unlocked.pdf`, "application/pdf");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950">
      <div className="px-4 py-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-900/40">
        <ToolWorkspaceHeader
          title="Unlock PDF (Remove Password)"
          description="Remove password protection, print restrictions, and editing locks from your PDF. Decrypted 100% locally in browser memory without sending files to any server."
          category="security"
          categoryLabel="Security & Privacy"
          icon={<Unlock className="w-5 h-5 text-emerald-400" />}
          badge="100% In-Browser"
          currentStep={!file ? 1 : !unlockedBytes ? 2 : 3}
        />
      </div>

      {!file ? (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop protected PDF here to unlock"
            description="Remove open passwords and security locks permanently."
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
            activeToolId="unlock"
            fileName={file.name}
            fileSize={file.size}
            onChangeFile={() => setFile(null)}
          />

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-2xl mx-auto w-full">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    Unlock Document
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter the current document password to permanently remove encryption and enable editing.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Document Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUnlock();
                    }}
                    placeholder={isEncrypted ? "Enter the PDF password" : "No password needed (or enter owner password)"}
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
                <p className="text-[11px] text-zinc-500">
                  Tip: If the document has permission restrictions only (no open password), you can click Unlock directly.
                </p>
              </div>

              {/* Decrypt Action */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                {!unlockedBytes ? (
                  <button
                    type="button"
                    onClick={handleUnlock}
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock & Remove Password</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Unlocked PDF ({formatBytes(unlockedBytes.byteLength)})</span>
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
        title="Unlocking PDF..."
      />
    </div>
  );
}
