"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetData, setResetData] = useState<{
    resetToken: string;
    resetUrl: string;
    email: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Không thể xử lý yêu cầu. Vui lòng kiểm tra lại email.");
        setLoading(false);
        return;
      }

      setResetData({
        resetToken: data.resetToken,
        resetUrl: data.resetUrl,
        email: data.email,
      });
      setLoading(false);
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
          <KeyRound size={20} />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Quên mật khẩu?</h1>
        <p className="text-xs text-muted">
          Nhập địa chỉ email đăng ký của bạn, hệ thống sẽ cấp liên kết để đặt lại mật khẩu mới.
        </p>
      </div>

      {/* Thông báo lỗi */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!resetData ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 sm:p-8 border border-border rounded-xl bg-background shadow-sm"
        >
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Mail size={13} className="text-muted" /> Địa chỉ Email đã đăng ký
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                Đang xử lý yêu cầu...
              </span>
            ) : (
              <>
                Gửi yêu cầu đặt lại mật khẩu <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="p-6 sm:p-8 border border-border rounded-xl bg-background shadow-sm space-y-5">
          <div className="flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-lg border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Yêu cầu xác nhận thành công!</span>
              <p className="text-[11px] text-muted">
                Hệ thống đã tạo mã bảo mật đặt lại mật khẩu cho tài khoản <strong>{resetData.email}</strong> (hiệu lực trong 15 phút).
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-muted text-[11px] block font-medium">Mã xác thực (Token):</span>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-border rounded-md font-mono text-[11px] break-all select-all">
              {resetData.resetToken}
            </div>
          </div>

          <Link
            href={resetData.resetUrl}
            className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm"
          >
            Tiến hành Đặt lại mật khẩu ngay <ExternalLink size={14} />
          </Link>
        </div>
      )}

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
