"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { cropPdf } from "@/lib/pdf/pdf-annotate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { Crop, Download, RefreshCw, Sliders } from "lucide-react";

export default function CropPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  const [top, setTop] = useState<number>(36);
  const [bottom, setBottom] = useState<number>(36);
  const [left, setLeft] = useState<number>(36);
  const [right, setRight] = useState<number>(36);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [croppedPdfBytes, setCroppedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setCroppedPdfBytes(null);

    const buffer = await selected.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    const info = await getPdfInfo(bytes);
    setPageCount(info.pageCount);

    const thumb = await renderPageThumbnail(bytes, 1, 300);
    setPreviewThumb(thumb);
  };

  const handleApply = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setProgress({ percent: 30, stage: "Trimming PDF margins..." });

    try {
      const cropped = await cropPdf(fileBytes, {
        top,
        bottom,
        left,
        right,
      });

      setCroppedPdfBytes(cropped);
      setProgress({ percent: 100, stage: "Complete!" });
    } catch (err) {
      console.error(err);
      alert("Error cropping PDF: " + (err as Error).message);
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
          Crop PDF Margins
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Trim margins, headers, footers, or unwanted white space across all pages. 100% processed on your device.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to crop margins"
            description="Trim edges or remove unwanted white margins."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-zinc-500">{pageCount} pages &bull; {formatBytes(file.size)}</p>
            </div>

            {previewThumb && (
              <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewThumb}
                    alt="Page Preview"
                    className="max-h-[360px] object-contain opacity-80"
                  />
                  {/* Visual Crop Box Guide */}
                  <div
                    className="absolute inset-0 border-2 border-emerald-400 pointer-events-none bg-emerald-500/5"
                    style={{
                      top: `${Math.round(top * 0.3)}px`,
                      bottom: `${Math.round(bottom * 0.3)}px`,
                      left: `${Math.round(left * 0.3)}px`,
                      right: `${Math.round(right * 0.3)}px`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-2">Green box indicates crop boundary</span>
              </div>
            )}
          </div>

          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Margin Trim (Points)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold flex justify-between">
                    <span>Top Margin</span>
                    <span className="font-mono text-emerald-400">{top} pt</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={top}
                    onChange={(e) => setTop(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold flex justify-between">
                    <span>Bottom Margin</span>
                    <span className="font-mono text-emerald-400">{bottom} pt</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={bottom}
                    onChange={(e) => setBottom(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold flex justify-between">
                    <span>Left Margin</span>
                    <span className="font-mono text-emerald-400">{left} pt</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={left}
                    onChange={(e) => setLeft(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold flex justify-between">
                    <span>Right Margin</span>
                    <span className="font-mono text-emerald-400">{right} pt</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={right}
                    onChange={(e) => setRight(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setTop(0); setBottom(0); setLeft(0); setRight(0); }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Reset (0pt)
                </button>
                <button
                  type="button"
                  onClick={() => { setTop(36); setBottom(36); setLeft(36); setRight(36); }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Standard (0.5 in)
                </button>
                <button
                  type="button"
                  onClick={() => { setTop(72); setBottom(72); setLeft(36); setRight(36); }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Trim Header/Footer
                </button>
              </div>

              <div className="pt-2">
                {!croppedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    <span>Apply Crop to All Pages</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBuffer(croppedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_cropped.pdf`, "application/pdf")}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cropped PDF ({formatBytes(croppedPdfBytes.byteLength)})</span>
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
        title="Cropping PDF pages..."
      />
    </div>
  );
}
