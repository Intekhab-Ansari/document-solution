import { describe, it, expect } from "vitest";
import { queryAssistant } from "../../src/lib/ai/assistant-engine";

describe("IntekEdit AI Assistant & Customer Query Engine", () => {
  it("provides greeting and recommendations on empty query", () => {
    const res = queryAssistant("");
    expect(res.intent).toBe("empty");
    expect(res.quickFollowUps?.length).toBeGreaterThan(0);
  });

  it("extracts target KB and provides direct PDF compress launcher", () => {
    const res = queryAssistant("I need to compress my pdf to 150kb for job portal");
    expect(res.intent).toBe("pdf_compress");
    expect(res.action?.href).toBe("/pdf/compress?targetKb=150");
    expect(res.action?.prefilledFields?.targetKb).toBe(150);
    expect(res.steps.length).toBeGreaterThan(0);
  });

  it("handles MB conversions to KB for target compression", () => {
    const res = queryAssistant("reduce pdf size to under 1mb");
    expect(res.intent).toBe("pdf_compress");
    expect(res.action?.href).toBe("/pdf/compress?targetKb=1024");
    expect(res.action?.prefilledFields?.targetKb).toBe(1024);
  });

  it("extracts target KB for image compression", () => {
    const res = queryAssistant("compress my passport photo to 50kb");
    expect(res.intent).toBe("image_compress");
    expect(res.action?.href).toBe("/image/compress?targetKb=50");
    expect(res.action?.prefilledFields?.targetKb).toBe(50);
  });

  it("handles edit pdf and invoice text changes", () => {
    const res = queryAssistant("how do i edit text and whiteout errors in my pdf invoice");
    expect(res.intent).toBe("pdf_edit");
    expect(res.action?.href).toBe("/pdf/edit");
    expect(res.action?.toolId).toBe("pdf-edit");
  });

  it("handles HEIC to JPG format conversions", () => {
    const res = queryAssistant("convert iphone heic photos to jpg");
    expect(res.intent).toBe("image_convert");
    expect(res.action?.href).toContain("/image/convert?to=jpg");
    expect(res.action?.prefilledFields?.to).toBe("jpg");
  });

  it("handles merge and split operations", () => {
    const mergeRes = queryAssistant("merge 3 pdf files together");
    expect(mergeRes.intent).toBe("pdf_merge");
    expect(mergeRes.action?.href).toBe("/pdf/merge");

    const splitRes = queryAssistant("split pages 1 to 5 from my pdf");
    expect(splitRes.intent).toBe("pdf_split");
    expect(splitRes.action?.href).toBe("/pdf/split");
  });

  it("handles EXIF metadata and GPS scrubbing", () => {
    const res = queryAssistant("remove gps location and camera metadata from photos");
    expect(res.intent).toBe("strip_metadata");
    expect(res.action?.href).toBe("/image/metadata");
  });

  it("handles digital signature queries", () => {
    const res = queryAssistant("how to sign my contract pdf");
    expect(res.intent).toBe("pdf_sign");
    expect(res.action?.href).toBe("/security/sign");
  });

  it("handles password protection and encryption", () => {
    const res = queryAssistant("password protect my confidential document");
    expect(res.intent).toBe("pdf_protect");
    expect(res.action?.href).toBe("/security/protect");
  });

  it("answers privacy architecture inquiries with 0 byte egress guarantee", () => {
    const res = queryAssistant("is this safe? are my files uploaded to your server?");
    expect(res.intent).toBe("privacy");
    expect(res.action?.href).toBe("/privacy");
    expect(res.message).toContain("Zero bytes");
  });
});
