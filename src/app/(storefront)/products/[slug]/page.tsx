"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  Send,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { addItem, toggleWishlist, isInWishlist } = useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Form viết đánh giá mới
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/products/${params.slug}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("API not found");
      })
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        setSelectedImage(data.primaryImage || data.images?.[0] || "");
        if (data.variants && data.variants.length > 0) {
          setSelectedColor(data.variants[0].color || "Tiêu chuẩn");
          setSelectedSize(data.variants[0].size || "Tiêu chuẩn");
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback to mock product
        const fallback = getProductBySlug(params.slug);
        if (fallback) {
          setProduct(fallback);
          setSelectedImage(fallback.primaryImage);
          setSelectedColor(fallback.variants[0]?.color || "Tiêu chuẩn");
          setSelectedSize(fallback.variants[0]?.size || "Tiêu chuẩn");
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-muted" size={32} />
        <p className="text-xs text-muted">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">
          Sản phẩm không tồn tại
        </h2>
        <p className="text-muted text-sm">
          Sản phẩm bạn đang tìm kiếm có thể đã hết hàng hoặc đã ngừng kinh doanh.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md"
        >
          Khám phá bộ sưu tập khác <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // Tìm biến thể tương ứng theo Color và Size
  const currentVariant =
    (product.variants || []).find(
      (v: any) => v.color === selectedColor && v.size === selectedSize
    ) || product.variants?.[0];

  const currentPrice = currentVariant ? currentVariant.price : product.basePrice;
  const currentComparePrice = currentVariant ? currentVariant.compareAtPrice : product.compareAtPrice;
  const currentStock = currentVariant ? (currentVariant.stock ?? 10) : 10;
  const isOutOfStock = currentStock <= 0 || product.badges?.isOutOfStock;

  const availableColors: string[] = Array.from(
    new Set((product.variants || []).map((v: any) => v.color).filter(Boolean))
  );
  const availableSizes: string[] = Array.from(
    new Set((product.variants || []).map((v: any) => v.size).filter(Boolean))
  );

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        title: `${product.title} (${selectedColor} - ${selectedSize})`,
        slug: product.slug,
        basePrice: currentPrice,
        primaryImage: selectedImage,
        brand: product.brand,
        category: product.category,
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
        brand: product.brand,
        category: product.category,
      },
      quantity,
      selectedColor,
      selectedSize
    );
    router.push("/checkout");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const reviewObj = {
      id: `rev-${Date.now()}`,
      userName: newReview.name.trim(),
      rating: newReview.rating,
      date: "Vừa xong",
      comment: newReview.comment.trim(),
      verified: true,
    };

    setProduct((prev: any) => ({
      ...prev,
      reviews: [reviewObj, ...(prev.reviews || [])],
      reviewCount: (prev.reviewCount || 0) + 1,
    }));

    setNewReview({ name: "", rating: 5, comment: "" });
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const relatedProducts = product.relatedProducts || ALL_PRODUCTS.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.categorySlug || ""}`}
          className="hover:text-foreground transition"
        >
          {product.category || "Sản phẩm"}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
            {(product.images || [product.primaryImage]).map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-24 rounded-md overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                  selectedImage === img
                    ? "border-foreground"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.title} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main Display Image */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden group">
            <img
              src={selectedImage || product.primaryImage}
              alt={product.title}
              className={`w-full h-full object-cover object-center ${
                isOutOfStock ? "grayscale opacity-80" : ""
              }`}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {isOutOfStock ? (
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-neutral-900 text-white rounded">
                  Hết hàng
                </span>
              ) : product.badges?.discountPercent ? (
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white rounded">
                  -{product.badges.discountPercent}%
                </span>
              ) : product.badges?.isNew ? (
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-foreground text-background rounded">
                  Mới
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted font-semibold">
                {product.brand || "AURA STUDIO"}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-muted hover:text-foreground cursor-pointer"
                aria-label="Thêm vào danh sách yêu thích"
              >
                <Heart
                  size={20}
                  className={isLiked ? "fill-red-500 text-red-500" : ""}
                />
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mt-1">
              {product.title}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(product.averageRating || 5)
                        ? "fill-amber-500"
                        : "text-neutral-300"
                    }
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">
                {product.averageRating?.toFixed(1) || "5.0"}
              </span>
              <span className="text-muted">
                ({product.reviewCount || product.reviews?.length || 0} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(currentPrice)}
              </span>
              {currentComparePrice && (
                <span className="text-sm text-muted line-through">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(currentComparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider">Màu sắc:</span>
                <span className="text-muted">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-md border text-xs font-medium transition cursor-pointer ${
                      selectedColor === color
                        ? "border-foreground bg-foreground text-background font-semibold"
                        : "border-border hover:border-foreground/60 text-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider">Kích cỡ:</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-muted hover:text-foreground flex items-center gap-1 underline"
                >
                  <HelpCircle size={12} /> Bảng chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-md border text-xs font-semibold transition cursor-pointer ${
                      selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/60 text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider">Số lượng:</span>
              <span
                className={`font-medium ${
                  isOutOfStock ? "text-red-500 font-bold" : "text-muted"
                }`}
              >
                {isOutOfStock ? "Tạm hết hàng" : `Còn lại: ${currentStock} sản phẩm`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="p-2.5 text-muted hover:text-foreground disabled:opacity-40"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-xs font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={isOutOfStock || quantity >= currentStock}
                  className="p-2.5 text-muted hover:text-foreground disabled:opacity-40"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-11 border border-foreground bg-background text-foreground text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAddedSuccess ? (
                  <>
                    <Check size={16} className="text-green-600" /> Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>

            {/* Buy now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full h-11 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isOutOfStock ? "Tạm hết hàng" : "Mua ngay"} <ArrowRight size={14} />
            </button>
          </div>

          {/* Guarantees */}
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

          {/* Description & Specifications */}
          <div className="pt-6 space-y-4 border-t border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Mô tả sản phẩm
            </h3>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground pt-2">
                  Thông số kỹ thuật
                </h3>
                <div className="border border-border rounded-md divide-y divide-border text-xs">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex px-4 py-2.5 justify-between">
                      <span className="text-muted font-medium">{key}</span>
                      <span className="font-semibold text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-20 pt-12 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
              Đánh giá từ khách hàng ({product.reviews?.length || 0})
            </h2>
            <p className="text-xs text-muted mt-1">Được tổng hợp từ người mua đã xác thực đơn hàng</p>
          </div>
        </div>

        {/* Viết đánh giá mới */}
        <div className="mb-10 p-6 border border-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-foreground">
            Viết đánh giá của bạn
          </h3>
          {reviewSubmitted ? (
            <div className="p-3 text-xs text-green-600 bg-green-50 dark:bg-green-950/40 rounded-md font-semibold flex items-center gap-2">
              <Check size={16} /> Cảm ơn bạn! Đánh giá của bạn đã được gửi thành công.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-muted font-medium">Đánh giá sao:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 text-amber-500 cursor-pointer"
                    >
                      <Star
                        size={18}
                        className={star <= newReview.rating ? "fill-amber-500" : "text-neutral-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tên của bạn *"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="px-3 py-2 border border-border rounded-md bg-background outline-none focus:border-foreground"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Nhận xét chi tiết về sản phẩm (chất liệu, form dáng, trải nghiệm mặc)..."
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background outline-none focus:border-foreground"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-foreground text-background font-semibold uppercase tracking-wider rounded-md text-xs hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
              >
                <Send size={13} /> Gửi đánh giá
              </button>
            </form>
          )}
        </div>

        {/* Danh sách đánh giá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(product.reviews || []).map((rev: any) => (
            <div
              key={rev.id}
              className="p-5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{rev.userName}</span>
                <span className="text-[11px] text-muted">{rev.date}</span>
              </div>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < rev.rating ? "fill-amber-500" : "text-neutral-300"}
                  />
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-8 text-foreground">
            Gợi ý sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} onAddToCart={(prod) => addItem(prod, 1)} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-background max-w-md w-full p-6 rounded-lg shadow-xl border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">Bảng quy chuẩn kích cỡ</h3>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
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
                <tr>
                  <td className="p-2 border border-border font-bold">S</td>
                  <td className="p-2 border border-border">155 - 165</td>
                  <td className="p-2 border border-border">48 - 56</td>
                </tr>
                <tr>
                  <td className="p-2 border border-border font-bold">M</td>
                  <td className="p-2 border border-border">164 - 173</td>
                  <td className="p-2 border border-border">57 - 65</td>
                </tr>
                <tr>
                  <td className="p-2 border border-border font-bold">L</td>
                  <td className="p-2 border border-border">172 - 180</td>
                  <td className="p-2 border border-border">66 - 75</td>
                </tr>
                <tr>
                  <td className="p-2 border border-border font-bold">XL</td>
                  <td className="p-2 border border-border">178 - 188</td>
                  <td className="p-2 border border-border">76 - 88</td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 bg-foreground text-background text-xs font-semibold rounded-md uppercase tracking-wider cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
