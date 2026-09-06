"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurastudio.com");
  const [password, setPassword] = useState("password123");
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập luồng đăng nhập thành công
    setTimeout(() => {
      setLoading(false);
      router.push("/account");
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Đăng nhập tài khoản</h1>
        <p className="text-xs text-muted">Nhập email và mật khẩu của bạn để tiếp tục trải nghiệm mua sắm</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-8 border border-border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="space-y-1 text-xs">
          <label className="font-medium text-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:border-foreground"
          />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <label className="font-medium text-foreground">Mật khẩu</label>
            <a href="#" className="text-muted hover:underline">Quên mật khẩu?</a>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:border-foreground"
          />
        </div>

        {is2FARequired && (
          <div className="space-y-1 text-xs pt-2">
            <label className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck size={14} className="text-green-600" /> Mã xác thực 2 bước (2FA OTP)
            </label>
            <input
              type="text"
              placeholder="Nhập 6 số từ Google Authenticator"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-md bg-background tracking-widest text-center text-sm font-mono focus:outline-none focus:border-foreground"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? "Đang xác thực..." : "Đăng nhập ngay"} <ArrowRight size={14} />
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase text-muted bg-background px-2">Hoặc tiếp tục với</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="py-2.5 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium text-center"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="py-2.5 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium text-center"
          >
            Apple ID
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-muted">
        Chưa có tài khoản?{" "}
        <a href="#" className="font-semibold text-foreground underline">Đăng ký thành viên mới</a>
      </div>
    </div>
  );
}
