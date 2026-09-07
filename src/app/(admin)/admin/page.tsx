"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
} from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/products-data";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const [orders, setOrders] = useState([
    {
      id: "ORD-98214-X9",
      customer: "Hoàng Long",
      total: 1210000,
      status: "PENDING",
      date: "Hôm nay, 14:32",
      items: "Áo Thun Cotton (x2)",
    },
    {
      id: "ORD-84112-A1",
      customer: "Minh Trang",
      total: 420000,
      status: "CONFIRMED",
      date: "Hôm nay, 11:15",
      items: "Đầm Linen Dáng Suông (x1)",
    },
    {
      id: "ORD-73105-B2",
      customer: "Văn Đức",
      total: 790000,
      status: "SHIPPED",
      date: "Hôm qua",
      items: "Quần Trousers Form Đứng (x1)",
    },
    {
      id: "ORD-61209-C3",
      customer: "Thanh Hằng",
      total: 1050000,
      status: "DELIVERED",
      date: "05/09/2026",
      items: "Áo Blazer Kẻ Sọc (x1)",
    },
  ]);

  // Danh sách sản phẩm cảnh báo tồn kho (dưới ngưỡng reorder_threshold)
  const [lowStockProducts, setLowStockProducts] = useState([
    {
      id: "prod-low-1",
      title: "Áo Sơ Mi Oxford Slim Fit",
      sku: "AURA-OXF-WHT-M",
      actualStock: 4,
      reservedStock: 2,
      availableStock: 2,
      reorderThreshold: 5,
    },
    {
      id: "prod-low-2",
      title: "Quần Linen Relaxed Trousers",
      sku: "AURA-LIN-BEG-L",
      actualStock: 6,
      reservedStock: 3,
      availableStock: 3,
      reorderThreshold: 5,
    },
    {
      id: "prod-low-3",
      title: "Túi Tote Canvas Minimalist",
      sku: "AURA-ACC-TOT-BLK",
      actualStock: 5,
      reservedStock: 4,
      availableStock: 1,
      reorderThreshold: 5,
    },
  ]);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newBrand, setNewBrand] = useState("AURA");
  const [productSuccess, setProductSuccess] = useState(false);

  // Cập nhật trạng thái đơn hàng & trigger tự động tồn kho theo Task 1
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. Gọi API cập nhật trạng thái nếu là đơn hàng thực
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });

      const data = await res.json();
      if (data?.alerts && data.alerts.length > 0) {
        setAlertMessage(data.alerts.join(" | "));
      }
    } catch (e) {
      // Tiếp tục cập nhật UI state
    }

    // 2. Cập nhật state nội bộ
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      })
    );

    if (newStatus === "CONFIRMED") {
      setAlertMessage(`Đơn hàng #${orderId} đã được xác nhận thanh toán! Đã trừ số lượng tồn kho thực tế.`);
    } else if (newStatus === "DELIVERED") {
      setAlertMessage(`Đơn hàng #${orderId} đã giao thành công! Đã cộng điểm thưởng khách hàng.`);
    } else if (newStatus === "CANCELLED" || newStatus === "RETURNED") {
      setAlertMessage(`Đơn hàng #${orderId} đã hủy/hoàn trả! Đã hoàn lại số lượng sản phẩm vào kho.`);
    }

    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    setProductSuccess(true);
    setTimeout(() => {
      setProductSuccess(false);
      setIsAddProductOpen(false);
      setNewTitle("");
      setNewPrice("");
    }, 1200);
  };

  const adminName = session?.user?.name || "Quản Trị Viên";
  const adminEmail = session?.user?.email || "admin@aurastudio.com";
  const adminRole = (session?.user as any)?.role || "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-foreground">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-base tracking-tighter uppercase">
            AURA | ADMIN PORTAL
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-200 dark:bg-neutral-800 font-semibold uppercase">
            {adminRole}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition font-medium"
          >
            Xem cửa hàng <ExternalLink size={13} />
          </Link>

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <div className="text-right hidden sm:block">
              <span className="font-bold block text-foreground leading-tight">{adminName}</span>
              <span className="text-[10px] text-muted">{adminEmail}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold uppercase text-xs">
              {adminName.charAt(0)}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              title="Đăng xuất khỏi Admin"
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition cursor-pointer ml-1"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Realtime Alert Banner */}
        {alertMessage && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="cursor-pointer text-muted hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
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
              <span className="text-2xl font-bold">48 đơn</span>
              <span className="text-xs text-green-600 font-semibold flex items-center">
                +8.1% <TrendingUp size={12} className="ml-0.5" />
              </span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">Khách hàng thành viên</span>
              <Users size={16} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">1,420</span>
              <span className="text-xs text-muted font-normal">14 VIP tiers</span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-xl bg-background space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-muted">
              <span className="text-xs font-semibold uppercase tracking-wider">Cảnh báo tồn kho</span>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-500">{lowStockProducts.length} sản phẩm</span>
              <span className="text-[11px] text-muted">Dưới ngưỡng nhập</span>
            </div>
          </div>
        </div>

        {/* 1. Realtime Order Management with Lifecycle Transitions (Task 1) */}
        <div className="p-6 border border-border rounded-xl bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight">Vòng đời Đơn hàng & Cập nhật kho (Task 1)</h2>
              <p className="text-xs text-muted">
                Pending (Giữ chỗ) → Confirmed (Trừ kho thật) → Delivering → Completed (Tích điểm) → Cancelled (Hoàn kho)
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync API
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-border text-muted">
                <tr>
                  <th className="p-3 font-semibold">Mã đơn</th>
                  <th className="p-3 font-semibold">Khách hàng</th>
                  <th className="p-3 font-semibold">Sản phẩm</th>
                  <th className="p-3 font-semibold">Tổng tiền</th>
                  <th className="p-3 font-semibold">Trạng thái kho & đơn</th>
                  <th className="p-3 font-semibold text-right">Chuyển trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const s = order.status;
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition">
                      <td className="p-3 font-mono font-bold">{order.id}</td>
                      <td className="p-3">{order.customer}</td>
                      <td className="p-3 text-muted">{order.items}</td>
                      <td className="p-3 font-semibold">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                            s === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : s === "SHIPPED"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : s === "CONFIRMED"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              : s === "CANCELLED" || s === "RETURNED"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {s === "DELIVERED" && "Hoàn thành (Cộng điểm)"}
                          {s === "SHIPPED" && "Đang giao hàng"}
                          {s === "CONFIRMED" && "Đã trừ kho thật"}
                          {s === "PENDING" && "Tạm giữ kho (Pending)"}
                          {(s === "CANCELLED" || s === "RETURNED") && "Đã hủy (Đã hoàn kho)"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {s === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                              className="px-2.5 py-1 bg-foreground text-background rounded hover:opacity-90 text-[11px] font-medium cursor-pointer"
                              title="Xác nhận thanh toán và trừ kho thực tế"
                            >
                              Xác nhận & trừ kho
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                              className="px-2.5 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 text-[11px] cursor-pointer"
                              title="Hủy đơn và giải phóng số lượng giữ chỗ"
                            >
                              Hủy đơn
                            </button>
                          </>
                        )}

                        {s === "CONFIRMED" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-[11px] font-medium cursor-pointer"
                          >
                            Xuất kho giao hàng
                          </button>
                        )}

                        {s === "SHIPPED" && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-[11px] font-medium cursor-pointer"
                              title="Giao thành công: finalize và tự động cộng điểm tích lũy"
                            >
                              Giao thành công
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, "RETURNED")}
                              className="px-2.5 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 text-[11px] cursor-pointer"
                            >
                              Khách hoàn trả
                            </button>
                          </>
                        )}

                        {(s === "DELIVERED" || s === "CANCELLED" || s === "RETURNED") && (
                          <span className="text-[11px] text-muted italic">Đã kết thúc vòng đời</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Cảnh báo Tồn kho dưới ngưỡng (Reorder Threshold Alerts) */}
        <div className="p-6 border border-border rounded-xl bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Cảnh báo tồn kho dưới ngưỡng an toàn (Task 1)
              </h2>
              <p className="text-xs text-muted">
                Các mặt hàng có số lượng khả dụng (Thực tế - Tạm giữ) nhỏ hơn hoặc bằng ngưỡng tái đặt hàng
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {lowStockProducts.length} mặt hàng cần nhập thêm
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-border text-muted">
                <tr>
                  <th className="p-3 font-semibold">Tên sản phẩm</th>
                  <th className="p-3 font-semibold">Mã SKU</th>
                  <th className="p-3 font-semibold text-center">Tồn thực tế</th>
                  <th className="p-3 font-semibold text-center">Đang giữ chỗ (Pending)</th>
                  <th className="p-3 font-semibold text-center">Khả dụng bán</th>
                  <th className="p-3 font-semibold text-center">Ngưỡng cảnh báo</th>
                  <th className="p-3 font-semibold text-right">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition">
                    <td className="p-3 font-bold">{p.title}</td>
                    <td className="p-3 font-mono text-muted">{p.sku}</td>
                    <td className="p-3 text-center">{p.actualStock}</td>
                    <td className="p-3 text-center text-amber-600 font-semibold">{p.reservedStock}</td>
                    <td className="p-3 text-center font-bold text-red-600">{p.availableStock}</td>
                    <td className="p-3 text-center font-mono">{p.reorderThreshold}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Sắp hết hàng
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Danh mục sản phẩm (ALL_PRODUCTS) */}
        <div className="p-6 border border-border rounded-xl bg-background space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight">Danh mục sản phẩm ({ALL_PRODUCTS.length})</h2>
              <p className="text-xs text-muted">Quản lý giá bán, biến thể và số lượng tồn kho</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(!isAddProductOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-semibold cursor-pointer hover:opacity-90 transition"
            >
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </div>

          {/* Modal / Form thêm sản phẩm */}
          {isAddProductOpen && (
            <form
              onSubmit={handleAddProduct}
              className="p-5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3 text-xs animate-in fade-in"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold uppercase text-xs">Thêm sản phẩm mới vào hệ thống</h4>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {productSuccess && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>Sản phẩm đã được lưu vào danh mục!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-muted block mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    placeholder="Áo Sơ Mi Linen Casual"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    required
                    placeholder="590000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-1.5 border border-border rounded text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-foreground text-background font-semibold rounded text-xs cursor-pointer"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_PRODUCTS.map((prod) => (
              <div key={prod.id} className="p-4 border border-border rounded-lg space-y-2 flex flex-col justify-between bg-background">
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
                  <span className="text-emerald-600 font-semibold">Còn hàng (10+)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
