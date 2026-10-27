"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOOLS, ToolDefinition } from "@/lib/registry/tools-registry";
import {
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FolderOpen,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tools with compact slice so it never takes over full screen
  const filteredTools = ALL_TOOLS.filter((tool) => {
    if (selectedCategory !== "all" && tool.category !== selectedCategory) {
      return false;
    }

    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.categoryLabel.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  // Auto focus input when opened & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedCategory("all");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTools.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          const target = filteredTools[selectedIndex];
          onClose();
          router.push(target.href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredTools, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3.5 sm:px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Search Modal Card: compact width & controlled height */}
      <div className="relative w-full max-w-lg sm:max-w-xl bg-zinc-950/95 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(16,185,129,0.12)] overflow-hidden z-10 flex flex-col max-h-[60vh] sm:max-h-[70vh] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
        {/* Glowing top accent border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400/60 via-teal-400/60 to-transparent shrink-0" />

        {/* Search Header Bar with Input, Clear button & Always-Visible Close (X) button */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 30+ PDF & image tools..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none font-medium"
          />

          {/* Clear query button if user typed something */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer"
              title="Clear input"
            >
              Clear
            </button>
          )}

          {/* Dedicated, always-visible Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95 shadow-sm"
            aria-label="Close search"
            title="Close search (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 border-b border-zinc-900 bg-zinc-950/70 overflow-x-auto scrollbar-none shrink-0 text-xs">
          {[
            { id: "all", label: "All Tools" },
            { id: "pdf", label: "PDF" },
            { id: "image", label: "Images" },
            { id: "convert", label: "Convert" },
            { id: "security", label: "Security" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List: compact row density to prevent screen takeover */}
        <div className="overflow-y-auto p-2 sm:p-2.5 space-y-1 scrollbar-none max-h-[260px] sm:max-h-[320px]">
          {filteredTools.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <FolderOpen className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
              <p className="text-xs sm:text-sm font-medium">No tools found matching &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-zinc-600 mt-1">Try searching for &ldquo;compress&rdquo;, &ldquo;pdf&rdquo;, or &ldquo;merge&rdquo;</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onClose();
                    router.push(tool.href);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800/90 text-white shadow-md border border-zinc-700/60"
                      : "text-zinc-300 hover:bg-zinc-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-white truncate">
                          {tool.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider shrink-0">
                          {tool.categoryLabel}
                        </span>
                        {tool.badge && (
                          <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 hidden sm:inline">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-zinc-400 truncate max-w-[200px] sm:max-w-md">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-emerald-400 translate-x-0.5" : "text-zinc-600"}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts: compact & responsive */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2 bg-zinc-950 border-t border-zinc-900 text-[10.5px] text-zinc-500 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[9px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[9px]">↵</kbd>
              <span>open</span>
            </span>
          </div>
          <span className="sm:hidden text-zinc-500 text-[10px]">
            Tap any tool to open
          </span>
          <span className="text-emerald-400/80 font-medium flex items-center gap-1.5 text-[10px] sm:text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Client-Side Search
          </span>
        </div>
      </div>
    </div>
  );
}
