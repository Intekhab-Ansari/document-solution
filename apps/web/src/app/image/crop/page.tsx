"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { cropImage, CropArea } from "@/lib/image/image-transform";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { Crop, Download, RefreshCw, Sparkles, Sliders } from "lucide-react";

export default function CropImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);

  const [aspectPreset, setAspectPreset] = useState<"free" | "1:1" | "4:3" | "16:9" | "9:16">("1:1");
  const [cropBox, setCropBox] = useState<CropArea>({ x: 0, y: 0, width: 400, height: 400 });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; dataUrl: string; width: number; height: number } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setResult(null);

    const decoded = await decodeHeicIfApplicable(selected);
    const url = URL.createObjectURL(decoded);
    setOriginalDataUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      setCropBox({
        x: Math.round((img.naturalWidth - minDim) / 2),
        y: Math.round((img.naturalHeight - minDim) / 2),
        width: minDim,
        height: minDim,
      });
    };
  };

  const handlePresetSelect = (preset: "free" | "1:1" | "4:3" | "16:9" | "9:16") => {
    setAspectPreset(preset);
    if (!origW || !origH) return;

    let targetW = origW;
    let targetH = origH;

    if (preset === "1:1") {
      const s = Math.min(origW, origH);
      targetW = s;
      targetH = s;
    } else if (preset === "4:3") {
      targetW = Math.round(Math.min(origW, origH * (4 / 3)));
      targetH = Math.round(targetW * (3 / 4));
    } else if (preset === "16:9") {
      targetW = Math.round(Math.min(origW, origH * (16 / 9)));
      targetH = Math.round(targetW * (9 / 16));
    } else if (preset === "9:16") {
      targetH = Math.round(Math.min(origH, origW * (16 / 9)));
      targetW = Math.round(targetH * (9 / 16));
    }

    setCropBox({
      x: Math.round((origW - targetW) / 2),
      y: Math.round((origH - targetH) / 2),
      width: targetW,
      height: targetH,
    });
    setResult(null);
  };

  const handleCrop = async () => {
    if (!originalDataUrl) return;
    setIsProcessing(true);

    try {
      const res = await cropImage(originalDataUrl, cropBox);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Error cropping image: " + (err as Error).message);
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
          Crop Image Online
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Trim images to 1:1 Square, 16:9 Landscape, 9:16 Vertical Story, or custom dimensions with lossless precision.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif"
            onFilesSelected={handleFileSelected}
            title="Drop image to crop"
            description="Supports all photo formats with standard aspect ratios."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Preview */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-zinc-500">Original: {origW}x{origH}px &bull; {formatBytes(file.size)}</p>
            </div>

            {originalDataUrl && (
              <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative border border-zinc-800 rounded-xl overflow-hidden shadow-xl max-h-[380px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result?.dataUrl || originalDataUrl}
                    alt="Preview"
                    className="max-h-[360px] object-contain opacity-90"
                  />
                  {!result && (
                    <div
                      className="absolute border-2 border-emerald-400 pointer-events-none bg-emerald-500/10 shadow-2xl"
                      style={{
                        top: `${(cropBox.y / origH) * 100}%`,
                        left: `${(cropBox.x / origW) * 100}%`,
                        width: `${(cropBox.width / origW) * 100}%`,
                        height: `${(cropBox.height / origH) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <span className="text-[11px] text-zinc-500 mt-2 font-mono">
                  {result ? `Cropped: ${result.width}x${result.height}px` : `Crop Region: ${cropBox.width}x${cropBox.height}px`}
                </span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="md:col-span-6 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Aspect Ratio
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "1:1", label: "1:1 Square" },
                  { key: "4:3", label: "4:3 Standard" },
                  { key: "16:9", label: "16:9 Widescreen" },
                  { key: "9:16", label: "9:16 Vertical" },
                  { key: "free", label: "Original" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePresetSelect(item.key as any)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      aspectPreset === item.key
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h4 className="font-semibold text-zinc-300">Fine Adjust Region</h4>
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="text-[11px] text-zinc-500">Width</label>
                    <input
                      type="number"
                      value={cropBox.width}
                      onChange={(e) => setCropBox({ ...cropBox, width: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500">Height</label>
                    <input
                      type="number"
                      value={cropBox.height}
                      onChange={(e) => setCropBox({ ...cropBox, height: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {!result ? (
                  <button
                    type="button"
                    onClick={handleCrop}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    <span>Apply Crop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBlob(result.blob, `cropped_${result.width}x${result.height}.jpg`)}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cropped Image ({formatBytes(result.blob.size)})</span>
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
        stage="Cropping image..."
        title="Processing image..."
      />
    </div>
  );
}
