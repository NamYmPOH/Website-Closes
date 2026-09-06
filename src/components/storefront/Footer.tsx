"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <span className="text-xl font-bold tracking-tighter uppercase">AURA</span>
            <p className="text-sm text-muted leading-relaxed">
              Thiết kế tối giản, chất liệu bền vững, nâng tầm phong cách sống thường nhật.
            </p>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold uppercase tracking-wider text-xs">Khám phá</h4>
            <ul className="space-y-2 text-muted">
              <li><Link href="/products?sort=newest" className="hover:text-foreground transition">Bộ sưu tập mới</Link></li>
              <li><Link href="/products?category=apparel" className="hover:text-foreground transition">Trang phục</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-foreground transition">Phụ kiện tối giản</Link></li>
              <li><Link href="/products?category=shoes" className="hover:text-foreground transition">Giày dép</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold uppercase tracking-wider text-xs">Hỗ trợ</h4>
            <ul className="space-y-2 text-muted">
              <li><Link href="/pages/size-guide" className="hover:text-foreground transition">Hướng dẫn chọn size</Link></li>
              <li><Link href="/pages/shipping" className="hover:text-foreground transition">Chính sách giao hàng</Link></li>
              <li><Link href="/pages/returns" className="hover:text-foreground transition">Đổi trả trong 30 ngày</Link></li>
              <li><Link href="/pages/faq" className="hover:text-foreground transition">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Newsletter (Tính năng 19) */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-xs">Bản tin AURA</h4>
            <p className="text-xs text-muted">
              Nhận thông báo độc quyền về các bộ sưu tập giới hạn và ưu đãi thành viên.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium py-2">
                <Check size={16} /> Cảm ơn bạn đã đăng ký nhận tin!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="Địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-foreground transition"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition flex items-center"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Language, Currency (Tính năng 95, 96, 100) */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} AURA Studio Inc. Bản quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-foreground transition">Tiếng Việt (VN)</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-foreground transition">VND (₫)</span>
            <span>•</span>
            <Link href="/pages/privacy" className="hover:text-foreground transition">Bảo mật GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
