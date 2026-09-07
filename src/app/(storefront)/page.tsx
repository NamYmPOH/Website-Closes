"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { ALL_PRODUCTS } from "@/lib/products-data";
import { ArrowRight, Clock, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";

export default function StorefrontPage() {
  const { addItem } = useCartStore();

  // Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>(ALL_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState<any[]>(ALL_PRODUCTS);

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

  // Fetch real products for Flash Sale & New Arrivals
  useEffect(() => {
    let isMounted = true;

    // Fetch Flash Sale (Discount items)
    fetch("/api/products?limit=4&sale=true&sortBy=bestselling")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.items && data.items.length >= 4) {
          const sanitized = data.items.map((item: any) => ({
            ...item,
            brand: typeof item.brand === "object" ? item.brand?.name : item.brand,
            category: typeof item.category === "object" ? item.category?.name : item.category,
          }));
          setFlashSaleProducts(sanitized);
        }
      })
      .catch(() => {});

    // Fetch New Arrivals
    fetch("/api/products?limit=4&sortBy=newest")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.items && data.items.length >= 4) {
          const sanitized = data.items.map((item: any) => ({
            ...item,
            brand: typeof item.brand === "object" ? item.brand?.name : item.brand,
            category: typeof item.category === "object" ? item.category?.name : item.category,
          }));
          setNewArrivals(sanitized);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Banner với Ảnh Lookbook Cao Cấp */}
      <section className="relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[580px]">
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border text-[11px] font-semibold tracking-wider uppercase text-muted shadow-2xs">
              <Sparkles size={13} className="text-amber-500" /> BỘ SƯU TẬP THU ĐÔNG 2026
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Vẻ đẹp từ sự tinh giản tuyệt đối.
            </h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-lg">
              Được chế tác từ các loại sợi tự nhiên cao cấp như Organic Cotton và French Linen. Thiết kế tối giản vượt thời gian, tôn vinh sự tự do và thanh lịch trong từng nhịp thở.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center gap-2 shadow-sm"
              >
                Khám phá bộ sưu tập <ArrowRight size={14} />
              </Link>
              <Link
                href="/pages/about"
                className="px-6 py-3.5 border border-border text-foreground text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
              >
                Về thương hiệu
              </Link>
            </div>
          </div>

          {/* Lookbook Editorial Visual */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85"
                alt="AURA Studio Minimalist Lookbook 2026"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold">
                  AURA EDITORIAL LOOKBOOK
                </span>
                <p className="text-base font-bold tracking-tight">
                  Tối giản trong đường nét, tinh xảo trong chất liệu
                </p>
              </div>
            </div>

            {/* Floating Accent Card */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 bg-background/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs">
                100%
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Sợi vải Organic</p>
                <p className="text-[11px] text-muted">Thân thiện với làn da & môi trường</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Danh mục thịnh hành (Có ảnh nền/thumbnail chuẩn xác) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase text-foreground">Danh mục thịnh hành</h2>
            <p className="text-xs text-muted mt-1">Các nhóm sản phẩm được khách hàng yêu thích nhất tại AURA</p>
          </div>
          <Link
            href="/products"
            className="text-xs text-muted hover:text-foreground font-semibold uppercase tracking-wider transition"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Áo Nam & Sơ Mi",
              desc: "100+ mẫu tối giản",
              slug: "ao-nam",
              image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
            },
            {
              title: "Quần Trousers & Jeans",
              desc: "Form dáng đứng chuẩn",
              slug: "quan-nam",
              image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
            },
            {
              title: "Đầm & Trang Phục Nữ",
              desc: "Thanh lịch hiện đại",
              slug: "dam-vay",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
            },
            {
              title: "Túi Xách & Phụ Kiện",
              desc: "Điểm nhấn tinh tế",
              slug: "phu-kien",
              image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
            },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border group shadow-xs block"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-sm sm:text-base tracking-tight group-hover:underline">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-neutral-300 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Countdown Block */}
      <section className="bg-neutral-900 text-white py-14">
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
            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(prod) => addItem(prod, 1)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight uppercase text-foreground">Sản phẩm mới cập bến</h2>
          <p className="text-sm text-muted">
            Tuyển tập những thiết kế mới nhất vừa được bổ sung vào bộ sưu tập hiện tại.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(prod) => addItem(prod, 1)}
            />
          ))}
        </div>
      </section>

      {/* 5. Trust Badges */}
      <section className="border-t border-border py-14 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Truck size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Vận chuyển hỏa tốc</h4>
            <p className="text-xs text-muted">Đóng gói tiêu chuẩn và giao hàng nhanh trong 24-48h trên toàn quốc</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Chất lượng tuyển chọn</h4>
            <p className="text-xs text-muted">100% sợi vải tự nhiên, đường may tỉ mỉ và bền đẹp qua nhiều lần giặt</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RotateCcw size={24} className="text-muted" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Đổi trả 30 ngày</h4>
            <p className="text-xs text-muted">Đổi trả miễn phí tận nhà nếu không vừa vặn kích cỡ hoặc lỗi kỹ thuật</p>
          </div>
        </div>
      </section>
    </div>
  );
}
