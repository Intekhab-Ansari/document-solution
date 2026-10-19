"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { extractImagesFromPdfZip } from "@/lib/pdf/pdf-advanced";
import { formatBytes } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  Image as ImageIcon,
  Download,
  RotateCcw,
  Sparkles,
  Archive,
  CheckCircle2,
} from "lucide-react";

export default function ExtractImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageCount, setImageCount] = useState<number>(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setProcessing(true);
    setProgress(10);
    setStatusMessage("Scanning document for embedded images...");

    try {
      const buffer = await f.arrayBuffer();
      const res = await extractImagesFromPdfZip(buffer, (cur, total) => {
        setProgress(Math.round(15 + (cur / total) * 80));
        setStatusMessage(`Extracting image from page ${cur} of ${total}...`);
      });

      setImageCount(res.count);
      setZipBlob(res.zipBlob);
      setProgress(100);
    } catch (err) {
      alert("Extraction failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}_extracted_images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Extract Images from PDF"
        description="Extract every embedded illustration and photo from your PDF and bundle into a clean ZIP archive. Zero loss, 100% in-browser."
        category="extract"
        categoryLabel="Extractors"
        icon={<ImageIcon className="w-5 h-5 text-blue-400" />}
        badge="Zero-Loss Raster Extractor"
        currentStep={!file ? 1 : !zipBlob ? 2 : 3}
      />

      {!zipBlob ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          title="Drop PDF here to extract images"
          description="Runs 100% inside your browser. No files are uploaded to remote servers."
          sampleFiles={[
            {
              name: "sample_invoice_small.pdf",
              url: "/test-files/sample_invoice_small.pdf",
              label: "Sample Invoice",
              kind: "pdf",
            },
          ]}
        />
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shadow-lg">
                <Archive className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>{imageCount} Images Extracted Successfully</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  From {file?.name} &bull; Archive size: {formatBytes(zipBlob.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadZip}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-500 hover:bg-blue-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <Download className="w-4 h-4" /> Download ZIP Archive
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setZipBlob(null);
                  setImageCount(0);
                }}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Extract another PDF"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Extracting Images"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
