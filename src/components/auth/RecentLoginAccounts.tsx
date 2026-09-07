"use client";

import React from "react";
import { RecentLoginEntry, maskEmail } from "@/hooks/useRecentLogins";
import { X, UserCheck, ArrowRight, UserPlus } from "lucide-react";

interface RecentLoginAccountsProps {
  accounts: RecentLoginEntry[];
  selectedEmail?: string;
  onSelectAccount: (email: string) => void;
  onRemoveAccount: (email: string) => void;
  onUseOtherAccount: () => void;
}

export default function RecentLoginAccounts({
  accounts,
  selectedEmail,
  onSelectAccount,
  onRemoveAccount,
  onUseOtherAccount,
}: RecentLoginAccountsProps) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="p-4 border border-border/80 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wide">
          <UserCheck size={14} className="text-foreground" />
          Tài khoản đăng nhập gần đây (Tối đa 2)
        </div>
        <button
          type="button"
          onClick={onUseOtherAccount}
          className="text-[11px] text-muted hover:text-foreground underline flex items-center gap-1 cursor-pointer transition"
        >
          <UserPlus size={12} /> Tài khoản khác
        </button>
      </div>

      <p className="text-[11px] text-muted">
        Chọn tài khoản bạn đã từng đăng nhập trên thiết bị này để tiếp tục:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {accounts.map((acc) => {
          const isSelected = selectedEmail?.toLowerCase() === acc.email.toLowerCase();
          const masked = maskEmail(acc.email);

          return (
            <div
              key={acc.email}
              onClick={() => onSelectAccount(acc.email)}
              className={`relative p-3 rounded-lg border text-left cursor-pointer transition flex items-center justify-between group ${
                isSelected
                  ? "border-foreground bg-background shadow-xs ring-1 ring-foreground"
                  : "border-border bg-background/80 hover:border-foreground/50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-6">
                {/* Avatar hoặc Ký tự đại diện */}
                {acc.avatar ? (
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {acc.name.charAt(0) || "U"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate leading-tight">
                    {acc.name}
                  </p>
                  <p className="text-[10px] text-muted font-mono truncate">{masked}</p>
                </div>
              </div>

              {/* Nút X để xóa tài khoản khỏi danh sách gần đây */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAccount(acc.email);
                }}
                title="Xóa khỏi danh sách gần đây"
                className="absolute right-2 top-2 p-1 text-muted hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
