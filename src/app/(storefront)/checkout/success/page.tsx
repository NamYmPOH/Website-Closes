"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Truck } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || `ORD-${Date.now().toString().slice(-6)}`;
  const total = searchParams.get("total") ? Number(searchParams.get("total")) : 0;
  const name = searchParams.get("name") || "Quý khách";

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={36} />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-muted font-semibold">ĐẶT HÀNG THÀNH CÔNG</span>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
          Cảm ơn bạn, {name}!
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Mã đơn hàng của bạn là <strong className="text-foreground">{orderNumber}</strong>. Chúng tôi đã gửi email xác nhận cùng hóa đơn điện tử cho bạn.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 text-left text-xs space-y-4 max-w-md mx-auto">
        <div className="flex justify-between pb-3 border-b border-border">
          <span className="text-muted">Mã đơn hàng</span>
          <span className="font-bold">{orderNumber}</span>
        </div>
        <div className="flex justify-between pb-3 border-b border-border">
          <span className="text-muted">Thời gian dự kiến giao</span>
          <span className="font-semibold">24 - 48 giờ tới</span>
        </div>
        {total > 0 && (
          <div className="flex justify-between pb-3 border-b border-border">
            <span className="text-muted">Tổng tiền</span>
            <span className="font-bold text-sm">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted pt-1">
          <Truck size={14} /> Giao hàng tiêu chuẩn có mã vận đơn theo dõi trực tiếp
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/products"
          className="px-6 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center gap-2"
        >
          Tiếp tục mua sắm <ArrowRight size={14} />
        </Link>
        <Link
          href="/account"
          className="px-6 py-3 border border-border text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Xem lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-muted">Đang tải thông tin đơn hàng...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
