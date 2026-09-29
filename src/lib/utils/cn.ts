import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tiện ích kết hợp và chuẩn hóa class Tailwind CSS
 * Tránh xung đột class và loại bỏ falsy values
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
