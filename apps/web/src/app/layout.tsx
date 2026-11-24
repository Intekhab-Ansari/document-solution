import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiAssistantModal } from "@/components/common/AiAssistantModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://intekedit.vercel.app"),
  title: {
    default: "IntekEdit — Free Online PDF Editor, Target KB Compressor & Image Suite",
    template: "%s | IntekEdit",
  },
  description:
    "Free, local-in-browser document and photo suite. Target-size PDF compression (100KB, 200KB, 500KB), PDF editor, merge, split, rotate, Word/Excel/HEIC converter, watermark, and digital signature with zero cloud uploads.",
  keywords: [
    // Target Size Compression
    "compress pdf to 100kb",
    "compress pdf to 200kb",
    "compress pdf to 500kb",
    "compress pdf exact size",
    "target size pdf compressor",
    "reduce pdf file size online free",
    "compress image to 50kb",
    "compress image to 100kb",
    "compress image to 200kb",
    "compress jpg to 20kb",
    "photo compressor target size",
    // PDF Editing & Forms
    "free online pdf editor",
    "edit pdf text online",
    "online pdf filler",
    "fill and sign pdf free",
    "draw on pdf",
    "whiteout pdf text",
    "type on pdf",
    "annotate pdf online",
    // Organizing & Manipulating
    "merge pdf free",
    "combine pdf files online",
    "split pdf pages",
    "extract pages from pdf",
    "reorder pdf pages",
    "rotate pdf permanently",
    "delete pages from pdf",
    "crop pdf pages",
    // Numbering & Watermark
    "add page numbers to pdf",
    "bates numbering pdf",
    "watermark pdf free",
    "stamp pdf online",
    "flatten pdf forms",
    "flatten pdf annotations",
    // Repair & Color
    "convert pdf to grayscale",
    "black and white pdf converter",
    "repair corrupted pdf online",
    "fix damaged pdf",
    // Security & Sign
    "protect pdf with password",
    "encrypt pdf aes 256",
    "unlock pdf password remover",
    "sign pdf digital signature free",
    "e-sign document online",
    "strip pdf metadata",
    // Image Tools
    "resize image pixels",
    "passport photo size editor",
    "crop image online",
    "convert heic to jpg",
    "heic to png converter",
    "webp to jpg converter",
    "png to jpg converter",
    "strip exif metadata",
    "remove gps from photo",
    "pdf to image converter",
    "pdf to jpg high quality",
    "images to pdf book",
    "jpg to pdf converter",
    // Universal Converters
    "word to pdf converter free",
    "docx to pdf online",
    "excel to pdf converter",
    "xlsx to pdf",
    "pdf to word converter",
    "pdf to excel csv",
    "html to pdf converter",
    "extract text from pdf ocr",
    "extract images from pdf zip",
    // Privacy & Platform
    "client side pdf editor",
    "zero upload document suite",
    "air gapped pdf tools",
    "in browser document editor",
    "intekedit",
    "intek edit",
    "intekedit document suite",
  ],
  authors: [{ name: "IntekEdit Team", url: "https://intekedit.vercel.app" }],
  creator: "IntekEdit",
  publisher: "IntekEdit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://intekedit.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "IntekEdit — Free Online PDF Editor, Target KB Compressor & Image Suite",
    description:
      "Edit, compress to target size (100KB, 200KB, 500KB), merge, split, convert Word/Excel/HEIC, and sign documents 100% on-device. Zero cloud uploads, zero data footprint.",
    url: "https://intekedit.vercel.app",
    siteName: "IntekEdit",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "IntekEdit Logo — Private PDF & Photo Suite",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntekEdit — Free Online PDF Editor & Target KB Compressor",
    description: "100% on-device PDF editor, target size compressor, image converter, and signer with zero server uploads.",
    images: ["/logo.png"],
  },
  verification: {
    google: "V8f0J8ZCCksA3QqysLVFYCU6PckCFFdtCt34JiR86vs",
  },
  category: "technology",
};

// Schema.org Structured Data for Google Search & Google Search Console
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IntekEdit",
  alternateName: ["Intek Edit", "IntekEdit Document & Photo Suite"],
  url: "https://intekedit.vercel.app",
  logo: {
    "@type": "ImageObject",
    url: "https://intekedit.vercel.app/logo.png",
    width: 512,
    height: 512,
  },
  image: "https://intekedit.vercel.app/logo.png",
  description:
    "Free, local-in-browser document and photo editor with zero server uploads.",
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IntekEdit",
  url: "https://intekedit.vercel.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://intekedit.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "IntekEdit",
  url: "https://intekedit.vercel.app",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All (Web Browser, Chrome, Firefox, Safari, Edge)",
  browserRequirements: "Requires WebAssembly & HTML5 Canvas support",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Compress PDF to exact target KB (100KB, 200KB, 500KB)",
    "Full vector PDF editor with text customization and ink annotations",
    "Merge and split PDF documents",
    "Convert Word DOCX, Excel XLSX to PDF",
    "Convert HEIC and WebP photos to JPG/PNG",
    "E-Sign PDF documents and protect with AES-256 passwords",
    "Strip EXIF GPS camera metadata for photo privacy",
    "100% On-Device WebAssembly execution with zero server uploads",
  ],
  author: {
    "@type": "Organization",
    name: "IntekEdit",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is IntekEdit completely free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, IntekEdit is 100% free with no file limits, no forced registrations, no watermarks, and no premium paywalls.",
      },
    },
    {
      "@type": "Question",
      name: "Are my PDF files or photos uploaded to any server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. IntekEdit operates with an air-gapped client-side architecture. All transformations, compression, conversions, and edits happen directly in your browser RAM using WebAssembly and Web Workers. Your files never touch a remote server.",
      },
    },
    {
      "@type": "Question",
      name: "How do I compress a PDF to an exact target size like 100KB or 200KB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your PDF to IntekEdit Compress PDF, select 'Target Size' mode, enter your desired file size (e.g. 100KB, 200KB, or 500KB), and our iterative binary search compression engine will automatically hit the exact target limit required by government portals and job applications.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert HEIC photos from iPhone to JPG on IntekEdit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, IntekEdit includes a built-in Universal Image Converter that converts Apple HEIC/HEIF images to standard high-quality JPG, PNG, or WebP completely in your browser without quality loss.",
      },
    },
    {
      "@type": "Question",
      name: "Can I edit text and sign PDF documents online for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, IntekEdit Edit PDF Studio allows you to modify existing text, whiteout sections, customize font colors, draw signatures, and add stamps directly onto your PDF pages.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="V8f0J8ZCCksA3QqysLVFYCU6PckCFFdtCt34JiR86vs" />
        {/* Google Search Console & Google Search Favicon declarations */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Organization & WebSite Logo Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden w-full max-w-full"
      >
        <Navbar />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
        <Footer />
        <AiAssistantModal />
      </body>
    </html>
  );
}
