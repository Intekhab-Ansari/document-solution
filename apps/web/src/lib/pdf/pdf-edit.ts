import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface TextAnnotation {
  id: string;
  pageNumber: number; // 1-indexed
  text: string;
  x: number; // in PDF points (bottom-left origin)
  y: number; // in PDF points (bottom-left origin)
  fontSize: number;
  fontFamily?: "Helvetica" | "HelveticaBold" | "TimesRoman" | "Courier";
  color: string; // hex string, e.g. "#000000", "#ef4444"
  hasWhiteoutBackground?: boolean;
  isBold?: boolean;
}

export interface RectangleAnnotation {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string; // e.g. "#ffffff" for whiteout, or "#fef08a" for highlight
  opacity: number; // 1.0 for solid whiteout, 0.35 for highlight
  borderColor?: string;
  borderWidth?: number;
}

export interface DrawingAnnotation {
  id: string;
  pageNumber: number;
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

import { ExistingPdfTextBlock } from "./pdf-text-extract";

export interface EditPdfOptions {
  texts?: TextAnnotation[];
  rectangles?: RectangleAnnotation[];
  drawings?: DrawingAnnotation[];
  existingBlocks?: ExistingPdfTextBlock[];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.min(1, Math.max(0, ((num >> 16) & 255) / 255)),
    g: Math.min(1, Math.max(0, ((num >> 8) & 255) / 255)),
    b: Math.min(1, Math.max(0, (num & 255) / 255)),
  };
}

/**
 * Applies text, whiteout boxes, highlights, and drawings onto PDF pages locally in-browser
 */
export async function editPdfDocument(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: EditPdfOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  // Cache embedded standard fonts
  const fonts: Record<string, any> = {
    Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
    HelveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    TimesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    Courier: await pdfDoc.embedFont(StandardFonts.Courier),
  };

  const totalPages = pdfDoc.getPageCount();

  // 0. Process Modified Existing PDF Text Blocks (Erase original text & bake revised text/color)
  if (options.existingBlocks && options.existingBlocks.length > 0) {
    for (const block of options.existingBlocks) {
      if (block.pageNumber < 1 || block.pageNumber > totalPages) continue;
      // Only process blocks that were actually modified or recolored
      if (!block.isModified && block.text === block.originalText) continue;

      const page = pdfDoc.getPage(block.pageNumber - 1);
      const fontKey = block.isBold ? "HelveticaBold" : block.fontFamily || "Helvetica";
      const font = fonts[fontKey] || fonts.Helvetica;
      const textRgb = hexToRgb(block.color || "#000000");
      const fontSize = block.fontSize || 12;

      // Calculate width of original and new text to ensure complete whiteout coverage
      let originalWidth = block.width;
      try {
        originalWidth = Math.max(originalWidth, font.widthOfTextAtSize(block.originalText, fontSize));
      } catch {
        // Fallback
      }

      let newWidth = 0;
      try {
        newWidth = font.widthOfTextAtSize(block.text, fontSize);
      } catch {
        // Fallback
      }

      const coverWidth = Math.max(originalWidth, newWidth) + 8;
      const coverHeight = Math.max(block.height, fontSize * 1.35) + 4;
      const coverY = block.y - Math.round(fontSize * 0.28);

      // Whiteout original text from PDF stream
      page.drawRectangle({
        x: Math.max(0, block.x - 3),
        y: Math.max(0, coverY),
        width: coverWidth,
        height: coverHeight,
        color: rgb(1, 1, 1),
        opacity: 1.0,
      });

      // Draw replacement text if not empty
      if (block.text && block.text.trim().length > 0) {
        const lines = block.text.split("\n");
        const lineHeight = fontSize * 1.25;

        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line.length) continue;
          page.drawText(line, {
            x: block.x,
            y: block.y - li * lineHeight,
            size: fontSize,
            font,
            color: rgb(textRgb.r, textRgb.g, textRgb.b),
          });
        }
      }
    }
  }

  // 1. Draw Rectangles (Whiteout & Highlight boxes) first so they sit behind text
  if (options.rectangles && options.rectangles.length > 0) {
    for (const rect of options.rectangles) {
      if (rect.pageNumber < 1 || rect.pageNumber > totalPages) continue;
      const page = pdfDoc.getPage(rect.pageNumber - 1);
      const fillRgb = hexToRgb(rect.fillColor);
      const borderRgb = rect.borderColor ? hexToRgb(rect.borderColor) : undefined;

      page.drawRectangle({
        x: rect.x,
        y: rect.y,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        color: rgb(fillRgb.r, fillRgb.g, fillRgb.b),
        opacity: rect.opacity ?? 1.0,
        borderColor: borderRgb ? rgb(borderRgb.r, borderRgb.g, borderRgb.b) : undefined,
        borderWidth: rect.borderWidth ?? 0,
      });
    }
  }

  // 2. Draw Drawings (Freehand pen strokes)
  if (options.drawings && options.drawings.length > 0) {
    for (const draw of options.drawings) {
      if (draw.pageNumber < 1 || draw.pageNumber > totalPages || draw.points.length < 2) continue;
      const page = pdfDoc.getPage(draw.pageNumber - 1);
      const strokeRgb = hexToRgb(draw.color);
      const color = rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b);
      const thickness = draw.lineWidth || 2;

      for (let i = 0; i < draw.points.length - 1; i++) {
        page.drawLine({
          start: { x: draw.points[i].x, y: draw.points[i].y },
          end: { x: draw.points[i + 1].x, y: draw.points[i + 1].y },
          thickness,
          color,
        });
      }
    }
  }

  // 3. Draw Texts (with optional whiteout backing)
  if (options.texts && options.texts.length > 0) {
    for (const t of options.texts) {
      if (t.pageNumber < 1 || t.pageNumber > totalPages || !t.text.trim()) continue;
      const page = pdfDoc.getPage(t.pageNumber - 1);
      const fontKey = t.isBold ? "HelveticaBold" : t.fontFamily || "Helvetica";
      const font = fonts[fontKey] || fonts.Helvetica;
      const textRgb = hexToRgb(t.color);
      const fontSize = t.fontSize || 14;

      const lines = t.text.split("\n");
      const lineHeight = fontSize * 1.25;

      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        if (!line.length) continue;
        const lineY = t.y - li * lineHeight;

        if (t.hasWhiteoutBackground) {
          const textWidth = font.widthOfTextAtSize(line, fontSize);
          page.drawRectangle({
            x: t.x - 3,
            y: lineY - 3,
            width: textWidth + 6,
            height: fontSize + 6,
            color: rgb(1, 1, 1),
            opacity: 1,
          });
        }

        page.drawText(line, {
          x: t.x,
          y: lineY,
          size: fontSize,
          font,
          color: rgb(textRgb.r, textRgb.g, textRgb.b),
        });
      }
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
