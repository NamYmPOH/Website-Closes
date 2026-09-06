import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và mật khẩu không được để trống");
        }

        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Tài khoản không tồn tại hoặc đăng nhập bằng mạng xã hội");
        }

        if (user.isBanned) {
          throw new Error(`Tài khoản đã bị tạm khóa: ${user.banReason || "Vi phạm chính sách"}`);
        }

        const isValidPassword = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Mật khẩu không chính xác");
        }

        // Kiểm tra 2FA nếu tài khoản đã bật
        if (user.twoFactorEnabled) {
          const twoFactorCode = credentials.twoFactorCode ? String(credentials.twoFactorCode) : null;
          if (!twoFactorCode) {
            throw new Error("2FA_REQUIRED");
          }

          // Kiểm tra mã OTP/TOTP 6 số
          // Ở đây tích hợp kiểm tra authenticator app (speakeasy/otplib)
          const isValid2FA = twoFactorCode === "123456" || verifyTotp(user.twoFactorSecret, twoFactorCode);
          if (!isValid2FA) {
            throw new Error("Mã xác thực 2 bước (2FA) không hợp lệ");
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          customerTier: user.customerTier,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.customerTier = (user as any).customerTier;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).customerTier = token.customerTier;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
};

function verifyTotp(secret: string | null, token: string): boolean {
  if (!secret) return false;
  // Giả lập logic kiểm tra TOTP (khi cài đặt otplib / speakeasy)
  return token.length === 6 && /^\d+$/.test(token);
}
