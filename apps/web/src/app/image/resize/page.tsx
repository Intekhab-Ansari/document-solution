"use client";

import React, { useState, useEffect } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { resizeImage, ResizeOptions } from "@/lib/image/image-transform";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { Scaling, Download, RefreshCw, Link2, Unlink2, Sparkles, Sliders } from "lucide-react";

export default function ResizeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);

  const [mode, setMode] = useState<"dimensions" | "percentage" | "preset">("dimensions");
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(50);
  const [preset, setPreset] = useState<ResizeOptions["preset"]>("square");

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
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && origW > 0) {
      setHeight(Math.round((origH / origW) * val));
    }
    setResult(null);
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && origH > 0) {
      setWidth(Math.round((origW / origH) * val));
    }
    setResult(null);
  };

  const handleResize = async () => {
    if (!originalDataUrl) return;
    setIsProcessing(true);

    try {
      const res = await resizeImage(originalDataUrl, {
        mode,
        width,
        height,
        maintainAspectRatio: lockAspect,
        percentage,
        preset,
      });

      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Error resizing image: " + (err as Error).message);
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
          Resize Image Online
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Scale by exact pixels with aspect ratio preservation, scale by percentage, or select passport and social media presets.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif"
            onFilesSelected={handleFileSelected}
            title="Drop image to resize"
            description="JPG, PNG, WebP, AVIF, HEIC supported."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Preview */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-zinc-500">Original: {origW}x{origH}px &bull; {formatBytes(file.size)}</p>
            </div>

            {originalDataUrl && (
              <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result?.dataUrl || originalDataUrl}
                  alt="Image preview"
                  className="max-h-[340px] object-contain rounded-xl border border-zinc-800 shadow-xl"
                />
                <span className="text-[11px] text-zinc-500 mt-2 font-mono">
                  {result ? `Resized: ${result.width}x${result.height}px (${formatBytes(result.blob.size)})` : `Original: ${origW}x${origH}px`}
                </span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Resize Mode
              </h3>

              <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("dimensions")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "dimensions" ? "bg-cyan-500 text-zinc-950 font-bold shadow-md" : "text-zinc-400"
                  }`}
                >
                  By Pixels
                </button>
                <button
                  type="button"
                  onClick={() => setMode("percentage")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "percentage" ? "bg-cyan-500 text-zinc-950 font-bold shadow-md" : "text-zinc-400"
                  }`}
                >
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preset")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "preset" ? "bg-cyan-500 text-zinc-950 font-bold shadow-md" : "text-zinc-400"
                  }`}
                >
                  Presets
                </button>
              </div>

              {mode === "dimensions" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-300 font-semibold">Width (px)</label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={width}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-300 font-semibold">Height (px)</label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={height}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLockAspect(!lockAspect)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white"
                  >
                    {lockAspect ? <Link2 className="w-4 h-4 text-cyan-400" /> : <Unlink2 className="w-4 h-4 text-zinc-500" />}
                    <span>Maintain Aspect Ratio ({lockAspect ? "Locked" : "Unlocked"})</span>
                  </button>
                </div>
              )}

              {mode === "percentage" && (
                <div className="space-y-4">
                  <div className="flex justify-between font-semibold text-zinc-300">
                    <span>Scale Percentage</span>
                    <span className="font-mono text-cyan-400">{percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 150].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPercentage(pct)}
                        className="py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "preset" && (
                <div className="space-y-2">
                  <label className="text-zinc-300 font-semibold">Standard Presets</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: "passport", label: "Passport / Visa Photo (413 x 531 px)", desc: "Standard 35mm x 45mm at 300 DPI" },
                      { key: "square", label: "Square (1080 x 1080 px)", desc: "Instagram post, profile avatar" },
                      { key: "story", label: "Story / Vertical (1080 x 1920 px)", desc: "9:16 mobile full screen" },
                      { key: "landscape-hd", label: "Full HD (1920 x 1080 px)", desc: "16:9 widescreen presentation" },
                      { key: "banner", label: "Social Banner (1200 x 628 px)", desc: "LinkedIn and Twitter cards" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setPreset(item.key as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preset === item.key
                            ? "bg-cyan-500/15 border-cyan-500/50 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="font-semibold text-white">{item.label}</div>
                        <div className="text-[11px] text-zinc-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                {!result ? (
                  <button
                    type="button"
                    onClick={handleResize}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scaling className="w-4 h-4" />
                    <span>Apply Resize</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBlob(result.blob, `resized_${result.width}x${result.height}.jpg`)}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Resized Image ({formatBytes(result.blob.size)})</span>
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
        stage="Resizing image in canvas..."
        title="Processing image..."
      />
    </div>
  );
}
