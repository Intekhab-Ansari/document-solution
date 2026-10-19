import { test, expect } from "@playwright/test";
import path from "path";

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

test.describe("Privacy & Zero-Network Egress Gate", () => {
  test("PDF Compress: strictly zero network byte egress during execution", async ({ page }) => {
    const egressViolations: string[] = [];

    // Intercept all network traffic
    page.on("request", (req) => {
      const url = req.url();
      const method = req.method();
      const postData = req.postData();

      // Disallow any external host communication
      if (!url.startsWith("http://localhost") && !url.startsWith("http://127.0.0.1") && !url.startsWith("data:") && !url.startsWith("blob:")) {
        egressViolations.push(`External Request: ${method} ${url}`);
      }

      // Disallow sending payloads with file bytes or form uploads
      if ((method === "POST" || method === "PUT" || method === "PATCH") && postData && postData.length > 50) {
        egressViolations.push(`Unauthorized Payload Egress: ${method} ${url} (${postData.length} bytes)`);
      }
    });

    await page.goto("/pdf/compress");

    // Verify privacy badge is clearly visible
    const badge = page.locator("text=Processed on your device");
    await expect(badge).toBeVisible();

    // Upload test PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, "sample-document.pdf"));

    // Ensure preview renders locally
    await expect(page.locator("text=Document First Page Preview")).toBeVisible({ timeout: 10000 });

    // Click compress
    const compressBtn = page.locator("#compress-target-btn");
    await compressBtn.click();

    // Verify completion
    await expect(page.locator("#download-result-btn")).toBeVisible({ timeout: 15000 });

    // Assert zero egress violations
    expect(egressViolations).toHaveLength(0);
  });

  test("Image Compress: zero network byte egress", async ({ page }) => {
    const egressViolations: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      const method = req.method();
      const postData = req.postData();

      if (!url.startsWith("http://localhost") && !url.startsWith("http://127.0.0.1") && !url.startsWith("data:") && !url.startsWith("blob:")) {
        egressViolations.push(`External Request: ${method} ${url}`);
      }

      if ((method === "POST" || method === "PUT") && postData && postData.length > 50) {
        egressViolations.push(`Unauthorized Payload Egress: ${method} ${url}`);
      }
    });

    await page.goto("/image/compress");
    await expect(page.locator("text=Processed on your device")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, "sample-photo.jpg"));

    // Verify compress button
    const compressBtn = page.locator("text=Compress Image Now");
    await expect(compressBtn).toBeVisible();
    await compressBtn.click();

    await expect(page.locator("text=Download Compressed Image")).toBeVisible({ timeout: 15000 });
    expect(egressViolations).toHaveLength(0);
  });
});
