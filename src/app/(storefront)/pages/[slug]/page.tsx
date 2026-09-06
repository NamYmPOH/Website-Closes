"use client";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATIC_PAGES: Record<
  string,
  { title: string; subtitle: string; content: React.ReactNode }
> = {
  "size-guide": {
    title: "Hướng dẫn chọn size chuẩn AURA",
    subtitle: "Bảng quy chuẩn kích cỡ may đo chuẩn dáng người Á Đông",
    content: (
      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <p>
          Các thiết kế tại AURA Studio được phát triển dựa trên tỷ lệ cơ thể thực tế, mang lại độ rủ tự nhiên mà không gò bó.
        </p>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold">
              <tr>
                <th className="p-3">Kích cỡ</th>
                <th className="p-3">Chiều cao (cm)</th>
                <th className="p-3">Cân nặng (kg)</th>
                <th className="p-3">Vòng ngực (cm)</th>
                <th className="p-3">Dài áo (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-3 font-bold text-foreground">S</td><td className="p-3">155 - 165</td><td className="p-3">48 - 56</td><td className="p-3">88 - 92</td><td className="p-3">67</td></tr>
              <tr><td className="p-3 font-bold text-foreground">M</td><td className="p-3">164 - 173</td><td className="p-3">57 - 65</td><td className="p-3">94 - 98</td><td className="p-3">70</td></tr>
              <tr><td className="p-3 font-bold text-foreground">L</td><td className="p-3">172 - 180</td><td className="p-3">66 - 75</td><td className="p-3">100 - 104</td><td className="p-3">73</td></tr>
              <tr><td className="p-3 font-bold text-foreground">XL</td><td className="p-3">178 - 188</td><td className="p-3">76 - 88</td><td className="p-3">106 - 110</td><td className="p-3">76</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  shipping: {
    title: "Chính sách giao nhận & Vận chuyển",
    subtitle: "Giao hàng toàn quốc an toàn và nhanh chóng",
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <h3 className="font-bold text-foreground">1. Thời gian xử lý đơn hàng</h3>
        <p>Mọi đơn hàng đặt trước 15:00 hàng ngày sẽ được đóng gói và bàn giao cho đơn vị vận chuyển ngay trong ngày.</p>

        <h3 className="font-bold text-foreground">2. Chi phí & Thời gian giao hàng</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Giao hàng tiêu chuẩn:</strong> 30.000₫ (2 - 3 ngày làm việc). Miễn phí toàn quốc cho đơn từ 500.000₫.</li>
          <li><strong>Giao hỏa tốc nội thành:</strong> 55.000₫ (Nhận hàng trong vòng 2 - 4 giờ tại TP.HCM & Hà Nội).</li>
        </ul>
      </div>
    ),
  },
  returns: {
    title: "Chính sách đổi trả trong 30 ngày",
    subtitle: "Trải nghiệm mua sắm hoàn toàn an tâm và tự do",
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>AURA hỗ trợ đổi hàng tận nhà hoàn toàn miễn phí trong vòng 30 ngày kể từ khi nhận hàng nếu sản phẩm không vừa kích cỡ hoặc có lỗi sản xuất.</p>
        <h3 className="font-bold text-foreground">Điều kiện đổi trả:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sản phẩm còn nguyên tem mác, chưa qua giặt ủi hoặc sử dụng.</li>
          <li>Đầy đủ phụ kiện và hộp/túi bảo quản đi kèm.</li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: "Câu hỏi thường gặp (FAQ)",
    subtitle: "Giải đáp các thắc mắc phổ biến của khách hàng",
    content: (
      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <div>
          <h4 className="font-bold text-foreground">Làm thế nào để áp dụng mã giảm giá?</h4>
          <p className="mt-1">Bạn có thể nhập mã giảm giá tại ô 'Mã giảm giá' ở trang Giỏ hàng hoặc trang Thanh toán và nhấn 'Áp dụng'.</p>
        </div>
        <div>
          <h4 className="font-bold text-foreground">Tôi có được kiểm tra hàng trước khi thanh toán không?</h4>
          <p className="mt-1">Có! Bạn được phép đồng kiểm sản phẩm cùng shipper trước khi thanh toán tiền mặt (COD).</p>
        </div>
      </div>
    ),
  },
  about: {
    title: "Về thương hiệu AURA Studio",
    subtitle: "Khám phá triết lý thiết kế tối giản đương đại",
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>Được thành lập với sứ mệnh định nghĩa lại sự thanh lịch trong đời sống thường nhật, AURA Studio chắt lọc những đường nét tinh túy nhất từ thiên nhiên và kiến trúc hiện đại.</p>
        <p>Chúng tôi tập trung vào nguồn nguyên liệu bền vững: 100% Organic Cotton, Linen Pháp tự nhiên và Canvas dệt thoi mật độ cao, giảm thiểu tối đa phát thải carbon ra môi trường.</p>
      </div>
    ),
  },
  privacy: {
    title: "Chính sách bảo mật & Tiêu chuẩn GDPR",
    subtitle: "Cam kết bảo vệ dữ liệu cá nhân tuyệt đối",
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>Chúng tôi tuân thủ nghiêm ngặt các quy định bảo vệ dữ liệu toàn cầu (GDPR) và luật an ninh mạng. Dữ liệu thẻ tín dụng và thanh toán được mã hóa chuẩn PCI-DSS Level 1.</p>
      </div>
    ),
  },
};

export default function StaticPage({ params }: { params: { slug: string } }) {
  const page = STATIC_PAGES[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="pb-8 border-b border-border mb-8 space-y-2">
        <Link href="/" className="text-xs text-muted hover:text-foreground">← Quay lại trang chủ</Link>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">{page.title}</h1>
        <p className="text-sm text-muted">{page.subtitle}</p>
      </div>
      <div className="prose dark:prose-invert max-w-none">{page.content}</div>
    </div>
  );
}
