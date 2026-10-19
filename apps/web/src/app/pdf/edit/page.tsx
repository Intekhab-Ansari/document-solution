"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { PdfEditingSidebar } from "@/components/layout/PdfEditingSidebar";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import { renderPdfPageToCanvas } from "@/lib/pdf/pdf-render";
import {
  editPdfDocument,
  TextAnnotation,
  RectangleAnnotation,
  DrawingAnnotation,
} from "@/lib/pdf/pdf-edit";
import {
  extractAllExistingTextBlocks,
  ExistingPdfTextBlock,
} from "@/lib/pdf/pdf-text-extract";
import {
  PenTool,
  Type,
  Highlighter,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Palette,
  Sparkles,
  Undo2,
  CheckCircle2,
  Eraser,
  RotateCcw,
  Check,
} from "lucide-react";

type EditorToolMode = "edit-existing" | "text" | "whiteout" | "highlight" | "draw";

const COLOR_SWATCHES = [
  { label: "Black", hex: "#000000" },
  { label: "Dark Gray", hex: "#374151" },
  { label: "White", hex: "#ffffff" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Cyan", hex: "#06b6d4" },
  { label: "Blue", hex: "#2563eb" },
  { label: "Red", hex: "#dc2626" },
  { label: "Amber", hex: "#d97706" },
  { label: "Purple", hex: "#7c3aed" },
];

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Canvas page preview
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 612,
    height: 792,
  });
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Active Tool Mode
  const [toolMode, setToolMode] = useState<EditorToolMode>("edit-existing");

  // Styling controls
  const [activeColor, setActiveColor] = useState<string>("#111827"); // Default dark text color matching original document
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<"Helvetica" | "HelveticaBold" | "TimesRoman" | "Courier">("HelveticaBold");
  const [hasWhiteoutBackground, setHasWhiteoutBackground] = useState<boolean>(true); // Whiteout backing for new text
  const [penWidth, setPenWidth] = useState<number>(3);

  // Existing Text Blocks Store (extracted from the PDF stream)
  const [existingBlocksMap, setExistingBlocksMap] = useState<Record<number, ExistingPdfTextBlock[]>>({});
  const [selectedExistingBlockId, setSelectedExistingBlockId] = useState<string | null>(null);
  const [isLoadingTextBlocks, setIsLoadingTextBlocks] = useState<boolean>(false);

  // User-added Annotations Store
  const [texts, setTexts] = useState<TextAnnotation[]>([]);
  const [rectangles, setRectangles] = useState<RectangleAnnotation[]>([]);
  const [drawings, setDrawings] = useState<DrawingAnnotation[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Freehand drawing in-progress state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [editedPdfBytes, setEditedPdfBytes] = useState<Uint8Array | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Total modified existing blocks across all pages
  const totalModifiedExistingBlocks = Object.values(existingBlocksMap)
    .flat()
    .filter((b) => b.isModified || b.text !== b.originalText).length;

  // Handle PDF file selection
  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setEditedPdfBytes(null);
    setTexts([]);
    setRectangles([]);
    setDrawings([]);
    setSelectedElementId(null);
    setSelectedExistingBlockId(null);
    setExistingBlocksMap({});
    setCurrentPage(1);

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);

      const info = await getPdfInfo(bytes);
      setPageCount(info.pageCount);
      if (info.pages.length > 0) {
        setPageDimensions({
          width: info.pages[0].width,
          height: info.pages[0].height,
        });
      }

      await renderCurrentPage(bytes, 1);
    } catch (err) {
      console.error(err);
      alert("Error loading PDF: " + (err as Error).message);
    }
  };

  // Render current page to canvas background & extract existing text blocks with high-DPI clarity
  const renderCurrentPage = async (bytes: Uint8Array, pageNum: number, currentZoom = zoomScale) => {
    try {
      // Minimum 2.5x scale (180 DPI) or higher if zoomed in to guarantee razor-sharp clarity
      const renderScale = Math.max(2.5, currentZoom * 2.2);
      const canvas = await renderPdfPageToCanvas(bytes, pageNum, renderScale);
      setCanvasUrl(canvas.toDataURL("image/png"));

      // Extract existing text blocks if not cached yet for this page
      if (!existingBlocksMap[pageNum]) {
        setIsLoadingTextBlocks(true);
        try {
          const blocks = await extractAllExistingTextBlocks(bytes, pageNum);
          setExistingBlocksMap((prev) => {
            if (prev[pageNum]) return prev; // Preserve any in-progress edits
            return { ...prev, [pageNum]: blocks };
          });
        } catch (extractErr) {
          console.warn("Could not extract existing text blocks:", extractErr);
        } finally {
          setIsLoadingTextBlocks(false);
        }
      }
    } catch (err) {
      console.error("Failed to render page:", err);
    }
  };

  // Re-render when page changes
  useEffect(() => {
    if (fileBytes && currentPage) {
      setSelectedExistingBlockId(null);
      setSelectedElementId(null);
      renderCurrentPage(fileBytes, currentPage, zoomScale);
    }
  }, [currentPage, fileBytes]);

  // Re-render high-res page background if zoom level changes significantly
  useEffect(() => {
    if (fileBytes && currentPage) {
      const timer = setTimeout(() => {
        renderCurrentPage(fileBytes, currentPage, zoomScale);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [zoomScale]);

  // Sync toolbar controls when selecting an existing text block
  useEffect(() => {
    if (selectedExistingBlockId) {
      const pageBlocks = existingBlocksMap[currentPage] || [];
      const blk = pageBlocks.find((b) => b.id === selectedExistingBlockId);
      if (blk) {
        if (blk.color) setActiveColor(blk.color);
        if (blk.fontSize) setFontSize(blk.fontSize);
        if (blk.fontFamily) setFontFamily(blk.fontFamily);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExistingBlockId, currentPage]);

  // Update existing text block field
  const updateExistingBlock = (
    id: string,
    updates: Partial<ExistingPdfTextBlock>
  ) => {
    setExistingBlocksMap((prev) => {
      const pageBlocks = prev[currentPage] || [];
      const updated = pageBlocks.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...updates,
          isModified: true,
        };
      });
      return { ...prev, [currentPage]: updated };
    });
  };

  // Revert existing text block back to original
  const revertExistingBlock = (id: string) => {
    setExistingBlocksMap((prev) => {
      const pageBlocks = prev[currentPage] || [];
      const updated = pageBlocks.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          text: b.originalText,
          color: "#111827",
          fontSize: b.height || 14,
          isModified: false,
        };
      });
      return { ...prev, [currentPage]: updated };
    });
  };

  // Reset all modified blocks on the current page
  const resetAllPageEdits = () => {
    setExistingBlocksMap((prev) => {
      const pageBlocks = prev[currentPage] || [];
      const reverted = pageBlocks.map((b) => ({
        ...b,
        text: b.originalText,
        color: "#111827",
        isModified: false,
      }));
      return { ...prev, [currentPage]: reverted };
    });
    setSelectedExistingBlockId(null);
  };

  // Color change handler (updates active selection or default)
  const handleColorChange = (hex: string) => {
    setActiveColor(hex);
    if (selectedExistingBlockId) {
      updateExistingBlock(selectedExistingBlockId, { color: hex });
    } else if (selectedElementId) {
      updateTextProp(selectedElementId, "color", hex);
    }
  };

  // Font size change handler
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedExistingBlockId) {
      updateExistingBlock(selectedExistingBlockId, { fontSize: size });
    } else if (selectedElementId) {
      updateTextProp(selectedElementId, "fontSize", size);
    }
  };

  // Font family change handler
  const handleFontFamilyChange = (fam: "Helvetica" | "HelveticaBold" | "TimesRoman" | "Courier") => {
    setFontFamily(fam);
    if (selectedExistingBlockId) {
      updateExistingBlock(selectedExistingBlockId, {
        fontFamily: fam,
        isBold: fam === "HelveticaBold",
      });
    } else if (selectedElementId) {
      updateTextProp(selectedElementId, "fontFamily", fam);
      updateTextProp(selectedElementId, "isBold", fam === "HelveticaBold");
    }
  };

  // Click on canvas container to place text or whiteout box
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageContainerRef.current) return;
    if (toolMode === "draw") return;

    // Don't trigger if clicked on an existing annotation input
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.closest(".annotation-box")
    ) {
      return;
    }

    // Clicking blank canvas deselects active existing text block
    if (selectedExistingBlockId) {
      setSelectedExistingBlockId(null);
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoomScale;
    const clickY = (e.clientY - rect.top) / zoomScale;

    // Convert screen coordinates to PDF points (origin at bottom-left)
    const pdfX = Math.round(clickX);
    const pdfY = Math.round(pageDimensions.height - clickY);

    if (toolMode === "text") {
      const newText: TextAnnotation = {
        id: "text-" + Math.random().toString(36).substring(2, 9),
        pageNumber: currentPage,
        text: "Edit text here",
        x: pdfX,
        y: pdfY,
        fontSize,
        fontFamily,
        color: activeColor,
        hasWhiteoutBackground,
        isBold: fontFamily === "HelveticaBold",
      };
      setTexts((prev) => [...prev, newText]);
      setSelectedElementId(newText.id);
    } else if (toolMode === "whiteout") {
      // Create whiteout box (solid white box to cover old text)
      const newRect: RectangleAnnotation = {
        id: "rect-" + Math.random().toString(36).substring(2, 9),
        pageNumber: currentPage,
        x: pdfX,
        y: pdfY - 20,
        width: 140,
        height: 24,
        fillColor: "#ffffff",
        opacity: 1.0,
        borderColor: "#9ca3af",
        borderWidth: 1,
      };
      setRectangles((prev) => [...prev, newRect]);
      setSelectedElementId(newRect.id);
    } else if (toolMode === "highlight") {
      // Create translucent highlight bar
      const newRect: RectangleAnnotation = {
        id: "rect-" + Math.random().toString(36).substring(2, 9),
        pageNumber: currentPage,
        x: pdfX,
        y: pdfY - 18,
        width: 160,
        height: 20,
        fillColor: activeColor === "#000000" || activeColor === "#ffffff" ? "#fef08a" : activeColor,
        opacity: 0.35,
      };
      setRectangles((prev) => [...prev, newRect]);
      setSelectedElementId(newRect.id);
    }
  };

  // Drawing mode handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolMode !== "draw" || !pageContainerRef.current) return;
    setIsDrawing(true);

    const rect = pageContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoomScale;
    const clickY = (e.clientY - rect.top) / zoomScale;
    const pdfX = clickX;
    const pdfY = pageDimensions.height - clickY;

    setCurrentPath([{ x: pdfX, y: pdfY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || toolMode !== "draw" || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoomScale;
    const clickY = (e.clientY - rect.top) / zoomScale;
    const pdfX = clickX;
    const pdfY = pageDimensions.height - clickY;

    setCurrentPath((prev) => [...prev, { x: pdfX, y: pdfY }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      const newDrawing: DrawingAnnotation = {
        id: "draw-" + Math.random().toString(36).substring(2, 9),
        pageNumber: currentPage,
        points: currentPath,
        color: activeColor,
        lineWidth: penWidth,
      };
      setDrawings((prev) => [...prev, newDrawing]);
    }
    setCurrentPath([]);
  };

  // Update text annotation value
  const updateTextValue = (id: string, text: string) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  // Update text styling
  const updateTextProp = (id: string, key: keyof TextAnnotation, value: any) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t))
    );
  };

  // Delete annotation
  const deleteAnnotation = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    setRectangles((prev) => prev.filter((r) => r.id !== id));
    setDrawings((prev) => prev.filter((d) => d.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Bake and Save PDF with all modified existing text blocks and annotations
  const handleSavePdf = async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    setProgress({ percent: 20, stage: "Baking revised text and vector annotations into PDF..." });

    try {
      const allExistingBlocks = Object.values(existingBlocksMap).flat();

      const resultBytes = await editPdfDocument(fileBytes, {
        texts,
        rectangles,
        drawings,
        existingBlocks: allExistingBlocks,
      });

      setEditedPdfBytes(resultBytes);
      setProgress({ percent: 100, stage: "Ready for download!" });
    } catch (err) {
      console.error(err);
      alert("Error saving edited PDF: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBuffer(editedPdfBytes, `${baseName}_edited.pdf`, "application/pdf");
  };

  // Selected block reference
  const activeExistingBlock = (existingBlocksMap[currentPage] || []).find(
    (b) => b.id === selectedExistingBlockId
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Top Workspace Header */}
      <div className="px-4 py-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-900/40">
        <ToolWorkspaceHeader
          title="Edit PDF (Text, Colors & Annotations)"
          description="Directly click and edit any existing text in your PDF, change font colors, whiteout old numbers, highlight, and draw shapes. 100% processed locally in your browser memory."
          category="pdf"
          categoryLabel="PDF Tools"
          icon={<PenTool className="w-5 h-5 text-emerald-400" />}
          badge="Direct In-Place Vector Editor"
          currentStep={!file ? 1 : !editedPdfBytes ? 2 : 3}
        />
      </div>

      {/* Main Workspace with Persistent Tool Sidebar */}
      {!file ? (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop PDF here to edit any text and colors"
            description="Directly click and edit any existing text, change font colors, whiteout old figures, and annotate."
            sampleFiles={[
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 Sample Invoice - Edit company, amounts, dates",
                kind: "pdf",
              },
              {
                name: "sample_scanned_contract_large.pdf",
                url: "/test-files/sample_scanned_contract_large.pdf",
                label: "📄 Scanned Contract (875 KB)",
                kind: "pdf",
              },
            ]}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* 1. All-in-One PDF Tool Sidebar */}
          <PdfEditingSidebar
            activeToolId="edit"
            fileName={file.name}
            fileSize={file.size}
            pageCount={pageCount}
            onChangeFile={() => setFile(null)}
          />

          {/* 2. Editor Canvas & Toolbar Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
            {/* Top Interactive Editing Toolbar */}
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs z-10 backdrop-blur-md">
              {/* Tool Mode Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setToolMode("edit-existing");
                    setSelectedElementId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    toolMode === "edit-existing"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Click directly on any existing text in the PDF to edit it"
                >
                  <Sparkles className="w-4 h-4 fill-zinc-950" />
                  <span>Edit Existing Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setToolMode("text");
                    setSelectedExistingBlockId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    toolMode === "text"
                      ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Click anywhere to add brand new text"
                >
                  <Type className="w-4 h-4" />
                  <span>Add New Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setToolMode("whiteout");
                    setSelectedExistingBlockId(null);
                    setSelectedElementId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    toolMode === "whiteout"
                      ? "bg-white text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Whiteout box to erase/cover old text or numbers"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Whiteout Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setToolMode("highlight");
                    setSelectedExistingBlockId(null);
                    setSelectedElementId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    toolMode === "highlight"
                      ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Translucent highlight over text"
                >
                  <Highlighter className="w-4 h-4" />
                  <span>Highlight</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setToolMode("draw");
                    setSelectedExistingBlockId(null);
                    setSelectedElementId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    toolMode === "draw"
                      ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Freehand pen for annotations & signatures"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Draw / Pen</span>
                </button>
              </div>

              {/* Color Swatches & Native Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Color:</span>
                <div className="flex items-center gap-1.5">
                  {COLOR_SWATCHES.map((s) => (
                    <button
                      key={s.hex}
                      type="button"
                      onClick={() => handleColorChange(s.hex)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        activeColor === s.hex
                          ? "scale-125 border-emerald-400 ring-2 ring-emerald-500/40"
                          : "border-zinc-700 hover:scale-110"
                      }`}
                      style={{ backgroundColor: s.hex }}
                      title={s.label}
                    />
                  ))}
                  {/* Custom Color Input */}
                  <label
                    className="relative w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center cursor-pointer hover:border-emerald-400 overflow-hidden bg-zinc-900"
                    title="Custom color picker"
                  >
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <Palette className="w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
                  </label>
                </div>
              </div>

              {/* Font Sizing & Typography Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">Size:</span>
                  <select
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                  >
                    <option value="10">10 pt</option>
                    <option value="12">12 pt</option>
                    <option value="14">14 pt</option>
                    <option value="16">16 pt</option>
                    <option value="18">18 pt</option>
                    <option value="20">20 pt</option>
                    <option value="22">22 pt</option>
                    <option value="24">24 pt</option>
                    <option value="32">32 pt</option>
                    <option value="48">48 pt</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">Font:</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                  >
                    <option value="Helvetica">Standard (Sans)</option>
                    <option value="HelveticaBold">Bold Sans</option>
                    <option value="TimesRoman">Times (Serif)</option>
                    <option value="Courier">Courier (Mono)</option>
                  </select>
                </div>
              </div>

              {/* Active Selection Badge or Modifications Tracker */}
              {activeExistingBlock ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="truncate max-w-[140px] font-mono text-[11px]">
                    Editing: &ldquo;{activeExistingBlock.text}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedExistingBlockId(null)}
                    className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-300"
                    title="Done editing block"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : totalModifiedExistingBlocks > 0 ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-[11px]">
                    {totalModifiedExistingBlocks} existing text{totalModifiedExistingBlocks > 1 ? "s" : ""} edited
                  </span>
                  <button
                    type="button"
                    onClick={resetAllPageEdits}
                    className="ml-1 text-[10px] text-zinc-400 hover:text-white underline"
                    title="Reset edits on this page"
                  >
                    Reset page
                  </button>
                </div>
              ) : null}

              {/* Page Controls & Save CTA */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Page Switcher */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-zinc-200 px-1">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= pageCount}
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-950 border border-zinc-800">
                  <button
                    type="button"
                    disabled={zoomScale <= 0.6}
                    onClick={() => setZoomScale((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1.0)}
                    className="font-mono text-xs text-zinc-300 px-1 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Reset Zoom to 100%"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>
                  <button
                    type="button"
                    disabled={zoomScale >= 2.5}
                    onClick={() => setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Save & Download Button */}
                {!editedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleSavePdf}
                    className="px-4 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-zinc-950" />
                    <span>Apply Edits & Export</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Edited PDF ({formatBytes(editedPdfBytes.byteLength)})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Helper Banner for Existing Text Editing */}
            <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-zinc-300 font-medium">
                  {toolMode === "edit-existing"
                    ? "Hover over and click any text directly on the document below to edit its words, change font colors, or delete it."
                    : toolMode === "text"
                    ? "Click on any empty area to add new text, or click existing text to edit."
                    : toolMode === "whiteout"
                    ? "Click anywhere to place a whiteout box that covers old text."
                    : toolMode === "highlight"
                    ? "Click anywhere to place a translucent highlight bar."
                    : "Click and drag to sketch freehand annotations or signatures."}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                <span>Page size: {pageDimensions.width} x {pageDimensions.height} pt</span>
              </div>
            </div>

            {/* Canvas Stage Viewport */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-zinc-950/80">
              <div
                style={{
                  width: `${pageDimensions.width * zoomScale}px`,
                  height: `${pageDimensions.height * zoomScale}px`,
                }}
                className="relative flex items-center justify-center shrink-0 transition-[width,height] duration-150"
              >
                <div
                  ref={pageContainerRef}
                  onClick={handlePageClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{
                    width: `${pageDimensions.width}px`,
                    height: `${pageDimensions.height}px`,
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top left",
                  }}
                  className={`relative shadow-2xl rounded-lg border border-zinc-700 bg-white select-none ${
                    toolMode === "draw"
                      ? "cursor-crosshair"
                      : toolMode === "whiteout"
                      ? "cursor-cell"
                      : "cursor-text"
                  }`}
                >
                  {/* PDF Page Background Image */}
                  {canvasUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={canvasUrl}
                      alt={`Page ${currentPage}`}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  )}

                {/* 1. Existing PDF Text Blocks (In-Place Interactive Editor) */}
                {(existingBlocksMap[currentPage] || []).map((block) => {
                  const isSelected = selectedExistingBlockId === block.id;
                  const isModified = block.isModified || block.text !== block.originalText || block.color !== "#111827";

                  // PDF baseline to screen coordinates:
                  // block.y is baseline from bottom in points.
                  // Baseline in screen coordinates is (pageDimensions.height - block.y).
                  // Top of the text box is baseline - fontSize * 0.88.
                  const screenTop = pageDimensions.height - block.y - Math.round(block.fontSize * 0.88);
                  const screenLeft = block.x;

                  if (isSelected) {
                    return (
                      <div
                        key={block.id}
                        className="annotation-box absolute z-30 flex flex-col items-start"
                        style={{
                          left: `${screenLeft}px`,
                          top: `${screenTop}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative flex items-center bg-white p-0.5 rounded shadow-lg border border-emerald-500 ring-2 ring-emerald-500/20">
                          <input
                            type="text"
                            autoFocus
                            value={block.text}
                            onChange={(e) => updateExistingBlock(block.id, { text: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setSelectedExistingBlockId(null);
                              }
                            }}
                            style={{
                              fontSize: `${block.fontSize}px`,
                              color: block.color || "#111827",
                              fontWeight: block.isBold ? "bold" : "normal",
                              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Nirmala UI', Arial, sans-serif",
                              minWidth: `${Math.max(block.width + 10, (block.text || "").length * (block.fontSize * 0.65) + 15)}px`,
                            }}
                            className="bg-white outline-none px-1 py-0.5 rounded text-zinc-950 font-medium"
                          />

                          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-zinc-200">
                            {isModified && (
                              <button
                                type="button"
                                onClick={() => revertExistingBlock(block.id)}
                                className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 flex items-center gap-0.5 transition-colors"
                                title="Revert to original text"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>Revert</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => updateExistingBlock(block.id, { text: "" })}
                              className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Erase this text from PDF"
                            >
                              <Eraser className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExistingBlockId(null)}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 transition-colors cursor-pointer"
                              title="Apply & Close"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Done</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Modified block: Render with seamless white background matching original document text without harsh badges
                  if (isModified) {
                    return (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExistingBlockId(block.id);
                          setSelectedElementId(null);
                        }}
                        className="annotation-box absolute z-20 group cursor-pointer"
                        style={{
                          left: `${screenLeft}px`,
                          top: `${screenTop}px`,
                        }}
                        title="Click to edit text"
                      >
                        <div
                          className="relative inline-flex items-center bg-white px-0.5 rounded-[2px] transition-all group-hover:outline group-hover:outline-1 group-hover:outline-dashed group-hover:outline-emerald-500"
                          style={{
                            fontSize: `${block.fontSize}px`,
                            color: block.color || "#111827",
                            fontWeight: block.isBold ? "bold" : "normal",
                            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Nirmala UI', Arial, sans-serif",
                            minWidth: `${Math.max(block.width, (block.text || "").length * (block.fontSize * 0.6))}px`,
                            lineHeight: 1.2,
                          }}
                        >
                          {block.text ? (
                            <span>{block.text}</span>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">[Erased]</span>
                          )}
                          <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold bg-emerald-500 text-zinc-950 px-1 py-0.2 rounded -top-3.5 right-0 absolute shadow pointer-events-none transition-opacity whitespace-nowrap">
                            Edit
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Normal unedited text: interactive hotspot
                  return (
                    <div
                      key={block.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExistingBlockId(block.id);
                        setSelectedElementId(null);
                      }}
                      className="annotation-box absolute z-10 group cursor-pointer"
                      style={{
                        left: `${screenLeft - 2}px`,
                        top: `${screenTop - 1}px`,
                        width: `${block.width + 4}px`,
                        height: `${Math.round(block.fontSize * 1.25)}px`,
                      }}
                      title={`Click to edit: "${block.originalText}"`}
                    >
                      <div className="w-full h-full rounded border border-transparent group-hover:border-emerald-500 group-hover:bg-emerald-500/15 group-hover:shadow-sm transition-all flex items-start justify-end">
                        <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold bg-emerald-500 text-zinc-950 px-1 py-0.2 rounded -top-3.5 right-0 absolute shadow pointer-events-none transition-opacity whitespace-nowrap">
                          Click to edit
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Rendered Rectangles / Whiteout Boxes */}
                {rectangles
                  .filter((r) => r.pageNumber === currentPage)
                  .map((rect) => {
                    const screenTop = pageDimensions.height - rect.y - rect.height;
                    return (
                      <div
                        key={rect.id}
                        className="annotation-box absolute group border cursor-move z-20"
                        style={{
                          left: `${rect.x}px`,
                          top: `${screenTop}px`,
                          width: `${rect.width}px`,
                          height: `${rect.height}px`,
                          backgroundColor: rect.fillColor,
                          opacity: rect.opacity,
                          borderColor: rect.borderColor || "transparent",
                          borderWidth: rect.borderWidth || 1,
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnnotation(rect.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute -top-3 -right-3 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500 transition-opacity"
                          title="Delete box"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                {/* 3. Rendered Freehand Drawing Paths */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  {drawings
                    .filter((d) => d.pageNumber === currentPage)
                    .map((d) => {
                      const pathString = d.points
                        .map((pt, idx) => {
                          const screenY = pageDimensions.height - pt.y;
                          return `${idx === 0 ? "M" : "L"} ${pt.x} ${screenY}`;
                        })
                        .join(" ");

                      return (
                        <path
                          key={d.id}
                          d={pathString}
                          stroke={d.color}
                          strokeWidth={d.lineWidth}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}

                  {/* Active drawing stroke in progress */}
                  {isDrawing && currentPath.length > 1 && (
                    <path
                      d={currentPath
                        .map((pt, idx) => {
                          const screenY = pageDimensions.height - pt.y;
                          return `${idx === 0 ? "M" : "L"} ${pt.x} ${screenY}`;
                        })
                        .join(" ")}
                      stroke={activeColor}
                      strokeWidth={penWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* 4. Rendered User-Added Text Annotations */}
                {texts
                  .filter((t) => t.pageNumber === currentPage)
                  .map((t) => {
                    const screenTop = pageDimensions.height - t.y;
                    const isSelected = selectedElementId === t.id;

                    return (
                      <div
                        key={t.id}
                        className="annotation-box absolute group z-20"
                        style={{
                          left: `${t.x}px`,
                          top: `${screenTop}px`,
                        }}
                      >
                        <div
                          className={`relative flex items-center p-1 rounded border transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 shadow-lg ring-1 ring-emerald-500/40"
                              : "border-transparent hover:border-zinc-400/50"
                          }`}
                        >
                          <input
                            type="text"
                            value={t.text}
                            onChange={(e) => updateTextValue(t.id, e.target.value)}
                            onFocus={() => {
                              setSelectedElementId(t.id);
                              setSelectedExistingBlockId(null);
                            }}
                            style={{
                              fontSize: `${t.fontSize}px`,
                              color: t.color,
                              fontFamily: t.fontFamily?.includes("Courier")
                                ? "Courier, monospace"
                                : t.fontFamily?.includes("Times")
                                ? "Times New Roman, serif"
                                : "Helvetica, Arial, sans-serif",
                              fontWeight: t.isBold ? "bold" : "normal",
                              backgroundColor: t.hasWhiteoutBackground ? "#ffffff" : "transparent",
                            }}
                            className="bg-transparent px-1.5 py-0.5 rounded outline-none shadow-sm min-w-[60px]"
                          />

                          {/* Quick Delete Element Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAnnotation(t.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 ml-1 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-opacity"
                            title="Delete text"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal during PDF compilation */}
      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Baking Edits into PDF..."
      />
    </div>
  );
}
