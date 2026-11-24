import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Universal File Converter — Word, Excel, PDF, HEIC & Images Online",
  description:
    "Convert between PDF, Word (.docx), Excel (.xlsx), HTML, text, and images completely in your browser. Client-side WebAssembly conversion with zero cloud uploads.",
  keywords: [
    "word to pdf converter free",
    "docx to pdf online",
    "excel to pdf converter",
    "xlsx to pdf",
    "pdf to word converter",
    "pdf to excel csv",
    "html to pdf converter",
    "convert images to pdf",
    "pdf to jpg converter",
    "extract text from pdf ocr",
    "extract images from pdf zip",
    "free file converter online",
  ],
  alternates: {
    canonical: "https://intekedit.vercel.app/convert",
  },
  openGraph: {
    title: "Universal File Converter — Word, Excel, PDF, Images | IntekEdit",
    description:
      "Universal file converter running 100% in your browser. Convert documents and photos privately with zero file size upload caps.",
    url: "https://intekedit.vercel.app/convert",
  },
};

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
