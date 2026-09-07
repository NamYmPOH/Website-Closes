"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductItem } from "@/components/storefront/ProductCard";

export interface CartItemStore {
  product: ProductItem;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartStoreState {
  items: CartItemStore[];
  isMiniCartOpen: boolean;
  wishlist: string[]; // Danh sách product id
  wishlistProducts: ProductItem[]; // Danh sách sản phẩm yêu thích đầy đủ
  couponCode: string | null;
  discountPercentage: number;
  
  // Actions
  addItem: (product: ProductItem, quantity?: number, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  toggleWishlist: (product: ProductItem | string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,
      wishlist: [],
      wishlistProducts: [],
      couponCode: null,
      discountPercentage: 0,

      addItem: (product, quantity = 1, color, size) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += quantity;
            return { items: updatedItems, isMiniCartOpen: true };
          }
          return {
            items: [...state.items, { product, quantity, selectedColor: color, selectedSize: size }],
            isMiniCartOpen: true,
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountPercentage: 0 });
      },

      openMiniCart: () => set({ isMiniCartOpen: true }),
      closeMiniCart: () => set({ isMiniCartOpen: false }),

      applyCoupon: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === "AURA10") {
          set({ couponCode: "AURA10", discountPercentage: 10 });
          return { success: true, message: "Áp dụng mã AURA10 thành công: Giảm 10%!" };
        }
        if (cleanCode === "FREESHIP") {
          set({ couponCode: "FREESHIP", discountPercentage: 0 });
          return { success: true, message: "Áp dụng mã FREESHIP thành công: Miễn phí vận chuyển!" };
        }
        return { success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" };
      },

      removeCoupon: () => set({ couponCode: null, discountPercentage: 0 }),

      toggleWishlist: (product: ProductItem | string) => {
        const productId = typeof product === "string" ? product : product.id;
        set((state) => {
          const exists = state.wishlist.includes(productId);
          if (exists) {
            return {
              wishlist: state.wishlist.filter((id) => id !== productId),
              wishlistProducts: state.wishlistProducts.filter((p) => p.id !== productId),
            };
          } else {
            const newWishlist = [...state.wishlist, productId];
            const newProducts = typeof product === "object"
              ? [...state.wishlistProducts.filter((p) => p.id !== productId), product]
              : state.wishlistProducts;
            return {
              wishlist: newWishlist,
              wishlistProducts: newProducts,
            };
          }
        });
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.includes(productId);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, i) => acc + i.product.basePrice * i.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const discountPct = get().discountPercentage;
        return (subtotal * discountPct) / 100;
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (get().couponCode === "FREESHIP" || subtotal >= 500000) return 0;
        return 30000;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },
    }),
    {
      name: "aura-cart-storage",
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        wishlistProducts: state.wishlistProducts,
        couponCode: state.couponCode,
        discountPercentage: state.discountPercentage,
      }),
    }
  )
);
