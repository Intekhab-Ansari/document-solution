import { PDFDocument } from "pdf-lib";
import { renderPageToImageBlob, loadPdfDoc } from "./pdf-render";

export type CompressionPreset = "low" | "medium" | "high" | "extreme";

export interface CompressionResult {
  compressedBytes: Uint8Array;
  originalSize: number;
  newSize: number;
  savingsPercent: number;
  iterationsRun: number;
  message?: string;
  isTargetMet: boolean;
  isVectorDominated?: boolean;
}

export interface CompressOptions {
  mode: "preset" | "target";
  preset?: CompressionPreset;
  targetKB?: number;
  grayscale?: boolean;
  onProgress?: (progress: { percent: number; stage: string; currentIteration?: number }) => void;
}

const PRESET_CONFIGS: Record<CompressionPreset, { dpi: number; quality: number }> = {
  low: { dpi: 180, quality: 0.85 },
  medium: { dpi: 130, quality: 0.70 },
  high: { dpi: 100, quality: 0.50 },
  extreme: { dpi: 72, quality: 0.35 },
};

/**
 * Perform initial stream/object optimization using pdf-lib
 */
export async function optimizePdfStreams(pdfBytes: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  // Strip non-essential metadata
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("IntekEdit (Client-Side)");
  doc.setCreator("IntekEdit");

  return await doc.save({
    useObjectStreams: true,
  });
}

/**
 * Compress a PDF by re-rendering pages as optimized JPEGs and re-assembling
 */
async function rasterCompressPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  dpi: number,
  quality: number,
  grayscale = false,
  onPageProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfjsDoc = await loadPdfDoc(pdfBytes);
  const totalPages = pdfjsDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const pageRender = await renderPageToImageBlob(
      pdfBytes,
      i,
      dpi,
      "image/jpeg",
      quality
    );

    // If grayscale requested, convert on temporary canvas
    let imageBlob = pageRender.blob;
    if (grayscale) {
      imageBlob = await convertBlobToGrayscale(imageBlob);
    }

    const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
    const embeddedImage = await newPdf.embedJpg(imageBytes);

    const pdfPage = newPdf.addPage([pageRender.width, pageRender.height]);
    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: pageRender.width,
      height: pageRender.height,
    });

    onPageProgress?.(i, totalPages);
  }

  return await newPdf.save({ useObjectStreams: true });
}

async function convertBlobToGrayscale(blob: Blob): Promise<Blob> {
  const imgBitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = imgBitmap.width;
  canvas.height = imgBitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;

  ctx.filter = "grayscale(100%)";
  ctx.drawImage(imgBitmap, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || blob), "image/jpeg", 0.7);
  });
}

/**
 * Main PDF Compression Engine supporting Presets and Iterative Target-Size Binary Search
 */
export async function compressPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: CompressOptions
): Promise<CompressionResult> {
  const originalSize = pdfBytes.byteLength;
  const { onProgress } = options;

  onProgress?.({ percent: 10, stage: "Analyzing document structures..." });

  // 1. Try pure stream optimization first
  const streamOptimized = await optimizePdfStreams(pdfBytes);
  const streamSize = streamOptimized.byteLength;

  if (options.mode === "preset") {
    const preset = options.preset || "medium";
    const config = PRESET_CONFIGS[preset];

    onProgress?.({ percent: 30, stage: `Applying ${preset} compression...` });

    // Compare stream-optimized with raster-compressed
    const rasterBytes = await rasterCompressPdf(
      pdfBytes,
      config.dpi,
      config.quality,
      options.grayscale,
      (current, total) => {
        const pct = 30 + Math.round((current / total) * 60);
        onProgress?.({ percent: pct, stage: `Compressing page ${current} of ${total}...` });
      }
    );

    // Pick the smaller one
    const bestBytes = rasterBytes.byteLength < streamSize ? rasterBytes : streamOptimized;
    const newSize = bestBytes.byteLength;
    const savingsPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

    return {
      compressedBytes: bestBytes,
      originalSize,
      newSize,
      savingsPercent,
      iterationsRun: 1,
      isTargetMet: true,
      message: `Successfully compressed using ${preset} preset.`,
    };
  }

  // TARGET SIZE MODE
  const targetBytes = (options.targetKB || 200) * 1024;
  const acceptableMin = targetBytes * 0.90; // Stop within 10% under target

  // If already under target with stream compression alone
  if (streamSize <= targetBytes) {
    const savingsPercent = Math.max(0, Math.round(((originalSize - streamSize) / originalSize) * 100));
    return {
      compressedBytes: streamOptimized,
      originalSize,
      newSize: streamSize,
      savingsPercent,
      iterationsRun: 1,
      isTargetMet: true,
      message: `Document already fits under ${options.targetKB} KB with stream optimization!`,
    };
  }

  // Iterative binary search over Quality and DPI
  let lowQ = 0.20;
  let highQ = 0.92;
  let lowDpi = 65;
  let highDpi = 180;

  let bestResult: Uint8Array = streamOptimized;
  let bestSize = streamSize;
  let isMet = false;
  const maxIterations = 6;
  let iter = 0;

  while (iter < maxIterations) {
    iter++;
    const midQ = Number(((lowQ + highQ) / 2).toFixed(2));
    const midDpi = Math.round((lowDpi + highDpi) / 2);

    onProgress?.({
      percent: Math.round((iter / maxIterations) * 85),
      stage: `Binary search iteration ${iter}/${maxIterations} (Q: ${Math.round(midQ * 100)}%, ${midDpi} DPI)...`,
      currentIteration: iter,
    });

    const candidate = await rasterCompressPdf(
      pdfBytes,
      midDpi,
      midQ,
      options.grayscale
    );
    const candidateSize = candidate.byteLength;

    if (candidateSize <= targetBytes) {
      // Valid candidate under target
      if (candidateSize >= acceptableMin || iter === maxIterations) {
        // Within the sweet spot target window!
        bestResult = candidate;
        bestSize = candidateSize;
        isMet = true;
        break;
      }
      // Too small / quality could be higher, search higher half
      bestResult = candidate;
      bestSize = candidateSize;
      isMet = true;
      lowQ = midQ;
      lowDpi = midDpi;
    } else {
      // Still too large, search lower half
      highQ = midQ;
      highDpi = midDpi;
      if (bestSize > candidateSize) {
        bestResult = candidate;
        bestSize = candidateSize;
      }
    }
  }

  onProgress?.({ percent: 100, stage: "Finalizing export..." });

  const finalSavings = Math.max(0, Math.round(((originalSize - bestSize) / originalSize) * 100));
  let message = `Achieved ${(bestSize / 1024).toFixed(1)} KB (Target: ${options.targetKB} KB).`;

  if (!isMet && bestSize > targetBytes) {
    message = `Best compression achieved is ${(bestSize / 1024).toFixed(1)} KB. This document contains rich multi-page vector graphics or imagery that cannot shrink further without unreadable pixelation.`;
  }

  return {
    compressedBytes: bestResult,
    originalSize,
    newSize: bestSize,
    savingsPercent: finalSavings,
    iterationsRun: iter,
    isTargetMet: isMet,
    message,
  };
}
