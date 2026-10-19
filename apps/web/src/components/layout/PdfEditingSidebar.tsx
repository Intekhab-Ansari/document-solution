"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PenTool,
  Minimize2,
  Merge,
  Scissors,
  Layers,
  RotateCw,
  FileText,
  FileCheck,
  Type,
  Stamp,
  Crop,
  ShieldCheck,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Sparkles,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface PdfSidebarItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  category: "edit" | "organize" | "optimize";
}

const SIDEBAR_TOOLS: PdfSidebarItem[] = [
  // 1. Edit & Annotate
  {
    id: "edit",
    name: "Edit PDF (Text & Colors)",
    href: "/pdf/edit",
    icon: PenTool,
    badge: "FULL STUDIO",
    category: "edit",
  },
  {
    id: "sign",
    name: "E-Sign & Stamp",
    href: "/security/sign",
    icon: FileCheck,
    badge: "AIR-GAPPED",
    category: "edit",
  },
  {
    id: "watermark",
    name: "Watermark",
    href: "/pdf/watermark",
    icon: Stamp,
    category: "edit",
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    href: "/pdf/page-numbers",
    icon: Type,
    category: "edit",
  },
  {
    id: "metadata",
    name: "Edit Metadata",
    href: "/pdf/metadata",
    icon: ShieldCheck,
    category: "edit",
  },
  {
    id: "protect",
    name: "Protect (Password)",
    href: "/security/protect",
    icon: Lock,
    category: "edit",
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    href: "/security/unlock",
    icon: Unlock,
    category: "edit",
  },

  // 2. Organize & Layout
  {
    id: "reorder",
    name: "Reorder & Delete",
    href: "/pdf/reorder",
    icon: Layers,
    category: "organize",
  },
  {
    id: "rotate",
    name: "Rotate Pages",
    href: "/pdf/rotate",
    icon: RotateCw,
    category: "organize",
  },
  {
    id: "split",
    name: "Split & Extract",
    href: "/pdf/split",
    icon: Scissors,
    category: "organize",
  },
  {
    id: "crop",
    name: "Crop Margins",
    href: "/pdf/crop",
    icon: Crop,
    category: "organize",
  },
  {
    id: "merge",
    name: "Merge PDF",
    href: "/pdf/merge",
    icon: Merge,
    category: "organize",
  },

  // 3. Optimize & Convert
  {
    id: "compress",
    name: "Target KB Compress",
    href: "/pdf/compress",
    icon: Minimize2,
    badge: "TARGET KB",
    category: "optimize",
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    href: "/pdf/pdf-to-images",
    icon: ImageIcon,
    category: "optimize",
  },
  {
    id: "extract-text",
    name: "Extract Text",
    href: "/extract/text",
    icon: FileText,
    category: "optimize",
  },
];

interface PdfEditingSidebarProps {
  activeToolId?: string;
  fileName?: string;
  fileSize?: number;
  pageCount?: number;
  onChangeFile?: () => void;
  className?: string;
}

export function PdfEditingSidebar({
  activeToolId = "edit",
  fileName,
  fileSize,
  pageCount,
  onChangeFile,
  className = "",
}: PdfEditingSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-zinc-950/90 border-r border-zinc-800/80 backdrop-blur-xl transition-all duration-300 z-20 shrink-0 ${
        collapsed ? "w-16" : "w-64 sm:w-72"
      } ${className}`}
    >
      {/* Sidebar Header: File Status / Collapse toggle */}
      <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate max-w-[150px]">
                {fileName || "Document Loaded"}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {pageCount ? `${pageCount} pages` : "Ready"}
                {fileSize ? ` • ${formatBytes(fileSize)}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Change File button if callback provided */}
      {onChangeFile && !collapsed && (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onChangeFile}
            className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Change Active File</span>
          </button>
        </div>
      )}

      {/* Tools Navigation Section */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Section 1: Edit & Annotate */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Edit & Annotate
            </p>
          )}
          {SIDEBAR_TOOLS.filter((t) => t.category === "edit").map((tool) => {
            const Icon = tool.icon;
            const isActive = activeToolId === tool.id;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900/90"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={tool.name}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-emerald-400"}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{tool.name}</span>
                    {tool.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isActive
                            ? "bg-zinc-950/20 text-zinc-950"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section 2: Organize & Layout */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Organize & Layout
            </p>
          )}
          {SIDEBAR_TOOLS.filter((t) => t.category === "organize").map((tool) => {
            const Icon = tool.icon;
            const isActive = activeToolId === tool.id;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900/90"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={tool.name}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-cyan-400"}`} />
                {!collapsed && <span className="truncate">{tool.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Section 3: Optimize & Export */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Optimize & Convert
            </p>
          )}
          {SIDEBAR_TOOLS.filter((t) => t.category === "optimize").map((tool) => {
            const Icon = tool.icon;
            const isActive = activeToolId === tool.id;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900/90"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={tool.name}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-indigo-400"}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{tool.name}</span>
                    {tool.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-zinc-800 text-zinc-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Air-Gapped Trust Indicator */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-[10px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium truncate">100% In-Browser Memory</span>
          </div>
        ) : (
          <div className="flex justify-center text-emerald-400" title="100% In-Browser Memory">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </aside>
  );
}
