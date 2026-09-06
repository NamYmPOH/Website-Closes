import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // 1. Kiểm tra tính hợp lệ cơ bản
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Địa chỉ email không đúng định dạng." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có độ dài tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    // 2. Kiểm tra trùng lặp email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác." },
        { status: 400 }
      );
    }

    // 3. Kiểm tra trùng lặp số điện thoại (nếu có nhập)
    const trimmedPhone = phone ? String(phone).trim() : null;
    if (trimmedPhone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: trimmedPhone },
      });
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: "Số điện thoại này đã được đăng ký bởi tài khoản khác." },
          { status: 400 }
        );
      }
    }

    // 4. Băm mật khẩu bảo mật
    const passwordHash = await bcrypt.hash(String(password), 10);

    // 5. Tạo tài khoản người dùng mới cùng giỏ hàng mặc định
    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: trimmedEmail,
        phone: trimmedPhone,
        passwordHash,
        role: "CUSTOMER",
        customerTier: "REGULAR",
        loyaltyPointsBalance: 50, // Tặng 50 điểm chào mừng
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký tài khoản thành công! Chào mừng bạn gia nhập AURA STUDIO.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi API Register:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
