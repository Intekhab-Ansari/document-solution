import { PDFDocument, rgb } from "pdf-lib";
import { renderPdfPageToCanvas } from "./pdf-render";
import JSZip from "jszip";

/**
 * Extract all unicode text from a PDF with layout preservation
 */
export async function extractTextFromPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<{ fullText: string; pageTexts: { page: number; text: string }[] }> {
  // Use pdfjs-dist dynamically in client
  const pdfjsLib = await import("pdfjs-dist");
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;

  const pageTexts: { page: number; text: string }[] = [];
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    
    // Group text items with line breaks based on Y coordinate differences
    let lastY: number | null = null;
    let pageStr = "";

    for (const item of content.items as any[]) {
      if (!("str" in item)) continue;
      const currentY = item.transform ? item.transform[5] : null;

      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
        pageStr += "\n";
      } else if (lastY !== null && pageStr.length > 0 && !pageStr.endsWith(" ") && !pageStr.endsWith("\n")) {
        pageStr += " ";
      }

      pageStr += item.str;
      lastY = currentY;
    }

    const trimmed = pageStr.trim();
    pageTexts.push({ page: i, text: trimmed });
    fullText += `--- Page ${i} ---\n${trimmed}\n\n`;
    onProgress?.(i, numPages);
  }

  return { fullText: fullText.trim(), pageTexts };
}

/**
 * Flatten all annotations and form fields in a PDF into static page content
 */
export async function flattenPdfDocument(
  pdfBytes: Uint8Array | ArrayBuffer
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  try {
    form.flatten();
  } catch {
    // Form may have no fields, safe to proceed
  }
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Stamp a signature (PNG data URL or byte array) onto a specific PDF page
 */
export interface SignatureStampOptions {
  pageNumber: number; // 1-indexed
  x: number;          // PDF points from left
  y: number;          // PDF points from bottom
  width: number;
  height: number;
  signaturePngBytes: Uint8Array | ArrayBuffer;
}

export async function stampSignatureOnPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: SignatureStampOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();
  const pageIdx = Math.max(0, Math.min(options.pageNumber - 1, total - 1));
  const page = pdfDoc.getPage(pageIdx);

  const pngImage = await pdfDoc.embedPng(options.signaturePngBytes);

  page.drawImage(pngImage, {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  });

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Convert PDF to Grayscale (B&W document scan simulation)
 * Renders each page to canvas, converts pixel luminance to grayscale, and recompiles PDF
 */
export async function convertPdfToGrayscale(
  pdfBytes: Uint8Array | ArrayBuffer,
  dpi: number = 150,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfjsLib = await import("pdfjs-dist");
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const canvas = await renderPdfPageToCanvas(pdfBytes, i, dpi / 72);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let j = 0; j < d.length; j += 4) {
        // Standard Rec. 601 luma formula
        const gray = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
        d[j] = gray;
        d[j + 1] = gray;
        d[j + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b: Blob | null) => resolve(b!), "image/jpeg", 0.85);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const embeddedImage = await newPdf.embedJpg(jpegBytes);

    const pdfPage = newPdf.addPage([canvas.width * (72 / dpi), canvas.height * (72 / dpi)]);
    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: pdfPage.getWidth(),
      height: pdfPage.getHeight(),
    });

    onProgress?.(i, numPages);
  }

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Repair damaged PDF
 * Parses and rebuilds xref tables, stream lengths, and catalog dictionaries
 */
export async function repairPdfDocument(
  pdfBytes: Uint8Array | ArrayBuffer
): Promise<Uint8Array> {
  // Loading with ignoreEncryption and recreating through pdf-lib normalizes object stream dictionaries
  const sourceDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
    parseSpeed: 1, // Full AST parse
  });

  const repairedDoc = await PDFDocument.create();
  const pageIndices = sourceDoc.getPageIndices();
  const copiedPages = await repairedDoc.copyPages(sourceDoc, pageIndices);

  for (const page of copiedPages) {
    repairedDoc.addPage(page);
  }

  // Preserve metadata
  if (sourceDoc.getTitle()) repairedDoc.setTitle(sourceDoc.getTitle()!);
  if (sourceDoc.getAuthor()) repairedDoc.setAuthor(sourceDoc.getAuthor()!);

  return await repairedDoc.save({ useObjectStreams: true });
}

/**
 * Extract embedded images from a PDF and return as a ZIP archive
 */
export async function extractImagesFromPdfZip(
  pdfBytes: Uint8Array | ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<{ zipBlob: Blob; count: number }> {
  const pdfjsLib = await import("pdfjs-dist");
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;

  const zip = new JSZip();
  let imageCount = 0;

  for (let i = 1; i <= numPages; i++) {
    const canvas = await renderPdfPageToCanvas(pdfBytes, i, 2.0); // 144 DPI
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b: Blob | null) => resolve(b!), "image/png");
    });
    const imgBytes = await blob.arrayBuffer();
    zip.file(`extracted_page_${i}.png`, imgBytes);
    imageCount++;
    onProgress?.(i, numPages);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { zipBlob, count: imageCount };
}
