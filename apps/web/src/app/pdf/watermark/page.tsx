"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { addWatermarkToPdf } from "@/lib/pdf/pdf-annotate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { Stamp, Download, RefreshCw, Sliders } from "lucide-react";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  const [text, setText] = useState<string>("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(50);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotation, setRotation] = useState<number>(45);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [watermarkedPdfBytes, setWatermarkedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setWatermarkedPdfBytes(null);

    const buffer = await selected.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    const info = await getPdfInfo(bytes);
    setPageCount(info.pageCount);

    const thumb = await renderPageThumbnail(bytes, 1, 600);
    setPreviewThumb(thumb);
  };

  const handleApply = async () => {
    if (!fileBytes || !text.trim()) return;
    setIsProcessing(true);
    setProgress({ percent: 30, stage: "Stamping watermark across pages..." });

    try {
      const watermarked = await addWatermarkToPdf(fileBytes, {
        text,
        fontSize,
        opacity,
        rotation,
      });

      setWatermarkedPdfBytes(watermarked);
      setProgress({ percent: 100, stage: "Complete!" });
    } catch (err) {
      console.error(err);
      alert("Error adding watermark: " + (err as Error).message);
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
          Add Watermark to PDF
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Stamp text watermarks across every page of your PDF. Customize angle, opacity, text, and typography.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to watermark"
            description="Add Confidential, Draft, or custom branding."
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumb}
                  alt="Page Preview"
                  className="max-h-[360px] object-contain rounded-xl border border-zinc-800 shadow-xl opacity-90"
                />
                {/* Watermark preview overlay */}
                <div
                  className="absolute pointer-events-none font-bold text-white uppercase tracking-wider text-center"
                  style={{
                    opacity,
                    transform: `rotate(${rotation}deg)`,
                    fontSize: `${Math.round(fontSize * 0.45)}px`,
                  }}
                >
                  {text || "SAMPLE"}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Watermark Style
              </h3>

              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold">Watermark Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 pt-1">
                  {["CONFIDENTIAL", "DRAFT", "COPY", "INTERNAL ONLY"].map((presetText) => (
                    <button
                      key={presetText}
                      type="button"
                      onClick={() => setText(presetText)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
                    >
                      {presetText}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold">Rotation Angle</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { angle: 45, label: "45° Diagonal" },
                    { angle: 0, label: "0° Horizontal" },
                    { angle: -45, label: "-45° Reverse" },
                  ].map((item) => (
                    <button
                      key={item.angle}
                      type="button"
                      onClick={() => setRotation(item.angle)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        rotation === item.angle
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-300 font-semibold">Opacity: {Math.round(opacity * 100)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-40 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-semibold">Font Size: {fontSize}pt</span>
                <input
                  type="range"
                  min="24"
                  max="90"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-40 accent-emerald-500"
                />
              </div>

              <div className="pt-2">
                {!watermarkedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isProcessing || !text.trim()}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Stamp Watermark</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBuffer(watermarkedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_watermarked.pdf`, "application/pdf")}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Watermarked PDF ({formatBytes(watermarkedPdfBytes.byteLength)})</span>
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
        title="Stamping watermark..."
      />
    </div>
  );
}
