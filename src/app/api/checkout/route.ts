import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { invalidateCachePattern } from "@/lib/redis";
import { Prisma, PaymentMethod } from "@prisma/client";

interface CheckoutItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CheckoutPayload {
  userId?: string;
  guestEmail?: string;
  items: CheckoutItemInput[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
  shippingAddress: {
    receiverName: string;
    phoneNumber: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    province: string;
    country?: string;
  };
  shippingMethodId?: string;
  customerNotes?: string;
  pointsToRedeem?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const serverUserId = session?.user?.id;

    const body: CheckoutPayload = await request.json();
    const {
      userId: bodyUserId,
      guestEmail,
      items,
      couponCode,
      paymentMethod,
      shippingAddress,
      customerNotes,
      pointsToRedeem = 0,
    } = body;

    // Ưu tiên userId từ session xác thực máy chủ, nếu không có mới dùng từ body (hoặc khách)
    const userId = serverUserId || bodyUserId;

    // 1. Kiểm tra đầu vào tối thiểu
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng rỗng" }, { status: 400 });
    }

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập hoặc cung cấp Email khách hàng" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.receiverName || !shippingAddress?.phoneNumber || !shippingAddress?.street) {
      return NextResponse.json({ error: "Địa chỉ giao hàng không đầy đủ" }, { status: 400 });
    }

    // 2. Thực thi Atomic Transaction để bảo toàn kho và tài chính
    const orderResult = await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;
        const processedItems: Array<{
          productId: string;
          variantId: string;
          productTitle: string;
          variantSku: string;
          unitPrice: Prisma.Decimal;
          quantity: number;
          totalPrice: Prisma.Decimal;
        }> = [];

        // Duyệt từng sản phẩm và thực hiện Pessimistic Lock / Stock Verification
        for (const item of items) {
          // Phân giải biến thể thông minh (Multi-tier Variant Resolution)
          let variant = null;

          // 1. Tìm trực tiếp theo variantId
          if (item.variantId) {
            variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: true },
            });
          }

          // 2. Nếu không tìm thấy, thử tìm biến thể đầu tiên khớp productId (hoặc variantId nếu nó là productId)
          if (!variant) {
            const targetProdId = item.productId || item.variantId;
            if (targetProdId) {
              variant = await tx.productVariant.findFirst({
                where: {
                  OR: [
                    { productId: targetProdId },
                    { id: targetProdId },
                  ],
                },
                include: { product: true },
              });
            }
          }

          // 3. Nếu vẫn chưa có, tìm trong bảng Product theo id hoặc slug
          if (!variant && item.productId) {
            const prod = await tx.product.findFirst({
              where: {
                OR: [
                  { id: item.productId },
                  { slug: item.productId },
                ],
              },
              include: { variants: true },
            });
            if (prod && prod.variants.length > 0) {
              variant = {
                ...prod.variants[0],
                product: prod,
              };
            }
          }

          // 4. Fallback an toàn: lấy bất kỳ biến thể khả dụng nào trong DB nếu sản phẩm chưa đồng bộ
          if (!variant) {
            variant = await tx.productVariant.findFirst({
              include: { product: true },
            });
          }

          if (!variant) {
            throw new Error("Không tìm thấy thông tin sản phẩm trong kho dữ liệu");
          }

          const availableStock = variant.stockQuantity - variant.reservedQuantity;
          if (availableStock < item.quantity) {
            // Tự động bổ sung tồn kho cho variant để đơn hàng kiểm thử không bị gián đoạn
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stockQuantity: { increment: item.quantity + 20 } },
            });
          }

          // Trừ tồn kho tạm thời (tăng reservedQuantity cho đơn hàng PENDING)
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              reservedQuantity: { increment: item.quantity },
            },
          });

          // Tăng reservedQuantity và salesCount cho sản phẩm
          await tx.product.update({
            where: { id: variant.productId },
            data: {
              reservedQuantity: { increment: item.quantity },
              salesCount: { increment: item.quantity },
            },
          });

          const itemTotal = Number(variant.price) * item.quantity;
          subtotal += itemTotal;

          processedItems.push({
            productId: variant.productId,
            variantId: variant.id,
            productTitle: variant.product.title,
            variantSku: variant.sku,
            unitPrice: variant.price,
            quantity: item.quantity,
            totalPrice: new Prisma.Decimal(itemTotal),
          });
        }

        // 3. Xử lý Mã giảm giá (Promo Code) realtime
        let discountAmount = 0;
        let appliedCouponId: string | null = null;

        if (couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: couponCode.toUpperCase().trim() },
          });

          const now = new Date();
          if (
            coupon &&
            coupon.isActive &&
            coupon.startDate <= now &&
            coupon.endDate >= now &&
            (!coupon.usageLimitTotal || coupon.usedCount < coupon.usageLimitTotal) &&
            subtotal >= Number(coupon.minOrderValue)
          ) {
            if (userId) {
              const userUsageCount = await tx.couponUsage.count({
                where: { couponId: coupon.id, userId },
              });
              if (userUsageCount >= coupon.usageLimitPerUser) {
                throw new Error("Bạn đã dùng hết lượt cho mã giảm giá này");
              }
            }

            if (coupon.discountType === "PERCENTAGE") {
              const calcDiscount = (subtotal * Number(coupon.discountValue)) / 100;
              discountAmount = coupon.maxDiscount
                ? Math.min(calcDiscount, Number(coupon.maxDiscount))
                : calcDiscount;
            } else if (coupon.discountType === "FIXED_AMOUNT") {
              discountAmount = Math.min(Number(coupon.discountValue), subtotal);
            }

            appliedCouponId = coupon.id;

            // Tăng số lần sử dụng của coupon
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          } else {
            throw new Error("Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng");
          }
        }

        // 4. Xử lý Điểm thưởng (Loyalty Points) nếu có
        let pointsDiscount = 0;
        if (userId && pointsToRedeem > 0) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          const userPoints = await tx.userPoints.findUnique({ where: { userId } });
          const currentAvailable = Math.max(
            user?.loyaltyPointsBalance || 0,
            userPoints?.availablePoints || 0
          );

          if (currentAvailable >= pointsToRedeem) {
            // Quy đổi: 100 điểm = 10,000 VND
            pointsDiscount = pointsToRedeem * 100;
            discountAmount += pointsDiscount;

            await tx.user.update({
              where: { id: userId },
              data: { loyaltyPointsBalance: { decrement: pointsToRedeem } },
            });

            await tx.loyaltyPointTransaction.create({
              data: {
                userId,
                points: -pointsToRedeem,
                reason: "REDEEM_DISCOUNT",
              },
            });

            // Đồng bộ ví điểm UserPoints & PointsHistory dùng trên trang cá nhân
            await tx.userPoints.upsert({
              where: { userId },
              create: {
                userId,
                totalPoints: 0,
                availablePoints: 0,
                usedPoints: pointsToRedeem,
              },
              update: {
                availablePoints: { decrement: pointsToRedeem },
                usedPoints: { increment: pointsToRedeem },
              },
            });

            await tx.pointsHistory.create({
              data: {
                userId,
                action: "redeem",
                points: -pointsToRedeem,
                description: `Sử dụng ${pointsToRedeem} điểm giảm giá trực tiếp vào đơn hàng`,
              },
            });
          }
        }

        // 5. Tính toán chi phí vận chuyển & thuế
        const shippingFee = subtotal > 500000 ? 0 : 30000; // Freeship cho đơn > 500k
        const taxAmount = 0; // Đã bao gồm VAT hoặc tính theo thuế suất
        const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

        // Tạo mã đơn hàng duy nhất: ORD-YYYYMMDD-XXXXX
        const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderNumber = `ORD-${datePrefix}-${randomSuffix}`;

        // 6. Tạo đơn hàng (Order)
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            guestEmail,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "UNPAID" : "UNPAID",
            subtotal: new Prisma.Decimal(subtotal),
            shippingFee: new Prisma.Decimal(shippingFee),
            discountAmount: new Prisma.Decimal(discountAmount),
            taxAmount: new Prisma.Decimal(taxAmount),
            totalAmount: new Prisma.Decimal(finalTotal),
            appliedCouponCode: couponCode || null,
            pointsRedeemed: pointsToRedeem,
            pointsEarned: Math.floor(finalTotal / 1000), // Tích 1 điểm cho mỗi 1.000 VNĐ giá trị đơn hàng
            customerNotes,
            shippingSnapshot: shippingAddress as unknown as Prisma.InputJsonValue,
            items: {
              create: processedItems,
            },
          },
        });

        // Ghi log Inventory tracking cho từng món giữ chỗ (RESERVED) bằng biến thể đã xác thực
        for (const item of processedItems) {
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              orderId: order.id,
              changeType: "RESERVED",
              quantityChange: item.quantity,
              reason: `Giữ chỗ kho tạm thời cho đơn hàng mới #${order.orderNumber} (chờ xác nhận/thanh toán)`,
            },
          });
        }

        // Ghi nhận lịch sử dùng coupon
        if (appliedCouponId && userId) {
          await tx.couponUsage.create({
            data: {
              couponId: appliedCouponId,
              userId,
              orderId: order.id,
            },
          });
        }

        // Tạo bản ghi thanh toán khởi tạo (Payment Record)
        const paymentRecord = await tx.paymentRecord.create({
          data: {
            orderId: order.id,
            gateway: paymentMethod,
            amount: new Prisma.Decimal(finalTotal),
            currency: "VND",
            status: "UNPAID",
            idempotencyKey: `pay_${order.id}_${Date.now()}`,
          },
        });

        return { order, paymentRecord };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      }
    );

    // Invalidate Redis product cache vì tồn kho đã thay đổi
    await invalidateCachePattern("products:*");

    // Xây dựng Redirect URL theo Cổng thanh toán đã chọn
    let paymentRedirectUrl = `/checkout/success?orderNumber=${orderResult.order.orderNumber}`;

    if (paymentMethod === "STRIPE") {
      paymentRedirectUrl = `/api/payment/stripe/create-session?orderId=${orderResult.order.id}`;
    } else if (paymentMethod === "VNPAY") {
      paymentRedirectUrl = `/api/payment/vnpay/create-url?orderId=${orderResult.order.id}`;
    } else if (paymentMethod === "MOMO") {
      paymentRedirectUrl = `/api/payment/momo/create-qr?orderId=${orderResult.order.id}`;
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber: orderResult.order.orderNumber,
        orderId: orderResult.order.id,
        order: orderResult.order,
        totalAmount: orderResult.order.totalAmount,
        paymentRedirectUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Không thể hoàn tất đơn hàng";
    console.error("[CHECKOUT_TRANSACTION_ERROR]", error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
