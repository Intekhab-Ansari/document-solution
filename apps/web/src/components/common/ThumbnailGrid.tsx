"use client";

import React from "react";
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface ThumbnailItem {
  id: string;
  originalPageNumber: number;
  dataUrl?: string;
  rotation: number;
  selected?: boolean;
}

interface ThumbnailGridProps {
  items: ThumbnailItem[];
  selectable?: boolean;
  onSelectionChange?: (selectedPageNumbers: number[]) => void;
  onRotatePage?: (index: number) => void;
  onDeletePage?: (index: number) => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function ThumbnailGrid({
  items,
  selectable = false,
  onSelectionChange,
  onRotatePage,
  onDeletePage,
  onMovePage,
  className = "",
}: ThumbnailGridProps) {
  const toggleSelect = (pageNum: number) => {
    if (!selectable || !onSelectionChange) return;
    const isCurrentlySelected = items.find((it) => it.originalPageNumber === pageNum)?.selected;
    const nextSelected = items
      .filter((it) => (it.originalPageNumber === pageNum ? !isCurrentlySelected : it.selected))
      .map((it) => it.originalPageNumber);
    onSelectionChange(nextSelected);
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`group relative rounded-2xl border p-2 flex flex-col gap-2 transition-all duration-200 ${
              item.selected
                ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            {/* Header: Page badge + Selection Checkbox */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-medium text-zinc-400">
                Page {index + 1}
                {item.originalPageNumber !== index + 1 && (
                  <span className="text-[9px] text-zinc-500 ml-1">(Orig {item.originalPageNumber})</span>
                )}
              </span>

              {selectable && (
                <button
                  type="button"
                  onClick={() => toggleSelect(item.originalPageNumber)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    item.selected
                      ? "bg-emerald-500 border-emerald-400 text-zinc-950"
                      : "border-zinc-700 bg-zinc-800/80 text-transparent hover:border-zinc-500"
                  }`}
                  aria-label={`Select page ${index + 1}`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Thumbnail Canvas / Image */}
            <div
              onClick={() => selectable && toggleSelect(item.originalPageNumber)}
              className="relative aspect-[1/1.4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/60 flex items-center justify-center cursor-pointer"
            >
              {item.dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.dataUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                />
              ) : (
                <div className="text-[10px] text-zinc-600 animate-pulse">Rendering...</div>
              )}

              {/* Selection overlay */}
              {selectable && item.selected && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border-2 border-emerald-500 rounded-xl" />
              )}
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
              <div className="flex items-center gap-1">
                {onMovePage && (
                  <>
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMovePage(index, index - 1)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      title="Move Page Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMovePage(index, index + 1)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      title="Move Page Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {onRotatePage && (
                  <button
                    type="button"
                    onClick={() => onRotatePage(index)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {onDeletePage && items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeletePage(index)}
                  className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
