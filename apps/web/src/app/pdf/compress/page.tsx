"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { BeforeAfterSlider } from "@/components/common/BeforeAfterSlider";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer, detectFileKind } from "@/lib/utils";
import { compressPdf, CompressionPreset, CompressionResult } from "@/lib/pdf/pdf-compress";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { convertImagesToPdf } from "@/lib/pdf/pdf-convert";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { Sparkles, Download, RefreshCw, FileText, CheckCircle2, AlertTriangle, ArrowRight, Sliders, Target, Minimize2 } from "lucide-react";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [originalThumb, setOriginalThumb] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [autoConvertedFromImage, setAutoConvertedFromImage] = useState<boolean>(false);

  // Compression settings
  const [mode, setMode] = useState<"preset" | "target">("target");
  const [preset, setPreset] = useState<CompressionPreset>("medium");
  const [targetKb, setTargetKb] = useState<number>(200);
  const [grayscale, setGrayscale] = useState<boolean>(false);

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; stage: string }>({ percent: 0, stage: "" });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [compressedThumb, setCompressedThumb] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setResult(null);
    setAutoConvertedFromImage(false);

    const kind = await detectFileKind(selected);

    let pdfBytes: Uint8Array;
    if (kind === "image" || kind === "heic") {
      setAutoConvertedFromImage(true);
      const decodedBlob = await decodeHeicIfApplicable(selected);
      const arrayBuf = await decodedBlob.arrayBuffer();
      pdfBytes = await convertImagesToPdf(
        [{ data: arrayBuf, mimeType: decodedBlob.type || "image/jpeg" }],
        { pageSize: "fit", margin: 0 }
      );
    } else {
      const buffer = await selected.arrayBuffer();
      pdfBytes = new Uint8Array(buffer);
    }

    setFileBytes(pdfBytes);

    try {
      const info = await getPdfInfo(pdfBytes);
      setPageCount(info.pageCount);
      const thumb = await renderPageThumbnail(pdfBytes, 1, 600);
      setOriginalThumb(thumb);
    } catch {
      // fallback
    }
  };

  const handleCompress = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setProgress({ percent: 5, stage: "Starting compression pipeline..." });

    try {
      const res = await compressPdf(fileBytes, {
        mode,
        preset,
        targetKB: targetKb,
        grayscale,
        onProgress: (p) => setProgress({ percent: p.percent, stage: p.stage }),
      });

      setResult(res);

      // Render thumbnail of compressed result
      const afterThumb = await renderPageThumbnail(res.compressedBytes, 1, 600);
      setCompressedThumb(afterThumb);
    } catch (err) {
      console.error(err);
      alert("Error compressing PDF: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const extName = mode === "target" ? `_compressed_${targetKb}kb.pdf` : `_compressed_${preset}.pdf`;
    downloadBuffer(result.compressedBytes, `${baseName}${extName}`, "application/pdf");
  };

  const handleReset = () => {
    setFile(null);
    setFileBytes(null);
    setResult(null);
    setOriginalThumb(null);
    setCompressedThumb(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Compress PDF to Target Size"
        description="Shrink PDFs to government portal limits (100 KB, 200 KB, 500 KB, 1 MB) or custom size using an iterative binary search engine. 100% processed in your browser."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<Minimize2 className="w-5 h-5 text-emerald-400" />}
        badge="Target KB Engine"
        currentStep={!file ? 1 : !result ? 2 : 3}
      />

      {/* Main Workflow Area */}
      <div className="mt-8">
        {!file ? (
          <div>
            <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to compress"
            description="Supports scanned PDFs, contracts, statements, and forms up to any size."
            sampleFiles={[
              { name: "sample_scanned_contract_large.pdf", url: "/test-files/sample_scanned_contract_large.pdf", label: "📄 Scanned Contract (875 KB)" },
              { name: "sample_invoice_small.pdf", url: "/test-files/sample_invoice_small.pdf", label: "📄 Invoice (2 KB)" },
            ]}
          />

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-xs text-zinc-400">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Exact KB Targeting
              </h4>
              <p className="text-zinc-500">Hits strict government and job application upload caps within 5%.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Preserves Text Layer
              </h4>
              <p className="text-zinc-500">Maintains searchable OCR typography while downsampling page images.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Zero Watermarks
              </h4>
              <p className="text-zinc-500">Completely free, no login needed, full resolution exports.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Preview & Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">{file.name}</p>
                  <p className="text-zinc-500">{formatBytes(file.size)} &bull; {pageCount} {pageCount === 1 ? "page" : "pages"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change File</span>
              </button>
            </div>

            {/* Before / After Preview or Original Preview */}
            {result && originalThumb && compressedThumb ? (
              <div className="space-y-4">
                <BeforeAfterSlider
                  beforeUrl={originalThumb}
                  afterUrl={compressedThumb}
                  beforeLabel={`Original (${formatBytes(result.originalSize)})`}
                  afterLabel={`Compressed (${formatBytes(result.newSize)})`}
                />
              </div>
            ) : originalThumb ? (
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Document First Page Preview</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalThumb}
                  alt="Original PDF preview"
                  className="max-h-[360px] object-contain rounded-xl border border-zinc-800 shadow-xl"
                />
              </div>
            ) : null}

            {/* Result stats banner */}
            {result && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{result.savingsPercent}% Size Reduction</span>
                  </div>
                  <span className="font-mono text-zinc-400">
                    {formatBytes(result.originalSize)} &rarr; <strong className="text-white font-bold">{formatBytes(result.newSize)}</strong>
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{result.message}</p>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Iterations run: {result.iterationsRun} &bull; Processed locally in Web Worker
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-6">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Compression Strategy
              </h3>

              {/* Mode switch */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("target")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "target"
                      ? "bg-emerald-500 text-zinc-950 font-bold shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Target File Size
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preset")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "preset"
                      ? "bg-emerald-500 text-zinc-950 font-bold shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Quality Presets
                </button>
              </div>

              {/* Target Size Controls */}
              {mode === "target" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-300 flex justify-between">
                      <span>Exact Target Size</span>
                      <strong className="text-emerald-400 font-mono">{targetKb} KB</strong>
                    </label>

                    {/* Quick presets */}
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 200, 500, 1000].map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => setTargetKb(kb)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                            targetKb === kb
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
                        </button>
                      ))}
                    </div>

                    {/* Manual KB input */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="30"
                          max="20000"
                          step="10"
                          value={targetKb}
                          onChange={(e) => setTargetKb(Math.max(10, parseInt(e.target.value, 10) || 100))}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          placeholder="Custom KB (e.g. 150)"
                        />
                        <span className="text-xs text-zinc-500 font-mono">KB</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Preset Controls */
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300">Preset Compression Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: "low", label: "Low Compression", desc: "Top visual quality (DPI 180, Q 85%)" },
                      { key: "medium", label: "Medium (Recommended)", desc: "Balanced file size & clarity (DPI 130, Q 70%)" },
                      { key: "high", label: "High Compression", desc: "Aggressive reduction for email (DPI 100, Q 50%)" },
                      { key: "extreme", label: "Extreme Compression", desc: "Smallest size for portals (DPI 72, Q 35%)" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setPreset(item.key as CompressionPreset)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preset === item.key
                            ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">{item.label}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra options */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(e) => setGrayscale(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-zinc-950 border-zinc-700"
                  />
                  <span>Convert color scans to Grayscale (up to 30% smaller)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {!result ? (
                  <button
                    type="button"
                    onClick={handleCompress}
                    disabled={isProcessing}
                    id="compress-target-btn"
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Compress PDF Now</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    id="download-result-btn"
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed PDF ({formatBytes(result.newSize)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Progress feedback modal */}
      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Compressing PDF on your device..."
      />
    </div>
  );
}
