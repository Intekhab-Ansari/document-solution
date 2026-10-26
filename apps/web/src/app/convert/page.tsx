"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDropzone } from "@/components/common/FileDropzone";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { ProgressModal } from "@/components/common/ProgressModal";
import { formatBytes, downloadBlob } from "@/lib/utils";
import {
  getFileCategory,
  getCompatibleTargetFormats,
  convertAnyFile,
  TargetFormatOption,
  ConvertedResult,
} from "@/lib/convert/universal-converter";
import {
  RefreshCw,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Archive,
  ExternalLink,
} from "lucide-react";

export default function UniversalConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<TargetFormatOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: "" });
  const [result, setResult] = useState<ConvertedResult | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setResult(null);

    const compatible = getCompatibleTargetFormats(selected);
    setSelectedTarget(compatible[0] || null);
  };

  const handleConvert = async () => {
    if (!file || !selectedTarget) return;
    setIsProcessing(true);
    setProgress({ percent: 10, stage: `Preparing ${file.name}...` });

    try {
      const res = await convertAnyFile(file, selectedTarget.id, (percent, stage) => {
        setProgress({ percent, stage });
      });
      setResult(res);
      setProgress({ percent: 100, stage: "Conversion completed!" });
    } catch (err) {
      console.error(err);
      alert("Conversion error: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fileInfo = file ? getFileCategory(file) : null;
  const compatibleTargets = file ? getCompatibleTargetFormats(file) : [];

  const getSourceIcon = (cat: string) => {
    switch (cat) {
      case "word":
        return <FileText className="w-5 h-5 text-blue-400" />;
      case "excel":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case "text":
      case "html":
        return <FileCode className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14 space-y-10">
      {/* Title & Privacy Badge Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          <PrivacyBadge />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Universal Any-File Converter
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Convert Word documents, Excel spreadsheets, PDFs, images, text, and HTML into any format. Fast, lossless, and processed 100% locally on your device.
        </p>
      </div>

      {!file ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <FileDropzone
            accept=".docx,.doc,.xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp,.avif,.heic,.heif,.txt,.md,.html,*/*"
            onFilesSelected={handleFileSelected}
            title="Drop ANY file to convert"
            description="Word, Excel, PDF, PNG, JPG, WebP, HEIC, Text, or HTML."
            sampleFiles={[
              {
                name: "sample_invoice_small.pdf",
                url: "/test-files/sample_invoice_small.pdf",
                label: "📄 PDF to Word/Image (2.1 KB)",
                kind: "pdf",
              },
              {
                name: "sample_scanned_contract_large.pdf",
                url: "/test-files/sample_scanned_contract_large.pdf",
                label: "📄 Heavy PDF to Convert (875 KB)",
                kind: "pdf",
              },
              {
                name: "portrait_curly_hair.jpg",
                url: "/test-files/portrait_curly_hair.jpg",
                label: "🖼️ Photo to PDF/WebP (870 KB)",
                kind: "image",
              },
            ]}
          />

          {/* Quick Matrix Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-bold text-blue-400">Word (DOCX)</span>
              <p className="text-[10px] text-zinc-500">➔ PDF, TXT, HTML</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-400">Excel (XLSX, CSV)</span>
              <p className="text-[10px] text-zinc-500">➔ PDF Table, CSV, JSON</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-bold text-rose-400">PDF Documents</span>
              <p className="text-[10px] text-zinc-500">➔ Word, Excel, Images, TXT</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-bold text-cyan-400">Images (All)</span>
              <p className="text-[10px] text-zinc-500">➔ PDF, WebP, PNG, JPG</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top File Summary Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                {fileInfo ? getSourceIcon(fileInfo.category) : <Layers className="w-5 h-5 text-zinc-400" />}
              </div>
              <div className="truncate">
                <div className="font-bold text-white text-sm truncate max-w-xs sm:max-w-md">{file.name}</div>
                <div className="text-zinc-400 text-[11px] flex items-center gap-2">
                  <span className="font-mono uppercase text-emerald-400 font-semibold">{fileInfo?.ext}</span>
                  <span>&bull;</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>&bull;</span>
                  <span className="text-zinc-500">Detected: {fileInfo?.category.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSelectedTarget(null);
                setResult(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          {/* Target Format Selection & Action Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Select Output Format
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                Convert <span className="text-zinc-400">{file.name}</span> into:
              </h2>
            </div>

            {/* Target Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {compatibleTargets.map((target) => {
                const isSelected = selectedTarget?.id === target.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => {
                      setSelectedTarget(target);
                      setResult(null);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10 text-white"
                        : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{target.name}</span>
                        <span className="text-[10px] font-mono uppercase font-semibold text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          .{target.extension}
                        </span>
                      </div>
                      {target.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                          {target.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {target.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Convert & Download Action */}
            <div className="pt-4 border-t border-zinc-800/80">
              {!result ? (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!selectedTarget || isProcessing}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>
                    Convert to {selectedTarget?.name || "Format"} Now
                  </span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{result.filename}</div>
                      <div className="text-emerald-400 text-xs">
                        Ready for download &bull; {formatBytes(result.sizeBytes)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadBlob(result.blob, result.filename)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.filename}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust & Local Processing Guarantee Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/70 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">100% In-Browser Conversion</span>
            <span className="text-zinc-400">Zero files ever leave your device. All parsing and encoding runs in local memory.</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">No Document Alteration</span>
            <span className="text-zinc-400">High-fidelity text, layout, and table structure preservation without watermarks.</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Archive className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Cross-Platform Open Standards</span>
            <span className="text-zinc-400">Generates compliant PDF, Microsoft OpenXML (.docx), and CSV standards.</span>
          </div>
        </div>
      </div>

      <ProgressModal
        isOpen={isProcessing}
        percent={progress.percent}
        stage={progress.stage}
        title="Converting document..."
      />
    </div>
  );
}
