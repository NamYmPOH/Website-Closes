import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email của bạn." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 1. Kiểm tra người dùng có tồn tại trong hệ thống
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản liên kết với địa chỉ email này." },
        { status: 404 }
      );
    }

    // 2. Tạo token ngẫu nhiên an toàn (64 ký tự hex)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // Hạn dùng 15 phút

    // 3. Xóa các token cũ của email này nếu có
    await prisma.verificationToken.deleteMany({
      where: { identifier: trimmedEmail },
    });

    // 4. Lưu token mới vào bảng VerificationToken
    await prisma.verificationToken.create({
      data: {
        identifier: trimmedEmail,
        token: resetToken,
        expires,
      },
    });

    const resetUrl = `/auth/reset-password?token=${resetToken}`;

    console.log(`[AURA AUTH] Yêu cầu đặt lại mật khẩu cho ${trimmedEmail}. Token: ${resetToken}`);

    return NextResponse.json({
      success: true,
      message: "Yêu cầu đặt lại mật khẩu đã được tạo thành công.",
      email: trimmedEmail,
      resetToken,
      resetUrl,
      expiresAt: expires.toISOString(),
    });
  } catch (error: any) {
    console.error("Lỗi API Forgot Password:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý yêu cầu đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}
