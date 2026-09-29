"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { ProductItem } from "@/types/product";
import { formatCurrency } from "@/lib/utils/format";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

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
  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + item.product.basePrice * item.quantity,
      0
    );
  }, [items]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-background border-l border-border flex flex-col shadow-2xl">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <h2 className="text-base font-semibold uppercase tracking-wider text-foreground">
              Giỏ hàng ({totalItemsCount})
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground transition cursor-pointer"
              aria-label="Đóng giỏ hàng"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <EmptyState
                  icon={ShoppingBag}
                  title="Giỏ hàng đang trống"
                  description="Bạn chưa chọn sản phẩm nào. Hãy khám phá bộ sưu tập mới nhất ngay."
                  actionLabel="Bắt đầu mua sắm"
                  onAction={onClose}
                  className="w-full border-0 bg-transparent"
                />
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 py-3 border-b border-border/50"
                >
                  <div className="relative w-16 h-20 rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                    <Image
                      src={item.product.primaryImage}
                      alt={item.product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium truncate text-foreground">
                      {item.product.title}
                    </h4>
                    <p className="text-xs font-semibold mt-1 text-foreground">
                      {formatCurrency(item.product.basePrice)}
                    </p>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        min={1}
                        size="sm"
                        onChange={(newQty) =>
                          onUpdateQuantity(item.product.id, newQty)
                        }
                      />

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-muted hover:text-red-500 transition p-1 cursor-pointer"
                        title="Xóa món hàng"
                        aria-label={`Xóa ${item.product.title} khỏi giỏ`}
                      >
                        <Trash2 size={14} />
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
                <span className="font-semibold text-base text-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Phí vận chuyển và voucher sẽ được tính khi thanh toán. Miễn phí ship từ 500.000₫.
              </p>
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xs"
                >
                  Thanh toán ngay <ArrowRight size={14} />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-xs font-medium hover:underline block text-muted hover:text-foreground"
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
