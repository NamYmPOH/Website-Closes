"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getTotal,
  } = useCartStore();

  const [inputCode, setInputCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const total = getTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    const res = applyCoupon(inputCode);
    setCouponFeedback(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-8">
        Giỏ hàng của bạn ({items.reduce((acc, i) => acc + i.quantity, 0)})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-lg space-y-4">
          <p className="text-muted text-sm">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition"
          >
            Bắt đầu mua sắm ngay <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <div key={item.product.id} className="py-6 flex gap-6 items-center">
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.title}
                    className="w-20 h-28 object-cover rounded bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-semibold hover:underline truncate block"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">
                      Đơn giá:{" "}
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        item.product.basePrice
                      )}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs text-muted hover:text-red-500 flex items-center gap-1 transition"
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-sm font-bold">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        item.product.basePrice * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link href="/products" className="text-xs font-medium text-muted hover:text-foreground">
                ← Tiếp tục mua sắm
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-muted hover:text-red-500 underline"
              >
                Xóa sạch giỏ hàng
              </button>
            </div>
          </div>

          {/* Order Summary & Coupon */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider">Tóm tắt đơn hàng</h2>

              {/* Coupon Form (Tính năng 52) */}
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Mã giảm giá (ví dụ: AURA10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none uppercase"
                    />
                    <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-md hover:opacity-90"
                  >
                    Áp dụng
                  </button>
                </form>

                {couponFeedback && (
                  <p
                    className={`text-xs ${
                      couponFeedback.success ? "text-green-600 font-medium" : "text-red-500"
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-2 rounded">
                    <span>Đang dùng mã: <strong>{couponCode}</strong></span>
                    <button onClick={removeCoupon} className="underline text-[11px]">Gỡ bỏ</button>
                  </div>
                )}
              </div>

              {/* Cost Calculations (Tính năng 51) */}
              <div className="space-y-3 text-xs border-t border-border pt-4">
                <div className="flex justify-between text-muted">
                  <span>Tạm tính</span>
                  <span className="text-foreground font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá khuyến mãi</span>
                    <span>
                      -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shipping === 0
                      ? "Miễn phí (Freeship)"
                      : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-3">
                  <span>Tổng thanh toán</span>
                  <span className="text-base">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-3.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Tiến hành thanh toán <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted justify-center">
              <ShieldCheck size={16} />
              <span>Giao dịch an toàn & được mã hóa bảo mật 256-bit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
