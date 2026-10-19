"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { convertImage, SupportedTargetFormat } from "@/lib/image/image-convert";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { Sparkles, Download, RefreshCw, Sliders, ArrowRight } from "lucide-react";

export default function ConvertImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<SupportedTargetFormat>("image/webp");
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; dataUrl: string; width: number; height: number; filename: string } | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (!files.length) return;
    setFile(files[0]);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const res = await convertImage(file, {
        targetFormat,
        quality: quality / 100,
        backgroundColor: bgColor,
      });

      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Error converting image: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <ToolWorkspaceHeader
        title="Universal Image Converter"
        description="Convert between JPG, PNG, WebP, AVIF, and Apple HEIC photos client-side. Zero cloud uploads, zero quality degradation."
        category="image"
        categoryLabel="Image Tools"
        icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
        badge="Zero Loss Engine"
        currentStep={!file ? 1 : !result ? 2 : 3}
      />

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif,.png,.jpg,.jpeg,.webp,.avif,*/*"
            onFilesSelected={handleFileSelected}
            title="Drop image to convert"
            description="JPG, PNG, WebP, AVIF, HEIC to any format. Processed 100% locally."
            sampleFiles={[
              { name: "portrait_curly_hair.jpg", url: "/test-files/portrait_curly_hair.jpg", label: "🖼️ Curly Hair Portrait (870 KB)", kind: "image" },
              { name: "portrait_with_exif_gps.jpg", url: "/test-files/portrait_with_exif_gps.jpg", label: "📍 Photo with EXIF GPS (871 KB)", kind: "image" },
            ]}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Preview */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-zinc-500">{formatBytes(file.size)}</p>
            </div>

            {result && (
              <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.dataUrl}
                  alt="Converted Result"
                  className="max-h-[340px] object-contain rounded-xl border border-zinc-800 shadow-xl"
                />
                <span className="text-[11px] text-zinc-500 mt-2 font-mono">
                  Converted Size: {formatBytes(result.blob.size)} ({result.width}x{result.height}px)
                </span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Convert Settings
              </h3>

              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold">Target Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "image/webp", label: "WebP (Fast & Lightweight)", desc: "Best for modern web" },
                    { key: "image/png", label: "PNG (Lossless Alpha)", desc: "Preserves transparency" },
                    { key: "image/jpeg", label: "JPEG (Universal)", desc: "Compatible everywhere" },
                    { key: "image/avif", label: "AVIF (Next-Gen)", desc: "Maximum compression" },
                  ].map((fmt) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setTargetFormat(fmt.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetFormat === fmt.key
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-xs text-white">{fmt.label}</div>
                      <div className="text-[10px] text-zinc-500 font-normal">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {targetFormat === "image/jpeg" && (
                <div className="space-y-2 pt-1 border-t border-zinc-800">
                  <label className="text-zinc-300 font-semibold">Alpha Background (if converting transparent PNG)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-zinc-400">{bgColor}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <div className="flex justify-between font-semibold text-zinc-300">
                  <span>Quality: {quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-2">
                {!result ? (
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Convert Image Now</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBlob(result.blob, result.filename)}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.filename} ({formatBytes(result.blob.size)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={100}
        stage="Encoding image locally..."
        title="Converting format..."
      />
    </div>
  );
}
