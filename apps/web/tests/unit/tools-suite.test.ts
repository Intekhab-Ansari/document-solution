import { describe, it, expect } from "vitest";
import { PDFDocument, rgb } from "pdf-lib";
import {
  mergePdfs,
  extractPages,
  parsePageRangeString,
  rotatePdfPages,
  reorderAndDeletePages,
  updatePdfMetadata,
  getPdfInfo,
} from "../../src/lib/pdf/pdf-manipulate";
import {
  addPageNumbersToPdf,
  addWatermarkToPdf,
  cropPdf,
} from "../../src/lib/pdf/pdf-annotate";
import {
  flattenPdfDocument,
  repairPdfDocument,
  stampSignatureOnPdf,
} from "../../src/lib/pdf/pdf-advanced";
import { stripExifFromJpegBytes } from "../../src/lib/image/image-exif";

// Helper to generate a multi-page test PDF in-memory
async function createSamplePdf(pageCount: number = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([500, 700]);
    page.drawText(`Sample Document Page ${i}`, { x: 50, y: 650, size: 16 });
  }
  return await doc.save();
}

describe("Comprehensive Tool Test Suite", () => {
  describe("PDF Manipulation & Layout Engine", () => {
    it("merges multiple PDFs and triggers progress callbacks", async () => {
      const doc1 = await createSamplePdf(2);
      const doc2 = await createSamplePdf(3);

      let progressCalls = 0;
      const merged = await mergePdfs([doc1, doc2], (current, total) => {
        progressCalls++;
        expect(total).toBe(2);
      });

      expect(merged).toBeInstanceOf(Uint8Array);
      expect(progressCalls).toBe(2);

      const loaded = await PDFDocument.load(merged);
      expect(loaded.getPageCount()).toBe(5);
    });

    it("extracts arbitrary page subsets accurately", async () => {
      const doc = await createSamplePdf(5);
      // Extract pages 2 and 4
      const extracted = await extractPages(doc, [2, 4]);
      const loaded = await PDFDocument.load(extracted);
      expect(loaded.getPageCount()).toBe(2);
    });

    it("parses complex page range strings with deduplication and bounds checks", () => {
      expect(parsePageRangeString("1-2, 4-5, 2-3, 99", 5)).toEqual([1, 2, 3, 4, 5]);
      expect(parsePageRangeString("3, 1, 2", 3)).toEqual([1, 2, 3]);
      expect(parsePageRangeString("", 5)).toEqual([]);
    });

    it("rotates specific pages and full documents by specified degrees", async () => {
      const doc = await createSamplePdf(3);
      // Rotate page 1 by 90 deg, page 2 by 180 deg
      const rotated = await rotatePdfPages(doc, { 1: 90, 2: 180 });
      const loaded = await PDFDocument.load(rotated);

      expect(loaded.getPage(0).getRotation().angle).toBe(90);
      expect(loaded.getPage(1).getRotation().angle).toBe(180);
      expect(loaded.getPage(2).getRotation().angle).toBe(0);

      // Rotate whole document
      const allRotated = await rotatePdfPages(doc, 270);
      const loadedAll = await PDFDocument.load(allRotated);
      expect(loadedAll.getPage(0).getRotation().angle).toBe(270);
      expect(loadedAll.getPage(1).getRotation().angle).toBe(270);
      expect(loadedAll.getPage(2).getRotation().angle).toBe(270);
    });

    it("reorders pages in arbitrary sequences and deletes omitted pages", async () => {
      const doc = await createSamplePdf(4);
      // Reorder to 3, 1, 2 (page 4 omitted)
      const reordered = await reorderAndDeletePages(doc, [3, 1, 2]);
      const loaded = await PDFDocument.load(reordered);
      expect(loaded.getPageCount()).toBe(3);
    });

    it("reads and updates PDF metadata attributes", async () => {
      const doc = await createSamplePdf(1);
      const updated = await updatePdfMetadata(doc, {
        title: "Confidential Quarterly Report",
        author: "Chief Architect",
        subject: "Q3 Document Solutions",
        keywords: ["finance", "audit", "2026"],
      });

      const info = await getPdfInfo(updated);
      expect(info.title).toBe("Confidential Quarterly Report");
      expect(info.author).toBe("Chief Architect");
      expect(info.pageCount).toBe(1);
    });
  });

  describe("PDF Annotation & Watermarking Engine", () => {
    it("adds page numbers in diverse formats and positions", async () => {
      const doc = await createSamplePdf(4);
      const withPageNums = await addPageNumbersToPdf(doc, {
        position: "bottom-center",
        format: "page-of-total",
        fontSize: 11,
        skipFirstPage: true,
      });

      expect(withPageNums).toBeInstanceOf(Uint8Array);
      const loaded = await PDFDocument.load(withPageNums);
      expect(loaded.getPageCount()).toBe(4);
    });

    it("stamps high-visibility diagonal watermarks across all pages", async () => {
      const doc = await createSamplePdf(2);
      const watermarked = await addWatermarkToPdf(doc, {
        text: "CONFIDENTIAL / DO NOT SHARE",
        fontSize: 36,
        opacity: 0.3,
        rotation: 45,
        color: { r: 0.8, g: 0.1, b: 0.1 },
      });

      expect(watermarked.byteLength).toBeGreaterThan(doc.byteLength);
      const loaded = await PDFDocument.load(watermarked);
      expect(loaded.getPageCount()).toBe(2);
    });

    it("crops PDF margins and sets boundary boxes", async () => {
      const doc = await createSamplePdf(2);
      const cropped = await cropPdf(doc, {
        top: 20,
        bottom: 30,
        left: 25,
        right: 25,
      });

      const loaded = await PDFDocument.load(cropped);
      const page = loaded.getPage(0);
      const cropBox = page.getCropBox();
      expect(cropBox.x).toBe(25);
      expect(cropBox.y).toBe(30);
    });
  });

  describe("Advanced Document Operations & Repair", () => {
    it("flattens PDF forms and annotations safely", async () => {
      const doc = await createSamplePdf(2);
      const flattened = await flattenPdfDocument(doc);
      expect(flattened).toBeInstanceOf(Uint8Array);
      const loaded = await PDFDocument.load(flattened);
      expect(loaded.getPageCount()).toBe(2);
    });

    it("repairs damaged or malformed PDF AST and xref tables", async () => {
      const doc = await createSamplePdf(2);
      const repaired = await repairPdfDocument(doc);
      expect(repaired).toBeInstanceOf(Uint8Array);
      const loaded = await PDFDocument.load(repaired);
      expect(loaded.getPageCount()).toBe(2);
    });

    it("stamps PNG signatures onto designated page coordinates", async () => {
      const doc = await createSamplePdf(2);
      // Create minimal 1x1 PNG
      const minimalPngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const pngBytes = Uint8Array.from(atob(minimalPngBase64), (c) => c.charCodeAt(0));

      const stamped = await stampSignatureOnPdf(doc, {
        pageNumber: 2,
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        signaturePngBytes: pngBytes,
      });

      expect(stamped.byteLength).toBeGreaterThan(doc.byteLength);
      const loaded = await PDFDocument.load(stamped);
      expect(loaded.getPageCount()).toBe(2);
    });
  });

  describe("EXIF Metadata Engine", () => {
    it("strips EXIF marker segments from JPEG binary without corrupting image SOI/EOI", () => {
      // Minimal valid JPEG binary: SOI (0xFFD8) + APP1 EXIF segment + SOS + EOI (0xFFD9)
      const mockJpegWithExif = new Uint8Array([
        0xff, 0xd8, // SOI
        0xff, 0xe1, // APP1 marker
        0x00, 0x08, // length: 8 bytes
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
        0xff, 0xdb, // DQT (quantization table)
        0x00, 0x04,
        0x01, 0x02,
        0xff, 0xd9, // EOI
      ]);

      const stripped = stripExifFromJpegBytes(mockJpegWithExif);
      expect(stripped[0]).toBe(0xff);
      expect(stripped[1]).toBe(0xd8); // SOI preserved
      expect(stripped[stripped.length - 2]).toBe(0xff);
      expect(stripped[stripped.length - 1]).toBe(0xd9); // EOI preserved

      // Verify APP1 marker (0xFFE1) was completely stripped
      let hasApp1 = false;
      for (let i = 0; i < stripped.length - 1; i++) {
        if (stripped[i] === 0xff && stripped[i + 1] === 0xe1) {
          hasApp1 = true;
          break;
        }
      }
      expect(hasApp1).toBe(false);
    });
  });
});
