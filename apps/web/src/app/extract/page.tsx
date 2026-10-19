"use client";

import React from "react";
import { CategoryHub } from "@/components/common/CategoryHub";
import { Layers } from "lucide-react";

export default function ExtractorsPage() {
  return (
    <CategoryHub
      category="extract"
      title="Content & Asset Extractors"
      subtitle="Extract text streams, embedded images, metadata, and form fields from PDF documents. Export directly to Markdown, plain text, or packaged ZIP archives."
      badge="100% In-Browser Extraction"
      icon={<Layers className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" />}
      acceptMimeTypes="application/pdf,image/*"
      dropzoneTitle="Drop document to extract text or images"
      dropzoneDescription="All unicode and raster extraction executes client-side."
      sampleFiles={[
        {
          name: "sample_scanned_contract_large.pdf",
          url: "/test-files/sample_scanned_contract_large.pdf",
          label: "📄 Contract for Text Extraction (875 KB)",
          kind: "pdf",
        },
        {
          name: "sample_invoice_small.pdf",
          url: "/test-files/sample_invoice_small.pdf",
          label: "📄 Invoice for Image Extraction (2 KB)",
          kind: "pdf",
        },
      ]}
    />
  );
}
