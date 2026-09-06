"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage: string;
  category?: string;
  brand?: string;
  badges?: {
    isNew?: boolean;
    isOutOfStock?: boolean;
    discountPercent?: number;
  };
}

interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.basePrice);

  const formattedComparePrice = product.compareAtPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.compareAtPrice)
    : null;

  return (
    <div className="group relative flex flex-col">
      {/* Product Image Container with Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-lg">
        {/* Dynamic Badges (Tính năng 30) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.badges?.isOutOfStock ? (
            <span className="px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider bg-neutral-900 text-white rounded">
              Hết hàng
            </span>
          ) : product.badges?.discountPercent ? (
            <span className="px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider bg-red-600 text-white rounded">
              -{product.badges.discountPercent}%
            </span>
          ) : product.badges?.isNew ? (
            <span className="px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider bg-foreground text-background rounded">
              Mới
            </span>
          ) : null}
        </div>

        {/* Clickable Image Link */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Quick Add Button on Hover (Tính năng 38) */}
        {!product.badges?.isOutOfStock && (
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="absolute bottom-3 right-3 p-2.5 bg-background text-foreground rounded-full shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-foreground hover:text-background"
            aria-label="Thêm nhanh vào giỏ hàng"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-3 flex flex-col flex-1">
        {product.brand && (
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium mb-0.5">
            {product.brand}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline line-clamp-1">
          {product.title}
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{formattedPrice}</span>
          {formattedComparePrice && (
            <span className="text-xs text-muted line-through">{formattedComparePrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
