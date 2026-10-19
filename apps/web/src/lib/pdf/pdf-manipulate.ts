import { PDFDocument, degrees } from "pdf-lib";

export interface PageInfo {
  pageNumber: number; // 1-indexed
  width: number;
  height: number;
  rotation: number;
}

export async function getPdfInfo(pdfBytes: Uint8Array | ArrayBuffer): Promise<{
  pageCount: number;
  pages: PageInfo[];
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
}> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const pages: PageInfo[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      pageNumber: i + 1,
      width: Math.round(width),
      height: Math.round(height),
      rotation: page.getRotation().angle,
    });
  }

  return {
    pageCount,
    pages,
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
  };
}

/**
 * Merge multiple PDF documents into a single document
 */
export async function mergePdfs(
  pdfBuffers: (Uint8Array | ArrayBuffer)[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < pdfBuffers.length; i++) {
    const buffer = pdfBuffers[i];
    const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
    onProgress?.(i + 1, pdfBuffers.length);
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Extract specific pages by 1-based page numbers
 */
export async function extractPages(
  pdfBytes: Uint8Array | ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  // Convert 1-based to 0-based, filter valid bounds
  const indices = pageNumbers
    .map((num) => num - 1)
    .filter((idx) => idx >= 0 && idx < sourcePdf.getPageCount());

  const copiedPages = await newPdf.copyPages(sourcePdf, indices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Parse page range string (e.g. "1-3, 5, 8-10")
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);
  const selectedPages = new Set<number>();

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let p = start; p <= end; p++) {
        selectedPages.add(p);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        selectedPages.add(pageNum);
      }
    }
  }

  return Array.from(selectedPages).sort((a, b) => a - b);
}

/**
 * Rotate specific or all pages (angle in degrees: 90, 180, 270)
 */
export async function rotatePdfPages(
  pdfBytes: Uint8Array | ArrayBuffer,
  rotationMap: { [pageNumber: number]: number } | number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    let angleToAdd = 0;
    if (typeof rotationMap === "number") {
      angleToAdd = rotationMap;
    } else if (rotationMap[pageNum] !== undefined) {
      angleToAdd = rotationMap[pageNum];
    }

    if (angleToAdd !== 0) {
      const page = pdfDoc.getPage(i);
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angleToAdd) % 360));
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Reorder and/or delete pages
 * pageOrder: array of 1-based page numbers in desired sequence (omitted pages are deleted)
 */
export async function reorderAndDeletePages(
  pdfBytes: Uint8Array | ArrayBuffer,
  pageOrder: number[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const indices = pageOrder
    .map((num) => num - 1)
    .filter((idx) => idx >= 0 && idx < sourcePdf.getPageCount());

  const copiedPages = await newPdf.copyPages(sourcePdf, indices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Edit or strip PDF document metadata (Title, Author, Subject, Keywords, Creator, Producer)
 */
export async function updatePdfMetadata(
  pdfBytes: Uint8Array | ArrayBuffer,
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords);
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
  return await pdfDoc.save({ useObjectStreams: true });
}

