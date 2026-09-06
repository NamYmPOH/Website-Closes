"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { ALL_PRODUCTS } from "@/lib/products-data";
import { useCartStore } from "@/stores/cartStore";
import { SlidersHorizontal, Grid, List, RotateCcw } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialSale = searchParams.get("sale") === "true";

  const { addItem } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>(1000000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isListView, setIsListView] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((item) => {
      if (selectedCategory && item.categorySlug !== selectedCategory) return false;
      if (initialSale && !item.badges?.discountPercent) return false;
      if (initialQuery) {
        const q = initialQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (item.basePrice > selectedMaxPrice) return false;
      if (inStockOnly && item.badges?.isOutOfStock) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.basePrice - b.basePrice;
      if (sortBy === "price-desc") return b.basePrice - a.basePrice;
      if (sortBy === "rating") return b.averageRating - a.averageRating;
      return 0; // newest
    });
  }, [selectedCategory, initialSale, initialQuery, selectedMaxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedMaxPrice(1000000);
    setInStockOnly(false);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-border gap-4">
        <div>
          <nav className="text-xs text-muted mb-2">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link> / <span>Sản phẩm</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            {initialQuery ? `Kết quả tìm kiếm: "${initialQuery}"` : "Bộ sưu tập sản phẩm"}
          </h1>
          <p className="text-xs text-muted mt-1">
            Hiển thị {filteredProducts.length} trên tổng số {ALL_PRODUCTS.length} sản phẩm
          </p>
        </div>

        {/* Sorting & Grid/List Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-md text-xs font-medium"
          >
            <SlidersHorizontal size={14} /> Bộ lọc
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-foreground"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          <div className="hidden sm:flex items-center border border-border rounded-md">
            <button
              onClick={() => setIsListView(false)}
              className={`p-2 transition ${!isListView ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
              title="Xem dạng lưới"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-2 transition ${isListView ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
              title="Xem dạng danh sách"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters (Tính năng 22 - 25) */}
        <aside className={`md:block ${isMobileFilterOpen ? "block" : "hidden"} space-y-6 md:col-span-1`}>
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-semibold text-xs uppercase tracking-wider">Bộ lọc tìm kiếm</h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-muted hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw size={11} /> Đặt lại
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Danh mục</h4>
            <div className="space-y-1.5 text-xs">
              {[
                { label: "Tất cả", value: "" },
                { label: "Áo Thun & Polo", value: "ao-thun" },
                { label: "Sơ Mi Minimal", value: "so-mi" },
                { label: "Quần Trousers", value: "quan" },
                { label: "Phụ Kiện Daily", value: "phu-kien" },
              ].map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.value}
                    onChange={() => setSelectedCategory(cat.value)}
                    className="accent-foreground"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
              <span>Mức giá tối đa</span>
              <span>
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedMaxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="200000"
              max="1000000"
              step="50000"
              value={selectedMaxPrice}
              onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
              className="w-full accent-foreground cursor-pointer"
            />
          </div>

          {/* Stock Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-foreground"
              />
              <span>Chỉ hiển thị sản phẩm còn hàng</span>
            </label>
          </div>
        </aside>

        {/* Product Grid / List */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-lg space-y-3">
              <p className="text-muted text-sm">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                isListView ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addItem(p, 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-muted">Đang tải bộ sưu tập sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
