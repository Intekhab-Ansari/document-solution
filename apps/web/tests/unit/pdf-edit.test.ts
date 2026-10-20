import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { editPdfDocument, hexToRgb } from "../../src/lib/pdf/pdf-edit";
import { extractAllExistingTextBlocks } from "../../src/lib/pdf/pdf-text-extract";

describe("PDF Editing Engine (Client-Side Vector)", () => {
  it("converts hex colors to RGB floats correctly", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    const red = hexToRgb("#ff0000");
    expect(red.r).toBeCloseTo(1);
    expect(red.g).toBeCloseTo(0);
    expect(red.b).toBeCloseTo(0);
  });

  it("adds text with custom color, whiteout box, and drawing to a PDF", async () => {
    // Create a 1-page blank PDF
    const testDoc = await PDFDocument.create();
    testDoc.addPage([600, 800]);
    const originalBytes = await testDoc.save();

    const editedBytes = await editPdfDocument(originalBytes, {
      texts: [
        {
          id: "t1",
          pageNumber: 1,
          text: "Invoice Revised Amount: $5,400.00",
          x: 100,
          y: 650,
          fontSize: 18,
          fontFamily: "HelveticaBold",
          color: "#dc2626", // Red text
          hasWhiteoutBackground: true,
          isBold: true,
        },
      ],
      rectangles: [
        {
          id: "r1",
          pageNumber: 1,
          x: 80,
          y: 640,
          width: 300,
          height: 30,
          fillColor: "#ffffff", // Solid whiteout
          opacity: 1.0,
          borderColor: "#9ca3af",
          borderWidth: 1,
        },
      ],
      drawings: [
        {
          id: "d1",
          pageNumber: 1,
          points: [
            { x: 100, y: 500 },
            { x: 250, y: 500 },
          ],
          color: "#10b981", // Emerald line
          lineWidth: 3,
        },
      ],
    });

    expect(editedBytes).toBeInstanceOf(Uint8Array);
    expect(editedBytes.byteLength).toBeGreaterThan(originalBytes.byteLength);

    // Verify it loads back cleanly with pdf-lib
    const loaded = await PDFDocument.load(editedBytes);
    expect(loaded.getPageCount()).toBe(1);
  });

  it("modifies existing text blocks by whiting out original text and baking revised text and color", async () => {
    // 1. Create a document with an original text line
    const testDoc = await PDFDocument.create();
    const page = testDoc.addPage([600, 800]);
    page.drawText("ACME ENTERPRISE CORP.", { x: 50, y: 750, size: 20 });
    const originalBytes = await testDoc.save();

    // 2. Edit the existing text block: rename to "EDITANYTHING CORP." and color Emerald
    const editedBytes = await editPdfDocument(originalBytes, {
      existingBlocks: [
        {
          id: "block-1",
          pageNumber: 1,
          originalText: "ACME ENTERPRISE CORP.",
          text: "EDITANYTHING CORP.",
          x: 50,
          y: 750,
          width: 250,
          height: 24,
          fontSize: 20,
          fontFamily: "HelveticaBold",
          color: "#10b981", // Emerald
          isBold: true,
          isModified: true,
        },
      ],
    });

    expect(editedBytes).toBeInstanceOf(Uint8Array);
    const loaded = await PDFDocument.load(editedBytes);
    expect(loaded.getPageCount()).toBe(1);
  });

  it("safely handles Unicode and Devanagari text without WinAnsi errors", async () => {
    const testDoc = await PDFDocument.create();
    testDoc.addPage([600, 800]);
    const originalBytes = await testDoc.save();

    // Editing with Hindi/Marathi Aadhaar text (Devanagari characters)
    const editedBytes = await editPdfDocument(originalBytes, {
      existingBlocks: [
        {
          id: "block-devanagari",
          pageNumber: 1,
          originalText: "जन्म तारीख / DOB: 01/01/1970",
          text: "जन्म तारीख / DOB: 12/01/1975",
          x: 50,
          y: 700,
          width: 250,
          height: 20,
          fontSize: 14,
          fontFamily: "Helvetica",
          color: "#111827",
          isModified: true,
        },
      ],
      texts: [
        {
          id: "t-unicode",
          pageNumber: 1,
          text: "नाव: शकील मो.अंसारी",
          x: 50,
          y: 650,
          fontSize: 14,
          color: "#111827",
        },
      ],
    });

    expect(editedBytes).toBeInstanceOf(Uint8Array);
    const loaded = await PDFDocument.load(editedBytes);
    expect(loaded.getPageCount()).toBe(1);
  });

  it("extracts text blocks with exact viewport screen coordinates aligned with text baseline", async () => {
    const testDoc = await PDFDocument.create();
    const page = testDoc.addPage([600, 800]);
    page.drawText("Shaukat Idris Ansari", { x: 100, y: 700, size: 14 });
    const pdfBytes = await testDoc.save();

    const blocks = await extractAllExistingTextBlocks(pdfBytes, 1);
    expect(blocks.length).toBeGreaterThan(0);
    const ansariBlock = blocks.find((b) => b.text.includes("Shaukat"));
    expect(ansariBlock).toBeDefined();
    expect(ansariBlock!.x).toBe(100);
    expect(ansariBlock!.y).toBe(700);
    expect(ansariBlock!.screenX).toBe(100);
    // Baseline from top: 800 - 700 = 100
    expect(ansariBlock!.baselineY).toBe(100);
    // screenY is top of bounding box: baselineY - 0.82 * fontSize
    expect(ansariBlock!.screenY!).toBeLessThan(ansariBlock!.baselineY!);
    expect(ansariBlock!.screenY!).toBeCloseTo(89, -1);
  });
});

