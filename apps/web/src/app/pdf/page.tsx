"use client";

import React from "react";
import { CategoryHub } from "@/components/common/CategoryHub";
import { FileText } from "lucide-react";

export default function PdfToolsPage() {
  return (
    <CategoryHub
      category="pdf"
      title="All PDF Tools"
      subtitle="Complete suite to compress, merge, split, reorder, rotate, watermark, page-number, crop, flatten, grayscale, and repair PDF documents. Processed 100% inside your browser."
      badge="10+ In-Browser PDF Tools"
      icon={<FileText className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />}
      acceptMimeTypes="application/pdf"
      dropzoneTitle="Drop any PDF file here"
      dropzoneDescription="Instant local processing. Your files never touch a remote server."
      sampleFiles={[
        {
          name: "sample_scanned_contract_large.pdf",
          url: "/test-files/sample_scanned_contract_large.pdf",
          label: "📄 Scanned Contract (875 KB)",
          kind: "pdf",
        },
        {
          name: "sample_invoice_small.pdf",
          url: "/test-files/sample_invoice_small.pdf",
          label: "📄 Invoice (2 KB)",
          kind: "pdf",
        },
      ]}
    />
  );
}
