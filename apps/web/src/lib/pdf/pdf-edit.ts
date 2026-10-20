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
  isItalic?: boolean;
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

export function isPureWinAnsi(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 255 || (code >= 127 && code <= 159)) return false;
  }
  return true;
}

export function measureTextWidth(
  text: string,
  fontSize: number,
  font?: any,
  isBold?: boolean,
  fontFamily?: string
): number {
  if (font && isPureWinAnsi(text)) {
    try {
      return font.widthOfTextAtSize(text, fontSize);
    } catch {
      // Fallback
    }
  }
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const isSerif = fontFamily === "TimesRoman";
        const fontStack = isSerif
          ? '"Times New Roman", "Liberation Serif", Times, "Noto Sans Devanagari", "Nirmala UI", "Kohinoor Devanagari", serif'
          : '"Noto Sans Devanagari", "Nirmala UI", "Kohinoor Devanagari", "Liberation Sans", "Helvetica Neue", Arial, sans-serif';
        ctx.font = `${isBold ? "bold " : ""}${fontSize}px ${fontStack}`;
        return ctx.measureText(text).width;
      }
    } catch {
      // Fallback
    }
  }
  return text.length * fontSize * 0.65;
}

async function drawUnicodeTextWithCanvas(
  pdfDoc: PDFDocument,
  page: any,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  colorHex: string,
  isBold?: boolean,
  fontFamily?: string,
  isItalic?: boolean
): Promise<void> {
  if (typeof document === "undefined") return;

  // Ultra-high DPI print resolution (576 DPI) for vector-sharp text matching surrounding document lines
  const scale = 8;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isSerif = fontFamily === "TimesRoman";
  const fontStack = isSerif
    ? '"Times New Roman", "Liberation Serif", Times, "Noto Sans Devanagari", "Nirmala UI", "Kohinoor Devanagari", serif'
    : '"Noto Sans Devanagari", "Nirmala UI", "Kohinoor Devanagari", "Liberation Sans", "Helvetica Neue", Arial, sans-serif';

  const fontStyle = `${isBold ? "bold " : ""}${isItalic ? "italic " : ""}${Math.round(fontSize * scale * 10) / 10}px ${fontStack}`;
  ctx.font = fontStyle;

  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  // Standard typographic font bounds (ascent: 0.88 * font size, descent: 0.32 * font size)
  const ascent = Math.ceil(fontSize * scale * 0.88);
  const descent = Math.ceil(fontSize * scale * 0.32);
  const pad = Math.round(1 * scale); // 1 pt subpixel antialiasing margin

  canvas.width = textWidth + pad * 2;
  canvas.height = ascent + descent + pad * 2;

  ctx.font = fontStyle;
  ctx.fillStyle = colorHex || "#000000";
  ctx.textBaseline = "alphabetic";

  const baselineY = pad + ascent;
  ctx.fillText(text, pad, baselineY);

  const dataUrl = canvas.toDataURL("image/png");
  const base64Data = dataUrl.split(",")[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pngImage = await pdfDoc.embedPng(bytes);
  const renderWidth = canvas.width / scale;
  const renderHeight = canvas.height / scale;
  const renderX = x - (pad / scale);
  const renderY = y - (descent / scale) - (pad / scale);

  page.drawImage(pngImage, {
    x: renderX,
    y: renderY,
    width: renderWidth,
    height: renderHeight,
  });
}

function resolveFontKey(family = "Helvetica", bold = false, italic = false): string {
  if (family === "TimesRoman") {
    if (bold && italic) return "TimesRomanBoldItalic";
    if (bold) return "TimesRomanBold";
    if (italic) return "TimesRomanItalic";
    return "TimesRoman";
  }
  if (family === "Courier") {
    if (bold) return "CourierBold";
    return "Courier";
  }
  if (bold && italic) return "HelveticaBoldOblique";
  if (bold) return "HelveticaBold";
  if (italic) return "HelveticaOblique";
  return "Helvetica";
}

async function drawTextSafely(
  pdfDoc: PDFDocument,
  page: any,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  font: any,
  colorRgb: { r: number; g: number; b: number },
  colorHex: string,
  isBold?: boolean,
  fontFamily?: string,
  isItalic?: boolean
): Promise<void> {
  if (isPureWinAnsi(text)) {
    try {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
      });
      return;
    } catch {
      // Fall through to canvas
    }
  }

  await drawUnicodeTextWithCanvas(
    pdfDoc,
    page,
    text,
    x,
    y,
    fontSize,
    colorHex,
    isBold,
    fontFamily,
    isItalic
  );
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
    HelveticaOblique: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    HelveticaBoldOblique: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
    TimesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    TimesRomanBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    TimesRomanItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    TimesRomanBoldItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic),
    Courier: await pdfDoc.embedFont(StandardFonts.Courier),
    CourierBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
  };

  const totalPages = pdfDoc.getPageCount();

  // 0. Process Modified Existing PDF Text Blocks (Erase original text & bake revised text/color)
  if (options.existingBlocks && options.existingBlocks.length > 0) {
    for (const block of options.existingBlocks) {
      if (block.pageNumber < 1 || block.pageNumber > totalPages) continue;
      // Only process blocks that were actually modified or recolored
      if (!block.isModified && block.text === block.originalText) continue;

      const page = pdfDoc.getPage(block.pageNumber - 1);
      const fontKey = resolveFontKey(block.fontFamily, block.isBold, block.isItalic);
      const font = fonts[fontKey] || fonts.Helvetica;
      const textRgb = hexToRgb(block.color || "#000000");
      const fontSize = block.fontSize || 12;

      // Calculate width of original and new text with Unicode support
      const origWidth = block.width || measureTextWidth(block.originalText, fontSize, font, block.isBold, block.fontFamily);
      const newWidth = measureTextWidth(block.text, fontSize, font, block.isBold, block.fontFamily);

      // Whiteout box: covers 2 pt left & right, and covers full descent & ascent cleanly
      const coverWidth = Math.max(origWidth, newWidth) + 4;
      const coverHeight = fontSize * 1.45;
      const coverY = block.y - fontSize * 0.38;
      const coverX = Math.max(0, block.x - 2);

      // Only draw whiteout if background is not set to transparent
      if (block.backgroundColor !== "transparent") {
        const bgRgb = hexToRgb(block.backgroundColor || "#ffffff");
        page.drawRectangle({
          x: coverX,
          y: Math.max(0, coverY),
          width: coverWidth,
          height: coverHeight,
          color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
          opacity: 1.0,
        });
      }

      // Draw replacement text if not empty
      if (block.text && block.text.trim().length > 0) {
        const lines = block.text.split("\n");
        const lineHeight = fontSize * 1.25;

        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line.length) continue;
          await drawTextSafely(
            pdfDoc,
            page,
            line,
            block.x,
            block.y - li * lineHeight,
            fontSize,
            font,
            textRgb,
            block.color || "#000000",
            block.isBold,
            block.fontFamily,
            block.isItalic
          );
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
      const fontKey = resolveFontKey(t.fontFamily, t.isBold, t.isItalic);
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
          const textWidth = measureTextWidth(line, fontSize, font, t.isBold, t.fontFamily);
          page.drawRectangle({
            x: Math.max(0, t.x - 2),
            y: Math.max(0, lineY - 2),
            width: textWidth + 4,
            height: fontSize + 4,
            color: rgb(1, 1, 1),
            opacity: 1,
          });
        }

        await drawTextSafely(
          pdfDoc,
          page,
          line,
          t.x,
          lineY,
          fontSize,
          font,
          textRgb,
          t.color || "#000000",
          t.isBold,
          t.fontFamily,
          t.isItalic
        );
      }
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
