"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  let message = "Đã xảy ra sự cố trong quá trình xác thực tài khoản.";
  if (error === "CredentialsSignin") {
    message = "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.";
  } else if (error === "OAuthAccountNotLinked") {
    message = "Email này đã được sử dụng với một phương thức đăng nhập khác.";
  } else if (error === "AccessDenied") {
    message = "Bạn không có quyền truy cập vào khu vực này.";
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground">
          Đăng nhập không thành công
        </h1>
        <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/auth/login"
          className="px-6 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wider rounded-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Thử đăng nhập lại
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 border border-border text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-foreground"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-muted">Đang tải...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
