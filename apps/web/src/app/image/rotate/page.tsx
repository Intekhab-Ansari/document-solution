"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { rotateAndFlipImage } from "@/lib/image/image-transform";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, RefreshCw, Sparkles } from "lucide-react";

export default function RotateImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);

  const [angle, setAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; dataUrl: string; width: number; height: number } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setResult(null);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);

    const decoded = await decodeHeicIfApplicable(selected);
    setOriginalDataUrl(URL.createObjectURL(decoded));
  };

  const applyChanges = async (newAngle: number, newFlipH: boolean, newFlipV: boolean) => {
    if (!originalDataUrl) return;
    setAngle(newAngle);
    setFlipH(newFlipH);
    setFlipV(newFlipV);
    setIsProcessing(true);

    try {
      const res = await rotateAndFlipImage(originalDataUrl, newAngle, newFlipH, newFlipV);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Error rotating image: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center space-y-4 mb-10">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Rotate & Flip Image
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Rotate by 90°, 180°, or mirror flip horizontally and vertically in your browser.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif"
            onFilesSelected={handleFileSelected}
            title="Drop image to rotate or flip"
            description="Fix orientation or mirror photos in 1 click."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-white">{file.name}</span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyChanges((angle + 90) % 360, flipH, flipV)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => applyChanges((angle - 90 + 360) % 360, flipH, flipV)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rotate -90°</span>
              </button>
              <button
                type="button"
                onClick={() => applyChanges(angle, !flipH, flipV)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                  flipH ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300" : "bg-zinc-800 border-transparent text-white"
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Mirror H</span>
              </button>
              <button
                type="button"
                onClick={() => applyChanges(angle, flipH, !flipV)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                  flipV ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300" : "bg-zinc-800 border-transparent text-white"
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Mirror V</span>
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result?.dataUrl || originalDataUrl!}
              alt="Transformed Preview"
              className="max-h-[420px] object-contain rounded-xl border border-zinc-800 shadow-xl"
            />
          </div>

          {/* Download */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (result) downloadBlob(result.blob, `rotated_${file.name}`);
              }}
              disabled={!result}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Download Rotated Image</span>
            </button>
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={100}
        stage="Applying rotation and mirroring..."
        title="Transforming image..."
      />
    </div>
  );
}
