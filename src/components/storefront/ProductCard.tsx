"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { ProductItem } from "@/types/product";

// Re-export để đảm bảo không gãy import ở bất kỳ đâu
export type { ProductItem };

export interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
  isListView?: boolean;
}

function ProductCardComponent({
  product,
  onAddToCart,
  isListView = false,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useCartStore();
  const isLiked = isInWishlist(product.id);

  const formattedPrice = formatCurrency(product.basePrice);
  const formattedComparePrice = product.compareAtPrice
    ? formatCurrency(product.compareAtPrice)
    : null;

  const isOutOfStock = Boolean(product.badges?.isOutOfStock);

  const brandName =
    typeof product.brand === "object" && product.brand !== null
      ? product.brand.name
      : typeof product.brand === "string"
      ? product.brand
      : null;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : typeof product.category === "string"
      ? product.category
      : null;

  const renderBadge = () => {
    if (isOutOfStock) {
      return (
        <Badge variant="default" className="bg-neutral-900 text-white shadow-xs">
          Hết hàng
        </Badge>
      );
    }
    if (product.badges?.discountPercent) {
      return (
        <Badge variant="danger" className="shadow-xs">
          -{product.badges.discountPercent}%
        </Badge>
      );
    }
    if (product.badges?.isNew) {
      return (
        <Badge variant="default" className="shadow-xs">
          Mới
        </Badge>
      );
    }
    return null;
  };

  if (isListView) {
    return (
      <div className="group flex flex-col sm:flex-row items-center gap-5 p-4 border border-border rounded-xl bg-background hover:border-foreground/40 transition">
        {/* Image Container */}
        <div className="relative w-full sm:w-44 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {renderBadge()}
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
              className={
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-muted hover:text-foreground"
              }
            />
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="relative block w-full h-full"
          >
            <Image
              src={product.primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                isOutOfStock ? "grayscale opacity-75" : ""
              }`}
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
              <span className="text-base font-bold text-foreground">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-xs text-muted line-through">
                  {formattedComparePrice}
                </span>
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
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {renderBadge()}
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
            className={
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-muted hover:text-foreground"
            }
          />
        </button>

        {/* Clickable Image Link */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block w-full h-full"
        >
          <Image
            src={product.primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-75" : ""
            }`}
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
          <span className="text-sm font-semibold text-foreground">
            {formattedPrice}
          </span>
          {formattedComparePrice && (
            <span className="text-xs text-muted line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
