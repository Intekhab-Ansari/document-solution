"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { ThumbnailGrid, ThumbnailItem } from "@/components/common/ThumbnailGrid";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { reorderAndDeletePages, rotatePdfPages, getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { ArrowLeftRight, Download, RefreshCw, CheckCircle2, RotateCw } from "lucide-react";

export default function ReorderPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [savedPdfBytes, setSavedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setSavedPdfBytes(null);

    const buffer = await selected.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    const info = await getPdfInfo(bytes);
    const initialItems: ThumbnailItem[] = [];

    for (let i = 1; i <= info.pageCount; i++) {
      initialItems.push({
        id: `page-${i}`,
        originalPageNumber: i,
        rotation: 0,
      });
    }

    setItems(initialItems);

    for (let i = 1; i <= info.pageCount; i++) {
      renderPageThumbnail(bytes, i, 480).then((thumb) => {
        setItems((prev) =>
          prev.map((it) => (it.originalPageNumber === i ? { ...it, dataUrl: thumb } : it))
        );
      });
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
    setSavedPdfBytes(null);
  };

  const handleDelete = (index: number) => {
    if (items.length <= 1) return;
    const next = items.filter((_, idx) => idx !== index);
    setItems(next);
    setSavedPdfBytes(null);
  };

  const handleRotate = (index: number) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, rotation: (it.rotation + 90) % 360 } : it
      )
    );
    setSavedPdfBytes(null);
  };

  const handleSave = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setProgress({ percent: 20, stage: "Reorganizing document structure..." });

    try {
      const pageOrder = items.map((it) => it.originalPageNumber);
      let updatedBytes = await reorderAndDeletePages(fileBytes, pageOrder);

      // Apply rotations if any
      const rotationMap: Record<number, number> = {};
      items.forEach((it, idx) => {
        if (it.rotation !== 0) {
          rotationMap[idx + 1] = it.rotation;
        }
      });

      if (Object.keys(rotationMap).length > 0) {
        setProgress({ percent: 70, stage: "Applying page rotations..." });
        updatedBytes = await rotatePdfPages(updatedBytes, rotationMap);
      }

      setSavedPdfBytes(updatedBytes);
      setProgress({ percent: 100, stage: "Ready!" });
    } catch (err) {
      console.error(err);
      alert("Error reordering PDF: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center space-y-4 mb-10">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Reorder & Delete PDF Pages
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Rearrange pages using left/right arrows, rotate individual pages, or delete unnecessary pages. Processed completely in your browser.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to organize"
            description="Visual drag-and-drop page manager."
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{file.name}</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400">{items.length} pages remaining</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileBytes(null);
                setItems([]);
              }}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <ThumbnailGrid
              items={items}
              onMovePage={handleMove}
              onDeletePage={handleDelete}
              onRotatePage={handleRotate}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {!savedPdfBytes ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Save Reordered PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => downloadBuffer(savedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_reordered.pdf`, "application/pdf")}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Organized PDF ({formatBytes(savedPdfBytes.byteLength)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Organizing PDF..."
      />
    </div>
  );
}
