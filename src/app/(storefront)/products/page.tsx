"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { ALL_PRODUCTS } from "@/lib/products-data";
import { useCartStore } from "@/stores/cartStore";
import {
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES_LIST = [
  { label: "Tất cả sản phẩm", value: "" },
  { label: "Áo Nam", value: "ao-nam" },
  { label: "Quần Nam", value: "quan-nam" },
  { label: "Áo Nữ", value: "ao-nu" },
  { label: "Đầm & Váy", value: "dam-vay" },
  { label: "Quần Nữ", value: "quan-nu" },
  { label: "Áo Khoác & Outerwear", value: "ao-khoac-outerwear" },
  { label: "Túi Xách & Balo", value: "tui-xach-balo" },
  { label: "Giày Dép Thời Trang", value: "giay-dep" },
  { label: "Phụ Kiện & Trang Sức", value: "phu-kien" },
  { label: "Đồ Thể Thao & Activewear", value: "activewear" },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialSale = searchParams.get("sale") === "true";

  const { addItem } = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>(3000000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isListView, setIsListView] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Data from API
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(1000);
  const [totalPages, setTotalPages] = useState<number>(42);
  const [loading, setLoading] = useState(true);

  // Sync category param
  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
      setCurrentPage(1);
    }
  }, [initialCategory]);

  // Fetch products from database via /api/products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "24");
    if (selectedCategory) params.set("category", selectedCategory);
    if (initialQuery) params.set("q", initialQuery);
    if (sortBy) params.set("sortBy", sortBy);
    if (selectedMaxPrice < 3000000) params.set("maxPrice", selectedMaxPrice.toString());
    if (inStockOnly) params.set("inStock", "true");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && data.items && data.items.length > 0) {
          setProducts(
            data.items.map((item: any) => ({
              id: item.id,
              title: item.title,
              slug: item.slug,
              basePrice: item.basePrice,
              compareAtPrice: item.compareAtPrice,
              primaryImage: item.primaryImage,
              brand: typeof item.brand === "object" ? item.brand?.name : item.brand,
              category: typeof item.category === "object" ? item.category?.name : item.category,
              badges: item.badges,
            }))
          );
          setTotalCount(data.pagination?.totalCount || 1000);
          setTotalPages(data.pagination?.totalPages || Math.ceil(1000 / 24));
        } else {
          // Fallback if empty
          setProducts(ALL_PRODUCTS);
          setTotalCount(ALL_PRODUCTS.length);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("Lỗi khi tải từ API, sử dụng dữ liệu mặc định:", err);
        setProducts(ALL_PRODUCTS);
        setTotalCount(ALL_PRODUCTS.length);
        setTotalPages(1);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, initialQuery, sortBy, selectedMaxPrice, inStockOnly, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedMaxPrice(3000000);
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-border gap-4">
        <div>
          <nav className="text-xs text-muted mb-2">
            <Link href="/" className="hover:text-foreground">Trang chủ</Link> / <span>Sản phẩm</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              {initialQuery ? `Kết quả tìm kiếm: "${initialQuery}"` : "Bộ sưu tập sản phẩm"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold border border-border flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> {totalCount.toLocaleString()} sản phẩm
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Hiển thị trang {currentPage} / {totalPages} (24 sản phẩm/trang) từ cơ sở dữ liệu
          </p>
        </div>

        {/* Sorting & Grid/List Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-md text-xs font-medium cursor-pointer"
          >
            <SlidersHorizontal size={14} /> Bộ lọc
          </button>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-foreground cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="bestselling">Bán chạy nhất</option>
          </select>

          <div className="hidden sm:flex items-center border border-border rounded-md">
            <button
              onClick={() => setIsListView(false)}
              className={`p-2 transition cursor-pointer ${!isListView ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
              title="Xem dạng lưới"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-2 transition cursor-pointer ${isListView ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
              title="Xem dạng danh sách"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters */}
        <aside className={`md:block ${isMobileFilterOpen ? "block" : "hidden"} space-y-6 md:col-span-1`}>
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-semibold text-xs uppercase tracking-wider">Bộ lọc tìm kiếm</h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-muted hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} /> Đặt lại
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Danh mục ngành hàng</h4>
            <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto pr-1">
              {CATEGORIES_LIST.map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 cursor-pointer hover:text-foreground py-0.5">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.value}
                    onChange={() => handleCategoryChange(cat.value)}
                    className="accent-foreground cursor-pointer"
                  />
                  <span className={selectedCategory === cat.value ? "font-bold text-foreground" : "text-muted"}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
              <span>Giá tối đa</span>
              <span>
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedMaxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="300000"
              max="3000000"
              step="100000"
              value={selectedMaxPrice}
              onChange={(e) => {
                setSelectedMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-foreground cursor-pointer"
            />
          </div>

          {/* Stock Filter */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="accent-foreground cursor-pointer"
              />
              <span>Chỉ hiển thị còn hàng</span>
            </label>
          </div>
        </aside>

        {/* Product Grid / List */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-lg space-y-3">
              <p className="text-muted text-sm">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer"
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
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addItem(p, 1)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-6 text-xs">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1 || loading}
                className="px-3.5 py-2 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium cursor-pointer"
              >
                <ChevronLeft size={14} /> Trang trước
              </button>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  Trang {currentPage}
                </span>
                <span className="text-muted">/ {totalPages}</span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages || loading}
                className="px-3.5 py-2 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium cursor-pointer"
              >
                Trang sau <ChevronRight size={14} />
              </button>
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
