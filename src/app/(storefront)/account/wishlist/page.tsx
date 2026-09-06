"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { ALL_PRODUCTS } from "@/lib/products-data";
import ProductCard from "@/components/storefront/ProductCard";
import { ArrowRight, Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, addItem } = useCartStore();

  const favoriteProducts = ALL_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between pb-8 border-b border-border mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            Danh sách yêu thích ({favoriteProducts.length})
          </h1>
          <p className="text-xs text-muted mt-1">Lưu trữ các thiết kế yêu thích để mua sắm thuận tiện hơn</p>
        </div>
        <Link href="/products" className="text-xs font-semibold text-muted hover:text-foreground">
          ← Tiếp tục khám phá
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-lg space-y-4">
          <Heart size={32} className="mx-auto text-muted" />
          <p className="text-muted text-sm">Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition"
          >
            Khám phá bộ sưu tập ngay <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
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
