import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import { Prisma } from "@prisma/client";
import { ALL_PRODUCTS } from "@/lib/products-data";

function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`DB_TIMEOUT_${ms}MS`)), ms)
    ),
  ]);
}

export const dynamic = "force-dynamic";

function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

function resolveCategorySlugs(param: string | null): { slugs: string[]; isNew: boolean; isSale: boolean } {
  if (!param) return { slugs: [], isNew: false, isSale: false };

  const rawList = param.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const resolved: string[] = [];
  let isNew = false;
  let isSale = false;

  for (const item of rawList) {
    if (item === "men") {
      resolved.push("ao-nam", "quan-nam");
    } else if (item === "women") {
      resolved.push("ao-nu", "dam-vay", "quan-nu");
    } else if (item === "accessories") {
      resolved.push("phu-kien", "tui-xach-balo");
    } else if (item === "shoes") {
      resolved.push("giay-dep");
    } else if (item === "outerwear") {
      resolved.push("ao-khoac-outerwear");
    } else if (item === "activewear") {
      resolved.push("activewear");
    } else if (item === "ao-thun") {
      resolved.push("ao-nam", "ao-nu");
    } else if (item === "so-mi") {
      resolved.push("ao-nam", "ao-nu");
    } else if (item === "quan") {
      resolved.push("quan-nam", "quan-nu");
    } else if (item === "new") {
      isNew = true;
    } else if (item === "sale") {
      isSale = true;
    } else {
      resolved.push(item);
    }
  }

  return { slugs: Array.from(new Set(resolved)), isNew, isSale };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Phân tích tham số truy vấn
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "16", 10)));
    const skip = (page - 1) * limit;

    const query = searchParams.get("q")?.trim() || "";
    const categoryParam = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : undefined;
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const inStockOnly = searchParams.get("inStock") === "true";
    const isSaleParam = searchParams.get("sale") === "true";
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, price-asc, price-desc, bestselling, rating

    const { slugs: resolvedCategorySlugs, isNew: isCategoryNew, isSale: isCategorySale } =
      resolveCategorySlugs(categoryParam);

    // 2. Cache Key duy nhất
    const cacheKey = `products:${JSON.stringify({
      page,
      limit,
      query,
      categoryParam,
      brandSlug,
      minPrice,
      maxPrice,
      minRating,
      color,
      size,
      inStockOnly,
      isSaleParam,
      sortBy,
    })}`;

    // 3. Thực thi truy vấn với Cache & Timeout 800ms
    const result = await withTimeout(
      getOrSetCache(
        cacheKey,
        async () => {
        const whereClause: Prisma.ProductWhereInput = {
          status: "PUBLISHED",
        };

        // Lọc theo từ khóa tìm kiếm tiếng Việt và không dấu
        if (query) {
          const normQuery = normalizeVietnamese(query);
          const slugQuery = normQuery.replace(/\s+/g, "-");

          whereClause.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: slugQuery, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { keywords: { has: query } },
          ];
        }

        // Lọc theo Danh mục (hỗ trợ đa danh mục và alias)
        if (resolvedCategorySlugs.length > 0) {
          whereClause.category = {
            slug: { in: resolvedCategorySlugs },
          };
        }

        // Lọc Hàng Mới (New Arrivals)
        if (isCategoryNew) {
          whereClause.isNewArrival = true;
        }

        // Lọc Hàng Giảm Giá (Sale)
        if (isSaleParam || isCategorySale) {
          whereClause.compareAtPrice = {
            gt: 0,
          };
        }

        // Lọc theo Brand
        if (brandSlug) {
          whereClause.brand = { slug: brandSlug };
        }

        // Lọc theo Khoảng giá
        if (minPrice !== undefined || maxPrice !== undefined) {
          whereClause.basePrice = {
            gte: minPrice !== undefined ? new Prisma.Decimal(minPrice) : undefined,
            lte: maxPrice !== undefined ? new Prisma.Decimal(maxPrice) : undefined,
          };
        }

        // Lọc theo Đánh giá sao
        if (minRating !== undefined) {
          whereClause.averageRating = { gte: minRating };
        }

        // Lọc theo Biến thể: Màu sắc / Kích cỡ / Còn hàng
        if (color || size || inStockOnly) {
          whereClause.variants = {
            some: {
              ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
              ...(color
                ? {
                    attributes: {
                      path: ["color"],
                      string_contains: color,
                    },
                  }
                : {}),
              ...(size
                ? {
                    attributes: {
                      path: ["size"],
                      string_contains: size,
                    },
                  }
                : {}),
            },
          };
        }

        // Xác định thứ tự sắp xếp
        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
        switch (sortBy) {
          case "price-asc":
            orderBy = { basePrice: "asc" };
            break;
          case "price-desc":
            orderBy = { basePrice: "desc" };
            break;
          case "bestselling":
            orderBy = { salesCount: "desc" };
            break;
          case "rating":
            orderBy = { averageRating: "desc" };
            break;
          case "newest":
          default:
            orderBy = { createdAt: "desc" };
            break;
        }

        // Chạy song song query và count
        const [products, totalCount] = await Promise.all([
          prisma.product.findMany({
            where: whereClause,
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
              brand: {
                select: { id: true, name: true, slug: true },
              },
              category: {
                select: { id: true, name: true, slug: true },
              },
              variants: {
                select: {
                  id: true,
                  sku: true,
                  price: true,
                  compareAtPrice: true,
                  stockQuantity: true,
                  attributes: true,
                },
              },
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.product.count({ where: whereClause }),
        ]);

        // Transform dữ liệu
        const transformedProducts = products.map((item) => {
          const totalStock = item.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
          const isOutOfStock = totalStock === 0;

          let discountPercent = 0;
          if (item.compareAtPrice && Number(item.compareAtPrice) > Number(item.basePrice)) {
            discountPercent = Math.round(
              ((Number(item.compareAtPrice) - Number(item.basePrice)) /
                Number(item.compareAtPrice)) *
                100
            );
          }

          const isNew =
            new Date().getTime() - new Date(item.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            basePrice: Number(item.basePrice),
            compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
            primaryImage: item.images[0]?.url || "/placeholder-product.webp",
            brand: item.brand?.name || null,
            category: item.category?.name || null,
            averageRating: item.averageRating,
            reviewCount: item.reviewCount,
            badges: {
              isNew,
              isOutOfStock,
              discountPercent,
            },
            variantCount: item.variants.length,
          };
        });

        return {
          items: transformedProducts,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1,
          },
        };
      },
      60 // 1 phút caching
    ),
    3500 // Timeout 3.5s cho kết nối database từ xa Supabase
  );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Data-Source": "postgresql",
      },
    });
  } catch (error: any) {
    console.warn("[API_PRODUCTS_FALLBACK]", error.message);

    // Cơ chế Fallback siêu tốc: Sử dụng ALL_PRODUCTS khi DB Supabase offline/timeout
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "16", 10)));
    const query = searchParams.get("q")?.trim() || "";
    const categoryParam = searchParams.get("category");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const inStockOnly = searchParams.get("inStock") === "true";
    const sortBy = searchParams.get("sortBy") || "newest";

    const { slugs: resolvedCategorySlugs, isNew: isCategoryNew, isSale: isCategorySale } =
      resolveCategorySlugs(categoryParam);

    let filtered = ALL_PRODUCTS.map((p) => {
      const isOutOfStock = Boolean(p.badges?.isOutOfStock);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        primaryImage: p.primaryImage,
        brand: typeof p.brand === "string" ? p.brand : (p.brand as any)?.name || null,
        category: typeof p.category === "string" ? p.category : (p.category as any)?.name || null,
        categorySlug: (p as any).categorySlug || "",
        badges: {
          isOutOfStock,
          isNew: Boolean(p.badges?.isNew),
          discountPercent: p.badges?.discountPercent || 0,
        },
        averageRating: p.averageRating || 5,
        reviewCount: p.reviewCount || 0,
        stockQuantity: 20,
      };
    });

    if (resolvedCategorySlugs.length > 0) {
      filtered = filtered.filter((p) => {
        const catSlug = p.categorySlug.toLowerCase();
        const catName = typeof p.category === "string" ? normalizeVietnamese(p.category) : "";
        return resolvedCategorySlugs.some((s) => catSlug === s || catSlug.includes(s) || catName.includes(s));
      });
    }

    if (isCategoryNew) {
      filtered = filtered.filter((p) => p.badges.isNew);
    }

    if (isCategorySale) {
      filtered = filtered.filter((p) => (p.compareAtPrice || 0) > p.basePrice);
    }

    if (query) {
      const normQ = normalizeVietnamese(query);
      filtered = filtered.filter((p) => normalizeVietnamese(p.title).includes(normQ));
    }

    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => p.basePrice >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.basePrice <= maxPrice);
    }
    if (inStockOnly) {
      filtered = filtered.filter((p) => !p.badges.isOutOfStock);
    }

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === "bestselling" || sortBy === "rating") {
      filtered.sort((a, b) => (b.averageRating || 5) - (a.averageRating || 5));
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        items: paginatedItems,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1,
        },
        _debugError: error instanceof Error ? error.message : String(error),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Data-Source": "mock-fallback",
          "X-Fallback-Error": encodeURIComponent((error?.message || "unknown").slice(0, 150)),
        },
      }
    );
  }
}
