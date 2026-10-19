"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { BeforeAfterSlider } from "@/components/common/BeforeAfterSlider";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { compressImage, ImageCompressResult } from "@/lib/image/image-compress";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { Sparkles, Download, RefreshCw, CheckCircle2, Target, Sliders, Image as ImageIcon, Minimize2 } from "lucide-react";

export default function CompressImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);

  const [mode, setMode] = useState<"target" | "quality">("target");
  const [targetKb, setTargetKb] = useState<number>(100);
  const [qualityPercent, setQualityPercent] = useState<number>(80);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [result, setResult] = useState<ImageCompressResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setResult(null);

    const decoded = await decodeHeicIfApplicable(selected);
    setOriginalBlob(decoded);
    setOriginalDataUrl(URL.createObjectURL(decoded));
  };

  const handleCompress = async () => {
    if (!originalBlob) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Starting binary search compression..." });

    try {
      const res = await compressImage(originalBlob, {
        mode,
        targetKB: targetKb,
        quality: qualityPercent / 100,
        onProgress: (p) => setProgress({ percent: p.percent, stage: p.stage }),
      });

      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Image compression failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const ext = result.blob.type.includes("png") ? "png" : "jpg";
    const suffix = mode === "target" ? `_compressed_${targetKb}kb` : `_compressed_${qualityPercent}q`;
    downloadBlob(result.blob, `${baseName}${suffix}.${ext}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Compress Image to Target Size"
        description="Hit strict 50 KB, 100 KB, or 200 KB upload caps for job portals, exams, and government forms. Iterative binary search engine running 100% in your browser."
        category="image"
        categoryLabel="Image Tools"
        icon={<Minimize2 className="w-5 h-5 text-emerald-400" />}
        badge="Target KB Engine"
        currentStep={!file ? 1 : !result ? 2 : 3}
      />

      <div className="mt-8">
      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif,*/*"
            onFilesSelected={handleFileSelected}
            title="Drop image here to compress"
            description="Supports JPG, PNG, WebP, AVIF, and iPhone HEIC photos."
            sampleFiles={[
              { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "🖼️ Curly Hair Portrait (870 KB)", kind: "image" },
              { name: "portrait_with_exif_gps.jpg", url: "/test-files/portrait_with_exif_gps.jpg", label: "📍 Photo with EXIF GPS (871 KB)", kind: "image" },
            ]}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Preview */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">{file.name}</p>
                  <p className="text-zinc-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setOriginalBlob(null);
                  setOriginalDataUrl(null);
                }}
                className="flex items-center gap-1 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Image</span>
              </button>
            </div>

            {result && originalDataUrl ? (
              <BeforeAfterSlider
                beforeUrl={originalDataUrl}
                afterUrl={result.dataUrl}
                beforeLabel={`Original (${formatBytes(result.originalSize)})`}
                afterLabel={`Compressed (${formatBytes(result.newSize)})`}
              />
            ) : originalDataUrl ? (
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalDataUrl}
                  alt="Original"
                  className="max-h-[380px] object-contain rounded-xl shadow-xl border border-zinc-800"
                />
              </div>
            ) : null}

            {result && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{result.savingsPercent}% Smaller</span>
                  </div>
                  <span className="font-mono text-zinc-400">
                    {formatBytes(result.originalSize)} &rarr; <strong className="text-white font-bold">{formatBytes(result.newSize)}</strong>
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{result.message}</p>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Dimensions: {result.width}x{result.height}px &bull; Iterations: {result.iterationsRun}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Compression Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-6">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Compression Strategy
              </h3>

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
                  Exact Target KB
                </button>
                <button
                  type="button"
                  onClick={() => setMode("quality")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "quality"
                      ? "bg-emerald-500 text-zinc-950 font-bold shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Quality Slider
                </button>
              </div>

              {mode === "target" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-300 flex justify-between">
                      <span>Target File Size</span>
                      <strong className="text-emerald-400 font-mono">{targetKb} KB</strong>
                    </label>

                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 200, 500].map((kb) => (
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
                          {kb} KB
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="10"
                          max="10000"
                          step="10"
                          value={targetKb}
                          onChange={(e) => setTargetKb(Math.max(5, parseInt(e.target.value, 10) || 50))}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          placeholder="Custom KB (e.g. 75)"
                        />
                        <span className="text-xs text-zinc-500 font-mono">KB</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-zinc-300 font-medium">
                    <span>Quality Level</span>
                    <span className="font-mono text-emerald-400">{qualityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={qualityPercent}
                    onChange={(e) => setQualityPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Smaller Size</span>
                    <span>Higher Quality</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                {!result ? (
                  <button
                    type="button"
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Compress Image Now</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed Image ({formatBytes(result.newSize)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Compressing image on your device..."
      />
    </div>
  );
}
