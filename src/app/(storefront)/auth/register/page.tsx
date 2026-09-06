"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có độ dài từ 6 ký tự trở lên.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu không trùng khớp.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Đăng ký không thành công. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 1200);
    } catch (err: any) {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto shadow-md">
          <UserPlus size={20} />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Đăng ký thành viên</h1>
        <p className="text-xs text-muted">
          Gia nhập AURA STUDIO để nhận 50 điểm thưởng tích lũy và ưu đãi độc quyền
        </p>
      </div>

      {/* Thông báo Lỗi hoặc Thành công */}
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

      {/* Form Đăng ký */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 sm:p-8 border border-border rounded-xl bg-background shadow-sm"
      >
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <User size={13} className="text-muted" /> Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Nguyễn Văn An"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Mail size={13} className="text-muted" /> Địa chỉ Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Phone size={13} className="text-muted" /> Số điện thoại (Tùy chọn)
          </label>
          <input
            type="tel"
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Lock size={13} className="text-muted" /> Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Lock size={13} className="text-muted" /> Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Nhập lại mật khẩu phía trên"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
          />
        </div>

        <div className="pt-2 text-xs">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 accent-foreground"
            />
            <span className="text-[11px] text-muted leading-tight">
              Tôi đồng ý với{" "}
              <Link href="/pages/terms" className="underline text-foreground">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/pages/privacy" className="underline text-foreground">
                Chính sách bảo mật
              </Link>{" "}
              của AURA STUDIO.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              Đang tạo tài khoản...
            </span>
          ) : (
            <>
              Tạo tài khoản ngay <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Footer login link */}
      <div className="text-center text-xs text-muted">
        Đã có tài khoản thành viên?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-foreground underline hover:text-muted transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
