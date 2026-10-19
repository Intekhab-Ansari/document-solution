import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  protectPdfWithPassword,
  unlockPdf,
} from "../../src/lib/pdf/pdf-security";

describe("Client-Side PDF Security Engine (QPDF WASM)", () => {
  it("encrypts a PDF with AES-256 and decrypts it with the correct password", async () => {
    // 1. Create a sample PDF
    const testDoc = await PDFDocument.create();
    const page = testDoc.addPage([400, 600]);
    page.drawText("Confidential Financial Audit", { x: 50, y: 500 });
    const originalBytes = await testDoc.save();

    // 2. Encrypt with password "secret2026"
    const protectedBytes = await protectPdfWithPassword(originalBytes, {
      userPassword: "secret2026",
      keyLength: 256,
      allowPrinting: true,
      allowCopying: false,
    });

    expect(protectedBytes).toBeInstanceOf(Uint8Array);
    expect(protectedBytes.byteLength).toBeGreaterThan(0);

    // 3. Unlock with the correct password
    const unlockedBytes = await unlockPdf(protectedBytes, "secret2026");
    expect(unlockedBytes).toBeInstanceOf(Uint8Array);

    // 4. Verify the unlocked PDF can be parsed without password by standard pdf-lib
    const verifiedDoc = await PDFDocument.load(unlockedBytes);
    expect(verifiedDoc.getPageCount()).toBe(1);
  });

  it("throws an error when attempting to unlock with an incorrect password", async () => {
    const testDoc = await PDFDocument.create();
    testDoc.addPage([400, 600]);
    const originalBytes = await testDoc.save();

    const protectedBytes = await protectPdfWithPassword(originalBytes, {
      userPassword: "correct-password-123",
      keyLength: 256,
    });

    // Attempt decrypt with wrong password
    await expect(unlockPdf(protectedBytes, "wrong-password")).rejects.toThrow();
  });
});
