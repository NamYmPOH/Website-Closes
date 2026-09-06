import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Phân tích tham số truy vấn
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "16", 10)));
    const skip = (page - 1) * limit;

    const query = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : undefined;
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const inStockOnly = searchParams.get("inStock") === "true";
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, price-asc, price-desc, bestselling, rating

    // 2. Tạo Cache Key duy nhất theo Filter Params
    const cacheKey = `products:${JSON.stringify({
      page,
      limit,
      query,
      categorySlug,
      brandSlug,
      minPrice,
      maxPrice,
      minRating,
      color,
      size,
      inStockOnly,
      sortBy,
    })}`;

    // 3. Thực thi truy vấn với Cache-aside (Redis TTL 120s)
    const result = await getOrSetCache(
      cacheKey,
      async () => {
        // Xây dựng điều kiện WHERE động
        const whereClause: Prisma.ProductWhereInput = {
          status: "PUBLISHED",
        };

        // Lọc theo từ khóa tìm kiếm (Title, Meta Keywords)
        if (query) {
          whereClause.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { keywords: { has: query } },
          ];
        }

        // Lọc theo Category
        if (categorySlug) {
          whereClause.category = { slug: categorySlug };
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

        // Xác định thứ tự sắp xếp (Sorting)
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

        // Chạy song song query dữ liệu và đếm tổng số bản ghi
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

        // Transform và gắn Dynamic Badges (NEW, SALE %, OUT_OF_STOCK)
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
            new Date().getTime() - new Date(item.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            basePrice: Number(item.basePrice),
            compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
            primaryImage: item.images[0]?.url || "/placeholder-product.webp",
            brand: item.brand,
            category: item.category,
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
      120 // Caching trong 2 phút
    );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Data-Source": "postgresql",
      },
    });
  } catch (error: any) {
    console.warn("[API_PRODUCTS_DB_FALLBACK]", error.message);

    // Dữ liệu mẫu dự phòng khi database chưa được khởi động (Graceful Degradation)
    const fallbackProducts = [
      {
        id: "prod-1",
        title: "Áo Thun Heavyweight Organic Cotton",
        slug: "ao-thun-heavyweight-organic-cotton",
        basePrice: 420000,
        compareAtPrice: 550000,
        primaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
        brand: { id: "b1", name: "AURA Essentials", slug: "aura-essentials" },
        category: { id: "c1", name: "Áo", slug: "ao" },
        averageRating: 4.9,
        reviewCount: 128,
        badges: { isNew: true, isOutOfStock: false, discountPercent: 24 },
        variantCount: 4,
      },
      {
        id: "prod-2",
        title: "Quần Linen Relaxed Trousers",
        slug: "quan-linen-relaxed-trousers",
        basePrice: 790000,
        compareAtPrice: null,
        primaryImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
        brand: { id: "b2", name: "AURA Tailored", slug: "aura-tailored" },
        category: { id: "c2", name: "Quần", slug: "quan" },
        averageRating: 4.8,
        reviewCount: 94,
        badges: { isNew: true, isOutOfStock: false, discountPercent: 0 },
        variantCount: 3,
      },
      {
        id: "prod-3",
        title: "Túi Tote Canvas Nhật Bản Tối Giản",
        slug: "tui-tote-canvas-nhat-ban",
        basePrice: 350000,
        compareAtPrice: 450000,
        primaryImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        brand: { id: "b3", name: "AURA Objects", slug: "aura-objects" },
        category: { id: "c3", name: "Phụ kiện", slug: "phu-kien" },
        averageRating: 5.0,
        reviewCount: 62,
        badges: { isNew: false, isOutOfStock: false, discountPercent: 22 },
        variantCount: 2,
      },
    ];

    return NextResponse.json(
      {
        items: fallbackProducts,
        pagination: {
          page: 1,
          limit: 16,
          totalCount: fallbackProducts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        notice: "Đang phục vụ dữ liệu mẫu (Database chưa kết nối hoặc đang khởi động)",
      },
      {
        status: 200,
        headers: {
          "X-Data-Source": "fallback-catalog",
        },
      }
    );
  }
}
