"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { ThumbnailGrid, ThumbnailItem } from "@/components/common/ThumbnailGrid";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { rotatePdfPages, getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { RotateCw, RotateCcw, Download, RefreshCw, CheckCircle2 } from "lucide-react";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [rotatedPdfBytes, setRotatedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setRotatedPdfBytes(null);

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

  const rotateAll = (deg: number) => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        rotation: (it.rotation + deg + 360) % 360,
      }))
    );
    setRotatedPdfBytes(null);
  };

  const rotateSingle = (index: number) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, rotation: (it.rotation + 90) % 360 } : it
      )
    );
    setRotatedPdfBytes(null);
  };

  const handleSave = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setProgress({ percent: 30, stage: "Rotating PDF pages..." });

    try {
      const rotationMap: Record<number, number> = {};
      items.forEach((it, idx) => {
        if (it.rotation !== 0) {
          rotationMap[idx + 1] = it.rotation;
        }
      });

      const rotated = await rotatePdfPages(fileBytes, rotationMap);
      setRotatedPdfBytes(rotated);
      setProgress({ percent: 100, stage: "Complete!" });
    } catch (err) {
      console.error(err);
      alert("Error rotating PDF: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <ToolWorkspaceHeader
        title="Rotate PDF Pages"
        description="Rotate individual pages or all pages permanently. Clockwise 90°, 180°, or counter-clockwise 90° with instant visual feedback."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<RotateCw className="w-5 h-5 text-emerald-400" />}
        badge="Zero Loss Rotation"
        currentStep={!file ? 1 : !rotatedPdfBytes ? 2 : 3}
      />

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to rotate"
            description="Fix upside-down or sideways scans in seconds."
            sampleFiles={[
              {
                name: "sample_scanned_contract_large.pdf",
                url: "/test-files/sample_scanned_contract_large.pdf",
                label: "📄 Scanned Contract (875 KB)",
                kind: "pdf",
              },
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 Invoice (2 KB)",
                kind: "pdf",
              },
            ]}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{file.name}</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400">{items.length} pages</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rotate All 90° Right</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAll(-90)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rotate All 90° Left</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileBytes(null);
                  setItems([]);
                }}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Change File"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <ThumbnailGrid
              items={items}
              onRotatePage={rotateSingle}
            />
          </div>

          <div className="pt-2">
            {!rotatedPdfBytes ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Apply Rotation & Save PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => downloadBuffer(rotatedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_rotated.pdf`, "application/pdf")}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Rotated PDF ({formatBytes(rotatedPdfBytes.byteLength)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Rotating PDF..."
      />
    </div>
  );
}
