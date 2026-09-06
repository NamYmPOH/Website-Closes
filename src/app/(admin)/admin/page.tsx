"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Users,
  TrendingUp,
  Package,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/products-data";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-98214-X9", customer: "Hoàng Long", total: 1210000, status: "PROCESSING", date: "Hôm nay, 14:32" },
    { id: "ORD-84112-A1", customer: "Minh Trang", total: 420000, status: "SHIPPED", date: "Hôm nay, 11:15" },
    { id: "ORD-73105-B2", customer: "Văn Đức", total: 790000, status: "DELIVERED", date: "Hôm qua" },
    { id: "ORD-61209-C3", customer: "Thanh Hằng", total: 1050000, status: "DELIVERED", date: "Hôm qua" },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-foreground">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base tracking-tighter uppercase">AURA | ADMIN PORTAL</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-200 dark:bg-neutral-800 font-semibold">
            Super Admin
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition font-medium"
          >
            Xem cửa hàng <ExternalLink size={13} />
          </Link>
          <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
            AD
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metrics Cards (Tính năng 61, 62, 63, 65) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">Doanh thu tháng này</span>
              <DollarSign size={16} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">185.400.000₫</span>
              <span className="text-xs text-green-600 font-semibold flex items-center">
                +14.2% <TrendingUp size={12} className="ml-0.5" />
              </span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">Đơn hàng mới</span>
              <ShoppingBag size={16} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">128 đơn</span>
              <span className="text-xs text-green-600 font-semibold flex items-center">
                +8.5% <TrendingUp size={12} className="ml-0.5" />
              </span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-red-500 font-semibold">
              <span className="text-xs uppercase tracking-wider">Cảnh báo sắp hết hàng</span>
              <AlertTriangle size={16} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-red-600">3 SKU</span>
              <span className="text-[11px] text-muted">Cần nhập thêm</span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
              <Users size={16} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">3.82%</span>
              <span className="text-xs text-green-600 font-semibold flex items-center">
                +0.4% <TrendingUp size={12} className="ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Orders Management Table (Tính năng 78, 79) */}
        <div className="p-6 border border-border rounded-xl bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight">Đơn hàng cần xử lý</h2>
              <p className="text-xs text-muted">Cập nhật trạng thái giao hàng và in phiếu đóng gói</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 dark:bg-neutral-800 text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Mã đơn hàng</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                    <td className="p-3 font-bold">{order.id}</td>
                    <td className="p-3 font-medium">{order.customer}</td>
                    <td className="p-3 text-muted">{order.date}</td>
                    <td className="p-3 font-semibold">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {order.status === "DELIVERED" ? "Đã giao hàng" : order.status === "SHIPPED" ? "Đang giao" : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                        className="px-2.5 py-1 border border-border rounded hover:bg-neutral-100 text-[11px]"
                      >
                        Giao hàng
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                        className="px-2.5 py-1 bg-foreground text-background rounded hover:opacity-90 text-[11px]"
                      >
                        Hoàn thành
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Catalog Snapshot (Tính năng 69 - 73) */}
        <div className="p-6 border border-border rounded-xl bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight">Danh mục sản phẩm ({ALL_PRODUCTS.length})</h2>
              <p className="text-xs text-muted">Quản lý giá bán, biến thể và số lượng tồn kho</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-semibold">
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_PRODUCTS.map((prod) => (
              <div key={prod.id} className="p-4 border border-border rounded-lg space-y-2 flex flex-col justify-between">
                <div>
                  <img src={prod.primaryImage} alt="" className="w-full h-36 object-cover rounded bg-neutral-100 mb-2" />
                  <span className="text-[10px] uppercase font-bold text-muted">{prod.brand}</span>
                  <h4 className="text-xs font-semibold line-clamp-1">{prod.title}</h4>
                  <p className="text-xs font-bold mt-1">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(prod.basePrice)}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-2 border-t border-border text-muted">
                  <span>{prod.variants.length} biến thể</span>
                  <span className="text-green-600 font-semibold">Đang bán</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
