// Client-side PDF rendering engine powered by pdfjs-dist
import * as pdfjsLib from "pdfjs-dist";

// Configure worker path to local public asset (no CDN, zero network requests)
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export interface RenderedPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl: string;
}

export async function loadPdfDoc(pdfData: ArrayBuffer | Uint8Array) {
  // CRITICAL: Clone buffer data before passing to worker!
  // pdfjs transfers/detaches the buffer, which would otherwise destroy the caller's ArrayBuffer.
  const dataCopy = pdfData instanceof Uint8Array
    ? pdfData.slice()
    : new Uint8Array(pdfData).slice();

  const isBrowser = typeof window !== "undefined";

  const loadingTask = pdfjsLib.getDocument({
    data: dataCopy,
    cMapUrl: isBrowser ? "/cmaps/" : undefined,
    cMapPacked: true,
    standardFontDataUrl: isBrowser ? "/standard_fonts/" : undefined,
  });
  return await loadingTask.promise;
}

export async function renderPdfPageToCanvas(
  pdfData: ArrayBuffer | Uint8Array,
  pageNumber: number,
  scale = 2.5
): Promise<HTMLCanvasElement> {
  const doc = await loadPdfDoc(pdfData);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const baseViewport = page.getViewport({ scale: 1.0 });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  // Store exact unscaled base page dimensions in points on the canvas element
  (canvas as any).pageWidth = Math.round(baseViewport.width);
  (canvas as any).pageHeight = Math.round(baseViewport.height);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  // @ts-expect-error pdfjs typing nuance
  await page.render(renderContext).promise;
  return canvas;
}

export async function getPdfPageDimensions(
  pdfData: ArrayBuffer | Uint8Array,
  pageNumber: number
): Promise<{ width: number; height: number }> {
  const doc = await loadPdfDoc(pdfData);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.0 });
  return {
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
  };
}

export async function renderPageThumbnail(
  pdfData: ArrayBuffer | Uint8Array,
  pageNumber: number,
  targetWidth = 480
): Promise<string> {
  const doc = await loadPdfDoc(pdfData);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Could not get 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const renderContext = {
    canvasContext: ctx,
    viewport: scaledViewport,
  };

  // @ts-expect-error pdfjs typing nuance
  await page.render(renderContext).promise;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

  // Clean up canvas
  canvas.width = 0;
  canvas.height = 0;
  return dataUrl;
}

export async function renderAllPageThumbnails(
  pdfData: ArrayBuffer | Uint8Array,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const doc = await loadPdfDoc(pdfData);
  const total = doc.numPages;
  const thumbnails: string[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = 520 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // @ts-expect-error pdfjs typing nuance
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      thumbnails.push(canvas.toDataURL("image/jpeg", 0.9));
      canvas.width = 0;
      canvas.height = 0;
    }
    onProgress?.(i, total);
  }

  return thumbnails;
}

export async function renderDocPageToImageBlob(
  doc: any,
  pageNumber: number,
  dpi = 150,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92
): Promise<{ blob: Blob; width: number; height: number }> {
  const page = await doc.getPage(pageNumber);
  // 72 DPI is standard PDF scale 1.0
  const scale = dpi / 72;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");

  // Fill white background for JPEGs
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width: canvas.width, height: canvas.height });
        } else {
          reject(new Error("Failed to encode canvas to blob"));
        }
      },
      format,
      quality
    );
  });
}

export async function renderPageToImageBlob(
  pdfData: ArrayBuffer | Uint8Array,
  pageNumber: number,
  dpi = 150,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92
): Promise<{ blob: Blob; width: number; height: number }> {
  const doc = await loadPdfDoc(pdfData);
  return await renderDocPageToImageBlob(doc, pageNumber, dpi, format, quality);
}
