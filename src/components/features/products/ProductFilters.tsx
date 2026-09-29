"use client";

import React from "react";
import { Check } from "lucide-react";

export const CATEGORIES_LIST = [
  { label: "Áo Nam", value: "ao-nam" },
  { label: "Quần Nam", value: "quan-nam" },
  { label: "Áo Nữ", value: "ao-nu" },
  { label: "Đầm & Váy", value: "dam-vay" },
  { label: "Quần Nữ", value: "quan-nu" },
  { label: "Áo Khoác & Outerwear", value: "ao-khoac-outerwear" },
  { label: "Túi Xách & Balo", value: "tui-xach-balo" },
  { label: "Giày Dép Thời Trang", value: "giay-dep" },
  { label: "Phụ Kiện & Trang Sức", value: "phu-kien" },
  { label: "Đồ Thể Thao & Activewear", value: "activewear" },
];

export const PRICE_PRESETS = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 500.000₫", min: undefined, max: 500000 },
  { label: "500k - 1.000.000₫", min: 500000, max: 1000000 },
  { label: "1.000.000₫ - 2.000.000₫", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000₫", min: 2000000, max: undefined },
];

export const SIZES_LIST = ["S", "M", "L", "XL"];

export const COLORS_LIST = [
  { name: "Đen", hex: "#111111" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Be", hex: "#E3DAC9" },
  { name: "Xám", hex: "#8E9297" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Rêu", hex: "#556B2F" },
];

export interface ProductFiltersProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  minPrice?: number;
  maxPrice?: number;
  onPricePreset: (min?: number, max?: number) => void;
  onMinPriceChange: (min?: number) => void;
  onMaxPriceChange: (max?: number) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  inStockOnly: boolean;
  onInStockToggle: (checked: boolean) => void;
}

export function ProductFilters({
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onPricePreset,
  onMinPriceChange,
  onMaxPriceChange,
  selectedSize,
  onSizeChange,
  selectedColor,
  onColorChange,
  inStockOnly,
  onInStockToggle,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6 text-xs">
      {/* 1. Danh mục đa lựa chọn */}
      <div className="space-y-3">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">
          Danh mục
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {CATEGORIES_LIST.map((cat) => {
            const checked = selectedCategories.includes(cat.value);
            return (
              <label
                key={cat.value}
                className="flex items-center gap-2.5 cursor-pointer text-foreground/80 hover:text-foreground select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCategory(cat.value)}
                  className="w-4 h-4 rounded border-border accent-foreground cursor-pointer"
                />
                <span className={checked ? "font-bold text-foreground" : "font-normal"}>
                  {cat.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Khoảng giá */}
      <div className="space-y-3 border-t border-border pt-6">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">
          Khoảng giá
        </h4>
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPricePreset(preset.min, preset.max)}
                className={`block w-full text-left px-2.5 py-1.5 rounded transition cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-background font-semibold"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground/80"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Từ (₫)"
            value={minPrice ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onMinPriceChange(val);
            }}
            className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] outline-none focus:border-foreground bg-background text-foreground"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            placeholder="Đến (₫)"
            value={maxPrice ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onMaxPriceChange(val);
            }}
            className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] outline-none focus:border-foreground bg-background text-foreground"
          />
        </div>
      </div>

      {/* 3. Kích cỡ */}
      <div className="space-y-3 border-t border-border pt-6">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">
          Kích cỡ
        </h4>
        <div className="flex flex-wrap gap-2">
          {SIZES_LIST.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onSizeChange(isSelected ? "" : sz)}
                className={`w-9 h-9 rounded-md border text-xs font-semibold uppercase transition cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Màu sắc */}
      <div className="space-y-3 border-t border-border pt-6">
        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">
          Màu sắc
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {COLORS_LIST.map((c) => {
            const isSelected = selectedColor === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onColorChange(isSelected ? "" : c.name)}
                title={c.name}
                className={`relative w-7 h-7 rounded-full border transition flex items-center justify-center cursor-pointer ${
                  isSelected ? "ring-2 ring-foreground ring-offset-2" : "border-border"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check
                    size={13}
                    className={c.name === "Trắng" || c.name === "Be" ? "text-black" : "text-white"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Tình trạng hàng */}
      <div className="border-t border-border pt-6">
        <label className="flex items-center gap-2.5 cursor-pointer text-foreground/80 hover:text-foreground select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockToggle(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-foreground cursor-pointer"
          />
          <span className={inStockOnly ? "font-bold text-foreground" : "font-normal"}>
            Chỉ hiện sản phẩm còn hàng
          </span>
        </label>
      </div>
    </div>
  );
}
