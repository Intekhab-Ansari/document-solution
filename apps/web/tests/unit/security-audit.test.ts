import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * CI Security Check:
 * Fails if any source file contains forbidden logging of file contents, file names, or raw text buffers.
 */
describe("CI Security & Privacy Static Audit", () => {
  function getTsFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getTsFiles(fullPath, fileList);
      } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  it("verifies zero logging statements leak file names, contents, or user data", () => {
    const srcDir = path.resolve(__dirname, "../../src");
    const tsFiles = getTsFiles(srcDir);
    const violations: string[] = [];

    // Forbidden patterns that might log private document details
    const forbiddenPatterns = [
      /console\.log\(.*file\.name/i,
      /console\.log\(.*fileContent/i,
      /console\.log\(.*extractedText/i,
      /console\.log\(.*buffer/i,
      /console\.log\(.*arrayBuffer/i,
      /console\.info\(.*file\./i,
    ];

    for (const filePath of tsFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            violations.push(`${path.relative(srcDir, filePath)}:L${index + 1}: ${line.trim()}`);
          }
        }
      });
    }

    expect(violations).toHaveLength(0);
  });
});
