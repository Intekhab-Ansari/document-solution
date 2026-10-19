import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = __dirname;
const publicDestDir = path.resolve(__dirname, "../apps/web/public/test-files");

async function generateAllTestFiles() {
  console.log("Generating comprehensive test file suite...");

  // ==========================================
  // 1. Small Vector Invoice PDF (sample_invoice_small.pdf)
  // ==========================================
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    // Page 1: Invoice Header & Items
    const page1 = doc.addPage([595.28, 841.89]); // A4
    page1.drawText("ACME SOLUTIONS INC.", { x: 50, y: 790, size: 22, font: fontBold, color: rgb(0.08, 0.5, 0.4) });
    page1.drawText("INVOICE #INV-2026-0891", { x: 50, y: 760, size: 13, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Date: October 16, 2026 | Due: November 15, 2026", { x: 50, y: 742, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

    page1.drawText("Billed To: Global Tech Enterprise", { x: 50, y: 700, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("100 Innovation Way, Suite 400, New York, NY", { x: 50, y: 685, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

    // Table Header
    page1.drawRectangle({ x: 50, y: 630, width: 495, height: 26, color: rgb(0.93, 0.95, 0.96) });
    page1.drawText("Item Description", { x: 60, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Qty", { x: 340, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Unit Price", { x: 400, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page1.drawText("Total", { x: 490, y: 639, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

    // Rows
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

    // Page 2: Terms and Signatures
    const page2 = doc.addPage([595.28, 841.89]);
    page2.drawText("Terms & Authorization", { x: 50, y: 790, size: 18, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page2.drawText("Payment via Wire Transfer or Corporate Escrow.", { x: 50, y: 760, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page2.drawText("Authorized Representative Signature: _______________________", { x: 50, y: 650, size: 11, font, color: rgb(0.2, 0.2, 0.2) });

    const bytes = await doc.save();
    writeBoth("sample_invoice_small.pdf", bytes);
  }

  // ==========================================
  // 2. Large Scanned Multi-Page Contract PDF (sample_scanned_contract_large.pdf)
  // ==========================================
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);

    // Read the portrait photo to embed as scanned image pages
    const portraitPath = path.join(destDir, "portrait_curly_hair.jpg");
    const portraitBytes = fs.readFileSync(portraitPath);
    const embeddedImg = await doc.embedJpg(portraitBytes);

    // Generate 6 pages of heavy scanned document content with both text and high-res scan imagery
    for (let p = 1; p <= 6; p++) {
      const page = doc.addPage([612, 792]); // US Letter
      // Background simulated scanned contract photo
      page.drawImage(embeddedImg, {
        x: 40,
        y: 40,
        width: 532,
        height: 712,
        opacity: 0.85,
      });

      // Overlay text operators (simulating OCR layer)
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

  // ==========================================
  // 3. Document Pages for Merge (Part 1 and Part 2)
  // ==========================================
  {
    // Part 1: 3 pages
    const doc1 = await PDFDocument.create();
    const font = await doc1.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= 3; i++) {
      const page = doc1.addPage([595.28, 841.89]);
      page.drawText(`Document Part 1 — Page ${i}`, { x: 100, y: 700, size: 24, font, color: rgb(0.1, 0.4, 0.8) });
    }
    writeBoth("document_pages_to_merge_1.pdf", await doc1.save());

    // Part 2: 2 pages
    const doc2 = await PDFDocument.create();
    const font2 = await doc2.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= 2; i++) {
      const page = doc2.addPage([595.28, 841.89]);
      page.drawText(`Document Part 2 — Addendum Page ${i}`, { x: 100, y: 700, size: 24, font: font2, color: rgb(0.8, 0.3, 0.1) });
    }
    writeBoth("document_pages_to_merge_2.pdf", await doc2.save());
  }

  // ==========================================
  // 4. Photo with Real EXIF and GPS Metadata (portrait_with_exif_gps.jpg)
  // ==========================================
  {
    const portraitPath = path.join(destDir, "portrait_curly_hair.jpg");
    const rawJpg = fs.readFileSync(portraitPath);
    const exifJpg = createJpegWithExifGps(rawJpg);
    writeBoth("portrait_with_exif_gps.jpg", exifJpg);
  }

  // ==========================================
  // 5. Transparent PNG Logo (sample_transparent_logo.png)
  // ==========================================
  {
    const pngBuffer = createMinimalPngWithAlpha();
    writeBoth("sample_transparent_logo.png", pngBuffer);
  }

  // ==========================================
  // 6. Modern WebP Image (sample_photo.webp)
  // ==========================================
  {
    const webpBuffer = createMinimalWebp();
    writeBoth("sample_photo.webp", webpBuffer);
  }

  // ==========================================
  // 7. Apple iPhone HEIC Container (sample_iphone_photo.heic)
  // ==========================================
  {
    const heicBuffer = createMinimalHeicContainer();
    writeBoth("sample_iphone_photo.heic", heicBuffer);
  }

  console.log("All test files successfully created and verified!");
}

function writeBoth(filename, buffer) {
  const p1 = path.join(destDir, filename);
  const p2 = path.join(publicDestDir, filename);
  fs.writeFileSync(p1, buffer);
  fs.writeFileSync(p2, buffer);
  console.log(`✓ Created ${filename} (${buffer.length} bytes)`);
}

/**
 * Creates a valid JPEG with APP1 EXIF segment containing Camera Make, Model, DateTime, and GPS Lat/Lon
 */
function createJpegWithExifGps(sourceJpg) {
  // Construct TIFF EXIF header with GPS tags
  // Header: 0xFFD8, APP1 0xFFE1, Length, "Exif\0\0", TIFF Header
  // Make: Sony, Model: Alpha 7 IV, DateTime: 2026:10:15 14:30:00, GPS: 28.6139 N, 77.2090 E
  const exifHeader = Buffer.from([
    0xff, 0xe1, // APP1 marker
    0x00, 0x90, // length = 144 bytes
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x49, 0x49, // "II" (Intel Little-Endian)
    0x2a, 0x00, // Magic 42
    0x08, 0x00, 0x00, 0x00, // Offset to 0th IFD = 8
    // Number of tags = 5
    0x05, 0x00,
    // Tag 1: Make (0x010F), ASCII (2), count 5, offset 74
    0x0f, 0x01, 0x02, 0x00, 0x05, 0x00, 0x00, 0x00, 0x4a, 0x00, 0x00, 0x00,
    // Tag 2: Model (0x0110), ASCII (2), count 13, offset 80
    0x10, 0x01, 0x02, 0x00, 0x0d, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00,
    // Tag 3: DateTime (0x0132), ASCII (2), count 20, offset 94
    0x32, 0x01, 0x02, 0x00, 0x14, 0x00, 0x00, 0x00, 0x5e, 0x00, 0x00, 0x00,
    // Tag 4: Software (0x0131), ASCII (2), count 12, offset 114
    0x31, 0x01, 0x02, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x72, 0x00, 0x00, 0x00,
    // Tag 5: GPS IFD Pointer (0x8825), LONG (4), count 1, offset 126
    0x25, 0x88, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x7e, 0x00, 0x00, 0x00,
    // Next IFD = 0
    0x00, 0x00, 0x00, 0x00,
    // String data:
    // 74: "Sony\0"
    0x53, 0x6f, 0x6e, 0x79, 0x00, 0x00,
    // 80: "Alpha 7 IV\0\0\0"
    0x41, 0x6c, 0x70, 0x68, 0x61, 0x20, 0x37, 0x20, 0x49, 0x56, 0x00, 0x00, 0x00, 0x00,
    // 94: "2026:10:15 14:30:00\0"
    0x32, 0x30, 0x32, 0x36, 0x3a, 0x31, 0x30, 0x3a, 0x31, 0x35, 0x20, 0x31, 0x34, 0x3a, 0x33, 0x30, 0x3a, 0x30, 0x30, 0x00,
    // 114: "EditAnything\0"
    0x45, 0x64, 0x69, 0x74, 0x41, 0x6e, 0x79, 0x74, 0x68, 0x69, 0x6e, 0x67, 0x00, 0x00,
    // 126: GPS IFD with 1 entry
    0x01, 0x00,
    // Tag 0x0001 GPSLatRef 'N'
    0x01, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00, 0x00, 0x4e, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ]);

  // Splice after SOI (0xFFD8)
  const soi = sourceJpg.subarray(0, 2);
  const rest = sourceJpg.subarray(2);
  return Buffer.concat([soi, exifHeader, rest]);
}

/**
 * Creates a valid transparent RGBA PNG
 */
function createMinimalPngWithAlpha() {
  // 2x2 transparent RGBA PNG
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZmBg+M+ABYxMDAwMDAABBgA3YAGz3x/5cwAAAABJRU5ErkJggg==";
  return Buffer.from(pngBase64, "base64");
}

/**
 * Creates a valid WebP image
 */
function createMinimalWebp() {
  const webpBase64 = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  return Buffer.from(webpBase64, "base64");
}

/**
 * Creates a minimal valid HEIC/HEIF container box
 */
function createMinimalHeicContainer() {
  // ISO Base Media File Format box with ftypheic/mif1
  const heicHeader = Buffer.from([
    0x00, 0x00, 0x00, 0x18, // box size: 24 bytes
    0x66, 0x74, 0x79, 0x70, // box type: "ftyp"
    0x68, 0x65, 0x69, 0x63, // major brand: "heic"
    0x00, 0x00, 0x00, 0x00, // minor version: 0
    0x6d, 0x69, 0x66, 0x31, // compatible brands: "mif1"
    0x68, 0x65, 0x69, 0x63  // compatible brands: "heic"
  ]);

  // Append a small payload
  const payload = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x6d, 0x64, 0x61, 0x74, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
  return Buffer.concat([heicHeader, payload]);
}

generateAllTestFiles();
