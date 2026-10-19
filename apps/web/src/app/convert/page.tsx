"use client";

import React from "react";
import { CategoryHub } from "@/components/common/CategoryHub";
import { RefreshCw } from "lucide-react";

export default function ConvertersPage() {
  return (
    <CategoryHub
      category="convert"
      title="Universal Document & Image Converters"
      subtitle="Fast, high-fidelity format conversion between PDF documents, raster images (PNG, JPG), Apple HEIC photos, WebP, and AVIF. All processing occurs locally in your browser."
      badge="Zero Quality Loss"
      icon={<RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-violet-400" />}
      acceptMimeTypes="application/pdf,image/*,.heic,.heif"
      dropzoneTitle="Drop any document or image to convert"
      dropzoneDescription="Instant conversion directly on your device."
      sampleFiles={[
        {
          name: "sample_scanned_contract_large.pdf",
          url: "/test-files/sample_scanned_contract_large.pdf",
          label: "📄 PDF to Convert (875 KB)",
          kind: "pdf",
        },
        {
          name: "portrait_curly_hair.jpg",
          url: "/test-files/portrait_curly_hair.jpg",
          label: "🖼️ Image to Convert (870 KB)",
          kind: "image",
        },
      ]}
    />
  );
}
