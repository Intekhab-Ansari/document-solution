import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createFixtures() {
  // 1. Create sample PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Page 1
  const page1 = pdfDoc.addPage([600, 800]);
  page1.drawText("IntekEdit Privacy-First PDF Sample", {
    x: 50,
    y: 720,
    size: 20,
    font,
    color: rgb(0.1, 0.5, 0.4),
  });
  page1.drawText("This confidential document contains sample financial data and contracts.", {
    x: 50,
    y: 680,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  // Page 2
  const page2 = pdfDoc.addPage([600, 800]);
  page2.drawText("Page 2: Verification and Statements", {
    x: 50,
    y: 720,
    size: 18,
    font,
    color: rgb(0.1, 0.3, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, "sample-document.pdf"), pdfBytes);
  console.log("Created sample-document.pdf (" + pdfBytes.length + " bytes)");

  // 2. Create sample minimal JPEG
  // Minimal 1x1 black JPEG header + pixels
  const minimalJpgBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  fs.writeFileSync(path.join(__dirname, "sample-photo.jpg"), Buffer.from(minimalJpgBase64, "base64"));
  console.log("Created sample-photo.jpg");
}

createFixtures();
