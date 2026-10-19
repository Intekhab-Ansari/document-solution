"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { ThumbnailGrid, ThumbnailItem } from "@/components/common/ThumbnailGrid";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { extractPages, parsePageRangeString, getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { renderPageThumbnail } from "@/lib/pdf/pdf-render";
import { Scissors, Download, RefreshCw, CheckCircle2, Split } from "lucide-react";
import JSZip from "jszip";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageItems, setPageItems] = useState<ThumbnailItem[]>([]);
  const [rangeInput, setRangeInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [extractedPdfBytes, setExtractedPdfBytes] = useState<Uint8Array | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setExtractedPdfBytes(null);
    setZipBlob(null);

    const buffer = await selected.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    const info = await getPdfInfo(bytes);
    const initialItems: ThumbnailItem[] = [];

    for (let i = 1; i <= info.pageCount; i++) {
      initialItems.push({
        id: `p-${i}`,
        originalPageNumber: i,
        rotation: 0,
        selected: i === 1, // select first page by default
      });
    }

    setPageItems(initialItems);
    setRangeInput("1");

    // Load thumbnails lazily
    for (let i = 1; i <= info.pageCount; i++) {
      renderPageThumbnail(bytes, i, 220).then((thumb) => {
        setPageItems((prev) =>
          prev.map((item) => (item.originalPageNumber === i ? { ...item, dataUrl: thumb } : item))
        );
      });
    }
  };

  const handleSelectionChange = (selectedNumbers: number[]) => {
    setPageItems((prev) =>
      prev.map((it) => ({
        ...it,
        selected: selectedNumbers.includes(it.originalPageNumber),
      }))
    );
    setRangeInput(selectedNumbers.join(", "));
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    const parsed = parsePageRangeString(val, pageItems.length);
    setPageItems((prev) =>
      prev.map((it) => ({
        ...it,
        selected: parsed.includes(it.originalPageNumber),
      }))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setPageItems((prev) => prev.map((it) => ({ ...it, selected: select })));
    setRangeInput(select ? `1-${pageItems.length}` : "");
  };

  const handleExtract = async () => {
    if (!fileBytes) return;
    const selectedNums = pageItems.filter((it) => it.selected).map((it) => it.originalPageNumber);
    if (!selectedNums.length) {
      alert("Please select at least 1 page to extract.");
      return;
    }

    setIsProcessing(true);
    setProgress({ percent: 30, stage: "Extracting selected pages..." });

    try {
      const extracted = await extractPages(fileBytes, selectedNums);
      setExtractedPdfBytes(extracted);
      setProgress({ percent: 100, stage: "Ready!" });
    } catch (err) {
      console.error(err);
      alert("Extraction failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitAllToZip = async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Splitting into individual pages..." });

    try {
      const zip = new JSZip();
      for (let i = 0; i < pageItems.length; i++) {
        const pageNum = pageItems[i].originalPageNumber;
        const singlePageBytes = await extractPages(fileBytes, [pageNum]);
        zip.file(`page_${pageNum}.pdf`, singlePageBytes);
        setProgress({
          percent: 10 + Math.round(((i + 1) / pageItems.length) * 80),
          stage: `Packaging page ${pageNum} of ${pageItems.length}...`,
        });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      setZipBlob(blob);
    } catch (err) {
      console.error(err);
      alert("Split to ZIP failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pageItems.filter((it) => it.selected).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Split & Extract PDF Pages
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Select individual pages, enter ranges (e.g. 1-3, 5, 8-10), or extract all pages as individual files into a ZIP. 100% client-side.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to split"
            description="Visual page selector with instant extraction."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="font-semibold text-white truncate">{file.name}</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-emerald-400 font-medium">{selectedCount} of {pageItems.length} selected</span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => handleRangeInputChange(e.target.value)}
                placeholder="e.g. 1-3, 5, 8"
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs w-40 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                None
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileBytes(null);
                  setPageItems([]);
                }}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Change File"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800">
            <ThumbnailGrid
              items={pageItems}
              selectable={true}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {!extractedPdfBytes ? (
              <button
                type="button"
                onClick={handleExtract}
                disabled={selectedCount === 0 || isProcessing}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Scissors className="w-4 h-4" />
                <span>Extract {selectedCount} Pages as New PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => downloadBuffer(extractedPdfBytes, `${file.name.replace(/\.pdf$/i, "")}_extracted.pdf`, "application/pdf")}
                className="w-full sm:flex-1 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Extracted PDF ({formatBytes(extractedPdfBytes.byteLength)})</span>
              </button>
            )}

            {!zipBlob ? (
              <button
                type="button"
                onClick={handleSplitAllToZip}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <Split className="w-3.5 h-3.5 text-cyan-400" />
                <span>Split All Pages to ZIP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const url = URL.createObjectURL(zipBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${file.name.replace(/\.pdf$/i, "")}_all_pages.zip`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900/60 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Pages ZIP ({formatBytes(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Processing PDF pages..."
      />
    </div>
  );
}
