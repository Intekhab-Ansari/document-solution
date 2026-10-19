"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { repairPdfDocument } from "@/lib/pdf/pdf-advanced";
import { renderPdfPageToCanvas } from "@/lib/pdf/pdf-render";
import { formatBytes } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  Wrench,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

export default function RepairPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [repairedBlob, setRepairedBlob] = useState<Blob | null>(null);
  const [repairedUrl, setRepairedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setProcessing(true);
    setProgress(20);
    setStatusMessage("Scanning corrupted xref tables and byte streams...");

    try {
      const buffer = await f.arrayBuffer();
      setProgress(50);
      setStatusMessage("Rebuilding catalog dictionary and trailer references...");

      const repairedBytes = await repairPdfDocument(buffer);
      const blob = new Blob([repairedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setRepairedBlob(blob);
      setRepairedUrl(url);

      setProgress(85);
      setStatusMessage("Validating page rendering...");
      const canvas = await renderPdfPageToCanvas(repairedBytes, 1, 2.2);
      setPreviewUrl(canvas.toDataURL("image/png"));

      setProgress(100);
    } catch (err) {
      alert("Repair failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Repair Corrupted PDF"
        description="Recover unreadable PDFs, fix broken cross-reference tables, and rebuild valid document structures. 100% processed in your browser."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<Wrench className="w-5 h-5 text-emerald-400" />}
        badge="Zero-Loss PDF Recovery"
        currentStep={!file ? 1 : !repairedUrl ? 2 : 3}
      />

      {!repairedUrl ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          title="Drop damaged PDF here to repair"
          description="Repairs cross-reference tables and corrupt stream offsets directly in your browser."
          sampleFiles={[
            {
              name: "sample_invoice_small.pdf",
              url: "/test-files/sample_invoice_small.pdf",
              label: "Sample Invoice",
              kind: "pdf",
            },
          ]}
        />
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-lg">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>PDF Structure Rebuilt & Repaired</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Valid cross-reference table and trailer dictionary synthesized for {file?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={repairedUrl}
                download={`repaired_${file?.name || "document.pdf"}`}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" /> Download Repaired PDF
              </a>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setRepairedBlob(null);
                  setRepairedUrl(null);
                  setPreviewUrl(null);
                }}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Repair another document"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {previewUrl && (
            <div className="border border-zinc-800 rounded-3xl bg-zinc-950 p-6 flex flex-col items-center justify-center shadow-2xl">
              <p className="text-xs font-semibold text-zinc-400 mb-4">First Page Verified Render</p>
              <img
                src={previewUrl}
                alt="Repaired page preview"
                className="max-h-[500px] w-auto rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Repairing PDF Structure"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
