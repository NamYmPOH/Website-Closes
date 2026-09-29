"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-12 pb-6 border-t border-border mt-8">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 border border-border rounded-md text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
        // Chỉ hiện trang đầu, cuối, và lân cận trang hiện tại nếu nhiều hơn 7 trang
        if (
          totalPages > 7 &&
          pageNum !== 1 &&
          pageNum !== totalPages &&
          Math.abs(pageNum - currentPage) > 2
        ) {
          if (pageNum === 2 || pageNum === totalPages - 1) {
            return (
              <span key={pageNum} className="px-2 text-xs text-muted">
                ...
              </span>
            );
          }
          return null;
        }

        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-md text-xs font-semibold uppercase transition cursor-pointer ${
              isActive
                ? "bg-foreground text-background shadow-xs font-bold"
                : "border border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 border border-border rounded-md text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        aria-label="Trang tiếp theo"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
