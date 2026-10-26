"use client";

import React, { useState, useMemo, useCallback } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { ThumbnailGrid, ThumbnailItem } from "@/components/common/ThumbnailGrid";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { extractPages, parsePageRangeString, getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { renderPageThumbnail, getCachedPdfDoc } from "@/lib/pdf/pdf-render";
import {
  Scissors,
  Download,
  RefreshCw,
  Split,
  Trash2,
  BookmarkCheck,
  Filter,
  Layers,
  Archive,
  CheckCircle2,
  FileCheck,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import JSZip from "jszip";

type OperationMode = "save_range" | "remove_range";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [pageItems, setPageItems] = useState<ThumbnailItem[]>([]);

  // Active Mode: "save_range" (Keep specified) vs "remove_range" (Delete specified)
  const [mode, setMode] = useState<OperationMode>("save_range");

  // Save Range inputs: From [start] To [end]
  const [saveStart, setSaveStart] = useState<number>(1);
  const [saveEnd, setSaveEnd] = useState<number>(1);
  const [saveRangeText, setSaveRangeText] = useState<string>("1");

  // Remove Range inputs: Remove From [start] To [end]
  const [removeStart, setRemoveStart] = useState<number>(1);
  const [removeEnd, setRemoveEnd] = useState<number>(1);
  const [removeRangeText, setRemoveRangeText] = useState<string>("");

  // Grid filter: "all" | "selected" | "unselected"
  const [filterView, setFilterView] = useState<"all" | "selected" | "unselected">("all");
  const [jumpPage, setJumpPage] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [extractedPdfBytes, setExtractedPdfBytes] = useState<Uint8Array | null>(null);
  const [extractedZipBlob, setExtractedZipBlob] = useState<Blob | null>(null);
  const [zipPageCount, setZipPageCount] = useState<number>(0);

  // File loading handler with instant lazy loading
  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setExtractedPdfBytes(null);
    setExtractedZipBlob(null);

    const buffer = await selected.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    // Fast metadata extraction
    const info = await getPdfInfo(bytes);
    const total = info.pageCount;

    // Pre-cache pdfjs document proxy once for all thumbnails
    try {
      const doc = await getCachedPdfDoc(bytes);
      setPdfDocProxy(doc);
    } catch (e) {
      console.warn("Could not pre-cache doc proxy", e);
    }

    // Initialize items instantly (takes < 2ms even for 1000 pages)
    const initialItems: ThumbnailItem[] = [];
    for (let i = 1; i <= total; i++) {
      initialItems.push({
        id: `page-${i}`,
        originalPageNumber: i,
        rotation: 0,
        selected: i === 1, // Default select page 1 in save mode
      });
    }

    setPageItems(initialItems);
    setSaveStart(1);
    setSaveEnd(Math.min(total, 10));
    setSaveRangeText("1");
    setRemoveStart(1);
    setRemoveEnd(1);
    setRemoveRangeText("");
  };

  // Lazy thumbnail request callback passed to ThumbnailGrid
  const handleRequestThumbnail = useCallback(
    async (originalPageNumber: number) => {
      if (!fileBytes) return undefined;
      return await renderPageThumbnail(pdfDocProxy || fileBytes, originalPageNumber, 320);
    },
    [fileBytes, pdfDocProxy]
  );

  // Update selection helper
  const updateSelection = (selectedNumbers: number[]) => {
    const selectedSet = new Set(selectedNumbers);
    setPageItems((prev) =>
      prev.map((it) => ({
        ...it,
        selected: selectedSet.has(it.originalPageNumber),
      }))
    );
    setExtractedPdfBytes(null);
    setExtractedZipBlob(null);
  };

  // Apply "Save Range": Keep from [start] to [end]
  const handleApplySaveRange = () => {
    const total = pageItems.length;
    const start = Math.max(1, Math.min(total, Math.min(saveStart, saveEnd)));
    const end = Math.max(1, Math.min(total, Math.max(saveStart, saveEnd)));
    const selected: number[] = [];
    for (let p = start; p <= end; p++) {
      selected.push(p);
    }
    updateSelection(selected);
    setSaveRangeText(start === end ? `${start}` : `${start}-${end}`);
  };

  // Text input for save ranges (e.g. "1-5, 8, 12-20")
  const handleSaveRangeTextChange = (val: string) => {
    setSaveRangeText(val);
    const parsed = parsePageRangeString(val, pageItems.length);
    updateSelection(parsed);
  };

  // Apply "Remove Range": Remove from [start] to [end], keep everything else
  const handleApplyRemoveRange = () => {
    const total = pageItems.length;
    const start = Math.max(1, Math.min(total, Math.min(removeStart, removeEnd)));
    const end = Math.max(1, Math.min(total, Math.max(removeStart, removeEnd)));

    // Kept pages are all pages EXCEPT [start...end]
    const kept: number[] = [];
    for (let p = 1; p <= total; p++) {
      if (p < start || p > end) {
        kept.push(p);
      }
    }
    updateSelection(kept);
    setRemoveRangeText(start === end ? `${start}` : `${start}-${end}`);
  };

  // Text input for remove ranges (e.g. "5, 10-25")
  const handleRemoveRangeTextChange = (val: string) => {
    setRemoveRangeText(val);
    const toRemove = new Set(parsePageRangeString(val, pageItems.length));
    const kept: number[] = [];
    for (let p = 1; p <= pageItems.length; p++) {
      if (!toRemove.has(p)) {
        kept.push(p);
      }
    }
    updateSelection(kept);
  };

  // Preset Selection Handlers
  const handleSelectAll = () => {
    updateSelection(pageItems.map((it) => it.originalPageNumber));
    setSaveRangeText(`1-${pageItems.length}`);
    setRemoveRangeText("");
  };

  const handleSelectNone = () => {
    updateSelection([]);
    setSaveRangeText("");
    setRemoveRangeText(`1-${pageItems.length}`);
  };

  const handleSelectFirstN = (n: number) => {
    const count = Math.min(pageItems.length, n);
    const selected: number[] = [];
    for (let i = 1; i <= count; i++) selected.push(i);
    updateSelection(selected);
    setSaveRangeText(`1-${count}`);
    setSaveStart(1);
    setSaveEnd(count);
  };

  const handleSelectOddEven = (parity: "odd" | "even") => {
    const selected: number[] = [];
    for (let i = 1; i <= pageItems.length; i++) {
      if (parity === "odd" && i % 2 !== 0) selected.push(i);
      if (parity === "even" && i % 2 === 0) selected.push(i);
    }
    updateSelection(selected);
    setSaveRangeText(selected.slice(0, 8).join(", ") + (selected.length > 8 ? "..." : ""));
  };

  // Jump to specific page in grid
  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= pageItems.length) {
      const el = document.getElementById(`thumbnail-page-${p}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Grid Selection Change
  const handleGridSelectionChange = (selectedNumbers: number[]) => {
    updateSelection(selectedNumbers);
    if (mode === "save_range") {
      setSaveRangeText(selectedNumbers.length <= 8 ? selectedNumbers.join(", ") : `${selectedNumbers.length} pages selected`);
    } else {
      const removedCount = pageItems.length - selectedNumbers.length;
      setRemoveRangeText(`${removedCount} pages marked for removal`);
    }
  };

  // Action 1: Extract & Save selected pages as a SINGLE PDF
  const handleSaveSelectedAsPdf = async () => {
    if (!fileBytes) return;
    const selectedNums = pageItems.filter((it) => it.selected).map((it) => it.originalPageNumber);
    if (!selectedNums.length) {
      alert("Please select at least 1 page to save as PDF.");
      return;
    }

    setIsProcessing(true);
    setProgress({ percent: 30, stage: `Extracting ${selectedNums.length} pages into PDF...` });

    try {
      const extracted = await extractPages(fileBytes, selectedNums);
      setExtractedPdfBytes(extracted);
      setProgress({ percent: 100, stage: "PDF Ready for Download!" });
    } catch (err) {
      console.error(err);
      alert("Extraction failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 2: Save selected pages as a ZIP archive (each page as a separate PDF)
  const handleSaveSelectedAsZip = async () => {
    if (!fileBytes || !file) return;
    const selectedNums = pageItems.filter((it) => it.selected).map((it) => it.originalPageNumber);
    if (!selectedNums.length) {
      alert("Please select at least 1 page to save as ZIP.");
      return;
    }

    setIsProcessing(true);
    setProgress({ percent: 10, stage: `Extracting ${selectedNums.length} individual pages...` });

    try {
      const zip = new JSZip();
      for (let i = 0; i < selectedNums.length; i++) {
        const pageNum = selectedNums[i];
        const singlePageBytes = await extractPages(fileBytes, [pageNum]);
        zip.file(`page_${pageNum.toString().padStart(3, "0")}.pdf`, singlePageBytes);

        if (i % 3 === 0 || i === selectedNums.length - 1) {
          setProgress({
            percent: 10 + Math.round(((i + 1) / selectedNums.length) * 80),
            stage: `Packaging page ${pageNum} (${i + 1} of ${selectedNums.length})...`,
          });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      setExtractedZipBlob(blob);
      setZipPageCount(selectedNums.length);
      setProgress({ percent: 100, stage: "ZIP Archive Ready!" });
    } catch (err) {
      console.error(err);
      alert("ZIP creation failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 3: Split ALL pages of document into ZIP
  const handleSplitAllToZip = async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Preparing all pages..." });

    try {
      const zip = new JSZip();
      const total = pageItems.length;

      for (let i = 0; i < total; i++) {
        const pageNum = pageItems[i].originalPageNumber;
        const singlePageBytes = await extractPages(fileBytes, [pageNum]);
        zip.file(`page_${pageNum.toString().padStart(3, "0")}.pdf`, singlePageBytes);

        if (i % 5 === 0 || i === total - 1) {
          setProgress({
            percent: 10 + Math.round(((i + 1) / total) * 80),
            stage: `Packaging page ${pageNum} of ${total}...`,
          });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      setExtractedZipBlob(blob);
      setZipPageCount(total);
      setProgress({ percent: 100, stage: "All Pages Zipped!" });
    } catch (err) {
      console.error(err);
      alert("Split to ZIP failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Items for Grid View
  const filteredItems = useMemo(() => {
    if (filterView === "selected") return pageItems.filter((it) => it.selected);
    if (filterView === "unselected") return pageItems.filter((it) => !it.selected);
    return pageItems;
  }, [pageItems, filterView]);

  const selectedCount = pageItems.filter((it) => it.selected).length;
  const removedCount = pageItems.length - selectedCount;
  const totalPages = pageItems.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Split, Extract & Remove PDF Pages
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Select pages to save or remove, then export directly as a single PDF or a ZIP package. 100% processed in your browser memory.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to split or remove pages"
            description="Ultra-fast in-memory processing. Effortlessly handles 300+ page documents."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* 1. TOP DOCUMENT SUMMARY & CHANGE FILE BAR */}
          {/* ============================================================== */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">{file.name}</div>
                <div className="text-zinc-400 text-[11px] flex items-center gap-2">
                  <span>{totalPages} total pages</span>
                  <span>&bull;</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-medium">
                    {selectedCount} to keep ({removedCount} to remove)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileBytes(null);
                setPdfDocProxy(null);
                setPageItems([]);
                setExtractedPdfBytes(null);
                setExtractedZipBlob(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
              title="Upload a different document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. THE TOP COMMAND CENTER: 2 RANGE OPTIONS & ACTION BUTTONS */}
          {/* ============================================================== */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/95 border border-zinc-800 shadow-xl space-y-6">
            {/* Top Switcher: Choose Option 1 (Save Range) vs Option 2 (Remove Range) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="inline-flex p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode("save_range")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === "save_range"
                      ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Option 1: Save / Keep Pages</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("remove_range")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === "remove_range"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Option 2: Remove Pages</span>
                </button>
              </div>

              {/* Quick Jump Input */}
              <form onSubmit={handleJumpToPage} className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 text-[11px]">Jump to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder={`1-${totalPages}`}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>

            {/* OPTION 1 DETAILS: FROM WHERE TO WHERE YOU WANT TO SAVE PAGES */}
            {mode === "save_range" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>From where to where you want to SAVE pages:</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Specify the page range to extract and save as a PDF or ZIP package.
                    </p>
                  </div>

                  {/* Range from X to Y inputs */}
                  <div className="flex flex-wrap items-center gap-2.5 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-medium">From page:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={saveStart}
                      onChange={(e) => setSaveStart(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-300 font-medium">To page:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={saveEnd}
                      onChange={(e) => setSaveEnd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs text-center focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplySaveRange}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>

                {/* Custom text & Quick presets */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-zinc-400 text-xs shrink-0">Custom Ranges:</span>
                    <input
                      type="text"
                      value={saveRangeText}
                      onChange={(e) => handleSaveRangeTextChange(e.target.value)}
                      placeholder="e.g. 1-10, 15, 20-35"
                      className="w-full md:w-64 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      All ({totalPages})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFirstN(10)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      First 10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectFirstN(50)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      First 50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectOddEven("odd")}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Odd Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectOddEven("even")}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Even Pages
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectNone}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>{selectedCount} pages selected for output</strong> out of {totalPages} pages.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {removedCount} excluded
                  </span>
                </div>
              </div>
            )}

            {/* OPTION 2 DETAILS: FROM WHERE TO WHERE YOU WANT TO REMOVE PAGES */}
            {mode === "remove_range" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>From where to where you want to REMOVE pages:</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Enter the page numbers to delete. All other remaining pages will be kept and saved.
                    </p>
                  </div>

                  {/* Range from A to B removal inputs */}
                  <div className="flex flex-wrap items-center gap-2.5 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-medium">Remove from:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={removeStart}
                      onChange={(e) => setRemoveStart(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs text-center focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-xs text-zinc-300 font-medium">To page:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={removeEnd}
                      onChange={(e) => setRemoveEnd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs text-center focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyRemoveRange}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Remove Range
                    </button>
                  </div>
                </div>

                {/* Custom removal text & Quick presets */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-zinc-400 text-xs shrink-0">Custom Removal:</span>
                    <input
                      type="text"
                      value={removeRangeText}
                      onChange={(e) => handleRemoveRangeTextChange(e.target.value)}
                      placeholder="e.g. 5, 10-25, 40"
                      className="w-full md:w-64 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveStart(1);
                        setRemoveEnd(1);
                        handleApplyRemoveRange();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Remove First Page
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveStart(totalPages);
                        setRemoveEnd(totalPages);
                        handleApplyRemoveRange();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Remove Last Page
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Remove odd pages
                        const kept: number[] = [];
                        for (let i = 1; i <= totalPages; i++) {
                          if (i % 2 === 0) kept.push(i);
                        }
                        updateSelection(kept);
                        setRemoveRangeText("Odd pages removed");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Remove Odd Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Remove even pages
                        const kept: number[] = [];
                        for (let i = 1; i <= totalPages; i++) {
                          if (i % 2 !== 0) kept.push(i);
                        }
                        updateSelection(kept);
                        setRemoveRangeText("Even pages removed");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      Remove Even Pages
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                    >
                      Reset (Keep All)
                    </button>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Removing {removedCount} pages</strong> &bull; Output will save the remaining <strong>{selectedCount} pages</strong>.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {removedCount > 0 ? "Changes applied" : "No pages marked"}
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. THE ACTION BUTTONS: LOCATED PROMINENTLY AT THE TOP! */}
            {/* ============================================================== */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>Save Options (Select Format):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* ACTION BUTTON A: SAVE AS PDF */}
                {!extractedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleSaveSelectedAsPdf}
                    disabled={selectedCount === 0 || isProcessing}
                    className={`py-4 px-5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 ${
                      mode === "remove_range"
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 hover:brightness-110 shadow-rose-500/20"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-emerald-500/20"
                    }`}
                  >
                    <Scissors className="w-4 h-4 shrink-0" />
                    <span>
                      {mode === "remove_range"
                        ? `Save Remaining ${selectedCount} Pages as Single PDF`
                        : `Save ${selectedCount} Pages as Single PDF`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      downloadBuffer(
                        extractedPdfBytes,
                        `${file.name.replace(/\.pdf$/i, "")}_${
                          mode === "remove_range" ? "pages_removed" : "pages_saved"
                        }.pdf`,
                        "application/pdf"
                      )
                    }
                    className="py-4 px-5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      Download PDF ({formatBytes(extractedPdfBytes.byteLength)})
                    </span>
                  </button>
                )}

                {/* ACTION BUTTON B: SAVE AS ZIP (INDIVIDUAL PDFS) */}
                {!extractedZipBlob ? (
                  <button
                    type="button"
                    onClick={handleSaveSelectedAsZip}
                    disabled={selectedCount === 0 || isProcessing}
                    className="py-4 px-5 rounded-2xl font-bold text-sm text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40"
                    title="Package each chosen page as a separate PDF file inside a ZIP archive"
                  >
                    <Archive className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Save {selectedCount} Pages as ZIP Archive
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const url = URL.createObjectURL(extractedZipBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${file.name.replace(/\.pdf$/i, "")}_${zipPageCount}_pages.zip`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="py-4 px-5 rounded-2xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      Download ZIP ({formatBytes(extractedZipBlob.size)})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. PAGE GRID FILTER & VIEW CONTROLS */}
          {/* ============================================================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <span>Show in Grid:</span>
              </span>
              <div className="inline-flex p-0.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFilterView("all")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    filterView === "all" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({totalPages})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView("selected")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    filterView === "selected" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Kept ({selectedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView("unselected")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    filterView === "unselected" ? "bg-rose-500/20 text-rose-300 font-semibold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Removed ({removedCount})
                </button>
              </div>
            </div>

            <div className="text-zinc-500 text-[11px]">
              Click any page thumbnail to toggle its inclusion.
            </div>
          </div>

          {/* ============================================================== */}
          {/* 5. HIGH-PERFORMANCE LAZY THUMBNAIL GRID */}
          {/* ============================================================== */}
          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800 max-h-[640px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-zinc-600" />
                <p>No pages match the active filter.</p>
              </div>
            ) : (
              <ThumbnailGrid
                items={filteredItems}
                selectable={true}
                onRequestThumbnail={handleRequestThumbnail}
                onSelectionChange={handleGridSelectionChange}
              />
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
