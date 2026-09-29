import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted mb-4">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="primary"
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
