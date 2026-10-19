import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { renderPageToImageBlob, renderDocPageToImageBlob, loadPdfDoc } from "./pdf-render";

export interface PdfToImageOptions {
  format: "image/png" | "image/jpeg" | "image/webp";
  dpi: number;
  quality?: number;
  pages?: number[]; // 1-indexed, or all if omitted
  onProgress?: (current: number, total: number) => void;
}

export interface ImageToPdfOptions {
  pageSize: "fit" | "a4-portrait" | "a4-landscape" | "letter";
  margin: number; // in points
  onProgress?: (current: number, total: number) => void;
}

export async function convertPdfToImages(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: PdfToImageOptions
): Promise<{ pageNumber: number; blob: Blob; filename: string }[]> {
  const doc = await loadPdfDoc(pdfBytes);
  const totalPages = doc.numPages;
  const targetPages = options.pages || Array.from({ length: totalPages }, (_, i) => i + 1);
  const results: { pageNumber: number; blob: Blob; filename: string }[] = [];

  const ext = options.format === "image/jpeg" ? "jpg" : options.format === "image/webp" ? "webp" : "png";

  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];
    const { blob } = await renderDocPageToImageBlob(
      doc,
      pageNum,
      options.dpi,
      options.format,
      options.quality ?? 0.92
    );

    results.push({
      pageNumber: pageNum,
      blob,
      filename: `page_${pageNum}.${ext}`,
    });

    options.onProgress?.(i + 1, targetPages.length);
  }

  return results;
}

export async function createZipFromImages(
  images: { filename: string; blob: Blob }[]
): Promise<Blob> {
  const zip = new JSZip();
  for (const img of images) {
    zip.file(img.filename, img.blob);
  }
  return await zip.generateAsync({ type: "blob" });
}

export async function convertImagesToPdf(
  images: { data: ArrayBuffer | Uint8Array; mimeType: string }[],
  options: ImageToPdfOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 = 595.28 x 841.89 points, Letter = 612 x 792 points
  const PAGE_SIZES: Record<string, [number, number]> = {
    "a4-portrait": [595.28, 841.89],
    "a4-landscape": [841.89, 595.28],
    letter: [612, 792],
  };

  for (let i = 0; i < images.length; i++) {
    const imgData = images[i];
    const bytes = new Uint8Array(imgData.data);
    let embeddedImg;

    if (imgData.mimeType.includes("png")) {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else {
      // JPEG or converted formats
      embeddedImg = await pdfDoc.embedJpg(bytes);
    }

    const { width: imgW, height: imgH } = embeddedImg;

    if (options.pageSize === "fit") {
      const page = pdfDoc.addPage([imgW + options.margin * 2, imgH + options.margin * 2]);
      page.drawImage(embeddedImg, {
        x: options.margin,
        y: options.margin,
        width: imgW,
        height: imgH,
      });
    } else {
      const [pageW, pageH] = PAGE_SIZES[options.pageSize] || PAGE_SIZES["a4-portrait"];
      const availW = pageW - options.margin * 2;
      const availH = pageH - options.margin * 2;

      // Maintain aspect ratio
      const scale = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const posX = options.margin + (availW - drawW) / 2;
      const posY = options.margin + (availH - drawH) / 2;

      const page = pdfDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImg, {
        x: posX,
        y: posY,
        width: drawW,
        height: drawH,
      });
    }

    options.onProgress?.(i + 1, images.length);
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
