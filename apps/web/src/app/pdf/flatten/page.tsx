"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { flattenPdfDocument } from "@/lib/pdf/pdf-advanced";
import { renderPdfPageToCanvas } from "@/lib/pdf/pdf-render";
import { formatBytes } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  Layers,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function FlattenPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [flattenedBlob, setFlattenedBlob] = useState<Blob | null>(null);
  const [flattenedUrl, setFlattenedUrl] = useState<string | null>(null);
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
    setStatusMessage("Scanning form fields and annotations...");

    try {
      const buffer = await f.arrayBuffer();
      setProgress(50);
      setStatusMessage("Flattening interactive layers into static content...");

      const flattenedBytes = await flattenPdfDocument(buffer);
      const blob = new Blob([flattenedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setFlattenedBlob(blob);
      setFlattenedUrl(url);

      setProgress(80);
      setStatusMessage("Rendering preview...");
      const canvas = await renderPdfPageToCanvas(flattenedBytes, 1, 1.2);
      setPreviewUrl(canvas.toDataURL("image/png"));

      setProgress(100);
    } catch (err) {
      alert("Flattening failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Flatten PDF Layers & Forms"
        description="Permanently bake all fillable form fields, comments, and annotations into uneditable page content. 100% processed in your browser."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<Layers className="w-5 h-5 text-indigo-400" />}
        badge="Zero-Loss Form Flattening"
        currentStep={!file ? 1 : !flattenedUrl ? 2 : 3}
      />

      {!flattenedUrl ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          title="Drop PDF here to flatten"
          description="Bakes form fields and annotations into static background vectors."
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
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Document Flattened Successfully</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  All form inputs and layers have been sealed permanently into {file?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={flattenedUrl}
                download={`flattened_${file?.name || "document.pdf"}`}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" /> Download Flattened PDF
              </a>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFlattenedBlob(null);
                  setFlattenedUrl(null);
                  setPreviewUrl(null);
                }}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Flatten another document"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {previewUrl && (
            <div className="border border-zinc-800 rounded-3xl bg-zinc-950 p-6 flex flex-col items-center justify-center shadow-2xl">
              <p className="text-xs font-semibold text-zinc-400 mb-4">First Page Static Preview</p>
              <img
                src={previewUrl}
                alt="Flattened page preview"
                className="max-h-[500px] w-auto rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Flattening Document"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
