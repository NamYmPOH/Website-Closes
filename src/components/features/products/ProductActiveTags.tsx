"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";

export interface ActiveTagItem {
  label: string;
  onRemove: () => void;
}

export interface ProductActiveTagsProps {
  tags: ActiveTagItem[];
  onResetAll: () => void;
}

export function ProductActiveTags({
  tags,
  onResetAll,
}: ProductActiveTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
      <span className="text-xs text-muted font-medium mr-1">Đang lọc theo:</span>
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-foreground border border-border"
        >
          {tag.label}
          <button
            type="button"
            onClick={tag.onRemove}
            className="hover:text-red-500 transition cursor-pointer"
            aria-label={`Xóa bộ lọc ${tag.label}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="text-xs text-muted hover:text-foreground font-semibold flex items-center gap-1 ml-2 transition cursor-pointer underline"
      >
        <RotateCcw size={12} /> Đặt lại tất cả
      </button>
    </div>
  );
}
