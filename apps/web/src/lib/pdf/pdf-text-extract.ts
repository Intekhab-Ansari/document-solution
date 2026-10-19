import { loadPdfDoc } from "./pdf-render";

export interface ExistingPdfTextBlock {
  id: string;
  pageNumber: number;
  originalText: string;
  text: string;
  x: number;       // PDF points from left
  y: number;       // PDF points from bottom
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
 * Extracts and groups all existing printed text blocks on a PDF page with coordinates
 */
export async function extractAllExistingTextBlocks(
  pdfBytes: Uint8Array | ArrayBuffer,
  pageNumber: number
): Promise<ExistingPdfTextBlock[]> {
  const doc = await loadPdfDoc(pdfBytes);
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();

  const rawItems = (content.items as any[]).filter(
    (it) => "str" in it && it.str && it.str.trim().length > 0
  );

  // Map items with normalized numeric coordinates
  const mapped = rawItems.map((it, idx) => {
    const x = Math.round(it.transform[4]);
    const y = Math.round(it.transform[5]);
    const fontSize = Math.max(
      7,
      Math.round(Math.sqrt(it.transform[0] * it.transform[0] + it.transform[1] * it.transform[1]))
    );
    const w = Math.max(8, Math.round(it.width));
    const h = Math.max(fontSize, Math.round(it.height || fontSize));
    return { it, x, y, fontSize, w, h, idx };
  });

  // Sort items into natural reading order:
  // Top-to-bottom (higher y first), and within the same baseline line, left-to-right (x ascending)
  mapped.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 3.5) {
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  const blocks: ExistingPdfTextBlock[] = [];

  for (let i = 0; i < mapped.length; i++) {
    const item = mapped[i];
    const last = blocks[blocks.length - 1];

    // Merge with previous block if on the exact same baseline line
    if (
      last &&
      Math.abs(last.y - item.y) <= 3.5 &&
      Math.abs(last.fontSize - item.fontSize) <= 3.5 &&
      item.x >= last.x &&
      item.x <= last.x + last.width + item.fontSize * 1.8
    ) {
      const spacing = item.x - (last.x + last.width) > item.fontSize * 0.2 ? " " : "";
      last.text += spacing + item.it.str;
      last.originalText = last.text;
      last.width = item.x + item.w - last.x;
      last.height = Math.max(last.height, item.h);
    } else {
      blocks.push({
        id: `pdf-text-${pageNumber}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        pageNumber,
        originalText: item.it.str,
        text: item.it.str,
        x: item.x,
        y: item.y,
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
