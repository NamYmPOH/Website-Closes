"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import {
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Check,
  SearchX,
  PackageOpen,
} from "lucide-react";

const CATEGORIES_LIST = [
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

const PRICE_PRESETS = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 500.000₫", min: undefined, max: 500000 },
  { label: "500k - 1.000.000₫", min: 500000, max: 1000000 },
  { label: "1.000.000₫ - 2.000.000₫", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000₫", min: 2000000, max: undefined },
];

const SIZES_LIST = ["S", "M", "L", "XL"];
const COLORS_LIST = [
  { name: "Đen", hex: "#111111" },
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Be", hex: "#E3DAC9" },
  { name: "Xám", hex: "#8E9297" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Rêu", hex: "#556B2F" },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params
  const initialCategoryParam = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
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
    if (initialCategoryParam === "women") return ["ao-nu", "dam-vay", "quan-nu"];
    if (initialCategoryParam === "accessories") return ["phu-kien", "tui-xach-balo"];
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
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Đồng bộ State khi URL params thay đổi (back / forward)
  useEffect(() => {
    if (initialCategoryParam) {
      if (initialCategoryParam === "men") setSelectedCategories(["ao-nam", "quan-nam"]);
      else if (initialCategoryParam === "women") setSelectedCategories(["ao-nu", "dam-vay", "quan-nu"]);
      else if (initialCategoryParam === "accessories") setSelectedCategories(["phu-kien", "tui-xach-balo"]);
      else setSelectedCategories(initialCategoryParam.split(",").map((s) => s.trim()).filter(Boolean));
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
  }, [searchParams]);

  // Cập nhật URL Query params
  const syncParamsToUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

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
  const activeTags: { label: string; onRemove: () => void }[] = [];

  if (initialQuery) {
    activeTags.push({
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
    activeTags.push({
      label: found ? found.label : catVal,
      onRemove: () => handleToggleCategory(catVal),
    });
  });

  if (minPrice !== undefined || maxPrice !== undefined) {
    let priceLabel = "";
    if (minPrice !== undefined && maxPrice !== undefined) {
      priceLabel = `${new Intl.NumberFormat("vi-VN").format(minPrice)}₫ - ${new Intl.NumberFormat("vi-VN").format(maxPrice)}₫`;
    } else if (minPrice !== undefined) {
      priceLabel = `Từ ${new Intl.NumberFormat("vi-VN").format(minPrice)}₫`;
    } else if (maxPrice !== undefined) {
      priceLabel = `Dưới ${new Intl.NumberFormat("vi-VN").format(maxPrice)}₫`;
    }
    activeTags.push({
      label: priceLabel,
      onRemove: () => handlePricePreset(undefined, undefined),
    });
  }

  if (inStockOnly) {
    activeTags.push({
      label: "Còn hàng",
      onRemove: () => {
        setInStockOnly(false);
        syncParamsToUrl({ inStock: undefined });
      },
    });
  }

  if (selectedSize) {
    activeTags.push({
      label: `Size: ${selectedSize}`,
      onRemove: () => {
        setSelectedSize("");
        syncParamsToUrl({ size: undefined });
      },
    });
  }

  if (selectedColor) {
    activeTags.push({
      label: `Màu: ${selectedColor}`,
      onRemove: () => {
        setSelectedColor("");
        syncParamsToUrl({ color: undefined });
      },
    });
  }

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
              {initialQuery ? `Kết quả tìm kiếm: "${initialQuery}"` : "Bộ sưu tập sản phẩm"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold border border-border flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> {totalCount.toLocaleString()} sản phẩm
            </span>
          </div>
        </div>

        {/* View & Sort Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            <SlidersHorizontal size={14} /> Bộ lọc {activeTags.length > 0 && `(${activeTags.length})`}
          </button>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-md p-0.5">
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded transition ${
                !isListView ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
              title="Dạng lưới"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded transition ${
                isListView ? "bg-foreground text-background" : "text-muted hover:text-foreground"
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
        <aside className="hidden md:block space-y-8 pr-4 border-r border-border text-xs">
          {/* Header bộ lọc */}
          <div className="flex items-center justify-between">
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

          {/* 1. Danh mục đa lựa chọn (Checkboxes) */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">Danh mục</h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {CATEGORIES_LIST.map((cat) => {
                const checked = selectedCategories.includes(cat.value);
                return (
                  <label
                    key={cat.value}
                    className="flex items-center gap-2.5 cursor-pointer text-foreground/80 hover:text-foreground select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCategory(cat.value)}
                      className="w-4 h-4 rounded border-border accent-foreground cursor-pointer"
                    />
                    <span className={checked ? "font-bold text-foreground" : "font-normal"}>
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Khoảng giá (Presets & Dual Range) */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">Khoảng giá</h4>
            <div className="space-y-1.5">
              {PRICE_PRESETS.map((preset, idx) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePricePreset(preset.min, preset.max)}
                    className={`block w-full text-left px-2.5 py-1.5 rounded transition ${
                      isSelected
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground/80"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Dual Inputs */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ (₫)"
                value={minPrice || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setMinPrice(val);
                  syncParamsToUrl({ minPrice: val?.toString() });
                }}
                className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] outline-none focus:border-foreground"
              />
              <span className="text-muted">-</span>
              <input
                type="number"
                placeholder="Đến (₫)"
                value={maxPrice || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setMaxPrice(val);
                  syncParamsToUrl({ maxPrice: val?.toString() });
                }}
                className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* 3. Lọc Kích Cỡ (Sizes) */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">Kích cỡ</h4>
            <div className="flex flex-wrap gap-2">
              {SIZES_LIST.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => {
                      const next = isSelected ? "" : sz;
                      setSelectedSize(next);
                      setCurrentPage(1);
                      syncParamsToUrl({ size: next || undefined, page: "1" });
                    }}
                    className={`w-9 h-9 rounded border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/60 text-foreground"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Lọc Màu Sắc (Colors) */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-muted">Màu sắc</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS_LIST.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      const next = isSelected ? "" : c.name;
                      setSelectedColor(next);
                      setCurrentPage(1);
                      syncParamsToUrl({ color: next || undefined, page: "1" });
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/60 text-foreground"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tồn kho */}
          <div className="border-t border-border pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                  syncParamsToUrl({
                    inStock: e.target.checked ? "true" : undefined,
                    page: "1",
                  });
                }}
                className="w-4 h-4 rounded border-border accent-foreground cursor-pointer"
              />
              <span className={inStockOnly ? "font-bold text-foreground" : "font-normal"}>
                Chỉ hiện sản phẩm còn hàng
              </span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          {/* Active Filter Tags Bar */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs text-muted font-medium">Đang lọc:</span>
              {activeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-foreground border border-border"
                >
                  {tag.label}
                  <button
                    onClick={tag.onRemove}
                    className="hover:text-red-500 transition cursor-pointer"
                    aria-label={`Xóa bộ lọc ${tag.label}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-xs text-muted hover:text-red-500 underline ml-2 font-medium cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Products Render: Loading Skeleton / Results / Empty State */}
          {loading ? (
            <div
              className={
                isListView
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-2 lg:grid-cols-3 gap-6"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={
                    isListView
                      ? "flex gap-4 p-4 border border-border rounded-xl animate-pulse"
                      : "flex flex-col space-y-3 animate-pulse"
                  }
                >
                  <div
                    className={
                      isListView
                        ? "w-36 h-44 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                        : "aspect-[3/4] w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                    }
                  />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="py-20 px-4 text-center border border-dashed border-border rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted flex items-center justify-center mx-auto">
                <SearchX size={32} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold uppercase tracking-tight text-foreground">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Rất tiếc, không có sản phẩm nào khớp với các tiêu chí lọc hiện tại của bạn. Hãy thử xóa bớt điều kiện lọc hoặc tìm từ khóa khác.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={13} /> Đặt lại tất cả bộ lọc
                </button>
              </div>
            </div>
          ) : (
            /* Products List / Grid */
            <div
              className={
                isListView
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-2 lg:grid-cols-3 gap-6"
              }
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12 border-t border-border">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border border-border rounded-md text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNumber = idx + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNumber = currentPage - 2 + idx;
                    if (pageNumber > totalPages) pageNumber = totalPages - (4 - idx);
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-md font-semibold transition cursor-pointer ${
                        currentPage === pageNumber
                          ? "bg-foreground text-background"
                          : "border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-border rounded-md text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs bg-background h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} /> Bộ lọc sản phẩm
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-md text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-semibold uppercase tracking-wider text-muted">Danh mục</h4>
                <div className="space-y-2">
                  {CATEGORIES_LIST.map((cat) => {
                    const checked = selectedCategories.includes(cat.value);
                    return (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleCategory(cat.value)}
                          className="w-4 h-4 rounded border-border accent-foreground"
                        />
                        <span className={checked ? "font-bold" : "font-normal"}>
                          {cat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold uppercase tracking-wider text-muted">Khoảng giá</h4>
                <div className="space-y-1.5">
                  {PRICE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePricePreset(preset.min, preset.max)}
                      className={`block w-full text-left px-2.5 py-1.5 rounded ${
                        minPrice === preset.min && maxPrice === preset.max
                          ? "bg-foreground text-background font-semibold"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold uppercase tracking-wider text-muted">Kích cỡ</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES_LIST.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        const next = selectedSize === sz ? "" : sz;
                        setSelectedSize(next);
                        syncParamsToUrl({ size: next || undefined });
                      }}
                      className={`w-9 h-9 rounded border text-xs font-semibold ${
                        selectedSize === sz
                          ? "bg-foreground text-background border-foreground"
                          : "border-border"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <div className="border-t border-border pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      syncParamsToUrl({ inStock: e.target.checked ? "true" : undefined });
                    }}
                    className="w-4 h-4 rounded border-border accent-foreground"
                  />
                  <span>Chỉ hiện sản phẩm còn hàng</span>
                </label>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-border rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold uppercase tracking-wider"
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
