"use client";

import React, { useState } from "react";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ToolWorkspaceHeader } from "@/components/common/ToolWorkspaceHeader";
import { PdfEditingSidebar } from "@/components/layout/PdfEditingSidebar";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBuffer } from "@/lib/utils";
import { getPdfInfo, updatePdfMetadata } from "@/lib/pdf/pdf-manipulate";
import {
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function PdfMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);

  // Metadata Fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [editedPdfBytes, setEditedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setEditedPdfBytes(null);

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setFileBytes(bytes);

      const info = await getPdfInfo(bytes);
      setPageCount(info.pageCount);
      setTitle(info.title || "");
      setAuthor(info.author || "");
      setCreator(info.creator || "");
      setProducer(info.producer || "");
    } catch (err) {
      console.error(err);
      alert("Error loading PDF: " + (err as Error).message);
    }
  };

  const handleWipeAll = () => {
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
    setCreator("");
    setProducer("");
  };

  const handleSave = async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    setProgress({ percent: 30, stage: "Updating PDF metadata tags..." });

    try {
      const kwArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const result = await updatePdfMetadata(fileBytes, {
        title,
        author,
        subject,
        keywords: kwArray,
        creator,
        producer,
      });

      setEditedPdfBytes(result);
      setProgress({ percent: 100, stage: "Complete!" });
    } catch (err) {
      console.error(err);
      alert("Error updating metadata: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    downloadBuffer(editedPdfBytes, `${baseName}_metadata_updated.pdf`, "application/pdf");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950">
      <div className="px-4 py-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-900/40">
        <ToolWorkspaceHeader
          title="PDF Metadata Editor & Sanitizer"
          description="View, edit, or wipe hidden document properties (Title, Author, Creator, Software Producer tags) to safeguard privacy."
          category="security"
          categoryLabel="Security & Privacy"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          badge="100% Client-Side"
          currentStep={!file ? 1 : !editedPdfBytes ? 2 : 3}
        />
      </div>

      {!file ? (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
          <FileDropzone
            accept="*/*"
            onFilesSelected={handleFileSelected}
            title="Drop PDF to inspect & edit metadata"
            description="Examine hidden author tags, software signatures, or sanitize them completely."
            sampleFiles={[
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 Sample Invoice (2 KB)",
                kind: "pdf",
              },
            ]}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <PdfEditingSidebar
            activeToolId="metadata"
            fileName={file.name}
            fileSize={file.size}
            pageCount={pageCount}
            onChangeFile={() => setFile(null)}
          />

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Document Properties & Metadata Tags
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Edit properties or click Sanitize to wipe all identifiers clean before sharing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleWipeAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 flex items-center gap-1.5 transition-all"
                  title="Clear all fields"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sanitize & Wipe All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q4 Financial Audit Report"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Author / Signer</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Enterprise Security"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="invoice, client, report, confidential"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Application / Creator</label>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="e.g. EditAnything Studio"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">PDF Producer Engine</label>
                  <input
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    placeholder="e.g. PDF-Lib Engine"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-400">
                <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>
                  Metadata is embedded in the PDF dictionary stream. Sanitizing wipes original software footprints and author names before external distribution.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                {!editedPdfBytes ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-zinc-950" />
                    <span>Apply Metadata Changes</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Sanitized PDF ({formatBytes(editedPdfBytes.byteLength)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Sanitizing Metadata..."
      />
    </div>
  );
}
