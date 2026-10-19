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

  const blocks: ExistingPdfTextBlock[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const it = rawItems[i];
    const x = Math.round(it.transform[4]);
    const y = Math.round(it.transform[5]);
    const fontSize = Math.max(
      8,
      Math.round(Math.sqrt(it.transform[0] * it.transform[0] + it.transform[1] * it.transform[1]))
    );
    const w = Math.max(12, Math.round(it.width));
    const h = Math.max(fontSize, Math.round(it.height || fontSize));

    // Merge with previous block if on the exact same baseline
    const last = blocks[blocks.length - 1];
    if (
      last &&
      Math.abs(last.y - y) <= 3 &&
      Math.abs(last.fontSize - fontSize) <= 3 &&
      x >= last.x &&
      x <= last.x + last.width + fontSize * 1.5
    ) {
      const spacing = x - (last.x + last.width) > fontSize * 0.25 ? " " : "";
      last.text += spacing + it.str;
      last.originalText = last.text;
      last.width = x + w - last.x;
      last.height = Math.max(last.height, h);
    } else {
      blocks.push({
        id: `pdf-text-${pageNumber}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        pageNumber,
        originalText: it.str,
        text: it.str,
        x,
        y,
        width: w,
        height: h,
        fontSize,
        color: "#111827",
        fontFamily: fontSize >= 16 ? "HelveticaBold" : "Helvetica",
        isBold: fontSize >= 16,
        isModified: false,
      });
    }
  }

  return blocks;
}
