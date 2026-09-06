"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { ALL_PRODUCTS } from "@/lib/products-data";
import { ArrowRight, Clock, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function StorefrontPage() {
  const { addItem } = useCartStore();

  // Flash Sale Timer (Tính năng 15)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Banner (Tính năng 12) */}
      <section className="relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-start justify-center min-h-[540px]">
          <div className="max-w-xl space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-muted font-semibold">
              BỘ SƯU TẬP THU ĐÔNG 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Vẻ đẹp từ sự tinh giản tuyệt đối.
            </h1>
            <p className="text-base text-muted leading-relaxed">
              Được chế tác từ các loại sợi tự nhiên cao cấp. Thiết kế tối giản không lỗi thời, đề cao sự thoải mái và tự do trong từng chuyển động.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center gap-2 shadow-sm"
              >
                Khám phá sản phẩm <ArrowRight size={14} />
              </Link>
              <Link
                href="/pages/about"
                className="px-6 py-3 border border-border text-foreground text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
              >
                Về thương hiệu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Grid (Tính năng 16) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold tracking-tight uppercase">Danh mục thịnh hành</h2>
          <Link href="/products" className="text-xs text-muted hover:text-foreground font-medium uppercase tracking-wider">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Áo Thun & Polo", count: "32 sản phẩm", slug: "ao-thun" },
            { title: "Sơ Mi Minimal", count: "24 sản phẩm", slug: "so-mi" },
            { title: "Quần Trousers", count: "18 sản phẩm", slug: "quan" },
            { title: "Phụ Kiện Daily", count: "15 sản phẩm", slug: "phu-kien" },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="p-6 rounded-lg border border-border hover:border-foreground/40 bg-neutral-50/50 dark:bg-neutral-900/40 transition group"
            >
              <h3 className="font-semibold text-sm group-hover:underline">{cat.title}</h3>
              <p className="text-xs text-muted mt-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Countdown Block (Tính năng 15) */}
      <section className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <Clock className="text-red-500 animate-pulse" size={24} />
              <div>
                <h2 className="text-lg font-bold tracking-wider uppercase">Chớp nhoáng trong ngày (Flash Sale)</h2>
                <p className="text-xs text-neutral-400">Ưu đãi giảm giá có hạn cho các thiết kế được tuyển chọn</p>
              </div>
            </div>

            {/* Countdown Badges */}
            <div className="flex items-center gap-2 font-mono text-sm">
              <div className="bg-neutral-800 px-3 py-1.5 rounded text-center">
                <span className="font-bold">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[10px] block text-neutral-500">Giờ</span>
              </div>
              <span>:</span>
              <div className="bg-neutral-800 px-3 py-1.5 rounded text-center">
                <span className="font-bold">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] block text-neutral-500">Phút</span>
              </div>
              <span>:</span>
              <div className="bg-neutral-800 px-3 py-1.5 rounded text-center text-red-400">
                <span className="font-bold">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] block text-neutral-500">Giây</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {ALL_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(prod) => addItem(prod, 1)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. New Arrivals & Trending (Tính năng 13 & 14) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight uppercase">Sản phẩm mới cập bến</h2>
          <p className="text-sm text-muted">
            Tuyển tập những mẫu mới nhất với form dáng vượt thời gian và chi tiết sắc nét.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ALL_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(prod) => addItem(prod, 1)}
            />
          ))}
        </div>
      </section>

      {/* 5. Trust Badges (Tiêu chuẩn Minimalist) */}
      <section className="border-t border-border py-12 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Truck size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Vận chuyển hỏa tốc</h4>
            <p className="text-xs text-muted">Đóng gói tiêu chuẩn và giao hàng nhanh trong 24-48h</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Chất lượng tuyển chọn</h4>
            <p className="text-xs text-muted">100% sợi vải tự nhiên, không bai xù hay kích ứng da</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RotateCcw size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Đổi trả 30 ngày</h4>
            <p className="text-xs text-muted">Đổi trả miễn phí tận nhà nếu không vừa kích cỡ</p>
          </div>
        </div>
      </section>
    </div>
  );
}
