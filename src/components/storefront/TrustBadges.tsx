import React from "react";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export function TrustBadges() {
  return (
    <section className="border-t border-border py-14 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Truck size={24} className="text-muted" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Vận chuyển hỏa tốc
          </h4>
          <p className="text-xs text-muted">
            Đóng gói tiêu chuẩn và giao hàng nhanh trong 24-48h trên toàn quốc
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <ShieldCheck size={24} className="text-muted" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Chất lượng tuyển chọn
          </h4>
          <p className="text-xs text-muted">
            100% sợi vải tự nhiên, đường may tỉ mỉ và bền đẹp qua nhiều lần giặt
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <RotateCcw size={24} className="text-muted" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Đổi trả 30 ngày
          </h4>
          <p className="text-xs text-muted">
            Đổi trả miễn phí tận nhà nếu không vừa vặn kích cỡ hoặc lỗi kỹ thuật
          </p>
        </div>
      </div>
    </section>
  );
}
