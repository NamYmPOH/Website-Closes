/**
 * Types định nghĩa cho Sản phẩm và Danh mục liên quan trong hệ thống
 * Tuân thủ quy tắc TypeScript Strict (Không sử dụng any)
 */

export interface ProductBadge {
  isNew?: boolean;
  isOutOfStock?: boolean;
  discountPercent?: number;
}

export interface BrandItem {
  id?: string;
  name: string;
  slug?: string;
}

export interface CategoryItem {
  id?: string;
  name: string;
  slug?: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  color?: string;
  size?: string;
  stock?: number;
  stockQuantity?: number;
  reservedQuantity?: number;
  reorderThreshold?: number;
  price?: number;
  compareAtPrice?: number | null;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  date?: string;
  verified?: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage: string;
  images?: string[];
  description?: string;
  category?: CategoryItem | string | null;
  categorySlug?: string;
  brand?: BrandItem | string | null;
  badges?: ProductBadge;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  specifications?: Record<string, string>;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  reservedQuantity?: number;
  reorderThreshold?: number;
  relatedProducts?: ProductItem[];
}

export interface SearchSuggestItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage: string;
  categoryName?: string;
  brandName?: string;
  score?: number;
}

export interface ProductPaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ProductsApiResponse {
  items: ProductItem[];
  pagination: ProductPaginationMeta;
}
