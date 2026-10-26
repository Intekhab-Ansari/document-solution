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
  AlertCircle,
  Plus,
  FileText,
  Sparkles,
  ExternalLink,
  Eye,
} from "lucide-react";
import JSZip from "jszip";

export type OperationMode = "multi_split" | "save_range" | "remove_range";
export type MultiSplitStrategy = "every_n" | "custom_ranges" | "single_pages";

export interface CustomSplitPart {
  id: string;
  startPage: number;
  endPage: number;
}

export interface SplitResultPart {
  id: string;
  filename: string;
  pageRangeText: string;
  pageCount: number;
  sizeBytes: number;
  pdfBytes: Uint8Array;
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [pageItems, setPageItems] = useState<ThumbnailItem[]>([]);

  // 1. Primary Operation Mode: multi_split | save_range | remove_range
  const [mode, setMode] = useState<OperationMode>("multi_split");

  // Multi-Split Options
  const [multiStrategy, setMultiStrategy] = useState<MultiSplitStrategy>("every_n");
  const [everyN, setEveryN] = useState<number>(2);
  const [customRangeString, setCustomRangeString] = useState<string>("");
  const [customParts, setCustomParts] = useState<CustomSplitPart[]>([
    { id: "part-1", startPage: 1, endPage: 2 },
    { id: "part-2", startPage: 3, endPage: 4 },
  ]);

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

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });

  // Output Results
  const [extractedPdfBytes, setExtractedPdfBytes] = useState<Uint8Array | null>(null);
  const [extractedZipBlob, setExtractedZipBlob] = useState<Blob | null>(null);
  const [zipPageCount, setZipPageCount] = useState<number>(0);

  // Multi-split results
  const [multiSplitResults, setMultiSplitResults] = useState<SplitResultPart[]>([]);
  const [multiSplitZipBlob, setMultiSplitZipBlob] = useState<Blob | null>(null);

  // Base filename without extension
  const baseName = file ? file.name.replace(/\.pdf$/i, "") : "document";

  // File loading handler with instant lazy loading
  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setExtractedPdfBytes(null);
    setExtractedZipBlob(null);
    setMultiSplitResults([]);
    setMultiSplitZipBlob(null);

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

    // Initialize items instantly
    const initialItems: ThumbnailItem[] = [];
    for (let i = 1; i <= total; i++) {
      initialItems.push({
        id: `page-${i}`,
        originalPageNumber: i,
        rotation: 0,
        selected: true,
      });
    }

    setPageItems(initialItems);
    setSaveStart(1);
    setSaveEnd(Math.min(total, 5));
    setSaveRangeText(total > 1 ? `1-${Math.min(total, 5)}` : "1");
    setRemoveStart(1);
    setRemoveEnd(1);
    setRemoveRangeText("");

    // Setup multi-split initial values
    const mid = Math.max(1, Math.floor(total / 2));
    setCustomParts([
      { id: "part-1", startPage: 1, endPage: mid },
      { id: "part-2", startPage: Math.min(total, mid + 1), endPage: total },
    ]);
    setCustomRangeString(`1-${mid}, ${Math.min(total, mid + 1)}-${total}`);
    setEveryN(total > 4 ? 2 : 1);
  };

  // Lazy thumbnail request callback passed to ThumbnailGrid
  const handleRequestThumbnail = useCallback(
    async (originalPageNumber: number) => {
      if (!fileBytes) return undefined;
      return await renderPageThumbnail(pdfDocProxy || fileBytes, originalPageNumber, 320);
    },
    [fileBytes, pdfDocProxy]
  );

  // Update selection helper for single range/remove range modes
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

  // Text input for save ranges
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

    const kept: number[] = [];
    for (let p = 1; p <= total; p++) {
      if (p < start || p > end) {
        kept.push(p);
      }
    }
    updateSelection(kept);
    setRemoveRangeText(start === end ? `${start}` : `${start}-${end}`);
  };

  // Text input for remove ranges
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

  // Presets
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
    } else if (mode === "remove_range") {
      const removedCount = pageItems.length - selectedNumbers.length;
      setRemoveRangeText(`${removedCount} pages marked for removal`);
    }
  };

  // =========================================================================
  // MULTI-SPLIT CALCULATION & EXECUTION (THE CORE USER FEATURE)
  // =========================================================================
  const totalPages = pageItems.length;

  // Compute preview parts for multi-split
  const plannedMultiParts = useMemo(() => {
    if (totalPages === 0) return [];

    if (multiStrategy === "every_n") {
      const n = Math.max(1, Math.min(totalPages, everyN));
      const parts: Array<{ partNum: number; startPage: number; endPage: number; pageCount: number }> = [];
      let partIdx = 1;
      for (let s = 1; s <= totalPages; s += n) {
        const e = Math.min(totalPages, s + n - 1);
        parts.push({
          partNum: partIdx,
          startPage: s,
          endPage: e,
          pageCount: e - s + 1,
        });
        partIdx++;
      }
      return parts;
    }

    if (multiStrategy === "single_pages") {
      const parts: Array<{ partNum: number; startPage: number; endPage: number; pageCount: number }> = [];
      for (let p = 1; p <= totalPages; p++) {
        parts.push({
          partNum: p,
          startPage: p,
          endPage: p,
          pageCount: 1,
        });
      }
      return parts;
    }

    // Custom ranges
    return customParts.map((cp, idx) => {
      const s = Math.max(1, Math.min(totalPages, Math.min(cp.startPage, cp.endPage)));
      const e = Math.max(1, Math.min(totalPages, Math.max(cp.startPage, cp.endPage)));
      return {
        partNum: idx + 1,
        startPage: s,
        endPage: e,
        pageCount: e - s + 1,
      };
    });
  }, [totalPages, multiStrategy, everyN, customParts]);

  // Execute Multi-Split: Split 1 PDF into Multiple Separate PDFs
  const handleExecuteMultiSplit = async () => {
    if (!fileBytes || !file || plannedMultiParts.length === 0) return;

    setIsProcessing(true);
    setProgress({ percent: 10, stage: `Splitting into ${plannedMultiParts.length} separate PDFs...` });
    setMultiSplitResults([]);
    setMultiSplitZipBlob(null);

    try {
      const zip = new JSZip();
      const results: SplitResultPart[] = [];

      for (let i = 0; i < plannedMultiParts.length; i++) {
        const p = plannedMultiParts[i];
        const pageNumbers: number[] = [];
        for (let num = p.startPage; num <= p.endPage; num++) {
          pageNumbers.push(num);
        }

        const partFilename =
          plannedMultiParts.length === totalPages && multiStrategy === "single_pages"
            ? `${baseName}_page_${p.startPage.toString().padStart(3, "0")}.pdf`
            : `${baseName}_part_${p.partNum}_pages_${p.startPage}-${p.endPage}.pdf`;

        // Extract this part's pages as a standalone PDF
        const partPdfBytes = await extractPages(fileBytes, pageNumbers);

        // Add to ZIP
        zip.file(partFilename, partPdfBytes);

        // Record in individual results
        results.push({
          id: `split-part-${i + 1}`,
          filename: partFilename,
          pageRangeText: p.startPage === p.endPage ? `Page ${p.startPage}` : `Pages ${p.startPage}–${p.endPage}`,
          pageCount: pageNumbers.length,
          sizeBytes: partPdfBytes.byteLength,
          pdfBytes: partPdfBytes,
        });

        if (i % 2 === 0 || i === plannedMultiParts.length - 1) {
          setProgress({
            percent: 10 + Math.round(((i + 1) / plannedMultiParts.length) * 80),
            stage: `Created ${partFilename} (${i + 1} of ${plannedMultiParts.length})...`,
          });
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      setMultiSplitResults(results);
      setMultiSplitZipBlob(zipBlob);
      setProgress({ percent: 100, stage: `Successfully split into ${results.length} PDF files!` });
    } catch (err) {
      console.error(err);
      alert("Split failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add custom part
  const handleAddCustomPart = () => {
    const lastPart = customParts[customParts.length - 1];
    const nextStart = lastPart ? Math.min(totalPages, lastPart.endPage + 1) : 1;
    const nextEnd = Math.min(totalPages, nextStart + 1);

    setCustomParts((prev) => [
      ...prev,
      {
        id: `part-${Date.now()}`,
        startPage: nextStart,
        endPage: nextEnd,
      },
    ]);
  };

  // Remove custom part
  const handleRemoveCustomPart = (id: string) => {
    if (customParts.length <= 1) return;
    setCustomParts((prev) => prev.filter((p) => p.id !== id));
  };

  // Update custom part bounds
  const handleUpdateCustomPart = (id: string, field: "startPage" | "endPage", val: number) => {
    setCustomParts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          [field]: Math.max(1, Math.min(totalPages, val || 1)),
        };
      })
    );
  };

  // Quick preset: Split in half (2 equal PDFs)
  const handlePresetSplitInHalf = () => {
    setMultiStrategy("custom_ranges");
    const half = Math.max(1, Math.floor(totalPages / 2));
    setCustomParts([
      { id: "part-1", startPage: 1, endPage: half },
      { id: "part-2", startPage: Math.min(totalPages, half + 1), endPage: totalPages },
    ]);
  };

  // Quick preset: Split in 3 equal parts
  const handlePresetSplitInThree = () => {
    setMultiStrategy("custom_ranges");
    const p1End = Math.max(1, Math.floor(totalPages / 3));
    const p2End = Math.max(p1End + 1, Math.floor((totalPages * 2) / 3));
    setCustomParts([
      { id: "part-1", startPage: 1, endPage: p1End },
      { id: "part-2", startPage: Math.min(totalPages, p1End + 1), endPage: p2End },
      { id: "part-3", startPage: Math.min(totalPages, p2End + 1), endPage: totalPages },
    ]);
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

  // Action 2: Save selected pages as a ZIP archive
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

  // Filtered Items for Grid View
  const filteredItems = useMemo(() => {
    if (filterView === "selected") return pageItems.filter((it) => it.selected);
    if (filterView === "unselected") return pageItems.filter((it) => !it.selected);
    return pageItems;
  }, [pageItems, filterView]);

  const selectedCount = pageItems.filter((it) => it.selected).length;
  const removedCount = pageItems.length - selectedCount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Split 1 PDF into Multiple PDFs & Extract Pages
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Split a single PDF into multiple separate documents (by page count, custom ranges, or individual pages), extract specific ranges, or remove unwanted pages. 100% processed locally on your device.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileDropzone
            accept=".pdf,application/pdf"
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to split into multiple files"
            description="Ultra-fast in-memory processing. Effortlessly handles 300+ page documents."
            sampleFiles={[
              {
                name: "sample_scanned_contract_large.pdf",
                url: "/test-files/sample_scanned_contract_large.pdf",
                label: "📄 Multi-Page Contract (6 Pages · 874 KB)",
                kind: "pdf",
              },
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 Sample Invoice (2.1 KB)",
                kind: "pdf",
              },
            ]}
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
                  <span className="font-medium text-emerald-400">{totalPages} total pages</span>
                  <span>&bull;</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>&bull;</span>
                  <span className="text-zinc-400">
                    Mode: {mode === "multi_split" ? "Split to Multiple PDFs" : mode === "save_range" ? "Save Range" : "Remove Range"}
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
                setMultiSplitResults([]);
                setMultiSplitZipBlob(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
              title="Upload a different document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. THE TOP COMMAND CENTER: 3 OPTIONS INCLUDING MULTI-SPLIT */}
          {/* ============================================================== */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/95 border border-zinc-800 shadow-xl space-y-6">
            {/* Top Mode Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="inline-flex flex-wrap p-1 rounded-2xl bg-zinc-950 border border-zinc-800 gap-1">
                {/* TAB 1: SPLIT INTO MULTIPLE PDFS (FEATURED) */}
                <button
                  type="button"
                  onClick={() => setMode("multi_split")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mode === "multi_split"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Split into Multiple PDFs</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-violet-400/20 text-violet-300 font-extrabold ml-1">
                    Multi-PDF
                  </span>
                </button>

                {/* TAB 2: SAVE / EXTRACT RANGE */}
                <button
                  type="button"
                  onClick={() => setMode("save_range")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mode === "save_range"
                      ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Save / Keep Pages</span>
                </button>

                {/* TAB 3: REMOVE RANGE */}
                <button
                  type="button"
                  onClick={() => setMode("remove_range")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mode === "remove_range"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Pages</span>
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
                  className="w-20 px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>

            {/* ============================================================== */}
            {/* MODE 1: SPLIT 1 PDF INTO MULTIPLE PDFS (CORE WORKFLOW) */}
            {/* ============================================================== */}
            {mode === "multi_split" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Split className="w-4 h-4 text-violet-400" />
                      <span>Choose How You Want to Split this PDF:</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Split your <strong>{totalPages}-page document</strong> into multiple separate PDF files and download each part individually or as a ZIP package.
                    </p>
                  </div>

                  {/* Multi-Split Strategy Buttons */}
                  <div className="inline-flex p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setMultiStrategy("every_n")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        multiStrategy === "every_n"
                          ? "bg-violet-600 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Every N Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultiStrategy("custom_ranges")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        multiStrategy === "custom_ranges"
                          ? "bg-violet-600 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Custom Ranges
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultiStrategy("single_pages")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        multiStrategy === "single_pages"
                          ? "bg-violet-600 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Single Pages (1 Page = 1 PDF)
                    </button>
                  </div>
                </div>

                {/* Strategy 1: Every N Pages */}
                {multiStrategy === "every_n" && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-zinc-300 font-medium">Split document every:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={everyN}
                          onChange={(e) => setEveryN(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                          className="w-20 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs text-center focus:outline-none focus:border-violet-500"
                        />
                        <span className="text-xs text-zinc-400">pages per PDF file</span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                        <span className="text-[11px] text-zinc-500 mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setEveryN(1)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                            everyN === 1
                              ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                          }`}
                        >
                          Every 1 page
                        </button>
                        <button
                          type="button"
                          onClick={() => setEveryN(2)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                            everyN === 2
                              ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                          }`}
                        >
                          Every 2 pages
                        </button>
                        {totalPages >= 5 && (
                          <button
                            type="button"
                            onClick={() => setEveryN(5)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                              everyN === 5
                                ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                            }`}
                          >
                            Every 5 pages
                          </button>
                        )}
                        {totalPages >= 10 && (
                          <button
                            type="button"
                            onClick={() => setEveryN(10)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                              everyN === 10
                                ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                            }`}
                          >
                            Every 10 pages
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategy 2: Custom Multi-Ranges */}
                {multiStrategy === "custom_ranges" && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-zinc-300 font-medium">Define your multiple PDF split ranges:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handlePresetSplitInHalf}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800 cursor-pointer"
                        >
                          Split in Half (2 Equal PDFs)
                        </button>
                        {totalPages >= 3 && (
                          <button
                            type="button"
                            onClick={handlePresetSplitInThree}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800 cursor-pointer"
                          >
                            Split in 3 Parts
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAddCustomPart}
                          className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Part</span>
                        </button>
                      </div>
                    </div>

                    {/* Custom Range Rows */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {customParts.map((part, index) => (
                        <div
                          key={part.id}
                          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-semibold text-violet-400">PDF {index + 1}:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={part.startPage}
                              onChange={(e) =>
                                handleUpdateCustomPart(part.id, "startPage", parseInt(e.target.value) || 1)
                              }
                              className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono text-center text-xs"
                            />
                            <span className="text-zinc-500">to</span>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={part.endPage}
                              onChange={(e) =>
                                handleUpdateCustomPart(part.id, "endPage", parseInt(e.target.value) || 1)
                              }
                              className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-mono text-center text-xs"
                            />
                          </div>
                          {customParts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomPart(part.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Delete part"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy 3: Single Pages */}
                {multiStrategy === "single_pages" && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>
                        Every page in this document will be split into its own standalone 1-page PDF file (
                        <strong>{totalPages} PDF files</strong> total).
                      </span>
                    </div>
                    <span className="text-violet-400 font-mono font-bold">{totalPages} Files</span>
                  </div>
                )}

                {/* Dynamic Preview of Generated Files */}
                <div className="p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-violet-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Files that will be generated:</span>
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {plannedMultiParts.length} Separate PDF Files
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pt-1">
                    {plannedMultiParts.slice(0, 12).map((part) => (
                      <span
                        key={`plan-${part.partNum}`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                        <span>
                          PDF {part.partNum}: Pages {part.startPage}
                          {part.startPage !== part.endPage ? `–${part.endPage}` : ""}
                        </span>
                        <span className="text-[10px] text-zinc-500">({part.pageCount}p)</span>
                      </span>
                    ))}
                    {plannedMultiParts.length > 12 && (
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-[11px] text-zinc-400 flex items-center">
                        + {plannedMultiParts.length - 12} more PDF files
                      </span>
                    )}
                  </div>
                </div>

                {/* Big Split Execution Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteMultiSplit}
                    disabled={plannedMultiParts.length === 0 || isProcessing}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-600/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40"
                  >
                    <Split className="w-4 h-4 shrink-0" />
                    <span>
                      ⚡ Split Document into {plannedMultiParts.length} Separate PDF Files
                    </span>
                  </button>
                </div>

                {/* RESULTS HUB: IF MULTI-SPLIT HAS BEEN EXECUTED */}
                {multiSplitResults.length > 0 && (
                  <div className="p-5 rounded-3xl bg-zinc-950 border border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Successfully Split into {multiSplitResults.length} PDF Files!</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Download each PDF individually below, or download all files at once as a ZIP package.
                        </p>
                      </div>

                      {/* Download All as ZIP */}
                      {multiSplitZipBlob && (
                        <button
                          type="button"
                          onClick={() => {
                            const url = URL.createObjectURL(multiSplitZipBlob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${baseName}_split_${multiSplitResults.length}_files.zip`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Download All as ZIP ({formatBytes(multiSplitZipBlob.size)})</span>
                        </button>
                      )}
                    </div>

                    {/* Individual Split PDF Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                      {multiSplitResults.map((part) => (
                        <div
                          key={part.id}
                          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-zinc-200 truncate" title={part.filename}>
                                {part.filename}
                              </div>
                              <div className="text-zinc-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                                <span className="text-violet-400 font-medium">{part.pageRangeText}</span>
                                <span>&bull;</span>
                                <span>{part.pageCount} pages</span>
                                <span>&bull;</span>
                                <span>{formatBytes(part.sizeBytes)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                            <button
                              type="button"
                              onClick={() => downloadBuffer(part.pdfBytes, part.filename, "application/pdf")}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-emerald-400" />
                              <span>Download</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const blob = new Blob([part.pdfBytes as unknown as BlobPart], { type: "application/pdf" });
                                const url = URL.createObjectURL(blob);
                                window.open(url, "_blank");
                              }}
                              className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Preview in browser"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE 2: SAVE / KEEP PAGE RANGE */}
            {/* ============================================================== */}
            {mode === "save_range" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>From where to where you want to SAVE pages:</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Specify the page range to extract and save as a single PDF or ZIP package.
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
                      onClick={handleSelectNone}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Status Pill & Action Buttons */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>{selectedCount} pages selected for output</strong> out of {totalPages} pages.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{removedCount} excluded</span>
                </div>

                {/* Save Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {!extractedPdfBytes ? (
                    <button
                      type="button"
                      onClick={handleSaveSelectedAsPdf}
                      disabled={selectedCount === 0 || isProcessing}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Scissors className="w-4 h-4 shrink-0" />
                      <span>Save {selectedCount} Pages as Single PDF</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        downloadBuffer(
                          extractedPdfBytes,
                          `${baseName}_pages_saved.pdf`,
                          "application/pdf"
                        )
                      }
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download PDF ({formatBytes(extractedPdfBytes.byteLength)})</span>
                    </button>
                  )}

                  {!extractedZipBlob ? (
                    <button
                      type="button"
                      onClick={handleSaveSelectedAsZip}
                      disabled={selectedCount === 0 || isProcessing}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Archive className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Save {selectedCount} Pages as ZIP Archive</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(extractedZipBlob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${baseName}_${zipPageCount}_pages.zip`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download ZIP ({formatBytes(extractedZipBlob.size)})</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE 3: REMOVE PAGE RANGE */}
            {/* ============================================================== */}
            {mode === "remove_range" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>From where to where you want to REMOVE pages:</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Enter the page numbers to delete. All remaining pages will be saved.
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
                      Remove Page 1
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
                      <strong>Removing {removedCount} pages</strong> &bull; Output will keep <strong>{selectedCount} pages</strong>.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {removedCount > 0 ? "Changes applied" : "No pages marked"}
                  </span>
                </div>

                {/* Save Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {!extractedPdfBytes ? (
                    <button
                      type="button"
                      onClick={handleSaveSelectedAsPdf}
                      disabled={selectedCount === 0 || isProcessing}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Scissors className="w-4 h-4 shrink-0" />
                      <span>Save Remaining {selectedCount} Pages as Single PDF</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        downloadBuffer(
                          extractedPdfBytes,
                          `${baseName}_pages_removed.pdf`,
                          "application/pdf"
                        )
                      }
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download PDF ({formatBytes(extractedPdfBytes.byteLength)})</span>
                    </button>
                  )}

                  {!extractedZipBlob ? (
                    <button
                      type="button"
                      onClick={handleSaveSelectedAsZip}
                      disabled={selectedCount === 0 || isProcessing}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Archive className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Save Remaining {selectedCount} Pages as ZIP</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(extractedZipBlob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${baseName}_remaining_${zipPageCount}_pages.zip`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-3.5 px-5 rounded-2xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download ZIP ({formatBytes(extractedZipBlob.size)})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 3. PAGE GRID FILTER & VIEW CONTROLS */}
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
              Click any page thumbnail to toggle its inclusion in extraction.
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. HIGH-PERFORMANCE LAZY THUMBNAIL GRID */}
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
        title="Processing PDF..."
      />
    </div>
  );
}
