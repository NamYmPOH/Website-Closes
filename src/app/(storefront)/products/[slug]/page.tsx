"use client";

import React, { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, ALL_PRODUCTS } from "@/lib/products-data";
import { useCartStore } from "@/stores/cartStore";
import ProductCard from "@/components/storefront/ProductCard";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Heart,
  Plus,
  Minus,
  Check,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const { addItem, toggleWishlist, isInWishlist } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(product.primaryImage);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || "Tiêu chuẩn");
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || "Tiêu chuẩn");
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Lọc biến thể tương ứng
  const currentVariant =
    product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
    product.variants[0];

  const currentPrice = currentVariant ? currentVariant.price : product.basePrice;
  const currentStock = currentVariant ? currentVariant.stock : 10;
  const isOutOfStock = currentStock <= 0;

  // Lấy các màu sắc và kích cỡ duy nhất
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: `${product.title} (${selectedColor} - ${selectedSize})`,
        slug: product.slug,
        basePrice: currentPrice,
        primaryImage: selectedImage,
      },
      quantity,
      selectedColor,
      selectedSize
    );
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: `${product.title} (${selectedColor} - ${selectedSize})`,
        slug: product.slug,
        basePrice: currentPrice,
        primaryImage: selectedImage,
      },
      quantity,
      selectedColor,
      selectedSize
    );
    router.push("/checkout");
  };

  const isLiked = isInWishlist(product.id);

  // Sản phẩm liên quan (Up-sell / Cross-sell)
  const relatedProducts = ALL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs chuẩn SEO (Tính năng 28) */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition">Trang chủ</Link>
        <span>/</span>
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-foreground transition">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Gallery (Tính năng 33, 34) */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-24 rounded-md overflow-hidden border-2 transition ${
                  selectedImage === img ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Display Image */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden group">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out cursor-crosshair"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.badges?.discountPercent && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded">
                  -{product.badges.discountPercent}%
                </span>
              )}
              {product.badges?.isNew && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-foreground text-background rounded">
                  Mới
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 bg-background/80 backdrop-blur rounded-full text-foreground hover:bg-background transition shadow-sm"
              title="Thêm vào danh sách yêu thích"
            >
              <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted font-semibold">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              {product.title}
            </h1>

            {/* Rating Summary (Tính năng 43) */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className={i < Math.floor(product.averageRating) ? "fill-amber-500" : "text-neutral-300"}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold">{product.averageRating}</span>
              <span className="text-xs text-muted">({product.reviewCount} đánh giá từ người mua)</span>
            </div>
          </div>

          {/* Pricing (Tính năng 36) */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-border">
            <span className="text-2xl sm:text-3xl font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currentPrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-base text-muted line-through">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  product.compareAtPrice
                )}
              </span>
            )}
            <span className="text-xs text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded font-medium">
              Còn {currentStock} sản phẩm
            </span>
          </div>

          {/* Color Selection (Tính năng 35) */}
          {availableColors.length > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Màu sắc: <strong className="text-foreground">{selectedColor}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 text-xs rounded-md border font-medium transition ${
                      selectedColor === color
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection & Size Guide Modal (Tính năng 35, 47) */}
          {availableSizes.length > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Kích cỡ: <strong className="text-foreground">{selectedSize}</strong></span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-muted hover:text-foreground flex items-center gap-1 underline"
                >
                  <HelpCircle size={13} /> Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex items-center gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-10 px-3 py-1.5 text-xs rounded-md border font-medium transition ${
                      selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons (Tính năng 38, 39) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-border rounded-md h-11">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 h-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3 h-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-11 border border-foreground bg-background text-foreground text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-foreground hover:text-background transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddedSuccess ? (
                  <>
                    <Check size={16} className="text-green-500" /> Đã thêm vào giỏ!
                  </>
                ) : (
                  "Thêm vào giỏ hàng"
                )}
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full h-11 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              Mua ngay <ArrowRight size={14} />
            </button>
          </div>

          {/* Value Props Guarantee */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-center text-xs text-muted">
            <div className="flex flex-col items-center gap-1 p-2">
              <Truck size={18} />
              <span>Giao hàng 24-48h</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <RotateCcw size={18} />
              <span>Đổi trả 30 ngày</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <ShieldCheck size={18} />
              <span>Chính hãng 100%</span>
            </div>
          </div>

          {/* Description & Specifications (Tính năng 40, 41) */}
          <div className="pt-6 space-y-4 border-t border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Mô tả sản phẩm</h3>
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>

            <h3 className="text-sm font-semibold uppercase tracking-wider pt-2">Thông số kỹ thuật</h3>
            <div className="border border-border rounded-md divide-y divide-border text-xs">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex px-4 py-2.5 justify-between">
                  <span className="text-muted font-medium">{key}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section (Tính năng 42, 43) */}
      <section className="mt-20 pt-12 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Đánh giá từ khách hàng</h2>
            <p className="text-xs text-muted mt-1">Được tổng hợp từ người mua đã xác thực đơn hàng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.reviews.map((rev) => (
            <div key={rev.id} className="p-5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{rev.userName}</span>
                <span className="text-[11px] text-muted">{rev.date}</span>
              </div>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className={i < rev.rating ? "fill-amber-500" : "text-neutral-300"} />
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products: Up-sell / Cross-sell (Tính năng 44, 45) */}
      <section className="mt-20 pt-12 border-t border-border">
        <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Gợi ý sản phẩm mua cùng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={(prod) => addItem(prod, 1)} />
          ))}
        </div>
      </section>

      {/* Size Guide Modal (Tính năng 47) */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background max-w-md w-full p-6 rounded-lg shadow-xl border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">Bảng quy chuẩn kích cỡ</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-muted hover:text-foreground">
                ✕
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800">
                  <th className="p-2 border border-border">Size</th>
                  <th className="p-2 border border-border">Chiều cao (cm)</th>
                  <th className="p-2 border border-border">Cân nặng (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-2 border border-border font-bold">S</td><td className="p-2 border border-border">155 - 165</td><td className="p-2 border border-border">48 - 56</td></tr>
                <tr><td className="p-2 border border-border font-bold">M</td><td className="p-2 border border-border">164 - 173</td><td className="p-2 border border-border">57 - 65</td></tr>
                <tr><td className="p-2 border border-border font-bold">L</td><td className="p-2 border border-border">172 - 180</td><td className="p-2 border border-border">66 - 75</td></tr>
                <tr><td className="p-2 border border-border font-bold">XL</td><td className="p-2 border border-border">178 - 188</td><td className="p-2 border border-border">76 - 88</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-md uppercase"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
