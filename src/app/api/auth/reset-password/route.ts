import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ token và mật khẩu mới." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có độ dài tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    // 1. Kiểm tra tính hợp lệ của token trong cơ sở dữ liệu
    const record = await prisma.verificationToken.findUnique({
      where: { token: String(token).trim() },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Liên kết hoặc mã xác thực không hợp lệ hoặc đã được sử dụng." },
        { status: 400 }
      );
    }

    // 2. Kiểm tra token đã hết hạn chưa
    if (new Date() > new Date(record.expires)) {
      await prisma.verificationToken.delete({
        where: { token: record.token },
      });
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu đã hết hạn (sau 15 phút). Vui lòng gửi lại yêu cầu mới." },
        { status: 400 }
      );
    }

    // 3. Tìm tài khoản tương ứng với identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng tương ứng với liên kết này." },
        { status: 404 }
      );
    }

    // 4. Băm mật khẩu mới và cập nhật cho người dùng
    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    // 5. Xóa token đã hoàn thành
    await prisma.verificationToken.delete({
      where: { token: record.token },
    });

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập.",
      email: user.email,
    });
  } catch (error: any) {
    console.error("Lỗi API Reset Password:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
