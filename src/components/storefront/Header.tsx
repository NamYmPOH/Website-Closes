"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, User, Mic, Menu, X, Sun, Moon } from "lucide-react";

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ cartCount = 0, onOpenCart }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Tính năng 31: Voice Search
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Trình duyệt của bạn chưa hỗ trợ tìm kiếm giọng nói.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      window.location.href = `/products?q=${encodeURIComponent(transcript)}`;
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-foreground lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
            AURA<span className="text-muted text-xs font-normal ml-1">STUDIO</span>
          </Link>
        </div>

        {/* Desktop Navigation (Mega Menu items) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link href="/products?category=new" className="text-foreground hover:text-muted transition">
            Hàng Mới
          </Link>
          <Link href="/products?category=men" className="text-foreground hover:text-muted transition">
            Nam
          </Link>
          <Link href="/products?category=women" className="text-foreground hover:text-muted transition">
            Nữ
          </Link>
          <Link href="/products?category=accessories" className="text-foreground hover:text-muted transition">
            Phụ Kiện
          </Link>
          <Link href="/products?sale=true" className="text-red-500 hover:text-red-600 transition">
            Ưu Đãi
          </Link>
        </nav>

        {/* Central Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md relative items-center">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`)}
              className="w-full pl-9 pr-10 py-1.5 text-sm bg-border/40 hover:bg-border/60 focus:bg-background border border-transparent focus:border-border rounded-full outline-none transition"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <button
              onClick={handleVoiceSearch}
              title="Tìm kiếm giọng nói"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition ${
                isListening ? "text-red-500 animate-pulse" : ""
              }`}
            >
              <Mic size={15} />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/account" className="p-2 text-foreground hover:text-muted transition" aria-label="Tài khoản">
            <User size={19} />
          </Link>

          <Link href="/account/wishlist" className="p-2 text-foreground hover:text-muted transition" aria-label="Yêu thích">
            <Heart size={19} />
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="p-2 relative text-foreground hover:text-muted transition"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-foreground text-background text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Expand */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <Link href="/products?category=new" className="block text-sm py-2 font-medium">Hàng Mới</Link>
          <Link href="/products?category=men" className="block text-sm py-2 font-medium">Nam</Link>
          <Link href="/products?category=women" className="block text-sm py-2 font-medium">Nữ</Link>
          <Link href="/products?category=accessories" className="block text-sm py-2 font-medium">Phụ Kiện</Link>
          <Link href="/products?sale=true" className="block text-sm py-2 font-medium text-red-500">Ưu Đãi Đặc Biệt</Link>
        </div>
      )}
    </header>
  );
}
