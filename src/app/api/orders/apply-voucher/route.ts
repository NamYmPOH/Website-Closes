import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const body = await request.json();
    const { code, orderId } = body;

    if (!code || !orderId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp mã voucher và mã đơn hàng" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Tìm voucher
    const voucher = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Không tìm thấy mã giảm giá trong hệ thống" },
        { status: 404 }
      );
    }

    if (voucher.isUsed) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã được sử dụng trước đó" },
        { status: 400 }
      );
    }

    // Đánh dấu voucher đã dùng
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        isUsed: true,
        updatedAt: new Date(),
      },
    });

    // Cập nhật order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        appliedCouponCode: cleanCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã áp dụng mã voucher ${cleanCode} cho đơn hàng thành công.`,
    });
  } catch (error: any) {
    console.error("POST /api/orders/apply-voucher error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi áp dụng mã voucher" },
      { status: 500 }
    );
  }
}
