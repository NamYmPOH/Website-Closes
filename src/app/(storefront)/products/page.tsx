"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import {
  ProductFilters,
  CATEGORIES_LIST,
} from "@/components/features/products/ProductFilters";
import {
  ProductActiveTags,
  ActiveTagItem,
} from "@/components/features/products/ProductActiveTags";
import { ProductPagination } from "@/components/features/products/ProductPagination";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCartStore } from "@/stores/cartStore";
import { ProductItem } from "@/types/product";
import { formatCurrency } from "@/lib/utils/format";
import {
  SlidersHorizontal,
  Grid,
  List,
  Sparkles,
  X,
  SearchX,
} from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params
  const initialCategoryParam = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const initialMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const initialInStock = searchParams.get("inStock") === "true";
  const initialSortBy = searchParams.get("sortBy") || "newest";
  const initialSize = searchParams.get("size") || "";
  const initialColor = searchParams.get("color") || "";
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const { addItem } = useCartStore();

  // Selected categories array
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (!initialCategoryParam) return [];
    if (initialCategoryParam === "men") return ["ao-nam", "quan-nam"];
    if (initialCategoryParam === "women")
      return ["ao-nu", "dam-vay", "quan-nu"];
    if (initialCategoryParam === "accessories")
      return ["phu-kien", "tui-xach-balo"];
    return initialCategoryParam.split(",").map((s) => s.trim()).filter(Boolean);
  });

  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [isListView, setIsListView] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Data from API
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Đồng bộ State khi URL params thay đổi
  useEffect(() => {
    if (initialCategoryParam) {
      if (initialCategoryParam === "men")
        setSelectedCategories(["ao-nam", "quan-nam"]);
      else if (initialCategoryParam === "women")
        setSelectedCategories(["ao-nu", "dam-vay", "quan-nu"]);
      else if (initialCategoryParam === "accessories")
        setSelectedCategories(["phu-kien", "tui-xach-balo"]);
      else
        setSelectedCategories(
          initialCategoryParam.split(",").map((s) => s.trim()).filter(Boolean)
        );
    } else {
      setSelectedCategories([]);
    }
    setMinPrice(initialMinPrice);
    setMaxPrice(initialMaxPrice);
    setInStockOnly(initialInStock);
    setSelectedSize(initialSize);
    setSelectedColor(initialColor);
    setSortBy(initialSortBy);
    setCurrentPage(initialPage);
  }, [
    initialCategoryParam,
    initialMinPrice,
    initialMaxPrice,
    initialInStock,
    initialSize,
    initialColor,
    initialSortBy,
    initialPage,
  ]);

  // Cập nhật URL Query params
  const syncParamsToUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === "" || val === null) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      router.replace(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch dữ liệu sản phẩm từ API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "20");

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (initialQuery) params.set("q", initialQuery);
    if (sortBy) params.set("sortBy", sortBy);
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    if (inStockOnly) params.set("inStock", "true");
    if (selectedSize) params.set("size", selectedSize);
    if (selectedColor) params.set("color", selectedColor);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.items)) {
          setProducts(data.items);
          setTotalCount(data.pagination?.totalCount || 0);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Lỗi khi tải sản phẩm từ API:", err);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    selectedCategories,
    initialQuery,
    sortBy,
    minPrice,
    maxPrice,
    inStockOnly,
    selectedSize,
    selectedColor,
    currentPage,
  ]);

  // Toggle Category Checkbox
  const handleToggleCategory = (catValue: string) => {
    let next: string[];
    if (selectedCategories.includes(catValue)) {
      next = selectedCategories.filter((c) => c !== catValue);
    } else {
      next = [...selectedCategories, catValue];
    }
    setSelectedCategories(next);
    setCurrentPage(1);
    syncParamsToUrl({
      category: next.length > 0 ? next.join(",") : undefined,
      page: "1",
    });
  };

  // Preset Price change
  const handlePricePreset = (presetMin?: number, presetMax?: number) => {
    setMinPrice(presetMin);
    setMaxPrice(presetMax);
    setCurrentPage(1);
    syncParamsToUrl({
      minPrice: presetMin?.toString(),
      maxPrice: presetMax?.toString(),
      page: "1",
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setSelectedSize("");
    setSelectedColor("");
    setSortBy("newest");
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (initialQuery) params.set("q", initialQuery);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  // Change Sort
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    syncParamsToUrl({ sortBy: newSort, page: "1" });
  };

  // Change Page with Smooth Scroll to top
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    syncParamsToUrl({ page: newPage.toString() });
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Active filters list for tag bar
  const activeTags: ActiveTagItem[] = useMemo(() => {
    const list: ActiveTagItem[] = [];

    if (initialQuery) {
      list.push({
        label: `Từ khóa: "${initialQuery}"`,
        onRemove: () => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("q");
          router.replace(`/products?${params.toString()}`);
        },
      });
    }

    selectedCategories.forEach((catVal) => {
      const found = CATEGORIES_LIST.find((c) => c.value === catVal);
      list.push({
        label: found ? found.label : catVal,
        onRemove: () => handleToggleCategory(catVal),
      });
    });

    if (minPrice !== undefined || maxPrice !== undefined) {
      let priceLabel = "";
      if (minPrice !== undefined && maxPrice !== undefined) {
        priceLabel = `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
      } else if (minPrice !== undefined) {
        priceLabel = `Từ ${formatCurrency(minPrice)}`;
      } else if (maxPrice !== undefined) {
        priceLabel = `Dưới ${formatCurrency(maxPrice)}`;
      }
      list.push({
        label: priceLabel,
        onRemove: () => handlePricePreset(undefined, undefined),
      });
    }

    if (inStockOnly) {
      list.push({
        label: "Còn hàng",
        onRemove: () => {
          setInStockOnly(false);
          syncParamsToUrl({ inStock: undefined });
        },
      });
    }

    if (selectedSize) {
      list.push({
        label: `Size: ${selectedSize}`,
        onRemove: () => {
          setSelectedSize("");
          syncParamsToUrl({ size: undefined });
        },
      });
    }

    if (selectedColor) {
      list.push({
        label: `Màu: ${selectedColor}`,
        onRemove: () => {
          setSelectedColor("");
          syncParamsToUrl({ color: undefined });
        },
      });
    }

    return list;
  }, [
    initialQuery,
    searchParams,
    router,
    selectedCategories,
    minPrice,
    maxPrice,
    inStockOnly,
    selectedSize,
    selectedColor,
    syncParamsToUrl,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-border gap-4">
        <div>
          <nav className="text-xs text-muted mb-2">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>{" "}
            / <span>Sản phẩm</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
              {initialQuery
                ? `Kết quả tìm kiếm: "${initialQuery}"`
                : "Bộ sưu tập sản phẩm"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold border border-border flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />{" "}
              {totalCount.toLocaleString()} sản phẩm
            </span>
          </div>
        </div>

        {/* View & Sort Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <SlidersHorizontal size={14} /> Bộ lọc{" "}
            {activeTags.length > 0 && `(${activeTags.length})`}
          </button>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-md p-0.5">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded transition cursor-pointer ${
                !isListView
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
              title="Dạng lưới"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded transition cursor-pointer ${
                isListView
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
              title="Dạng danh sách"
            >
              <List size={15} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-xs font-semibold uppercase tracking-wider bg-background focus:outline-none cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="bestselling">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Sidebar & Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block pr-4 border-r border-border">
          <div className="flex items-center justify-between pb-6">
            <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <SlidersHorizontal size={15} /> Bộ lọc
            </h3>
            {activeTags.length > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-muted hover:text-red-500 font-medium transition cursor-pointer"
              >
                Đặt lại tất cả
              </button>
            )}
          </div>

          <ProductFilters
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPricePreset={handlePricePreset}
            onMinPriceChange={(val) => {
              setMinPrice(val);
              syncParamsToUrl({ minPrice: val?.toString() });
            }}
            onMaxPriceChange={(val) => {
              setMaxPrice(val);
              syncParamsToUrl({ maxPrice: val?.toString() });
            }}
            selectedSize={selectedSize}
            onSizeChange={(val) => {
              setSelectedSize(val);
              syncParamsToUrl({ size: val || undefined });
            }}
            selectedColor={selectedColor}
            onColorChange={(val) => {
              setSelectedColor(val);
              syncParamsToUrl({ color: val || undefined });
            }}
            inStockOnly={inStockOnly}
            onInStockToggle={(checked) => {
              setInStockOnly(checked);
              syncParamsToUrl({ inStock: checked ? "true" : undefined });
            }}
          />
        </aside>

        {/* Product Grid & Active Tags */}
        <main className="md:col-span-3 flex flex-col justify-between min-h-[600px]">
          <div>
            <ProductActiveTags
              tags={activeTags}
              onResetAll={handleResetFilters}
            />

            {/* Loading Skeleton */}
            {loading ? (
              <div
                className={`pt-6 ${
                  isListView
                    ? "space-y-4"
                    : "grid grid-cols-2 lg:grid-cols-3 gap-6"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="pt-8">
                <EmptyState
                  icon={SearchX}
                  title="Không tìm thấy sản phẩm phù hợp"
                  description="Hãy thử bỏ bớt bộ lọc hoặc tìm kiếm với từ khóa khác để tìm thấy sản phẩm mong muốn."
                  actionLabel="Đặt lại bộ lọc"
                  onAction={handleResetFilters}
                />
              </div>
            ) : (
              <div
                className={`pt-6 ${
                  isListView
                    ? "space-y-4"
                    : "grid grid-cols-2 lg:grid-cols-3 gap-6"
                }`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isListView={isListView}
                    onAddToCart={(p) => addItem(p, 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>

      {/* Mobile Filter Slide-over Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-background h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} /> Bộ lọc sản phẩm
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-md text-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body - Reusing ProductFilters component */}
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilters
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPricePreset={handlePricePreset}
                onMinPriceChange={(val) => {
                  setMinPrice(val);
                  syncParamsToUrl({ minPrice: val?.toString() });
                }}
                onMaxPriceChange={(val) => {
                  setMaxPrice(val);
                  syncParamsToUrl({ maxPrice: val?.toString() });
                }}
                selectedSize={selectedSize}
                onSizeChange={(val) => {
                  setSelectedSize(val);
                  syncParamsToUrl({ size: val || undefined });
                }}
                selectedColor={selectedColor}
                onColorChange={(val) => {
                  setSelectedColor(val);
                  syncParamsToUrl({ color: val || undefined });
                }}
                inStockOnly={inStockOnly}
                onInStockToggle={(checked) => {
                  setInStockOnly(checked);
                  syncParamsToUrl({ inStock: checked ? "true" : undefined });
                }}
              />
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-border rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
              >
                Xem ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-muted">
          Đang tải danh sách sản phẩm...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
