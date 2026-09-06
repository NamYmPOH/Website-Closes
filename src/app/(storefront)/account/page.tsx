"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Package,
  MapPin,
  Award,
  Heart,
  LogOut,
  Shield,
  CheckCircle2,
  Plus,
  X,
  LogIn,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("orders");

  // State profile
  const [name, setName] = useState(session?.user?.name || "Nguyễn Văn An");
  const [phone, setPhone] = useState("0912345678");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // State addresses
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      name: session?.user?.name || "Nguyễn Văn An",
      phone: "0912345678",
      address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      isDefault: true,
    },
  ]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrDetail, setNewAddrDetail] = useState("");

  // Dữ liệu mẫu đơn hàng
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrDetail) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        name: newAddrName,
        phone: newAddrPhone,
        address: newAddrDetail,
        isDefault: false,
      },
    ]);
    setNewAddrName("");
    setNewAddrPhone("");
    setNewAddrDetail("");
    setIsAddingAddress(false);
  };

  const userRole = (session?.user as any)?.role || "CUSTOMER";
  const userTier = (session?.user as any)?.customerTier || "VIP";
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "EDITOR";
  const userEmail = session?.user?.email || "nguyenvanan@example.com";
  const displayName = session?.user?.name || name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner nếu chưa đăng nhập */}
      {status === "unauthenticated" && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div>
            <span className="font-bold block">Bạn hiện đang xem với tài khoản mẫu</span>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              Hãy đăng nhập bằng tài khoản của bạn để quản lý đơn hàng và dữ liệu thực tế.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-foreground text-background font-semibold rounded-md flex items-center gap-1.5 shrink-0"
          >
            <LogIn size={13} /> Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Header Account Info */}
      <div className="flex flex-col md:flex-row items-start justify-between pb-8 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Tài khoản của tôi
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-border">
              {userRole}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Xin chào, <strong>{displayName}</strong> ({userEmail})
          </p>
        </div>

        {/* Loyalty Points Card */}
        <div className="flex items-center gap-3 p-3.5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-md">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] text-muted uppercase tracking-wider font-semibold block">
              Điểm thưởng tích lũy
            </span>
            <span className="text-base font-bold text-foreground">
              {userRole === "SUPER_ADMIN" ? "5,000" : "1,250"} Điểm (Hạng {userTier})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 md:col-span-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Package size={15} /> Lịch sử đơn hàng
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <User size={15} /> Thông tin cá nhân & 2FA
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "addresses"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
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

          {isAdmin && (
            <Link
              href="/admin"
              className="w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
            >
              <Shield size={15} /> Trang Quản trị Admin
            </Link>
          )}

          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            >
              <LogOut size={15} /> Đăng xuất tài khoản
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Đơn hàng gần đây ({mockOrders.length})
              </h3>
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background"
                  >
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
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total)}
                      </span>
                      <button
                        onClick={() => alert(`Xem chi tiết đơn hàng: ${order.id}`)}
                        className="text-xs text-muted hover:text-foreground underline cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB THÔNG TIN CÁ NHÂN */}
          {activeTab === "profile" && (
            <div className="p-6 border border-border rounded-lg space-y-6 max-w-xl bg-background">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Cập nhật hồ sơ cá nhân
              </h3>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-md flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={15} />
                  <span>Đã lưu các thay đổi hồ sơ thành công!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="text-muted block mb-1 font-medium">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1 font-medium">Email tài khoản</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-md bg-neutral-100 dark:bg-neutral-800 text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-muted block mb-1 font-medium">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div className="pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="accent-foreground"
                    />
                    <span className="font-semibold text-foreground">
                      Kích hoạt bảo mật 2 bước (2FA OTP)
                    </span>
                  </label>
                  <p className="text-[11px] text-muted mt-1">
                    Yêu cầu mã xác thực OTP 6 số mỗi khi đăng nhập trên thiết bị mới.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {/* TAB SỔ ĐỊA CHỈ */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Sổ địa chỉ nhận hàng ({addresses.length})
                </h3>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="text-xs font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  {isAddingAddress ? (
                    <>
                      <X size={13} /> Đóng
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Thêm địa chỉ mới
                    </>
                  )}
                </button>
              </div>

              {/* Form thêm địa chỉ mới */}
              {isAddingAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3 text-xs animate-in fade-in"
                >
                  <h4 className="font-bold uppercase text-[11px]">Thông tin địa chỉ mới</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted block mb-1">Tên người nhận</label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn An"
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-muted block mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-muted block mb-1">Địa chỉ chi tiết (Số nhà, đường, phường, quận, TP)</label>
                    <input
                      type="text"
                      required
                      placeholder="Số 45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. HCM"
                      value={newAddrDetail}
                      onChange={(e) => setNewAddrDetail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-md cursor-pointer"
                  >
                    Xác nhận thêm
                  </button>
                </form>
              )}

              {/* Danh sách địa chỉ */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 border border-border rounded-lg space-y-1.5 text-xs bg-background flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{addr.name}</strong>
                        {addr.isDefault && (
                          <span className="bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-muted">{addr.phone}</p>
                      <p className="text-muted">{addr.address}</p>
                    </div>

                    {!addr.isDefault && (
                      <button
                        onClick={() =>
                          setAddresses((prev) => prev.filter((a) => a.id !== addr.id))
                        }
                        className="text-red-500 hover:underline text-[11px] cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
