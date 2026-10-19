import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootTestFiles = path.resolve(__dirname, "../../../test-files");
const publicTestFiles = path.resolve(__dirname, "../public/test-files");

async function generateAllTestFiles() {
  console.log("Generating comprehensive test file suite...");

  // 1. Small Vector Invoice PDF (sample_invoice_small.pdf)
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const page1 = doc.addPage([595.28, 841.89]);
    page1.drawText("ACME ENTERPRISE CORP.", { x: 50, y: 790, size: 22, font: fontBold, color: rgb(0.08, 0.5, 0.4) });
    page1.drawText("INVOICE #INV-2026-9821", { x: 50, y: 760, size: 13, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Date: October 16, 2026 | Due: Net 30 Days", { x: 50, y: 742, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

    page1.drawText("Billed To: Global Tech Enterprise", { x: 50, y: 700, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("100 Innovation Way, Suite 400, New York, NY", { x: 50, y: 685, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

    page1.drawRectangle({ x: 50, y: 630, width: 495, height: 26, color: rgb(0.93, 0.95, 0.96) });
    page1.drawText("Item Description", { x: 60, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Qty", { x: 340, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Unit Price", { x: 400, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Total", { x: 490, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

    const items = [
      ["Cloud Infrastructure Security Audit", "1", "$4,500.00", "$4,500.00"],
      ["Zero-Trust Document Pipeline Setup", "1", "$3,200.00", "$3,200.00"],
      ["Client-Side WebAssembly Integration", "40 hrs", "$150.00", "$6,000.00"],
    ];

    let y = 600;
    for (const [desc, qty, unit, total] of items) {
      page1.drawText(desc, { x: 60, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText(qty, { x: 340, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText(unit, { x: 400, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText(total, { x: 490, y, size: 10, font: fontBold, color: rgb(0.08, 0.5, 0.4) });
      y -= 30;
    }

    const page2 = doc.addPage([595.28, 841.89]);
    page2.drawText("Terms & Authorization", { x: 50, y: 790, size: 18, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page2.drawText("Payment via Wire Transfer or Corporate Escrow.", { x: 50, y: 760, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page2.drawText("Authorized Representative Signature: _______________________", { x: 50, y: 650, size: 11, font, color: rgb(0.2, 0.2, 0.2) });

    const bytes = await doc.save();
    writeBoth("sample_invoice_small.pdf", bytes);
  }

  // 2. Large Scanned Multi-Page Contract PDF (sample_scanned_contract_large.pdf)
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);

    const portraitPath = path.join(rootTestFiles, "portrait_curly_hair.jpg");
    const portraitBytes = fs.readFileSync(portraitPath);
    const embeddedImg = await doc.embedJpg(portraitBytes);

    for (let p = 1; p <= 6; p++) {
      const page = doc.addPage([612, 792]);
      page.drawImage(embeddedImg, {
        x: 40,
        y: 40,
        width: 532,
        height: 712,
        opacity: 0.85,
      });

      page.drawText(`CONFIDENTIAL LEGAL AGREEMENT — SECTION ${p}.0`, {
        x: 60,
        y: 740,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText(`Article ${p}: The parties agree to mutual non-disclosure and cryptographic document privacy.`, {
        x: 60,
        y: 710,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText(`Page ${p} of 6 - Verified Client-Side OCR Layer`, {
        x: 60,
        y: 50,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    const bytes = await doc.save();
    writeBoth("sample_scanned_contract_large.pdf", bytes);
  }

  // 3. Document Pages for Merge
  {
    const doc1 = await PDFDocument.create();
    const font = await doc1.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= 3; i++) {
      const page = doc1.addPage([595.28, 841.89]);
      page.drawText(`Document Part 1 — Page ${i}`, { x: 100, y: 700, size: 24, font, color: rgb(0.1, 0.4, 0.8) });
    }
    writeBoth("document_pages_to_merge_1.pdf", await doc1.save());

    const doc2 = await PDFDocument.create();
    const font2 = await doc2.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= 2; i++) {
      const page = doc2.addPage([595.28, 841.89]);
      page.drawText(`Document Part 2 — Addendum Page ${i}`, { x: 100, y: 700, size: 24, font: font2, color: rgb(0.8, 0.3, 0.1) });
    }
    writeBoth("document_pages_to_merge_2.pdf", await doc2.save());
  }

  // 4. Photo with Real EXIF and GPS Metadata (portrait_with_exif_gps.jpg)
  {
    const portraitPath = path.join(rootTestFiles, "portrait_curly_hair.jpg");
    const rawJpg = fs.readFileSync(portraitPath);
    const exifJpg = createJpegWithExifGps(rawJpg);
    writeBoth("portrait_with_exif_gps.jpg", exifJpg);
  }

  // 5. Transparent PNG Logo (sample_transparent_logo.png)
  {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZmBg+M+ABYxMDAwMDAABBgA3YAGz3x/5cwAAAABJRU5ErkJggg==";
    writeBoth("sample_transparent_logo.png", Buffer.from(pngBase64, "base64"));
  }

  // 6. Modern WebP Image (sample_photo.webp)
  {
    const webpBase64 = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
    writeBoth("sample_photo.webp", Buffer.from(webpBase64, "base64"));
  }

  // 7. Apple iPhone HEIC Container (sample_iphone_photo.heic)
  {
    const heicHeader = Buffer.from([
      0x00, 0x00, 0x00, 0x18, // 24 bytes
      0x66, 0x74, 0x79, 0x70, // "ftyp"
      0x68, 0x65, 0x69, 0x63, // "heic"
      0x00, 0x00, 0x00, 0x00, // minor version
      0x6d, 0x69, 0x66, 0x31, // "mif1"
      0x68, 0x65, 0x69, 0x63  // "heic"
    ]);
    const payload = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x6d, 0x64, 0x61, 0x74, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    writeBoth("sample_iphone_photo.heic", Buffer.concat([heicHeader, payload]));
  }

  console.log("All test files successfully generated!");
}

function writeBoth(filename, buffer) {
  const p1 = path.join(rootTestFiles, filename);
  const p2 = path.join(publicTestFiles, filename);
  fs.writeFileSync(p1, buffer);
  fs.writeFileSync(p2, buffer);
  console.log(`✓ Created ${filename} (${buffer.length} bytes)`);
}

function createJpegWithExifGps(sourceJpg) {
  const exifHeader = Buffer.from([
    0xff, 0xe1, // APP1 marker
    0x00, 0x90, // length = 144 bytes
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x49, 0x49, // "II" (Intel Little-Endian)
    0x2a, 0x00, // Magic 42
    0x08, 0x00, 0x00, 0x00, // Offset to 0th IFD = 8
    0x05, 0x00, // Number of tags = 5
    // Tag 1: Make
    0x0f, 0x01, 0x02, 0x00, 0x05, 0x00, 0x00, 0x00, 0x4a, 0x00, 0x00, 0x00,
    // Tag 2: Model
    0x10, 0x01, 0x02, 0x00, 0x0d, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00,
    // Tag 3: DateTime
    0x32, 0x01, 0x02, 0x00, 0x14, 0x00, 0x00, 0x00, 0x5e, 0x00, 0x00, 0x00,
    // Tag 4: Software
    0x31, 0x01, 0x02, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x72, 0x00, 0x00, 0x00,
    // Tag 5: GPS IFD Pointer
    0x25, 0x88, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x7e, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    // String data:
    0x53, 0x6f, 0x6e, 0x79, 0x00, 0x00, // "Sony\0"
    0x41, 0x6c, 0x70, 0x68, 0x61, 0x20, 0x37, 0x20, 0x49, 0x56, 0x00, 0x00, 0x00, 0x00, // "Alpha 7 IV\0"
    0x32, 0x30, 0x32, 0x36, 0x3a, 0x31, 0x30, 0x3a, 0x31, 0x35, 0x20, 0x31, 0x34, 0x3a, 0x33, 0x30, 0x3a, 0x30, 0x30, 0x00, // "2026:10:15 14:30:00\0"
    0x45, 0x64, 0x69, 0x74, 0x41, 0x6e, 0x79, 0x74, 0x68, 0x69, 0x6e, 0x67, 0x00, 0x00, // "EditAnything\0"
    0x01, 0x00, // GPS IFD entries: 1
    0x01, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00, 0x00, 0x4e, 0x00, 0x00, 0x00, // GPSLatRef 'N'
    0x00, 0x00, 0x00, 0x00
  ]);

  const soi = sourceJpg.subarray(0, 2);
  const rest = sourceJpg.subarray(2);
  return Buffer.concat([soi, exifHeader, rest]);
}

generateAllTestFiles();
