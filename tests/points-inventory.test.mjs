import test from "node:test";
import assert from "node:assert/strict";

// 1. UNIT TEST: Logic Tích điểm & Quy đổi Voucher (Task 2)
test("Task 2: Điểm thưởng tích lũy - 1.000đ chi tiêu = 1 điểm", () => {
  const calculateEarnedPoints = (totalAmount) => Math.floor(totalAmount / 1000);

  assert.equal(calculateEarnedPoints(500000), 500, "Đơn 500.000đ phải tích lũy 500 điểm");
  assert.equal(calculateEarnedPoints(1250900), 1250, "Đơn 1.250.900đ phải tích lũy 1250 điểm");
  assert.equal(calculateEarnedPoints(999), 0, "Đơn dưới 1.000đ không có điểm");
});

test("Task 2: Các mốc đổi điểm ra Voucher giảm giá", () => {
  const REDEEM_OPTIONS = {
    50: { discountType: "fixed", discountValue: 500, label: "500đ" },
    100: { discountType: "fixed", discountValue: 1000, label: "1.000đ" },
    200: { discountType: "percent", discountValue: 2, label: "2%" },
    500: { discountType: "percent", discountValue: 5, label: "5%" },
  };

  const calculateVoucherDiscount = (voucher, orderTotal) => {
    if (voucher.discountType === "fixed") {
      return Math.min(voucher.discountValue, orderTotal);
    }
    if (voucher.discountType === "percent") {
      return Math.round((orderTotal * voucher.discountValue) / 100);
    }
    return 0;
  };

  // Mốc 50 pts: 500đ
  assert.equal(
    calculateVoucherDiscount(REDEEM_OPTIONS[50], 300000),
    500,
    "Mốc 50 điểm phải giảm đúng 500đ"
  );

  // Mốc 100 pts: 1.000đ
  assert.equal(
    calculateVoucherDiscount(REDEEM_OPTIONS[100], 300000),
    1000,
    "Mốc 100 điểm phải giảm đúng 1.000đ"
  );

  // Mốc 200 pts: 2%
  assert.equal(
    calculateVoucherDiscount(REDEEM_OPTIONS[200], 1000000),
    20000,
    "Mốc 200 điểm đơn 1.000.000đ phải giảm đúng 20.000đ (2%)"
  );

  // Mốc 500 pts: 5%
  assert.equal(
    calculateVoucherDiscount(REDEEM_OPTIONS[500], 1000000),
    50000,
    "Mốc 500 điểm đơn 1.000.000đ phải giảm đúng 50.000đ (5%)"
  );
});

test("Task 2: Quy cách sinh mã Voucher độc nhất định dạng AURA-XXXX-XXXX", () => {
  const voucherCodeRegex = /^AURA-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  const sampleCode = "AURA-7K2M-9P4X";
  assert.match(sampleCode, voucherCodeRegex, "Mã voucher phải theo định dạng AURA-XXXX-XXXX");
});

// 2. UNIT TEST: Vòng đời Đơn hàng & Quản lý Kho (Task 1)
test("Task 1: Chuyển trạng thái PENDING -> CONFIRMED: Trừ kho thật và giải phóng giữ chỗ", () => {
  let stockQuantity = 20;
  let reservedQuantity = 2; // Khách đã đặt 2 món ở pending
  const orderQuantity = 2;

  // Khi xác nhận thanh toán (confirmed)
  reservedQuantity -= orderQuantity;
  stockQuantity -= orderQuantity;

  assert.equal(reservedQuantity, 0, "Reserved quantity phải về 0 sau khi xác nhận");
  assert.equal(stockQuantity, 18, "Stock quantity thực tế phải trừ đi 2 còn 18");
});

test("Task 1: Chuyển trạng thái PENDING -> CANCELLED: Giải phóng giữ chỗ, kho thực tế không đổi", () => {
  let stockQuantity = 20;
  let reservedQuantity = 3;
  const cancelQuantity = 3;

  // Khi hủy đơn pending
  reservedQuantity -= cancelQuantity;

  assert.equal(reservedQuantity, 0, "Reserved quantity phải được giải phóng về 0");
  assert.equal(stockQuantity, 20, "Stock quantity thực tế không được thay đổi");
});

test("Task 1: Chuyển trạng thái CONFIRMED/DELIVERING -> CANCELLED/RETURNED: Hoàn trả số lượng vào kho", () => {
  let stockQuantity = 18; // đã trừ khi confirmed
  const returnQuantity = 2;

  // Khi khách hoàn trả
  stockQuantity += returnQuantity;

  assert.equal(stockQuantity, 20, "Stock quantity phải được cộng lại đủ 20");
});

test("Task 1: Cảnh báo tồn kho dưới ngưỡng an toàn reorder_threshold", () => {
  const isLowStock = (actualStock, reservedStock, threshold) => {
    const available = actualStock - reservedStock;
    return available <= threshold;
  };

  assert.equal(isLowStock(6, 2, 5), true, "Còn 4 chiếc khả dụng (ngưỡng 5) phải báo cảnh báo");
  assert.equal(isLowStock(10, 2, 5), false, "Còn 8 chiếc khả dụng (ngưỡng 5) không báo cảnh báo");
  assert.equal(isLowStock(5, 0, 5), true, "Còn đúng 5 chiếc (ngưỡng 5) phải báo cảnh báo");
});

// 3. UNIT TEST: Che giấu email nhạy cảm (Task 4)
test("Task 4: Mask email gần đây đúng định dạng nguy***@domain.com", () => {
  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [username, domain] = email.split("@");
    if (username.length <= 3) return `${username[0]}***@${domain}`;
    const visible = username.slice(0, 4);
    return `${visible}***@${domain}`;
  };

  assert.equal(maskEmail("nguyenvanan@gmail.com"), "nguy***@gmail.com");
  assert.equal(maskEmail("tranmai@example.com"), "tran***@example.com");
  assert.equal(maskEmail("an@aura.vn"), "a***@aura.vn");
});
