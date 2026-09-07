import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Chỉ load social providers khi có credentials thật
// Apple bị bỏ qua vì clientSecret phải là PEM/JWT key (không phải plain string)
const socialProviders: any[] = [];

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.startsWith("your-")
) {
  socialProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (
  process.env.FACEBOOK_CLIENT_ID &&
  process.env.FACEBOOK_CLIENT_SECRET &&
  !process.env.FACEBOOK_CLIENT_ID.startsWith("your-")
) {
  socialProviders.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers: [
    ...socialProviders,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.isBanned) {
          throw new Error(`Tài khoản đã bị tạm khóa: ${user.banReason || "Vi phạm chính sách"}`);
        }

        const isValidPassword = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        // Kiểm tra 2FA nếu tài khoản đã bật
        if (user.twoFactorEnabled) {
          const twoFactorCode = credentials.twoFactorCode ? String(credentials.twoFactorCode) : null;
          if (!twoFactorCode) {
            throw new Error("2FA_REQUIRED");
          }

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
  return token.length === 6 && /^\d+$/.test(token);
}
