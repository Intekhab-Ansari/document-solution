"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { extractTextFromPdf } from "@/lib/pdf/pdf-advanced";
import { formatBytes } from "@/lib/utils";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import {
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function ExtractTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pageTexts, setPageTexts] = useState<{ page: number; text: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setProcessing(true);
    setProgress(15);
    setStatusMessage("Parsing PDF font mappings...");

    try {
      const buffer = await f.arrayBuffer();
      const res = await extractTextFromPdf(buffer, (cur, total) => {
        setProgress(Math.round(20 + (cur / total) * 75));
        setStatusMessage(`Extracting page ${cur} of ${total}...`);
      });

      setExtractedText(res.fullText);
      setPageTexts(res.pageTexts);
      setProgress(100);
    } catch (err) {
      alert("Extraction failed: " + (err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md") => {
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}_extracted.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Guided Workspace Header */}
      <ToolWorkspaceHeader
        title="Extract Text from PDF"
        description="Pull all unicode text streams from your document with paragraph spacing preservation. 1-click clipboard copy and markdown export."
        category="extract"
        categoryLabel="Extractors"
        icon={<FileText className="w-5 h-5 text-teal-400" />}
        badge="Zero-Loss Unicode Extraction"
        currentStep={!file ? 1 : !extractedText ? 2 : 3}
      />

      {!extractedText ? (
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          title="Drop PDF here to extract text"
          description="Everything runs in your browser. No files or text ever leave your computer."
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
          {/* Action Ribbon */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
                {pageTexts.length}p
              </div>
              <div>
                <p className="font-bold text-white text-sm">{file?.name}</p>
                <p className="text-zinc-400 text-xs">
                  {pageTexts.length} {pageTexts.length === 1 ? "page" : "pages"} &bull;{" "}
                  {extractedText.length.toLocaleString()} characters extracted
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 transition-colors border border-zinc-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy All Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload("txt")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-zinc-950 flex items-center gap-1.5 transition-colors shadow-md shadow-teal-500/20"
              >
                <Download className="w-4 h-4" /> Download .TXT
              </button>

              <button
                type="button"
                onClick={() => handleDownload("md")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors border border-zinc-700"
              >
                <Download className="w-4 h-4" /> Download .MD
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setExtractedText("");
                  setPageTexts([]);
                }}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Output Box */}
          <div className="border border-zinc-800 rounded-3xl bg-zinc-950 p-6 overflow-hidden shadow-2xl">
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-[500px] bg-transparent text-zinc-200 text-xs sm:text-sm font-mono leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={processing}
        title="Extracting Text"
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
