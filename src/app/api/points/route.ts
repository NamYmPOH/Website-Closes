import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      // Cho phép lấy điểm mẫu nếu khách chưa đăng nhập
      return NextResponse.json({
        availablePoints: 0,
        totalPoints: 0,
        usedPoints: 0,
        history: [],
        vouchers: [],
        authenticated: false,
      });
    }

    // Lấy thông tin điểm của người dùng
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId },
    });

    // Lấy lịch sử điểm
    const history = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Lấy danh sách voucher đổi từ điểm
    const vouchers = await prisma.voucher.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      authenticated: true,
      availablePoints: userPoints?.availablePoints || 0,
      totalPoints: userPoints?.totalPoints || 0,
      usedPoints: userPoints?.usedPoints || 0,
      history: history.map((h) => ({
        id: h.id,
        action: h.action,
        points: h.points,
        description: h.description,
        date: new Date(h.createdAt).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })),
      vouchers: vouchers.map((v) => ({
        id: v.id,
        code: v.code,
        discountType: v.discountType,
        discountValue: Number(v.discountValue),
        minOrder: Number(v.minOrder),
        expiryDate: new Date(v.expiryDate).toLocaleDateString("vi-VN"),
        isExpired: new Date() > new Date(v.expiryDate),
        isUsed: v.isUsed,
        createdAt: new Date(v.createdAt).toLocaleDateString("vi-VN"),
      })),
    });
  } catch (error: any) {
    console.error("GET /api/points error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thông tin điểm thưởng" }, { status: 500 });
  }
}
