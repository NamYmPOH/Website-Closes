"use client";

import React from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { ProductItem } from "./ProductCard";

export interface CartLineItem {
  product: ProductItem;
  quantity: number;
}

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartLineItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function MiniCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: MiniCartProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.basePrice * item.quantity,
    0
  );

  const formattedSubtotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-background border-l border-border flex flex-col shadow-2xl">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 className="text-base font-semibold uppercase tracking-wider">
              Giỏ hàng ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground transition"
              aria-label="Đóng giỏ hàng"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <p className="text-muted text-sm">Giỏ hàng của bạn đang trống.</p>
                <button
                  onClick={onClose}
                  className="text-xs uppercase tracking-wider font-semibold underline hover:opacity-80"
                >
                  Bắt đầu mua sắm
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 py-3 border-b border-border/50"
                >
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.title}
                    className="w-16 h-20 object-cover rounded bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium truncate">{item.product.title}</h4>
                    <p className="text-xs font-semibold mt-1">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.product.basePrice)}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                          }
                          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-muted hover:text-red-500 transition p-1"
                        title="Xóa món hàng"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Tạm tính</span>
                <span className="font-semibold text-base">{formattedSubtotal}</span>
              </div>
              <p className="text-[11px] text-muted">
                Phí vận chuyển và thuế sẽ được tính khi thanh toán. Miễn phí ship từ 500.000₫.
              </p>
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Thanh toán ngay <ArrowRight size={14} />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs font-medium hover:underline block"
                >
                  Xem chi tiết giỏ hàng
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
