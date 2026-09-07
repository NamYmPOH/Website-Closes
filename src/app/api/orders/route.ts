import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export interface AdminOrderItem {
  id: string;
  productTitle: string;
  variantTitle: string | null;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGuest: boolean;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  pointsEarned: number;
  pointsRedeemed: number;
  createdAt: string;
  itemsSummary: string;
  items: AdminOrderItem[];
  shippingAddressText: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Kiểm tra xác thực và quyền truy cập của Admin / Nhân viên
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để truy cập" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role || "CUSTOMER";
    const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SUPPORT"];
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền xem danh sách đơn hàng quản trị" },
        { status: 403 }
      );
    }

    // 2. Lấy toàn bộ đơn hàng từ database PostgreSQL
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // 3. Chuẩn hóa dữ liệu trả về cho giao diện Admin
    const formattedOrders: AdminOrderRecord[] = orders.map((order) => {
      const snapshot = order.shippingSnapshot as {
        receiverName?: string;
        phoneNumber?: string;
        street?: string;
        ward?: string;
        district?: string;
        city?: string;
        province?: string;
      } | null;

      const customerName =
        order.user?.name ||
        snapshot?.receiverName ||
        order.guestEmail?.split("@")[0] ||
        "Khách vãng lai";

      const customerEmail = order.user?.email || order.guestEmail || "Không có email";
      const customerPhone = order.user?.phone || snapshot?.phoneNumber || "Chưa cập nhật";
      const isGuest = !order.userId;

      const itemsSummary = order.items
        .map((i) => `${i.productTitle} (x${i.quantity})`)
        .join(", ");

      const addressParts = [
        snapshot?.street,
        snapshot?.ward,
        snapshot?.district,
        snapshot?.city || snapshot?.province,
      ].filter(Boolean);
      const shippingAddressText = addressParts.join(", ") || "Địa chỉ mặc định";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        isGuest,
        totalAmount: Number(order.totalAmount),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discountAmount: Number(order.discountAmount),
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        pointsEarned: order.pointsEarned,
        pointsRedeemed: order.pointsRedeemed,
        createdAt: order.createdAt.toISOString(),
        itemsSummary: itemsSummary || "Không có sản phẩm",
        items: order.items.map((i) => ({
          id: i.id,
          productTitle: i.productTitle,
          variantTitle: i.variantTitle,
          variantSku: i.variantSku,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          totalPrice: Number(i.totalPrice),
        })),
        shippingAddressText,
      };
    });

    // 4. Tính toán số liệu thống kê thực tế từ database
    const totalOrders = formattedOrders.length;
    const pendingOrders = formattedOrders.filter((o) => o.status === "PENDING").length;
    const confirmedOrders = formattedOrders.filter((o) => o.status === "CONFIRMED").length;
    const shippedOrders = formattedOrders.filter((o) => o.status === "SHIPPED").length;
    const deliveredOrders = formattedOrders.filter((o) => o.status === "DELIVERED").length;

    const totalRevenue = formattedOrders
      .filter((o) => o.status !== "CANCELLED" && o.status !== "RETURNED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      metrics: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    console.error("[GET_ADMIN_ORDERS_ERROR]", errorMessage);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách đơn hàng hệ thống" },
      { status: 500 }
    );
  }
}
