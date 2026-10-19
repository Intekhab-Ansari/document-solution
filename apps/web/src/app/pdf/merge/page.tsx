"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { mergePdfs, getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { FileText, ArrowUp, ArrowDown, Trash2, Download, Plus, CheckCircle2, Merge } from "lucide-react";

interface PdfFileItem {
  id: string;
  file: File;
  bytes: Uint8Array;
  pageCount: number;
}

export default function MergePdfPage() {
  const [items, setItems] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [mergedBytes, setMergedBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setMergedBytes(null);
    const addedItems: PdfFileItem[] = [];

    for (const f of newFiles) {
      if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") continue;
      const buffer = await f.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      try {
        const info = await getPdfInfo(bytes);
        addedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          bytes,
          pageCount: info.pageCount,
        });
      } catch {
        // ignore corrupted
      }
    }

    setItems((prev) => [...prev, ...addedItems]);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setMergedBytes(null);
  };

  const totalPages = items.reduce((acc, it) => acc + it.pageCount, 0);
  const totalSize = items.reduce((acc, it) => acc + it.file.size, 0);

  const handleMerge = async () => {
    if (items.length < 2) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Initializing PDF merge engine..." });

    try {
      const buffers = items.map((it) => it.bytes);
      const merged = await mergePdfs(buffers, (curr, total) => {
        const pct = Math.round((curr / total) * 90);
        setProgress({ percent: pct, stage: `Merging file ${curr} of ${total}...` });
      });

      setMergedBytes(merged);
    } catch (err) {
      console.error(err);
      alert("Error merging PDFs: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBytes) return;
    downloadBuffer(mergedBytes, "merged_document.pdf", "application/pdf");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Merge PDF Documents"
        description="Combine multiple PDF documents into a single organized file in seconds. Order your files, preview pages, and export without any limits or watermarks."
        category="pdf"
        categoryLabel="PDF Tools"
        icon={<Merge className="w-5 h-5 text-cyan-400" />}
        badge="Zero-Loss PDF Fusion"
        currentStep={items.length === 0 ? 1 : !mergedBytes ? 2 : 3}
      />

      <div className="mt-8">
      {items.length === 0 ? (
        <FileDropzone
          accept="*/*"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Drop multiple PDFs here to combine"
          description="Select 2 or more PDF documents to merge into one."
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
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{items.length} Files</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400">{totalPages} total pages</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400">{formatBytes(totalSize)}</span>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Files</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
          </div>

          {/* Files List with Reorder Controls */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 text-xs transition-all"
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{item.file.name}</p>
                    <p className="text-zinc-500 text-[11px]">{formatBytes(item.file.size)} &bull; {item.pageCount} {item.pageCount === 1 ? "page" : "pages"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, "up")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, "down")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Area */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            {!mergedBytes ? (
              <button
                type="button"
                onClick={handleMerge}
                disabled={items.length < 2 || isProcessing}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Merge className="w-4 h-4" />
                <span>Merge {items.length} Files Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Merged PDF ({formatBytes(mergedBytes.byteLength)})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setItems([]);
                setMergedBytes(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Clear All
            </button>
          </div>

          {mergedBytes && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Successfully merged {items.length} files ({totalPages} pages). Ready to download!</span>
            </div>
          )}
        </div>
      )}
      </div>

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Merging PDF files locally..."
      />
    </div>
  );
}
