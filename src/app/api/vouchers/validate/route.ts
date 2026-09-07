import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const body = await request.json();
    const rawCode = (body.code || "").trim().toUpperCase();
    const orderTotal = Number(body.orderTotal) || 0;

    if (!rawCode) {
      return NextResponse.json({ error: "Vui lòng nhập mã giảm giá" }, { status: 400 });
    }

    // 1. Kiểm tra trong bảng Voucher (Mã đổi từ điểm thưởng)
    const voucher = await prisma.voucher.findUnique({
      where: { code: rawCode },
    });

    if (voucher) {
      if (voucher.isUsed) {
        return NextResponse.json(
          { valid: false, message: "Mã giảm giá này đã được sử dụng." },
          { status: 400 }
        );
      }

      const now = new Date();
      if (new Date(voucher.expiryDate) < now) {
        return NextResponse.json(
          { valid: false, message: "Mã giảm giá này đã hết hạn sử dụng." },
          { status: 400 }
        );
      }

      if (voucher.userId && currentUserId && voucher.userId !== currentUserId) {
        return NextResponse.json(
          { valid: false, message: "Mã giảm giá này thuộc về tài khoản khác." },
          { status: 400 }
        );
      }

      if (orderTotal < Number(voucher.minOrder)) {
        return NextResponse.json(
          {
            valid: false,
            message: `Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat("vi-VN").format(
              Number(voucher.minOrder)
            )}₫ để áp dụng mã này.`,
          },
          { status: 400 }
        );
      }

      let discountAmount = 0;
      if (voucher.discountType === "fixed") {
        discountAmount = Math.min(Number(voucher.discountValue), orderTotal);
      } else if (voucher.discountType === "percent") {
        discountAmount = Math.round((orderTotal * Number(voucher.discountValue)) / 100);
      }

      return NextResponse.json({
        valid: true,
        source: "voucher",
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: Number(voucher.discountValue),
        discountAmount,
        message:
          voucher.discountType === "percent"
            ? `Áp dụng thành công! Giảm ${voucher.discountValue}% (${new Intl.NumberFormat("vi-VN").format(discountAmount)}₫)`
            : `Áp dụng thành công! Giảm ${new Intl.NumberFormat("vi-VN").format(discountAmount)}₫`,
      });
    }

    // 2. Kiểm tra trong bảng Coupon mặc định (như AURA10, FREESHIP)
    const coupon = await prisma.coupon.findUnique({
      where: { code: rawCode },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      if (coupon.startDate > now || coupon.endDate < now) {
        return NextResponse.json(
          { valid: false, message: "Mã khuyến mãi hiện không trong thời gian áp dụng." },
          { status: 400 }
        );
      }

      if (orderTotal < Number(coupon.minOrderValue)) {
        return NextResponse.json(
          {
            valid: false,
            message: `Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat("vi-VN").format(
              Number(coupon.minOrderValue)
            )}₫ để áp dụng mã này.`,
          },
          { status: 400 }
        );
      }

      let discountAmount = 0;
      if (coupon.discountType === "PERCENTAGE") {
        const calc = (orderTotal * Number(coupon.discountValue)) / 100;
        discountAmount = coupon.maxDiscount ? Math.min(calc, Number(coupon.maxDiscount)) : calc;
      } else if (coupon.discountType === "FIXED_AMOUNT") {
        discountAmount = Math.min(Number(coupon.discountValue), orderTotal);
      } else if (coupon.discountType === "FREE_SHIPPING") {
        discountAmount = 30000; // Miễn phí vận chuyển
      }

      return NextResponse.json({
        valid: true,
        source: "coupon",
        code: coupon.code,
        discountType: coupon.discountType.toLowerCase(),
        discountValue: Number(coupon.discountValue),
        discountAmount,
        message: `Áp dụng mã ${coupon.code} thành công: Giảm ${new Intl.NumberFormat("vi-VN").format(discountAmount)}₫!`,
      });
    }

    // Mã tĩnh fallback
    if (rawCode === "AURA10") {
      const discountAmount = Math.round((orderTotal * 10) / 100);
      return NextResponse.json({
        valid: true,
        source: "static",
        code: "AURA10",
        discountType: "percent",
        discountValue: 10,
        discountAmount,
        message: "Áp dụng mã AURA10: Giảm 10% thành công!",
      });
    }

    if (rawCode === "FREESHIP") {
      return NextResponse.json({
        valid: true,
        source: "static",
        code: "FREESHIP",
        discountType: "fixed",
        discountValue: 30000,
        discountAmount: 30000,
        message: "Áp dụng mã FREESHIP: Miễn phí vận chuyển!",
      });
    }

    return NextResponse.json(
      { valid: false, message: "Mã giảm giá không tồn tại hoặc đã hết hạn." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("POST /api/vouchers/validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Lỗi hệ thống khi kiểm tra mã giảm giá." },
      { status: 500 }
    );
  }
}
