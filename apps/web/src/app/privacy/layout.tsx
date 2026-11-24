import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Air-Gapped Privacy Architecture & Security Guarantee",
  description:
    "Learn how IntekEdit guarantees zero document uploads, zero tracking, and complete privacy sovereignty through client-side WebAssembly execution.",
  keywords: [
    "privacy policy",
    "client side processing",
    "zero upload guarantee",
    "air gapped architecture",
    "private pdf editor",
    "secure document processing",
  ],
  alternates: {
    canonical: "https://intekedit.vercel.app/privacy",
  },
  openGraph: {
    title: "Air-Gapped Privacy Architecture & Security Guarantee | IntekEdit",
    description:
      "Zero cloud uploads, zero database writes, and zero analytics on file contents. Discover how our browser-native engine protects your documents.",
    url: "https://intekedit.vercel.app/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
