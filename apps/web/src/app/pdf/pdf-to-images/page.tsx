"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes } from "@/lib/utils";
import { convertPdfToImages, createZipFromImages } from "@/lib/pdf/pdf-convert";
import { getPdfInfo } from "@/lib/pdf/pdf-manipulate";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Archive,
  AlertTriangle,
  FileText,
  FileCheck,
  Sparkles,
} from "lucide-react";

export default function PdfToImagesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [dpi, setDpi] = useState<number>(150);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [images, setImages] = useState<{ pageNumber: number; blob: Blob; filename: string; dataUrl: string }[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Friendly state when an image was accidentally selected on this PDF tool
  const [imageSelectedNotice, setImageSelectedNotice] = useState<{
    file: File;
    name: string;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setImageSelectedNotice(null);

    // Detect if user selected an image instead of a PDF
    const isImage =
      selected.type.startsWith("image/") ||
      /\.(png|jpe?g|webp|heic|avif|gif|bmp|tiff)$/i.test(selected.name);

    if (isImage) {
      setImageSelectedNotice({ file: selected, name: selected.name });
      return;
    }

    setFile(selected);
    setImages([]);
    setZipBlob(null);

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);

      const info = await getPdfInfo(bytes);
      setPageCount(info.pageCount);
    } catch (err) {
      alert("Could not read PDF: " + (err as Error).message);
    }
  };

  const handleConvert = async () => {
    if (!fileBytes) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: "Starting page rasterization..." });

    try {
      const converted = await convertPdfToImages(fileBytes, {
        format,
        dpi,
        quality: 0.95,
        onProgress: (curr, total) => {
          const pct = Math.round((curr / total) * 85);
          setProgress({ percent: pct, stage: `Rasterizing page ${curr} of ${total} at ${dpi} DPI...` });
        },
      });

      const itemsWithUrl = converted.map((item) => ({
        ...item,
        dataUrl: URL.createObjectURL(item.blob),
      }));

      setImages(itemsWithUrl);

      // Create ZIP
      setProgress({ percent: 90, stage: "Packaging ZIP archive..." });
      const zip = await createZipFromImages(converted);
      setZipBlob(zip);
    } catch (err) {
      console.error(err);
      alert("Conversion failed: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = (item: { filename: string; blob: Blob }) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = () => {
    if (!zipBlob || !file) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="PDF to High-Res Images"
        description="Extract PDF pages to crystal-clear PNG, JPG, or WebP. Choose DPI, download individual pages, or grab a ZIP archive. 100% processed in your browser."
        category="convert"
        categoryLabel="Converters"
        icon={<ImageIcon className="w-5 h-5 text-emerald-400" />}
        badge="Zero-Loss Rasterization"
        currentStep={!file ? 1 : images.length === 0 ? 2 : 3}
      />

      {/* Smart Helper if user selected an image on this tool */}
      {imageSelectedNotice && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Image File Detected: &ldquo;{imageSelectedNotice.name}&rdquo;</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            This tool converts <strong>PDF documents into image files</strong>. It looks like you selected an image file instead of a PDF!
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/pdf/images-to-pdf"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <span>Convert this Image to PDF &rarr;</span>
            </Link>
            <Link
              href="/image/convert"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
            >
              Convert to JPG/PNG/WebP
            </Link>
            <button
              onClick={() => setImageSelectedNotice(null)}
              className="px-3 py-2 text-zinc-400 hover:text-white text-xs underline ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to convert to images"
            description="Up to 300 DPI high-resolution export. Select any PDF document."
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
          {/* Options Panel */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{file.name}</p>
                <p className="text-zinc-500">{pageCount} {pageCount === 1 ? "page" : "pages"} &bull; {formatBytes(file.size)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Format:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                >
                  <option value="image/png">PNG (Lossless)</option>
                  <option value="image/jpeg">JPEG (Compressed)</option>
                  <option value="image/webp">WebP (Modern)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">DPI:</span>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none"
                >
                  <option value={96}>96 DPI (Web Screen)</option>
                  <option value={150}>150 DPI (Balanced)</option>
                  <option value={300}>300 DPI (Print Quality)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Convert to Images</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Converted Pages ({images.length})</h3>
                {zipBlob && (
                  <button
                    type="button"
                    onClick={downloadZip}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download All as ZIP ({formatBytes(zipBlob.size)})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((item) => (
                  <div
                    key={item.pageNumber}
                    className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 group"
                  >
                    <div className="relative aspect-[1/1.4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.dataUrl}
                        alt={`Page ${item.pageNumber}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-medium text-zinc-400">Page {item.pageNumber}</span>
                      <button
                        type="button"
                        onClick={() => downloadSingle(item)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Download Page Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Extracting images from PDF..."
      />
    </div>
  );
}
