"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const router = useRouter();
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
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-8 text-foreground">
        Giỏ hàng của bạn ({totalQuantity})
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Giỏ hàng của bạn đang trống"
          description="Chưa có món hàng nào được thêm vào giỏ. Hãy tham khảo các sản phẩm mới nhất để chọn cho mình thiết kế ưng ý."
          actionLabel="Bắt đầu mua sắm ngay"
          onAction={() => router.push("/products")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="py-6 flex gap-6 items-center"
                >
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-border/40">
                    <Image
                      src={item.product.primaryImage}
                      alt={item.product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-semibold hover:underline truncate block text-foreground"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">
                      Đơn giá: {formatCurrency(item.product.basePrice)}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      {/* Quantity Stepper */}
                      <QuantityStepper
                        value={item.quantity}
                        min={1}
                        size="sm"
                        onChange={(newQty) =>
                          updateQuantity(item.product.id, newQty)
                        }
                      />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs text-muted hover:text-red-500 flex items-center gap-1 transition cursor-pointer"
                        aria-label={`Xóa ${item.product.title} khỏi giỏ`}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(item.product.basePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/products"
                className="text-xs font-medium text-muted hover:text-foreground transition"
              >
                ← Tiếp tục mua sắm
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-muted hover:text-red-500 underline cursor-pointer transition"
              >
                Xóa sạch giỏ hàng
              </button>
            </div>
          </div>

          {/* Order Summary & Coupon */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 border border-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 space-y-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Tóm tắt đơn hàng
              </h2>

              {/* Coupon Form */}
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Mã giảm giá (ví dụ: AURA10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none uppercase text-foreground placeholder:text-muted"
                    />
                    <Tag
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="primary">
                    Áp dụng
                  </Button>
                </form>

                {couponFeedback && (
                  <p
                    className={`text-xs ${
                      couponFeedback.success
                        ? "text-emerald-600 font-medium"
                        : "text-red-500"
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded border border-emerald-500/20">
                    <span>
                      Đang dùng mã: <strong>{couponCode}</strong>
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="underline text-[11px] cursor-pointer"
                    >
                      Gỡ bỏ
                    </button>
                  </div>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-3 text-xs border-t border-border pt-4">
                <div className="flex justify-between text-muted">
                  <span>Tạm tính</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Giảm giá khuyến mãi</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shipping === 0 ? "Miễn phí (Freeship)" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-3">
                  <span className="text-foreground">Tổng thanh toán</span>
                  <span className="text-base text-foreground">
                    {formatCurrency(total)}
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
