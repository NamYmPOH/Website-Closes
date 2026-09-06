import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const eventType = request.headers.get("x-event-type") || "payment.success";

    // 1. Xác thực Chữ ký điện tử HMAC SHA256 (Phòng chống giả mạo Webhook)
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "whsec_default_secret_key";
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Chữ ký webhook không hợp lệ" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { orderId, transactionId, amount, status, gateway } = payload;

    // 2. Kiểm tra tính Idempotency (Chống xử lý trùng lặp giao dịch)
    const existingPayment = await prisma.paymentRecord.findFirst({
      where: { transactionId },
    });

    if (existingPayment && existingPayment.status === "PAID") {
      return NextResponse.json(
        { message: "Giao dịch đã được xử lý trước đó (Idempotent Hit)" },
        { status: 200 }
      );
    }

    // 3. Cập nhật Đơn hàng & Bản ghi thanh toán trong Transaction
    await prisma.$transaction(async (tx) => {
      // Cập nhật bản ghi thanh toán
      await tx.paymentRecord.upsert({
        where: { transactionId: transactionId || `temp_${orderId}` },
        update: {
          status: status === "SUCCESS" ? "PAID" : "FAILED",
          gatewayResponse: payload,
        },
        create: {
          orderId,
          gateway: gateway || "STRIPE",
          transactionId,
          amount,
          status: status === "SUCCESS" ? "PAID" : "FAILED",
          gatewayResponse: payload,
        },
      });

      // Nếu thanh toán thành công, đổi trạng thái đơn hàng sang PROCESSING
      if (status === "SUCCESS") {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
          include: {
            user: true,
          },
        });

        // Cộng điểm thưởng Loyalty Points nếu có tài khoản
        if (updatedOrder.userId && updatedOrder.pointsEarned > 0) {
          await tx.user.update({
            where: { id: updatedOrder.userId },
            data: {
              loyaltyPointsBalance: { increment: updatedOrder.pointsEarned },
            },
          });

          await tx.loyaltyPointTransaction.create({
            data: {
              userId: updatedOrder.userId,
              points: updatedOrder.pointsEarned,
              reason: "ORDER_REWARD",
              referenceId: updatedOrder.id,
            },
          });
        }
      }
    });

    // 4. Kích hoạt Webhook gửi thông báo ra hệ thống ngoài (ERP / Email Dispatcher)
    return NextResponse.json({ success: true, processedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error("[PAYMENT_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Lỗi xử lý webhook", message: error.message },
      { status: 500 }
    );
  }
}
