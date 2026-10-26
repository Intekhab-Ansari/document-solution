"use client";

import React, { useState, useEffect, useRef } from "react";
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Check, FileText } from "lucide-react";

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
  onRequestThumbnail?: (originalPageNumber: number) => Promise<string | undefined>;
  className?: string;
}

interface CardProps {
  item: ThumbnailItem;
  index: number;
  selectable: boolean;
  onToggleSelect: (pageNum: number) => void;
  onRequestThumbnail?: (originalPageNumber: number) => Promise<string | undefined>;
  onRotatePage?: (index: number) => void;
  onDeletePage?: (index: number) => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  isFirst: boolean;
  isLast: boolean;
  totalItems: number;
}

function ThumbnailCard({
  item,
  index,
  selectable,
  onToggleSelect,
  onRequestThumbnail,
  onRotatePage,
  onDeletePage,
  onMovePage,
  isFirst,
  isLast,
  totalItems,
}: CardProps) {
  const [dataUrl, setDataUrl] = useState<string | undefined>(item.dataUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync if parent updates dataUrl directly
  useEffect(() => {
    if (item.dataUrl) {
      setDataUrl(item.dataUrl);
    }
  }, [item.dataUrl]);

  // Lazy Intersection Observer: Only request thumbnail when scrolled in or near viewport
  useEffect(() => {
    if (dataUrl || !onRequestThumbnail || isLoading || hasFailed) return;

    const currentEl = cardRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoading(true);
          onRequestThumbnail(item.originalPageNumber)
            .then((url) => {
              if (url) {
                setDataUrl(url);
              }
            })
            .catch((err) => {
              console.warn(`Could not render thumbnail for page ${item.originalPageNumber}`, err);
              setHasFailed(true);
            })
            .finally(() => {
              setIsLoading(false);
            });
          observer.disconnect();
        }
      },
      { rootMargin: "350px" } // Pre-render 350px before entering viewport
    );

    observer.observe(currentEl);
    return () => observer.disconnect();
  }, [dataUrl, onRequestThumbnail, item.originalPageNumber, isLoading, hasFailed]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl border p-2 flex flex-col gap-2 transition-all duration-200 select-none ${
        item.selected
          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/15"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      {/* Header: Page badge + Selection Checkbox */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-medium text-zinc-300 flex items-center gap-1">
          <span className="text-zinc-500">#</span>
          <span>{index + 1}</span>
          {item.originalPageNumber !== index + 1 && (
            <span className="text-[9px] text-zinc-500">(orig {item.originalPageNumber})</span>
          )}
        </span>

        {selectable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(item.originalPageNumber);
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
              item.selected
                ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm shadow-emerald-500/30"
                : "border-zinc-700 bg-zinc-800/80 text-transparent hover:border-zinc-500 hover:bg-zinc-700"
            }`}
            aria-label={`Toggle page ${index + 1}`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Thumbnail Canvas / Image */}
      <div
        onClick={() => selectable && onToggleSelect(item.originalPageNumber)}
        className="relative aspect-[1/1.4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/60 flex items-center justify-center cursor-pointer"
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`Page ${index + 1}`}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-200"
            style={{ transform: `rotate(${item.rotation}deg)` }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {isLoading ? (
                <span className="text-emerald-400 animate-pulse">Rendering...</span>
              ) : (
                `Page ${index + 1}`
              )}
            </span>
          </div>
        )}

        {/* Selection overlay */}
        {selectable && item.selected && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border-2 border-emerald-500 rounded-xl" />
        )}
      </div>

      {/* Actions Toolbar */}
      {(onMovePage || onRotatePage || onDeletePage) && (
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
          <div className="flex items-center gap-1">
            {onMovePage && (
              <>
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePage(index, index - 1);
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Move Page Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePage(index, index + 1);
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Move Page Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {onRotatePage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotatePage(index);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onDeletePage && totalItems > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage(index);
              }}
              className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ThumbnailGrid({
  items,
  selectable = false,
  onSelectionChange,
  onRotatePage,
  onDeletePage,
  onMovePage,
  onRequestThumbnail,
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
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 ${className}`}>
      {items.map((item, index) => (
        <ThumbnailCard
          key={item.id}
          item={item}
          index={index}
          selectable={selectable}
          onToggleSelect={toggleSelect}
          onRequestThumbnail={onRequestThumbnail}
          onRotatePage={onRotatePage}
          onDeletePage={onDeletePage}
          onMovePage={onMovePage}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          totalItems={items.length}
        />
      ))}
    </div>
  );
}
