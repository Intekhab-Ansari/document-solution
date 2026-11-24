import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online PDF Tools — Edit, Compress, Merge & Convert PDF",
  description:
    "Complete suite of free in-browser PDF tools. Compress to exact KB (100KB, 200KB), edit text, merge, split, rotate, add page numbers, watermark, flatten, and repair PDFs with zero server uploads.",
  keywords: [
    "free pdf tools",
    "online pdf editor",
    "compress pdf to 100kb",
    "compress pdf to 200kb",
    "merge pdf files",
    "split pdf pages",
    "rotate pdf online",
    "reorder pdf pages",
    "add page numbers to pdf",
    "watermark pdf free",
    "flatten pdf forms",
    "convert pdf to grayscale",
    "repair pdf online",
    "private pdf editor",
  ],
  alternates: {
    canonical: "https://intekedit.vercel.app/pdf",
  },
  openGraph: {
    title: "Free Online PDF Tools — Edit, Compress, Merge & Convert PDF | IntekEdit",
    description:
      "All-in-one client-side PDF utility suite. Compress to target KB, edit, merge, split, rotate, and secure PDFs directly in your browser. 100% private.",
    url: "https://intekedit.vercel.app/pdf",
  },
};

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
