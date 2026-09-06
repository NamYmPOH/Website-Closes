export interface ProductVariantData {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

export interface ProductDetailData {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  variants: ProductVariantData[];
  averageRating: number;
  reviewCount: number;
  badges?: {
    isNew?: boolean;
    isOutOfStock?: boolean;
    discountPercent?: number;
  };
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
  }>;
}

export const ALL_PRODUCTS: ProductDetailData[] = [
  {
    id: "prod-1",
    title: "Áo Thun Heavyweight Organic Cotton",
    slug: "ao-thun-heavyweight-organic-cotton",
    brand: "AURA Essentials",
    category: "Áo Thun",
    categorySlug: "ao-thun",
    basePrice: 420000,
    compareAtPrice: 550000,
    primaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    ],
    description:
      "Chiếc áo thun hoàn hảo cho tủ đồ tối giản. Dệt từ 100% sợi bông hữu cơ định lượng 260gsm dày dặn, không bai dão sau hàng chục lần giặt. Form dáng rủ nhẹ tự nhiên tôn dáng người mặc.",
    specifications: {
      "Chất liệu": "100% Organic Cotton (260 GSM)",
      "Form dáng": "Relaxed Boxy Fit",
      "Cổ áo": "Bo dệt kim mật độ cao chống giãn",
      "Xuất xứ": "Việt Nam (Chuẩn xuất khẩu Nhật)",
      "Bảo quản": "Giặt máy chế độ nhẹ, không sấy nhiệt độ cao",
    },
    variants: [
      { id: "v1-1", sku: "AT-BLK-M", color: "Đen Tuyền", size: "M", price: 420000, compareAtPrice: 550000, stock: 15 },
      { id: "v1-2", sku: "AT-BLK-L", color: "Đen Tuyền", size: "L", price: 420000, compareAtPrice: 550000, stock: 24 },
      { id: "v1-3", sku: "AT-WHT-M", color: "Trắng Ngà", size: "M", price: 420000, compareAtPrice: 550000, stock: 18 },
      { id: "v1-4", sku: "AT-WHT-L", color: "Trắng Ngà", size: "L", price: 420000, compareAtPrice: 550000, stock: 8 },
    ],
    averageRating: 4.9,
    reviewCount: 142,
    badges: { isNew: true, discountPercent: 24 },
    reviews: [
      {
        id: "r1",
        userName: "Hoàng Long",
        rating: 5,
        date: "02/09/2026",
        comment: "Vải dày dặn, đứng form chuẩn phong cách minimalism. Mặc đi làm hay đi cà phê đều đẹp!",
        verified: true,
      },
      {
        id: "r2",
        userName: "Minh Trang",
        rating: 5,
        date: "28/08/2026",
        comment: "Mua tặng bạn trai áo màu trắng ngà, bạn ấy khen vải mát và đường may kỹ lắm.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-2",
    title: "Quần Linen Relaxed Trousers",
    slug: "quan-linen-relaxed-trousers",
    brand: "AURA Tailored",
    category: "Quần",
    categorySlug: "quan",
    basePrice: 790000,
    compareAtPrice: null,
    primaryImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80",
    ],
    description:
      "Chất liệu sợi đay Linen Pháp mềm mại và thoáng khí tuyệt đối. Thiết kế lưng chun ẩn tinh tế mang lại cảm giác thoải mái cả ngày dài mà vẫn giữ nguyên nét lịch lãm.",
    specifications: {
      "Chất liệu": "100% French Linen tự nhiên",
      "Khóa kéo": "Khóa đồng YKK cao cấp",
      "Túi quần": "2 túi xéo trước, 2 túi mổ sau",
      "Xuất xứ": "Việt Nam",
      "Đặc tính": "Thấm hút mồ hôi, kháng khuẩn tự nhiên",
    },
    variants: [
      { id: "v2-1", sku: "QL-BEI-S", color: "Be Tự Nhiên", size: "S", price: 790000, stock: 10 },
      { id: "v2-2", sku: "QL-BEI-M", color: "Be Tự Nhiên", size: "M", price: 790000, stock: 15 },
      { id: "v2-3", sku: "QL-BEI-L", color: "Be Tự Nhiên", size: "L", price: 790000, stock: 7 },
      { id: "v2-4", sku: "QL-OLV-M", color: "Xanh Olive", size: "M", price: 790000, stock: 12 },
    ],
    averageRating: 4.8,
    reviewCount: 94,
    badges: { isNew: true },
    reviews: [
      {
        id: "r3",
        userName: "Văn Đức",
        rating: 5,
        date: "24/08/2026",
        comment: "Quần mặc nhẹ và mát rượi trong mùa hè. Form ống suông vừa vặn rất tôn chân.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-3",
    title: "Túi Tote Canvas Nhật Bản Tối Giản",
    slug: "tui-tote-canvas-nhat-ban",
    brand: "AURA Objects",
    category: "Phụ kiện",
    categorySlug: "phu-kien",
    basePrice: 350000,
    compareAtPrice: 450000,
    primaryImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ],
    description:
      "Túi Tote vải Canvas dệt đôi 16oz dày dặn, chịu tải trọng tới 15kg. Thiết kế tối giản với quai xách gia cố và ngăn phụ chống trộm bên trong, đựng vừa laptop 15.6 inch cùng sách vở tiện lợi.",
    specifications: {
      "Chất liệu": "Canvas dệt đôi 16oz chịu lực",
      "Kích thước": "38cm x 42cm x 10cm",
      "Sức chứa": "Laptop 15.6 inch + Sách vở + Bình nước",
      "Khóa miệng": "Nút bấm nam châm tiện lợi",
      "Màu sắc": "Trắng Kem Tự Nhiên / Đen Than",
    },
    variants: [
      { id: "v3-1", sku: "TT-CRM", color: "Trắng Kem", size: "One Size", price: 350000, compareAtPrice: 450000, stock: 30 },
      { id: "v3-2", sku: "TT-BLK", color: "Đen Than", size: "One Size", price: 350000, compareAtPrice: 450000, stock: 25 },
    ],
    averageRating: 5.0,
    reviewCount: 68,
    badges: { discountPercent: 22 },
    reviews: [
      {
        id: "r4",
        userName: "Thanh Hằng",
        rating: 5,
        date: "01/09/2026",
        comment: "Túi canvas dày dặn cực kỳ, đường chỉ may khít và chắc chắn. Đựng máy tính đi làm mỗi ngày rất ưng ý!",
        verified: true,
      },
      {
        id: "r5",
        userName: "Khánh Linh",
        rating: 5,
        date: "20/08/2026",
        comment: "Màu kem vintage mộc mạc đúng gu mình thích, giao hàng siêu nhanh chỉ 1 ngày là nhận được.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-4",
    title: "Áo Sơ Mi Poplin Dáng Rộng Tối Giản",
    slug: "ao-so-mi-poplin-oversized",
    brand: "AURA Tailored",
    category: "Áo",
    categorySlug: "so-mi",
    basePrice: 650000,
    compareAtPrice: 850000,
    primaryImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
    ],
    description:
      "Áo sơ mi Poplin cotton cao cấp với bề mặt láng mịn, ít nhăn. Đường cắt rộng thoải mái (Oversized) lấy cảm hứng từ phong cách kiến trúc tối giản Bắc Âu.",
    specifications: {
      "Chất liệu": "100% Poplin Cotton sợi siêu mảnh",
      "Form dáng": "Modern Oversized Silhouette",
      "Cổ áo": "Classic Spread Collar sắc sảo",
      "Hàng cúc": "Cúc xà cừ tự nhiên chạm khắc tinh tế",
    },
    variants: [
      { id: "v4-1", sku: "SM-BLU-M", color: "Xanh Baby", size: "M", price: 650000, compareAtPrice: 850000, stock: 14 },
      { id: "v4-2", sku: "SM-BLU-L", color: "Xanh Baby", size: "L", price: 650000, compareAtPrice: 850000, stock: 20 },
      { id: "v4-3", sku: "SM-WHT-M", color: "Trắng Tinh", size: "M", price: 650000, compareAtPrice: 850000, stock: 16 },
    ],
    averageRating: 4.9,
    reviewCount: 88,
    badges: { isNew: true, discountPercent: 23 },
    reviews: [
      {
        id: "r6",
        userName: "Tuấn Kiệt",
        rating: 5,
        date: "29/08/2026",
        comment: "Vải đanh mịn, giặt xong giũ mạnh là phẳng phiu không cần là ủi nhiều.",
        verified: true,
      },
    ],
  },
];

export function getProductBySlug(slug: string): ProductDetailData | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}
