"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ShoppingBag,
  Copy,
  Check,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber");

  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("aura_last_order");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrder(parsed);
          return;
        } catch (e) {
          console.error("Lỗi đọc order snapshot:", e);
        }
      }
    }

    // Fallback nếu người dùng vào trực tiếp qua URL
    if (orderNumberParam) {
      setOrder({
        orderNumber: orderNumberParam,
        createdAt: new Date().toISOString(),
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        customer: {
          fullName: "Quý khách hàng",
          phone: "Chưa cung cấp",
          email: "Chưa cung cấp",
          street: "Theo địa chỉ đã đăng ký",
          city: "",
          district: "",
        },
        paymentMethod: "COD",
        shippingMethod: "standard",
      });
    }
  }, [orderNumberParam]);

  const orderNumber = order?.orderNumber || orderNumberParam || `ORD-${Date.now().toString().slice(-6)}`;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header & Animation Icon */}
      <div className="text-center space-y-4 mb-10">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-50 duration-300">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </div>
          <div className="absolute -inset-1 rounded-full border-2 border-green-500/20 animate-ping pointer-events-none" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-green-600 font-semibold">
            ĐẶT HÀNG THÀNH CÔNG
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mt-1 text-foreground">
            Cảm ơn bạn, {order?.customer?.fullName || "Quý khách"}!
          </h1>
          <p className="text-sm text-muted mt-2 max-w-lg mx-auto leading-relaxed">
            Đơn hàng của bạn đã được tiếp nhận và đang được bộ phận vận hành AURA đóng gói cẩn thận.
          </p>
        </div>

        {/* Mã đơn hàng + Nút Copy */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-mono border border-border mt-2">
          <span className="text-muted font-sans font-medium">Mã đơn hàng:</span>
          <strong className="text-foreground font-bold tracking-wider">{orderNumber}</strong>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 hover:text-foreground text-muted transition cursor-pointer"
            title="Sao chép mã đơn hàng"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Cột trái: Tóm tắt sản phẩm đã đặt (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="border border-border rounded-xl p-6 bg-background shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={16} /> Danh sách sản phẩm
            </h2>

            {order?.items && order.items.length > 0 ? (
              <div className="divide-y divide-border">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-3.5 flex items-center gap-4">
                    <img
                      src={item.product?.primaryImage || "/placeholder-product.webp"}
                      alt={item.product?.title}
                      className="w-14 h-18 object-cover rounded bg-neutral-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {item.product?.title}
                      </h4>
                      <div className="flex items-center gap-2 text-muted text-[11px] mt-1">
                        <span>Số lượng: {item.quantity}</span>
                        {item.selectedColor && <span>• Màu: {item.selectedColor}</span>}
                        {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        (item.product?.basePrice || 0) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-2">Thông tin chi tiết đã được gửi qua email của bạn.</p>
            )}

            {/* Chi tiết thanh toán */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Tạm tính</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    order?.subtotal || 0
                  )}
                </span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá voucher {order?.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>
                    -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      order.discount
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Phí vận chuyển</span>
                <span>
                  {order?.shippingFee === 0
                    ? "Miễn phí"
                    : `${new Intl.NumberFormat("vi-VN").format(order?.shippingFee || 0)}₫`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-3">
                <span>Tổng tiền thanh toán</span>
                <span className="text-base text-foreground">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    order?.total || 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin giao hàng & Thời gian dự kiến (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Thời gian giao hàng dự kiến */}
          <div className="border border-border rounded-xl p-5 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Truck size={16} className="text-amber-500" /> Thời gian giao hàng dự kiến
            </div>
            <p className="text-sm font-semibold text-foreground">
              {order?.shippingMethod === "express" ? "Trong vòng 24 giờ (Hỏa tốc)" : "24 - 48 giờ tới (Tiêu chuẩn)"}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Bạn sẽ nhận được tin nhắn SMS / Zalo kèm mã vận đơn theo dõi lộ trình đơn hàng khi kiện hàng được gửi đi.
            </p>
          </div>

          {/* Địa chỉ nhận hàng */}
          <div className="border border-border rounded-xl p-5 bg-background shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <MapPin size={15} /> Địa chỉ nhận hàng
            </h3>

            <div className="space-y-2 text-muted">
              <p className="font-semibold text-foreground text-sm">
                {order?.customer?.fullName || "Quý khách hàng"}
              </p>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-muted" />
                <span>{order?.customer?.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-muted" />
                <span>{order?.customer?.email || "Chưa cập nhật"}</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-border mt-2">
                <MapPin size={13} className="text-muted flex-shrink-0 mt-0.5" />
                <span>
                  {order?.customer?.street}
                  {order?.customer?.district ? `, ${order?.customer?.district}` : ""}
                  {order?.customer?.city ? `, ${order?.customer?.city}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="border border-border rounded-xl p-5 bg-background shadow-xs space-y-2 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <CreditCard size={15} /> Phương thức thanh toán
            </h3>
            <p className="text-muted font-medium">
              {order?.paymentMethod === "COD"
                ? "Thanh toán tiền mặt khi nhận hàng (COD)"
                : order?.paymentMethod === "VNPAY"
                ? "Thanh toán qua Cổng VNPAY QR"
                : order?.paymentMethod === "MOMO"
                ? "Thanh toán qua Ví điện tử MoMo"
                : "Thanh toán qua Thẻ quốc tế Visa / Mastercard"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/products"
              className="w-full py-3.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm"
            >
              Tiếp tục mua sắm <ArrowRight size={14} />
            </Link>
            <Link
              href="/account"
              className="w-full py-3 border border-border text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2 text-foreground"
            >
              Xem đơn hàng của tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-24 text-center text-xs text-muted">
          Đang tải thông tin xác nhận đơn hàng...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
