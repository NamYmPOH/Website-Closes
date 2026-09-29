"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { ProductItem } from "@/types/product";
import ProductCard from "./ProductCard";

interface FlashSaleSectionProps {
  products: ProductItem[];
  onAddToCart: (product: ProductItem) => void;
}

export function FlashSaleSection({
  products,
  onAddToCart,
}: FlashSaleSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-neutral-900 text-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Clock className="text-red-500 animate-pulse" size={24} />
            <div>
              <h2 className="text-lg font-bold tracking-wider uppercase">
                Chớp nhoáng trong ngày (Flash Sale)
              </h2>
              <p className="text-xs text-neutral-400">
                Ưu đãi giảm giá có hạn cho các thiết kế được tuyển chọn
              </p>
            </div>
          </div>

          {/* Countdown Badges */}
          <div className="flex items-center gap-2 font-mono text-sm">
            <div className="bg-neutral-800 px-3 py-1.5 rounded text-center">
              <span className="font-bold">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] block text-neutral-500">Giờ</span>
            </div>
            <span>:</span>
            <div className="bg-neutral-800 px-3 py-1.5 rounded text-center">
              <span className="font-bold">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] block text-neutral-500">Phút</span>
            </div>
            <span>:</span>
            <div className="bg-neutral-800 px-3 py-1.5 rounded text-center text-red-400">
              <span className="font-bold">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] block text-neutral-500">Giây</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
