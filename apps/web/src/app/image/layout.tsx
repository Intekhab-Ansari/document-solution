import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Target KB Image Compressor, HEIC to JPG & Photo Resizer",
  description:
    "Compress images to exact target sizes (50KB, 100KB, 200KB), resize pixels, crop aspect ratios, convert Apple HEIC/WebP to JPG, and strip EXIF GPS location metadata completely in your browser.",
  keywords: [
    "compress image to 50kb",
    "compress image to 100kb",
    "compress image to 200kb",
    "compress jpg to 20kb",
    "convert heic to jpg free",
    "heic to png",
    "resize photo online",
    "passport size photo maker",
    "crop image aspect ratio",
    "strip exif metadata",
    "remove gps location from photo",
    "photo privacy cleaner",
    "in browser image converter",
  ],
  alternates: {
    canonical: "https://intekedit.vercel.app/image",
  },
  openGraph: {
    title: "Free Target KB Image Compressor & HEIC Converter | IntekEdit",
    description:
      "Compress images to exact target KB, convert HEIC to JPG, resize, crop, and strip GPS metadata with 100% on-device processing. Zero uploads.",
    url: "https://intekedit.vercel.app/image",
  },
};

export default function ImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
