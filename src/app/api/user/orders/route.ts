import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export interface UserOrderItem {
  id: string;
  productTitle: string;
  variantTitle: string | null;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  productSlug?: string;
}

export interface UserOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  createdAt: string;
  items: UserOrderItem[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để xem lịch sử đơn hàng", orders: [] },
        { status: 401 }
      );
    }

    const userEmail = session.user?.email?.toLowerCase().trim();

    if (userEmail) {
      // Tự động liên kết các đơn hàng khách từng đặt trước đó bằng email này vào tài khoản cá nhân
      await prisma.order.updateMany({
        where: {
          guestEmail: { equals: userEmail, mode: "insensitive" as const },
          userId: null,
        },
        data: {
          userId,
        },
      });
    }

    const whereClause: Prisma.OrderWhereInput = userEmail
      ? {
          OR: [
            { userId },
            { guestEmail: { equals: userEmail, mode: "insensitive" as const } },
          ],
        }
      : { userId };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formattedOrders: UserOrderSummary[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productTitle: item.productTitle,
        variantTitle: item.variantTitle,
        variantSku: item.variantSku,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice),
        productImage: item.product?.images?.[0]?.url || undefined,
        productSlug: item.product?.slug || undefined,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    console.error("[GET_USER_ORDERS_ERROR]", errorMessage);
    return NextResponse.json(
      { success: false, error: "Không thể tải lịch sử đơn hàng", orders: [] },
      { status: 500 }
    );
  }
}
