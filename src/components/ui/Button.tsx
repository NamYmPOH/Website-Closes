"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-foreground text-background hover:opacity-90 active:scale-[0.99] shadow-xs",
      secondary:
        "bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700",
      outline:
        "border border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
      ghost:
        "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:scale-[0.99] shadow-xs",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-xs gap-2",
      lg: "px-6 py-3.5 text-sm gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" size={14} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
