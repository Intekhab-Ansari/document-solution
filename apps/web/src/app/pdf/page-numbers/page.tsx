"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { addPageNumbersToPdf, PageNumberOptions } from "@/lib/pdf/pdf-annotate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { Hash, Download, RefreshCw, Sparkles, Sliders } from "lucide-react";

export default function PageNumbersPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  const [position, setPosition] = useState<PageNumberOptions["position"]>("bottom-center");
  const [format, setFormat] = useState<PageNumberOptions["format"]>("page-of-total");
  const [fontSize, setFontSize] = useState<number>(10);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [numberedPdfBytes, setNumberedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setNumberedPdfBytes(null);

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
    setProgress({ percent: 30, stage: "Adding page numbers..." });

    try {
      const numbered = await addPageNumbersToPdf(fileBytes, {
        position,
        format,
        fontSize,
        skipFirstPage,
      });

      setNumberedPdfBytes(numbered);
      setProgress({ percent: 100, stage: "Complete!" });
    } catch (err) {
      console.error(err);
      alert("Error adding page numbers: " + (err as Error).message);
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
          Add Page Numbers to PDF
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Number your pages with professional formatting. Customize placement, typography, and cover page exclusions.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to add page numbers"
            description="Header or footer numbering with custom formats."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Preview */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white truncate">{file.name}</p>
              <p className="text-zinc-500">{pageCount} pages &bull; {formatBytes(file.size)}</p>
            </div>

            {previewThumb && (
              <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumb}
                  alt="Page Preview"
                  className="max-h-[360px] object-contain rounded-xl border border-zinc-800 shadow-xl"
                />
                <span className="text-[11px] text-zinc-500 mt-2">First Page Preview</span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Numbering Settings
              </h3>

              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold">Position on Page</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "bottom-left", label: "Bottom Left" },
                    { key: "bottom-center", label: "Bottom Center" },
                    { key: "bottom-right", label: "Bottom Right" },
                    { key: "top-left", label: "Top Left" },
                    { key: "top-center", label: "Top Center" },
                    { key: "top-right", label: "Top Right" },
                  ].map((pos) => (
                    <button
                      key={pos.key}
                      type="button"
                      onClick={() => setPosition(pos.key as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        position === pos.key
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold">Numbering Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "page-of-total", label: "Page 1 of 10" },
                    { key: "number-only", label: "1, 2, 3..." },
                    { key: "slash", label: "1 / 10" },
                  ].map((fmt) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setFormat(fmt.key as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        format === fmt.key
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-300 font-semibold">Font Size: {fontSize}pt</span>
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-40 accent-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 pt-1">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700"
                />
                <span>Skip First Page (Cover / Title Page)</span>
              </label>

              <div className="pt-2">
                {!numberedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Hash className="w-4 h-4" />
                    <span>Apply Page Numbers</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadBuffer(numberedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_numbered.pdf`, "application/pdf")}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Numbered PDF ({formatBytes(numberedPdfBytes.byteLength)})</span>
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
        title="Numbering PDF pages..."
      />
    </div>
  );
}
