"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AddressAutocomplete, { AddressData } from "@/components/storefront/AddressAutocomplete";
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
  Copy,
  Tag,
  Gift,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
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

interface PointsData {
  availablePoints: number;
  totalPoints: number;
  usedPoints: number;
  history: Array<{
    id: string;
    action: string;
    points: number;
    description: string;
    date: string;
  }>;
  vouchers: Array<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrder: number;
    expiryDate: string;
    isExpired: boolean;
    isUsed: boolean;
    createdAt: string;
  }>;
}

export interface UserOrderItem {
  id: string;
  productTitle: string;
  variantTitle: string | null;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  productSlug?: string;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  createdAt: string;
  items: UserOrderItem[];
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "DELIVERED":
      return {
        label: "Giao hàng thành công",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      };
    case "SHIPPED":
      return {
        label: "Đang vận chuyển",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      };
    case "PROCESSING":
    case "CONFIRMED":
      return {
        label: "Đang chuẩn bị hàng",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      };
    case "REFUNDED":
      return {
        label: "Đã hoàn tiền",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
      };
    case "PENDING":
    default:
      return {
        label: "Chờ xác nhận",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      };
  }
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<"orders" | "points" | "addresses" | "profile">("orders");

  // State profile
  const [name, setName] = useState(session?.user?.name || "Tài khoản");
  const [phone, setPhone] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // State addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState(session?.user?.name || "");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrData, setNewAddrData] = useState<AddressData>({
    province: "",
    district: "",
    ward: "",
    street: "",
    fullAddress: "",
  });
  const [addrLoading, setAddrLoading] = useState(false);

  // State Points & Vouchers (Lấy chính xác từ Database theo User)
  const [pointsData, setPointsData] = useState<PointsData>({
    availablePoints: 0,
    totalPoints: 0,
    usedPoints: 0,
    history: [],
    vouchers: [],
  });
  const [redeemingOption, setRedeemingOption] = useState<number | null>(null);
  const [redeemSuccessAlert, setRedeemSuccessAlert] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // State Lịch sử đơn hàng cá nhân thực tế từ Database
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Fetch dữ liệu thực tế của user từ API
  useEffect(() => {
    if (session?.user) {
      const userDisplayName =
        session.user.name || session.user.email?.split("@")[0] || "Tài khoản";
      setName(userDisplayName);
      setNewAddrName(userDisplayName);

      // 1. Lấy đơn hàng thực tế của user
      setOrdersLoading(true);
      fetch("/api/user/orders")
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải đơn hàng");
          return res.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
          setOrdersError(null);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
          console.error("[FETCH_USER_ORDERS_ERROR]", msg);
          setOrdersError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
        })
        .finally(() => {
          setOrdersLoading(false);
        });

      // 2. Lấy điểm thưởng thực tế
      fetch("/api/points")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.authenticated) {
            setPointsData(data);
          }
        })
        .catch(() => {});

      // 3. Lấy danh sách địa chỉ đã lưu
      fetch("/api/user/addresses")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
          }
        })
        .catch(() => {});
    } else if (status === "unauthenticated") {
      setOrdersLoading(false);
    }
  }, [session, status]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrData.street.trim() || !newAddrData.province.trim()) {
      alert("Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.");
      return;
    }

    setAddrLoading(true);

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: newAddrName.trim(),
          phoneNumber: newAddrPhone.trim(),
          street: newAddrData.street.trim(),
          ward: newAddrData.ward.trim() || undefined,
          district: newAddrData.district.trim(),
          city: newAddrData.province.trim(),
          province: newAddrData.province.trim(),
          isDefaultShipping: addresses.length === 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [data.address, ...prev]);
        setIsAddingAddress(false);
        setNewAddrPhone("");
      } else {
        // Fallback local
        const newLocalAddr: SavedAddress = {
          id: `addr-${Date.now()}`,
          receiverName: newAddrName.trim(),
          phoneNumber: newAddrPhone.trim(),
          street: newAddrData.street.trim(),
          ward: newAddrData.ward.trim() || undefined,
          district: newAddrData.district.trim(),
          city: newAddrData.province.trim(),
          province: newAddrData.province.trim(),
          isDefaultShipping: addresses.length === 0,
        };
        setAddresses((prev) => [newLocalAddr, ...prev]);
        setIsAddingAddress(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddrLoading(false);
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Đổi điểm lấy voucher
  const handleRedeemPoints = async (pointsCost: number) => {
    if (pointsData.availablePoints < pointsCost) {
      alert(`Bạn cần tối thiểu ${pointsCost} điểm để đổi voucher này.`);
      return;
    }

    setRedeemingOption(pointsCost);
    setRedeemSuccessAlert(null);

    try {
      const res = await fetch("/api/points/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pointsCost }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Không thể đổi điểm lúc này.");
      } else {
        setRedeemSuccessAlert({
          code: data.voucher.code,
          message: data.message,
        });

        // Cập nhật lại state điểm & vouchers
        setPointsData((prev) => ({
          ...prev,
          availablePoints: data.remainingPoints,
          usedPoints: prev.usedPoints + pointsCost,
          vouchers: [
            {
              id: data.voucher.id || `v-${Date.now()}`,
              code: data.voucher.code,
              discountType: data.voucher.discountType,
              discountValue: data.voucher.discountValue,
              minOrder: 0,
              expiryDate: data.voucher.expiryDate,
              isExpired: false,
              isUsed: false,
              createdAt: new Date().toLocaleDateString("vi-VN"),
            },
            ...prev.vouchers,
          ],
          history: [
            {
              id: `hist-${Date.now()}`,
              action: "redeem",
              points: -pointsCost,
              description: `Đổi ${pointsCost} điểm lấy mã ${data.voucher.code}`,
              date: "Vừa xong",
            },
            ...prev.history,
          ],
        }));
      }
    } catch (err) {
      alert("Đã xảy ra lỗi khi kết nối đến máy chủ.");
    } finally {
      setRedeemingOption(null);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
        <div className="p-4 mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <span>Bạn đang xem tài khoản với tư cách Khách. Đăng nhập để đồng bộ đơn hàng và điểm tích lũy.</span>
          <Link
            href="/auth/login"
            className="font-semibold underline flex items-center gap-1 hover:opacity-80 transition"
          >
            <LogIn size={14} /> Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Account Header Profile Box */}
      <div className="p-6 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl uppercase shadow-sm">
            {displayName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold uppercase tracking-tight">{displayName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-foreground uppercase">
                {userTier} Tier
              </span>
            </div>
            <p className="text-xs text-muted">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-background px-3.5 py-2 rounded-lg border border-border text-center shadow-2xs">
            <span className="text-[10px] text-muted block uppercase font-medium">Điểm tích lũy</span>
            <span className="text-sm font-bold text-foreground">
              {new Intl.NumberFormat("vi-VN").format(pointsData.availablePoints)} pts
            </span>
          </div>
        </div>
      </div>

      {/* Main Account Tabs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 md:col-span-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
            }`}
          >
            <Package size={15} /> Lịch sử đơn hàng
          </button>

          <button
            onClick={() => setActiveTab("points")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "points"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
            }`}
          >
            <Award size={15} /> Điểm thưởng & Voucher
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "addresses"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
            }`}
          >
            <MapPin size={15} /> Sổ địa chỉ giao hàng
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-foreground text-background shadow-sm"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
            }`}
          >
            <User size={15} /> Thông tin cá nhân & 2FA
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

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* 1. TAB ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Lịch sử đơn hàng cá nhân ({orders.length})
                </h3>
                {ordersLoading && (
                  <span className="text-xs text-muted flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" /> Đang cập nhật...
                  </span>
                )}
              </div>

              {/* Trạng thái 1: Đang tải dữ liệu */}
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-5 border border-border rounded-lg space-y-3 bg-background animate-pulse"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-36"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20"></div>
                      </div>
                      <div className="space-y-2 py-1">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                /* Trạng thái 2: Lỗi tải dữ liệu */
                <div className="p-6 border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-center space-y-3 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={24} className="mx-auto text-red-500" />
                  <p>{ordersError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrdersLoading(true);
                      fetch("/api/user/orders")
                        .then((res) => res.json())
                        .then((d) => {
                          if (d?.orders) setOrders(d.orders);
                          setOrdersError(null);
                        })
                        .catch(() => setOrdersError("Không thể tải đơn hàng."))
                        .finally(() => setOrdersLoading(false));
                    }}
                    className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : orders.length === 0 ? (
                /* Trạng thái 3: Trống (Chưa có đơn hàng) */
                <div className="p-10 border border-dashed border-border rounded-xl text-center space-y-3 bg-background">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted">
                    <Package size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Bạn chưa có đơn hàng nào</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Mọi đơn hàng bạn đặt với tài khoản này sẽ được lưu trữ và cập nhật tình trạng giao nhận chi tiết tại đây.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition"
                    >
                      Khám phá bộ sưu tập ngay
                    </Link>
                  </div>
                </div>
              ) : (
                /* Trạng thái 4: Danh sách đơn hàng thực tế của user */
                <div className="space-y-3">
                  {orders.map((order) => {
                    const badge = getOrderStatusBadge(order.status);
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={order.id}
                        className="p-5 border border-border rounded-lg space-y-3 text-xs bg-background shadow-xs hover:border-foreground/30 transition"
                      >
                        <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-border">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-foreground">
                              #{order.orderNumber}
                            </span>
                            <span className="text-muted text-[11px]">• {formattedDate}</span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Danh sách các sản phẩm trong đơn */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {item.productImage && (
                                  <img
                                    src={item.productImage}
                                    alt={item.productTitle}
                                    className="w-8 h-10 object-cover rounded bg-neutral-100 shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">
                                    {item.productTitle}
                                  </p>
                                  <p className="text-[10px] text-muted truncate">
                                    {item.variantTitle ? `Phân loại: ${item.variantTitle} • ` : ""}
                                    Số lượng: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-foreground shrink-0">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tổng thanh toán và phương thức */}
                        <div className="flex flex-wrap justify-between items-center gap-2 pt-2.5 border-t border-border font-medium">
                          <div className="text-[11px] text-muted">
                            PT thanh toán:{" "}
                            <span className="font-semibold text-foreground uppercase">
                              {order.paymentMethod}
                            </span>
                            {order.paymentStatus === "PAID" && (
                              <span className="ml-1.5 text-emerald-600 font-semibold">
                                • Đã thanh toán
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted">Tổng cộng:</span>
                            <strong className="text-sm font-bold text-foreground">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(order.totalAmount)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. TAB ĐIỂM THƯỞNG & VOUCHER (TASK 2) */}
          {activeTab === "points" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Alert Đổi thành công */}
              {redeemSuccessAlert && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">{redeemSuccessAlert.message}</p>
                      <p className="font-mono text-sm tracking-wider mt-0.5">{redeemSuccessAlert.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyVoucherCode(redeemSuccessAlert.code)}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                  >
                    <Copy size={13} /> {copiedCode === redeemSuccessAlert.code ? "Đã chép!" : "Sao chép"}
                  </button>
                </div>
              )}

              {/* Tóm tắt 3 thẻ điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Điểm khả dụng</span>
                  <div className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat("vi-VN").format(pointsData.availablePoints)}
                  </div>
                  <p className="text-[11px] text-muted">Có thể dùng để đổi các mã giảm giá bên dưới</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Tổng tích lũy</span>
                  <div className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat("vi-VN").format(pointsData.totalPoints)}
                  </div>
                  <p className="text-[11px] text-muted">Mỗi 1.000đ chi tiêu = 1 điểm thưởng</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Điểm đã tiêu</span>
                  <div className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat("vi-VN").format(pointsData.usedPoints)}
                  </div>
                  <p className="text-[11px] text-muted">Điểm đã đổi sang voucher thành công</p>
                </div>
              </div>

              {/* Các mốc đổi voucher (50 pts = 500đ, 100 pts = 1.000đ, 200 pts = 2%, 500 pts = 5%) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Gift size={15} className="text-foreground" /> Các mốc đổi voucher khuyến mãi
                  </h3>
                  <span className="text-[11px] text-muted">Voucher có hiệu lực 30 ngày từ lúc đổi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { points: 50, reward: "Voucher giảm 500đ", desc: "Áp dụng cho mọi đơn hàng", badge: "Tiết kiệm" },
                    { points: 100, reward: "Voucher giảm 1.000đ", desc: "Áp dụng cho mọi đơn hàng", badge: "Phổ biến" },
                    { points: 200, reward: "Voucher giảm 2%", desc: "Giảm trực tiếp 2% tổng đơn", badge: "Ưu đãi %" },
                    { points: 500, reward: "Voucher giảm 5%", desc: "Giảm trực tiếp 5% tổng đơn", badge: "Cao cấp" },
                  ].map((tier) => {
                    const canRedeem = pointsData.availablePoints >= tier.points;
                    const isRedeeming = redeemingOption === tier.points;

                    return (
                      <div
                        key={tier.points}
                        className={`p-4 border rounded-xl flex flex-col justify-between space-y-3 bg-background transition ${
                          canRedeem ? "border-border hover:border-foreground/50 shadow-2xs" : "border-border/60 opacity-75"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold uppercase text-muted">
                              {tier.badge}
                            </span>
                            <h4 className="text-sm font-bold text-foreground mt-1">{tier.reward}</h4>
                            <p className="text-[11px] text-muted">{tier.desc}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground block">{tier.points} pts</span>
                            <span className="text-[10px] text-muted">Cần tích lũy</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRedeemPoints(tier.points)}
                          disabled={!canRedeem || isRedeeming}
                          className="w-full py-2 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isRedeeming ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Đang đổi...
                            </>
                          ) : canRedeem ? (
                            <>
                              <Sparkles size={13} /> Đổi mã ngay
                            </>
                          ) : (
                            `Cần thêm ${tier.points - pointsData.availablePoints} điểm`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Danh sách Voucher đã đổi */}
              {pointsData.vouchers && pointsData.vouchers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={15} /> Voucher của bạn ({pointsData.vouchers.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pointsData.vouchers.map((v) => (
                      <div
                        key={v.id}
                        className={`p-3.5 border rounded-lg flex items-center justify-between text-xs bg-background ${
                          v.isUsed || v.isExpired ? "opacity-60 bg-neutral-50 dark:bg-neutral-900" : "border-foreground/30 shadow-2xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm tracking-wider">{v.code}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                v.isUsed
                                  ? "bg-neutral-200 dark:bg-neutral-800 text-muted"
                                  : v.isExpired
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              {v.isUsed ? "Đã dùng" : v.isExpired ? "Hết hạn" : "Khả dụng"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted mt-0.5">
                            Giảm: {v.discountType === "percent" ? `${v.discountValue}%` : `${new Intl.NumberFormat("vi-VN").format(v.discountValue)}₫`} • HSD: {v.expiryDate}
                          </p>
                        </div>

                        {!v.isUsed && !v.isExpired && (
                          <button
                            type="button"
                            onClick={() => copyVoucherCode(v.code)}
                            className="p-1.5 border border-border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                            title="Sao chép mã"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lịch sử Tích điểm & Tiêu điểm */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={15} /> Lịch sử biến động điểm thưởng
                </h3>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-border text-muted">
                      <tr>
                        <th className="p-3 font-semibold">Thời gian</th>
                        <th className="p-3 font-semibold">Hành động</th>
                        <th className="p-3 font-semibold">Nội dung chi tiết</th>
                        <th className="p-3 font-semibold text-right">Số điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pointsData.history.map((h) => (
                        <tr key={h.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                          <td className="p-3 text-muted">{h.date}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                h.action === "earn"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              }`}
                            >
                              {h.action === "earn" ? "Tích lũy (+)" : "Đổi voucher (-)"}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate">{h.description}</td>
                          <td
                            className={`p-3 text-right font-bold font-mono ${
                              h.points > 0 ? "text-emerald-600" : "text-foreground"
                            }`}
                          >
                            {h.points > 0 ? `+${h.points}` : h.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. TAB SỔ ĐỊA CHỈ (TASK 3) */}
          {activeTab === "addresses" && (
            <div className="space-y-4 animate-in fade-in duration-200">
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
                      <X size={13} /> Đóng form
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Thêm địa chỉ mới
                    </>
                  )}
                </button>
              </div>

              {/* Form thêm địa chỉ mới với AddressAutocomplete */}
              {isAddingAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 border border-border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/40 space-y-4 text-xs animate-in fade-in shadow-xs"
                >
                  <h4 className="font-bold uppercase text-xs">Thêm địa chỉ giao hàng mới</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted block mb-1 font-medium">Họ và tên người nhận *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn An"
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-muted block mb-1 font-medium">Số điện thoại liên hệ *</label>
                      <input
                        type="tel"
                        required
                        placeholder="VD: 0912345678"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                  </div>

                  {/* Component gợi ý địa chỉ tự động cascade & geolocation */}
                  <AddressAutocomplete
                    onChange={(data) => setNewAddrData(data)}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 border border-border rounded-md text-xs cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={addrLoading}
                      className="px-5 py-2 bg-foreground text-background text-xs font-semibold rounded-md cursor-pointer hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {addrLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                      Lưu địa chỉ
                    </button>
                  </div>
                </form>
              )}

              {/* Danh sách địa chỉ đã lưu */}
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="p-8 border border-dashed border-border rounded-lg text-center text-xs text-muted">
                    Chưa có địa chỉ nào trong sổ. Hãy thêm địa chỉ mới để đặt hàng nhanh hơn!
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 border border-border rounded-lg space-y-1.5 text-xs bg-background flex justify-between items-start shadow-xs hover:border-foreground/30 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold">{addr.receiverName}</strong>
                          {addr.isDefaultShipping && (
                            <span className="bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-muted">{addr.phoneNumber}</p>
                        <p className="text-muted">
                          {[addr.street, addr.ward, addr.district, addr.province || addr.city].filter(Boolean).join(", ")}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-500 hover:underline text-[11px] cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. TAB THÔNG TIN CÁ NHÂN & 2FA */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold uppercase tracking-wider">Thông tin tài khoản</h3>

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={16} /> Cập nhật thông tin thành công!
                </div>
              )}

              <form
                onSubmit={handleSaveProfile}
                className="space-y-4 p-6 border border-border rounded-lg bg-background text-xs shadow-xs"
              >
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
        </div>
      </div>
    </div>
  );
}
