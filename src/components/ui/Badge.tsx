import React from "react";
import { cn } from "@/lib/utils/cn";
import { OrderStatus } from "@/types/order";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline"
  | OrderStatus;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium uppercase tracking-wider rounded-sm select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles: Record<string, string> = {
    default: "bg-foreground text-background",
    success: "bg-emerald-600/10 text-emerald-600 border border-emerald-600/20",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    danger: "bg-red-600 text-white",
    info: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
    outline: "border border-border text-foreground bg-transparent",

    // Order status variants
    pending: "bg-amber-500/10 text-amber-600 border border-amber-500/25",
    confirmed: "bg-blue-500/10 text-blue-600 border border-blue-500/25",
    shipping: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/25",
    completed: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25",
    cancelled: "bg-red-500/10 text-red-600 border border-red-500/25",
  };

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
