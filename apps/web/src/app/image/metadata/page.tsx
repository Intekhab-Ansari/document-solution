"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { extractExifMetadata, stripImageMetadata, ParsedExifData } from "@/lib/image/image-exif";
import { decodeHeicIfApplicable } from "@/lib/image/image-convert";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { ShieldCheck, ShieldAlert, Trash2, Download, RefreshCw, MapPin, Camera, Calendar, CheckCircle2 } from "lucide-react";

export default function MetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<ParsedExifData | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [strippedResult, setStrippedResult] = useState<{ blob: Blob; dataUrl: string; savingsBytes: number; newSize: number } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setStrippedResult(null);

    const decoded = await decodeHeicIfApplicable(selected);
    setOriginalDataUrl(URL.createObjectURL(decoded));

    // Parse EXIF
    const parsed = await extractExifMetadata(decoded);
    setExif(parsed);
  };

  const handleStrip = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const res = await stripImageMetadata(file);
      setStrippedResult(res);
    } catch (err) {
      console.error(err);
      alert("Error stripping metadata: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <ToolWorkspaceHeader
        title="Image Metadata & EXIF Stripper"
        description="Inspect hidden camera serial numbers, dates, and GPS coordinates embedded in your photos, and strip them with one click before sharing online."
        category="image"
        categoryLabel="Image Tools"
        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        badge="Zero Cloud Leak"
        currentStep={!file ? 1 : !strippedResult ? 2 : 3}
      />

      {!file ? (
        <div className="max-w-2xl mx-auto">
          <FileDropzone
            accept="image/*,.heic,.heif,.png,.jpg,.jpeg,.webp,.avif,*/*"
            onFilesSelected={handleFileSelected}
            title="Drop photo to inspect and strip metadata"
            description="Audit GPS locations and camera details in seconds."
            sampleFiles={[
              {
                name: "portrait_with_exif_gps.jpg",
                url: "/test-files/portrait_with_exif_gps.jpg",
                label: "📍 Photo with EXIF GPS (871 KB)",
                kind: "image",
              },
              {
                name: "portrait_curly_hair.jpg",
                url: "/test-files/portrait_curly_hair.jpg",
                label: "🖼️ Curly Hair Portrait (870 KB)",
                kind: "image",
              },
            ]}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-white">{file.name} ({formatBytes(file.size)})</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setExif(null);
                setStrippedResult(null);
              }}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          </div>

          {/* Privacy Alert Banner if GPS found */}
          {exif?.hasGpsData && !strippedResult && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong className="font-bold text-white block">GPS Location Found in Photo!</strong>
                <span>Coordinates: {exif.gps?.latitude}, {exif.gps?.longitude}. Anyone viewing this file can trace where it was taken.</span>
              </div>
            </div>
          )}

          {/* EXIF Inspector Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" /> Embedded Metadata Audit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase font-sans">Camera Make</span>
                <span className="text-white font-medium">{exif?.make || "Not specified / Clean"}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase font-sans">Camera Model</span>
                <span className="text-white font-medium">{exif?.model || "Not specified / Clean"}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase font-sans">Date Taken</span>
                <span className="text-white font-medium">{exif?.dateTime || "Not recorded / Clean"}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase font-sans">Editing Software</span>
                <span className="text-white font-medium">{exif?.software || "None detected"}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 sm:col-span-2">
                <span className="text-zinc-500 block text-[10px] uppercase font-sans flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> GPS Geolocation
                </span>
                <span className={`font-medium ${exif?.hasGpsData ? "text-rose-400 font-bold" : "text-emerald-400"}`}>
                  {exif?.hasGpsData ? `${exif.gps?.latitude}, ${exif.gps?.longitude}` : "No GPS data detected (Safe)"}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            {!strippedResult ? (
              <button
                type="button"
                onClick={handleStrip}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Strip All EXIF & GPS Metadata Now</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All EXIF tags, GPS coords, and camera traces permanently removed! Clean file size: {formatBytes(strippedResult.newSize)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadBlob(strippedResult.blob, `clean_${file.name}`)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Clean Photo ({formatBytes(strippedResult.newSize)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={100}
        stage="Stripping metadata markers..."
        title="Sanitizing image..."
      />
    </div>
  );
}
