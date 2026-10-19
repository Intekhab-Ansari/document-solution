import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export interface PageNumberOptions {
  position: "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
  format: "page-of-total" | "number-only" | "slash";
  fontSize?: number;
  startFrom?: number;
  skipFirstPage?: boolean;
}

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number; // degrees, e.g. 45
  color?: { r: number; g: number; b: number };
}

export interface CropPdfOptions {
  top: number; // in points
  bottom: number;
  left: number;
  right: number;
}

export async function addPageNumbersToPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const total = pdfDoc.getPageCount();
  const fontSize = options.fontSize || 10;
  const startNum = options.startFrom || 1;

  for (let i = 0; i < total; i++) {
    if (i === 0 && options.skipFirstPage) continue;

    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const currentNum = startNum + i;

    let text = `${currentNum}`;
    if (options.format === "page-of-total") {
      text = `Page ${currentNum} of ${total}`;
    } else if (options.format === "slash") {
      text = `${currentNum} / ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x = 0;
    let y = 0;
    const margin = 28;

    if (options.position.includes("left")) {
      x = margin;
    } else if (options.position.includes("right")) {
      x = width - margin - textWidth;
    } else {
      x = (width - textWidth) / 2;
    }

    if (options.position.includes("top")) {
      y = height - margin;
    } else {
      y = margin;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

export async function addWatermarkToPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const total = pdfDoc.getPageCount();
  const fontSize = options.fontSize || 48;
  const opacity = options.opacity ?? 0.25;
  const angle = options.rotation ?? 45;
  const c = options.color || { r: 0.5, g: 0.5, b: 0.5 };

  for (let i = 0; i < total; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Calculate center placement taking rotation into account
    page.drawText(options.text, {
      x: width / 2 - (textWidth / 2) * Math.cos((angle * Math.PI) / 180),
      y: height / 2 - (textWidth / 2) * Math.sin((angle * Math.PI) / 180),
      size: fontSize,
      font,
      color: rgb(c.r, c.g, c.b),
      opacity,
      rotate: degrees(angle),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

export async function cropPdf(
  pdfBytes: Uint8Array | ArrayBuffer,
  crop: CropPdfOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();

  for (let i = 0; i < total; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const newX = crop.left;
    const newY = crop.bottom;
    const newW = Math.max(50, width - crop.left - crop.right);
    const newH = Math.max(50, height - crop.top - crop.bottom);

    // Set both MediaBox and CropBox
    page.setCropBox(newX, newY, newW, newH);
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
