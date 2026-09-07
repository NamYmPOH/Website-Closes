import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    const VALID_STATUSES = ["pending", "confirmed", "delivering", "completed", "cancelled", "returned"];
    if (!VALID_STATUSES.includes(rawStatus)) {
      return NextResponse.json(
        { error: `Trạng thái không hợp lệ. Cho phép: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Map to Prisma OrderStatus enum
    const statusMap: Record<string, string> = {
      pending: "PENDING",
      confirmed: "CONFIRMED",
      delivering: "SHIPPED",
      completed: "DELIVERED",
      cancelled: "CANCELLED",
      returned: "RETURNED",
    };
    const targetStatus = statusMap[rawStatus] as any;

    // Run database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
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
        throw new Error(`Không tìm thấy đơn hàng với ID: ${orderId}`);
      }

      const currentStatus = order.status;

      // Không cho phép thay đổi nếu đã hoàn thành (Finalized)
      if (currentStatus === "DELIVERED" && targetStatus !== "DELIVERED") {
        throw new Error("Đơn hàng đã hoàn thành (DELIVERED), không thể rollback hoặc đổi trạng thái.");
      }

      // Không đổi nếu trùng trạng thái
      if (currentStatus === targetStatus) {
        return { order, message: "Trạng thái không thay đổi", alerts: [] };
      }

      const alerts: string[] = [];

      // 1. Chuyển từ PENDING sang CONFIRMED (Trừ thật vào kho, giảm reserved)
      if (currentStatus === "PENDING" && targetStatus === "CONFIRMED") {
        for (const item of order.items) {
          const qty = item.quantity;
          const variant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              reservedQuantity: { decrement: qty },
              stockQuantity: { decrement: qty },
            },
          });

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
              changeType: "CONFIRMED",
              quantityChange: -qty,
              reason: reason || `Xác nhận thanh toán đơn #${order.orderNumber} (trừ kho thật)`,
            },
          });

          const avail = variant.stockQuantity - variant.reservedQuantity;
          if (avail <= variant.reorderThreshold) {
            alerts.push(
              `Cảnh báo tồn kho: Sản phẩm "${product.title}" (${variant.sku}) chỉ còn ${avail} chiếc (ngưỡng: ${variant.reorderThreshold})`
            );
          }
        }
      }

      // 2. Chuyển từ PENDING sang CANCELLED (Giải phóng reservedQuantity)
      else if (currentStatus === "PENDING" && targetStatus === "CANCELLED") {
        for (const item of order.items) {
          const qty = item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              reservedQuantity: { decrement: qty },
            },
          });

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

      // 3. Chuyển từ CONFIRMED / PROCESSING / SHIPPED sang CANCELLED hoặc RETURNED (Hoàn trả tồn kho)
      else if (
        ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(currentStatus) &&
        ["CANCELLED", "RETURNED"].includes(targetStatus)
      ) {
        for (const item of order.items) {
          const qty = item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { increment: qty },
            },
          });

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
              changeType: targetStatus === "RETURNED" ? "RETURNED" : "CANCELLED",
              quantityChange: qty,
              reason: reason || `Đơn hàng #${order.orderNumber} bị hủy/hoàn trả (hoàn lại kho)`,
            },
          });
        }
      }

      // 4. Khi hoàn thành đơn hàng (DELIVERED) -> Finalize & Tự động cộng điểm tích lũy (Task 2)
      if (targetStatus === "DELIVERED") {
        // Tích lũy điểm: Mỗi 1.000đ chi tiêu = 1 điểm
        const pointsEarned = Math.floor(Number(order.totalAmount) / 1000);

        if (order.userId && pointsEarned > 0) {
          // Cập nhật UserPoints
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

      // Cập nhật trạng thái đơn hàng
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          paymentStatus: targetStatus === "CONFIRMED" || targetStatus === "DELIVERED" ? "PAID" : order.paymentStatus,
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
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi cập nhật trạng thái đơn hàng" },
      { status: 500 }
    );
  }
}
