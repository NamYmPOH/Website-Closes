import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AURA | Minimalist Premium E-Commerce",
  description: "Cửa hàng trực tuyến phong cách tối giản, tốc độ vượt trội, trải nghiệm mua sắm mượt mà.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-foreground selection:text-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
