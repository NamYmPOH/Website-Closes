"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Key,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token.trim()) {
      setErrorMessage("Vui lòng cung cấp mã token xác thực.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Không thể đặt lại mật khẩu. Token có thể đã hết hạn.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Mật khẩu đã được thay đổi thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => {
        router.push("/auth/login?resetSuccess=true");
      }, 1500);
    } catch (err) {
      setErrorMessage("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto shadow-md">
          <Lock size={20} />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-xs text-muted">
          Nhập mật khẩu mới an toàn cho tài khoản của bạn để hoàn tất quá trình khôi phục
        </p>
      </div>

      {/* Thông báo lỗi & thành công */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Reset Password */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 sm:p-8 border border-border rounded-xl bg-background shadow-sm"
      >
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Key size={13} className="text-muted" /> Mã Token xác thực
          </label>
          <input
            type="text"
            required
            placeholder="Dán mã token xác thực vào đây"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background font-mono text-xs focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Lock size={13} className="text-muted" /> Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Lock size={13} className="text-muted" /> Xác nhận mật khẩu mới
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              Đang lưu mật khẩu...
            </span>
          ) : (
            <>
              Cập nhật mật khẩu mới <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Footer link to back */}
      <div className="text-center text-xs text-muted">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:underline transition"
        >
          <ArrowLeft size={13} /> Quay lại trang Đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center text-xs text-muted">
          Đang tải biểu mẫu đặt lại mật khẩu...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
