"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowRight, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, getDiscountAmount, getShippingFee, getTotal, clearCart, couponCode } =
    useCartStore();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    district: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO" | "STRIPE">("COD");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động điền thông tin nếu khách hàng đã đăng nhập
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const baseShipping = getShippingFee();
  const shippingFee = shippingMethod === "express" ? baseShipping + 25000 : baseShipping;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Vui lòng nhập họ và tên người nhận.";
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = "Họ và tên người nhận quá ngắn.";
    }

    const phoneClean = formData.phone.trim().replace(/\s/g, "");
    if (!phoneClean) {
      errs.phone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$|^0[0-9]{9}$/.test(phoneClean)) {
      errs.phone = "Số điện thoại Việt Nam không hợp lệ (10 số, bắt đầu bằng số 0).";
    }

    const emailClean = formData.email.trim();
    if (!emailClean) {
      errs.email = "Vui lòng nhập địa chỉ email nhận hóa đơn.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      errs.email = "Định dạng email không hợp lệ (VD: tenban@example.com).";
    }

    if (!formData.street.trim()) {
      errs.street = "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường, phường/xã).";
    }

    if (!formData.city.trim()) {
      errs.city = "Vui lòng nhập Tỉnh / Thành phố.";
    }

    if (!formData.district.trim()) {
      errs.district = "Vui lòng nhập Quận / Huyện.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang rỗng!");
      return;
    }

    if (!validateForm()) {
      // Cuộn lên phần thông tin nhận hàng nếu có lỗi
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      // Lưu chi tiết đơn hàng vào sessionStorage để trang thành công hiển thị trọn vẹn
      const orderSnapshot = {
        orderNumber,
        createdAt: new Date().toISOString(),
        items: [...items],
        subtotal,
        discount,
        shippingFee,
        total,
        couponCode,
        customer: { ...formData },
        paymentMethod,
        shippingMethod,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("aura_last_order", JSON.stringify(orderSnapshot));
      }

      // Làm trống giỏ hàng
      clearCart();

      // Điều hướng đến trang xác nhận đơn hàng
      router.push(`/order-success?orderNumber=${orderNumber}`);
    }, 1000);
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Giỏ hàng rỗng</h2>
        <p className="text-muted text-sm">Vui lòng chọn sản phẩm trước khi tiến hành thanh toán.</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md"
        >
          Khám phá sản phẩm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-8">
        Thanh toán đơn hàng
      </h1>

      <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Customer Details & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Thông tin giao hàng */}
          <div className="space-y-4 p-6 border border-border rounded-lg bg-background">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              Thông tin nhận hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted font-medium">Họ và tên người nhận *</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.fullName ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-muted font-medium">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  placeholder="VD: 0912345678"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.phone ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-muted font-medium">Địa chỉ Email (Nhận hóa đơn điện tử) *</label>
                <input
                  type="email"
                  placeholder="VD: tenban@gmail.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.email ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-muted font-medium">Địa chỉ chi tiết (Số nhà, Tên đường, Phường/Xã) *</label>
                <input
                  type="text"
                  placeholder="VD: Số 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                    if (errors.street) setErrors({ ...errors, street: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.street ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.street && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.street}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-muted font-medium">Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  placeholder="VD: TP. Hồ Chí Minh hoặc Hà Nội"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.city ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-muted font-medium">Quận / Huyện *</label>
                <input
                  type="text"
                  placeholder="VD: Quận 1 hoặc Cầu Giấy"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ ...formData, district: e.target.value });
                    if (errors.district) setErrors({ ...errors, district: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none transition ${
                    errors.district ? "border-red-500 focus:border-red-500 bg-red-50/10" : "border-border focus:border-foreground"
                  }`}
                />
                {errors.district && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.district}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-muted font-medium">Ghi chú giao hàng (Tùy chọn)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Giao vào giờ hành chính, gọi trước khi đến..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          {/* 2. Phương thức vận chuyển */}
          <div className="space-y-4 p-6 border border-border rounded-lg bg-background">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Phương thức vận chuyển
            </h2>

            <div className="space-y-3 text-xs">
              <label
                onClick={() => setShippingMethod("standard")}
                className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${
                  shippingMethod === "standard"
                    ? "border-foreground bg-neutral-50 dark:bg-neutral-900"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="accent-foreground"
                  />
                  <div>
                    <span className="font-semibold block">Giao hàng tiêu chuẩn (2 - 3 ngày)</span>
                    <span className="text-muted text-[11px]">Đơn vị vận chuyển liên kết toàn quốc</span>
                  </div>
                </div>
                <span className="font-semibold">
                  {baseShipping === 0 ? "Miễn phí" : `${new Intl.NumberFormat("vi-VN").format(baseShipping)}₫`}
                </span>
              </label>

              <label
                onClick={() => setShippingMethod("express")}
                className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${
                  shippingMethod === "express"
                    ? "border-foreground bg-neutral-50 dark:bg-neutral-900"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="accent-foreground"
                  />
                  <div>
                    <span className="font-semibold block">Giao hỏa tốc 24H (Nội thành)</span>
                    <span className="text-muted text-[11px]">Giao ngay trong ngày qua Grab / Ahamove</span>
                  </div>
                </div>
                <span className="font-semibold">
                  {new Intl.NumberFormat("vi-VN").format(baseShipping + 25000)}₫
                </span>
              </label>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="space-y-4 p-6 border border-border rounded-lg bg-background">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: "COD", title: "Thanh toán khi nhận hàng (COD)", icon: Banknote, desc: "Trả tiền mặt cho shipper" },
                { id: "VNPAY", title: "Cổng VNPAY QR", icon: CreditCard, desc: "Quét mã QR qua App ngân hàng" },
                { id: "MOMO", title: "Ví MoMo", icon: CreditCard, desc: "Thanh toán qua ví điện tử MoMo" },
                { id: "STRIPE", title: "Thẻ Visa / Mastercard", icon: CreditCard, desc: "Cổng thanh toán quốc tế Stripe" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col justify-between p-4 border rounded-lg cursor-pointer transition ${
                      isSelected ? "border-foreground bg-neutral-50 dark:bg-neutral-900" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon size={18} className={isSelected ? "text-foreground" : "text-muted"} />
                      <input
                        type="radio"
                        name="payment"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(m.id as any)}
                        className="accent-foreground"
                      />
                    </div>
                    <div>
                      <span className="font-semibold block text-xs">{m.title}</span>
                      <span className="text-[11px] text-muted">{m.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider">Đơn hàng của bạn ({items.length})</h2>

            {/* Mini Items List */}
            <div className="divide-y divide-border max-h-80 overflow-y-auto pr-1 text-xs">
              {items.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.title}
                    className="w-12 h-16 object-cover rounded bg-neutral-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.product.title}</h4>
                    <div className="flex items-center gap-2 text-muted text-[11px] mt-0.5">
                      <span>SL: {item.quantity}</span>
                      {item.selectedColor && <span>• Màu: {item.selectedColor}</span>}
                      {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                    </div>
                  </div>
                  <span className="font-bold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      item.product.basePrice * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs border-t border-border pt-4">
              <div className="flex justify-between text-muted">
                <span>Tạm tính</span>
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá voucher {couponCode ? `(${couponCode})` : ""}</span>
                  <span>
                    -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingFee === 0
                    ? "Miễn phí"
                    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-border pt-3">
                <span>Tổng cộng</span>
                <span className="text-lg">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                "Đang tiến hành đặt hàng..."
              ) : (
                <>
                  Xác nhận đặt hàng <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          <div className="p-4 border border-border rounded-lg text-xs text-muted space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck size={16} /> Cam kết mua sắm AURA
            </div>
            <p>
              Đồng kiểm cùng shipper khi nhận hàng. Đổi trả miễn phí 30 ngày cho mọi lỗi kỹ thuật hoặc đổi size thuận tiện.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
