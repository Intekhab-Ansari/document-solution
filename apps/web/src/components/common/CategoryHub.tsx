"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrivacyBadge } from "@/components/common/PrivacyBadge";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ALL_TOOLS, CATEGORIES, ToolCategory, ToolDefinition } from "@/lib/registry/tools-registry";
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  Minimize2,
  Merge,
  Scissors,
  Layers,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  Scaling,
  RefreshCw,
  Lock,
  Unlock,
  FileCheck,
  FileCode,
  Sliders,
  Contrast,
  Wrench,
  PenTool,
} from "lucide-react";

// Icon resolution map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Minimize2,
  Merge,
  Scissors,
  Layers,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  Scaling,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ImageIcon,
  FileText,
  FileCode,
  Lock,
  Unlock,
  FileCheck,
  Zap,
  Sliders,
  Contrast,
  Wrench,
  PenTool,
};

interface CategoryHubProps {
  category: ToolCategory | ToolCategory[];
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
  sampleFiles?: { name: string; url: string; label: string; kind?: "pdf" | "image" }[];
  dropzoneTitle?: string;
  dropzoneDescription?: string;
  acceptMimeTypes?: string;
}

export function CategoryHub({
  category,
  title,
  subtitle,
  badge = "100% In-Browser",
  icon,
  sampleFiles,
  dropzoneTitle = "Drop file here to start",
  dropzoneDescription = "Zero cloud uploads. Your documents never leave your browser.",
  acceptMimeTypes = "*/*",
}: CategoryHubProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categoriesList = Array.isArray(category) ? category : [category];

  // Get all tools belonging to this category / these categories
  const categoryTools = useMemo(() => {
    return ALL_TOOLS.filter((t) => categoriesList.includes(t.category));
  }, [categoriesList]);

  // Extract unique tag filters
  const filterTags = useMemo(() => {
    const set = new Set<string>();
    categoryTools.forEach((t) => {
      if (t.badge) set.add(t.badge);
    });
    return ["All", ...Array.from(set)];
  }, [categoryTools]);

  // Filter tools by search and tag
  const filteredTools = useMemo(() => {
    return categoryTools.filter((tool) => {
      const matchesSearch =
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        activeFilter === "All" ||
        tool.badge === activeFilter ||
        tool.tags.includes(activeFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [categoryTools, searchQuery, activeFilter]);

  const handleFileDropped = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    // Automatically route to first primary tool in category
    if (categoryTools.length > 0) {
      router.push(categoryTools[0].href);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* 1. Category Hero Banner with Aurora Glow */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-zinc-800/80">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-emerald-400 font-semibold">{title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {badge}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {categoryTools.length} Tools Available
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl shrink-0">
                  {icon}
                </div>
                <span>{title}</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="shrink-0">
              <PrivacyBadge />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Dropzone (Optional) */}
      {sampleFiles && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <FileDropzone
            accept={acceptMimeTypes}
            onFilesSelected={handleFileDropped}
            title={dropzoneTitle}
            description={dropzoneDescription}
            sampleFiles={sampleFiles}
          />
        </section>
      )}

      {/* 3. Search and Category Filter Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          {/* Tag Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tag
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${categoryTools.length} tools...`}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Tools Grid */}
        <div className="pt-8">
          {filteredTools.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Search className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-white font-bold text-lg">No tools found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-zinc-500">Try adjusting your search query or reset the filter pill.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold border border-zinc-800"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.map((tool) => {
                const IconComponent = ICON_MAP[tool.iconName] || FileText;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group relative flex flex-col p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg ${tool.accentColor}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {tool.badge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6 flex-1">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60 text-xs">
                      <span className="text-[11px] font-medium text-zinc-500">
                        100% Client-Side
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-400 text-xs group-hover:translate-x-1 transition-transform">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Explore Other Category Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white">Explore More Tool Suites</h2>
          <p className="text-xs sm:text-sm text-zinc-400">Discover all 30+ privacy-first offline engineering tools.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/pdf"
            className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-center transition-all group"
          >
            <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-white">PDF Tools Hub</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Compress, Merge, Edit</p>
          </Link>
          <Link
            href="/image"
            className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-center transition-all group"
          >
            <ImageIcon className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-white">Image Tools Hub</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Compress, Crop, Resize</p>
          </Link>
          <Link
            href="/security"
            className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-center transition-all group"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-white">Security & Sign Hub</h3>
            <p className="text-[11px] text-zinc-500 mt-1">E-Sign, Metadata, Protect</p>
          </Link>
          <Link
            href="/convert"
            className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-center transition-all group"
          >
            <RefreshCw className="w-6 h-6 text-violet-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-white">Converters Hub</h3>
            <p className="text-[11px] text-zinc-500 mt-1">PDF & Image Conversion</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
