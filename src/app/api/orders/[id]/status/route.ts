import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

// Bảng ánh xạ tất cả các biến thể trạng thái (lowercase / tiếng Anh) sang OrderStatus chuẩn của Prisma
const STATUS_MAP: Record<string, OrderStatus> = {
  pending: OrderStatus.PENDING,
  confirmed: OrderStatus.CONFIRMED,
  processing: OrderStatus.PROCESSING,
  shipped: OrderStatus.SHIPPED,
  delivering: OrderStatus.SHIPPED,
  delivered: OrderStatus.DELIVERED,
  completed: OrderStatus.DELIVERED,
  cancelled: OrderStatus.CANCELLED,
  canceled: OrderStatus.CANCELLED,
  refunded: OrderStatus.REFUNDED,
  returned: OrderStatus.RETURNED,
};

const VALID_STATUSES = Object.keys(STATUS_MAP);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = params;
    const body = await request.json();
    const rawStatus = (body.status || "").toLowerCase().trim();
    const reason = body.reason || "";

    if (!orderId) {
      return NextResponse.json({ error: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(rawStatus)) {
      return NextResponse.json(
        { error: `Trạng thái không hợp lệ: "${rawStatus}". Cho phép: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const targetStatus = STATUS_MAP[rawStatus];

    // Chạy transaction để đảm bảo toàn vẹn dữ liệu tồn kho & điểm tích lũy
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error(`Không tìm thấy đơn hàng: ${orderId}`);
      }

      const currentStatus = order.status;

      // Không cho phép thay đổi nếu đã hoàn thành (Finalized)
      if (currentStatus === OrderStatus.DELIVERED && targetStatus !== OrderStatus.DELIVERED) {
        throw new Error("Đơn hàng đã hoàn thành (DELIVERED), không thể rollback hoặc đổi trạng thái.");
      }

      // Không đổi nếu trùng trạng thái
      if (currentStatus === targetStatus) {
        return { order, message: "Trạng thái không thay đổi", alerts: [] };
      }

      const alerts: string[] = [];

      const FORWARD_STOCK_STATUSES: readonly OrderStatus[] = [
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ];

      const REVERT_FROM_STATUSES: readonly OrderStatus[] = [
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
      ];

      const REVERT_TO_STATUSES: readonly OrderStatus[] = [
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
        OrderStatus.RETURNED,
      ];

      // 1. Chuyển từ PENDING sang CONFIRMED, PROCESSING, SHIPPED hoặc DELIVERED
      // (Trừ kho thực tế và giải phóng số lượng giữ chỗ reservedQuantity)
      if (
        currentStatus === OrderStatus.PENDING &&
        FORWARD_STOCK_STATUSES.includes(targetStatus)
      ) {
        for (const item of order.items) {
          const qty = item.quantity;
          let variant = null;
          if (item.variantId) {
            variant = await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedQuantity: { decrement: qty },
                stockQuantity: { decrement: qty },
              },
            });
          }

          const product = await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedQuantity: { decrement: qty },
              stockQuantity: { decrement: qty },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              orderId: order.id,
              changeType: targetStatus,
              quantityChange: -qty,
              reason: reason || `Cập nhật trạng thái đơn #${order.orderNumber} sang ${targetStatus} (trừ kho thật)`,
            },
          });

          if (variant) {
            const avail = variant.stockQuantity - variant.reservedQuantity;
            if (avail <= variant.reorderThreshold) {
              alerts.push(
                `Cảnh báo tồn kho: Sản phẩm "${product.title}" (${variant.sku}) chỉ còn ${avail} chiếc (ngưỡng: ${variant.reorderThreshold})`
              );
            }
          }
        }
      }

      // 2. Chuyển từ PENDING sang CANCELLED (Chỉ giải phóng reservedQuantity vì chưa trừ kho thật)
      else if (currentStatus === OrderStatus.PENDING && targetStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          const qty = item.quantity;
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedQuantity: { decrement: qty },
              },
            });
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedQuantity: { decrement: qty },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              orderId: order.id,
              changeType: "CANCELLED",
              quantityChange: qty,
              reason: reason || `Hủy đơn hàng chưa thanh toán #${order.orderNumber} (giải phóng giữ chỗ)`,
            },
          });
        }
      }

      // 3. Chuyển từ CONFIRMED / PROCESSING / SHIPPED sang CANCELLED, REFUNDED hoặc RETURNED
      // (Đã trừ kho thật trước đó -> hoàn lại stockQuantity cho kho)
      else if (
        REVERT_FROM_STATUSES.includes(currentStatus) &&
        REVERT_TO_STATUSES.includes(targetStatus)
      ) {
        for (const item of order.items) {
          const qty = item.quantity;
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { increment: qty },
              },
            });
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: qty },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              orderId: order.id,
              changeType: targetStatus,
              quantityChange: qty,
              reason: reason || `Đơn hàng #${order.orderNumber} chuyển sang ${targetStatus} (hoàn lại kho)`,
            },
          });
        }
      }

      // 4. Khi hoàn thành đơn hàng (DELIVERED) -> Finalize & Tự động cộng điểm tích lũy
      if (targetStatus === OrderStatus.DELIVERED) {
        // Tích lũy điểm: Mỗi 1.000đ chi tiêu = 1 điểm
        const pointsEarned = Math.floor(Number(order.totalAmount) / 1000);

        if (order.userId && pointsEarned > 0) {
          // Cập nhật UserPoints & loyaltyPointsBalance
          await tx.userPoints.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              totalPoints: pointsEarned,
              availablePoints: pointsEarned,
              usedPoints: 0,
            },
            update: {
              totalPoints: { increment: pointsEarned },
              availablePoints: { increment: pointsEarned },
            },
          });

          await tx.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPointsBalance: { increment: pointsEarned },
            },
          });

          // Ghi lịch sử điểm
          await tx.pointsHistory.create({
            data: {
              userId: order.userId,
              action: "earn",
              points: pointsEarned,
              orderId: order.id,
              description: `Tích lũy từ đơn hàng thành công #${order.orderNumber} (${new Intl.NumberFormat("vi-VN").format(Number(order.totalAmount))}₫)`,
            },
          });

          // Cập nhật điểm trên Order
          await tx.order.update({
            where: { id: order.id },
            data: {
              pointsEarned,
            },
          });
        }
      }

      // Cập nhật trạng thái đơn hàng và trạng thái thanh toán
      let paymentStatus = order.paymentStatus;
      if (targetStatus === OrderStatus.CONFIRMED || targetStatus === OrderStatus.DELIVERED) {
        paymentStatus = PaymentStatus.PAID;
      } else if (targetStatus === OrderStatus.CANCELLED || targetStatus === OrderStatus.REFUNDED) {
        paymentStatus = currentStatus === OrderStatus.PENDING ? PaymentStatus.UNPAID : PaymentStatus.FAILED;
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          paymentStatus,
        },
        include: {
          items: true,
        },
      });

      return { order: updatedOrder, message: `Cập nhật trạng thái thành công: ${targetStatus}`, alerts };
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      order: result.order,
      alerts: result.alerts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái đơn hàng";
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
