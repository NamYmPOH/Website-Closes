/**
 * Types định nghĩa cho Đơn hàng, Giỏ hàng và Trạng thái thanh toán
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItemDetail {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  variantTitle?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  createdAt: string;
  items: OrderItemDetail[];
}
