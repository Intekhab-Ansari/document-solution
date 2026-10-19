import { describe, it, expect } from "vitest";
import { formatBytes, calculateSavings } from "../../src/lib/utils";
import { parsePageRangeString } from "../../src/lib/pdf/pdf-manipulate";
import { PDFDocument } from "pdf-lib";
import { optimizePdfStreams } from "../../src/lib/pdf/pdf-compress";

describe("Utils & Math", () => {
  it("formats bytes accurately", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(2048 * 1024)).toBe("2 MB");
  });

  it("calculates percentage savings correctly", () => {
    const savings = calculateSavings(1000, 200);
    expect(savings.percent).toBe(80);
    expect(savings.diffBytes).toBe(800);
    expect(savings.isSmaller).toBe(true);
  });
});

describe("PDF Page Range Parser", () => {
  it("parses combined ranges and individual pages", () => {
    const totalPages = 15;
    const parsed = parsePageRangeString("1-3, 5, 8-10", totalPages);
    expect(parsed).toEqual([1, 2, 3, 5, 8, 9, 10]);
  });

  it("clamps out-of-bounds page numbers", () => {
    const totalPages = 5;
    const parsed = parsePageRangeString("1-10, 20", totalPages);
    expect(parsed).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("PDF In-Memory Stream Optimization", () => {
  it("optimizes an in-memory PDF without network access", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 400]);
    page.drawText("Test PDF Document for EditAnything");
    const bytes = await doc.save();

    const optimized = await optimizePdfStreams(bytes);
    expect(optimized.byteLength).toBeGreaterThan(0);
    expect(optimized instanceof Uint8Array).toBe(true);
  });
});
