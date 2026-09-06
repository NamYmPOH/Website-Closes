"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Mic,
  Menu,
  X,
  LogOut,
  Shield,
  UserCheck,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ cartCount = 0, onOpenCart }: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown user khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Voice Search
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Trình duyệt của bạn chưa hỗ trợ tìm kiếm giọng nói.");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      router.push(`/products?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "EDITOR";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-foreground lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="text-xl font-bold tracking-tighter uppercase">
            AURA<span className="text-muted text-xs font-normal ml-1">STUDIO</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
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
          <Link href="/products?sale=true" className="text-red-500 hover:text-red-600 transition font-semibold">
            Ưu Đãi
          </Link>
        </nav>

        {/* Central Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md relative items-center"
        >
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 text-sm bg-border/40 hover:bg-border/60 focus:bg-background border border-transparent focus:border-border rounded-full outline-none transition"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Tìm kiếm bằng giọng nói"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition cursor-pointer ${
                isListening ? "text-red-500 animate-pulse" : ""
              }`}
            >
              <Mic size={15} />
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile / Auth Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {status === "authenticated" && session?.user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs font-semibold cursor-pointer border border-transparent hover:border-border"
                  aria-label="Menu tài khoản người dùng"
                >
                  <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase">
                    {session.user.name ? session.user.name.charAt(0) : "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate text-left">
                    {session.user.name || "Tài khoản"}
                  </span>
                  <ChevronDown size={14} className="text-muted hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {session.user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-neutral-100 dark:bg-neutral-800 text-foreground">
                        {userRole || "CUSTOMER"}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
                      >
                        <UserCheck size={14} /> Tài khoản của tôi
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition font-medium"
                        >
                          <Shield size={14} /> Trang Quản trị Admin
                        </Link>
                      )}

                      <Link
                        href="/account/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
                      >
                        <Heart size={14} /> Danh sách yêu thích
                      </Link>
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left font-medium cursor-pointer"
                      >
                        <LogOut size={14} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="p-2 text-foreground hover:text-muted transition flex items-center gap-1.5 text-xs font-medium"
                aria-label="Đăng nhập tài khoản"
              >
                <User size={19} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>

          <Link
            href="/account/wishlist"
            className="p-2 text-foreground hover:text-muted transition"
            aria-label="Yêu thích"
          >
            <Heart size={19} />
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              if (onOpenCart) {
                onOpenCart();
              } else {
                router.push("/cart");
              }
            }}
            className="p-2 relative text-foreground hover:text-muted transition cursor-pointer"
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
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          </form>

          <Link
            href="/products?category=new"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm py-2 font-medium"
          >
            Hàng Mới
          </Link>
          <Link
            href="/products?category=men"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm py-2 font-medium"
          >
            Nam
          </Link>
          <Link
            href="/products?category=women"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm py-2 font-medium"
          >
            Nữ
          </Link>
          <Link
            href="/products?category=accessories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm py-2 font-medium"
          >
            Phụ Kiện
          </Link>
          <Link
            href="/products?sale=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm py-2 font-medium text-red-500 font-semibold"
          >
            Ưu Đãi Đặc Biệt
          </Link>

          <div className="border-t border-border pt-3 space-y-2">
            {status === "authenticated" && session?.user ? (
              <>
                <div className="py-1">
                  <p className="text-xs font-bold">{session.user.name}</p>
                  <p className="text-[11px] text-muted">{session.user.email}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm py-1.5 font-medium"
                >
                  Tài khoản của tôi
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm py-1.5 font-medium text-blue-600"
                  >
                    Trang Quản trị Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-sm py-1.5 font-medium text-red-600 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-foreground text-background rounded-md"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold border border-border rounded-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
