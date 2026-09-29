"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  className,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center border border-border rounded-md bg-background select-none",
        isSm ? "h-8" : "h-9",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          "flex items-center justify-center text-muted hover:text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer rounded-l-md",
          isSm ? "w-7 h-full" : "w-8 h-full"
        )}
        aria-label="Giảm số lượng"
      >
        <Minus size={isSm ? 12 : 14} />
      </button>

      <span
        className={cn(
          "flex items-center justify-center font-semibold text-foreground text-center tabular-nums",
          isSm ? "w-8 text-xs" : "w-10 text-xs"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          "flex items-center justify-center text-muted hover:text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer rounded-r-md",
          isSm ? "w-7 h-full" : "w-8 h-full"
        )}
        aria-label="Tăng số lượng"
      >
        <Plus size={isSm ? 12 : 14} />
      </button>
    </div>
  );
}
