"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
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
  Loader2,
  ArrowRight,
} from "lucide-react";

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ cartCount = 0, onOpenCart }: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { wishlist } = useCartStore();
  const wishlistCount = wishlist.length;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce 300ms tìm kiếm gợi ý autocomplete
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsSuggestOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggestLoading(true);
      try {
        const res = await fetch(`/api/products/search-suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.items || []);
          setIsSuggestOpen(true);
        }
      } catch (err) {
        console.error("[AUTOCOMPLETE_ERROR]", err);
      } finally {
        setIsSuggestLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      setIsSuggestOpen(false);
      router.push(`/products?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSuggestOpen(false);
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

        {/* Central Search Bar with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative items-center">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onFocus={() => {
                if (suggestions.length > 0) setIsSuggestOpen(true);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-1.5 text-sm bg-border/40 hover:bg-border/60 focus:bg-background border border-transparent focus:border-border rounded-full outline-none transition"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search size={16} />
            </button>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSuggestLoading && (
                <Loader2 size={14} className="animate-spin text-muted" />
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Tìm kiếm bằng giọng nói"
                className={`p-1 text-muted hover:text-foreground transition cursor-pointer ${
                  isListening ? "text-red-500 animate-pulse" : ""
                }`}
              >
                <Mic size={15} />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown Popover */}
          {isSuggestOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden max-h-[440px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider border-b border-border flex justify-between items-center">
                <span>Gợi ý sản phẩm ({suggestions.length})</span>
                {isSuggestLoading && <span className="text-[10px] lowercase text-muted">đang tìm...</span>}
              </div>

              {suggestions.length === 0 && !isSuggestLoading ? (
                <div className="p-4 text-center text-xs text-muted">
                  Không tìm thấy sản phẩm phù hợp với &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => setIsSuggestOpen(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition group"
                    >
                      <div className="w-11 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {item.categoryName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-muted font-medium">
                              {item.categoryName}
                            </span>
                          )}
                          {item.brandName && (
                            <span className="text-[10px] text-muted truncate">
                              • {item.brandName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-medium text-foreground truncate group-hover:text-amber-600 transition">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-foreground">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.basePrice)}
                          </span>
                          {item.compareAtPrice && (
                            <span className="text-[10px] text-muted line-through">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery.trim() && (
                <div className="p-2 border-t border-border bg-neutral-50/50 dark:bg-neutral-900/40">
                  <button
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-1.5 px-3 text-xs font-medium text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-md flex items-center justify-center gap-1.5 transition"
                  >
                    Xem tất cả kết quả cho &quot;{searchQuery}&quot; <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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

          {/* Wishlist Link with Synchronized Counter Badge */}
          <Link
            href="/account/wishlist"
            className="p-2 relative text-foreground hover:text-muted transition"
            aria-label="Danh sách yêu thích"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
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
              placeholder="Tìm kiếm sản phẩm..."
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
          <Link
            href="/account/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm py-2 font-medium border-t border-border pt-3"
          >
            <span className="flex items-center gap-2">
              <Heart size={16} className="text-red-500" /> Danh sách yêu thích
            </span>
            {wishlistCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full font-semibold">
                {wishlistCount}
              </span>
            )}
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
