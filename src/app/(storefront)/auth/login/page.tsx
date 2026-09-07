"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  LogOut,
  User,
} from "lucide-react";
import { useRecentLogins } from "@/hooks/useRecentLogins";
import RecentLoginAccounts from "@/components/auth/RecentLoginAccounts";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const registered = searchParams.get("registered");
  const resetSuccess = searchParams.get("resetSuccess");

  const { data: session, status } = useSession();
  const { recentLogins, saveLogin, removeLogin } = useRecentLogins();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    registered
      ? "Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục."
      : resetSuccess
      ? "Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập."
      : ""
  );

  // Tự động đọc và điền thông tin đăng nhập đã được ghi nhớ từ localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("aura_remembered_credentials");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.email && parsed?.password) {
          setEmail(parsed.email);
          try {
            setPassword(atob(parsed.password));
          } catch {
            setPassword(parsed.password);
          }
          setRememberPassword(true);
        }
      }
    } catch (err) {
      console.warn("Could not read remembered credentials:", err);
    }
  }, []);

  // Nếu người dùng ĐÃ có phiên đăng nhập hợp lệ (ví dụ tài khoản "nam" từ tab khác)
  if (status === "authenticated" && session?.user) {
    const activeName = session.user.name || session.user.email?.split("@")[0] || "Khách hàng";
    const activeEmail = session.user.email || "";

    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center mx-auto shadow-md font-bold text-xl uppercase">
            {activeName.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Tài khoản đang đăng nhập</h1>
          <p className="text-xs text-muted">
            Trình duyệt của bạn đang duy trì phiên hoạt động cho tài khoản này.
          </p>
        </div>

        <div className="p-6 border border-border rounded-xl bg-background shadow-sm space-y-4 text-center">
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{activeName}</p>
            <p className="text-xs text-muted font-mono">{activeEmail}</p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href={callbackUrl}
              className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm"
            >
              Vào trang tài khoản & đơn hàng <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await signOut({ callbackUrl: "/auth/login" });
              }}
              className="w-full py-2.5 border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold uppercase tracking-wider rounded-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} /> Đăng xuất để đổi tài khoản khác
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-muted">
          <Link href="/" className="hover:text-foreground underline transition">
            Quay lại trang chủ mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectRecentAccount = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setErrorMessage("");

    try {
      const savedAuth = localStorage.getItem("aura_remembered_credentials");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.email?.toLowerCase() === selectedEmail.toLowerCase() && parsed?.password) {
          try {
            setPassword(atob(parsed.password));
          } catch {
            setPassword(parsed.password);
          }
          setRememberPassword(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not check remembered password for selected account:", err);
    }

    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleUseOtherAccount = () => {
    setEmail("");
    setPassword("");
    setRememberPassword(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        twoFactorCode: is2FARequired ? twoFactorCode : undefined,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("2FA_REQUIRED")) {
          setIs2FARequired(true);
          setErrorMessage("Tài khoản yêu cầu mã xác thực 2 bước (2FA OTP).");
        } else {
          setErrorMessage(
            res.error === "CredentialsSignin"
              ? "Email hoặc mật khẩu không chính xác. Vui lòng thử lại!"
              : res.error
          );
        }
        setLoading(false);
        return;
      }

      // Xử lý Ghi nhớ mật khẩu (Tuyệt đối không tự động lưu mật khẩu Admin)
      if (rememberPassword && !email.toLowerCase().includes("admin")) {
        try {
          localStorage.setItem(
            "aura_remembered_credentials",
            JSON.stringify({
              email: email.trim(),
              password: btoa(password),
              savedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn("Failed to save credentials to localStorage:", e);
        }
      } else {
        try {
          localStorage.removeItem("aura_remembered_credentials");
        } catch (e) {
          console.warn("Failed to remove credentials from localStorage:", e);
        }
      }

      // Lưu vào recent logins (tối đa 2, tuyệt đối loại trừ admin)
      if (!email.toLowerCase().includes("admin")) {
        saveLogin({
          email: email.trim(),
          name: email.split("@")[0],
          role: "CUSTOMER",
        });
      }

      setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");

      // Tự động điều hướng sau khi phiên được thiết lập
      setTimeout(() => {
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      setErrorMessage("Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    setErrorMessage("");
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      setErrorMessage(`Đăng nhập bằng ${provider === "google" ? "Google" : "Apple"} chưa khả dụng.`);
      setLoading(false);
    }
  };

  // Chỉ hiển thị tài khoản demo khi bật cấu hình môi trường cụ thể trong development
  const showDemoAccounts =
    process.env.NODE_ENV === "development" && process.env.SHOW_DEMO_ACCOUNTS === "true";

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto shadow-md">
          <Lock size={20} />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Đăng nhập tài khoản</h1>
        <p className="text-xs text-muted">
          Nhập thông tin xác thực để truy cập đơn hàng, ưu đãi VIP và quản lý cá nhân
        </p>
      </div>

      {/* Thông báo Thành công hoặc Lỗi */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Danh sách tối đa 2 tài khoản gần đây (Lấy từ localStorage, loại trừ Admin) */}
      <RecentLoginAccounts
        accounts={recentLogins}
        selectedEmail={email}
        onSelectAccount={handleSelectRecentAccount}
        onRemoveAccount={removeLogin}
        onUseOtherAccount={handleUseOtherAccount}
      />

      {/* Tài khoản mẫu (Chỉ hiển thị khi biến môi trường SHOW_DEMO_ACCOUNTS=true trong dev) */}
      {showDemoAccounts && (
        <div className="p-4 border border-dashed border-amber-400/80 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <UserCheck size={14} /> Chế độ DEV: Tài khoản kiểm thử nhanh
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail("nguyenvanan@example.com");
                setPassword("UserPassword@123");
              }}
              className="p-2 border rounded bg-background text-left"
            >
              <span className="font-bold block text-[11px]">User VIP (An)</span>
              <span className="text-[10px] text-muted truncate">nguyenvanan@...</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("tranmai@example.com");
                setPassword("UserPassword@123");
              }}
              className="p-2 border rounded bg-background text-left"
            >
              <span className="font-bold block text-[11px]">User Mua sắm (Mai)</span>
              <span className="text-[10px] text-muted truncate">tranmai@...</span>
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 sm:p-8 border border-border rounded-xl bg-background shadow-sm"
      >
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Mail size={13} className="text-muted" /> Địa chỉ Email
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
            <Lock size={13} className="text-muted" /> Mật khẩu
          </label>
          <div className="relative">
            <input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label
              htmlFor="remember-password"
              className="flex items-center gap-2 cursor-pointer select-none text-muted hover:text-foreground transition py-0.5"
            >
              <input
                type="checkbox"
                id="remember-password"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer accent-foreground"
              />
              <span className="font-medium">Ghi nhớ mật khẩu</span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-muted hover:text-foreground underline transition"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {is2FARequired && (
          <div className="space-y-1.5 text-xs pt-2">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Mã xác thực 2 bước (2FA OTP)
            </label>
            <input
              type="text"
              placeholder="Nhập 6 số xác thực (Mặc định: 123456)"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-md bg-background tracking-widest text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              Đang xác thực...
            </span>
          ) : (
            <>
              Đăng nhập ngay <ArrowRight size={14} />
            </>
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase text-muted bg-background px-2">
            Hoặc tiếp tục với
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="py-2.5 px-3 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.6 0 13s.6 4.7 1.6 6.6l3.7-4.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("apple")}
            className="py-2.5 px-3 border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.69-7.85-11.97-14.33-6.53-9.9-11.66-20.9-15.39-32.99-3.73-12.1-5.6-23.77-5.6-35.03 0-14.44 3.52-26.4 10.56-35.88 7.04-9.49 16.03-14.35 26.97-14.59 4.8 0 10.23 1.32 16.3 3.96 6.07 2.64 10.25 4.02 12.54 4.15 1.94 0 6.28-1.46 13.02-4.38 6.74-2.92 12.44-4.22 17.1-3.9 12.68.79 22.84 5.38 30.48 13.78-11.05 6.73-16.46 16.08-16.23 28.05.24 9.4 3.79 17.28 10.66 23.64 6.87 6.35 15.11 10.05 24.73 11.11-2.22 6.98-4.99 14.15-8.31 21.52zM119.22 33.56c0-7.25 2.65-13.9 7.95-19.95 5.3-6.05 11.75-9.87 19.35-11.46.22 1.48.33 2.87.33 4.18 0 7.37-2.73 14.19-8.19 20.46-5.46 6.27-12 10.15-19.62 11.64-.11-1.48-.17-2.97-.17-4.47z" />
            </svg>
            Apple ID
          </button>
        </div>
      </form>

      {/* Footer link to register */}
      <div className="text-center text-xs text-muted">
        Chưa có tài khoản thành viên?{" "}
        <Link
          href="/auth/register"
          className="font-bold text-foreground underline hover:text-muted transition"
        >
          Đăng ký tài khoản mới ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center text-xs text-muted">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
