import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

// Định nghĩa các gói đổi điểm theo yêu cầu
const REDEEM_OPTIONS: Record<
  number,
  {
    requiredPoints: number;
    discountType: "fixed" | "percent";
    discountValue: number;
    label: string;
  }
> = {
  50: {
    requiredPoints: 50,
    discountType: "fixed",
    discountValue: 500,
    label: "Voucher giảm 500đ",
  },
  100: {
    requiredPoints: 100,
    discountType: "fixed",
    discountValue: 1000,
    label: "Voucher giảm 1.000đ",
  },
  200: {
    requiredPoints: 200,
    discountType: "percent",
    discountValue: 2,
    label: "Voucher giảm 2% giá trị đơn",
  },
  500: {
    requiredPoints: 500,
    discountType: "percent",
    discountValue: 5,
    label: "Voucher giảm 5% giá trị đơn",
  },
};

function generateUniqueVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AURA-${segment1}-${segment2}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện đổi điểm thưởng" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const points = Number(body.points);

    const option = REDEEM_OPTIONS[points];
    if (!option) {
      return NextResponse.json(
        { error: "Gói đổi điểm không hợp lệ. Cho phép: 50, 100, 200, 500 điểm" },
        { status: 400 }
      );
    }

    // Atomic transaction đổi điểm
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra số dư điểm
      const userPoints = await tx.userPoints.findUnique({
        where: { userId },
      });

      const currentAvailable = userPoints?.availablePoints || 0;
      if (currentAvailable < option.requiredPoints) {
        throw new Error(
          `Bạn không đủ điểm để đổi voucher này (cần ${option.requiredPoints} điểm, hiện có ${currentAvailable} điểm).`
        );
      }

      // 2. Trừ điểm người dùng
      const updatedUserPoints = await tx.userPoints.update({
        where: { userId },
        data: {
          availablePoints: { decrement: option.requiredPoints },
          usedPoints: { increment: option.requiredPoints },
        },
      });

      // 3. Sinh mã voucher độc nhất (thử tối đa 5 lần tránh trùng lặp)
      let voucherCode = generateUniqueVoucherCode();
      let exists = await tx.voucher.findUnique({ where: { code: voucherCode } });
      let attempts = 0;
      while (exists && attempts < 5) {
        voucherCode = generateUniqueVoucherCode();
        exists = await tx.voucher.findUnique({ where: { code: voucherCode } });
        attempts++;
      }

      // Hạn sử dụng: 30 ngày
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // 4. Tạo voucher trong DB
      const voucher = await tx.voucher.create({
        data: {
          code: voucherCode,
          discountType: option.discountType,
          discountValue: option.discountValue,
          minOrder: 0,
          expiryDate,
          isUsed: false,
          userId,
          createdFromPoints: true,
        },
      });

      // 5. Ghi lịch sử đổi điểm
      await tx.pointsHistory.create({
        data: {
          userId,
          action: "redeem",
          points: -option.requiredPoints,
          description: `Đổi ${option.requiredPoints} điểm lấy ${option.label} (Mã: ${voucherCode})`,
        },
      });

      return {
        voucher,
        remainingPoints: updatedUserPoints.availablePoints,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Đổi voucher thành công! Mã giảm giá của bạn: ${result.voucher.code}`,
      voucher: {
        id: result.voucher.id,
        code: result.voucher.code,
        discountType: result.voucher.discountType,
        discountValue: Number(result.voucher.discountValue),
        expiryDate: new Date(result.voucher.expiryDate).toLocaleDateString("vi-VN"),
      },
      remainingPoints: result.remainingPoints,
    });
  } catch (error: any) {
    console.error("POST /api/points/redeem error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi đổi điểm lấy voucher" },
      { status: 400 }
    );
  }
}
