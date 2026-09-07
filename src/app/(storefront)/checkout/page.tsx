"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import AddressAutocomplete, { AddressData } from "@/components/storefront/AddressAutocomplete";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  Tag,
  CheckCircle2,
  Loader2,
  X,
  BookmarkCheck,
} from "lucide-react";

interface SavedAddress {
  id: string;
  receiverName: string;
  phoneNumber: string;
  street: string;
  ward?: string | null;
  district: string;
  city: string;
  province: string;
  isDefaultShipping: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getTotal,
    clearCart,
    couponCode,
    setAppliedVoucher,
    removeCoupon,
  } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO" | "STRIPE">("COD");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách địa chỉ đã lưu của user
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Voucher validation state
  const [voucherInput, setVoucherInput] = useState(couponCode || "");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tải thông tin người dùng và danh sách địa chỉ đã lưu
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));

      // Lấy danh sách địa chỉ đã lưu
      fetch("/api/user/addresses")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefaultShipping) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              fullName: defaultAddr.receiverName,
              phone: defaultAddr.phoneNumber,
              street: defaultAddr.street,
              ward: defaultAddr.ward || "",
              district: defaultAddr.district,
              city: defaultAddr.province || defaultAddr.city,
            }));
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // Xử lý khi người dùng chọn địa chỉ đã lưu
  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setFormData((prev) => ({
        ...prev,
        street: "",
        ward: "",
        district: "",
        city: "",
      }));
    } else {
      const found = savedAddresses.find((a) => a.id === addrId);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          fullName: found.receiverName,
          phone: found.phoneNumber,
          street: found.street,
          ward: found.ward || "",
          district: found.district,
          city: found.province || found.city,
        }));
        setErrors({});
      }
    }
  };

  // Cập nhật khi chọn từ AddressAutocomplete
  const handleAddressAutocompleteChange = (data: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      street: data.street,
      ward: data.ward,
      district: data.district,
      city: data.province,
    }));
    if (errors.street && data.street) setErrors((prev) => ({ ...prev, street: "" }));
    if (errors.city && data.province) setErrors((prev) => ({ ...prev, city: "" }));
    if (errors.district && data.district) setErrors((prev) => ({ ...prev, district: "" }));
  };

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const baseShipping = getShippingFee();
  const shippingFee = shippingMethod === "express" ? baseShipping + 25000 : baseShipping;
  const total = Math.max(0, subtotal - discount + shippingFee);

  // Xử lý xác thực mã giảm giá Realtime
  const handleApplyVoucher = async () => {
    const cleanCode = voucherInput.trim().toUpperCase();
    if (!cleanCode) {
      setVoucherFeedback({ type: "error", message: "Vui lòng nhập mã giảm giá." });
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherFeedback(null);

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          orderTotal: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setVoucherFeedback({
          type: "error",
          message: data.message || data.error || "Mã giảm giá không hợp lệ.",
        });
      } else {
        setAppliedVoucher({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
        });
        setVoucherFeedback({
          type: "success",
          message: data.message,
        });
      }
    } catch (err) {
      setVoucherFeedback({
        type: "error",
        message: "Không thể kiểm tra mã giảm giá lúc này.",
      });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    removeCoupon();
    setVoucherInput("");
    setVoucherFeedback(null);
  };

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

    if (!formData.city.trim()) {
      errs.city = "Vui lòng chọn Tỉnh / Thành phố.";
    }

    if (!formData.district.trim()) {
      errs.district = "Vui lòng chọn Quận / Huyện.";
    }

    if (!formData.street.trim()) {
      errs.street = "Vui lòng nhập số nhà, tên đường cụ thể.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang rỗng!");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Gửi đơn hàng lên Backend API để tạo Order và khóa tồn kho (Reserved Quantity)
      const checkoutPayload = {
        userId: session?.user?.id,
        guestEmail: formData.email.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: (i as any).variantId || i.product.id,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
        paymentMethod,
        shippingAddress: {
          receiverName: formData.fullName.trim(),
          phoneNumber: formData.phone.trim(),
          street: formData.street.trim(),
          ward: formData.ward.trim() || undefined,
          district: formData.district.trim(),
          city: formData.city.trim(),
          province: formData.city.trim(),
        },
        customerNotes: formData.notes.trim() || undefined,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      });

      let orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      if (res.ok) {
        const data = await res.json();
        if (data?.order?.orderNumber) {
          orderNumber = data.order.orderNumber;
        }
      }

      // Lưu snapshot chi tiết đơn hàng vào sessionStorage cho trang xác nhận
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

      // Nếu người dùng chọn lưu địa chỉ mới
      if (session?.user && selectedAddressId === "new") {
        fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverName: formData.fullName.trim(),
            phoneNumber: formData.phone.trim(),
            street: formData.street.trim(),
            ward: formData.ward.trim() || undefined,
            district: formData.district.trim(),
            city: formData.city.trim(),
            province: formData.city.trim(),
            isDefaultShipping: savedAddresses.length === 0,
          }),
        }).catch(() => {});
      }

      // Làm trống giỏ hàng
      clearCart();

      // Điều hướng đến trang xác nhận đơn hàng thành công
      router.push(`/order-success?orderNumber=${orderNumber}`);
    } catch (err) {
      console.error("Place order failed:", err);
      alert("Đã xảy ra lỗi trong quá trình xử lý đơn hàng. Vui lòng thử lại!");
      setIsSubmitting(false);
    }
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
          {/* 1. Thông tin nhận hàng & Địa chỉ */}
          <div className="space-y-5 p-6 border border-border rounded-lg bg-background shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              Thông tin nhận hàng
            </h2>

            {/* Nếu có địa chỉ đã lưu */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-lg border border-border/70 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <BookmarkCheck size={14} className="text-blue-600" /> Sổ địa chỉ đã lưu
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`p-2.5 rounded-md border cursor-pointer transition flex items-start gap-2 ${
                        selectedAddressId === addr.id
                          ? "border-foreground bg-background shadow-2xs ring-1 ring-foreground"
                          : "border-border bg-background/60 hover:border-foreground/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddr"
                        checked={selectedAddressId === addr.id}
                        onChange={() => handleSelectSavedAddress(addr.id)}
                        className="mt-0.5 accent-foreground"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold block truncate">{addr.receiverName} ({addr.phoneNumber})</span>
                        <span className="text-[11px] text-muted line-clamp-2">
                          {[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </label>
                  ))}

                  <label
                    className={`p-2.5 rounded-md border cursor-pointer transition flex items-center gap-2 ${
                      selectedAddressId === "new"
                        ? "border-foreground bg-background shadow-2xs ring-1 ring-foreground"
                        : "border-border bg-background/60 hover:border-foreground/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddr"
                      checked={selectedAddressId === "new"}
                      onChange={() => handleSelectSavedAddress("new")}
                      className="accent-foreground"
                    />
                    <span className="font-semibold text-xs">+ Nhập địa chỉ nhận hàng khác</span>
                  </label>
                </div>
              </div>
            )}

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
                <label className="text-muted font-medium">Địa chỉ Email (Nhận thông báo & hóa đơn) *</label>
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
            </div>

            {/* Address Autocomplete Component với 63 Tỉnh Thành VN & Geolocation */}
            <div className="pt-2">
              <AddressAutocomplete
                initialProvince={formData.city}
                initialDistrict={formData.district}
                initialWard={formData.ward}
                initialStreet={formData.street}
                onChange={handleAddressAutocompleteChange}
                errors={{
                  province: errors.city,
                  district: errors.district,
                  street: errors.street,
                }}
              />
            </div>

            <div className="space-y-1 text-xs pt-1">
              <label className="text-muted font-medium">Ghi chú giao hàng (Tùy chọn)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ví dụ: Giao hàng vào giờ hành chính, gọi trước khi đến 15 phút..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-foreground transition"
              />
            </div>
          </div>

          {/* 2. Phương thức vận chuyển */}
          <div className="space-y-4 p-6 border border-border rounded-lg bg-background shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Hình thức giao hàng
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition ${
                  shippingMethod === "standard"
                    ? "border-foreground bg-neutral-50/50 dark:bg-neutral-900/50 ring-1 ring-foreground"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="accent-foreground"
                  />
                  <div>
                    <span className="font-semibold text-xs block">Giao hàng Tiêu chuẩn (2 - 4 ngày)</span>
                    <span className="text-[11px] text-muted">Đóng gói hộp sang trọng AURA Studio</span>
                  </div>
                </div>
                <span className="text-xs font-semibold">
                  {subtotal >= 500000 ? "Miễn phí" : "30.000₫"}
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition ${
                  shippingMethod === "express"
                    ? "border-foreground bg-neutral-50/50 dark:bg-neutral-900/50 ring-1 ring-foreground"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="accent-foreground"
                  />
                  <div>
                    <span className="font-semibold text-xs block flex items-center gap-1.5">
                      <Truck size={13} className="text-foreground" /> Giao hàng Hỏa tốc 24H
                    </span>
                    <span className="text-[11px] text-muted">Ưu tiên xử lý và xuất kho ngay trong ngày</span>
                  </div>
                </div>
                <span className="text-xs font-semibold">
                  {subtotal >= 500000 ? "25.000₫" : "55.000₫"}
                </span>
              </label>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="space-y-4 p-6 border border-border rounded-lg bg-background shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              Phương thức thanh toán
            </h2>

            <div className="space-y-3">
              {[
                { id: "COD", title: "Thanh toán khi nhận hàng (COD)", desc: "Kiểm tra hàng rồi thanh toán tiền mặt cho shipper", icon: Banknote },
                { id: "VNPAY", title: "Cổng thanh toán VNPAY QR", desc: "Quét mã VNPAY qua app ngân hàng", icon: CreditCard },
                { id: "MOMO", title: "Ví điện tử MoMo", desc: "Thanh toán siêu tốc qua ứng dụng MoMo", icon: CreditCard },
                { id: "STRIPE", title: "Thẻ quốc tế Visa, Mastercard (Stripe)", desc: "Xử lý bảo mật tiêu chuẩn quốc tế", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition ${
                      isSelected
                        ? "border-foreground bg-neutral-50/50 dark:bg-neutral-900/50 ring-1 ring-foreground"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
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

        {/* Right Column: Order Review & Voucher & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider">Đơn hàng của bạn ({items.length})</h2>

            {/* Mini Items List */}
            <div className="divide-y divide-border max-h-72 overflow-y-auto pr-1 text-xs">
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

            {/* Voucher Code Input with Real-time Validation (Task 2) */}
            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Tag size={13} className="text-foreground" /> Mã giảm giá / Voucher đổi điểm
              </label>

              {couponCode ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <div>
                      <span className="font-mono font-bold tracking-wider">{couponCode}</span>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        Đã giảm: -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-muted hover:text-red-500 p-1 transition cursor-pointer"
                    title="Gỡ mã giảm giá"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: AURA-XXXX-XXXX, AURA10)"
                    value={voucherInput}
                    onChange={(e) => {
                      setVoucherInput(e.target.value.toUpperCase());
                      if (voucherFeedback) setVoucherFeedback(null);
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isValidatingVoucher || !voucherInput.trim()}
                    className="px-4 py-2 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isValidatingVoucher ? <Loader2 size={13} className="animate-spin" /> : "Áp dụng"}
                  </button>
                </div>
              )}

              {voucherFeedback && (
                <p
                  className={`text-[11px] flex items-center gap-1 mt-1 ${
                    voucherFeedback.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {voucherFeedback.type === "success" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  {voucherFeedback.message}
                </p>
              )}
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
                <div className="flex justify-between text-emerald-600 font-medium">
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
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" /> Đang tiến hành tạo đơn hàng...
                </span>
              ) : (
                <>
                  Xác nhận đặt hàng <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          <div className="p-4 border border-border rounded-lg text-xs text-muted space-y-2 bg-background">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck size={16} /> Cam kết mua sắm AURA Studio
            </div>
            <p className="leading-relaxed">
              Tồn kho được giữ chỗ tức thì khi tạo đơn. Hỗ trợ kiểm tra hàng trước khi thanh toán và đổi trả 30 ngày tận nhà hoàn toàn miễn phí.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
