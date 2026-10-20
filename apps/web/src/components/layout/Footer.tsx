import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Cpu } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <BrandLogo size={32} showBadge={false} />
            </Link>
            <p className="text-zinc-400 leading-relaxed text-xs pr-4">
              A privacy-first, all-in-one document and image manipulation suite engineered for individuals and teams who care about sensitive data. Zero watermarks, zero forced signups, and local-first execution.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Default
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-cyan-400 text-[11px]">
                <Cpu className="w-3.5 h-3.5" /> WebAssembly & Workers
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px]">
                <Lock className="w-3.5 h-3.5" /> Zero File Retention
              </span>
            </div>
          </div>

          {/* Column 2: PDF Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px]">PDF Tools</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/pdf/compress" className="hover:text-white transition-colors">Target-Size Compress</Link></li>
              <li><Link href="/pdf/merge" className="hover:text-white transition-colors">Merge PDF</Link></li>
              <li><Link href="/pdf/split" className="hover:text-white transition-colors">Split & Extract</Link></li>
              <li><Link href="/pdf/reorder" className="hover:text-white transition-colors">Reorder & Delete Pages</Link></li>
              <li><Link href="/pdf/rotate" className="hover:text-white transition-colors">Rotate Pages</Link></li>
              <li><Link href="/pdf/pdf-to-images" className="hover:text-white transition-colors">PDF to Images</Link></li>
              <li><Link href="/pdf/images-to-pdf" className="hover:text-white transition-colors">Images to PDF</Link></li>
              <li><Link href="/pdf/page-numbers" className="hover:text-white transition-colors">Page Numbers</Link></li>
              <li><Link href="/pdf/watermark" className="hover:text-white transition-colors">Watermark PDF</Link></li>
              <li><Link href="/pdf/crop" className="hover:text-white transition-colors">Crop Margins</Link></li>
            </ul>
          </div>

          {/* Column 3: Image Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px]">Image Tools</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/image/compress" className="hover:text-white transition-colors">Exact Target KB Compress</Link></li>
              <li><Link href="/image/resize" className="hover:text-white transition-colors">Resize (Px, %, Presets)</Link></li>
              <li><Link href="/image/crop" className="hover:text-white transition-colors">Crop & Aspect Ratios</Link></li>
              <li><Link href="/image/rotate" className="hover:text-white transition-colors">Rotate & Mirror</Link></li>
              <li><Link href="/image/convert" className="hover:text-white transition-colors">Universal Converter (HEIC, WebP)</Link></li>
              <li><Link href="/image/metadata" className="hover:text-white transition-colors">EXIF & GPS Stripper</Link></li>
            </ul>
          </div>

          {/* Column 4: Privacy & Ethics */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold tracking-wider uppercase text-[11px]">Privacy & Trust</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors font-medium text-emerald-400">Privacy Guarantee</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security Architecture</Link></li>
              <li><span className="text-zinc-500">Zero Analytics on Document Text</span></li>
              <li><span className="text-zinc-500">No Ads &bull; No Watermarks</span></li>
              <li><span className="text-zinc-500">Commercial-Safe Open Source</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} EditAnything. Built with privacy and cryptographic transparency.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/security" className="hover:text-zinc-300 transition-colors">Security & Threat Model</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
