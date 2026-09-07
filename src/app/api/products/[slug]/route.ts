import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: "asc" },
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
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            title: true,
            createdAt: true,
            isVerifiedPurchase: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Lấy 4 sản phẩm liên quan cùng category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "PUBLISHED",
      },
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
          select: { stockQuantity: true },
        },
      },
      take: 4,
    });

    const totalStock = product.variants.reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0);
    const isOutOfStock = totalStock === 0;

    let discountPercent = 0;
    if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice)) {
      discountPercent = Math.round(
        ((Number(product.compareAtPrice) - Number(product.basePrice)) /
          Number(product.compareAtPrice)) *
          100
      );
    }

    const isNew =
      new Date().getTime() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;

    // Chuyển đổi reviews
    const formattedReviews = product.reviews.map((r: any) => ({
      id: r.id,
      userName: r.user?.name || "Khách hàng AURA",
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
      comment: r.comment || r.title || "Sản phẩm chất lượng tốt, đúng mô tả.",
      verified: r.isVerifiedPurchase,
    }));

    // Chuyển đổi variants
    const formattedVariants = product.variants.map((v: any) => {
      const attrs = (v.attributes as any) || {};
      return {
        id: v.id,
        sku: v.sku,
        color: attrs.color || "Tiêu chuẩn",
        size: attrs.size || "Tiêu chuẩn",
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        stock: v.stockQuantity,
      };
    });

    const formattedRelated = relatedProducts.map((p: any) => {
      const relStock = (p.variants || []).reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        primaryImage: p.images?.[0]?.url || "/placeholder-product.webp",
        brand: p.brand?.name,
        category: p.category?.name,
        badges: {
          isOutOfStock: relStock === 0,
        },
      };
    });

    const primaryImgUrl = product.images?.[0]?.url || "/placeholder-product.webp";
    const allImages = (product.images && product.images.length > 0)
      ? product.images.map((img: any) => img.url)
      : [primaryImgUrl];

    const responseData = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      primaryImage: primaryImgUrl,
      images: allImages,
      description: product.shortDescription || (product.descriptionHtml ? product.descriptionHtml.replace(/<[^>]*>?/gm, "") : ""),
      descriptionHtml: product.descriptionHtml,
      specifications: (product.specifications as Record<string, string>) || {
        "Xuất xứ": "Việt Nam",
        "Bảo hành": "Đổi trả miễn phí 30 ngày",
      },
      brand: product.brand?.name || "AURA Studio",
      category: product.category?.name || "Thời trang",
      categorySlug: product.category?.slug || "",
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      badges: {
        isNew,
        isOutOfStock,
        discountPercent,
      },
      variants: formattedVariants,
      reviews: formattedReviews,
      relatedProducts: formattedRelated,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[API_PRODUCT_SLUG_ERROR]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
