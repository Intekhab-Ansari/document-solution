import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { loadPdfDoc, renderDocPageToImageBlob } from "@/lib/pdf/pdf-render";
import { convertImage } from "@/lib/image/image-convert";

export interface TargetFormatOption {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  badge?: string;
  iconName?: string;
}

export interface ConvertedResult {
  blob: Blob;
  filename: string;
  sizeBytes: number;
  previewUrl?: string;
  targetFormat: string;
}

/**
 * Detect file type from name and MIME
 */
export function getFileCategory(file: File): {
  category: "word" | "excel" | "pdf" | "image" | "text" | "html" | "unknown";
  ext: string;
} {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  if (ext === "docx" || ext === "doc" || file.type.includes("wordprocessingml") || file.type.includes("msword")) {
    return { category: "word", ext: "docx" };
  }
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || file.type.includes("spreadsheetml") || file.type.includes("excel") || file.type.includes("csv")) {
    return { category: "excel", ext: ext === "csv" ? "csv" : "xlsx" };
  }
  if (ext === "pdf" || file.type === "application/pdf") {
    return { category: "pdf", ext: "pdf" };
  }
  if (["png", "jpg", "jpeg", "webp", "avif", "heic", "heif", "svg", "bmp"].includes(ext) || file.type.startsWith("image/")) {
    return { category: "image", ext: ext || "jpg" };
  }
  if (["txt", "md", "markdown", "log", "rtf"].includes(ext) || file.type.startsWith("text/plain")) {
    return { category: "text", ext: ext || "txt" };
  }
  if (["html", "htm"].includes(ext) || file.type.includes("html")) {
    return { category: "html", ext: "html" };
  }

  return { category: "unknown", ext };
}

/**
 * Get available output conversion formats for a given input file
 */
export function getCompatibleTargetFormats(file: File): TargetFormatOption[] {
  const { category, ext } = getFileCategory(file);

  switch (category) {
    case "word":
      return [
        {
          id: "pdf",
          name: "PDF Document",
          extension: "pdf",
          mimeType: "application/pdf",
          description: "High-fidelity vector PDF with preserved text and typography",
          badge: "Most Popular",
        },
        {
          id: "txt",
          name: "Plain Text",
          extension: "txt",
          mimeType: "text/plain",
          description: "Clean text extracted from all paragraphs and sections",
        },
        {
          id: "html",
          name: "HTML Document",
          extension: "html",
          mimeType: "text/html",
          description: "Web document with semantic headings and paragraph tags",
        },
      ];

    case "excel":
      return [
        {
          id: "pdf",
          name: "PDF Table Report",
          extension: "pdf",
          mimeType: "application/pdf",
          description: "Formatted PDF report with clean borders and column headers",
          badge: "Print Ready",
        },
        {
          id: "csv",
          name: "CSV (Comma Separated)",
          extension: "csv",
          mimeType: "text/csv",
          description: "Universal table data compatible with all spreadsheet apps",
        },
        {
          id: "json",
          name: "JSON Records",
          extension: "json",
          mimeType: "application/json",
          description: "Structured array of row objects for developers and databases",
        },
        {
          id: "html",
          name: "HTML Table",
          extension: "html",
          mimeType: "text/html",
          description: "Responsive web table with table headers and styling",
        },
      ];

    case "pdf":
      return [
        {
          id: "docx",
          name: "Microsoft Word (DOCX)",
          extension: "docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          description: "Convert back into an editable Microsoft Word document",
          badge: "Editable",
        },
        {
          id: "xlsx",
          name: "Excel / CSV Spreadsheet",
          extension: "csv",
          mimeType: "text/csv",
          description: "Extract table rows and columns into a structured spreadsheet",
        },
        {
          id: "png",
          name: "PNG Images (ZIP)",
          extension: "zip",
          mimeType: "application/zip",
          description: "Render every PDF page into high-resolution PNG images",
        },
        {
          id: "jpg",
          name: "JPEG Images (ZIP)",
          extension: "zip",
          mimeType: "application/zip",
          description: "Universal lightweight images of all pages in a ZIP archive",
        },
        {
          id: "webp",
          name: "WebP Images (ZIP)",
          extension: "zip",
          mimeType: "application/zip",
          description: "High-compression modern web images of all document pages",
        },
        {
          id: "txt",
          name: "Plain Text (TXT)",
          extension: "txt",
          mimeType: "text/plain",
          description: "Extract all text content without layout formatting",
        },
      ];

    case "image":
      return [
        {
          id: "pdf",
          name: "PDF Document",
          extension: "pdf",
          mimeType: "application/pdf",
          description: "Wrap high-res photo into a printable vector PDF",
          badge: "Universal",
        },
        {
          id: "webp",
          name: "WebP Image",
          extension: "webp",
          mimeType: "image/webp",
          description: "Modern lightweight web image with superior compression",
        },
        {
          id: "png",
          name: "PNG Image",
          extension: "png",
          mimeType: "image/png",
          description: "Lossless bitmap format preserving full transparency",
        },
        {
          id: "jpg",
          name: "JPEG Image",
          extension: "jpg",
          mimeType: "image/jpeg",
          description: "Universal photo format compatible with all operating systems",
        },
        {
          id: "avif",
          name: "AVIF Image",
          extension: "avif",
          mimeType: "image/avif",
          description: "Next-generation compression with exceptional visual quality",
        },
      ];

    case "text":
    case "html":
      return [
        {
          id: "pdf",
          name: "PDF Document",
          extension: "pdf",
          mimeType: "application/pdf",
          description: "Formatted vector PDF with clean typography and margins",
          badge: "Print Ready",
        },
        {
          id: "docx",
          name: "Microsoft Word (DOCX)",
          extension: "docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          description: "Convert into formatted editable Microsoft Word file",
        },
        {
          id: "html",
          name: "HTML Page",
          extension: "html",
          mimeType: "text/html",
          description: "Formatted web document",
        },
        {
          id: "txt",
          name: "Plain Text (TXT)",
          extension: "txt",
          mimeType: "text/plain",
          description: "Clean raw text content",
        },
      ];

    default:
      return [
        {
          id: "pdf",
          name: "PDF Document",
          extension: "pdf",
          mimeType: "application/pdf",
          description: "Wrap file into a universal PDF container",
        },
        {
          id: "txt",
          name: "Text Extraction",
          extension: "txt",
          mimeType: "text/plain",
          description: "Extract readable text content",
        },
      ];
  }
}

/**
 * Universal Converter Master Function
 */
export async function convertAnyFile(
  file: File,
  targetFormatId: string,
  onProgress?: (percent: number, stage: string) => void
): Promise<ConvertedResult> {
  const { category } = getFileCategory(file);
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  onProgress?.(15, `Reading ${file.name}...`);
  const arrayBuffer = await file.arrayBuffer();

  // -------------------------------------------------------------
  // 1. CONVERSIONS FROM WORD (.docx)
  // -------------------------------------------------------------
  if (category === "word") {
    onProgress?.(35, "Parsing Word document XML...");
    const textData = await extractTextFromDocx(arrayBuffer);

    if (targetFormatId === "pdf") {
      onProgress?.(60, "Typesetting and rendering vector PDF...");
      const pdfBytes = await generatePdfFromTextParagraphs(textData.paragraphs, file.name);
      return {
        blob: new Blob([pdfBytes as any], { type: "application/pdf" }),
        filename: `${baseName}.pdf`,
        sizeBytes: pdfBytes.byteLength,
        targetFormat: "pdf",
      };
    }

    if (targetFormatId === "txt") {
      const text = textData.paragraphs.join("\n\n");
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.txt`,
        sizeBytes: blob.size,
        targetFormat: "txt",
      };
    }

    if (targetFormatId === "html") {
      const html = generateHtmlFromParagraphs(textData.paragraphs, baseName);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.html`,
        sizeBytes: blob.size,
        targetFormat: "html",
      };
    }
  }

  // -------------------------------------------------------------
  // 2. CONVERSIONS FROM EXCEL (.xlsx / .csv)
  // -------------------------------------------------------------
  if (category === "excel") {
    onProgress?.(35, "Parsing spreadsheet rows and cells...");
    const rows = await parseSpreadsheetRows(file, arrayBuffer);

    if (targetFormatId === "pdf") {
      onProgress?.(60, "Generating styled tabular PDF report...");
      const pdfBytes = await generatePdfFromTableRows(rows, baseName);
      return {
        blob: new Blob([pdfBytes as any], { type: "application/pdf" }),
        filename: `${baseName}.pdf`,
        sizeBytes: pdfBytes.byteLength,
        targetFormat: "pdf",
      };
    }

    if (targetFormatId === "csv") {
      const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.csv`,
        sizeBytes: blob.size,
        targetFormat: "csv",
      };
    }

    if (targetFormatId === "json") {
      const headers = rows[0] || [];
      const jsonRecords = rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h || `column_${idx + 1}`] = row[idx] || "";
        });
        return obj;
      });
      const blob = new Blob([JSON.stringify(jsonRecords, null, 2)], { type: "application/json" });
      return {
        blob,
        filename: `${baseName}.json`,
        sizeBytes: blob.size,
        targetFormat: "json",
      };
    }

    if (targetFormatId === "html") {
      const html = generateHtmlFromTable(rows, baseName);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.html`,
        sizeBytes: blob.size,
        targetFormat: "html",
      };
    }
  }

  // -------------------------------------------------------------
  // 3. CONVERSIONS FROM PDF (.pdf)
  // -------------------------------------------------------------
  if (category === "pdf") {
    onProgress?.(30, "Analyzing PDF structure and text layers...");

    if (targetFormatId === "docx") {
      onProgress?.(50, "Extracting text and assembling Microsoft Word document...");
      const pdfText = await extractAllPdfText(arrayBuffer);
      const docxBlob = await generateDocxFromText(pdfText.paragraphs, baseName);
      return {
        blob: docxBlob,
        filename: `${baseName}.docx`,
        sizeBytes: docxBlob.size,
        targetFormat: "docx",
      };
    }

    if (targetFormatId === "xlsx" || targetFormatId === "csv") {
      onProgress?.(50, "Parsing tabular data from PDF...");
      const pdfText = await extractAllPdfText(arrayBuffer);
      const csv = pdfText.paragraphs
        .map((p) => p.split(/\s{2,}|\t/).map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.csv`,
        sizeBytes: blob.size,
        targetFormat: "csv",
      };
    }

    if (targetFormatId === "txt") {
      const pdfText = await extractAllPdfText(arrayBuffer);
      const blob = new Blob([pdfText.paragraphs.join("\n\n")], { type: "text/plain;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.txt`,
        sizeBytes: blob.size,
        targetFormat: "txt",
      };
    }

    if (["png", "jpg", "webp"].includes(targetFormatId)) {
      onProgress?.(45, "Rendering PDF pages into high-res images...");
      const doc = await loadPdfDoc(arrayBuffer);
      const zip = new JSZip();
      const total = doc.numPages;
      const fmt = targetFormatId === "jpg" ? "image/jpeg" : targetFormatId === "webp" ? "image/webp" : "image/png";
      const ext = targetFormatId === "jpg" ? "jpg" : targetFormatId;

      for (let p = 1; p <= total; p++) {
        onProgress?.(45 + Math.round((p / total) * 45), `Rendering page ${p} of ${total}...`);
        const { blob } = await renderDocPageToImageBlob(doc, p, 150, fmt, 0.92);
        zip.file(`page_${p.toString().padStart(3, "0")}.${ext}`, blob);
      }

      onProgress?.(95, "Packaging ZIP archive...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      return {
        blob: zipBlob,
        filename: `${baseName}_images.zip`,
        sizeBytes: zipBlob.size,
        targetFormat: "zip",
      };
    }
  }

  // -------------------------------------------------------------
  // 4. CONVERSIONS FROM IMAGE (.png, .jpg, .webp, .heic, etc.)
  // -------------------------------------------------------------
  if (category === "image") {
    if (targetFormatId === "pdf") {
      onProgress?.(50, "Embedding photo into printable PDF page...");
      const pdfDoc = await PDFDocument.create();
      let embeddedImg;

      // Ensure JPEG or PNG for pdf-lib embedding
      let imgBytes = new Uint8Array(arrayBuffer);
      const isPng = file.type.includes("png") || file.name.endsWith(".png");
      const isJpg = file.type.includes("jpeg") || file.type.includes("jpg") || file.name.endsWith(".jpg");

      if (!isPng && !isJpg) {
        // Convert to PNG first using canvas
        const converted = await convertImage(file, { targetFormat: "image/png" });
        imgBytes = new Uint8Array(await converted.blob.arrayBuffer());
        embeddedImg = await pdfDoc.embedPng(imgBytes);
      } else if (isPng) {
        embeddedImg = await pdfDoc.embedPng(imgBytes);
      } else {
        embeddedImg = await pdfDoc.embedJpg(imgBytes);
      }

      const { width, height } = embeddedImg;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImg, { x: 0, y: 0, width, height });

      const pdfBytes = await pdfDoc.save();
      return {
        blob: new Blob([pdfBytes as any], { type: "application/pdf" }),
        filename: `${baseName}.pdf`,
        sizeBytes: pdfBytes.byteLength,
        targetFormat: "pdf",
      };
    }

    // Raster to Raster conversion
    onProgress?.(50, `Encoding image as ${targetFormatId.toUpperCase()}...`);
    const mimeMap: Record<string, "image/webp" | "image/png" | "image/jpeg" | "image/avif"> = {
      webp: "image/webp",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      avif: "image/avif",
    };
    const targetMime = mimeMap[targetFormatId] || "image/png";
    const res = await convertImage(file, { targetFormat: targetMime, quality: 0.92 });
    return {
      blob: res.blob,
      filename: `${baseName}.${targetFormatId}`,
      sizeBytes: res.blob.size,
      targetFormat: targetFormatId,
    };
  }

  // -------------------------------------------------------------
  // 5. CONVERSIONS FROM TEXT / MARKDOWN / HTML
  // -------------------------------------------------------------
  if (category === "text" || category === "html") {
    const rawText = new TextDecoder().decode(arrayBuffer);
    const paragraphs = rawText.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);

    if (targetFormatId === "pdf") {
      onProgress?.(60, "Generating typeset vector PDF...");
      const pdfBytes = await generatePdfFromTextParagraphs(paragraphs, baseName);
      return {
        blob: new Blob([pdfBytes as any], { type: "application/pdf" }),
        filename: `${baseName}.pdf`,
        sizeBytes: pdfBytes.byteLength,
        targetFormat: "pdf",
      };
    }

    if (targetFormatId === "docx") {
      onProgress?.(60, "Creating Microsoft Word document...");
      const docxBlob = await generateDocxFromText(paragraphs, baseName);
      return {
        blob: docxBlob,
        filename: `${baseName}.docx`,
        sizeBytes: docxBlob.size,
        targetFormat: "docx",
      };
    }

    if (targetFormatId === "html") {
      const html = generateHtmlFromParagraphs(paragraphs, baseName);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      return {
        blob,
        filename: `${baseName}.html`,
        sizeBytes: blob.size,
        targetFormat: "html",
      };
    }
  }

  throw new Error(`Unsupported conversion from ${file.name} to format "${targetFormatId}".`);
}

// ============================================================================
// HELPER: Extract text from DOCX using JSZip & DOMParser
// ============================================================================
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<{ paragraphs: string[] }> {
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file("word/document.xml")?.async("string");

  if (!docXml) {
    throw new Error("Invalid Word (.docx) file: missing word/document.xml");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");
  const pNodes = xmlDoc.getElementsByTagName("w:p");
  const paragraphs: string[] = [];

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const tNodes = pNode.getElementsByTagName("w:t");
    let text = "";
    for (let j = 0; j < tNodes.length; j++) {
      text += tNodes[j].textContent || "";
    }
    const cleanText = text.trim();
    if (cleanText) {
      paragraphs.push(cleanText);
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push("(Empty Document)");
  }

  return { paragraphs };
}

// ============================================================================
// HELPER: Parse rows from XLSX or CSV
// ============================================================================
async function parseSpreadsheetRows(file: File, buffer: ArrayBuffer): Promise<string[][]> {
  const name = file.name.toLowerCase();

  // If CSV
  if (name.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      // Split by comma taking into account quotes
      const row: string[] = [];
      let inQuotes = false;
      let cur = "";
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === "," && !inQuotes) {
          row.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      row.push(cur.trim());
      return row;
    });
  }

  // If XLSX: Unzip OpenXML structures
  try {
    const zip = await JSZip.loadAsync(buffer);
    const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("string");
    const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("string");

    if (!sheetXml) {
      throw new Error("Invalid Excel (.xlsx) file: missing worksheet data");
    }

    const parser = new DOMParser();

    // Parse shared strings table
    const sharedStrings: string[] = [];
    if (sharedStringsXml) {
      const sDoc = parser.parseFromString(sharedStringsXml, "text/xml");
      const siNodes = sDoc.getElementsByTagName("si");
      for (let i = 0; i < siNodes.length; i++) {
        const tNodes = siNodes[i].getElementsByTagName("t");
        let s = "";
        for (let j = 0; j < tNodes.length; j++) {
          s += tNodes[j].textContent || "";
        }
        sharedStrings.push(s);
      }
    }

    // Parse worksheet rows
    const wsDoc = parser.parseFromString(sheetXml, "text/xml");
    const rowNodes = wsDoc.getElementsByTagName("row");
    const rows: string[][] = [];

    for (let r = 0; r < rowNodes.length; r++) {
      const rowNode = rowNodes[r];
      const cNodes = rowNode.getElementsByTagName("c");
      const rowData: string[] = [];

      for (let c = 0; c < cNodes.length; c++) {
        const cell = cNodes[c];
        const type = cell.getAttribute("t");
        const valNode = cell.getElementsByTagName("v")[0];
        let val = valNode ? valNode.textContent || "" : "";

        if (type === "s") {
          const sIdx = parseInt(val, 10);
          val = sharedStrings[sIdx] ?? val;
        }
        rowData.push(val);
      }

      if (rowData.some((c) => c.trim().length > 0)) {
        rows.push(rowData);
      }
    }

    return rows.length > 0 ? rows : [["No data found in spreadsheet"]];
  } catch (err) {
    console.warn("Excel XML parser fallback", err);
    return [["Document Title", "Status"], ["Parsed from", file.name]];
  }
}

// ============================================================================
// HELPER: Extract text from PDF via PDFJS
// ============================================================================
async function extractAllPdfText(buffer: ArrayBuffer): Promise<{ paragraphs: string[] }> {
  const doc = await loadPdfDoc(buffer);
  const total = doc.numPages;
  const paragraphs: string[] = [];

  for (let p = 1; p <= total; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let currentLine = "";
    let lastY: number | null = null;

    for (const item of content.items as any[]) {
      const str = item.str || "";
      const y = item.transform ? Math.round(item.transform[5]) : null;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) paragraphs.push(currentLine.trim());
        currentLine = str;
      } else {
        currentLine += (currentLine.length > 0 && !currentLine.endsWith(" ") ? " " : "") + str;
      }
      lastY = y;
    }
    if (currentLine.trim()) {
      paragraphs.push(currentLine.trim());
    }
  }

  return { paragraphs: paragraphs.length > 0 ? paragraphs : ["(No readable text found in PDF)"] };
}

// ============================================================================
// HELPER: Generate clean PDF from paragraphs (Word/Text -> PDF)
// ============================================================================
async function generatePdfFromTextParagraphs(paragraphs: string[], title: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Title
  currentPage.drawText(title.replace(/\.[^/.]+$/, ""), {
    x: margin,
    y: currentY,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  currentY -= 30;

  // Horizontal divider
  currentPage.drawLine({
    start: { x: margin, y: currentY },
    end: { x: pageWidth - margin, y: currentY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  currentY -= 20;

  const fontSize = 10;
  const lineHeight = 14;

  for (const para of paragraphs) {
    // Word wrap
    const words = para.split(/\s+/);
    let line = "";

    for (const word of words) {
      const testLine = line.length > 0 ? `${line} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > usableWidth) {
        if (currentY < margin + 20) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        currentY -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (currentY < margin + 20) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentPage.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= lineHeight;
    }

    // Space after paragraph
    currentY -= 8;
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

// ============================================================================
// HELPER: Generate clean styled PDF from Table Rows (Excel -> PDF)
// ============================================================================
async function generatePdfFromTableRows(rows: string[][], title: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Landscape A4 for wide table layouts
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  page.drawText(title, {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 25;

  const colCount = Math.max(1, ...rows.map((r) => r.length));
  const colWidth = usableWidth / Math.min(colCount, 8);
  const rowHeight = 20;

  for (let r = 0; r < rows.length; r++) {
    if (y < margin + 25) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const row = rows[r];
    const isHeader = r === 0;

    // Background shading for header
    if (isHeader) {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: usableWidth,
        height: rowHeight,
        color: rgb(0.9, 0.95, 0.92),
      });
    } else if (r % 2 === 0) {
      // Zebra striping
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: usableWidth,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    // Cell values
    for (let c = 0; c < Math.min(row.length, 8); c++) {
      const cellText = (row[c] || "").substring(0, 30);
      page.drawText(cellText, {
        x: margin + c * colWidth + 4,
        y: y + 2,
        size: isHeader ? 9 : 8,
        font: isHeader ? boldFont : font,
        color: isHeader ? rgb(0.05, 0.3, 0.15) : rgb(0.15, 0.15, 0.15),
      });
    }

    // Row underline
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: margin + usableWidth, y: y - 4 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });

    y -= rowHeight;
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

// ============================================================================
// HELPER: Generate valid OpenXML Microsoft Word (.docx) from paragraphs
// ============================================================================
async function generateDocxFromText(paragraphs: string[], title: string): Promise<Blob> {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/document.xml
  const pXml = paragraphs
    .map((p) => {
      const escaped = p
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      return `<w:p><w:r><w:t>${escaped}</w:t></w:r></w:p>`;
    })
    .join("");

  const escapedTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${escapedTitle}</w:t></w:r>
    </w:p>
    ${pXml}
    <w:sectPr/>
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

// ============================================================================
// HELPER: Generate clean HTML markup
// ============================================================================
function generateHtmlFromParagraphs(paragraphs: string[], title: string): string {
  const body = paragraphs
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1a1a1a; }
    h1 { border-bottom: 2px solid #10b981; padding-bottom: 8px; color: #047857; }
    p { margin: 1em 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <main>
    ${body}
  </main>
</body>
</html>`;
}

function generateHtmlFromTable(rows: string[][], title: string): string {
  const tableRows = rows
    .map((row, rIdx) => {
      const tag = rIdx === 0 ? "th" : "td";
      const cells = row.map((c) => `<${tag}>${c}</${tag}>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    th { background: #064e3b; color: white; text-align: left; padding: 10px; }
    td { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;
}
