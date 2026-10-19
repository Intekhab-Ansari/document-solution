"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { convertPdfToGrayscale } from "@/lib/pdf/pdf-advanced";
import { renderPdfPageToCanvas } from "@/lib/pdf/pdf-render";
import { formatBytes, calculateSavings } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  Contrast,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Sliders,
} from "lucide-react";

export default function GrayscalePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<number>(150);
  const [grayscaleBlob, setGrayscaleBlob] = useState<Blob | null>(null);
  const [grayscaleUrl, setGrayscaleUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
  };

  const handleConvertGrayscale = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    setStatusMessage("Rendering pages to monochrome canvas...");

    try {
      const buffer = await file.arrayBuffer();
      const grayscaleBytes = await convertPdfToGrayscale(buffer, dpi, (cur, total) => {
        setProgress(Math.round(15 + (cur / total) * 75));
        setStatusMessage(`Converting page ${cur} of ${total} to grayscale...`);
      });

      const blob = new Blob([grayscaleBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setGrayscaleBlob(blob);
      setGrayscaleUrl(url);

      setProgress(95);
      setStatusMessage("Rendering preview...");
      const canvas = await renderPdfPageToCanvas(grayscaleBytes, 1, 1.2);
      setPreviewUrl(canvas.toDataURL("image/png"));

      setProgress(100);
    } catch (err) {
      alert("Conversion failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const savings = file && grayscaleBlob ? calculateSavings(file.size, grayscaleBlob.size) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Convert PDF to Grayscale"
        description="Remove all color channels and simulate professional monochrome document scans in your browser. Significantly reduces file size."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<Contrast className="w-5 h-5 text-amber-400" />}
        badge="Zero-Loss Monochrome Engine"
        currentStep={!file ? 1 : !grayscaleUrl ? 2 : 3}
      />

      {!file ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          title="Drop PDF here for monochrome conversion"
          description="Runs locally in browser memory. Ideal for official forms and size reduction."
          sampleFiles={[
            {
              name: "sample_invoice_small.pdf",
              url: "/test-files/sample_invoice_small.pdf",
              label: "Sample Invoice",
              kind: "pdf",
            },
          ]}
        />
      ) : !grayscaleUrl ? (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <p className="font-bold text-white text-sm">{file.name}</p>
              <p className="text-zinc-400 text-xs">{formatBytes(file.size)} &bull; Color PDF</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Change File
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-300 block">Output Scan Resolution (DPI)</label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 150, 200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDpi(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    dpi === val
                      ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {val} DPI {val === 150 && "(Recommended)"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              150 DPI produces crystal-clear monochrome text while significantly reducing file size.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConvertGrayscale}
            className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Contrast className="w-4 h-4" /> Convert to Grayscale PDF
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-lg">
                <Contrast className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Monochrome Conversion Complete</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Original: {formatBytes(file.size)} &rarr; Grayscale: {formatBytes(grayscaleBlob?.size || 0)}
                  {savings && savings.isSmaller && ` (${savings.percent}% smaller)`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={grayscaleUrl}
                download={`grayscale_${file.name}`}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" /> Download Grayscale PDF
              </a>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setGrayscaleBlob(null);
                  setGrayscaleUrl(null);
                  setPreviewUrl(null);
                }}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Convert another document"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {previewUrl && (
            <div className="border border-zinc-800 rounded-3xl bg-zinc-950 p-6 flex flex-col items-center justify-center shadow-2xl">
              <p className="text-xs font-semibold text-zinc-400 mb-4">First Page Monochrome Preview</p>
              <img
                src={previewUrl}
                alt="Grayscale preview"
                className="max-h-[500px] w-auto rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Converting to Grayscale"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
