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
  title: "IntekEdit — Privacy-First All-in-One PDF & Image Engineering",
  description:
    "Free, local-in-browser document and photo editor. Target-size PDF & image compression, merge, split, rotate, convert, watermark, and strip EXIF metadata without cloud uploads.",
  keywords: [
    "pdf compress target size",
    "merge pdf free",
    "strip exif metadata",
    "client side pdf editor",
    "image to pdf",
    "heic converter",
    "intekedit",
  ],
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
    title: "IntekEdit — Privacy-First All-in-One PDF & Image Engineering",
    description:
      "Free, local-in-browser document and photo editor. Target-size PDF & image compression, merge, split, rotate, convert, watermark, and strip EXIF metadata without cloud uploads.",
    url: "https://intekedit.vercel.app",
    siteName: "IntekEdit",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "IntekEdit Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IntekEdit — Privacy-First All-in-One PDF & Image Engineering",
    description: "Free, local-in-browser document and photo editor with zero server uploads.",
    images: ["/logo.png"],
  },
  verification: {
    google: "V8f0J8ZCCksA3QqysLVFYCU6PckCFFdtCt34JiR86vs",
  },
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
