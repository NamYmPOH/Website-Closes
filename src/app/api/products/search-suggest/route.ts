import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const normQuery = normalizeVietnamese(q);
    const slugQuery = normQuery.replace(/\s+/g, "-");

    // Tìm kiếm trong DB qua Prisma
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: slugQuery, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        compareAtPrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        brand: {
          select: { name: true },
        },
      },
      take: 20,
    });

    // Tính điểm liên quan (Relevance Scoring)
    const scored = products.map((p) => {
      const normTitle = normalizeVietnamese(p.title);
      let score = 0;

      if (normTitle === normQuery) {
        score += 100; // Khớp chính xác hoàn toàn
      } else if (normTitle.startsWith(normQuery)) {
        score += 75; // Bắt đầu bằng từ khóa
      } else if (normTitle.includes(normQuery)) {
        score += 50; // Chứa từ khóa
      } else if (p.slug.includes(slugQuery)) {
        score += 35; // Khớp theo slug
      }

      if (p.category?.name && normalizeVietnamese(p.category.name).includes(normQuery)) {
        score += 20;
      }
      if (p.brand?.name && normalizeVietnamese(p.brand.name).includes(normQuery)) {
        score += 15;
      }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        primaryImage: p.images[0]?.url || "/placeholder-product.webp",
        categoryName: p.category?.name || "",
        brandName: p.brand?.name || "",
        score,
      };
    });

    // Sắp xếp theo độ liên quan giảm dần và lấy tối đa 8 kết quả
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, 8);

    return NextResponse.json({ items: topResults });
  } catch (error: any) {
    console.warn("[SEARCH_SUGGEST_ERROR]", error.message);
    return NextResponse.json({ items: [] });
  }
}
