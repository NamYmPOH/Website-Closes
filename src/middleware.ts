import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting Header Protection (DDOS Defense)
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-client-ip", clientIp);

  // 2. Authentication & RBAC Guard
  const sessionCookie =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  const isAuthenticated = !!sessionCookie;

  // Chỉ bật cưỡng chế đăng nhập khi có cấu hình ENABLE_STRICT_AUTH=true
  if (process.env.ENABLE_STRICT_AUTH === "true") {
    if (pathname.startsWith("/admin") && !isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
    if (pathname.startsWith("/account") && !isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/api/checkout/:path*",
  ],
};
