"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Package, MapPin, Award, Heart, LogOut, ArrowRight } from "lucide-react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("orders");

  // Dữ liệu mẫu đơn hàng người dùng
  const mockOrders = [
    {
      id: "ORD-98214-X9",
      date: "02/09/2026",
      status: "Đang giao hàng",
      total: 1210000,
      items: ["Áo Thun Heavyweight (x2)", "Túi Tote Canvas (x1)"],
    },
    {
      id: "ORD-73105-B2",
      date: "15/08/2026",
      status: "Hoàn thành",
      total: 790000,
      items: ["Quần Linen Relaxed Trousers (x1)"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row items-start justify-between pb-8 border-b border-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Tài khoản của tôi</h1>
          <p className="text-xs text-muted mt-1">Xin chào, Nguyễn Văn An (nguyenvanan@example.com)</p>
        </div>

        {/* Loyalty Points Card (Tính năng 10) */}
        <div className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-md">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] text-muted uppercase tracking-wider font-semibold block">Điểm thưởng tích lũy</span>
            <span className="text-base font-bold text-foreground">1,250 Điểm (Hạng VIP)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1 md:col-span-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "orders" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Package size={15} /> Lịch sử đơn hàng
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "profile" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <User size={15} /> Thông tin cá nhân & 2FA
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition ${
              activeTab === "addresses" ? "bg-foreground text-background" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <MapPin size={15} /> Sổ địa chỉ giao hàng
          </button>
          <Link
            href="/account/wishlist"
            className="w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-foreground"
          >
            <Heart size={15} /> Danh sách yêu thích
          </Link>
          <Link
            href="/admin"
            className="w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
          >
            ⚙️ Quản trị Admin Dashboard
          </Link>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">Đơn hàng gần đây ({mockOrders.length})</h3>
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {mockOrders.map((order) => (
                  <div key={order.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs">{order.id}</span>
                        <span className="text-[11px] text-muted">{order.date}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            order.status === "Hoàn thành"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">{order.items.join(" • ")}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                      </span>
                      <button className="text-xs text-muted hover:text-foreground underline">Chi tiết</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6 border border-border rounded-lg space-y-6 max-w-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider">Cập nhật hồ sơ cá nhân</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted block mb-1 font-medium">Họ và tên</label>
                  <input type="text" defaultValue="Nguyễn Văn An" className="w-full px-3 py-2 border border-border rounded-md" />
                </div>
                <div>
                  <label className="text-muted block mb-1 font-medium">Email</label>
                  <input type="email" defaultValue="nguyenvanan@example.com" disabled className="w-full px-3 py-2 border border-border rounded-md bg-neutral-100 dark:bg-neutral-800 text-muted" />
                </div>
                <div>
                  <label className="text-muted block mb-1 font-medium">Số điện thoại</label>
                  <input type="tel" defaultValue="0912345678" className="w-full px-3 py-2 border border-border rounded-md" />
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-foreground" />
                    <span className="font-semibold">Kích hoạt bảo mật 2 bước (2FA)</span>
                  </label>
                  <p className="text-[11px] text-muted mt-1">Yêu cầu mã OTP 6 số qua Google Authenticator mỗi khi đăng nhập.</p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md">
                Lưu thay đổi
              </button>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider">Sổ địa chỉ nhận hàng</h3>
                <button className="text-xs font-semibold underline">+ Thêm địa chỉ mới</button>
              </div>
              <div className="p-5 border border-border rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <strong className="text-sm">Nguyễn Văn An</strong>
                  <span className="bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-semibold">Mặc định</span>
                </div>
                <p className="text-muted">0912345678</p>
                <p className="text-muted">123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
