"use client";

import { useState, useEffect } from "react";

export interface RecentLoginEntry {
  email: string;
  name: string;
  avatar?: string;
  role: string;
  lastLoginAt: string;
}

const STORAGE_KEY = "aura_recent_logins";
const MAX_ENTRIES = 2;

export function useRecentLogins() {
  const [recentLogins, setRecentLogins] = useState<RecentLoginEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Tải danh sách từ localStorage khi mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentLoginEntry[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Lọc loại trừ admin / super_admin
          const filtered = parsed.filter(
            (item) =>
              item.role !== "SUPER_ADMIN" &&
              item.role !== "ADMIN" &&
              !item.email.toLowerCase().includes("admin")
          );
          setRecentLogins(filtered.slice(0, MAX_ENTRIES));
        }
      }
    } catch (e) {
      console.warn("Failed to read recent logins from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Lưu tài khoản sau khi đăng nhập thành công
  const saveLogin = (user: {
    email: string;
    name?: string | null;
    avatar?: string | null;
    role?: string | null;
  }) => {
    const role = (user.role || "CUSTOMER").toUpperCase();

    // Tuyệt đối không lưu tài khoản Admin / Super Admin
    if (role === "SUPER_ADMIN" || role === "ADMIN" || user.email.toLowerCase().includes("admin")) {
      return;
    }

    try {
      const newEntry: RecentLoginEntry = {
        email: user.email.trim().toLowerCase(),
        name: user.name?.trim() || user.email.split("@")[0],
        avatar: user.avatar || undefined,
        role,
        lastLoginAt: new Date().toISOString(),
      };

      // Đưa tài khoản mới nhất lên đầu, loại bỏ trùng lặp email cũ
      const existing = recentLogins.filter(
        (item) => item.email.toLowerCase() !== newEntry.email.toLowerCase()
      );
      const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);

      setRecentLogins(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recent login to localStorage:", e);
    }
  };

  // Xóa một tài khoản khỏi danh sách gần đây
  const removeLogin = (emailToRemove: string) => {
    try {
      const updated = recentLogins.filter(
        (item) => item.email.toLowerCase() !== emailToRemove.toLowerCase()
      );
      setRecentLogins(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to remove recent login:", e);
    }
  };

  // Xóa toàn bộ
  const clearAllLogins = () => {
    try {
      setRecentLogins([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return {
    recentLogins,
    isLoaded,
    saveLogin,
    removeLogin,
    clearAllLogins,
  };
}

// Hàm hỗ trợ làm mờ email (VD: nguyenvanan@gmail.com -> nguy***@gmail.com)
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [username, domain] = email.split("@");
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  const visible = username.slice(0, 4);
  return `${visible}***@${domain}`;
}
