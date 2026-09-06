"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import MiniCart from "@/components/storefront/MiniCart";
import { useCartStore } from "@/stores/cartStore";

export default function StorefrontLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    updateQuantity,
    removeItem,
    getItemCount,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted ? getItemCount() : 0;
  const cartItems = mounted ? items : [];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-foreground selection:text-background">
      {/* Top Banner Announcement */}
      <div className="bg-foreground text-background text-xs py-2 text-center font-medium tracking-wide">
        Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫ • Nhập mã <span className="font-bold underline">AURA10</span> giảm 10%
      </div>

      {/* Global Sticky Header */}
      <Header cartCount={totalCount} onOpenCart={openMiniCart} />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Global Minimalist Footer */}
      <Footer />

      {/* Global Slide-out MiniCart */}
      {mounted && (
        <MiniCart
          isOpen={isMiniCartOpen}
          onClose={closeMiniCart}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
      )}
    </div>
  );
}
