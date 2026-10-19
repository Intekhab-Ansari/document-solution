"use client";

import React from "react";
import { CategoryHub } from "@/components/common/CategoryHub";
import { Image as ImageIcon } from "lucide-react";

export default function ImageToolsPage() {
  return (
    <CategoryHub
      category="image"
      title="All Image Tools"
      subtitle="Compress images to exact KB limits, resize pixels with smart aspect ratios, crop, rotate, convert modern formats (incl. Apple HEIC), and strip private EXIF/GPS metadata."
      badge="Client-Side Image Studio"
      icon={<ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />}
      acceptMimeTypes="image/*,.heic,.heif,.avif,.webp"
      dropzoneTitle="Drop any image or photo here"
      dropzoneDescription="Supports JPG, PNG, WebP, AVIF, and iPhone HEIC photos."
      sampleFiles={[
        {
          name: "portrait_curly_hair.jpg",
          url: "/test-files/portrait_curly_hair.jpg",
          label: "🖼️ Portrait Photo (870 KB)",
          kind: "image",
        },
        {
          name: "portrait_with_exif_gps.jpg",
          url: "/test-files/portrait_with_exif_gps.jpg",
          label: "📍 Photo with EXIF GPS (871 KB)",
          kind: "image",
        },
      ]}
    />
  );
}
