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

    const fontSize = Math.max(
      7,
      Math.round(Math.sqrt(it.transform[0] * it.transform[0] + it.transform[1] * it.transform[1]))
    );
    const w = Math.max(8, Math.round(it.width));
    const h = Math.max(fontSize, Math.round(it.height || fontSize));

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
      last.width = item.screenLeft + item.w - last.screenX;
      last.height = Math.max(last.height, item.h);
    } else {
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
        color: "#111827",
        backgroundColor: "#ffffff",
        fontFamily: item.fontSize >= 16 ? "HelveticaBold" : "Helvetica",
        isBold: item.fontSize >= 16,
        isModified: false,
      });
    }
  }

  return blocks;
}
