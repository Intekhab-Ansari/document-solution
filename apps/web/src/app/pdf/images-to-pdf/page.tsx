"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { convertImagesToPdf, ImageToPdfOptions } from "@/lib/pdf/pdf-convert";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import Link from "next/link";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { FileText, ArrowUp, ArrowDown, Trash2, Download, Plus, Sparkles, Sliders, ArrowRight } from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  dataUrl: string;
  data: ArrayBuffer;
  mimeType: string;
}

export default function ImagesToPdfPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4-portrait" | "a4-landscape" | "letter">("a4-portrait");
  const [margin, setMargin] = useState<number>(20);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setGeneratedPdfBytes(null);
    const addedItems: ImageItem[] = [];

    for (const f of newFiles) {
      try {
        const decodedBlob = await decodeHeicIfApplicable(f);
        const data = await decodedBlob.arrayBuffer();
        const dataUrl = URL.createObjectURL(decodedBlob);
        addedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          dataUrl,
          data,
          mimeType: decodedBlob.type || "image/jpeg",
        });
      } catch {
        // ignore invalid
      }
    }

    setItems((prev) => [...prev, ...addedItems]);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setItems(next);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setGeneratedPdfBytes(null);
  };

  const handleConvert = async () => {
    if (!items.length) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Compiling images to PDF..." });

    try {
      const imagesData = items.map((it) => ({
        data: it.data,
        mimeType: it.mimeType,
      }));

      const pdfBytes = await convertImagesToPdf(imagesData, {
        pageSize,
        margin,
        onProgress: (curr, total) => {
          const pct = Math.round((curr / total) * 90);
          setProgress({ percent: pct, stage: `Embedding image ${curr} of ${total}...` });
        },
      });

      setGeneratedPdfBytes(pdfBytes);
      setProgress({ percent: 100, stage: "Ready!" });
    } catch (err) {
      console.error(err);
      alert("Error creating PDF: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Images to PDF"
        description="Transform multiple photos (JPG, PNG, WebP, HEIC) into a clean, beautifully formatted PDF document. Order images and customize page size."
        category="convert"
        categoryLabel="Converters"
        icon={<FileText className="w-5 h-5 text-cyan-400" />}
        badge="Zero-Loss Conversion"
        currentStep={items.length === 0 ? 1 : !generatedPdfBytes ? 2 : 3}
      />

      {/* Reciprocal Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 gap-3">
        <span className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Looking to extract <strong>images from an existing PDF document</strong> instead?
          </span>
        </span>
        <Link
          href="/pdf/pdf-to-images"
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1 shadow-sm"
        >
          <span>Switch to PDF to Images</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <FileDropzone
          accept="image/*,.heic,.heif,.png,.jpg,.jpeg,.webp,.avif,*/*"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Drop images here to convert to PDF"
          description="Supports screenshots, JPG, PNG, WebP, AVIF, and iPhone HEIC photos."
          sampleFiles={[
            {
              name: "portrait_curly_hair.jpg",
              url: "/test-files/portrait_curly_hair.jpg",
              label: "🖼️ Curly Hair Photo (870 KB)",
              kind: "image",
            },
            {
              name: "portrait_with_exif_gps.jpg",
              url: "/test-files/portrait_with_exif_gps.jpg",
              label: "📍 Photo with EXIF GPS (871 KB)",
              kind: "image",
            },
          ]}
        />
      ) : (
        <div className="space-y-6">
          {/* Options Panel */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">{items.length} Images</span>
              <span className="text-zinc-500">&bull;</span>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Images</span>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Page Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                >
                  <option value="a4-portrait">A4 Portrait</option>
                  <option value="a4-landscape">A4 Landscape</option>
                  <option value="letter">US Letter</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Margin:</span>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                >
                  <option value={0}>No Margin</option>
                  <option value={20}>Small (20pt)</option>
                  <option value={40}>Wide (40pt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 relative group"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono font-bold text-white">#{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, "up")}
                      className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, "down")}
                      className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.dataUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate text-[11px] text-zinc-500">{item.file.name}</div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            {!generatedPdfBytes ? (
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Create PDF from {items.length} Images</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => downloadBuffer(generatedPdfBytes, "converted_images.pdf", "application/pdf")}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Generated PDF ({formatBytes(generatedPdfBytes.byteLength)})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setItems([]);
                setGeneratedPdfBytes(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Generating PDF document..."
      />
    </div>
  );
}
