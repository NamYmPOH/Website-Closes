/**
 * Bộ tiện ích định dạng dữ liệu (tiền tệ, số lượng, ngày tháng)
 * Sử dụng Cached Formatter Singleton để tối ưu hiệu năng render (tránh tái tạo instance liên tục)
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND)
 * Ví dụ: 150000 -> "150.000 ₫"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }
  return CURRENCY_FORMATTER.format(amount);
}

/**
 * Định dạng số tự nhiên có dấu phân cách hàng nghìn
 * Ví dụ: 12500 -> "12.500"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return NUMBER_FORMATTER.format(value);
}

/**
 * Định dạng nhãn giảm giá (Phần trăm hoặc số tiền cố định)
 */
export function formatDiscount(
  type: "percent" | "fixed" | string,
  value: number
): string {
  if (type === "percent") {
    return `-${value}%`;
  }
  return `-${formatCurrency(value)}`;
}

/**
 * Định dạng ngày tháng hiển thị theo chuẩn Việt Nam
 */
export function formatDate(
  dateStringOrDate: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateStringOrDate) return "";
  try {
    const d =
      typeof dateStringOrDate === "string"
        ? new Date(dateStringOrDate)
        : dateStringOrDate;
    if (isNaN(d.getTime())) return "";
    if (includeTime) {
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
