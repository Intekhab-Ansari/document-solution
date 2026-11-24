import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Security & Digital Trust — Sign, Protect AES-256 & Unlock PDF",
  description:
    "Secure, sign, and protect your PDF documents. Draw or type digital signatures, encrypt with military-grade AES-256 passwords, unlock protected files, and strip sensitive metadata 100% on-device.",
  keywords: [
    "sign pdf online free",
    "digital signature pdf",
    "e-sign document online",
    "protect pdf password",
    "encrypt pdf aes 256",
    "unlock pdf password remover",
    "flatten pdf annotations",
    "strip exif metadata",
    "secure pdf converter",
  ],
  alternates: {
    canonical: "https://intekedit.vercel.app/security",
  },
  openGraph: {
    title: "Document Security & Digital Trust — Sign & Protect PDF | IntekEdit",
    description:
      "Military-grade client-side PDF encryption, e-signatures, password removal, and metadata scrubbing with zero cloud tracking.",
    url: "https://intekedit.vercel.app/security",
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
