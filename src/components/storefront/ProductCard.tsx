"use client";

import React from "react";
import Link from "next/link";
import { Plus, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage: string;
  category?: any;
  brand?: any;
  badges?: {
    isNew?: boolean;
    isOutOfStock?: boolean;
    discountPercent?: number;
  };
}

interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
  isListView?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  isListView = false,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useCartStore();
  const isLiked = isInWishlist(product.id);

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

  const isOutOfStock = product.badges?.isOutOfStock;

  const brandName =
    typeof product.brand === "object"
      ? (product.brand as any)?.name
      : typeof product.brand === "string"
      ? product.brand
      : null;

  const categoryName =
    typeof product.category === "object"
      ? (product.category as any)?.name
      : typeof product.category === "string"
      ? product.category
      : null;

  if (isListView) {
    return (
      <div className="group flex flex-col sm:flex-row items-center gap-5 p-4 border border-border rounded-xl bg-background hover:border-foreground/40 transition">
        {/* Image Container */}
        <div className="relative w-full sm:w-44 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
          {/* Dynamic Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-neutral-900 text-white rounded">
                Hết hàng
              </span>
            ) : product.badges?.discountPercent ? (
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-red-600 text-white rounded">
                -{product.badges.discountPercent}%
              </span>
            ) : product.badges?.isNew ? (
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-foreground text-background rounded">
                Mới
              </span>
            ) : null}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-xs hover:bg-background transition shadow-xs cursor-pointer"
            aria-label="Thêm vào danh sách yêu thích"
          >
            <Heart
              size={15}
              className={isLiked ? "fill-red-500 text-red-500" : "text-muted hover:text-foreground"}
            />
          </button>

          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={product.primaryImage}
              alt={product.title}
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                isOutOfStock ? "grayscale opacity-75" : ""
              }`}
              loading="lazy"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between w-full h-full py-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {brandName && (
                <span className="text-xs uppercase tracking-wider text-muted font-medium">
                  {brandName}
                </span>
              )}
              {categoryName && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-muted">
                  {categoryName}
                </span>
              )}
            </div>

            <Link
              href={`/products/${product.slug}`}
              className="text-base font-semibold hover:underline block text-foreground line-clamp-1"
            >
              {product.title}
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-base font-bold text-foreground">{formattedPrice}</span>
              {formattedComparePrice && (
                <span className="text-xs text-muted line-through">{formattedComparePrice}</span>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-foreground"
            >
              Chi tiết
            </Link>
            {!isOutOfStock ? (
              <button
                onClick={() => onAddToCart && onAddToCart(product)}
                className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Thêm vào giỏ
              </button>
            ) : (
              <span className="px-3 py-1.5 text-xs text-neutral-400 font-medium border border-border rounded-md">
                Tạm hết hàng
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group relative flex flex-col">
      {/* Product Image Container with Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-lg">
        {/* Dynamic Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-neutral-900 text-white rounded shadow-xs">
              Hết hàng
            </span>
          ) : product.badges?.discountPercent ? (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-red-600 text-white rounded shadow-xs">
              -{product.badges.discountPercent}%
            </span>
          ) : product.badges?.isNew ? (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-foreground text-background rounded shadow-xs">
              Mới
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-xs hover:bg-background transition shadow-xs cursor-pointer"
          aria-label="Thêm vào danh sách yêu thích"
        >
          <Heart
            size={15}
            className={isLiked ? "fill-red-500 text-red-500" : "text-muted hover:text-foreground"}
          />
        </button>

        {/* Clickable Image Link */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.primaryImage}
            alt={product.title}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-75" : ""
            }`}
            loading="lazy"
          />
        </Link>

        {/* Quick Add Button on Hover */}
        {!isOutOfStock && (
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="absolute bottom-3 right-3 p-2.5 bg-background text-foreground rounded-full shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-foreground hover:text-background cursor-pointer"
            aria-label="Thêm nhanh vào giỏ hàng"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-0.5">
          {brandName && (
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium truncate">
              {brandName}
            </span>
          )}
          {categoryName && (
            <span className="text-[10px] text-muted truncate">
              {categoryName}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium hover:underline line-clamp-1 text-foreground"
        >
          {product.title}
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{formattedPrice}</span>
          {formattedComparePrice && (
            <span className="text-xs text-muted line-through">{formattedComparePrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
