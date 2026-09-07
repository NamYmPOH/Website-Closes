"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { ALL_PRODUCTS } from "@/lib/products-data";
import ProductCard from "@/components/storefront/ProductCard";
import { ArrowRight, Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, wishlistProducts, addItem } = useCartStore();

  // Kết hợp sản phẩm từ wishlistProducts và ALL_PRODUCTS theo ID trong wishlist
  const combinedProductsMap = new Map<string, any>();

  // Ưu tiên các sản phẩm lưu trong wishlistProducts
  (wishlistProducts || []).forEach((p) => {
    if (wishlist.includes(p.id)) {
      combinedProductsMap.set(p.id, p);
    }
  });

  // Bổ sung từ ALL_PRODUCTS nếu có id khớp mà chưa có trong map
  ALL_PRODUCTS.forEach((p) => {
    if (wishlist.includes(p.id) && !combinedProductsMap.has(p.id)) {
      combinedProductsMap.set(p.id, {
        id: p.id,
        title: p.title,
        slug: p.slug,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        primaryImage: p.primaryImage,
        brand: p.brand,
        category: p.category,
        badges: p.badges,
      });
    }
  });

  const displayList = Array.from(combinedProductsMap.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between pb-8 border-b border-border mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
            Danh sách yêu thích ({displayList.length})
          </h1>
          <p className="text-xs text-muted mt-1">
            Lưu trữ các thiết kế yêu thích để xem lại và mua sắm thuận tiện hơn
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-muted hover:text-foreground transition"
        >
          ← Tiếp tục khám phá
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold uppercase tracking-tight text-foreground">
              Danh sách yêu thích trống
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Bạn chưa lưu sản phẩm nào. Nhấn vào biểu tượng trái tim trên các sản phẩm để lưu lại tại đây!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition"
            >
              Khám phá bộ sưu tập ngay <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(p) => addItem(p, 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
