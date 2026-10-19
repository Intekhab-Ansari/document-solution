"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { renderPdfPageToCanvas, loadPdfDoc } from "@/lib/pdf/pdf-render";
import { stampSignatureOnPdf } from "@/lib/pdf/pdf-advanced";
import { formatBytes } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  FileCheck,
  Download,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Type,
  Upload,
  Eraser,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [pageCanvasUrl, setPageCanvasUrl] = useState<string | null>(null);

  // Signature modes: "draw" | "type" | "upload"
  const [signatureMode, setSignatureMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState("John Doe");
  const [penColor, setPenColor] = useState("#0f172a"); // Default dark slate
  const [penWidth, setPenWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Signature placement coordinates (% of page)
  const [posX, setPosX] = useState(50); // % from left
  const [posY, setPosY] = useState(20); // % from bottom
  const [sigScale, setSigScale] = useState(150); // width in points

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    const buffer = await f.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setPdfBytes(bytes);

    // Get page count using safe buffer-cloning loadPdfDoc
    const doc = await loadPdfDoc(bytes);
    setPageCount(doc.numPages);
    setSelectedPage(1);
    await loadPagePreview(bytes, 1);
  };

  const loadPagePreview = async (bytes: Uint8Array, pageNum: number) => {
    try {
      const canvas = await renderPdfPageToCanvas(bytes, pageNum, 1.2);
      setPageCanvasUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (pdfBytes) {
      loadPagePreview(pdfBytes, selectedPage);
    }
  }, [selectedPage]);

  // Drawing canvas logic
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [drawCanvasRef, signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    captureDrawnSignature();
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const captureDrawnSignature = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL("image/png"));
  };

  // Generate typed signature image on hidden canvas
  const generateTypedSignature = (text: string) => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 120;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.font = "italic 44px cursive, sans-serif";
    ctx.fillStyle = penColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, 200, 60);

    setSignatureDataUrl(c.toDataURL("image/png"));
  };

  useEffect(() => {
    if (signatureMode === "type" && typedName) {
      generateTypedSignature(typedName);
    }
  }, [signatureMode, typedName, penColor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureDataUrl(reader.result as string);
    };
    reader.readAsDataURL(imgFile);
  };

  const handleSignDocument = async () => {
    if (!pdfBytes || !signatureDataUrl) return;
    setProcessing(true);
    setProgress(20);
    setStatusMessage("Converting signature coordinates...");

    try {
      // Fetch PNG bytes from data URL
      const res = await fetch(signatureDataUrl);
      const pngBlob = await res.blob();
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

      setProgress(50);
      setStatusMessage("Stamping digital signature onto PDF...");

      // Render actual page size to calculate coordinates in PDF points
      const doc = await loadPdfDoc(pdfBytes);
      const page = await doc.getPage(selectedPage);
      const viewport = page.getViewport({ scale: 1.0 });

      // Calculate X and Y in PDF points (bottom-left origin)
      const pdfX = (posX / 100) * viewport.width - sigScale / 2;
      const pdfY = (posY / 100) * viewport.height;
      const sigHeight = sigScale * 0.4; // roughly 2.5:1 aspect ratio

      const signedBytes = await stampSignatureOnPdf(pdfBytes, {
        pageNumber: selectedPage,
        x: Math.max(0, pdfX),
        y: Math.max(0, pdfY),
        width: sigScale,
        height: sigHeight,
        signaturePngBytes: pngBytes,
      });

      setProgress(90);
      setStatusMessage("Finalizing document...");

      const blob = new Blob([signedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setSignedPdfUrl(url);
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("Signing failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Sign PDF Document"
        description="Draw, type, or upload your signature and stamp it onto your document with zero server upload. Instant placement and preview."
        category="security"
        categoryLabel="Security & Sign"
        icon={<PenTool className="w-5 h-5 text-emerald-400" />}
        badge="Zero-Upload E-Signature"
        currentStep={!pdfBytes ? 1 : !signedPdfUrl ? 2 : 3}
      />

      {!pdfBytes ? (
        <FileDropzone
          accept="*/*"
          onFilesSelected={handleFilesSelected}
          title="Drop PDF here to sign"
          description="Your document stays 100% inside your browser memory."
          sampleFiles={[
            {
              name: "sample_invoice_small.pdf",
              url: "/test-files/sample_invoice_small.pdf",
              label: "Sample Invoice",
              kind: "pdf",
            },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Signature Creation Pad */}
          <div className="lg:col-span-5 space-y-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PenTool className="w-4 h-4 text-cyan-400" /> Create Signature
              </h3>
              {signatureDataUrl && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready to stamp
                </span>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSignatureMode("draw")}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  signatureMode === "draw"
                    ? "bg-cyan-500 text-zinc-950 font-bold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> Draw
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode("type")}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  signatureMode === "type"
                    ? "bg-cyan-500 text-zinc-950 font-bold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Type
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode("upload")}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  signatureMode === "upload"
                    ? "bg-cyan-500 text-zinc-950 font-bold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>

            {/* DRAW MODE */}
            {signatureMode === "draw" && (
              <div className="space-y-3">
                <div className="border border-zinc-700/80 rounded-2xl bg-white overflow-hidden shadow-inner">
                  <canvas
                    ref={drawCanvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 cursor-crosshair touch-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  {/* Color pickers */}
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Ink:</span>
                    {["#0f172a", "#1d4ed8", "#991b1b"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPenColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${
                          penColor === c ? "scale-125 border-cyan-400" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>
            )}

            {/* TYPE MODE */}
            {signatureMode === "type" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="p-6 rounded-2xl bg-white border border-zinc-700 flex items-center justify-center min-h-[100px]">
                  <span
                    className="text-3xl italic tracking-wide font-serif"
                    style={{ color: penColor, fontFamily: "cursive, sans-serif" }}
                  >
                    {typedName || "Your Signature"}
                  </span>
                </div>
              </div>
            )}

            {/* UPLOAD MODE */}
            {signatureMode === "upload" && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-zinc-700 hover:border-cyan-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950">
                  <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold text-white">Upload transparent PNG</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Scanned signature image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Placement Controls */}
            <div className="space-y-4 pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Placement Controls</h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Horizontal Position (X)</span>
                  <span>{posX}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Vertical Position (Y)</span>
                  <span>{posY}% from bottom</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Signature Scale Width</span>
                  <span>{sigScale} pt</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={280}
                  value={sigScale}
                  onChange={(e) => setSigScale(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Stamp Button */}
            <button
              type="button"
              disabled={!signatureDataUrl || processing}
              onClick={handleSignDocument}
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Stamp Signature & Generate PDF</span>
            </button>
          </div>

          {/* Right: Live Document Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <button
                  type="button"
                  disabled={selectedPage <= 1}
                  onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {selectedPage} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={selectedPage >= pageCount}
                  onClick={() => setSelectedPage((p) => Math.min(pageCount, p + 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPdfBytes(null);
                  setSignedPdfUrl(null);
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Document
              </button>
            </div>

            {/* Document Preview Box with Live Signature Overlay */}
            <div className="relative border border-zinc-800 rounded-3xl bg-zinc-950 p-4 flex items-center justify-center overflow-hidden min-h-[460px] shadow-2xl">
              {pageCanvasUrl ? (
                <div className="relative inline-block max-w-full shadow-2xl rounded-lg overflow-hidden">
                  <img
                    src={pageCanvasUrl}
                    alt={`Preview of page ${selectedPage}`}
                    className="max-h-[600px] w-auto object-contain block pointer-events-none"
                  />

                  {/* Signature Ghost / Overlay Badge on Page */}
                  {signatureDataUrl && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${posX}%`,
                        bottom: `${posY}%`,
                        transform: "translate(-50%, 50%)",
                        width: `${(sigScale / 450) * 100}%`,
                      }}
                      className="pointer-events-none border-2 border-dashed border-cyan-400/80 bg-cyan-500/10 rounded p-1"
                    >
                      <img
                        src={signatureDataUrl}
                        alt="Signature overlay preview"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500 text-xs">Rendering preview...</div>
              )}
            </div>

            {/* Download Card after signing */}
            {signedPdfUrl && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-emerald-500/15 border border-emerald-500/40 shadow-xl flex items-center justify-between animate-in fade-in">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Document Signed Successfully
                  </h4>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Ready to download with stamped vector signature.
                  </p>
                </div>

                <a
                  href={signedPdfUrl}
                  download={`signed_${file?.name || "document.pdf"}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Signing PDF"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
