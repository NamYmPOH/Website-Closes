import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("GET /api/user/addresses error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách địa chỉ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để lưu địa chỉ" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverName, phoneNumber, street, ward, district, city, province, isDefaultShipping } = body;

    if (!receiverName || !phoneNumber || !street || !district || !city) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin địa chỉ bắt buộc" },
        { status: 400 }
      );
    }

    // Nếu đặt là mặc định, hủy mặc định các địa chỉ cũ
    if (isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefaultShipping: false },
      });
    }

    const count = await prisma.address.count({ where: { userId } });
    const isFirst = count === 0;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        receiverName: receiverName.trim(),
        phoneNumber: phoneNumber.trim(),
        street: street.trim(),
        ward: ward ? ward.trim() : null,
        district: district.trim(),
        city: city.trim(),
        province: (province || city).trim(),
        isDefaultShipping: isDefaultShipping || isFirst,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lưu địa chỉ thành công!",
      address: newAddress,
    });
  } catch (error: any) {
    console.error("POST /api/user/addresses error:", error);
    return NextResponse.json({ error: "Lỗi khi tạo địa chỉ mới" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID địa chỉ" }, { status: 400 });
    }

    await prisma.address.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa địa chỉ thành công" });
  } catch (error: any) {
    console.error("DELETE /api/user/addresses error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa địa chỉ" }, { status: 500 });
  }
}
