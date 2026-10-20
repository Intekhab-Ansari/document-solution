import { loadPdfDoc } from "./pdf-render";

export interface ExistingPdfTextBlock {
  id: string;
  pageNumber: number;
  originalText: string;
  text: string;
  x: number;       // PDF points from left (PDF user space for pdf-lib)
  y: number;       // PDF points from bottom (PDF user space baseline for pdf-lib)
  screenX?: number; // Viewport screen points from left (0 to viewport.width)
  screenY?: number; // Viewport screen points from top of text bounding box
  baselineY?: number; // Viewport screen points baseline from top
  width: number;   // in PDF points
  height: number;  // in PDF points
  fontSize: number;
  color: string;   // hex string e.g. "#111827" or custom
  fontFamily: "Helvetica" | "HelveticaBold" | "TimesRoman" | "Courier";
  backgroundColor?: string; // sampled document background color e.g. "#fbfbfb" or "#ffffff"
  isBold?: boolean;
  isModified: boolean;
}

/**
 * Extracts and groups all existing printed text blocks on a PDF page with coordinates.
 * Computes exact viewport screen coordinates (screenX, screenY, baselineY) using PDF.js
 * viewport transformation to prevent vertical or horizontal displacement.
 */
export async function extractAllExistingTextBlocks(
  pdfBytes: Uint8Array | ArrayBuffer,
  pageNumber: number
): Promise<ExistingPdfTextBlock[]> {
  const doc = await loadPdfDoc(pdfBytes);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent();

  const rawItems = (content.items as any[]).filter(
    (it) => "str" in it && it.str && it.str.trim().length > 0
  );

  // Map items with normalized numeric coordinates and exact viewport screen coordinates
  const mapped = rawItems.map((it, idx) => {
    const pdfX = Math.round(it.transform[4]);
    const pdfY = Math.round(it.transform[5]);

    // Exact viewport screen points matching rendered canvas 1:1
    const [screenLeft, baselineScreenY] = viewport.convertToViewportPoint(
      it.transform[4],
      it.transform[5]
    );

    // Exact font size to 1 decimal place (e.g. 6.3 pt for Aadhaar document lines)
    const rawFontSize = Math.hypot(it.transform[0], it.transform[1]);
    const fontSize = Math.round(rawFontSize * 10) / 10;
    const w = Math.max(6, Math.round(it.width * 10) / 10);
    const h = Math.max(fontSize, Math.round((it.height || fontSize) * 10) / 10);

    // Detect serif vs sans-serif and boldness from font styles dictionary
    const styleObj = content.styles ? content.styles[it.fontName] : undefined;
    const isSerif = styleObj?.fontFamily === "serif";
    const fontNameLower = (it.fontName || "").toLowerCase();
    const isBoldFont = fontNameLower.includes("bold") || (styleObj as any)?.weight > 500;

    // Top of the text bounding box calculated from baseline
    const screenTop = Math.round(baselineScreenY - fontSize * 0.82);

    return {
      it,
      pdfX,
      pdfY,
      screenLeft: Math.round(screenLeft),
      screenTop,
      baselineScreenY: Math.round(baselineScreenY),
      fontSize,
      w,
      h,
      isSerif,
      isBoldFont,
      idx,
    };
  });

  // Sort items into natural reading order:
  // Top-to-bottom (smaller baselineScreenY first), and within the same baseline line, left-to-right (screenLeft ascending)
  mapped.sort((a, b) => {
    if (Math.abs(a.baselineScreenY - b.baselineScreenY) <= 3.5) {
      return a.screenLeft - b.screenLeft;
    }
    return a.baselineScreenY - b.baselineScreenY;
  });

  const blocks: ExistingPdfTextBlock[] = [];

  for (let i = 0; i < mapped.length; i++) {
    const item = mapped[i];
    const last = blocks[blocks.length - 1];

    // Merge with previous block if on the exact same baseline line
    if (
      last &&
      last.baselineY !== undefined &&
      last.screenX !== undefined &&
      Math.abs(last.baselineY - item.baselineScreenY) <= 3.5 &&
      Math.abs(last.fontSize - item.fontSize) <= 3.5 &&
      item.screenLeft >= last.screenX &&
      item.screenLeft <= last.screenX + last.width + item.fontSize * 1.8
    ) {
      const spacing = item.screenLeft - (last.screenX + last.width) > item.fontSize * 0.2 ? " " : "";
      last.text += spacing + item.it.str;
      last.originalText = last.text;
      last.width = Math.round((item.screenLeft + item.w - last.screenX) * 10) / 10;
      last.height = Math.max(last.height, item.h);
      if (item.isSerif) last.fontFamily = "TimesRoman";
      if (item.isBoldFont) last.isBold = true;
    } else {
      const resolvedFontFamily = item.isSerif
        ? "TimesRoman"
        : item.isBoldFont
        ? "HelveticaBold"
        : "Helvetica";

      blocks.push({
        id: `pdf-text-${pageNumber}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        pageNumber,
        originalText: item.it.str,
        text: item.it.str,
        x: item.pdfX,
        y: item.pdfY,
        screenX: item.screenLeft,
        screenY: item.screenTop,
        baselineY: item.baselineScreenY,
        width: item.w,
        height: item.h,
        fontSize: item.fontSize,
        color: "#000000", // Exact deep vector black matching original print
        backgroundColor: "#ffffff",
        fontFamily: resolvedFontFamily,
        isBold: item.isBoldFont,
        isModified: false,
      });
    }
  }

  return blocks;
}
